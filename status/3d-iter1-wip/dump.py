#!/usr/bin/env python3
"""Print each hole's real extents (local u, v, y in metres) and builder return value from an assembled test page.
  python dump.py out/test.html            # all holes
  python dump.py out/test.html 10 9       # some holes
Flags a hole whose meshes stick out of its declared L x W box by more than 35 mm (a rail drawn just outside a deck edge is about 31 mm) (props outside the rails that are
declared as extras in the brief are expected; check them against the brief's table).
Known limit: instanced meshes (InstancedMesh: pegs, bulbs, fries, fairy lights) are measured by their base geometry at
the group origin, not at each instance, so a small "below the floor" y reading (holes 5 and 7) comes from them, not
from real geometry. Uses Chromium with --headless=new (works on Linux for --dump-dom; shot.py needs the headless shell)."""
import html, json, os, pathlib, re, subprocess, sys, tempfile
_WIN_CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
_LINUX_CHROME = "/opt/pw-browsers/chromium"
CHROME = os.environ.get("CHROME") or (_LINUX_CHROME if os.path.exists(_LINUX_CHROME) else _WIN_CHROME)
# Linux containers run as root: Chrome needs --no-sandbox there. Windows keeps its sandbox.
CHROME_EXTRA = ["--no-sandbox"] if sys.platform.startswith("linux") else []
page = sys.argv[1]; only = set(sys.argv[2:])
url = pathlib.Path(os.path.abspath(page)).as_uri() + "?dump=1&ui=0"
prof = tempfile.mkdtemp(prefix="chr-")
r = subprocess.run([CHROME, *CHROME_EXTRA, "--headless=new", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist",
                    f"--user-data-dir={prof}", "--virtual-time-budget=20000", "--window-size=1200,800", "--dump-dom", url],
                   capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=180)
m = re.search(r'<pre id="dump">(.*?)</pre>', r.stdout, re.S)
if not m:
    print("no dump found: the page probably threw before the hook ran. stderr tail:", r.stderr[-3000:]); sys.exit(1)
d = json.loads(html.unescape(m.group(1)))
for k in sorted(d, key=lambda x: -int(x)):
    if only and k not in only: continue
    e = d[k]; L, W = e["L"], e["W"]
    over = []
    if e["u"][0] < -L/2 - 0.035 or e["u"][1] > L/2 + 0.035: over.append("u")
    if e["v"][0] < -W/2 - 0.035 or e["v"][1] > W/2 + 0.035: over.append("v")
    b = dict(e.get("build") or {}); b.pop("outlines", None)
    print(f"hole {k}: L x W {L} x {W} | u {e['u']} v {e['v']} y {e['y']}" + (f"  OUTSIDE BOX in {','.join(over)}" if over else ""))
    print("   build:", json.dumps(b)[:600])
