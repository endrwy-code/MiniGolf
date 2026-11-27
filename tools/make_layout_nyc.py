#!/usr/bin/env python3
"""Layout v3, "New York Countdown": 10 holes inside the golf zone, on the v2 (18 Nov) geometry.

Usage:
    python3 tools/make_layout_nyc.py floorplan/auditorium-dimensions.json floorplan [--png] [--inject status/countdown-golf-3d.html]

Writes floorplan/layout-v3-nyc.svg (and .png with --png, rendered with the pre-installed
Playwright Chromium) and floorplan/layout-v3-nyc.json. With --inject it also copies the hole
data into the 3D page between the /* LAYOUT:BEGIN */ and /* LAYOUT:END */ markers, so the
3D model and the plan always use the same positions. The footprints it exports (decks, totems and
props beside them) are also what the 3D walk mode collides with.

Everything here is a proposal (Claude, 18 Nov), not a decision. Hole positions sit on values
that are not measured yet (stage depth, stair and speaker-stand positions), so treat them as
+-1 m. The script asserts the clearance rules below and prints the tightest value of each.

Rules checked (all distances are between footprints: deck rectangles plus props that stand
beside a deck, such as signs, totems, the tree, the torch base and the ball-drop tower):
  - hole to hole                     >= 1.2 m   (a walkway between any two holes)
  - hole to side wall                >= 1.6 m   (skyline flats 0.4 m deep on the wall, then a 1.2 m walkway)
  - hole to runway side              >= 1.75 m  (speaker stands stick out 0.515 m, then a 1.2 m walkway)
  - hole to stage front              >= 6.5 m   (stairs and performer access kept clear; stage front not measured)
  - hole to golf limit               >= 0.6 m   (holes stay on the stage side of the 27 m line)
  - hole to hub                      >= 1.5 m
  - hub to runway tip                >= 1.2 m   (the only walkway between the two districts)
  - every walk route keeps a 1.2 m corridor clear of every hole except the hole it starts or ends at
  - props taller than 2 m stay outside the assumed sound-console sightline to the runway
"""
import json
import math
import os
import re
import sys

FONT = "Helvetica, Arial, sans-serif"

# ---------------------------------------------------------------- inputs
dims = json.load(open(sys.argv[1]))
OUT = sys.argv[2] if len(sys.argv) > 2 else "floorplan"
PNG = "--png" in sys.argv
INJECT = sys.argv[sys.argv.index("--inject") + 1] if "--inject" in sys.argv else None

ROOM_L = dims["auditorium"]["length_x"]          # about 53, estimated (20 Nov): not measured
ROOM_W = dims["auditorium"]["width_z"]           # 25.6, measured (rough)
SX = dims["stage"]["front_x"]                    # 6.0, not measured
RW_X0, RW_X1 = dims["runway"]["x"]               # 6.0 .. 28.54
RW_Z0, RW_Z1 = dims["runway"]["z"]               # 11.65 .. 14.05
GX = dims["golf_limit"]["x"]                     # 33.0
CON = dims["sound_console"]                      # not measured
STAND_OUT = 0.515

WALL_CLEAR = 1.6
RUNWAY_CLEAR = 1.75
APRON_X = SX + 6.5
LIMIT_CLEAR = 0.6
HUB = (30.0, 11.0, 32.6, 14.7)                   # x0, z0, x1, z1: the "Tee Booth"
ACC = 0.6                                        # tee standing point, metres before the tee end

# ---------------------------------------------------------------- the holes
# c = deck centre (x, z); th = tee -> cup direction in degrees from +X toward +Z.
# Local coordinates: u along the lane (tee at -L/2, cup end at +L/2), v across it.
# extras = props beside the deck that need floor space: (u0, v0, u1, v1) rectangles, local.
# tall = props over 2 m: (u, v, height), checked against the console sightline.
# exit = which side players leave the cup end by (+1 = +v, -1 = -v), or 0 straight on.
HOLES = [
    dict(n=10, d="A", name="Bike Lane", sign="Wheel See You Next Year", cls="Simple", par=2, L=6.0, W=1.6,
         c=(26.0, 8.3), th=180, tside=1, glow="#3BE36B", surface="Green turf, bike-lane stencils",
         play="Five real bicycle wheels stand upright across a green bike lane in a zigzag. Thread the gaps or bank off the rail; spokes give a different bounce every time. A bike-rack hoop frames the cup.",
         prop="Five old bike wheels (free from bike shops), bolted into timber cradles. A real bike bell on the totem: ring it when you hole out.",
         robust="Wheels are cable-tied to their cradles so they can't turn or fall. Each wheel either touches the rail or leaves at least 0.4 m (9 balls wide), so a ball can't wedge. No power.",
         clock="A bike computer on the first wheel reads 11:59.",
         extras=[(3.05, -0.8, 3.35, 0.8)], tall=[], exit=-1),
    dict(n=9, d="A", name="Hot Dog Cart", sign="Relish the Moment", cls="Simple", par=2, L=4.5, W=1.4,
         c=(19.1, 8.2), th=180, glow="#FF6A2B", surface="Green turf",
         play="Short and punchy, like the reference. Putt under a New York hot dog cart (the ball runs between its wheels), then round a giant hot dog that lies across the green as a bank wall and a heap of giant fries. Mustard and ketchup bottles stand either side of the cup.",
         prop="Stainless-look cart with a striped umbrella (2.2 m), a 1 m hot dog, fries, two 0.6 m squeeze bottles.",
         robust="The cart is screwed to the deck and the umbrella pole is clamped to the cart. Food props are foam on plywood bases screwed down. The gap under the cart is 0.2 m high and the full lane wide, so nothing jams.",
         clock="The cart's menu board says \"Open till 11:59\".",
         extras=[(-1.05, -0.9, -0.15, 0.9), (2.55, -0.7, 2.85, 0.7)], tall=[(-0.6, 0.0, 2.2)], exit=-1),
    dict(n=8, d="A", name="The Big Apple", sign="Take a Bite", cls="Hero", par=3, L=5.5, W=1.6,
         c=(14.0, 5.0), th=-90, glow="#FF2E4D", surface="Green turf",
         play="A 1.7 m apple stands across the lane. The only way through is the worm hole at its base, and two angled leaf boards funnel a good putt toward it. A miss comes back off the leaves for another go. The worm pokes out on the far side.",
         prop="Thick cut-out apple: two plywood profiles 0.45 m apart, skinned and painted gloss red, with a boxed tunnel. Cartoon worm on the far side.",
         robust="The tunnel is 0.32 m wide (7 balls) with a sloped floor, so a ball never stops inside; its top lifts off. The apple bolts to the deck through an L-frame. No moving parts.",
         clock="The worm wears a watch at 11:59.",
         extras=[(-1.0, -0.85, 1.4, 0.85), (2.85, -0.75, 3.1, 0.75)], tall=[], exit=1),
    dict(n=7, d="A", name="Gridlock", sign="Don't Honk. Just Putt.", cls="Mid", par=3, L=5.0, W=1.8,
         c=(19.5, 3.2), th=0, glow="#FFE21A", surface="Charcoal \"asphalt\" carpet, yellow lines, zebra crossing",
         play="A traffic jam: eight chunky yellow cabs parked at angles across an asphalt lane, with traffic cones. The ball pinballs between them, so luck evens out skill and kids can beat adults. The cup sits past a zebra crossing, and a cab roof light flashes when you sink.",
         prop="Cabs are painted timber blocks (360 × 170 × 140 mm) with a checker band and roof light. Cones and a New York street sign.",
         robust="Cabs are screwed from below, so nothing gets knocked loose. Every gap is either closed or at least 0.25 m (6 balls wide), and inside corners are filled, so there's nowhere for a ball to get trapped. The light is battery-powered; the hole plays the same without it.",
         clock="A cab's meter reads 11:59.",
         extras=[(2.55, 0.35, 2.75, 0.95)], tall=[], exit=1),
    dict(n=6, d="A", name="Liberty Island", sign="Lift Your Lamp", cls="Hero", par=3, L=5.0, W=2.4,
         c=(26.3, 3.6), th=0, glow="#2EE6B8", surface="Green turf island, blue painted harbour",
         play="Tee off from the pier and cross a 0.6 m ferry gangway over the harbour to a round island green. Miss the gangway and the ball drops into the harbour, which slopes back to the tee: no lost balls, just a retake. Liberty's torch arm rises 2.6 m over the island.",
         prop="Verdigris torch arm (box-section plywood) leaning over the island, with a glowing flame. A small orange ferry in the harbour.",
         robust="The harbour is a sloped channel 40 mm below the deck that returns every miss to the tee. The arm stands on its own weighted base behind the island, outside the play area, so nobody can lean on it. The flame LED is battery-powered.",
         clock="The tablet at her base reads XI:LIX.",
         extras=[(2.5, -0.4, 3.1, 0.4)], tall=[(2.4, 0.0, 2.6)], exit=1),
    dict(n=5, d="B", name="The Subway", sign="Stand Clear of the Closing Doors", cls="Mid", par=3, L=5.5, W=2.4,
         c=(25.2, 17.5), th=180, glow="#2F80FF", surface="Grey platform carpet with a yellow edge strip",
         play="A white-tiled subway wall with three tunnels, each marked as a train line. The express drops you near the cup; the two locals come out further away. Choose your line. A subway car stands at the end of the platform with its destination sign lit.",
         prop="Subway-tile wall with three arched tunnels and coloured line circles. A painted subway-car front (2.4 m) as the backdrop.",
         robust="Tunnels are open boxes with lift-off lids and sloped exits, so no ball can stall inside. The wall and car front bolt to the deck frame.",
         clock="The platform clock shows 11:59.",
         extras=[(2.85, -1.2, 3.15, 1.2)], tall=[(3.0, 0.0, 2.4)], exit=-1),
    dict(n=4, d="B", name="Rooftop", sign="Raise the Roof", cls="Mid", par=3, L=6.0, W=1.2,
         c=(17.8, 17.3), th=180, glow="#9B5CFF", surface="Green turf, raised rooftop green",
         play="Putt up the fire-escape ramp (1:6) to a rooftop green 200 mm up, where the cup sits right under a wooden water tower. Too soft and it rolls back to you; too hard and it bounces off the clear back guard.",
         prop="A New York water tower (barrel on steel legs, 2.4 m) over the cup, and a brownstone façade with a zigzag fire escape and lit windows.",
         robust="Clear guards on both sides and the back of the rooftop. The tower's legs stand outside the rails on their own base, and the barrel's underside is 1.4 m up, out of a putter's swing.",
         clock="A rooftop party clock reads 11:59.",
         extras=[(1.3, -0.8, 2.5, 0.8), (3.05, -0.9, 3.35, 0.9)], tall=[(1.9, 0.0, 2.4), (3.2, 0.0, 2.6)], exit=-1),
    dict(n=3, d="B", name="The Rink", sign="Break the Ice", cls="Mid", par=3, L=5.0, W=2.6,
         c=(16.6, 21.2), th=180, glow="#79DCFF", surface="Short approach in turf, then a white \"ice\" rink (smooth white felt or laminate)",
         play="A short approach onto a white rink that runs faster than turf, with rink boards to bank off. Three skaters glide slowly round on a turntable in the middle. Time it or go round. A soft touch wins.",
         prop="A 3 m Christmas tree behind the rink (borrowed from the church's Christmas decorations), with a lit star. Skater cut-outs on the turntable.",
         robust="The only moving part on the course, and it's optional: if the turntable stops, the skaters become fixed bumpers and the hole plays fine. The turntable sits flush with a 2 mm gap. Test the surface on the prototype; if laminate is too fast, use white felt.",
         clock="The rink clock reads 11:59.",
         extras=[(2.6, -0.75, 4.0, 0.75)], tall=[(3.3, 0.0, 3.0)], exit=-1),
    dict(n=2, d="B", name="Grand Central", sign="Meet Me Under the Clock", cls="Hero", par=3, L=5.0, W=3.0,
         c=(23.9, 22.2), th=0, glow="#E8A33A", surface="Clock-face green (printed or inlaid turf)",
         play="Putt onto a giant clock-face green. The hands, stopped at 11:59, are fixed bumpers that split the green; the cup sits just past 12. The gold four-faced clock stands on its information booth at the edge of the green.",
         prop="Four-faced brass clock with glowing faces on a round booth (1.9 m). Backdrop: a teal ceiling with gold constellations and arched windows.",
         robust="The hands are 50 mm solid timber with rounded ends, screwed down. The clock and backdrop stand on their own bases outside the rails.",
         clock="The whole hole is 11:59.",
         extras=[(2.45, -0.45, 3.25, 0.45), (3.35, -1.6, 3.6, 1.6)], tall=[(3.45, 0.0, 3.0)], exit=1),
    dict(n=1, d="B", name="Times Square", sign="Drop the Ball", cls="Hero", par=2, L=6.0, W=1.4,
         c=(31.3, 20.55), th=-90, glow="#FF3DCB", surface="Green turf, red-step hump",
         play="The finale. Putt up and over the red steps, between glowing billboards, into the cup under the ball-drop tower. The cup keeps your ball (that's the end of the round), and the tower's ball lights up with a cheer.",
         prop="A 3.6 m ball-drop tower with a glitter ball and lit 2027 numbers. Billboard flats either side of the lane. A neon-style \"See you in 2027\" sign.",
         robust="The light and cheer are a bonus on a battery and microswitch: if they fail, the hole still plays and still collects the balls. The tower is a truss on a weighted, guyed base outside the rails.",
         clock="The billboard clock shows 11:59. Optional: at midnight a volunteer lowers the glitter ball on a pulley in time with the stage countdown.",
         extras=[(-1.5, -0.9, 1.5, 0.9), (3.1, -0.3, 3.7, 0.3)], tall=[(3.4, 0.0, 3.6), (0.0, 0.85, 2.0), (0.0, -0.85, 2.0)], exit=-1),
]
H = {h["n"]: h for h in HOLES}


# ---------------------------------------------------------------- geometry
def l2w(h, u, v):
    t = math.radians(h["th"])
    return (h["c"][0] + u * math.cos(t) - v * math.sin(t), h["c"][1] + u * math.sin(t) + v * math.cos(t))


def lrect(h, u0, v0, u1, v1):
    return [l2w(h, u, v) for u, v in ((u0, v0), (u1, v0), (u1, v1), (u0, v1))]


def footprints(h):
    """Deck bounding rectangle, totem and extras, as world polygons."""
    L, W = h["L"], h["W"]
    fps = [lrect(h, -L / 2, -W / 2, L / 2, W / 2)]
    tu, tv = totem_uv(h)
    fps.append(lrect(h, tu - 0.18, tv - 0.18, tu + 0.18, tv + 0.18))
    for e in h["extras"]:
        fps.append(lrect(h, *e))
    return fps


def totem_uv(h):
    """Street-sign totem beside the tee; tside picks the side of the lane (-1 = -v, the default)."""
    return (-h["L"] / 2 + 0.3, h.get("tside", -1) * (h["W"] / 2 + 0.45))


def tee_pt(h):
    return l2w(h, -h["L"] / 2 - ACC, 0.0)


def exit_pt(h):
    if h["exit"] == 0:
        return l2w(h, h["L"] / 2 + ACC, 0.0)
    return l2w(h, h["L"] / 2 - 0.5, h["exit"] * (h["W"] / 2 + ACC))


def _cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def seg_intersect(p1, p2, q1, q2):
    d1, d2 = _cross(q1, q2, p1), _cross(q1, q2, p2)
    d3, d4 = _cross(p1, p2, q1), _cross(p1, p2, q2)
    return (d1 * d2 < 0) and (d3 * d4 < 0)


def pt_seg(p, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]
    L2 = dx * dx + dz * dz
    t = 0 if L2 == 0 else max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2))
    return math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz))


def seg_seg(p1, p2, q1, q2):
    if seg_intersect(p1, p2, q1, q2):
        return 0.0
    return min(pt_seg(p1, q1, q2), pt_seg(p2, q1, q2), pt_seg(q1, p1, p2), pt_seg(q2, p1, p2))


def edges(P):
    return [(P[i], P[(i + 1) % len(P)]) for i in range(len(P))]


def inside(p, P):
    s = [_cross(a, b, p) for a, b in edges(P)]
    return all(x >= -1e-9 for x in s) or all(x <= 1e-9 for x in s)


def poly_poly(P, Q):
    if any(inside(p, Q) for p in P) or any(inside(q, P) for q in Q):
        return 0.0
    return min(seg_seg(a, b, c, d) for a, b in edges(P) for c, d in edges(Q))


def poly_seg(P, a, b):
    if inside(a, P) or inside(b, P):
        return 0.0
    return min(seg_seg(a, b, c, d) for c, d in edges(P))


def rect_poly(x0, z0, x1, z1):
    return [(x0, z0), (x1, z0), (x1, z1), (x0, z1)]


# ---------------------------------------------------------------- routes (hub -> district -> hub)
HUB_A = (30.1, HUB[1] - 0.2)     # hub north edge, district A side
HUB_A_IN = (31.4, HUB[1] - 0.2)
HUB_B = (30.1, HUB[3] + 0.2)
HUB_B_IN = (31.0, HUB[3] + 0.2)


def route_A():
    hops = [[HUB_A, (29.3, 9.9), tee_pt(H[10])]]
    hops.append([exit_pt(H[10]), tee_pt(H[9])])
    hops.append([exit_pt(H[9]), tee_pt(H[8])])
    hops.append([exit_pt(H[8]), tee_pt(H[7])])
    hops.append([exit_pt(H[7]), tee_pt(H[6])])
    hops.append([exit_pt(H[6]), (31.4, 6.2), HUB_A_IN])
    return hops


def route_B():
    hops = [[HUB_B, (29.1, 15.8), tee_pt(H[5])]]
    hops.append([exit_pt(H[5]), (21.45, 19.15), tee_pt(H[4])])
    hops.append([exit_pt(H[4]), (20.3, 19.2), tee_pt(H[3])])
    hops.append([exit_pt(H[3]), (20.2, 23.95), tee_pt(H[2])])
    hops.append([exit_pt(H[2]), (29.2, 24.25), tee_pt(H[1])])
    hops.append([exit_pt(H[1]), HUB_B_IN])
    return hops


def segs(route):
    out = []
    for hop in route:
        out += list(zip(hop[:-1], hop[1:]))
    return out


# ---------------------------------------------------------------- sightline (assumed)
def sight_poly():
    """Sound console front face to the runway sides at the stage front: where tall props would block its view.
    Assumed: the console's size and position are not measured, and production hasn't said what it needs to see."""
    cx0 = CON["x"][0]
    return [(cx0, CON["z"][0]), (cx0, CON["z"][1]), (RW_X0, RW_Z1), (RW_X0, RW_Z0)]


# ---------------------------------------------------------------- checks
def run_checks():
    res = {}
    fps = {h["n"]: footprints(h) for h in HOLES}
    # hole to hole
    worst = (99, "")
    for a in fps:
        for b in fps:
            if a <= b:
                continue
            d = min(poly_poly(P, Q) for P in fps[a] for Q in fps[b])
            worst = min(worst, (d, f"{a}-{b}"))
    res["hole_hole"] = worst
    assert worst[0] >= 1.2 - 1e-6, f"holes {worst[1]} only {worst[0]:.2f} m apart"
    # walls, runway, apron, golf limit
    wall, rwy, apron, lim = (99, ""), (99, ""), (99, ""), (99, "")
    for n, Ps in fps.items():
        for P in Ps:
            zs, xs = [p[1] for p in P], [p[0] for p in P]
            wall = min(wall, (min(zs), f"{n} top wall"), (ROOM_W - max(zs), f"{n} bottom wall"))
            apron = min(apron, (min(xs) - SX, f"{n}"))
            lim = min(lim, (GX - max(xs), f"{n}"))
            if min(xs) < RW_X1:     # beside the runway
                if max(zs) <= (RW_Z0 + RW_Z1) / 2:
                    rwy = min(rwy, (RW_Z0 - max(zs), f"{n}"))
                else:
                    rwy = min(rwy, (min(zs) - RW_Z1, f"{n}"))
    res["hole_wall"], res["hole_runway"], res["hole_stage_front"], res["hole_golf_limit"] = wall, rwy, apron, lim
    assert wall[0] >= WALL_CLEAR - 1e-6, f"hole {wall[1]}: {wall[0]:.2f} m"
    assert rwy[0] >= RUNWAY_CLEAR - 1e-6, f"hole {rwy[1]} {rwy[0]:.2f} m from the runway"
    assert apron[0] >= APRON_X - SX - 1e-6, f"hole {apron[1]} {apron[0]:.2f} m from the stage front"
    assert lim[0] >= LIMIT_CLEAR - 1e-6, f"hole {lim[1]} {lim[0]:.2f} m from the golf limit"
    # hub
    hub = rect_poly(*HUB)
    hd = min((min(poly_poly(P, hub) for P in Ps), n) for n, Ps in fps.items())
    res["hole_hub"] = (hd[0], f"{hd[1]}")
    assert hd[0] >= 1.5 - 1e-6, f"hole {hd[1]} {hd[0]:.2f} m from the hub"
    res["hub_runway_tip"] = (HUB[0] - RW_X1, "walkway between the districts")
    assert res["hub_runway_tip"][0] >= 1.2 - 1e-6
    assert HUB[2] <= GX + 1e-6
    # routes: 1.2 m corridor (0.6 each side) clear of every hole except the hole a hop starts or ends at
    worst = (99, "")
    for name, route, nums in (("A", route_A(), [10, 9, 8, 7, 6]), ("B", route_B(), [5, 4, 3, 2, 1])):
        for i, hop in enumerate(route):
            own = set()
            if i > 0:
                own.add(nums[i - 1])
            if i < len(nums):
                own.add(nums[i])
            for s0, s1 in zip(hop[:-1], hop[1:]):
                for n, Ps in fps.items():
                    lim_d = 0.6
                    d = min(poly_seg(P, s0, s1) for P in Ps)
                    if n in own:
                        continue
                    if d < worst[0]:
                        worst = (d, f"district {name}, hop {i}, near hole {n}")
        for s0, s1 in segs(route):
            for p in (s0, s1):
                assert 0.3 <= p[1] <= ROOM_W - 0.3 and p[0] <= GX + 1e-6, f"route point {p} outside the golf zone"
                assert not (RW_X0 <= p[0] <= RW_X1 + 0.6 and RW_Z0 - 0.6 <= p[1] <= RW_Z1 + 0.6), f"route point {p} on the runway"
    res["route_corridor"] = (2 * worst[0], worst[1])
    assert worst[0] >= 0.6 - 1e-6, f"walkway only {2 * worst[0]:.2f} m wide, {worst[1]}"
    # own-hole checks: a route hop may touch its own hole only at the tee point or exit point
    allseg = segs(route_A()) + segs(route_B())
    crossings = []
    for i in range(len(allseg)):
        for j in range(i + 2, len(allseg)):
            if seg_intersect(*allseg[i], *allseg[j]):
                crossings.append((i, j))
    res["route_crossings"] = crossings
    assert not crossings, f"walk routes cross: {crossings}"
    # tall props outside the sightline (with 0.5 m margin)
    sp = sight_poly()
    tall = []
    for h in HOLES:
        for u, v, ht in h["tall"]:
            p = l2w(h, u, v)
            inside_cone = inside(p, sp)
            d = 0.0 if inside_cone else min(pt_seg(p, a, b) for a, b in edges(sp))
            tall.append((d, f"hole {h['n']} prop {ht} m"))
    t = min(tall)
    res["tall_sightline"] = t
    assert t[0] >= 0.5 - 1e-6, f"{t[1]} only {t[0]:.2f} m from the console sightline"
    return fps, res


# ---------------------------------------------------------------- svg
class Canvas:
    def __init__(self, S, ox, oy):
        self.S, self.ox, self.oy, self.els = S, ox, oy, []

    def X(self, x):
        return self.ox + x * self.S

    def Z(self, z):
        return self.oy + z * self.S

    def add(self, s):
        self.els.append(s)

    def poly(self, pts, fill, stroke="none", sw=1, extra=""):
        d = " ".join(f"{self.X(x):.1f},{self.Z(z):.1f}" for x, z in pts)
        self.add(f'<polygon points="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def rect(self, x0, z0, x1, z1, fill, stroke="none", sw=1, extra=""):
        self.poly(rect_poly(x0, z0, x1, z1), fill, stroke, sw, extra)

    def pline(self, pts, stroke, sw=1, extra=""):
        d = " ".join(f"{self.X(x):.1f},{self.Z(z):.1f}" for x, z in pts)
        self.add(f'<polyline points="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def circle(self, x, z, r, fill, stroke="none", sw=1, extra=""):
        self.add(f'<circle cx="{self.X(x):.1f}" cy="{self.Z(z):.1f}" r="{r * self.S:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def text(self, x, z, t, size=11, fill="#2C2C2A", anchor="middle", weight="400", extra=""):
        t = t.replace("&", "&amp;")
        self.add(f'<text x="{self.X(x):.1f}" y="{self.Z(z):.1f}" font-family="{FONT}" font-size="{size}" fill="{fill}" '
                 f'text-anchor="{anchor}" font-weight="{weight}" dominant-baseline="middle" {extra}>{t}</text>')


def hole_shapes(h):
    """Plan glyph of each deck in local coordinates: list of ('rect', u0, v0, u1, v1) / ('circle', u, v, r) / ('poly', pts)."""
    L, W = h["L"], h["W"]
    a, b = -L / 2, L / 2
    n = h["n"]
    if n == 6:
        return [("rect", a, -0.45, a + 0.9, 0.45), ("rect", a + 0.9, -0.3, 0.35, 0.3), ("circle", 1.3, 0, 1.2, "#7FB8E6"), ("circle", 1.3, 0, 0.95, None)]
    if n == 5:
        return [("poly", [(a, -0.5), (-0.95, -0.5), (-0.95, -1.2), (b, -1.2), (b, 1.2), (-0.95, 1.2), (-0.95, 0.5), (a, 0.5)])]
    if n == 3:
        return [("rect", a, -0.5, -1.1, 0.5), ("stadium", -1.1, 2.5, 1.3)]
    if n == 2:
        return [("rect", a, -0.5, -0.3, 0.5), ("circle", 1.0, 0, 1.5, None)]
    return [("rect", a, -W / 2, b, W / 2)]


def draw_hole(cv, h):
    glow = h["glow"]
    turf = "#5DAA6E"
    for s in hole_shapes(h):
        if s[0] == "rect":
            cv.poly(lrect(h, *s[1:]), turf, "#1E3B2A", 1.1)
        elif s[0] == "poly":
            cv.poly([l2w(h, u, v) for u, v in s[1]], turf, "#1E3B2A", 1.1)
        elif s[0] == "circle":
            x, z = l2w(h, s[1], s[2])
            cv.circle(x, z, s[3], s[4] or turf, "#1E3B2A", 1.1)
        elif s[0] == "stadium":
            u0, u1, r = s[1], s[2], s[3]
            pts = []
            for k in range(0, 19):
                ang = math.pi / 2 + k * math.pi / 18
                pts.append((u0 + r + r * math.cos(ang), r * math.sin(ang)))
            for k in range(0, 19):
                ang = -math.pi / 2 + k * math.pi / 18
                pts.append((u1 - r + r * math.cos(ang), r * math.sin(ang)))
            cv.poly([l2w(h, u, v) for u, v in pts], "#EAF4FA", "#1E3B2A", 1.1)
    for e in h["extras"]:
        cv.poly(lrect(h, *e), "#D9D3C4", "#8A8472", 0.7)
    tu, tv = totem_uv(h)
    x, z = l2w(h, tu, tv)
    cv.rect(x - 0.18, z - 0.18, x + 0.18, z + 0.18, "#1B5E3B", "#0E3322", 0.7)
    # glow outline
    cv.poly(lrect(h, -h["L"] / 2 - 0.12, -h["W"] / 2 - 0.12, h["L"] / 2 + 0.12, h["W"] / 2 + 0.12), "none", glow, 2.2, 'stroke-opacity="0.85" stroke-dasharray="1 0"')
    # tee and cup
    tx, tz = l2w(h, -h["L"] / 2 + 0.3, 0)
    cv.rect(tx - 0.15, tz - 0.15, tx + 0.15, tz + 0.15, "#2B2B2B")
    for u, v, ht in h["tall"]:
        x, z = l2w(h, u, v)
        cv.add(star(cv.X(x), cv.Z(z), 6, "#2C2C2A"))
    # number badge and name
    cx, cz = h["c"]
    cv.circle(cx, cz, 0.42, glow, "#1B1B1B", 1.2)
    cv.text(cx, cz + 0.02, str(h["n"]), 13, "#111", weight="800")


def star(cx, cy, r, fill):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.45
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def figure(fps, res):
    S = 38.0
    x_hi = 37.5
    ox, oy = 64, 128
    Wpx = int(ox + (x_hi) * S + 330)
    Hpx = int(oy + ROOM_W * S + 210)
    cv = Canvas(S, ox, oy)
    # room (cut at x_hi)
    cv.rect(0, 0, x_hi, ROOM_W, "#EFEDE7")
    cv.rect(GX, 0, x_hi, ROOM_W, "#F3EBDD")
    cv.rect(SX, 0, GX, ROOM_W, "#E4F0EA")
    cv.rect(SX, 0, APRON_X, ROOM_W, "#EDEFEA", extra='')
    cv.rect(0, 0, SX, ROOM_W, "#D8D4CB", "#9A958A", 0.8)
    for cc in dims["stage"]["corner_curves"]:
        a, o = cc["along_front"], cc["out_from_front"]
        pts = []
        zw = cc["wall_z"]
        sgn = 1 if zw == 0 else -1
        for k in range(0, 17):
            ang = k * (math.pi / 2) / 16
            pts.append((SX + o * math.cos(ang), zw + sgn * a * math.sin(ang)))
        pts.append((SX, zw))
        cv.poly(pts, "#D8D4CB", "#9A958A", 0.8, 'stroke-dasharray="4 3"')
    cv.text(SX / 2, ROOM_W / 2, "Stage", 13, "#4A463E", weight="700")
    cv.text(SX / 2, ROOM_W / 2 + 0.8, "depth not measured", 9, "#77736A")
    # runway, stairs, stands
    cv.rect(RW_X0, RW_Z0, RW_X1, RW_Z1, "#D8D4CB", "#7A756B", 0.9)
    cv.text((RW_X0 + RW_X1) / 2 - 3, (RW_Z0 + RW_Z1) / 2, "Runway (raised, part of the stage) · 22.54 × 2.4 m · players can't cross", 10.5, "#3C3932")
    for it in dims["runway_side_items"]["items"]:
        x0, x1 = RW_X1 - it["from_tip"][1], RW_X1 - it["from_tip"][0]
        col = "#F4C46A" if it["type"] == "speaker_stand" else "#CFC8BA"
        cv.rect(x0, RW_Z0 - it["out"], x1, RW_Z0, col, "#8A6A2A", 0.7, 'stroke-dasharray="3 2"')
        cv.rect(x0, RW_Z1, x1, RW_Z1 + it["out"], col, "#8A6A2A", 0.7, 'stroke-dasharray="3 2"')
    # apron
    cv.text((SX + APRON_X) / 2 + 0.3, 5.6, "Kept clear", 10, "#5D6B60", weight="700")
    cv.text((SX + APRON_X) / 2 + 0.3, 6.3, "stage stairs and", 9, "#5D6B60")
    cv.text((SX + APRON_X) / 2 + 0.3, 6.9, "performer access", 9, "#5D6B60")
    cv.text((SX + APRON_X) / 2 + 0.3, 19.0, "Kept clear", 10, "#5D6B60", weight="700")
    cv.text((SX + APRON_X) / 2 + 0.3, 19.7, "(about 6.5 m)", 9, "#5D6B60")
    # sightline
    cv.add(f'<clipPath id="room"><rect x="{cv.X(0):.1f}" y="{cv.Z(0):.1f}" width="{x_hi * S:.1f}" height="{ROOM_W * S:.1f}"/></clipPath>')
    cv.poly(sight_poly(), "#E0533F", "#C2412E", 0.8, 'fill-opacity="0.07" stroke-dasharray="5 4" clip-path="url(#room)"')
    cv.text(36.0, 13.0, "assumed console sightline:", 9, "#A63A2A", anchor="middle")
    cv.text(36.0, 13.55, "nothing over 2 m inside", 9, "#A63A2A", anchor="middle")
    # skyline flats on the side walls
    for x0, x1 in ((APRON_X, 21.0), (21.6, 27.0), (27.6, 32.6)):
        cv.rect(x0, 0.05, x1, 0.4, "#2E3350")
        cv.rect(x0, ROOM_W - 0.4, x1, ROOM_W - 0.05, "#2E3350")
    cv.text(22.5, 0.95, "skyline flats on the wall (2.4–3.6 m), then a 1.2 m walkway", 9, "#3A3F5C")
    cv.text(22.5, ROOM_W - 0.95, "skyline flats on the wall (2.4–3.6 m), then a 1.2 m walkway", 9, "#3A3F5C")
    # golf limit
    cv.add(f'<line x1="{cv.X(GX):.1f}" y1="{cv.Z(0) - 14:.1f}" x2="{cv.X(GX):.1f}" y2="{cv.Z(ROOM_W) + 6:.1f}" stroke="#0F6E56" stroke-width="3" stroke-dasharray="10 6"/>')
    cv.text(GX, -0.75, "Golf limit · 27 m from the stage front (decided 18 Nov)", 11, "#0F6E56", weight="700")
    cv.text(35.3, 4.0, "Other", 12, "#6B5426", weight="700")
    cv.text(35.3, 4.6, "activities", 12, "#6B5426", weight="700")
    lf = dims["lf_platform"]
    cv.rect(lf["x"][0], lf["z"][0], lf["x"][1], lf["z"][1], "#DCD6F0", "#5A4FA0", 0.8, 'stroke-dasharray="3 2"')
    # hub
    cv.rect(*HUB, "#F6D9E9", "#9C2C6E", 1.2)
    cv.text((HUB[0] + HUB[2]) / 2, (HUB[1] + HUB[3]) / 2 - 0.55, "TEE BOOTH", 11, "#6E1B4C", weight="800")
    cv.text((HUB[0] + HUB[2]) / 2, (HUB[1] + HUB[3]) / 2 + 0.05, "hub: queue, putters,", 8.5, "#6E1B4C")
    cv.text((HUB[0] + HUB[2]) / 2, (HUB[1] + HUB[3]) / 2 + 0.55, "balls · all ≤ 1.5 m", 8.5, "#6E1B4C")
    # routes
    for route, col in ((route_A(), "#C98A12"), (route_B(), "#7E3FC0")):
        for hop in route:
            cv.pline(hop, col, 2, 'stroke-dasharray="6 4" stroke-linecap="round"')
            (x0, z0), (x1, z1) = hop[-2], hop[-1]
            ang = math.atan2(z1 - z0, x1 - x0)
            tip = (cv.X(x1), cv.Z(z1))
            p1 = (tip[0] - 9 * math.cos(ang) + 5 * math.sin(ang), tip[1] - 9 * math.sin(ang) - 5 * math.cos(ang))
            p2 = (tip[0] - 9 * math.cos(ang) - 5 * math.sin(ang), tip[1] - 9 * math.sin(ang) + 5 * math.cos(ang))
            cv.add(f'<polygon points="{tip[0]:.1f},{tip[1]:.1f} {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}" fill="{col}"/>')
    # holes
    for h in HOLES:
        draw_hole(cv, h)
    # hole names
    name_pos = {10: (-0.6, -1.75), 9: (0, -1.75), 8: (-1.35, 0), 7: (0, 1.3), 6: (0, 1.65), 5: (0.4, -2.0), 4: (0.8, -1.45), 3: (0.6, 2.0), 2: (-0.3, -2.45), 1: (1.75, 0)}
    for h in HOLES:
        dx, dz = name_pos[h["n"]]
        x, z = h["c"][0] + dx, h["c"][1] + dz
        anchor = "middle"
        if h["n"] == 8:
            anchor = "end"
        if h["n"] == 1:
            x, z = 30.6, 24.35
        cv.text(x, z, f"{h['n']} · {h['name']}", 11.5, "#14201A", anchor=anchor, weight="700")
        cv.text(x, z + 0.55, f"“{h['sign']}”", 9, "#4C5A50", anchor=anchor, extra='font-style="italic"')
    # district labels
    cv.text(22.5, 6.05, "DOWNTOWN · holes 10 → 6", 13, "#9A6A0C", weight="800", extra='letter-spacing="1.5"')
    cv.text(17.4, 19.45, "MIDTOWN · holes 5 → 1", 13, "#6A2FA8", weight="800", extra='letter-spacing="1.5"')
    # border
    cv.rect(0, 0, x_hi, ROOM_W, "none", "#2C2C2A", 2.2)
    cv.add(f'<line x1="{cv.X(x_hi):.1f}" y1="{cv.Z(0):.1f}" x2="{cv.X(x_hi):.1f}" y2="{cv.Z(ROOM_W):.1f}" stroke="#F7F6F2" stroke-width="5"/>')
    cv.text(x_hi - 0.2, ROOM_W / 2 + 4.6, f"room continues ≈ {ROOM_L - GX:g} m to the", 9, "#77736A", anchor="end")
    cv.text(x_hi - 0.2, ROOM_W / 2 + 5.1, "console and back wall (estimated)", 9, "#77736A", anchor="end")
    # scale bar
    sx0, sz = 0.0, ROOM_W + 1.6
    for k in range(0, 5):
        cv.rect(sx0 + k, sz, sx0 + k + 1, sz + 0.25, "#2C2C2A" if k % 2 == 0 else "#FFFFFF", "#2C2C2A", 0.6)
    cv.text(sx0, sz + 0.75, "0", 9, anchor="middle")
    cv.text(sx0 + 5, sz + 0.75, "5 m", 9, anchor="middle")
    # header
    head = [
        f'<text x="{ox}" y="40" font-family="{FONT}" font-size="22" font-weight="700" fill="#1A1A18">Layout v3 · New York Countdown · proposal, not decided</text>',
        f'<text x="{ox}" y="66" font-family="{FONT}" font-size="12.5" fill="#55524B">Two districts of five holes beside the runway, each looping back to one hub at the runway tip. Drawn on the 18 Nov tape measurements (plan v2).</text>',
        f'<text x="{ox}" y="86" font-family="{FONT}" font-size="12.5" fill="#55524B">Positions sit on values that are not measured yet (stage depth, stair and speaker-stand positions): treat them as ±1 m. Stars mark props over 2 m.</text>',
    ]
    # side panel: checks
    px = cv.X(x_hi) + 26
    lines = [("Clearances checked", 13, "700", "#1A1A18")]
    labels = {
        "hole_hole": ("Hole to hole", 1.2), "hole_wall": ("Hole to side wall", 1.6), "hole_runway": ("Hole to runway side", 1.75),
        "hole_stage_front": ("Hole to stage front", 6.5), "hole_golf_limit": ("Hole to golf limit", 0.6), "hole_hub": ("Hole to hub", 1.5),
        "hub_runway_tip": ("Hub to runway tip", 1.2), "route_corridor": ("Walkway width", 1.2), "tall_sightline": ("Tall props to sightline", 0.5),
    }
    for k, (lab, need) in labels.items():
        v = res[k][0]
        lines.append((f"{lab}: {v:.2f} m (rule ≥ {need:g})", 10.5, "400", "#2C2C2A"))
    lines.append(("", 6, "400", "#000"))
    lines.append(("Walk routes", 13, "700", "#1A1A18"))
    lines.append(("Downtown: hub → 10 → 9 → 8 → 7 → 6 → hub", 10.5, "400", "#9A6A0C"))
    lines.append(("Midtown: hub → 5 → 4 → 3 → 2 → 1 → hub", 10.5, "400", "#6A2FA8"))
    lines.append(("Routes don't cross. Groups can start at", 10.5, "400", "#2C2C2A"))
    lines.append(("any open hole and play their district", 10.5, "400", "#2C2C2A"))
    lines.append(("round to where they began.", 10.5, "400", "#2C2C2A"))
    lines.append(("", 6, "400", "#000"))
    lines.append(("Footprint", 13, "700", "#1A1A18"))
    deck = sum(h["L"] * h["W"] for h in HOLES)
    lines.append((f"Decks (bounding): {deck:.0f} m²", 10.5, "400", "#2C2C2A"))
    lines.append((f"Golf zone after the runway: ≈ 637 m²", 10.5, "400", "#2C2C2A"))
    lines.append(("", 6, "400", "#000"))
    lines.append(("Glow colour = each hole's own", 10.5, "400", "#2C2C2A"))
    lines.append(("LED colour at the deck base.", 10.5, "400", "#2C2C2A"))
    y = cv.Z(0) + 4
    side = []
    for t, s, w, c in lines:
        side.append(f'<text x="{px:.1f}" y="{y:.1f}" font-family="{FONT}" font-size="{s}" font-weight="{w}" fill="{c}">{t}</text>')
        y += s + 7
    foot = [
        f'<text x="{ox}" y="{Hpx - 52}" font-family="{FONT}" font-size="11" fill="#55524B">Not shown: cable runs and drops (on the old cable-plan geometry; to re-place), and the runway extension (if built it would run through the hub, which would then split in two).</text>',
        f'<text x="{ox}" y="{Hpx - 34}" font-family="{FONT}" font-size="11" fill="#55524B">Generated by tools/make_layout_nyc.py from floorplan/auditorium-dimensions.json · concept: docs/10-new-york-concept.md · AI-drafted: a team member must check and own it.</text>',
    ]
    body = "\n".join(head + cv.els + side + foot)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{Wpx * 2}" height="{Hpx * 2}" viewBox="0 0 {Wpx} {Hpx}">'
           f'<title>Layout v3: New York Countdown</title><rect width="{Wpx}" height="{Hpx}" fill="#F7F6F2"/>{body}</svg>')
    return svg, Wpx, Hpx


def render_png(svg_path, png_path, W, H):
    import subprocess
    import tempfile
    svg = open(svg_path).read().replace(f'width="{W * 2}" height="{H * 2}"', f'width="{W}" height="{H}"', 1)
    with tempfile.TemporaryDirectory() as td:
        html = os.path.join(td, "page.html")
        open(html, "w").write(f'<html><body style="margin:0;background:#fff">{svg}</body></html>')
        js = os.path.join(td, "r.js")
        open(js, "w").write(
            "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
            f"const p=await b.newPage({{viewport:{{width:{W},height:{H}}},deviceScaleFactor:2}});"
            f"await p.goto('file://{html}');await p.screenshot({{path:{json.dumps(os.path.abspath(png_path))}}});await b.close();}})();")
        subprocess.run(["node", js], check=True)


# ---------------------------------------------------------------- export
def export_json(res):
    keep = ("n", "d", "name", "sign", "cls", "par", "L", "W", "c", "th", "glow", "surface", "play", "prop", "robust", "clock")
    extra = lambda h: {"tside": h.get("tside", -1)}
    holes = []
    for h in HOLES:
        o = {k: h[k] for k in keep}
        o.update(extra(h))
        o["c"] = [round(h["c"][0], 3), round(h["c"][1], 3)]
        holes.append(o)
    r = lambda pts: [[round(x, 3), round(z, 3)] for x, z in pts]
    return {
        "_about": "Layout v3 (New York Countdown), proposal by Claude 18 Nov 2026, not decided. Generated by tools/make_layout_nyc.py on geometry v2. Positions are +-1 m: they sit on values that are not measured yet.",
        "hub": list(HUB),
        "apron_x": APRON_X,
        "routes": {"A": [r(hop) for hop in route_A()], "B": [r(hop) for hop in route_B()]},
        "sightline": r(sight_poly()),
        "checks_m": {k: round(v[0], 2) for k, v in res.items() if isinstance(v, tuple)},
        "footprints": {str(h["n"]): [r(P) for P in footprints(h)] for h in HOLES},
        "holes": holes,
    }


def inject(path, data):
    page = open(path, encoding="utf-8").read()
    block = "/* LAYOUT:BEGIN (generated by tools/make_layout_nyc.py; edit the script, not this block) */\nconst LAYOUT = " + json.dumps(data, ensure_ascii=False) + ";\n/* LAYOUT:END */"
    new, n = re.subn(r"/\* LAYOUT:BEGIN.*?/\* LAYOUT:END \*/", lambda m: block, page, flags=re.S)
    if n != 1:
        sys.exit(f"{path}: LAYOUT markers not found exactly once")
    open(path, "w", encoding="utf-8").write(new)
    print(f"injected layout into {path}")


def main():
    fps, res = run_checks()
    os.makedirs(OUT, exist_ok=True)
    svg, W, Hh = figure(fps, res)
    p = os.path.join(OUT, "layout-v3-nyc.svg")
    open(p, "w").write(svg)
    data = export_json(res)
    with open(os.path.join(OUT, "layout-v3-nyc.json"), "w") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
        f.write("\n")
    deck = sum(h["L"] * h["W"] for h in HOLES)
    print(f"Deck bounding area {deck:.1f} m²")
    for k, v in res.items():
        if isinstance(v, tuple):
            print(f"  {k:18s} {v[0]:6.2f} m  ({v[1]})")
    print(f"  route crossings: {res['route_crossings'] or 'none'}")
    if PNG:
        render_png(p, p[:-4] + ".png", W, Hh)
        print("PNG written")
    if INJECT:
        inject(INJECT, data)


if __name__ == "__main__":
    main()
