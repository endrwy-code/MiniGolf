#!/usr/bin/env python3
"""One-page lane-size sheet to attach to supplier messages (English and Chinese).

Reads the ten lane rectangles (L x W) from tools/make_layout_nyc.py so the sheet
always matches layout v3, and draws them to scale. It deliberately shows nothing
about the venue or the organiser: no floor plan, no names, no address. Send this
instead of the carpenter's pack, which includes the auditorium plan (Internal data).

    python3 tools/make_supplier_lane_sheet.py            # writes docs/17-lane-sizes-for-suppliers.png
"""
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "make_layout_nyc.py")
OUT = os.path.join(ROOT, "docs", "17-lane-sizes-for-suppliers.png")
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"  # has Latin and Chinese glyphs

# Surface per lane, as asked for in the messages (docs/17-how-to-contact-suppliers.md).
SURFACE = {
    7: ("Charcoal turf", "炭灰色草皮", "#3d3d3d"),
    5: ("Light grey turf", "浅灰色草皮", "#c9c9c9"),
    2: ("Green turf + printed clock face (if possible)", "绿色草皮＋印钟面（如可以）", "#3f9142"),
}
GREEN = ("Green putting turf", "绿色果岭草", "#3f9142")


def lanes():
    src = open(SRC, encoding="utf-8").read()
    found = re.findall(r"dict\(n=(\d+),.*?\bL=([\d.]+), W=([\d.]+)", src, re.S)
    out = {int(n): (float(l), float(w)) for n, l, w in found}
    if sorted(out) != list(range(1, 11)):
        sys.exit(f"expected lanes 1-10 in {SRC}, found {sorted(out)}")
    return out


def main():
    data = lanes()
    total = sum(l * w for l, w in data.values())
    f = lambda s: ImageFont.truetype(FONT, s)
    title, h2, body, small = f(46), f(30), f(27), f(23)

    S = 80                     # pixels per metre
    W_IMG, H_IMG = 2100, 1800
    img = Image.new("RGB", (W_IMG, H_IMG), "white")
    d = ImageDraw.Draw(img)

    d.text((60, 40), "10 putting lanes: sizes   ·   10条推杆球道尺寸", font=title, fill="black")
    d.text((60, 110), f"Length × width in metres, drawn to scale. Outer rectangle of each lane; {total:.1f} m² in total.",
           font=body, fill="#222")
    d.text((60, 150), f"长 × 宽（米），按比例绘制。每条球道的外框矩形，合计 {total:.1f} 平方米。", font=body, fill="#222")

    cols = [(60, [1, 2, 3, 4, 5]), (1080, [6, 7, 8, 9, 10])]
    y0, gap, bottom = 230, 62, 0
    for x0, nums in cols:
        y = y0
        for n in nums:
            L, Wd = data[n]
            en, zh, colour = SURFACE.get(n, GREEN)
            x1, y1 = x0 + L * S, y + Wd * S
            d.rectangle([x0, y, x1, y1], fill=colour, outline="black", width=3)
            if n == 2:  # clock face hint
                cx, cy, r = (x0 + x1) / 2, (y + y1) / 2, Wd * S * 0.36
                d.ellipse([cx - r, cy - r, cx + r, cy + r], outline="white", width=4)
                d.line([cx, cy, cx, cy - r * 0.8], fill="white", width=4)
                d.line([cx, cy, cx - r * 0.12, cy - r * 0.55], fill="white", width=4)
            tc = "white" if colour != "#c9c9c9" else "black"
            d.text((x0 + 14, y + 8), f"{n}", font=h2, fill=tc)
            tx = x1 + 22
            d.text((tx, y + 2), f"Lane {n}  ·  第{n}道", font=h2, fill="black")
            d.text((tx, y + 42), f"{L:.1f} × {Wd:.1f} m", font=h2, fill="black")
            if Wd * S >= 120:
                d.text((tx, y + 82), en, font=small, fill="#333")
                d.text((tx, y + 110), zh, font=small, fill="#333")
            else:
                d.text((tx, y + 82), f"{en}  ·  {zh}", font=small, fill="#333")
            y = max(y1, y + 120) + gap
        bottom = max(bottom, y)

    # scale bar
    sy = bottom - 20
    d.line([60, sy, 60 + 2 * S, sy], fill="black", width=4)
    for k in range(3):
        d.line([60 + k * S, sy - 10, 60 + k * S, sy + 10], fill="black", width=3)
    d.text((60 + 2 * S + 16, sy - 16), "2 m  ·  2米", font=small, fill="black")

    notes = [
        ("Rigid parts in sections no longer than 2.4 m that join together (turf can be one piece per lane).",
         "硬质部件分段，每段不超过2.4米，可拼接（草皮每条球道可为整块）。"),
        ("For a smooth indoor floor; nothing is fixed to the floor. 10 cups and 10 flags.",
         "铺在室内光滑地面上，不固定在地面上。另配10个球洞杯和10支旗杆。"),
        ("Needed in Singapore by 10 December 2026. For quotation only.",
         "2026年12月10日前送到新加坡。仅供报价。"),
    ]
    y = sy + 50
    for en, zh in notes:
        d.text((60, y), "-  " + en, font=small, fill="#222")
        d.text((92, y + 30), zh, font=small, fill="#222")
        y += 76

    img = img.crop((0, 0, W_IMG, y + 30))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.save(OUT, optimize=True)
    print(f"wrote {os.path.relpath(OUT, ROOT)}  ({total:.1f} m² across 10 lanes)")


if __name__ == "__main__":
    main()
