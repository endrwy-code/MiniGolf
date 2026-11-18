#!/usr/bin/env python3
"""Carpenter's drawing pack for route C: the ten New York holes, laid on the floor.

    python3 tools/make_carpenter_pack.py          # writes carpenter-pack/carpenter-pack.html
    python3 tools/make_carpenter_pack.py --pdf    # also prints carpenter-pack/countdown-golf-carpenter-pack.pdf

A3 landscape sheets: cover and general notes, site plan, standard details, one sheet per hole,
the Tee Booth and skyline flats, and a materials list worked out from the drawings.

All model dimensions are millimetres. Plans: x runs along the lane from the outer face of the
tee-end rail; y runs across the lane from its centreline (positive y is drawn downward, so each
hole sheet is the site plan rotated, never mirrored). Elevations: z is up from the floor.

This is design intent for quoting and the prototype (see docs/11-route-c-carpenter-build.md and
docs/12-carpenter-pack.md), not engineered drawings. The script checks the playing rule that every
gap between an obstacle and anything else is either closed or at least 250 mm, and fails if not.
"""
import html as H
import json
import math
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "carpenter-pack")
DATE = "18 Nov 2026"
REV = "A"
FONT = "'Liberation Sans', Arial, Helvetica, sans-serif"

# ------------------------------------------------------------------ build standard (mm)
RAIL_T = 45        # rail thickness (45 x 95 timber on edge)
RAIL_H = 95        # rail height
GREEN_H = 57       # raised green: 45 mm batten frame + 12 mm plywood
SURF = 10          # carpet grass / needle-punch
BEVEL = 300        # 1:5 ramp up to a raised green
GAP_MIN = 250      # a gap is either closed or at least this wide
PLATE_EVERY = 1200 # hidden plates under floor-level rails

# print colours (light, so pencil mark-ups still show)
C = dict(rail="#5B5B5B", green="#D3EBCB", charcoal="#C3C5C9", grey="#DEDEDE", blue="#C4DDF3", white="#FFFFFF",
         red="#F3C4C4", timber="#F2DDB6", prop="#F7F1E3", ink="#1D1D1B", soft="#6B6B66", dim="#1F4E8C", cup="#FFFFFF")


# ------------------------------------------------------------------ geometry
def area(P):
    return sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P))) / 2


def offset(P, d):
    """Offset a simple polygon inward by d (mitred corners)."""
    s = 1 if area(P) > 0 else -1
    n = len(P)
    lines = []
    for i in range(n):
        (x1, y1), (x2, y2) = P[i], P[(i + 1) % n]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        nx, ny = -dy / L * s, dx / L * s
        lines.append(((x1 + nx * d, y1 + ny * d), (dx, dy)))
    out = []
    for i in range(n):
        (p, r), (q, t2) = lines[i - 1], lines[i]
        den = r[0] * t2[1] - r[1] * t2[0]
        if abs(den) < 1e-9:
            out.append(q)
            continue
        t = ((q[0] - p[0]) * t2[1] - (q[1] - p[1]) * t2[0]) / den
        out.append((p[0] + t * r[0], p[1] + t * r[1]))
    return out


def perimeter(P):
    return sum(math.dist(P[i], P[(i + 1) % len(P)]) for i in range(len(P)))


def clip(P, f):
    out = []
    n = len(P)
    for i in range(n):
        a, b = P[i], P[(i + 1) % n]
        fa, fb = f(a), f(b)
        if fa >= 0:
            out.append(a)
        if (fa >= 0) != (fb >= 0):
            t = fa / (fa - fb)
            out.append((a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])))
    return out


def xband(P, x0, x1):
    return clip(clip(P, lambda p: p[0] - x0), lambda p: x1 - p[0])


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def orect(cx, cy, length, width, ang):
    a = math.radians(ang)
    ux, uy, vx, vy = math.cos(a), math.sin(a), -math.sin(a), math.cos(a)
    l2, w2 = length / 2, width / 2
    return [(cx + sx * l2 * ux + sy * w2 * vx, cy + sx * l2 * uy + sy * w2 * vy) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]


def seg_board(p, q, t, side):
    """A board of thickness t whose face runs p->q; side=+1/-1 picks which side the thickness goes."""
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy)
    nx, ny = -dy / L * side * t, dx / L * side * t
    return [p, q, (q[0] + nx, q[1] + ny), (p[0] + nx, p[1] + ny)]


def circ(cx, cy, r, n=24):
    return [(cx + r * math.cos(2 * math.pi * k / n), cy + r * math.sin(2 * math.pi * k / n)) for k in range(n)]


def hull(pts):
    pts = sorted(set(pts))
    if len(pts) < 3:
        return pts

    def cr(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for p in pts:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0:
            up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]


def pt_seg(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    L2 = dx * dx + dy * dy
    t = 0 if L2 == 0 else max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2))
    return math.dist(p, (a[0] + t * dx, a[1] + t * dy))


def segs_cross(p1, p2, q1, q2):
    def cr(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    d1, d2, d3, d4 = cr(q1, q2, p1), cr(q1, q2, p2), cr(p1, p2, q1), cr(p1, p2, q2)
    return (d1 > 0) != (d2 > 0) and (d3 > 0) != (d4 > 0)


def inside(p, P):
    c = False
    n = len(P)
    for i in range(n):
        a, b = P[i], P[(i + 1) % n]
        if (a[1] > p[1]) != (b[1] > p[1]) and p[0] < a[0] + (p[1] - a[1]) * (b[0] - a[0]) / (b[1] - a[1]):
            c = not c
    return c


def poly_gap(P, Q):
    for i in range(len(P)):
        for j in range(len(Q)):
            if segs_cross(P[i], P[(i + 1) % len(P)], Q[j], Q[(j + 1) % len(Q)]):
                return 0.0
    if inside(P[0], Q) or inside(Q[0], P):
        return 0.0
    d = min(pt_seg(p, Q[j], Q[(j + 1) % len(Q)]) for p in P for j in range(len(Q)))
    return min(d, min(pt_seg(q, P[i], P[(i + 1) % len(P)]) for q in Q for i in range(len(P))))


# ------------------------------------------------------------------ the holes (route C, floor-laid)
def end_green(b0):
    """Raised green from x = b0 + BEVEL to the cup end, full width, with a 1:5 bevel in front."""
    return dict(raised=[("clip_x", b0 + BEVEL)], bevels=[("band", b0, b0 + BEVEL)])


HOLES = [
    dict(n=10, name="Bike Lane", sign="Wheel See You Next Year", cls="Simple", par=2, glow="#3BE36B", days=0.75,
         L=6000, W=1600, outline=rect(0, -800, 6000, 800), surface="green", surface_name="Green carpet grass, painted bike-lane symbols",
         **end_green(4900), cup=(5600, -165), totem=(300, 1250),
         obstacles=[dict(tag="A", pts=rect(x - 20, y - 330, x + 20, y + 330), fill=C["timber"]) for x, y in ((1200, -425), (2050, 425), (2900, 0), (3750, -425), (4600, 425))]
         + [dict(tag="", pts=rect(x + 20, y - 22, x + 65, y + 22), fill=C["timber"]) for x, y in ((1200, -425), (2050, 425), (2900, 0), (3750, -425), (4600, 425))]
         + [dict(tag="B", pts=circ(5450, -480, 13, 12), fill=C["ink"]), dict(tag="", pts=circ(5450, 150, 13, 12), fill=C["ink"])],
         outside=[dict(tag="S", pts=rect(6150, -575, 6250, 575), label="pun sign")],
         xchain=[0, 1200, 2050, 2900, 3750, 4600, 4900, 5200, 5600, 6000],
         key=[("A", "Bike wheel ×5 (free from bike shops), about Ø660, standing across the lane. Centres x 1200 / 2050 / 2900 / 3750 / 4600; y −425 / +425 / 0 / −425 / +425. The outer wheels touch the rail. Axle bolted to a 45 × 45 post (330 tall) behind the wheel; post and cradle screw down through a 6 mm plate under the surface"),
              ("B", "Bike-rack hoop over the approach to the cup: 25 mm conduit bent to an upside-down U, 720 tall, legs at x 5450, y −480 and +150, screwed into the green"),
              ("S", "Pun sign 'Wheel See You Next Year', 1150 × 450 on two posts, behind the end rail (detail D8)"),
              ("T", "Totem (detail D7)")],
         notes=["The wheels are free: ask bike shops for old 26\" or 700c wheels; tyres on. Strip any loose spokes.",
                "Check every wheel is either against the rail or at least 400 mm clear of the next thing (it is, as drawn)."],
         elev="bike"),
    dict(n=9, name="Hot Dog Cart", sign="Relish the Moment", cls="Simple", par=2, glow="#FF6A2B", days=0.5,
         L=4500, W=1400, outline=rect(0, -700, 4500, 700), surface="green", surface_name="Green carpet grass",
         **end_green(3500), cup=(4150, 0), totem=(300, -1150),
         obstacles=[dict(tag="B", pts=seg_board((2100, -655), (3000, -215), 45, 1), fill=C["timber"]),
                    dict(tag="C", pts=rect(3050, 250, 3300, 655), fill=C["timber"]),
                    dict(tag="D", pts=circ(4150, -565, 90, 20), fill=C["timber"]),
                    dict(tag="", pts=circ(4150, 565, 90, 20), fill=C["timber"])],
         overhead=[dict(tag="A", pts=rect(1500, -810, 1518, 810), label="cart front overhead: 200 clear under")],
         outside=[dict(tag="", pts=rect(1500, 700, 1545, 745)), dict(tag="", pts=rect(1500, -745, 1545, -700)),
                  dict(tag="S", pts=rect(4900, -575, 5000, 575), label="pun sign")],
         xchain=[0, 1500, 2100, 3000, 3500, 3800, 4150, 4500],
         key=[("A", "Cart front: 12 mm plywood flat 1620 × 800, spanning the lane like a bridge. Legs outside the rails, screwed to the rails' outer faces. Opening 1310 wide × 200 tall at the bottom, so the ball runs under. Umbrella pole clamped to its back from 800 up (a striped beach umbrella)"),
              ("B", "Hot dog bank wall: 1000 of rail timber (45 × 95 on edge), ends rounded, painted as a sausage in a bun. One end touches the rail at x 2100; the free end at x 3000, y −215"),
              ("C", "Fries: offcuts in a box, 250 × 405 footprint, touching the rail (x 3050–3300, y +250 to the rail)"),
              ("D", "Mustard and ketchup bottles: Ø180 cardboard tubes on a timber disc, 600 tall, touching the rails either side of the cup"),
              ("S", "Pun sign 'Relish the Moment' (D8)"), ("T", "Totem (D7)")],
         notes=["Food props are painted by volunteers: deliver them sanded and primed-ready.",
                "The gap under the cart front is the full lane width, so nothing jams."],
         elev="cart"),
    dict(n=8, name="The Big Apple", sign="Take a Bite", cls="Hero", par=3, glow="#FF2E4D", days=1.0,
         L=5500, W=1600, outline=rect(0, -800, 5500, 800), surface="green", surface_name="Green carpet grass",
         **end_green(4000), cup=(5000, 300), totem=(300, -1250),
         obstacles=[dict(tag="A", pts=rect(2700, -755, 2765, -160), fill=C["red"]), dict(tag="", pts=rect(2700, 160, 2765, 755), fill=C["red"]),
                    dict(tag="B", pts=seg_board((1700, -755), (2700, -200), 40, -1), fill=C["timber"]),
                    dict(tag="", pts=seg_board((1700, 755), (2700, 200), 40, 1), fill=C["timber"])],
         outside=[dict(tag="", pts=rect(2700, -930, 2765, -800)), dict(tag="", pts=rect(2700, 800, 2765, 930)),
                  dict(tag="C", pts=rect(2765, 800, 3215, 950), label="brace"), dict(tag="", pts=rect(2765, -950, 3215, -800), label="brace"),
                  dict(tag="S", pts=rect(5680, -625, 5780, 625), label="pun sign")],
         xchain=[0, 1700, 2700, 4000, 4300, 5000, 5500],
         key=[("A", "The apple: a flat cut-out about 1800 wide × 1620 tall, two 6 mm skins on a 45 × 45 frame (about 65 thick, detail D9). Stands across the lane at x 2700; notched 50 × 100 over each rail. The worm hole is an opening 320 wide × 250 tall at floor level on the centreline"),
              ("B", "Leaf boards: 40 × 90 boards on edge from the rail at x 1700 to y ±200 at the apple. They funnel a good putt to the hole and send a miss back"),
              ("C", "Braces: one triangular brace each side, outside the rails, about 450 × 150 at the base, with a sandbag"),
              ("S", "Pun sign 'Take a Bite' (D8)"), ("T", "Totem (D7)")],
         notes=["The pocket between each leaf board and the rail is closed at both ends, so no ball can get in.",
                "The worm (with a watch at 11:59) is painted on the back face."],
         elev="apple"),
    dict(n=7, name="Gridlock", sign="Don't Honk. Just Putt.", cls="Mid", par=3, glow="#FFE21A", days=0.5,
         L=5000, W=1800, outline=rect(0, -900, 5000, 900), surface="charcoal", surface_name="Charcoal needle-punch carpet (asphalt), painted yellow lines; zebra crossing painted on the bevel",
         **end_green(4000), cup=(4600, 0), totem=(300, -1350),
         obstacles=[dict(tag="A" if i == 0 else "", pts=orect(x, y, 360, 170, -r), fill="#F7E08A") for i, (x, y, r) in enumerate(
             ((1000, -400, 20), (1000, 400, -25), (1650, 0, 75), (2300, -420, -12), (2300, 420, 28), (2950, 0, -62), (3600, -400, 14), (3600, 400, -30)))]
         + [dict(tag="B", pts=rect(1640, 695, 1800, 855), fill="#F6B183"), dict(tag="", pts=rect(3170, -855, 3330, -695), fill="#F6B183")],
         outside=[dict(tag="S", pts=rect(5000, 500, 5300, 800), label="sign pole")],
         xchain=[0, 1000, 1650, 2300, 2950, 3600, 4000, 4300, 4600, 5000],
         key=[("A", "Cabs ×8: solid blocks 360 × 170 × 140 (laminated offcuts or a 150 × 150 post), rounded edges. Centre (x, y, turn): (1000, −400, 20°) (1000, +400, −25°) (1650, 0, 75°) (2300, −420, −12°) (2300, +420, 28°) (2950, 0, −62°) (3600, −400, 14°) (3600, +400, −30°). Screwed from below through a 6 mm plate under the carpet"),
              ("B", "Traffic cones ×2 (about 230 tall, 160 base), touching the rail, screwed through the base to a plate"),
              ("S", "'Don't Honk. Just Putt.' street sign on a pole with a sandbagged base, outside the end rail"), ("T", "Totem (D7)")],
         notes=["Cab angles are measured from the lane direction, turning toward +y (drawn downward).",
                "The script checks every gap: each is closed or at least 250 mm."],
         elev="cab"),
    dict(n=6, name="Liberty Island", sign="Lift Your Lamp", cls="Hero", par=3, glow="#2EE6B8", days=1.0,
         L=5000, W=2400, outline=[(0, -500), (1000, -500), (1000, -1200), (5000, -1200), (5000, 1200), (1000, 1200), (1000, 500), (0, 500)],
         surface="green", surface_name="Green carpet grass on the tee area, gangway and island; blue needle-punch harbour",
         zones=[("blue", ("band", 1000, 3000), "HARBOUR (floor level)")],
         raised=[("rect", rect(1300, -300, 3300, 300)), ("clip_x", 3300)],
         bevels=[("rect", rect(1000, -300, 1300, 300)), ("rect", rect(3000, -1155, 3300, -300)), ("rect", rect(3000, 300, 3300, 1155))],
         cup=(4050, 150), totem=(300, -950),
         obstacles=[dict(tag="A", pts=rect(1500, 1005, 1860, 1155), fill="#F6B183")], plan_tags=[("G", (1650, 0)), ("I", (4300, -700))],
         outside=[dict(tag="B", pts=rect(5025, -275, 5575, 275), label="torch base")],
         xchain=[0, 1000, 1300, 3000, 3300, 4050, 5000],
         key=[("G", "Gangway: a raised strip 600 wide (y ±300), +65, from x 1300 to the island, with a 1:5 bevel from the tee area (x 1000–1300). Its sides are square drops into the harbour"),
              ("I", "Island: a raised green from x 3300 to the end rail, full width, with a 1:5 bevel facing the harbour. A missed ball stays in the harbour and is putted back up the bevel: no marshal needed"),
              ("A", "Ferry: a 360 × 150 block painted orange, against the rail in the harbour"),
              ("B", "Torch: 12 mm cut-out 2000 tall on a 550 × 550 × 600 weighted pedestal box behind the island, outside the rails (D6)"),
              ("T", "Totem (D7)")],
         notes=["The pun sign 'Lift Your Lamp' goes on the pedestal front.",
                "Liberty's tablet reads XI:LIX (painted): part of the 'find the 11:59' game."],
         elev="torch"),
    dict(n=5, name="The Subway", sign="Stand Clear of the Closing Doors", cls="Mid", par=3, glow="#2F80FF", days=0.75,
         L=5500, W=2400, outline=[(0, -500), (1800, -500), (1800, -1200), (5500, -1200), (5500, 1200), (1800, 1200), (1800, 500), (0, 500)],
         surface="grey", surface_name="Grey needle-punch (platform), painted yellow edge strip", **end_green(4300), cup=(4950, 0), totem=(300, -950),
         obstacles=[dict(tag="A" if i == 0 else "", pts=rect(2400, y0, 2463, y1), fill=C["white"]) for i, (y0, y1) in enumerate(((-1155, -800), (-500, -150), (150, 500), (800, 1155)))]
         + [dict(tag="B", pts=rect(2463, 307.5, 3300, 352.5), fill=C["timber"]), dict(tag="", pts=rect(2463, -352.5, 3300, -307.5), fill=C["timber"])],
         outside=[dict(tag="C", pts=rect(5600, -1150, 5700, 1150), label="car front")],
         xchain=[0, 1800, 2400, 3300, 4300, 4600, 4950, 5500],
         key=[("A", "Tile wall: 18 mm plywood on edge across the lane at x 2400, 2310 long × 620 tall, with a 45 × 45 cleat along the back foot. Three arched openings 300 wide × 250 tall, centred at y −650, 0, +650. Painted white tile with grout lines; three coloured circles above (no real line letters or logos)"),
              ("B", "Channel walls: rail timber on edge, x 2463–3300, at y ±330. The middle opening (the express) runs straight on toward the cup; the two locals come out wider"),
              ("C", "Subway-car front: two 6 mm sheets on a 45 × 45 frame, 2300 wide × 2400 tall, outside the end rail, braced and sandbagged (D6, D9). The pun sign goes on it"),
              ("T", "Totem (D7)")],
         notes=["The openings are plain arches in a single wall, so there's nothing for a ball to stop inside.",
                "Brace the wall to the rails at each end and to the channel walls."],
         elev="subway"),
    dict(n=4, name="Broadway", sign="The Show Must Go On", cls="Mid", par=3, glow="#9B5CFF", days=0.75,
         L=6000, W=1200, outline=rect(0, -600, 6000, 600), surface="green", surface_name="Green carpet grass (the stage can be brown needle-punch if it rolls the same)",
         **end_green(4000), cup=(5300, 0), totem=(300, -1050),
         obstacles=[],
         overhead=[dict(tag="A", pts=rect(3900, -645, 3918, 645), label="curtain")],
         outside=[dict(tag="", pts=rect(3900, 600, 3945, 645)), dict(tag="", pts=rect(3900, -645, 3945, -600))],
         xchain=[0, 3900, 4000, 4300, 5300, 6000],
         key=[("A", "Proscenium: a 9 mm flat 2000 wide × 1800 tall on a 45 × 45 frame, across the lane at x 3900, legs just outside the rails, braced. Opening 1200 wide × 900 tall (the rails pass through). A curtain of red felt strips, 100 wide, hangs in the opening to 10 above the surface: a firm putt pushes through"),
              ("M", "Marquee header 2000 × 500 at the top of the flat, with festoon bulbs (battery or 24 V) and the pun sign 'The Show Must Go On'"),
              ("G", "The stage is the raised green, x 4300 to the end"), ("T", "Totem (D7)")],
         notes=["Broadway replaces Rooftop in the route C plan (the team's call). Rooftop is not drawn.",
                "Test the felt strips at the prototype: a firm putt must get through."],
         elev="broadway"),
    dict(n=3, name="The Rink", sign="Break the Ice", cls="Mid", par=3, glow="#79DCFF", days=0.5,
         L=5000, W=2600, outline=[(0, -500), (1400, -500), (2200, -1300), (4400, -1300), (5000, -700), (5000, 700), (4400, 1300), (2200, 1300), (1400, 500), (0, 500)],
         surface="white", surface_name="Green carpet grass on the approach; white felt or needle-punch rink (test the speed at the prototype)",
         zones=[("green", ("band", 0, 1400), "APPROACH")], **end_green(3800), cup=(4450, 350), totem=(300, -950),
         obstacles=[dict(tag="A" if i == 0 else "", pts=circ(x, y, 50, 16), fill=C["timber"]) for i, (x, y) in enumerate(((3180, 0), (2760, 242), (2760, -242)))],
         plan_tags=[("R", (3300, -1278))],
         outside=[dict(tag="B", pts=circ(5900, 0, 650, 32), label="tree"), dict(tag="S", pts=rect(5150, -575, 5250, 575), label="pun sign")],
         xchain=[0, 1400, 2200, 2760, 3180, 3800, 4100, 4450, 5000],
         key=[("A", "Skaters ×3: 6 mm cut-outs about 200 × 300 on Ø100 × 40 timber blocks, fixed (no turntable). Blocks at (3180, 0), (2760, +242), (2760, −242)"),
              ("R", "Rink boards: the rails, painted white with a red stripe. Corners cut at 45°: straight cuts only"),
              ("B", "The church's Christmas tree on its own stand, outside the end rail"),
              ("S", "Pun sign 'Break the Ice' (D8)"), ("T", "Totem (D7)")],
         notes=["The raised end of the rink is white too: it reads as the far end of the ice.",
                "If white felt is too slow or too fast, change the surface, not the layout."],
         elev="skater"),
    dict(n=2, name="Grand Central", sign="Meet Me Under the Clock", cls="Hero", par=3, glow="#E8A33A", days=0.75,
         L=5000, W=3000, outline=[(0, -500), (1879, -500), (2879, -1500), (4121, -1500), (5000, -621), (5000, 621), (4121, 1500), (2879, 1500), (1879, 500), (0, 500)],
         surface="green", surface_name="Green carpet grass; numerals cut from white felt; clock ring painted",
         raised=[("clip_x", 2000)], bevels=[("band", 1700, 2000)], cup=(4440, 342), totem=(300, -950),
         obstacles=[dict(tag="A", pts=hull(orect(3500 + 557 * math.cos(math.radians(-6)), 557 * math.sin(math.radians(-6)), 1114, 50, -6)
                                          + orect(3500 + 370 * math.cos(math.radians(-0.5)), 370 * math.sin(math.radians(-0.5)), 740, 70, -0.5) + circ(3500, 0, 70, 12)), fill="#3A3F55")],
         plan_tags=[("P", (2900, -800))],
         outside=[dict(tag="B", pts=rect(5125, -225, 5575, 225), label="clock post"), dict(tag="C", pts=rect(5850, -1220, 5950, 1220), label="backdrop")],
         xchain=[0, 1700, 2000, 3500, 4440, 5000],
         key=[("P", "Clock platform: the whole octagon is a raised green (+65), flat to flat 3000, centre x 3500. The rails sit on its edge. 1:5 bevel at the end of the approach (x 1700–2000)"),
              ("A", "Hands at 11:59: minute hand 1114 long × 50, hour hand 740 × 70, both pointing at 12 (toward the backdrop), rounded ends, screwed into the platform. The V between them is filled solid so a ball can't wedge"),
              ("B", "Clock: a 12 mm disc Ø1000 painted as the four-faced clock, on a post (D6 base), top about 2400"),
              ("C", "Backdrop: two 6 mm sheets on a 45 × 45 frame, 2440 × 2440, teal with gold stars and arched windows, braced (D9). Carries the pun sign"),
              ("T", "Totem (D7)")],
         notes=["Eight-sided rail: all straight cuts at 22.5°, no bent plywood.",
                "Numerals at about 1200 from the centre; 12 points at the backdrop, so a player enters at 6."],
         elev="clock"),
    dict(n=1, name="Times Square", sign="Drop the Ball", cls="Hero", par=2, glow="#FF3DCB", days=1.5,
         L=6000, W=1400, outline=rect(0, -700, 6000, 700), surface="green", surface_name="Green carpet grass; red needle-punch over the hump, painted as steps",
         zones=[("red", ("band", 2163, 2638), "HUMP +60")], **end_green(4900), cup=None, mouth=(6000, 150), totem=(300, -1150),
         obstacles=[], plan_tags=[("H", (2400, -420)), ("M", (5800, 0))],
         outside=[dict(tag="A", pts=rect(1780, 800, 4220, 900), label="billboard"), dict(tag="", pts=rect(1780, -900, 4220, -800), label="billboard"),
                  dict(tag="B", pts=rect(6000, -300, 6600, 300), label="tower + ball box")],
         xchain=[0, 2163, 2638, 4900, 5200, 6000],
         key=[("H", "Hump: 475 long × 60 high, a curved timber hump under the surface across the full width (laminated ply strips or shaped solid, feathered to nothing at both ends)"),
              ("M", "Mouth: a 300 gap in the end rail on the centreline. The ball rolls off the end of the green and drops 65 into the ball box, so the hole keeps every ball"),
              ("A", "Billboards ×2: 9 mm sheet 2440 × 1220 on a 45 × 45 frame, landscape, bottom at 500, on two legs each outside the rails, lit by LED strip (D9)"),
              ("B", "Tower: base box 600 × 600 × 600 (18 mm) holding the ball box (lift-off lid) and ballast; column 450 × 450 to 2400 on a 45 × 45 frame skinned in 6 mm; '2027' panel at the top; borrowed mirror ball, top about 2800. Or production's truss. Carpenter confirms it can't tip"),
              ("T", "Totem (D7)")],
         notes=["Pun sign 'Drop the Ball' goes on the tower column at eye height.",
                "LED neon flex for '2027' is fitted by the LED lead (24 V), not the carpenter."],
         elev="tower"),
]


def build(h):
    """Work out inner outline, zones, raised areas and bevels as polygons; check gaps."""
    h["inner"] = offset(h["outline"], RAIL_T)
    inner = h["inner"]

    def resolve(spec):
        if spec[0] == "clip_x":
            return clip(inner, lambda p, x=spec[1]: p[0] - x)
        if spec[0] == "band":
            return xband(inner, spec[1], spec[2])
        return spec[1]
    h["raised_p"] = [resolve(s) for s in h.get("raised", [])]
    h["bevel_p"] = [resolve(s) for s in h.get("bevels", [])]
    h["zones_p"] = [(z[0], resolve(z[1]), z[2]) for z in h.get("zones", [])]
    # gaps: every obstacle against every other and against the rails; 0 or >= GAP_MIN
    obs = [o["pts"] for o in h["obstacles"]]
    # parts of one prop (same tag group listed with tag "") count as joined if they touch
    worst = 1e9
    problems = []
    for i, P in enumerate(obs):
        g = min(pt_seg(p, inner[j], inner[(j + 1) % len(inner)]) for p in P for j in range(len(inner)))
        if g < 2:
            g = 0.0
        if 0 < g < GAP_MIN:
            problems.append(f"hole {h['n']}: obstacle {i} is {g:.0f} mm from the rail")
        worst = min(worst, g) if g > 0 else worst
        for k in range(i + 1, len(obs)):
            g2 = poly_gap(P, obs[k])
            if g2 < 2:
                continue
            if g2 < GAP_MIN:
                problems.append(f"hole {h['n']}: obstacles {i} and {k} are {g2:.0f} mm apart")
            worst = min(worst, g2)
    if h.get("cup"):
        cp = circ(h["cup"][0], h["cup"][1], 55, 16)
        for i, P in enumerate(obs):
            g3 = poly_gap(cp, P)
            if g3 < 150:
                problems.append(f"hole {h['n']}: obstacle {i} is only {g3:.0f} mm from the cup")
    h["min_gap"] = None if worst == 1e9 else worst
    # quantities
    cl = offset(h["outline"], RAIL_T / 2)
    rail = perimeter(cl)
    if h.get("mouth"):
        rail -= 2 * h["mouth"][1]
    h["rail_m"] = rail / 1000
    h["green_m2"] = sum(abs(area(P)) for P in h["raised_p"]) / 1e6
    h["bevel_m2"] = sum(abs(area(P)) for P in h["bevel_p"]) / 1e6
    h["corners"] = len(h["outline"])
    h["plates"] = math.ceil(rail / PLATE_EVERY) + h["corners"]
    return problems


# ------------------------------------------------------------------ SVG views
class View:
    """A drawing view. Model units are mm. Plans: y down. Elevations (elev=True): give z, drawn up."""

    def __init__(self, x0, a0, x1, a1, scale, elev=False):
        self.s, self.elev = scale, elev
        self.x0, self.x1 = x0, x1
        if elev:
            self.y0, self.y1 = -a1, -a0
        else:
            self.y0, self.y1 = a0, a1
        self.el = []
        self.defs = []
        self.uid = f"v{id(self)}"

    def Y(self, y):
        return -y if self.elev else y

    def P(self, pts):
        return " ".join(f"{x:.1f},{self.Y(y):.1f}" for x, y in pts)

    def k(self, paper_mm):
        return paper_mm * self.s

    @property
    def pw(self):
        return (self.x1 - self.x0) / self.s

    @property
    def ph(self):
        return (self.y1 - self.y0) / self.s

    def add(self, s):
        self.el.append(s)

    def poly(self, pts, fill="none", stroke=C["ink"], sw=0.25, dash=None, op=1):
        d = f' stroke-dasharray="{self.k(dash[0]):.1f} {self.k(dash[1]):.1f}"' if dash else ""
        self.add(f'<polygon points="{self.P(pts)}" fill="{fill}" fill-opacity="{op}" stroke="{stroke}" stroke-width="{self.k(sw):.2f}"{d} stroke-linejoin="round"/>')

    def rect(self, x0, z0, x1, z1, **kw):
        self.poly(rect(x0, z0, x1, z1), **kw)

    def line(self, p, q, stroke=C["ink"], sw=0.25, dash=None):
        d = f' stroke-dasharray="{self.k(dash[0]):.1f} {self.k(dash[1]):.1f}"' if dash else ""
        self.add(f'<line x1="{p[0]:.1f}" y1="{self.Y(p[1]):.1f}" x2="{q[0]:.1f}" y2="{self.Y(q[1]):.1f}" stroke="{stroke}" stroke-width="{self.k(sw):.2f}"{d} stroke-linecap="round"/>')

    def pline(self, pts, stroke=C["ink"], sw=0.25, dash=None, fill="none"):
        d = f' stroke-dasharray="{self.k(dash[0]):.1f} {self.k(dash[1]):.1f}"' if dash else ""
        self.add(f'<polyline points="{self.P(pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{self.k(sw):.2f}"{d} stroke-linejoin="round" stroke-linecap="round"/>')

    def circle(self, cx, cy, r, fill="none", stroke=C["ink"], sw=0.25, dash=None):
        d = f' stroke-dasharray="{self.k(dash[0]):.1f} {self.k(dash[1]):.1f}"' if dash else ""
        self.add(f'<circle cx="{cx:.1f}" cy="{self.Y(cy):.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{self.k(sw):.2f}"{d}/>')

    def path(self, cmds, fill="none", stroke=C["ink"], sw=0.25, rule="nonzero"):
        out = []
        for c in cmds:
            op = c[0]
            if op in "ML":
                out.append(f"{op}{c[1]:.1f},{self.Y(c[2]):.1f}")
            elif op == "C":
                out.append(f"C{c[1]:.1f},{self.Y(c[2]):.1f} {c[3]:.1f},{self.Y(c[4]):.1f} {c[5]:.1f},{self.Y(c[6]):.1f}")
            elif op == "A":   # r, sweep, x, y
                sweep = c[2] if not self.elev else 1 - c[2]
                out.append(f"A{c[1]:.1f},{c[1]:.1f} 0 0 {sweep} {c[3]:.1f},{self.Y(c[4]):.1f}")
            elif op == "Z":
                out.append("Z")
        self.add(f'<path d="{" ".join(out)}" fill="{fill}" fill-rule="{rule}" stroke="{stroke}" stroke-width="{self.k(sw):.2f}" stroke-linejoin="round"/>')

    def text(self, x, y, s, size=2.4, anchor="middle", weight="400", fill=C["ink"], rot=0, italic=False):
        tr = f' transform="rotate({rot:.1f} {x:.1f} {self.Y(y):.1f})"' if rot else ""
        it = ' font-style="italic"' if italic else ""
        self.add(f'<text x="{x:.1f}" y="{self.Y(y):.1f}" font-size="{self.k(size):.1f}" text-anchor="{anchor}" font-weight="{weight}" fill="{fill}" dominant-baseline="middle"{it}{tr}>{H.escape(s)}</text>')

    def hatch(self, name, spacing_paper, color, sw=0.15, ang=45):
        pid = f"{self.uid}-{name}"
        sp = self.k(spacing_paper)
        self.defs.append(f'<pattern id="{pid}" patternUnits="userSpaceOnUse" width="{sp:.1f}" height="{sp:.1f}" patternTransform="rotate({ang})">'
                         f'<line x1="0" y1="0" x2="0" y2="{sp:.1f}" stroke="{color}" stroke-width="{self.k(sw):.2f}"/></pattern>')
        return f"url(#{pid})"

    def dim(self, p, q, off, text=None, size=2.2):
        """Dimension p->q, offset `off` paper mm to the left of p->q (in drawing space)."""
        px, py = p[0], self.Y(p[1])
        qx, qy = q[0], self.Y(q[1])
        dx, dy = qx - px, qy - py
        L = math.hypot(dx, dy)
        if L < 1:
            return
        ux, uy = dx / L, dy / L
        nx, ny = uy, -ux                       # left of direction in y-down space
        o = self.k(off)
        a = (px + nx * o, py + ny * o)
        b = (qx + nx * o, qy + ny * o)
        sgn = 1 if o >= 0 else -1
        g, e = self.k(1.0), self.k(1.5)
        sw = self.k(0.18)
        col = C["dim"]
        s = []
        s.append(f'<line x1="{px + nx * g * sgn:.1f}" y1="{py + ny * g * sgn:.1f}" x2="{a[0] + nx * e * sgn:.1f}" y2="{a[1] + ny * e * sgn:.1f}" stroke="{col}" stroke-width="{sw:.2f}"/>')
        s.append(f'<line x1="{qx + nx * g * sgn:.1f}" y1="{qy + ny * g * sgn:.1f}" x2="{b[0] + nx * e * sgn:.1f}" y2="{b[1] + ny * e * sgn:.1f}" stroke="{col}" stroke-width="{sw:.2f}"/>')
        s.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{col}" stroke-width="{sw:.2f}"/>')
        t = self.k(1.2)
        for c in (a, b):
            s.append(f'<line x1="{c[0] - (ux + nx) * t:.1f}" y1="{c[1] - (uy + ny) * t:.1f}" x2="{c[0] + (ux + nx) * t:.1f}" y2="{c[1] + (uy + ny) * t:.1f}" stroke="{col}" stroke-width="{self.k(0.3):.2f}"/>')
        ang = math.degrees(math.atan2(uy, ux))
        if ang > 90.01 or ang < -89.99:
            ang -= 180 if ang > 0 else -180
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        lab = text if text is not None else f"{L:.0f}"
        tx, ty = mx + nx * self.k(1.6) * sgn, my + ny * self.k(1.6) * sgn
        s.append(f'<text x="{tx:.1f}" y="{ty:.1f}" font-size="{self.k(size):.1f}" text-anchor="middle" dominant-baseline="middle" fill="{col}" '
                 f'transform="rotate({ang:.1f} {tx:.1f} {ty:.1f})">{H.escape(lab)}</text>')
        self.el.extend(s)

    def tag(self, x, y, t, r=2.0):
        rr = self.k(r)
        self.add(f'<circle cx="{x:.1f}" cy="{self.Y(y):.1f}" r="{rr:.1f}" fill="#FFFFFF" stroke="{C["ink"]}" stroke-width="{self.k(0.3):.2f}"/>')
        self.add(f'<text x="{x:.1f}" y="{self.Y(y) + self.k(0.15):.1f}" font-size="{self.k(2.3):.1f}" text-anchor="middle" dominant-baseline="middle" font-weight="700">{H.escape(t)}</text>')

    def svg(self):
        w, h = self.x1 - self.x0, self.y1 - self.y0
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.pw:.2f}mm" height="{self.ph:.2f}mm" viewBox="{self.x0:.1f} {self.y0:.1f} {w:.1f} {h:.1f}" '
                f'font-family="{FONT}"><defs>{"".join(self.defs)}</defs>{"".join(self.el)}</svg>')


SCALES = [5, 10, 20, 25, 30, 40, 50, 60, 75, 100]


def fit_scale(w_mm, h_mm, avail_w, avail_h, margin=0.0, min_scale=1):
    for s in SCALES:
        if s < min_scale:
            continue
        if w_mm / s + 2 * margin <= avail_w and h_mm / s + 2 * margin <= avail_h:
            return s
    return SCALES[-1]


SURF_FILL = dict(green=C["green"], charcoal=C["charcoal"], grey=C["grey"], blue=C["blue"], white=C["white"], red=C["red"])


def centroid(P):
    return (sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P))


def plan_view(h, avail_w, avail_h):
    pts = list(h["outline"])
    for o in h.get("outside", []) + h.get("overhead", []):
        pts += o["pts"]
    tx, ty = h["totem"]
    pts += [(tx - 200, ty - 200), (tx + 200, ty + 200)]
    x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
    y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
    M = 17  # paper mm for dimensions round the edge
    s = fit_scale(x1 - x0, y1 - y0, avail_w, avail_h, M, min_scale=20)
    v = View(x0 - M * s, y0 - M * s, x1 + M * s, y1 + M * s, s)
    raised_fill = v.hatch("r", 2.2, "#4C7A3F", 0.12, 45)
    bevel_fill = v.hatch("b", 0.9, "#7A5A2A", 0.12, -45)
    # outside props (dashed)
    for o in h.get("outside", []):
        v.poly(o["pts"], fill=C["prop"], stroke=C["soft"], sw=0.25, dash=(1.2, 0.8))
    # rails and surface
    v.poly(h["outline"], fill=C["rail"], stroke=C["ink"], sw=0.3)
    v.poly(h["inner"], fill=SURF_FILL[h["surface"]], stroke=C["ink"], sw=0.2)
    for name, P, lab in h["zones_p"]:
        v.poly(P, fill=SURF_FILL[name], stroke=C["ink"], sw=0.12)
    for P in h["raised_p"]:
        v.poly(P, fill=raised_fill, stroke="#2F5B2A", sw=0.3)
    for P in h["bevel_p"]:
        v.poly(P, fill=bevel_fill, stroke="#7A5A2A", sw=0.2)
    if h.get("mouth"):
        mx, mw = h["mouth"]
        v.rect(mx - RAIL_T - 2, -mw, mx + 2, mw, fill="#FFFFFF", stroke=C["ink"], sw=0.2)
    # tee end: low step-in rail
    tee_edge = [p for p in h["outline"] if p[0] == 0]
    if len(tee_edge) == 2:
        ya, yb = sorted(p[1] for p in tee_edge)
        v.rect(0, ya, RAIL_T, yb, fill="#9A9A9A", stroke=C["ink"], sw=0.2)
    # obstacles
    for o in h.get("obstacles", []):
        v.poly(o["pts"], fill=o.get("fill", C["timber"]), stroke=C["ink"], sw=0.25)
    for o in h.get("overhead", []):
        v.poly(o["pts"], fill="none", stroke=C["ink"], sw=0.3, dash=(2.0, 1.0))
    # cup and tee
    if h.get("cup"):
        cx, cy = h["cup"]
        v.circle(cx, cy, 55, fill="#FFFFFF", stroke=C["ink"], sw=0.35)
        v.line((cx - 90, cy), (cx + 90, cy), sw=0.15)
        v.line((cx, cy - 90), (cx, cy + 90), sw=0.15)
        v.text(cx, cy + v.k(4.0), f"CUP x{cx:.0f} y{cy:+.0f}", 2.0, weight="700")
    v.rect(150, -150, 450, 150, fill="none", stroke=C["ink"], sw=0.2, dash=(0.8, 0.6))
    v.text(300, 0, "TEE", 1.8, weight="700")
    v.poly(rect(tx - 180, ty - 180, tx + 180, ty + 180), fill="#CFE3D6", stroke=C["ink"], sw=0.25)
    v.tag(tx, ty, "T", 1.8)
    # labels
    for P in h["raised_p"]:
        c = centroid(P)
        if h.get("cup") and inside(h["cup"], P):
            ys = [p[1] for p in P]
            c = (c[0], min(ys) + v.k(3.2) if h["cup"][1] >= c[1] - 1 else max(ys) - v.k(3.2))
        if h["n"] == 2:
            c = (3050, 620)
        v.text(c[0], c[1], "RAISED GREEN +65", 1.9, weight="700", fill="#2F5B2A")
    if h["n"] == 2:
        v.circle(3500, 0, 1360, fill="none", stroke="#2F5B2A", sw=0.2, dash=(1.0, 0.7))
        for hr in range(1, 13):
            a = math.radians(hr * 30)
            v.text(3500 + 1180 * math.cos(a), 1180 * math.sin(a), str(hr), 2.0, weight="700", fill="#2F5B2A")
    labelled = set()
    for P in h["bevel_p"]:
        c = centroid(P)
        key = round(c[0])
        if key in labelled:
            continue
        labelled.add(key)
        rot = -90 if (max(p[1] for p in P) - min(p[1] for p in P)) > 900 else 0
        v.text(c[0], c[1] if rot else c[1] - v.k(3), "1:5 UP →" if not rot else "1:5 UP", 1.7, weight="700", fill="#6A4A1A", rot=rot)
    for name, P, lab in h["zones_p"]:
        c = centroid(P)
        if name == "blue":
            c = (2000, -800)
        v.text(c[0], c[1], lab, 1.8, weight="700", fill="#2D4A66" if name == "blue" else C["ink"], rot=-90 if h["n"] == 1 else 0)
    # tags
    seen = set()
    for o in h.get("obstacles", []) + h.get("overhead", []) + h.get("outside", []):
        if o.get("tag") and o["tag"] not in seen:
            seen.add(o["tag"])
            c = centroid(o["pts"])
            if o["tag"] == "A" and h["n"] == 9:
                c = (1509, -400)
            if o["tag"] == "A" and h["n"] == 4:
                c = (3909, -300)
            v.tag(c[0], c[1], o["tag"])
    for t, xy in h.get("plan_tags", []):
        v.tag(xy[0], xy[1], t)
    # dimensions: chain along the top, overall length along the bottom, widths on the left
    ymin = min(p[1] for p in h["outline"])
    ymax = max(p[1] for p in h["outline"])
    all_y0 = min(p[1] for p in pts)
    all_y1 = max(p[1] for p in pts)
    all_x0 = min(p[0] for p in pts)
    top = (ymin - (all_y0 - 6 * s)) / s
    bot = ((all_y1 + 6 * s) - ymax) / s
    xs = h["xchain"]
    for a, b in zip(xs, xs[1:]):
        v.dim((a, ymin), (b, ymin), top)
    v.dim((0, ymax), (h["L"], ymax), -bot)
    left = (0 - (min(all_x0, 0) - 6 * s)) / s
    tee_y = sorted(p[1] for p in h["outline"] if p[0] == 0)
    v.dim((0, tee_y[1]), (0, tee_y[0]), left)
    if (tee_y[1] - tee_y[0]) < (ymax - ymin):
        v.dim((0, ymax), (0, ymin), left + 7, f"{ymax - ymin:.0f} overall")
    # axis hint
    ax, ay = v.x0 + v.k(6), v.y1 - v.k(5)
    v.add(f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{ax + v.k(9):.1f}" y2="{ay:.1f}" stroke="{C["soft"]}" stroke-width="{v.k(0.25):.2f}" marker-end=""/>')
    v.add(f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{ax:.1f}" y2="{ay - v.k(5):.1f}" stroke="{C["soft"]}" stroke-width="{v.k(0.25):.2f}"/>')
    v.text(ax + v.k(10.5), ay, "x", 2.0, fill=C["soft"], italic=True)
    v.text(ax, ay - v.k(6.5), "−y", 2.0, fill=C["soft"], italic=True)
    return v


# ------------------------------------------------------------------ elevations
def elev_frame(x0, z0, x1, z1, avail_w, avail_h, margin=13, min_scale=10):
    s = fit_scale(x1 - x0, z1 - z0, avail_w, avail_h, margin, min_scale)
    return View(x0 - margin * s, z0 - margin * s, x1 + margin * s, z1 + margin * s, s, elev=True)


def floor(v, x0, x1):
    v.line((x0, 0), (x1, 0), sw=0.4)
    step = v.k(2.0)
    x = x0
    while x < x1:
        v.line((x, 0), (x - step * 0.7, -step * 0.7), sw=0.12, stroke=C["soft"])
        x += step


def grid(v, x0, z0, x1, z1, step):
    x = math.ceil(x0 / step) * step
    while x <= x1:
        v.line((x, z0), (x, z1), stroke="#C9D3E3", sw=0.08)
        x += step
    z = math.ceil(z0 / step) * step
    while z <= z1:
        v.line((x0, z), (x1, z), stroke="#C9D3E3", sw=0.08)
        z += step


def lane_profile(v, h):
    """Side view along the lane: surface line with the raised green."""
    L = h["L"]
    b0 = None
    for s in h.get("bevels", []):
        if s[0] == "band":
            b0 = s[1]
    pts = [(0, SURF)]
    if b0 is not None:
        pts += [(b0, SURF), (b0 + BEVEL, GREEN_H + SURF), (L, GREEN_H + SURF)]
    else:
        pts += [(L, SURF)]
    v.pline(pts, stroke="#2F5B2A", sw=0.45)
    rp = [(0, RAIL_H), (b0 if b0 else L, RAIL_H)]
    if b0 is not None:
        rp += [(b0 + BEVEL, RAIL_H + GREEN_H), (L, RAIL_H + GREEN_H)]
    v.pline(rp, stroke=C["soft"], sw=0.25, dash=(1.5, 0.8))
    v.text(L * 0.06, RAIL_H + v.k(2.2), "rail top (beyond)", 1.7, anchor="start", fill=C["soft"])
    return b0


def elev_views(h, avail_w, avail_h):
    """Return a list of (title, View) for the hole's elevation zone."""
    kind = h["elev"]
    out = []
    if kind == "bike":
        v = elev_frame(-200, 0, 6400, 1800, avail_w, avail_h, min_scale=25)
        floor(v, -200, 6400)
        lane_profile(v, h)
        for x in (1200, 2050, 2900, 3750, 4600):
            v.circle(x, SURF + 330, 330, fill="none", stroke=C["ink"], sw=0.35)
            v.circle(x, SURF + 330, 30, fill=C["ink"], stroke=C["ink"], sw=0.1)
            v.rect(x + 20, SURF, x + 65, SURF + 330, fill=C["timber"], sw=0.2)
        v.pline([(5440, GREEN_H + SURF), (5440, 785), (5460, 785), (5460, GREEN_H + SURF)], sw=0.35)
        v.rect(6150, 0, 6195, 1740, fill=C["timber"], sw=0.2)
        v.rect(6140, 1260, 6250, 1740, fill="#FFFFFF", sw=0.3)
        v.dim((2900 - 330, SURF), (2900 - 330, SURF + 660), 4, "Ø660 wheel")
        v.dim((5460, 0), (5460, 785), -4, "785")
        v.dim((6250, 0), (6250, 1740), -5)
        v.dim((4900, 0), (5200, 0), -5, "300")
        v.text(5500, 300, "raised green +65 (57 + surface)", 1.8, anchor="start", fill="#2F5B2A")
        out.append(("SECTION ALONG THE LANE", v))
    elif kind == "cart":
        v = elev_frame(-1000, 0, 1000, 2300, avail_w * 0.48, avail_h, min_scale=20)
        floor(v, -1000, 1000)
        v.poly([(-810, 0), (-655, 0), (-655, 200), (655, 200), (655, 0), (810, 0), (810, 800), (-810, 800)], fill=C["prop"], sw=0.35)
        for s in (-1, 1):
            v.rect(s * 655, 0, s * 700, RAIL_H, fill=C["rail"], sw=0.2)
        v.rect(-400, 400, 400, 700, fill="#FFFFFF", sw=0.2)
        v.text(0, 550, "menu board: 'Open till 11:59'", 1.7)
        v.line((0, 800), (0, 2150), sw=0.5)
        v.poly([(-900, 1900), (0, 2250), (900, 1900)], fill="#FBE3D6", sw=0.3)
        v.dim((-810, 800), (810, 800), 5, "1620")
        v.dim((-655, 0), (655, 0), -5, "1310 opening")
        v.dim((810, 0), (810, 800), -5, "800")
        v.dim((-655, 0), (-655, 200), 4, "200")
        v.dim((900, 0), (900, 2250), -12, "≈ 2250")
        out.append(("A · CART FRONT FROM THE TEE", v))
        v2 = elev_frame(0, 0, 1000, 200, avail_w * 0.48, avail_h * 0.5, min_scale=10)
        floor(v2, 0, 1000)
        v2.path([("M", 47, 0), ("L", 953, 0), ("A", 47, 1, 953, 95), ("L", 47, 95), ("A", 47, 1, 47, 0), ("Z",)], fill="#F4D9A6", sw=0.3)
        v2.path([("M", 30, 70), ("L", 970, 70), ("A", 25, 1, 970, 120), ("L", 30, 120), ("A", 25, 1, 30, 70), ("Z",)], fill="#E9A48C", sw=0.25)
        v2.dim((0, 120), (1000, 120), 5, "1000")
        v2.dim((1000, 0), (1000, 95), -4, "95")
        out.append(("B · HOT DOG (rail timber, ends rounded)", v2))
    elif kind == "apple":
        v = elev_frame(-1000, 0, 1000, 1750, avail_w, avail_h, min_scale=20)
        grid(v, -950, 0, 950, 1700, 100)
        floor(v, -1000, 1000)
        cmds = [("M", 160, 0), ("L", 450, 0), ("C", 800, 0, 930, 450, 890, 860), ("C", 850, 1300, 550, 1620, 250, 1500),
                ("C", 120, 1450, 60, 1400, 0, 1370), ("C", -60, 1400, -120, 1450, -250, 1500), ("C", -550, 1620, -850, 1300, -890, 860),
                ("C", -930, 450, -800, 0, -450, 0), ("L", -160, 0), ("L", -160, 90), ("A", 160, 0, 160, 90), ("L", 160, 0), ("Z",)]
        v.path(cmds, fill="#F6C9C9", sw=0.4)
        v.line((200, 1380), (170, 1640), sw=1.2, stroke="#5A3A1E")
        v.add(f'<ellipse cx="330" cy="{v.Y(1600)}" rx="170" ry="60" transform="rotate(-20 330 {v.Y(1600)})" fill="#BFE0B5" stroke="{C["ink"]}" stroke-width="{v.k(0.25):.2f}"/>')
        for s in (-1, 1):
            v.rect(s * 755, 0, s * 800, RAIL_H, fill=C["rail"], sw=0.2)
            v.rect(s * 750, 0, s * 805, 100, fill="none", stroke="#B02020", sw=0.2, dash=(0.8, 0.5))
            v.line((s * 755, 0), (s * 200, 90), stroke="#2E7D32", sw=0.4)
        v.dim((-160, 0), (160, 0), -5, "320")
        v.dim((160, 0), (160, 250), -4, "250")
        v.dim((-900, 0), (-900, 1620), 6, "≈ 1620")
        v.dim((-890, 1700), (890, 1700), 5, "≈ 1800 (to the 100 grid)")
        v.text(0, 760, "6 mm skins on a 45 × 45 frame (D9)", 1.9)
        v.text(0, 660, "notch 50 × 100 over each rail (dashed red)", 1.7, fill="#B02020")
        v.text(0, 560, "worm with a watch at 11:59 painted on the back", 1.7, fill=C["soft"])
        out.append(("A · THE APPLE FROM THE TEE (100 mm grid: enlarge, or print the full-size template)", v))
    elif kind == "cab":
        v = elev_frame(0, 0, 900, 260, avail_w * 0.6, avail_h, min_scale=5)
        floor(v, 0, 900)
        v.rect(0, 0, 360, 100, fill="#F7E08A", sw=0.35)
        v.rect(70, 100, 290, 140, fill="#9FB0C8", sw=0.3)
        v.rect(150, 140, 210, 165, fill="#FFFFFF", sw=0.25)
        for k in range(9):
            v.rect(20 + k * 36, 45, 38 + k * 36, 63, fill=C["ink"] if k % 2 == 0 else "#FFFFFF", sw=0.1)
        v.dim((0, 0), (360, 0), -5, "360")
        v.dim((0, 0), (0, 140), 5, "140")
        v.rect(520, 0, 690, 100, fill="#F7E08A", sw=0.35)
        v.rect(545, 100, 665, 140, fill="#9FB0C8", sw=0.3)
        v.dim((520, 0), (690, 0), -5, "170")
        v.text(180, 210, "side", 2.0)
        v.text(605, 210, "end", 2.0)
        out.append(("A · CAB (×8)", v))
        v2 = elev_frame(0, 0, 300, 260, avail_w * 0.3, avail_h, min_scale=5)
        floor(v2, 0, 300)
        v2.poly([(70, 10), (230, 10), (170, 240), (130, 240)], fill="#F6B183", sw=0.35)
        v2.rect(70, 0, 230, 10, fill=C["ink"], sw=0.1)
        v2.dim((70, 0), (230, 0), -5, "160")
        v2.dim((230, 0), (230, 240), -5, "≈ 230")
        out.append(("B · CONE", v2))
    elif kind == "torch":
        v = elev_frame(-700, 0, 700, 2650, avail_w * 0.5, avail_h, min_scale=20)
        floor(v, -700, 700)
        v.rect(-275, 0, 275, 600, fill=C["prop"], sw=0.35)
        v.text(0, 300, "pedestal box (D6)", 1.8)
        v.text(0, 200, "+ ballast inside", 1.6, fill=C["soft"])
        arm = [(-130, 600), (130, 600), (90, 1650), (-90, 1650)]
        v.poly(arm, fill="#BFE7DA", sw=0.35)
        v.rect(-40, 1650, 40, 1990, fill="#E9D27A", sw=0.3)
        v.poly([(-75, 1990), (75, 1990), (165, 2140), (-165, 2140)], fill="#E9D27A", sw=0.3)
        v.path([("M", -140, 2140), ("C", -160, 2300, -40, 2420, 0, 2600), ("C", 40, 2420, 160, 2300, 140, 2140), ("Z",)], fill="#FFE2A8", sw=0.3)
        v.dim((-275, 0), (275, 0), -5, "550")
        v.dim((275, 0), (275, 600), -4, "600")
        v.dim((-450, 0), (-450, 2600), 4, "≈ 2600")
        v.dim((330, 600), (330, 2600), -6, "cut-out 2000 (one 12 mm sheet)")
        v.text(0, 1100, "torch arm", 1.8, rot=-90)
        v.text(450, 2350, "battery LED flame", 1.7, anchor="start", fill=C["soft"])
        out.append(("B · TORCH FROM THE TEE", v))
        v2 = elev_frame(0, 0, 5000, 300, avail_w * 0.6, avail_h * 0.6, min_scale=20)
        floor(v2, 0, 5000)
        v2.pline([(0, SURF), (1000, SURF), (1300, GREEN_H + SURF), (5000, GREEN_H + SURF)], stroke="#2F5B2A", sw=0.45)
        v2.pline([(1000, SURF), (3000, SURF), (3300, GREEN_H + SURF), (5000, GREEN_H + SURF)], stroke="#2D4A66", sw=0.3, dash=(1.2, 0.7))
        v2.text(2150, GREEN_H + SURF + v2.k(3), "gangway +65", 1.8, fill="#2F5B2A")
        v2.text(2000, -v2.k(3), "harbour at floor level (dashed)", 1.7, fill="#2D4A66")
        v2.text(4150, GREEN_H + SURF + v2.k(3), "island +65", 1.8, fill="#2F5B2A")
        out.append(("SECTION ALONG THE GANGWAY", v2))
    elif kind == "subway":
        v = elev_frame(-1200, 0, 1200, 760, avail_w * 0.5, avail_h, min_scale=20)
        floor(v, -1200, 1200)
        cm = [("M", -1155, 0)]
        for c in (-650, 0, 650):
            cm += [("L", c - 150, 0), ("L", c - 150, 100), ("A", 150, 0, c + 150, 100), ("L", c + 150, 0)]
        cm += [("L", 1155, 0), ("L", 1155, 620), ("L", -1155, 620), ("Z",)]
        tiles = v.hatch("t", 1.0, "#B7C2CF", 0.08, 0)
        v.path(cm, fill="#FFFFFF", sw=0.4)
        v.path(cm, fill=tiles, sw=0.0)
        for c, col in zip((-650, 0, 650), ("#E2312F", "#1F9D55", "#F2C230")):
            v.circle(c, 460, 70, fill=col, stroke=C["ink"], sw=0.2)
        for s in (-1, 1):
            v.rect(s * 1155, 0, s * 1200, RAIL_H, fill=C["rail"], sw=0.2)
        v.dim((-1155, 620), (1155, 620), 5, "2310 (between rails)")
        v.dim((1155, 0), (1155, 620), -6, "620")
        v.dim((-800, 0), (-500, 0), -5, "300")
        v.dim((-500, 0), (-500, 250), -4, "250")
        v.text(0, 560, "openings centred at −650, 0, +650", 1.6, fill=C["soft"])
        out.append(("A · TILE WALL FROM THE TEE", v))
        v2 = elev_frame(-1200, 0, 1200, 2450, avail_w * 0.42, avail_h, min_scale=20)
        floor(v2, -1200, 1200)
        v2.rect(-1150, 0, 1150, 2400, fill="#D9DEE5", sw=0.35)
        v2.rect(-600, 1250, 600, 1950, fill="#5C6B80", sw=0.3)
        v2.rect(-500, 2050, 500, 2280, fill="#1D1D1B", sw=0.2)
        v2.text(0, 2165, "STAND CLEAR OF THE CLOSING DOORS", 1.5, fill="#FFD45A", weight="700")
        for s in (-1, 1):
            v2.circle(s * 800, 500, 90, fill="#FFF6D0", sw=0.25)
        v2.dim((-1150, 0), (1150, 0), -5, "2300")
        v2.dim((1150, 0), (1150, 2400), -5, "2400")
        out.append(("C · SUBWAY-CAR FRONT", v2))
    elif kind == "broadway":
        v = elev_frame(-1100, 0, 1100, 1850, avail_w * 0.55, avail_h, min_scale=20)
        floor(v, -1100, 1100)
        v.poly([(-1000, 0), (-600, 0), (-600, 900), (600, 900), (600, 0), (1000, 0), (1000, 1800), (-1000, 1800)], fill="#E9D6F7", sw=0.4)
        v.rect(-1000, 1300, 1000, 1800, fill="#1D1D1B", sw=0.3)
        v.text(0, 1550, "THE SHOW MUST GO ON", 3.2, fill="#FFD45A", weight="700")
        for k in range(14):
            x = -930 + k * 143
            v.circle(x, 1355, 22, fill="#FFE7B0", stroke=C["ink"], sw=0.1)
            v.circle(x, 1745, 22, fill="#FFE7B0", stroke=C["ink"], sw=0.1)
        x = -555
        while x < 556:
            v.line((x, 900), (x, 12), stroke="#C8273A", sw=0.35)
            x += 100
        for s in (-1, 1):
            v.rect(s * 555, 0, s * 600, RAIL_H, fill=C["rail"], sw=0.2)
        v.dim((-1000, 1800), (1000, 1800), 5, "2000")
        v.dim((1000, 0), (1000, 1800), -5, "1800")
        v.dim((-600, 0), (600, 0), -5, "opening 1200")
        v.dim((-600, 0), (-600, 900), 4, "900")
        v.dim((-1000, 1300), (-1000, 1800), 4, "500")
        v.text(0, 450, "red felt strips 100 wide, 10 above the surface", 1.7, fill="#8A1C2B")
        out.append(("A · PROSCENIUM FROM THE TEE", v))
    elif kind == "skater":
        v = elev_frame(0, 0, 900, 360, avail_w * 0.5, avail_h, min_scale=5)
        floor(v, 0, 900)
        v.rect(50, 0, 150, 40, fill=C["timber"], sw=0.3)
        v.path([("M", 70, 40), ("L", 130, 40), ("L", 120, 160), ("L", 160, 230), ("L", 125, 245), ("C", 135, 300, 65, 300, 75, 245),
                ("L", 40, 230), ("L", 80, 160), ("Z",)], fill="#F5C2CE", sw=0.3)
        v.dim((50, 0), (150, 0), -5, "Ø100 block")
        v.dim((150, 0), (150, 300), -6, "≈ 300")
        v.text(100, 330, "skater (6 mm) ×3", 1.8)
        v.rect(400, 0, 445, RAIL_H, fill="#FFFFFF", sw=0.35)
        v.rect(400, 40, 445, 60, fill="#C8273A", sw=0.1)
        v.text(560, 50, "rink board: rail painted white, red stripe", 1.8, anchor="start")
        out.append(("A · SKATER AND RINK BOARD", v))
    elif kind == "clock":
        v = elev_frame(-1300, 0, 1300, 2500, avail_w * 0.55, avail_h, min_scale=20)
        floor(v, -1300, 1300)
        v.rect(-1220, 0, 1220, 2440, fill="#BFE3E0", sw=0.35)
        for k in range(18):
            ang = k * 2.39996
            r = 300 + (k * 197) % 800
            v.text(math.cos(ang) * r * 1.3, 1500 + math.sin(ang) * r * 0.9, "✦", 2.2, fill="#B8902F")
        for s in (-1, 1):
            v.path([("M", s * 1100, 300), ("L", s * 1100, 1100), ("A", 250, 0 if s < 0 else 1, s * 600, 1100), ("L", s * 600, 300), ("Z",)], fill="#E8F4F3", sw=0.25)
        v.rect(-22, 0, 22, 1900, fill=C["timber"], sw=0.25)
        v.circle(0, 1900, 500, fill="#FFF5DC", stroke=C["ink"], sw=0.4)
        v.line((0, 1900), (-30, 2300), sw=0.8)
        v.line((0, 1900), (-8, 2160), sw=1.2)
        v.text(0, 2290, "XII", 1.8)
        v.rect(-225, 0, 225, 300, fill=C["prop"], sw=0.3)
        v.dim((-1220, 2440), (1220, 2440), 5, "2440 backdrop (2 sheets)")
        v.dim((1220, 0), (1220, 2440), -5, "2440")
        v.dim((-500, 1900), (500, 1900), -3, "Ø1000")
        v.dim((-1220, 0), (-1220, 2400), 6, "clock top ≈ 2400")
        out.append(("B + C · CLOCK AND BACKDROP FROM THE TEE", v))
    elif kind == "tower":
        v = elev_frame(0, 0, 6650, 2850, avail_w, avail_h, min_scale=25)
        floor(v, 0, 6650)
        L = 6000
        v.pline([(0, SURF), (2163, SURF), (2400, 70), (2638, SURF), (4900, SURF), (5200, GREEN_H + SURF), (L, GREEN_H + SURF)], stroke="#2F5B2A", sw=0.45)
        v.rect(1780, 500, 4220, 1720, fill="#F9D6EE", sw=0.35)
        v.text(3000, 1110, "billboard 2440 × 1220 (beyond)", 2.0)
        for x in (1900, 4100):
            v.rect(x - 22, 0, x + 22, 500, fill=C["timber"], sw=0.2)
        v.rect(6000, 0, 6600, 600, fill=C["prop"], sw=0.35)
        v.rect(6020, 0, 6580, 50, fill="none", stroke=C["soft"], sw=0.2, dash=(0.8, 0.5))
        v.text(6300, 300, "ball box", 1.7)
        v.rect(6075, 600, 6525, 2400, fill="#E4E4E4", sw=0.35)
        v.rect(6075, 2000, 6525, 2400, fill="#2A2A2A", sw=0.3)
        v.text(6300, 2200, "2027", 2.6, fill="#FFD45A", weight="700")
        v.circle(6300, 2600, 200, fill="#EFEFEF", sw=0.3)
        v.text(6300, 1500, "DROP THE BALL", 1.7, rot=-90)
        v.dim((2163, 0), (2638, 0), -5, "475")
        v.dim((2400, 0), (2400, 70), 6, "60")
        v.dim((6600, 0), (6600, 2800), -5, "≈ 2800")
        v.dim((6600, 0), (6600, 600), -12, "600")
        v.dim((1780, 0), (1780, 500), 5, "500")
        v.text(5600, 230, "green +65 → mouth", 1.7, fill="#2F5B2A")
        out.append(("SECTION ALONG THE LANE", v))
    return out


# ------------------------------------------------------------------ standard details
def dview(x0, z0, x1, z1, scale):
    """An elevation or section view with exact model bounds."""
    v = View(x0, z0, x1, z1, scale, elev=True)
    return v


def callout(v, n, px, pz, tx, tz):
    v.line((px, pz), (tx, tz), stroke=C["ink"], sw=0.18)
    v.circle(px, pz, v.k(0.45), fill=C["ink"], stroke=C["ink"], sw=0.05)
    v.tag(tx, tz, str(n), 1.9)


def details_a():
    out = []
    # D1 rail on the lane
    v = dview(-110, -70, 340, 175, 2.5)
    floor(v, -110, 340)
    v.poly([(0, 0), (300, 0), (290, 6), (0, 6)], fill="#E9DCC2", sw=0.3)
    v.rect(0, 6, 45, 101, fill=C["timber"], sw=0.4)
    v.rect(0, 6, 15, 21, fill="#FFFFFF", sw=0.25)
    v.rect(2, 8, 13, 11, fill="#FF6F86", stroke="none", sw=0)
    v.poly([(45, 6), (290, 6), (320, 0), (340, 0), (340, 10), (320, 10), (290, 16), (45, 16)], fill=C["green"], sw=0.3)
    for x in (22, 34):
        v.line((x, 0), (x, 50), stroke=C["ink"], sw=0.25, dash=(0.8, 0.5))
    v.dim((0, 101), (45, 101), 4, "45")
    v.dim((0, 6), (0, 101), 5, "95")
    v.dim((70, 16), (70, 101), -4, "85 above the surface")
    v.dim((0, 0), (300, 0), -14, "300 plate")
    callout(v, 1, 22, 75, -70, 150)
    callout(v, 2, 8, 14, -70, 50)
    callout(v, 3, 180, 3, 180, -45)
    callout(v, 4, 250, 12, 250, 70)
    callout(v, 5, 22, 35, -70, -25)
    v.text(-100, 120, "outside", 2.0, anchor="start", fill=C["soft"])
    v.text(330, 140, "inside", 2.0, anchor="end", fill=C["soft"])
    out.append(("D1 · RAIL ON THE LANE (section)", v, [
        "Rail: 45 × 95 dressed timber on edge, straight. Lengths ≤ 2440, each labelled (H7-R3).",
        "15 × 15 rebate along the outside bottom edge for the LED strip and its cable.",
        "Hidden plate: 6 mm ply 300 × 300 under the rail at every joint, corner and every 1200, reaching 250 inside. Between plates the rail sits on 6 mm rubber strip.",
        "Playing surface (10 mm) laid tight to the rail and over the plate; bevel the plate's inside edge.",
        "Screws up from the plate into the rail."]))
    # D2 rail on a raised green
    v = dview(-60, -55, 425, 200, 2.5)
    floor(v, -60, 425)
    v.rect(0, 0, 45, 45, fill=C["timber"], sw=0.3)
    v.rect(300, 0, 345, 45, fill=C["timber"], sw=0.3)
    v.rect(0, 45, 370, 57, fill="#E9DCC2", sw=0.3)
    v.rect(45, 57, 370, 67, fill=C["green"], sw=0.3)
    v.rect(0, 57, 45, 152, fill=C["timber"], sw=0.4)
    v.rect(0, 57, 15, 72, fill="#FFFFFF", sw=0.25)
    v.rect(2, 59, 13, 62, fill="#FF6F86", stroke="none", sw=0)
    v.line((28, 140), (28, 12), stroke=C["ink"], sw=0.25, dash=(0.8, 0.5))
    v.dim((0, 57), (0, 152), 5, "95")
    v.dim((70, 67), (70, 152), -4, "85")
    v.dim((370, 0), (370, 57), -4, "57")
    v.dim((370, 0), (370, 67), -10, "67")
    callout(v, 1, 28, 110, -40, 185)
    callout(v, 2, 200, 51, 200, 120)
    callout(v, 3, 322, 22, 250, -38)
    callout(v, 4, 160, 63, 140, 120)
    callout(v, 5, 22, 0, 90, -38)
    out.append(("D2 · RAIL ON A RAISED GREEN (section)", v, [
        "Rail screwed down through the ply into the edge batten: 75 mm screws, 400 apart.",
        "12 mm ply top, glued and screwed to the frame.",
        "45 × 45 batten frame, members ≤ 300 apart, with a batten under every rail.",
        "Surface 10 mm: the green's top is 67 above the floor and the rail still stands 85 above it.",
        "Felt or rubber pads under the frame, so nothing marks the venue floor."]))
    # D3 bevel and cup
    v = dview(-70, -75, 1060, 150, 5)
    floor(v, -70, 1060)
    v.poly([(0, 0), (300, 45), (300, 0)], fill=C["timber"], sw=0.25)
    v.poly([(0, 0), (300, 57), (300, 45), (12, 0)], fill="#E9DCC2", sw=0.25)
    for x in (300, 655, 955):
        v.rect(x, 0, x + 45, 45, fill=C["timber"], sw=0.25)
    v.rect(300, 45, 1000, 57, fill="#E9DCC2", sw=0.3)
    v.pline([(-50, 0), (0, 1), (300, 67), (1000, 67)], stroke="#2F5B2A", sw=0.55)
    v.rect(790, 0, 900, 57, fill="#FFFFFF", sw=0.35)
    v.rect(790, 0, 900, 4, fill="#C9B9E8", sw=0.15)
    v.circle(845, 25.5, 21.5, fill="#FFFFFF", stroke=C["ink"], sw=0.3)
    v.dim((0, 67), (300, 67), 7, "300 (1:5)")
    v.dim((1000, 0), (1000, 67), -4, "67")
    v.dim((790, 67), (900, 67), 4, "Ø110")
    callout(v, 1, 160, 33, 480, 120)
    callout(v, 2, 240, 15, 240, -45)
    callout(v, 3, 8, 1, -45, 60)
    callout(v, 4, 795, 35, 700, 120)
    callout(v, 5, 870, 2, 900, -45)
    callout(v, 6, 677, 22, 600, -45)
    out.append(("D3 · BEVEL AND CUP (section)", v, [
        "Ramp board, 12 mm, at 1:5: 300 long to climb 57.",
        "Tapered battens under the ramp, ≤ 300 apart.",
        "Front edge feathered to nothing (or a tapered threshold strip): no lip for a ball to stop on.",
        "Cup: a 110 hole through the ply; liner = 110 mm PVC drain pipe cut to 57. The ball (Ø43) sits fully below the surface.",
        "Felt disc under the liner, to protect the venue floor.",
        "Frame battens either side of the cup."]))
    # D3b rail along a bevel
    v = dview(-50, -45, 760, 205, 5)
    floor(v, -50, 760)
    v.pline([(-50, 10), (200, 10), (500, 67), (760, 67)], stroke="#2F5B2A", sw=0.55)
    v.rect(-50, 0, 200, 6, fill="#3A3A3A", sw=0.1)
    v.rect(-50, 6, 200, 101, fill=C["timber"], sw=0.35)
    v.poly([(200, 6), (500, 6), (500, 57)], fill="#E9DCC2", sw=0.3)
    v.poly([(200, 6), (500, 57), (500, 152), (200, 101)], fill=C["timber"], sw=0.35)
    v.rect(500, 57, 760, 152, fill=C["timber"], sw=0.35)
    v.rect(500, 0, 760, 57, fill="#EFE7D6", sw=0.2)
    v.dim((350, 38), (350, 127), -4, "≈ 88")
    callout(v, 1, 420, 25, 420, 185)
    callout(v, 2, 300, 100, 250, 185)
    callout(v, 3, 200, 60, 90, 185)
    out.append(("D3b · RAIL BESIDE A BEVEL (elevation)", v, [
        "Where the surface ramps up, the rail rides up on a tapered packer.",
        "So the sloped rail stays about 85 above the ball the whole way.",
        "Joints at both ends of the sloped piece, over a plate (D4)."]))
    return out


def details_b():
    out = []
    # D4a straight joint (plan)
    v = View(-80, -130, 700, 410, 10)
    v.rect(160, 0, 460, 300, fill="#EFE7D6", stroke=C["soft"], sw=0.25, dash=(1.0, 0.6))
    v.rect(-60, 0, 310, 45, fill=C["timber"], sw=0.4)
    v.rect(310, 0, 680, 45, fill=C["timber"], sw=0.4)
    for x in (200, 260, 360, 420):
        v.circle(x, 22, 7, fill=C["ink"], sw=0.1)
    v.line((250, 22), (370, 22), stroke=C["ink"], sw=0.25, dash=(0.8, 0.5))
    v.dim((160, 300), (460, 300), -4, "300")
    callout(v, 1, 310, 22, 310, -95)
    callout(v, 2, 400, 200, 560, 200)
    callout(v, 3, 200, 22, 120, -95)
    out.append(("D4a · STRAIGHT RAIL JOINT (plan)", v, [
        "Rail ends meet over a plate; a dowel or connector bolt keeps them in line and lets the hole come apart.",
        "Plate 300 × 300 × 6 under the surface.",
        "Two screws up through the plate into each rail end."]))
    # D4b corner (plan)
    v = View(-90, -90, 600, 600, 10)
    v.rect(0, 0, 300, 300, fill="#EFE7D6", stroke=C["soft"], sw=0.25, dash=(1.0, 0.6))
    v.rect(0, 0, 560, 45, fill=C["timber"], sw=0.4)
    v.rect(0, 45, 45, 560, fill=C["timber"], sw=0.4)
    v.poly([(45, 45), (145, 45), (45, 145)], fill=C["timber"], sw=0.4)
    callout(v, 1, 22, 22, -55, -55)
    callout(v, 2, 75, 75, 260, 160)
    callout(v, 3, 220, 240, 420, 420)
    out.append(("D4b · CORNER (plan)", v, [
        "Butt joint, screwed; label both rails.",
        "Fill every inside corner with a 100 × 100 block so no ball can wedge.",
        "Corner plate underneath."]))
    # D5 tee end step-in
    v = dview(-60, -40, 1760, 170, 20)
    floor(v, -60, 1680)
    v.rect(0, 0, 45, 95, fill=C["timber"], sw=0.3)
    v.rect(1555, 0, 1600, 95, fill=C["timber"], sw=0.3)
    v.rect(45, 0, 1555, 40, fill="#C9C9C9", sw=0.3)
    v.dim((1600, 0), (1600, 40), -4, "40")
    callout(v, 1, 800, 40, 800, 140)
    out.append(("D5 · TEE END STEP-IN (from the tee)", v, [
        "A low rail at the tee end (45 × 45 laid flat, top edge rounded), so players step in rather than over a full rail. LED strip on its outside face too."]))
    # D6 weighted base
    v = dview(-80, -60, 1050, 1300, 20)
    floor(v, -80, 1050)
    v.rect(0, 0, 600, 300, fill=C["prop"], sw=0.35)
    v.rect(60, 18, 280, 140, fill="#D8C9A3", sw=0.2)
    v.rect(320, 18, 540, 140, fill="#D8C9A3", sw=0.2)
    v.rect(255, 300, 300, 1250, fill=C["timber"], sw=0.3)
    v.line((300, 900), (580, 300), sw=0.6)
    v.dim((0, 0), (600, 0), -5, "600")
    v.dim((600, 0), (600, 300), -5, "300")
    callout(v, 1, 520, 260, 850, 260)
    callout(v, 2, 170, 80, 850, 60)
    callout(v, 3, 440, 600, 850, 600)
    callout(v, 4, 277, 1100, 850, 1100)
    out.append(("D6 · WEIGHTED PROP BASE", v, [
        "Box 600 × 600 × 300, 18 mm ply, screw-on lid.",
        "At least 30 kg ballast (two 15 kg sandbags) per prop up to 2.5 m.",
        "45° brace from the prop to the box.",
        "Prop screwed into the box. You confirm each prop can't be pulled over."]))
    # D7 totem
    v = dview(-480, -60, 560, 2260, 25)
    floor(v, -480, 560)
    v.rect(-200, 0, 200, 150, fill=C["prop"], sw=0.3)
    v.rect(-22, 150, 22, 2100, fill=C["timber"], sw=0.3)
    v.rect(-300, 1950, 300, 2100, fill="#1B5E3B", sw=0.3)
    v.rect(-300, 1780, 300, 1930, fill="#1B5E3B", sw=0.3)
    v.circle(0, 1400, 150, fill="#FF2E4D", sw=0.3)
    v.text(0, 1400, "8", 3.6, fill="#FFFFFF", weight="700")
    v.dim((300, 0), (300, 2100), -6, "2100")
    callout(v, 1, -200, 2025, -400, 2025)
    callout(v, 2, -120, 1400, -400, 1400)
    callout(v, 3, 0, 800, -400, 800)
    callout(v, 4, -150, 75, -400, 300)
    out.append(("D7 · TOTEM ×10", v, [
        "Street blades: 6 mm, 600 × 150, green with white letters.",
        "Bullet Ø300 in the hole's colour, number in white.",
        "Post 45 × 45 (or 70 × 70), 2100 tall.",
        "Base box 400 × 400 × 150 with one sandbag."]))
    # D8 pun sign
    v = dview(-760, -60, 900, 1920, 25)
    floor(v, -760, 820)
    for sx in (-1, 1):
        v.rect(sx * 500 - 22, 0, sx * 500 + 22, 1700, fill=C["timber"], sw=0.3)
        v.rect(sx * 500 - 150, 0, sx * 500 + 150, 60, fill=C["prop"], sw=0.25)
    v.rect(-575, 1250, 575, 1700, fill="#1D1D1B", sw=0.3)
    v.text(0, 1475, "TAKE A BITE", 2.6, fill="#FF6F86", weight="700")
    v.dim((-575, 1700), (575, 1700), 4, "1150")
    v.dim((575, 1250), (575, 1700), -4, "450")
    v.dim((700, 0), (700, 1700), -3, "1700")
    callout(v, 1, -450, 1300, -680, 1000)
    callout(v, 2, -500, 700, -680, 700)
    callout(v, 3, -400, 30, -680, 300)
    out.append(("D8 · PUN SIGN ×10", v, [
        "Board 9 mm, 1150 × 450, black; the pun is painted or LED neon flex (fitted by our LED lead).",
        "Posts 45 × 45, 1700 tall.",
        "Feet 300 × 60 with a sandbag. Stands behind the hole's end rail."]))
    # D9 flats
    v = dview(-40, -45, 860, 115, 10)
    v.rect(0, 0, 800, 6, fill="#E9DCC2", sw=0.3)
    v.rect(0, 51, 800, 57, fill="#E9DCC2", sw=0.3)
    for x in (0, 380, 755):
        v.rect(x, 6, x + 45, 51, fill=C["timber"], sw=0.25)
    callout(v, 1, 200, 54, 200, 95)
    callout(v, 2, 402, 28, 560, 95)
    out.append(("D9 · CUT-OUTS AND FLATS (section)", v, [
        "Two 6 mm skins glued and pinned to the frame: apple, car front, backdrop, tower, skyline flats.",
        "45 × 45 frame, members ≤ 600 apart. Single-skin flats (cart front, proscenium, billboards): one 9 or 12 mm sheet with the frame on the back. Fill and sand the edges."]))
    return out


# ------------------------------------------------------------------ materials
def materials(holes):
    rail_m = sum(h["rail_m"] for h in holes)
    green_m2 = sum(h["green_m2"] for h in holes)
    bevel_m2 = sum(h["bevel_m2"] for h in holes)
    plates = sum(h["plates"] for h in holes)
    sheet = 2.44 * 1.22
    green_sheets = math.ceil((green_m2 + bevel_m2) * 1.2 / sheet)
    plate_sheets = math.ceil(plates * 0.3 * 0.25 * 1.15 / sheet)
    frame_m = math.ceil((green_m2 * 3.3 + bevel_m2 * 3.3 + 2.5 * len(holes)) * 1.1)
    rail_len = math.ceil(rail_m * 1.12 / 2.4)
    rows = [
        ("Rail timber 45 × 95 (\"2 × 4\"), dressed, straight, 2.4 m lengths", f"{rail_len} lengths (≈ {rail_m:.0f} m + 12%)", "Rails; hot dog; channel walls; tee step-ins", "Choose the straightest; a bowed rail won't sit flat"),
        ("Batten 45 × 45 (\"2 × 2\"), 2.4 m lengths", f"≈ {math.ceil((frame_m + 160) / 2.4)} lengths (≈ {frame_m + 160} m)", f"Green frames (≈ {frame_m} m) · prop frames, totem and sign posts, booth (≈ 160 m)", ""),
        ("Plywood 12 mm, 2440 × 1220", f"{green_sheets + 5} sheets", f"Raised greens and bevels (≈ {green_m2 + bevel_m2:.1f} m² → {green_sheets}) · cart front, torch, clock disc (≈ 5)", "Commercial grade is fine (one night, painted)"),
        ("Plywood 18 mm", "6 sheets", "Subway wall · prop bases (D6) · tower base · totem bases", ""),
        ("Plywood 9 mm", "9 sheets", "Proscenium (2) · billboards (2) · Tee Booth (2) · pun signs (2) · spare (1)", ""),
        ("Plywood or hardboard 6 mm", f"{18 + plate_sheets} sheets", f"Apple (2) · car front (2) · backdrop (2) · tower skin (2) · skyline flats (8) · skaters and street blades (2) · hidden plates ({plates} → {plate_sheets})", "Skyline flats can drop to 2 (saves 4 sheets)"),
        ("Rubber strip 6 × 45 mm (non-slip)", f"≈ {math.ceil(rail_m * 0.8)} m", "Under floor-level rails between plates", ""),
        ("PVC drain pipe 110 mm", "1 m", "Ten cup liners, 57 long", ""),
        ("Screws: 30, 40, 50 and 75 mm (countersunk, for ply and timber)", "≈ 6 boxes of 200", "", "Exact mix at the prototype"),
        ("Corner brackets, connector bolts and dowels", "≈ 60 sets", "Rail joints and take-apart props", ""),
        ("Wood glue, filler, sandpaper (80/120)", "as needed", "", ""),
        ("Sandbags, 15 kg", "≈ 40", "Prop bases (12) · totems (10) · signs (10) · flats (8)", "Fill at the venue if possible: ≈ 600 kg to carry otherwise"),
        ("Felt pads (adhesive)", "≈ 60", "Under cup liners, props and anything touching the venue floor", ""),
    ]
    totals = dict(rail_m=rail_m, green_m2=green_m2, bevel_m2=bevel_m2, plates=plates, green_sheets=green_sheets, plate_sheets=plate_sheets,
                  frame_m=frame_m, rail_len=rail_len)
    return rows, totals


# ------------------------------------------------------------------ sheets
SHEET_W, SHEET_H = 420, 297


def title_block(no, total, title, scale_note):
    return f'''<div class="tb">
  <div class="tb-proj"><b>Countdown party mini golf · 31 Dec 2026</b><br>Route C: one carpenter, volunteers paint · carpenter's pack</div>
  <div class="tb-title"><span>Sheet</span><b>{H.escape(title)}</b></div>
  <div class="tb-cell"><span>Scale at A3</span><b>{H.escape(scale_note)}</b></div>
  <div class="tb-cell"><span>Date · rev</span><b>{DATE} · {REV}</b></div>
  <div class="tb-cell"><span>Sheet</span><b>{no + 1} of {total + 1}</b></div>
  <div class="tb-warn">Design intent for quoting and the prototype. Not engineered. Dimensions in mm; don't scale off the drawing. Check on site.</div>
</div>'''


def view_block(x, y, title, v):
    return (f'<div class="view" style="left:{x:.1f}mm;top:{y:.1f}mm;width:{v.pw:.1f}mm">{v.svg()}'
            f'<div class="vt">{H.escape(title)} <span>· 1:{v.s:g}</span></div></div>')


def sheet(no, total, title, scale_note, body):
    return f'<section class="sheet">{body}{title_block(no, total, title, scale_note)}</section>'


def hole_sheet(no, total, h):
    AW, AH = 268, 250
    body = []
    pv = plan_view(h, AW, 122)
    body.append(view_block(10, 10, f"PLAN · HOLE {h['n']}", pv))
    y_el = 10 + pv.ph + 9
    ev = elev_views(h, AW, 262 - y_el - 6)
    x, rowh = 10, 0
    scales = [pv.s]
    for t, v in ev:
        if x + v.pw > 10 + AW + 2:
            x, y_el, rowh = 10, y_el + rowh + 11, 0
        body.append(view_block(x, y_el, t, v))
        if y_el + v.ph > 264:
            print(f"warning: hole {h['n']} view '{t}' runs off the sheet ({y_el + v.ph:.0f} mm)")
        x += v.pw + 8
        rowh = max(rowh, v.ph)
        scales.append(v.s)
    key = "".join(f'<tr><td class="k"><span class="tg">{H.escape(t)}</span></td><td>{H.escape(d)}</td></tr>' for t, d in h["key"])
    notes = "".join(f"<li>{H.escape(n)}</li>" for n in h["notes"])
    gap = "no free-standing obstacles" if h["min_gap"] is None else f"smallest open gap {h['min_gap']:.0f} mm (rule: closed or ≥ 250)"
    cup = "Mouth in the end rail (no cup)" if not h.get("cup") else f"Cup at x {h['cup'][0]:.0f}, y {h['cup'][1]:+.0f} (D3)"
    side = f'''<aside class="side">
  <div class="hn" style="--glow:{h['glow']}"><span>{h['n']}</span><div><b>{H.escape(h['name'])}</b><i>"{H.escape(h['sign'])}"</i></div></div>
  <p class="meta">{h['cls']} · par {h['par']} · {h['L']} × {h['W']} · carpenter ≈ {h['days']:g} day{'s' if h['days'] != 1 else ''} (plus its rails and green)</p>
  <p class="meta"><b>Surface:</b> {H.escape(h['surface_name'])}. <b>{cup}.</b> Tee mat 300 × 300 at x 300.</p>
  <table class="key">{key}</table>
  <ul class="notes">{notes}</ul>
  <p class="meta"><b>Standard parts:</b> rails D1/D2, joints D4, tee end D5, green and bevel D3.</p>
  <p class="meta"><b>Checked by script:</b> {gap}. Setting out: x from the outer face of the tee-end rail; y from the lane centreline (+y drawn down).</p>
</aside>'''
    body.append(side)
    sc = sorted(set(scales), key=lambda s: SCALES.index(s))
    return sheet(no, total, f"Hole {h['n']} · {h['name']}", " · ".join(f"1:{s}" for s in sc), "".join(body))


def cover_sheet(no, total, index):
    rows = "".join(f"<tr><td>{n + 1}</td><td>{H.escape(t)}</td></tr>" for n, t in index)
    notes = [
        "<b>What this is.</b> Ten mini golf holes for one night (31 Dec 2026), laid on an auditorium floor, built by one carpenter and painted and dressed by volunteers. These drawings show what we want and the key sizes. Please check them, tell us what you'd change, and quote.",
        "<b>Units and setting out.</b> Millimetres. Each hole is drawn with its tee on the left. x is measured along the lane from the outer face of the tee-end rail; y across from the lane centreline. Sheet 2 shows where each hole sits.",
        "<b>Nothing is fixed to the venue floor.</b> Everything sits on the floor (felt or rubber underneath) and is held by its own weight, hidden plates under the playing surface, and sandbags.",
        "<b>Every piece</b> ≤ 2440 long, ≤ 35 kg (two people carry it), fits through the load-in doors (width to be confirmed), and is labelled with hole and part, e.g. H7-R3 (hole 7, rail 3).",
        "<b>Playing rules.</b> Rails stand at least 85 above the playing surface everywhere, including on bevels and raised greens. Any gap between two things a ball can reach is either closed or at least 250. Inside corners are filled. Nowhere can a ball stop out of a putter's reach.",
        "<b>Safety.</b> All edges eased, no sharp corners; screws countersunk; nothing sticks out. Anything over 2 m is braced and ballasted so it can't be pulled over (you confirm). Nothing hangs over a walkway below 2.1 m.",
        "<b>Finish.</b> Deliver paint-ready: filled, sanded, edges rounded. Volunteers prime and paint. Mark faces that show.",
        "<b>Electrics.</b> Low voltage only (24 V LED strip, fitted by our LED lead). Leave a 15 × 15 rebate along the outside bottom edge of every rail for the strip (D1). No mains wiring by the carpenter.",
        "<b>Playing surface.</b> 10 mm carpet grass, needle-punch and white felt, laid by volunteers inside the rails. Allow 10 on top of floors and greens.",
        "<b>Dates.</b> Prototype hole by Fri 4 Dec (we test it); all holes by Fri 18 Dec for a dry-run assembly; install Mon 28 – Tue 29 Dec at the venue.",
        "<b>Still to confirm (by us).</b> Door widths and load-in route; floor finish and flatness; ceiling and rig height for props over 2.4 m; workshop address and hours.",
        "<b>Drawn by</b> the event team with an AI assistant, from the 3D concept. Treat every dimension as a target to check, not a promise.",
    ]
    nl = "".join(f"<li>{n}</li>" for n in notes)
    body = f'''<div class="cover">
  <div class="cv-l">
    <h1>Countdown party mini golf</h1>
    <p class="sub">Ten New York holes · one night · 31 Dec 2026<br><b>Carpenter's pack</b> (route C: one carpenter; volunteers paint and dress)</p>
    <h2>General notes</h2><ol class="gn">{nl}</ol>
    <h2>How a hole goes together</h2>
    <ol class="gn">
      <li>Rails, joined into one closed frame per hole, sit on hidden plates under the playing surface (D1, D4).</li>
      <li>A raised green at the cup end, with the rail screwed on top of it and a 1:5 bevel in front (D2, D3, D3b).</li>
      <li>Volunteers lay the playing surface inside the rails.</li>
      <li>Obstacles screw down through the surface into plates, so nothing can be knocked loose.</li>
      <li>Big props stand outside the rails on weighted bases (D6), so nobody leans on them while putting.</li>
      <li>The LED strip goes in the rebate on the outside bottom edge of the rail, in the hole's colour.</li>
    </ol>
  </div>
  <div class="cv-r">
    <h2>Sheets</h2><table class="idx">{rows}</table>
    <h2>Legend</h2>
    <div class="legend">
      <div><i style="background:{C['rail']}"></i>Rail 45 × 95 on edge</div>
      <div><i style="background:{C['green']}"></i>Green carpet grass</div>
      <div><i style="background:repeating-linear-gradient(45deg,#4C7A3F 0 0.3mm,transparent 0.3mm 2.2mm),{C['green']}"></i>Raised green +65 (D2, D3)</div>
      <div><i style="background:repeating-linear-gradient(-45deg,#7A5A2A 0 0.25mm,transparent 0.25mm 0.9mm)"></i>Bevel 1:5 up</div>
      <div><i style="background:{C['timber']}"></i>Timber obstacle</div>
      <div><i style="background:{C['prop']};border-style:dashed"></i>Prop outside the rails</div>
      <div><i style="background:#9A9A9A"></i>Low step-in rail at the tee (D5)</div>
      <div><span class="tg">A</span> Key to the notes on each sheet</div>
      <div><span class="dimx">1200</span> Dimension (mm)</div>
    </div>
  </div>
</div>'''
    return sheet(no, total, "Cover, general notes and index", "—", body)


def site_sheet(no, total):
    import base64
    img = "data:image/png;base64," + base64.b64encode(open(os.path.join(ROOT, "floorplan", "layout-v3-nyc.png"), "rb").read()).decode()
    body = f'''<div class="site">
  <img src="{img}" alt="Layout v3: ten holes in two districts beside the runway, with the Tee Booth at the runway tip">
  <aside class="side">
    <h3>Where the holes go</h3>
    <p>Layout v3 from the event plan. The holes keep these footprints in route C. Downtown (holes 10–6) is on one side of the stage runway, Midtown (5–1) on the other; both loop back to the Tee Booth past the runway tip.</p>
    <p><b>Positions are ±1 m</b> until the stage depth and stair positions are measured. We'll set out the holes on site with you on 28 Dec.</p>
    <p><b>Clearances the layout keeps:</b> holes ≥ 1.2 m apart; walkways ≥ 1.2 m; ≥ 1.75 m from the runway side; props over 2 m kept out of the sound desk's sightline.</p>
    <p><b>Floor:</b> finish and flatness to be confirmed. Floor-laid holes take the floor's shape: if it isn't flat, we shim under greens and plates.</p>
    <p><b>Load-in:</b> door widths and route to be confirmed. Pieces ≤ 2440 long.</p>
  </aside>
</div>'''
    return sheet(no, total, "Site plan (layout v3)", "not to scale", body)


def detail_block(x, y, title, v, notes):
    w = max(v.pw, 72)
    lines = sum(max(1, math.ceil(len(n) * 1.25 / (w - 6))) for n in notes)
    li = "".join(f"<li>{H.escape(n)}</li>" for n in notes)
    html = (f'<div class="view" style="left:{x:.1f}mm;top:{y:.1f}mm;width:{w:.1f}mm">{v.svg()}'
            f'<div class="vt">{H.escape(title)} <span>· 1:{v.s:g}</span></div><ol class="dn">{li}</ol></div>')
    return html, w, v.ph + 6 + lines * 3.55 + 2


def details_sheet(no, total, title, items, rows):
    body = []
    y = 10
    for row in rows:
        x, rowh = 10, 0
        for i in row:
            t, v, notes = items[i]
            html, w, hgt = detail_block(x, y, t, v, notes)
            body.append(html)
            x += w + 9
            rowh = max(rowh, hgt)
        y += rowh + 7
    if y > 268:
        print(f"warning: {title} runs to {y:.0f} mm")
    sc = sorted(set(v.s for _, v, _ in items))
    return sheet(no, total, title, " · ".join(f"1:{s:g}" for s in sc), "".join(body))


def booth_sheet(no, total):
    views = []
    v = View(-1250, -220, 1400, 2420, 25, elev=True)
    floor(v, -1250, 1400)
    v.rect(-900, 0, 900, 1050, fill="#F2B5B5", sw=0.4)
    v.rect(-900, 900, 900, 1050, fill="#C8273A", sw=0.3)
    for s in (-1, 1):
        v.rect(s * 860 - 22, 1050, s * 860 + 22, 2200, fill=C["timber"], sw=0.3)
    v.rect(-900, 1800, 900, 2200, fill="#1D1D1B", sw=0.3)
    v.text(0, 2000, "NEW YORK · 11:59", 3.4, fill="#FF6F86", weight="700")
    v.text(0, 500, "TEE BOOTH", 3.0, fill="#8A1C2B", weight="700")
    v.dim((-900, 0), (900, 0), -5, "1800")
    v.dim((900, 0), (900, 1050), -5, "1050")
    v.dim((1000, 0), (1000, 2200), -10, "2200")
    v.dim((-900, 1800), (-900, 2200), 5, "400")
    views.append(("TEE BOOTH FRONT", v))
    v2 = View(-1100, -950, 1300, 300, 25)
    v2.rect(-900, -600, 900, -555, fill=C["timber"], sw=0.3)
    v2.rect(-900, -555, -855, 0, fill=C["timber"], sw=0.3)
    v2.rect(855, -555, 900, 0, fill=C["timber"], sw=0.3)
    v2.rect(-750, -555, 750, -50, fill="none", stroke=C["soft"], sw=0.25, dash=(1.2, 0.8))
    v2.text(0, -300, "borrowed table behind the front", 1.8, fill=C["soft"])
    v2.text(0, 150, "PARTY SIDE", 1.8, fill=C["soft"])
    v2.dim((-900, -600), (900, -600), 5, "1800")
    v2.dim((900, -600), (900, 0), -5, "600")
    views.append(("TEE BOOTH PLAN", v2))
    v3 = View(-100, -200, 2800, 2560, 25, elev=True)
    floor(v3, -100, 2800)
    grid(v3, 0, 0, 2440, 2440, 200)
    sky = [(0, 0), (0, 1300), (300, 1300), (300, 1700), (520, 1700), (520, 1450), (760, 1450), (760, 2050), (840, 2050), (870, 2400), (900, 2050),
           (980, 2050), (980, 1500), (1250, 1500), (1250, 1850), (1500, 1850), (1500, 1250), (1700, 1250), (1700, 1650), (1760, 1650), (1760, 1800),
           (1900, 1800), (1900, 1650), (2000, 1650), (2000, 1100), (2440, 1100), (2440, 0)]
    v3.poly(sky, fill="#D9DCEA", sw=0.4)
    for k in range(26):
        x, z = 80 + (k * 211) % 2280, 150 + (k * 137) % 1000
        v3.rect(x, z, x + 50, z + 70, fill="#FFE7A0", sw=0.08)
    v3.dim((0, 0), (2440, 0), -5, "2440 (two 6 mm sheets)")
    v3.dim((2440, 0), (2440, 2440), -5, "max 2440")
    views.append(("SKYLINE FLAT ×4 (sample outline on a 200 grid; art lead supplies the final)", v3))
    body = []
    x = 10
    for t, vv in views[:2]:
        body.append(view_block(x, 10, t, vv))
        x += vv.pw + 10
    body.append(view_block(10, 10 + views[0][1].ph + 14, views[2][0], views[2][1]))
    body.append('''<aside class="side" style="top:10mm">
  <h3>Tee Booth and skyline flats</h3>
  <p><b>Tee Booth:</b> a red front (9 mm on a 45 × 45 frame) round a borrowed table, two side returns 600 deep, and a header sign on two posts. Screw the front to the table or sandbag it. Volunteers paint; the LED lead fits neon flex to the header.</p>
  <p><b>Skyline flats ×4:</b> two 6 mm sheets on a 45 × 45 frame (D9), cut to the art lead's outline, on two braces with sandbag bases (D6). Two go behind the Tee Booth, one at the far end of each district.</p>
  <p>Windows are painted (or small LED behind cut-outs, if time allows).</p>
</aside>''')
    return sheet(no, total, "Tee Booth and skyline flats", "1:25", "".join(body))


def materials_sheet(no, total, holes, rows, tot):
    per = "".join(f"<tr><td>{h['n']}</td><td>{H.escape(h['name'])}</td><td>{h['rail_m']:.1f}</td><td>{h['green_m2'] + h['bevel_m2']:.2f}</td><td>{h['plates']}</td><td>{h['days']:g}</td></tr>" for h in holes)
    mats = "".join(f"<tr><td>{H.escape(a)}</td><td>{H.escape(b)}</td><td>{H.escape(c)}</td><td>{H.escape(d)}</td></tr>" for a, b, c, d in rows)
    body = f'''<div class="mat">
  <div>
    <h3>Materials (estimate, worked out from these drawings)</h3>
    <table class="m"><tr><th>Item</th><th>Quantity</th><th>For</th><th>Note</th></tr>{mats}</table>
    <p class="small">Quantities include about 10–20% waste. Please check them and tell us if you'd buy differently. Tell us whether you'll buy the timber or we should.</p>
  </div>
  <div>
    <h3>Per hole (from the drawings)</h3>
    <table class="m"><tr><th>#</th><th>Hole</th><th>Rail m</th><th>Green + bevel m²</th><th>Plates</th><th>Days (props)</th></tr>{per}
      <tr class="tot"><td></td><td>Total</td><td>{tot['rail_m']:.0f}</td><td>{tot['green_m2'] + tot['bevel_m2']:.1f}</td><td>{tot['plates']}</td><td>{sum(h['days'] for h in holes):g}</td></tr></table>
    <p class="small">Plus about 2 days for all rails and greens, 0.5 for the Tee Booth, 0.25 for totem and sign jigs, then 1 day at the dry run and 1 at the install: about 12 days in all.</p>
    <h3>Please tell us</h3>
    <ol class="q">
      <li>Your day rate and how many days you estimate.</li>
      <li>Which days you're free between 30 Nov and 29 Dec.</li>
      <li>What you'd change in these drawings to make it quicker, cheaper or stronger.</li>
      <li>Whether you bring your own tools, and what you need from us (space, power, a helper).</li>
      <li>Whether you'll buy the materials, and your timber merchant.</li>
      <li>Photos of 2–3 things you've built.</li>
    </ol>
    <h3>Who does what</h3>
    <table class="m"><tr><th>Carpenter</th><th>Our team</th></tr>
      <tr><td>Cut lists, rails, greens, props, jigs, the prototype; leads the dry run and install; labels every piece</td><td>Workshop space, a helper each day, painting, LED, surfaces, printing, transport, sandbags, sign-off</td></tr></table>
  </div>
</div>'''
    return sheet(no, total, "Materials, questions and who does what", "—", body)


CSS = f"""
@page {{ size: A3 landscape; margin: 0; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; background: #8E8E8A; font-family: {FONT}; color: {C['ink']}; }}
.sheet {{ position: relative; width: {SHEET_W}mm; height: {SHEET_H}mm; background: #fff; margin: 6mm auto; overflow: hidden; page-break-after: always; break-after: page; }}
.sheet::before {{ content: ""; position: absolute; inset: 5mm; border: 0.5mm solid {C['ink']}; pointer-events: none; }}
@media print {{ html, body {{ background: #fff; }} .sheet {{ margin: 0; }} }}
.view {{ position: absolute; }}
.view svg {{ display: block; }}
.vt {{ font-size: 2.9mm; font-weight: 700; letter-spacing: .02em; margin-top: 0.6mm; }}
.vt span {{ font-weight: 400; color: {C['soft']}; }}
ol.dn {{ margin: 1.2mm 0 0; padding-left: 4.5mm; font-size: 2.6mm; line-height: 1.36; }}
ol.dn li {{ margin-bottom: 0.4mm; }}
.tb {{ position: absolute; left: 5mm; right: 5mm; bottom: 5mm; height: 20mm; display: grid; grid-template-columns: 92mm 1fr 34mm 40mm 22mm; grid-template-rows: 13mm 7mm; border-top: 0.5mm solid {C['ink']}; font-size: 2.7mm; }}
.tb > div {{ border-right: 0.25mm solid {C['ink']}; padding: 1.2mm 2mm; }}
.tb span {{ display: block; font-size: 2.1mm; color: {C['soft']}; text-transform: uppercase; letter-spacing: .05em; }}
.tb b {{ font-size: 3.6mm; }}
.tb .tb-proj b {{ font-size: 2.9mm; }}
.tb .tb-proj {{ line-height: 1.35; }}
.tb-warn {{ grid-column: 1 / -1; border-top: 0.25mm solid {C['ink']}; font-size: 2.3mm; color: #8A1C2B; padding: 1.2mm 2mm !important; }}
.side {{ position: absolute; left: 285mm; top: 10mm; width: 125mm; font-size: 2.75mm; line-height: 1.38; }}
.side h3 {{ margin: 0 0 1.5mm; font-size: 3.6mm; }}
.side p {{ margin: 0 0 1.8mm; }}
.hn {{ display: flex; gap: 3mm; align-items: center; margin-bottom: 2mm; }}
.hn > span {{ width: 13mm; height: 13mm; border-radius: 50%; background: var(--glow); border: 0.5mm solid {C['ink']}; display: grid; place-items: center; font-weight: 800; font-size: 6mm; }}
.hn b {{ display: block; font-size: 5mm; }}
.hn i {{ font-size: 3.2mm; color: {C['soft']}; }}
.meta {{ margin: 0 0 1.6mm; }}
table.key {{ border-collapse: collapse; width: 100%; margin: 1mm 0 2mm; }}
table.key td {{ border-top: 0.2mm solid #CFCFC9; padding: 1mm 1mm; vertical-align: top; }}
td.k {{ width: 7mm; }}
.tg {{ display: inline-grid; place-items: center; width: 4.6mm; height: 4.6mm; border-radius: 50%; border: 0.3mm solid {C['ink']}; font-weight: 700; font-size: 2.6mm; background: #fff; }}
ul.notes {{ margin: 0 0 2mm 4mm; padding: 0; }}
ul.notes li {{ margin-bottom: 1mm; }}
.cover {{ position: absolute; left: 12mm; top: 12mm; right: 12mm; bottom: 30mm; display: grid; grid-template-columns: 1fr 112mm; gap: 12mm; }}
.cover h1 {{ font-size: 11mm; margin: 0 0 2mm; letter-spacing: -0.02em; }}
.cover h2 {{ font-size: 4.2mm; margin: 4mm 0 2mm; border-bottom: 0.3mm solid {C['ink']}; padding-bottom: 1mm; }}
.cover .sub {{ font-size: 4.2mm; margin: 0 0 3mm; line-height: 1.35; }}
ol.gn {{ margin: 0; padding-left: 5mm; font-size: 2.95mm; line-height: 1.38; }}
ol.gn li {{ margin-bottom: 1.4mm; }}
table.idx {{ border-collapse: collapse; font-size: 3mm; width: 100%; }}
table.idx td {{ padding: 0.9mm 1.5mm; border-top: 0.2mm solid #CFCFC9; }}
.legend {{ display: grid; gap: 1.6mm; font-size: 2.9mm; }}
.legend i {{ display: inline-block; width: 9mm; height: 4.5mm; border: 0.3mm solid {C['ink']}; vertical-align: middle; margin-right: 2mm; }}
.dimx {{ display: inline-block; width: 11mm; border-top: 0.3mm solid {C['dim']}; color: {C['dim']}; font-size: 2.4mm; text-align: center; margin-right: 2mm; }}
.site img {{ position: absolute; left: 10mm; top: 10mm; width: 268mm; height: 252mm; object-fit: contain; object-position: left top; }}
.mat {{ position: absolute; left: 10mm; top: 10mm; right: 10mm; bottom: 30mm; display: grid; grid-template-columns: 1.25fr 1fr; gap: 10mm; font-size: 2.75mm; }}
.mat h3 {{ font-size: 3.8mm; margin: 0 0 2mm; }}
table.m {{ border-collapse: collapse; width: 100%; margin-bottom: 2.5mm; }}
table.m th {{ text-align: left; font-size: 2.4mm; text-transform: uppercase; letter-spacing: .04em; color: {C['soft']}; border-bottom: 0.3mm solid {C['ink']}; padding: 0.8mm 1mm; }}
table.m td {{ border-top: 0.2mm solid #CFCFC9; padding: 1mm; vertical-align: top; }}
tr.tot td {{ font-weight: 700; border-top: 0.4mm solid {C['ink']}; }}
.small {{ font-size: 2.5mm; color: {C['soft']}; margin: 0 0 3mm; }}
ol.q {{ margin: 0 0 3mm; padding-left: 5mm; }}
"""


def main():
    problems = []
    for h in HOLES:
        problems += build(h)
    if problems:
        print("Playing-rule check failed:\n  " + "\n  ".join(problems))
        sys.exit(1)
    rows, tot = materials(HOLES)
    total = 4 + len(HOLES) + 3
    index = [(0, "Cover, general notes and index"), (1, "Site plan (layout v3)"), (2, "Standard details A: rails, greens, bevel and cup"),
             (3, "Standard details B: joints, tee end, bases, totem, sign, flats")]
    index += [(4 + i, f"Hole {h['n']} · {h['name']}") for i, h in enumerate(HOLES)]
    index += [(4 + len(HOLES), "Tee Booth and skyline flats"), (5 + len(HOLES), "Materials, questions and who does what")]
    total = len(index) - 1
    sheets = [cover_sheet(0, total, index), site_sheet(1, total),
              details_sheet(2, total, "Standard details A: rails, greens, bevel and cup", details_a(), [[0, 1], [2, 3]]),
              details_sheet(3, total, "Standard details B: joints, tee end, bases, totem, sign, flats", details_b(), [[0, 1, 2, 6], [3, 4, 5]])]
    for i, h in enumerate(HOLES):
        sheets.append(hole_sheet(4 + i, total, h))
    sheets.append(booth_sheet(4 + len(HOLES), total))
    sheets.append(materials_sheet(5 + len(HOLES), total, HOLES, rows, tot))
    os.makedirs(OUT, exist_ok=True)
    page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mini golf carpenter's pack</title><style>{CSS}</style></head>
<body>{"".join(sheets)}</body></html>'''
    html_path = os.path.join(OUT, "carpenter-pack.html")
    open(html_path, "w").write(page)
    summary = dict(rail_m=round(tot["rail_m"], 1), green_and_bevel_m2=round(tot["green_m2"] + tot["bevel_m2"], 1), plates=tot["plates"],
                   rail_lengths=tot["rail_len"], green_sheets_12mm=tot["green_sheets"], frame_batten_m=tot["frame_m"],
                   holes={h["n"]: dict(rail_m=round(h["rail_m"], 1), green_bevel_m2=round(h["green_m2"] + h["bevel_m2"], 2), min_gap_mm=None if h["min_gap"] is None else round(h["min_gap"])) for h in HOLES})
    json.dump(summary, open(os.path.join(OUT, "quantities.json"), "w"), indent=1)
    print(f"wrote {os.path.relpath(html_path, ROOT)}  ({len(sheets)} sheets)")
    print(json.dumps({k: v for k, v in summary.items() if k != "holes"}))
    for n, d in summary["holes"].items():
        print(f"  hole {n}: {d}")
    if "--pdf" in sys.argv:
        pdf = os.path.join(OUT, "countdown-golf-carpenter-pack.pdf")
        with tempfile.TemporaryDirectory() as td:
            js = os.path.join(td, "p.js")
            open(js, "w").write(
                "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();"
                f"await p.goto('file://{html_path}');await p.emulateMedia({{media:'print'}});"
                f"await p.pdf({{path:{json.dumps(pdf)},width:'420mm',height:'297mm',printBackground:true,margin:{{top:'0',right:'0',bottom:'0',left:'0'}}}});await b.close();}})();")
            subprocess.run(["node", js], check=True)
        print(f"wrote {os.path.relpath(pdf, ROOT)}")


if __name__ == "__main__":
    main()
