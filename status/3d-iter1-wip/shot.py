#!/usr/bin/env python3
"""Screenshot an assembled test page with headless Chrome (WebGL through SwiftShader).

  python shot.py --page out/test.html --q "hole=10&cam=close&iso=1&ui=0&light=house" --out out/h10.png
  python shot.py --page out/test.html --sheet "hole=10&cam=close;hole=10&cam=top;hole=10&cam=side;hole=10&cam=tee" --out out/h10-sheet.png

--sheet takes queries separated by ';' and tiles them 2 across into one image (each tile labelled), so one
image read shows four views. ui=0 is added to every query unless the query already sets ui.
Defaults: 1280 x 800 per shot, 22 s of virtual time (SwiftShader is slow; raise --budget if a shot is blank).
"""
import argparse
import glob
import os
import pathlib
import subprocess
import sys
import tempfile

_WIN_CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
_LINUX_CHROME = "/opt/pw-browsers/chromium"
# On Linux, Chromium's --headless=new --screenshot returns blank WebGL tiles; chrome-headless-shell (no headless flag) works.
_LINUX_SHELLS = sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell"))
CHROME = os.environ.get("CHROME") or next((p for p in [*_LINUX_SHELLS[-1:], _LINUX_CHROME] if os.path.exists(p)), _WIN_CHROME)
HEADLESS = [] if "headless-shell" in os.path.basename(CHROME) else ["--headless=new"]
# Linux containers run as root: Chrome needs --no-sandbox there. Windows keeps its sandbox.
CHROME_EXTRA = ["--no-sandbox"] if sys.platform.startswith("linux") else []


def shoot(page, query, out, w, h, budget):
    if "ui=" not in query:
        query = (query + "&ui=0").lstrip("&")
    url = pathlib.Path(os.path.abspath(page)).as_uri() + "?" + query
    prof = tempfile.mkdtemp(prefix="chr-")
    cmd = [CHROME, *CHROME_EXTRA, *HEADLESS, "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist",
           "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", f"--user-data-dir={prof}",
           f"--window-size={w},{h}", f"--virtual-time-budget={budget}", f"--screenshot={os.path.abspath(out)}", url]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if not os.path.exists(out):
        sys.exit(f"no screenshot for {query}\n{r.stderr[-2000:]}")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--page", required=True)
    ap.add_argument("--q", default="")
    ap.add_argument("--sheet", default="")
    ap.add_argument("--out", required=True)
    ap.add_argument("--w", type=int, default=1280)
    ap.add_argument("--h", type=int, default=800)
    ap.add_argument("--budget", type=int, default=22000)
    a = ap.parse_args()
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    if not a.sheet:
        shoot(a.page, a.q, a.out, a.w, a.h, a.budget)
        print("wrote", a.out)
        return
    from PIL import Image, ImageDraw, ImageFont
    qs = [s.strip() for s in a.sheet.split(";") if s.strip()]
    tiles = []
    for i, q in enumerate(qs):
        p = os.path.join(tempfile.gettempdir(), f"shot-tile-{os.getpid()}-{i}.png")
        shoot(a.page, q, p, a.w, a.h, a.budget)
        im = Image.open(p).convert("RGB")
        d = ImageDraw.Draw(im)
        try:
            f = ImageFont.truetype("arial.ttf", 22)
        except OSError:
            f = ImageFont.load_default()
        d.rectangle([0, 0, a.w, 34], fill=(0, 0, 0))
        d.text((10, 6), q, fill=(255, 255, 255), font=f)
        tiles.append(im)
    cols = 2 if len(tiles) > 1 else 1
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * a.w, rows * a.h), (40, 40, 40))
    for i, im in enumerate(tiles):
        sheet.paste(im, ((i % cols) * a.w, (i // cols) * a.h))
    # keep the sheet under ~2000 px wide so one image read stays cheap
    if sheet.width > 2000:
        k = 2000 / sheet.width
        sheet = sheet.resize((2000, int(sheet.height * k)))
    sheet.save(a.out)
    print("wrote", a.out, sheet.size)


if __name__ == "__main__":
    main()
