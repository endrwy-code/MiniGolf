"""Simplified auditorium plan, version 2, drawn from the v2 geometry file (stdlib only).

Usage:
    python3 tools/make_floorplan.py floorplan/auditorium-dimensions.json floorplan [--png]

Writes auditorium-simplified.svg; --png also renders it to PNG with the pre-installed
Playwright Chromium (node).

Drawn stage-left, like the cable-planning tool: +X from the stage end toward the sound
console, +Z from the top wall (the 11.65 m side) to the bottom wall. Measured values are
drawn solid with black numbers. Anything the JSON marks 'not measured' is drawn dashed in
grey, where the team's sketch shows it, and labelled so nobody builds to it.
"""
import json
import os
import sys

dims = json.load(open(sys.argv[1]))
OUT = sys.argv[2] if len(sys.argv) > 2 else "floorplan"
PNG = "--png" in sys.argv

FONT = "Helvetica, Arial, sans-serif"
INK, MID, GREY, LIGHT = "#2C2C2A", "#444441", "#5F5E5A", "#888780"
GOLF_FILL, GOLF_LINE, GOLF_TEXT = "#E1F5EE", "#0F6E56", "#085041"
OTHER_FILL, OTHER_TEXT = "#F6F1E7", "#6B5428"
STAGE_FILL = "#E4E1D8"
STAND_FILL, STAND_LINE = "#FAC775", "#854F0B"
DASH = 'stroke-dasharray="4 3"'

S = 15.0                      # px per metre
OX, OY = 100.0, 150.0         # room origin on the page

A = dims["auditorium"]
L, D = A["length_x"], A["width_z"]
ST = dims["stage"]
RW = dims["runway"]
GL = dims["golf_limit"]
ZONES = {z["id"]: z for z in dims["zones"]}
GZ, OZ = ZONES["golf_zone"], ZONES["other_activities"]
LF = dims["lf_platform"]
SC = dims["sound_console"]
SIDE = dims["runway_side_items"]

FRONT = ST["front_x"]
RX0, RX1 = RW["x"]
RZ0, RZ1 = RW["z"]
GX = GL["x"]

W = int(OX + L * S + 90)
H = 800


def X(x):
    return OX + x * S


def Z(z):
    return OY + z * S


def fmt(v):
    return f"{v:g}"


els = []


def t(x, y, s, size=12, fill=MID, anchor="start", weight=None, italic=False, rotate=None):
    a = f' font-weight="{weight}"' if weight else ""
    a += ' font-style="italic"' if italic else ""
    a += f' transform="rotate({rotate} {x:.1f} {y:.1f})"' if rotate is not None else ""
    els.append(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}"{a}>{s}</text>')


def rect(x0, z0, x1, z1, fill, stroke, sw=1.0, extra=""):
    els.append(f'<rect x="{X(x0):.1f}" y="{Z(z0):.1f}" width="{(x1 - x0) * S:.1f}" height="{(z1 - z0) * S:.1f}" '
               f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')


def line(x1, y1, x2, y2, stroke=GREY, sw=1.0, extra=""):
    els.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')


def dim_h(x0, x1, y, label, measured=True, label_y=None):
    """Horizontal dimension between page x0 and x1 at page y."""
    col = GREY if measured else LIGHT
    extra = 'marker-start="url(#a)" marker-end="url(#a)"' + ("" if measured else " " + DASH)
    line(x0 + 1, y, x1 - 1, y, col, 1, extra)
    t((x0 + x1) / 2, label_y if label_y else y - 6, label, 12 if measured else 11,
      INK if measured else LIGHT, "middle", italic=not measured)


def dim_v(x, y0, y1, label, side="right", measured=True):
    col = GREY if measured else LIGHT
    extra = 'marker-start="url(#a)" marker-end="url(#a)"' + ("" if measured else " " + DASH)
    line(x, y0 + 1, x, y1 - 1, col, 1, extra)
    if side == "right":
        t(x + 6, (y0 + y1) / 2 + 4, label, 12, INK if measured else LIGHT)
    else:
        t(x - 6, (y0 + y1) / 2 + 4, label, 12, INK if measured else LIGHT, "end")


# ------------------------------------------------------------ header
t(40, 36, "Auditorium, simplified plan · v2", 18, INK, weight="600")
t(40, 58, "From the team's tape measurements on the hand sketch, 18 Nov 2026. Stage on the left, as in the cable-planning tool.", 12, GREY)
t(40, 76, "Black numbers are measured. Grey dashed items and grey numbers are not measured: drawn where the sketch shows them. Don't build to them.", 12, GREY)

# ------------------------------------------------------------ zones
rect(GZ["x"][0], GZ["z"][0], GZ["x"][1], GZ["z"][1], GOLF_FILL, "none", 0)
rect(OZ["x"][0], OZ["z"][0], OZ["x"][1], OZ["z"][1], OTHER_FILL, "none", 0)

# stage (depth not measured) and its curved corners (not measured)
rect(0, 0, FRONT, D, STAGE_FILL, "none", 0)
line(X(FRONT), Z(0), X(FRONT), Z(D), LIGHT, 1, DASH)
for c in ST["corner_curves"]:
    a, b = c["out_from_front"], c["along_front"]
    zw = c["wall_z"]
    zs = 1 if zw == 0 else -1
    p0 = (X(FRONT), Z(zw))
    p1 = (X(FRONT + a), Z(zw))
    p2 = (X(FRONT), Z(zw + zs * b))
    sweep = 1 if zs == 1 else 0
    els.append(f'<path d="M{p0[0]:.1f} {p0[1]:.1f}L{p1[0]:.1f} {p1[1]:.1f}A{a * S:.1f} {b * S:.1f} 0 0 {sweep} {p2[0]:.1f} {p2[1]:.1f}Z" '
               f'fill="{STAGE_FILL}" stroke="{LIGHT}" stroke-width="1" {DASH}/>')
t(X(FRONT / 2), Z(D / 2) - 30, "Stage", 13, INK, "middle", "600")
t(X(FRONT / 2), Z(D / 2) - 14, "depth not", 10, LIGHT, "middle", italic=True)
t(X(FRONT / 2), Z(D / 2) - 2, "measured", 10, LIGHT, "middle", italic=True)
t(X(FRONT + 0.25), Z(4.0) + 13, "curved stage edge", 10, LIGHT, italic=True)
t(X(FRONT + 0.25), Z(D - 2.5) - 6, "curved stage edge", 10, LIGHT, italic=True)

# runway (measured)
rect(RX0, RZ0, RX1, RZ1, STAGE_FILL, GREY, 1)
t((X(RX0) + X(RX1)) / 2, Z((RZ0 + RZ1) / 2) + 4, f"Runway (raised, part of the stage) · {fmt(RW['length'])} × {fmt(RW['width'])} m", 12, INK, "middle")

# stairs and speaker stands, same on both sides (positions not measured)
els.insert(0, '<defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
              f'<path d="M2 1L8 5L2 9" fill="none" stroke="{GREY}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>'
              f'<pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#FFFFFF"/>'
              f'<path d="M0 4L4 0" stroke="{GREY}" stroke-width="0.7"/></pattern></defs>')
for it in SIDE["items"]:
    x0, x1 = RX1 - it["from_tip"][1], RX1 - it["from_tip"][0]
    o = it["out"]
    fill, stroke = (STAND_FILL, STAND_LINE) if it["type"] == "speaker_stand" else ("url(#hatch)", GREY)
    rect(x0, RZ0 - o, x1, RZ0, fill, stroke, 1, DASH)
    rect(x0, RZ1, x1, RZ1 + o, fill, stroke, 1, DASH)
stands = [i for i in SIDE["items"] if i["type"] == "speaker_stand"]
stairs = [i for i in SIDE["items"] if i["type"] == "stairs"][0]
sx = (RX1 - stands[1]["from_tip"][1] + RX1 - stands[0]["from_tip"][0]) / 2
t(X(sx), Z(RZ0 - 0.515) - 7, "Speaker stands · stick out 51.5 cm", 11, STAND_LINE, "middle")
t(X(RX1 - (stairs["from_tip"][0] + stairs["from_tip"][1]) / 2), Z(RZ0 - 0.515) - 7, "Stairs", 11, MID, "middle")
t(X(sx), Z(RZ1 + 0.515) + 15, "positions, lengths and stair depth not measured", 10, LIGHT, "middle", italic=True)

# LF platform (depth and z measured; length and x not measured)
lx0, lx1 = LF["x"]
lz0, lz1 = LF["z"]
els.append(f'<rect x="{X(lx0):.1f}" y="{Z(lz0):.1f}" width="{(lx1 - lx0) * S:.1f}" height="{(lz1 - lz0) * S:.1f}" fill="#D9D5EC" stroke="none"/>')
line(X(lx0), Z(lz0), X(lx1), Z(lz0), "#534AB7", 1)
line(X(lx1), Z(lz0), X(lx1), Z(lz1), "#534AB7", 1, DASH)
t(X(lx0) + 16, Z(lz0) - 6, "LF platform · length not measured", 11, "#3C3489")
t(X(lx1) + 6, Z((lz0 + lz1) / 2) + 4, f"{fmt(LF['depth'])} m", 12, INK)

# sound console (not measured)
cx0, cx1 = SC["x"]
cz0, cz1 = SC["z"]
rect(cx0, cz0, cx1, cz1, "#FFFFFF", LIGHT, 1, DASH)
cxm = (X(cx0) + X(cx1)) / 2
t(cxm, Z((cz0 + cz1) / 2) - 14, "Sound", 12, INK, "middle", "600")
t(cxm, Z((cz0 + cz1) / 2) + 1, "console", 12, INK, "middle", "600")
t(cxm, Z((cz0 + cz1) / 2) + 18, "size not", 10, LIGHT, "middle", italic=True)
t(cxm, Z((cz0 + cz1) / 2) + 30, "measured", 10, LIGHT, "middle", italic=True)

# zone labels and areas (derived)
ar = GZ["areas_m2"]
gx_mid = (X(FRONT + 2.6) + X(RX1)) / 2
t(gx_mid, Z(3.6), "Mini golf zone", 16, GOLF_TEXT, "middle", "600")
t(gx_mid, Z(3.6) + 18, f"≈ {ar['beside_runway_top']:.0f} m² beside the runway", 12, GOLF_LINE, "middle")
t(gx_mid, Z(20.4), "Mini golf zone", 16, GOLF_TEXT, "middle", "600")
t(gx_mid, Z(20.4) + 18, f"≈ {ar['beside_runway_bottom']:.0f} m² beside the runway", 12, GOLF_LINE, "middle")
t((X(RX1) + X(GX)) / 2 + 4, Z(5.8), f"≈ {ar['beyond_runway_tip']:.0f} m² past the tip", 12, GOLF_LINE, "middle", rotate=-90)
ox_mid = (X(GX) + X(cx0)) / 2 + 20
t(ox_mid, Z(6.0), "Other activities", 16, OTHER_TEXT, "middle", "600")
t(ox_mid, Z(6.0) + 18, "beyond the golf limit", 12, OTHER_TEXT, "middle")

# golf limit line (decided 18 Nov)
line(X(GX), Z(0) - 14, X(GX), Z(D), GOLF_LINE, 2.5, 'stroke-dasharray="8 4"')
t(X(GX), Z(0) - 20, "Golf limit · decided 18 Nov", 12, GOLF_TEXT, "middle", "600")

# room outline and back-wall doors (not measured)
els.append(f'<rect x="{X(0):.1f}" y="{Z(0):.1f}" width="{L * S:.1f}" height="{D * S:.1f}" fill="none" stroke="{INK}" stroke-width="2"/>')
for d in dims["doors"]:
    z0, z1 = d["z"]
    line(X(L), Z(z0), X(L), Z(z1), "#FFFFFF", 4)
    w = (z1 - z0) * S
    els.append(f'<path d="M{X(L):.1f} {Z(z0):.1f}L{X(L) - w:.1f} {Z(z0):.1f}A{w:.1f} {w:.1f} 0 0 1 {X(L):.1f} {Z(z1):.1f}" '
               f'fill="none" stroke="{LIGHT}" stroke-width="1" {DASH}/>')
    t(X(L) + 6, Z((z0 + z1) / 2) - 2, "Door /", 11, MID)
    t(X(L) + 6, Z((z0 + z1) / 2) + 11, "exit", 11, MID)

# ------------------------------------------------------------ dimensions
# across (Z), on the golf limit, as on the sketch: all measured
cx = X(GX) + 9
dim_v(cx, Z(0), Z(RZ0), f"{fmt(RZ0)} m")
dim_v(cx, Z(RZ0), Z(RZ1), f"{fmt(RW['width'])} m")
dim_v(cx, Z(RZ1), Z(lz0), f"{fmt(round(lz0 - RZ1, 2))} m")
line(cx, Z(lz0), cx, Z(lz1), GREY, 1, 'marker-start="url(#a)" marker-end="url(#a)"')
line(X(RX1), Z(RZ0), cx + 3, Z(RZ0), LIGHT, 0.5, 'stroke-dasharray="2 2"')
line(X(RX1), Z(RZ1), cx + 3, Z(RZ1), LIGHT, 0.5, 'stroke-dasharray="2 2"')

# room width (measured, rough) and length (not re-measured)
dim_v(OX - 22, Z(0), Z(D), "", "left")
t(OX - 30, Z(D / 2) - 2, f"{fmt(D)} m", 12, INK, "end")
t(OX - 30, Z(D / 2) + 12, "(rough)", 11, GREY, "end")
dim_h(X(0), X(L), 108, f"{fmt(L)} m · from the old cable plan, not re-measured (team: unchanged)", measured=False)

# along (X), below the room
y1, y2 = Z(D) + 30, Z(D) + 62
for xv in (0, FRONT, RX1, GX, L):
    line(X(xv), Z(D) + 4, X(xv), y2 + 6 if xv in (FRONT, GX) else y1 + 6, LIGHT, 0.5, 'stroke-dasharray="2 2"')
dim_h(X(0), X(FRONT), y1, "not measured", measured=False)
dim_h(X(FRONT), X(RX1), y1, f"{fmt(RW['length'])} m · stage front → runway tip")
dim_h(X(RX1), X(GX), y1, f"{fmt(GL['past_runway_tip'])} m*")
dim_h(X(GX), X(L), y1, "golf limit → back wall: not measured", measured=False)
dim_h(X(FRONT), X(GX), y2, f"{fmt(GL['from_stage_front'])} m · stage front → golf limit")

# ------------------------------------------------------------ legend and notes
ly = Z(D) + 104
items = [
    ("rect", GOLF_FILL, GOLF_LINE, "Mini golf zone (team, 18 Nov)"),
    ("rect", OTHER_FILL, OTHER_TEXT, "Other activities"),
    ("rect", STAGE_FILL, GREY, "Stage and runway (raised)"),
    ("rect", STAND_FILL, STAND_LINE, "Speaker stand"),
    ("rect", "url(#hatch)", GREY, "Stairs"),
]
x = 40.0
for kind, fill, stroke, label in items:
    els.append(f'<rect x="{x:.1f}" y="{ly - 11:.1f}" width="14" height="14" rx="2" fill="{fill}" stroke="{stroke}" stroke-width="0.8"/>')
    t(x + 20, ly, label, 12, MID)
    x += 20 + len(label) * 6.4 + 22
ly2 = ly + 24
line(40, ly2 - 4, 62, ly2 - 4, LIGHT, 1.2, DASH)
t(68, ly2, "Not measured: drawn where the sketch shows it", 12, MID)
line(370, ly2 - 4, 392, ly2 - 4, GOLF_LINE, 2.5, 'stroke-dasharray="8 4"')
t(398, ly2, f"Golf limit: {fmt(GL['from_stage_front'])} m from the stage front; golf on the stage side", 12, MID)

notes = [
    f"* {fmt(GL['past_runway_tip'])} m = {fmt(GL['from_stage_front'])} − {fmt(RW['length'])} (derived). Areas are derived from measured values, before the stage curves, stairs and speaker stands come off: "
    f"golf zone ≈ {ar['total_less_runway']:.0f} m² after the runway.",
    "Not shown: cable runs and drops, including two circuits over 100% (ND18 at 101%, ND21 at 106%). They still apply, but they were drawn on the old geometry and need re-placing.",
    "Sketch: floorplan/source-sketches/2026-11-18-hand-sketch-tape-measurements.jpg · data: floorplan/auditorium-dimensions.json · redraw: python3 tools/make_floorplan.py",
]
for i, n in enumerate(notes):
    t(40, ly2 + 30 + i * 18, n, 11, GREY)

H = int(ly2 + 30 + len(notes) * 18 + 10)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * 2}" height="{H * 2}" viewBox="0 0 {W} {H}" role="img" font-family="{FONT}">\n'
       f'<title>Auditorium, simplified plan v2</title>\n'
       f'<desc>Auditorium plan from the team\'s tape measurements on 18 Nov 2026: width {fmt(D)} m (rough), runway {fmt(RW["length"])} by {fmt(RW["width"])} m, '
       f'golf limit {fmt(GL["from_stage_front"])} m from the stage front with the mini golf on the stage side, LF platform, sound console, doors, stairs and speaker stands. '
       f'Items not measured are dashed and grey. {fmt(S)} px per metre.</desc>\n'
       f'<rect x="0" y="0" width="{W}" height="{H}" fill="#FFFFFF"/>\n' + "\n".join(els) + "\n</svg>\n")

os.makedirs(OUT, exist_ok=True)
path = os.path.join(OUT, "auditorium-simplified.svg")
open(path, "w").write(svg)
print(f"wrote {path} ({W} x {H})")
print(f"golf zone {GZ['x']} x {GZ['z']}: beside runway {ar['beside_runway_top']} + {ar['beside_runway_bottom']} m², past tip {ar['beyond_runway_tip']} m², total {ar['total_less_runway']} m²")
chk = round(GL["from_stage_front"] * D - RW["length"] * RW["width"], 1)
assert abs(chk - ar["total_less_runway"]) < 0.2, chk
assert abs(RZ0 + RW["width"] + (lz0 - RZ1) + LF["depth"] - D) < 0.01


def render_png(svg_path, png_path):
    import subprocess
    import tempfile
    s = open(svg_path).read().replace(f'width="{W * 2}" height="{H * 2}"', f'width="{W}" height="{H}"', 1)
    with tempfile.TemporaryDirectory() as td:
        html = os.path.join(td, "page.html")
        open(html, "w").write(f'<html><body style="margin:0;background:#fff">{s}</body></html>')
        js = os.path.join(td, "r.js")
        open(js, "w").write(
            "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
            f"const p=await b.newPage({{viewport:{{width:{W},height:{H}}},deviceScaleFactor:2}});"
            f"await p.goto('file://{html}');await p.screenshot({{path:{json.dumps(os.path.abspath(png_path))}}});await b.close();}})();")
        subprocess.run(["node", js], check=True)


if PNG:
    render_png(path, path[:-4] + ".png")
    print("PNG written")
