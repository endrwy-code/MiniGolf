"""Zone options and the plaza concept layout (to-scale plan SVGs, stdlib only).

Usage:
    python3 tools/make_zone_options.py floorplan/auditorium-dimensions-v1-cable-plan.json floorplan [--png]

Writes:
    zone-options.svg         where a "city" course could go, given the runway (3 candidate zones)
    layout-draft-plaza.svg   draft v2 concept: 10 holes as two 5-hole districts around a hub
                             at the runway tip (Option B)
    --png also renders both to PNG with the pre-installed Playwright Chromium (node).

Coordinates: metres, origin top-left of the auditorium as drawn; +X stage -> booth,
+Z top wall -> bottom wall (same axes as the team's planning tool and the JSON).
Hole footprints and names: docs/03-hole-spec-sheet.md. Positions of cables, drops and
Wi-Fi points not in the JSON are estimates scaled off floorplan/source-screenshots
(about +-1 m). The script asserts the layout clearances and prints them.
Concept for discussion, not a construction drawing.
"""
import json
import math
import os
import sys

FONT = "Helvetica, Arial, sans-serif"

# ---------------------------------------------------------------- geometry
def rect_poly(x0, z0, x1, z1):
    return [(x0, z0), (x1, z0), (x1, z1), (x0, z1)]


def hole_poly(h):
    """Bounding rectangle of a hole, rotated. th = direction tee -> cup, degrees from +X toward +Z."""
    cx, cz = h["c"]
    t = math.radians(h["th"])
    d = (math.cos(t), math.sin(t))
    n = (-math.sin(t), math.cos(t))
    L, W = h["L"], h["W"]
    pts = []
    for su, sv in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        pts.append((cx + su * L / 2 * d[0] + sv * W / 2 * n[0], cz + su * L / 2 * d[1] + sv * W / 2 * n[1]))
    return pts


def hole_end(h, which, off=0.0):
    """Centre of the tee end (which=-1) or cup end (+1), pushed `off` metres beyond it along the lane."""
    cx, cz = h["c"]
    t = math.radians(h["th"])
    d = (math.cos(t), math.sin(t))
    k = which * (h["L"] / 2 + off)
    return (cx + k * d[0], cz + k * d[1])


def local_to_world(h, u, v):
    cx, cz = h["c"]
    t = math.radians(h["th"])
    return (cx + u * math.cos(t) - v * math.sin(t), cz + u * math.sin(t) + v * math.cos(t))


def _cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def seg_intersect(p1, p2, q1, q2):
    d1, d2 = _cross(q1, q2, p1), _cross(q1, q2, p2)
    d3, d4 = _cross(p1, p2, q1), _cross(p1, p2, q2)
    return (d1 * d2 < 0) and (d3 * d4 < 0)


def pt_seg(p, a, b):
    ax, az = a
    bx, bz = b
    dx, dz = bx - ax, bz - az
    L2 = dx * dx + dz * dz
    t = 0 if L2 == 0 else max(0.0, min(1.0, ((p[0] - ax) * dx + (p[1] - az) * dz) / L2))
    return math.hypot(p[0] - (ax + t * dx), p[1] - (az + t * dz))


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


def area(P):
    return abs(sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))) / 2


# ---------------------------------------------------------------- inputs
dims = json.load(open(sys.argv[1]))
OUT = sys.argv[2] if len(sys.argv) > 2 else "floorplan"
PNG = "--png" in sys.argv

L_ROOM = dims["auditorium"]["length_x"]
D_ROOM = dims["auditorium"]["depth_z"]
Z_ = {z["id"]: z for z in dims["zones"]}
RW = Z_["central_strip"]                    # runway (confirmed)
EXT = RW["possible_extension"]              # dashed outline in screenshot 04 (estimated)
BOOTH = Z_["booth"]
ZA, ZB = Z_["zone_a"], Z_["zone_b"]
STAGE = Z_["stage"]
CAB = {c["id"]: c for c in dims["cable_runs_simplified"] if "z" in c}

RW_X1 = RW["x"][1]                          # runway tip, 31.22 (derived from 20.73 m measured)
RW_Z0, RW_Z1 = RW["z"]
RW_ZC = (RW_Z0 + RW_Z1) / 2
EXT_X1 = EXT["x"][1]
BOOTH_X0 = BOOTH["x"][0]                    # booth face, 51.95 (derived from 45.95 m measured)
PLAZA = (RW_X1, ZA["z"][0], BOOTH_X0 - 1.0, ZB["z"][1])   # Option B: x 31.22-50.95, z 1.2-26.8

# Estimated from screenshots 01 and 04 (positions relative to the measured runway tip)
TRUNK_X = 30.4                              # vertical power+data trunk at the runway tip, full depth
POWER = {                                   # id: (polyline, label)
    "north_run": ([(CAB["north_run"]["x"][0], CAB["north_run"]["z"]), (CAB["north_run"]["x"][1], CAB["north_run"]["z"])], "north run (JSON est.)"),
    "south_run": ([(CAB["south_run"]["x"][0], CAB["south_run"]["z"]), (CAB["south_run"]["x"][1], CAB["south_run"]["z"])], "south run (JSON est.)"),
    "main_trunk": ([(CAB["main_trunk"]["x"][0], CAB["main_trunk"]["z"]), (CAB["main_trunk"]["x"][1], CAB["main_trunk"]["z"])], "main trunk (JSON est.)"),
    "tip_trunk": ([(TRUNK_X, 1.2), (TRUNK_X, 26.8)], "trunk at runway tip (est.)"),
    "drop_D53": ([(38.0, 2.6), (39.4, 2.6), (39.4, 7.6)], "drop D53 (est.)"),
    "drop_A": ([(34.1, 10.4), (34.1, 24.5)], "drop ND31 (est.)"),
    "drop_B": ([(43.3, 10.5), (43.3, 26.0)], "drop D42 (est.)"),
}
DATA = [[(37.6, 2.6), (37.6, 8.7)], [(45.6, 2.6), (45.6, 8.7)]]
APS = [(37.6, 4.5), (37.6, 8.7), (45.6, 4.5), (45.6, 8.7), (29.4, 8.5)]

# ---------------------------------------------------------------- the plaza layout (Option B)
BLVD = (RW_X1, 11.6, PLAZA[2], 16.45)       # boulevard band on the runway axis: no holes
HUB = (44.0, 11.9, 49.45, 16.2)             # queue + putter/ball desk + ball return
FLATS_N = 1.6                               # inner face of north skyline flats (z 1.2-1.6)
FLATS_S = 25.3                              # inner face of south skyline flats (z 25.3-25.7)
EAST_LIM = PLAZA[2]

NAMES = {10: "Warm-Up", 9: "Bank Shot", 8: "Windmill", 7: "Pinball", 6: "Split Decision",
         5: "The Ramp", 4: "The Barn", 3: "Island Green", 2: "The Clock", 1: "Midnight"}
HERO = {8, 4, 2, 1}
HOLES = {   # L x W from the spec sheet; c = centre; th = direction tee -> cup (deg)
    10: dict(L=5.0, W=1.2, c=(42.6, 8.6), th=210),
    9: dict(L=5.0, W=2.4, c=(36.0, 7.2), th=180),
    8: dict(L=6.0, W=1.2, c=(35.3, 3.75), th=0),
    7: dict(L=5.0, W=1.8, c=(43.0, 3.75), th=0),
    6: dict(L=5.5, W=2.4, c=(48.55, 7.35), th=90),
    5: dict(L=6.0, W=1.2, c=(39.75, 23.0), th=180),
    4: dict(L=5.0, W=2.0, c=(32.4, 19.7), th=-90),
    3: dict(L=5.0, W=2.4, c=(39.6, 18.8), th=-30),
    2: dict(L=5.0, W=3.0, c=(45.5, 20.5), th=90),
    1: dict(L=6.0, W=1.2, c=(49.15, 21.0), th=-90),
}
ACC = 0.6   # access point: this far beyond the tee or cup end, on the walkway


def TEE(n):
    return hole_end(HOLES[n], -1, ACC)


def CUP(n):
    return hole_end(HOLES[n], +1, ACC)


ROUTE_A = [[(45.285, HUB[1]), TEE(10)], [CUP(10), TEE(9)], [CUP(9), (31.7, 7.2), TEE(8)],
           [CUP(8), TEE(7)], [CUP(7), TEE(6)], [CUP(6), (48.55, HUB[1])]]
ROUTE_B = [[(44.3, HUB[3]), (43.4, 16.9), TEE(5)], [CUP(5), TEE(4)], [CUP(4), (34.0, 16.6), TEE(3)],
           [CUP(3), TEE(2)], [CUP(2), (48.0, 24.65), TEE(1)], [CUP(1), (49.15, HUB[3])]]
COVER_ALONG = [(43.4, 16.9), (43.4, 23.0)]   # hub -> hole 5 walkway runs along drop D42


def segs(route):
    out = []
    for hop in route:
        out += list(zip(hop[:-1], hop[1:]))
    return out


# ---------------------------------------------------------------- checks
def run_checks():
    polys = {n: hole_poly(h) for n, h in HOLES.items()}
    res = {}
    # hole to hole
    pairs = [(a, b, poly_poly(polys[a], polys[b])) for a in polys for b in polys if a > b]
    a, b, dmin = min(pairs, key=lambda t: t[2])
    res["hole_hole"] = (dmin, f"{a}-{b}")
    assert dmin >= 1.2 - 1e-6, f"holes {a} and {b} only {dmin:.2f} m apart"
    # walls / flats / plaza edge
    wall = []
    for n, P in polys.items():
        wall.append((min(p[1] for p in P) - FLATS_N, n, "north flats"))
        wall.append((FLATS_S - max(p[1] for p in P), n, "south flats"))
        wall.append((EAST_LIM - max(p[0] for p in P), n, "east limit"))
        assert min(p[0] for p in P) >= PLAZA[0] - 1e-6, f"hole {n} west of the plaza"
    w = min(wall)
    res["hole_wall"] = (w[0], f"{w[1]} to {w[2]}")
    assert w[0] >= 1.2 - 1e-6, f"hole {w[1]} {w[0]:.2f} m from {w[2]}"
    # power cables
    cab = []
    for n, P in polys.items():
        for cid, (pl, _) in POWER.items():
            for s0, s1 in zip(pl[:-1], pl[1:]):
                cab.append((poly_seg(P, s0, s1), n, cid))
    c = min(cab)
    res["hole_cable"] = (c[0], f"{c[1]} to {c[2]}")
    assert c[0] >= 0.5 - 1e-6, f"hole {c[1]} {c[0]:.2f} m from {c[2]}"
    # boulevard and hub
    bl = rect_poly(*BLVD)
    for n, P in polys.items():
        assert poly_poly(P, bl) >= -1e-9 and not any(BLVD[1] + 1e-6 < p[1] < BLVD[3] - 1e-6 for p in P), f"hole {n} on the boulevard"
    hub = rect_poly(*HUB)
    hd = min((poly_poly(P, hub), n) for n, P in polys.items())
    res["hole_hub"] = (hd[0], f"{hd[1]}")
    assert hd[0] >= 1.5 - 1e-6, f"hole {hd[1]} {hd[0]:.2f} m from the hub"
    res["hub_east"] = (EAST_LIM - HUB[2], "hub to plaza east edge")
    assert res["hub_east"][0] >= 1.5 - 1e-6
    # walk route: every hop keeps a 1.2 m corridor (0.6 m each side) clear of every hole
    worst = (9, "")
    for name, route in (("A", ROUTE_A), ("B", ROUTE_B)):
        for s0, s1 in segs(route):
            for n, P in polys.items():
                d = poly_seg(P, s0, s1)
                if d < worst[0]:
                    worst = (d, f"district {name}, near hole {n}")
        side = [p[1] for s in segs(route) for p in s]
        if name == "A":
            assert max(side) <= HUB[1] + 1e-6, "district A route crosses the boulevard"
        else:
            assert min(side) >= HUB[3] - 1e-6, "district B route crosses the boulevard"
    res["route_corridor"] = (2 * worst[0], worst[1])
    assert worst[0] >= 0.6 - 1e-6, f"walkway only {2 * worst[0]:.2f} m wide, {worst[1]}"
    # route does not cross itself (non-adjacent segments)
    allseg = segs(ROUTE_A) + segs(ROUTE_B)
    for i in range(len(allseg)):
        for j in range(i + 2, len(allseg)):
            if seg_intersect(*allseg[i], *allseg[j]):
                res.setdefault("route_crossings", []).append((i, j))
    # U case: runway extension built
    ext = rect_poly(EXT["x"][0], RW_Z0, EXT_X1, RW_Z1)
    ed = min((poly_poly(P, ext), n) for n, P in polys.items())
    res["hole_extension"] = (ed[0], f"{ed[1]}")
    route_hits_ext = any(poly_seg(ext, s0, s1) < 0.6 for s0, s1 in allseg)
    res["route_hits_extension"] = route_hits_ext
    return polys, res


def cable_crossings(route_segs):
    pts = []
    for s0, s1 in route_segs:
        for cid, (pl, _) in POWER.items():
            for c0, c1 in zip(pl[:-1], pl[1:]):
                if seg_intersect(s0, s1, c0, c1):
                    # intersection point
                    x1, z1 = s0; x2, z2 = s1; x3, z3 = c0; x4, z4 = c1
                    den = (x1 - x2) * (z3 - z4) - (z1 - z2) * (x3 - x4)
                    t = ((x1 - x3) * (z3 - z4) - (z1 - z3) * (x3 - x4)) / den
                    vertical = abs(c0[0] - c1[0]) < 1e-9
                    pts.append(((x1 + t * (x2 - x1), z1 + t * (z2 - z1)), vertical))
    return pts


# ---------------------------------------------------------------- svg helpers
class Canvas:
    def __init__(self, S, ox, oy, x0=0.0):
        self.S, self.ox, self.oy, self.x0 = S, ox, oy, x0
        self.els = []

    def X(self, x):
        return self.ox + (x - self.x0) * self.S

    def Z(self, z):
        return self.oy + z * self.S

    def add(self, s):
        self.els.append(s)

    def rect(self, x0, z0, x1, z1, fill, stroke="#5F5E5A", sw=0.75, rx=2, extra=""):
        self.add(f'<rect x="{self.X(x0):.1f}" y="{self.Z(z0):.1f}" width="{(x1 - x0) * self.S:.1f}" height="{(z1 - z0) * self.S:.1f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def poly(self, pts, fill, stroke="#0F6E56", sw=1, extra=""):
        p = " ".join(f"{self.X(a):.1f},{self.Z(b):.1f}" for a, b in pts)
        self.add(f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def pline(self, pts, stroke, sw=1, extra=""):
        p = " ".join(f"{self.X(a):.1f},{self.Z(b):.1f}" for a, b in pts)
        self.add(f'<polyline points="{p}" fill="none" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def line(self, x0, z0, x1, z1, stroke, sw=1, extra=""):
        self.add(f'<line x1="{self.X(x0):.1f}" y1="{self.Z(z0):.1f}" x2="{self.X(x1):.1f}" y2="{self.Z(z1):.1f}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def circle(self, x, z, r_px, fill, stroke="#5F5E5A", sw=0.75, extra=""):
        self.add(f'<circle cx="{self.X(x):.1f}" cy="{self.Z(z):.1f}" r="{r_px:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def text(self, x, z, t, size=11, fill="#444441", anchor="middle", weight="400", halo=False, extra=""):
        h = ' stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" paint-order="stroke"' if halo else ""
        self.add(f'<text x="{self.X(x):.1f}" y="{self.Z(z):.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}"{h} {extra}>{t}</text>')


def px_text(els, x, y, t, size=11, fill="#444441", anchor="start", weight="400"):
    els.append(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}">{t}</text>')


DEFS = '''<defs>
<marker id="arA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9z" fill="#BA7517"/></marker>
<marker id="arB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9z" fill="#534AB7"/></marker>
<marker id="arK" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#5F5E5A" stroke-width="1.5"/></marker>
<marker id="arK0" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M8 1L2 5L8 9" fill="none" stroke="#5F5E5A" stroke-width="1.5"/></marker>
<pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#C9C6BC" stroke-width="1.2"/></pattern>
<pattern id="hatchR" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#EDBDB6" stroke-width="0.8"/></pattern>
<pattern id="ramp" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="#F2C94C"/><line x1="0" y1="0" x2="0" y2="4" stroke="#2C2C2A" stroke-width="1.6"/></pattern>
</defs>'''


def svg_doc(W, H, title, desc, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * 2}" height="{H * 2}" viewBox="0 0 {W} {H}" role="img" font-family="{FONT}">\n'
            f'<title>{title}</title>\n<desc>{desc}</desc>\n{DEFS}\n'
            f'<rect x="0" y="0" width="{W}" height="{H}" fill="#FFFFFF"/>\n' + "\n".join(body) + "\n</svg>")


# ---------------------------------------------------------------- shared room drawing
def draw_room(cv, x_lo=0.0, x_hi=None, detail=True, labels=True, zones_light=False):
    x_hi = L_ROOM if x_hi is None else x_hi
    cv.rect(x_lo, 0, x_hi, D_ROOM, "#FAFAF7", "#888780", 1, 3)
    # dark blocks along the top wall
    cv.rect(max(x_lo, STAGE["x"][1]), 0, x_hi, 1.2, "#E7E5DE", "#B4B2A9", 0.5, 0)
    if x_lo < STAGE["x"][1]:
        cv.rect(STAGE["x"][0] + 0.15, 0.15, STAGE["x"][1] - 0.15, D_ROOM - 0.15, "#F1EFE8", "#B4B2A9", 0.75, 2)
    # runway + possible extension
    cv.rect(max(x_lo, RW["x"][0]), RW_Z0, RW_X1, RW_Z1, "#D9D6CC", "#5F5E5A", 1, 1)
    cv.rect(EXT["x"][0], RW_Z0, EXT_X1, RW_Z1, "none", "#5F5E5A", 1, 1, 'stroke-dasharray="5 4"')
    # booth
    cv.rect(BOOTH_X0, BOOTH["z"][0], L_ROOM - 0.1, BOOTH["z"][1], "#F1EFE8", "#5F5E5A", 0.75, 2)


def draw_cables(cv, power_w=1.4, data=True, label=False):
    for cid, (pl, lab) in POWER.items():
        cv.pline(pl, "#E24B4A", power_w, 'stroke-linecap="round"')
    if data:
        for pl in DATA:
            cv.pline(pl, "#3B8BD9", 0.9, 'stroke-dasharray="3 2.5"')
        for x, z in APS:
            cv.circle(x, z, 3.2, "#FFFFFF", "#3B8BD9", 1)


# ================================================================= FIGURE 1: zone options
def figure_zone_options(stats):
    S = 20.0
    OX, OY = 62, 170
    cv = Canvas(S, OX, OY)
    W = int(OX + L_ROOM * S + 120)
    draw_room(cv)
    # audience zone hatch (assumption)
    for z0, z1 in ((ZA["z"][0], RW_Z0), (RW_Z1, ZB["z"][1])):
        cv.rect(STAGE["x"][1], z0, 24.0, z1, "url(#hatch)", "#B4B2A9", 0.5, 0)
    cv.text(15.0, 7.4, "Assumed countdown audience zone", 11, "#5F5E5A", weight="500", halo=True)
    cv.text(15.0, 8.2, "(x 6–24 both sides; to confirm)", 10, "#5F5E5A", halo=True)
    cv.text(15.0, 20.6, "Assumed countdown audience zone", 11, "#5F5E5A", weight="500", halo=True)
    cv.text(15.0, 21.4, "(to confirm)", 10, "#5F5E5A", halo=True)
    # booth sightline corridor
    corr = [(RW_X1, RW_Z0), (BOOTH_X0, BOOTH["z"][0]), (BOOTH_X0, BOOTH["z"][1]), (RW_X1, RW_Z1)]
    cv.poly(corr, "#FBE3D6", "#D85A30", 0.75, 'fill-opacity="0.75" stroke-dasharray="4 3"')
    cv.text((RW_X1 + EXT_X1) / 2 + 9.3, RW_ZC - 0.15, "Keep props ≤ 1.5 m: booth sightline to the stage (to confirm)", 10, "#712B13", halo=True)
    draw_cables(cv)
    # labels
    cv.text(3.0, 13.0, "Stage", 13, "#2C2C2A", weight="600")
    cv.text(3.0, 14.0, "(depth ≈ 6 m, est.)", 9.5, "#5F5E5A")
    cv.text((RW["x"][0] + RW_X1) / 2 - 1.0, RW_ZC + 0.35, "Runway (raised, part of stage, confirmed)", 11, "#2C2C2A", weight="600")
    cv.text((EXT["x"][0] + EXT_X1) / 2, RW_Z1 + 0.9, "possible extension, est. ±1 m, not confirmed", 9.5, "#444441", halo=True)
    cv.text(12.0, RW_Z0 - 0.45, "no cross-arm (team, 18 Nov): stage + runway form the cross", 9.5, "#993C1D", "middle", halo=True)
    cv.text(53.3, BOOTH["z"][0] - 0.4, "Booth (guess)", 10, "#444441", halo=True)
    cv.text(28.0, 0.8, "Dark blocks along the top wall: doors or exits? (to confirm)", 9.5, "#5F5E5A")
    # cable labels
    cv.text(24.5, 2.35, "north run (est.)", 9, "#A32D2D", halo=True)
    cv.text(24.5, 24.25, "south run (est.)", 9, "#A32D2D", halo=True)
    cv.text(41.0, 25.75, "main trunk along bottom wall (est.)", 9, "#A32D2D", halo=True)
    cv.text(TRUNK_X - 0.3, 5.6, "trunk at tip (est.)", 9, "#A32D2D", "end", halo=True)
    cv.text(34.4, 18.6, "ND31 (est.)", 9, "#A32D2D", "start", halo=True)
    cv.text(43.6, 19.6, "D42 (est.)", 9, "#A32D2D", "start", halo=True)
    cv.text(39.7, 6.4, "D53 (est.)", 9, "#A32D2D", "start", halo=True)
    cv.text(46.0, 10.0, "Wi-Fi APs + data (est.)", 9, "#1F5F9E", "start", halo=True)
    for p in dims["power_flags"]:
        px_, pz_ = p["approx_position"]["x"], p["approx_position"]["z"]
        cv.circle(px_, pz_, 0.9 * S, "none", "#A32D2D", 0.75, 'stroke-dasharray="3 3"')
        cv.circle(px_, pz_, 4, "#FCEBEB", "#A32D2D", 1)
        cv.text(px_ + 1.2, pz_ + 0.3, f'{p["node"]} {p["load_percent"]}% load', 9.5, "#791F1F", "start", weight="500", halo=True)
    cv.text(8.5, 26.4, "Other vertical drops cross both halves every few metres: not mapped, see source screenshots.", 9, "#5F5E5A", "start", halo=True)
    # dimension lines (measured)
    def dim_x(x0, x1, zz, label):
        cv.line(x0, zz, x1, zz, "#5F5E5A", 0.8, 'marker-start="url(#arK0)" marker-end="url(#arK)"')
        cv.line(x0, zz - 0.35, x0, zz + 0.35, "#5F5E5A", 0.8)
        cv.line(x1, zz - 0.35, x1, zz + 0.35, "#5F5E5A", 0.8)
        cv.text((x0 + x1) / 2, zz - 0.25, label, 10, "#2C2C2A", weight="500", halo=True)

    def dim_z(z0, z1, xx, label):
        cv.line(xx, z0, xx, z1, "#5F5E5A", 0.8, 'marker-start="url(#arK0)" marker-end="url(#arK)"')
        cv.add(f'<text x="{cv.X(xx) + 6:.1f}" y="{cv.Z((z0 + z1) / 2):.1f}" font-size="10" fill="#2C2C2A" font-weight="500" transform="rotate(90 {cv.X(xx) + 6:.1f} {cv.Z((z0 + z1) / 2):.1f})" text-anchor="middle">{label}</text>')

    dim_x(STAGE["x"][1], BOOTH_X0, -2.1, "45.95 m stage edge → booth (measured)")
    dim_x(RW_X1, BOOTH_X0, -0.9, "20.73 m runway tip → booth (measured)")
    dim_z(ZA["z"][0], RW_Z0, L_ROOM + 0.9, "11.62 m (measured)")
    dim_z(RW_Z1, ZB["z"][1], L_ROOM + 0.9, "11.58 m (measured)")
    # ticks
    for xx in range(0, 56, 5):
        cv.line(xx, D_ROOM, xx, D_ROOM + 0.35, "#888780", 0.8)
        cv.text(xx, D_ROOM + 1.0, f"{xx}", 9, "#888780")
    for zz in range(0, 28, 5):
        cv.line(-0.35, zz, 0, zz, "#888780", 0.8)
        cv.text(-0.55, zz + 0.25, f"{zz}", 9, "#888780", "end")
    cv.text(L_ROOM / 2, D_ROOM + 1.75, "x (m) from the stage-end wall · room 54.7 × 27.1 m (planning-tool tooltip)", 9.5, "#888780")

    # ---- three small multiples
    s = 6.5
    ty = cv.Z(D_ROOM) + 78
    gap = (W - 2 * OX + 20 - 3 * L_ROOM * s) / 2
    opts = [
        ("A", "Strip (the v1 layout)", [rect_poly(ZA["x"][0], ZA["z"][0], ZA["x"][1], ZA["z"][1])], "#9FE1CB", "#0F6E56",
         f"≈ {stats['A']:.0f} m² gross", ["Long and thin (46 × 11.6 m): forces a line.", "Shares the floor with the audience zone."]),
        ("B", "Plaza at the runway tip", [rect_poly(*PLAZA)], "#FFE2A8", "#BA7517",
         f"≈ {stats['B']:.0f} m² gross; ≈ {stats['B_U']:.0f} m² as a U if the extension is built",
         ["The only square-ish floor (19.7 × 25.6 m); both halves", "meet here. Away from the countdown crowd.", "Booth sightline and two drops cross it."]),
        ("C", "U around the runway", [rect_poly(24.0, ZA["z"][0], PLAZA[2], RW_Z0), rect_poly(24.0, RW_Z1, PLAZA[2], ZB["z"][1]), rect_poly(RW_X1, RW_Z0, PLAZA[2], RW_Z1)],
         "#CFE3F7", "#185FA5", f"≈ {stats['C']:.0f} m² gross",
         ["Most floor, but the runway splits it: the halves", "only join beyond the tip. Takes floor from the party", "and edges the audience zone."]),
    ]
    for i, (key, name, polys, fill, stroke, area_s, notes) in enumerate(opts):
        mx = OX - 10 + i * (L_ROOM * s + gap)
        mc = Canvas(s, mx, ty + 34)
        px_text(cv.els, mx, ty, f"Option {key}: {name}", 13, "#2C2C2A", weight="600")
        px_text(cv.els, mx, ty + 18, area_s, 10.5, stroke, weight="500")
        mc.rect(0, 0, L_ROOM, D_ROOM, "#FAFAF7", "#888780", 0.8, 2)
        mc.rect(STAGE["x"][0] + 0.15, 0.15, STAGE["x"][1] - 0.15, D_ROOM - 0.15, "#F1EFE8", "#B4B2A9", 0.5, 1)
        for z0, z1 in ((ZA["z"][0], RW_Z0), (RW_Z1, ZB["z"][1])):
            mc.rect(STAGE["x"][1], z0, 24.0, z1, "url(#hatch)", "none", 0, 0)
        for P in polys:
            mc.poly(P, fill, stroke, 1.2, 'fill-opacity="0.85"')
        mc.rect(RW["x"][0], RW_Z0, RW_X1, RW_Z1, "#D9D6CC", "#5F5E5A", 0.8, 0)
        mc.rect(EXT["x"][0], RW_Z0, EXT_X1, RW_Z1, "none", "#5F5E5A", 0.8, 0, 'stroke-dasharray="3 2"')
        mc.rect(BOOTH_X0, BOOTH["z"][0], L_ROOM - 0.1, BOOTH["z"][1], "#F1EFE8", "#5F5E5A", 0.6, 1)
        if key == "B":
            mc.line(EXT_X1, RW_Z0 - 0.2, EXT_X1, RW_Z1 + 0.2, "#BA7517", 1.2, 'stroke-dasharray="2 2"')
        cv.els += mc.els
        for k, ln in enumerate(notes):
            px_text(cv.els, mx, ty + 34 + D_ROOM * s + 16 + k * 14, ln, 10.5, "#444441")
    H = int(ty + 34 + D_ROOM * s + 16 + 3 * 14 + 46)
    ly = H - 30
    leg = []
    lx = OX
    items = [("#D9D6CC", "#5F5E5A", "Runway (confirmed)", "rect"), ("none", "#5F5E5A", "Possible extension (est.)", "dash"),
             ("url(#hatch)", "#B4B2A9", "Assumed audience zone", "rect"), ("#FBE3D6", "#D85A30", "Booth sightline corridor", "rect")]
    for fill, stroke, lab, kind in items:
        da = ' stroke-dasharray="4 3"' if kind == "dash" else ""
        leg.append(f'<rect x="{lx}" y="{ly - 11}" width="16" height="12" rx="1" fill="{fill}" stroke="{stroke}"{da}/>')
        px_text(leg, lx + 22, ly, lab, 10.5)
        lx += 40 + len(lab) * 5.8
    leg.append(f'<line x1="{lx}" y1="{ly - 5}" x2="{lx + 22}" y2="{ly - 5}" stroke="#E24B4A" stroke-width="2"/>')
    px_text(leg, lx + 28, ly, "Power cable (est.)", 10.5)
    lx += 140
    leg.append(f'<line x1="{lx}" y1="{ly - 5}" x2="{lx + 22}" y2="{ly - 5}" stroke="#3B8BD9" stroke-width="1" stroke-dasharray="3 2.5"/><circle cx="{lx + 11}" cy="{ly - 5}" r="3.2" fill="#fff" stroke="#3B8BD9"/>')
    px_text(leg, lx + 28, ly, "Wi-Fi AP + data cable (est.; floor or rigged?)", 10.5)
    px_text(leg, OX, H - 10, "Source: floorplan/auditorium-dimensions-v1-cable-plan.json and floorplan/source-screenshots/ · drops and Wi-Fi points scaled off screenshots 01 and 04 (≈ ±1 m) · regenerate with tools/make_zone_options.py", 9.5, "#5F5E5A")
    head = []
    px_text(head, OX, 38, "Where a “city” course could go: three zones, now that the runway is confirmed", 18, "#2C2C2A", weight="600")
    px_text(head, OX, 60, "To scale (20 px = 1 m). Measured values are marked “measured”; everything else is an estimate or a guess to confirm. The runway is raised, so nobody walks across it:", 12, "#5F5E5A")
    px_text(head, OX, 77, "the two floor halves only connect beyond its tip (x 31.2 → booth). If the dashed extension is built, that open floor shrinks from ≈ 20.7 m to ≈ 12.1 m deep.", 12, "#5F5E5A")
    body = head + cv.els + leg
    svg = svg_doc(W, H, "Zone options for the mini golf city",
                  "To-scale plan of the auditorium with the confirmed runway, its possible extension, estimated cables, an assumed audience zone, the booth sightline, and three candidate golf zones with gross areas.",
                  body)
    return svg, W, H


# ================================================================= FIGURE 2: plaza layout
def hole_glyph(n, h, S, fill, stroke="#0F6E56"):
    """SVG for one hole in local coordinates (u along the lane from -L/2 at the tee; v across)."""
    L, W = h["L"], h["W"]
    o = []

    def P(pts, f=fill, st=stroke, sw=1.0):  # pts in (v, a) with a measured from the tee
        q = " ".join(f"{(a - L / 2) * S:.1f},{v * S:.1f}" for v, a in pts)
        o.append(f'<polygon points="{q}" fill="{f}" stroke="{st}" stroke-width="{sw}"/>')

    def R(v0, a0, v1, a1, f=fill, st=stroke, sw=1.0, extra=""):
        o.append(f'<rect x="{(a0 - L / 2) * S:.1f}" y="{v0 * S:.1f}" width="{(a1 - a0) * S:.1f}" height="{(v1 - v0) * S:.1f}" fill="{f}" stroke="{st}" stroke-width="{sw}" {extra}/>')

    def C(v, a, r, f=fill, st=stroke, sw=1.0):
        o.append(f'<circle cx="{(a - L / 2) * S:.1f}" cy="{v * S:.1f}" r="{r * S:.1f}" fill="{f}" stroke="{st}" stroke-width="{sw}"/>')

    def Ln(v0, a0, v1, a1, st="#04342C", sw=1.5, extra=""):
        o.append(f'<line x1="{(a0 - L / 2) * S:.1f}" y1="{v0 * S:.1f}" x2="{(a1 - L / 2) * S:.1f}" y2="{v1 * S:.1f}" stroke="{st}" stroke-width="{sw}" {extra}/>')

    cup = None
    if n == 10:
        R(-0.6, 0, 0.6, 5.0); Ln(-0.6, 2.5, 0.6, 2.5, "#0F6E56", 1, 'stroke-dasharray="2 2"'); cup = (0, 4.4)
    elif n == 9:
        P([(-1.2, 0), (0, 0), (0, 3.8), (1.2, 3.8), (1.2, 5.0), (-1.2, 5.0)]); Ln(-1.2, 4.2, -0.6, 5.0, "#0F6E56", 2); cup = (0.7, 4.4)
    elif n == 8:
        R(-0.6, 0, 0.6, 6.0)
        for ang in (45, 135):
            r = 0.9
            Ln(-r * math.sin(math.radians(ang)), 3.0 - r * math.cos(math.radians(ang)), r * math.sin(math.radians(ang)), 3.0 + r * math.cos(math.radians(ang)), "#04342C", 2.2)
        cup = (0, 5.4)
    elif n == 7:
        R(-0.9, 0, 0.9, 5.0)
        for r_ in range(5):
            for c_ in range(5 if r_ % 2 == 0 else 4):
                off = -0.6 + c_ * 0.3 + (0.15 if r_ % 2 else 0)
                C(off, 1.6 + r_ * 0.45, 0.045, "#04342C", "none", 0)
        cup = (0, 4.5)
    elif n == 6:
        P([(-0.5, 0), (0.5, 0), (0.5, 2.0), (1.2, 2.0), (1.2, 5.5), (-1.2, 5.5), (-1.2, 2.0), (-0.5, 2.0)])
        Ln(-1.2, 2.6, 1.2, 2.6, "#04342C", 2.5, 'stroke-dasharray="8 5"'); cup = (0.6, 4.9)
    elif n == 5:
        R(-0.6, 0, 0.6, 6.0); R(-0.6, 2.6, 0.6, 3.8, "#5DCAA5", "#0F6E56", 0.5); cup = (0, 5.4)
    elif n == 4:
        P([(-1.0, 0), (0.2, 0), (0.2, 3.0), (1.0, 3.0), (1.0, 5.0), (-1.0, 5.0)])
        R(-1.0, 2.6, 0.2, 3.4, "#D85A30", "#712B13", 0.75); cup = (0.5, 4.4)
    elif n == 3:
        R(-0.3, 0, 0.3, 2.7); C(0, 3.8, 1.2, "#B5D4F4", "#185FA5", 0.75); C(0, 3.8, 0.95); cup = (0.3, 4.0)
    elif n == 2:
        R(-0.5, 0, 0.5, 2.1); C(0, 3.5, 1.5)
        Ln(0, 3.5, 0.15, 2.3, "#04342C", 2); Ln(0, 3.5, -0.9, 3.35, "#04342C", 2)
        R(-1.5, 4.55, -1.1, 4.95, "#2C2C2A", "#2C2C2A", 0.5); cup = (0.6, 4.3)
    elif n == 1:
        R(-0.6, 0, 0.6, 6.0); Ln(-0.9, 1.0, 0.9, 1.0, "#993C1D", 3.5); cup = (0, 5.4)
    # tee mat
    o.append(f'<rect x="{(0.12 - L / 2) * S:.1f}" y="{-0.17 * S:.1f}" width="{0.34 * S:.1f}" height="{0.34 * S:.1f}" fill="#FFFFFF" stroke="#04342C" stroke-width="0.8"/>')
    if cup:
        o.append(f'<circle cx="{(cup[1] - L / 2) * S:.1f}" cy="{cup[0] * S:.1f}" r="{0.13 * S:.1f}" fill="#FFFFFF" stroke="#04342C" stroke-width="1.2"/>')
    return "".join(o)


PROP_AT = {8: (3.0, 0.0, "Windmill"), 4: (3.0, -0.4, "Barn"), 2: (4.75, -1.3, "Clock tower"), 1: (1.0, 0.0, "2027 arch")}


def star(cx, cy, r, fill="#2C2C2A"):
    pts = []
    for k in range(10):
        rr = r if k % 2 == 0 else r * 0.45
        a = math.radians(-90 + k * 36)
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="#FFFFFF" stroke-width="0.8"/>'


LABEL_AT = {  # where each hole's number + name go (world metres), and text anchor
    10: (41.2, 10.7, "middle"), 9: (36.0, 9.45, "middle"), 8: (35.3, 5.35, "middle"), 7: (43.0, 2.5, "middle"),
    6: (50.05, 9.3, "start"), 5: (40.3, 24.45, "middle"), 4: (30.95, 19.7, "vertical"), 3: (37.8, 16.95, "middle"),
    2: (45.6, 25.05, "middle"), 1: (50.3, 21.2, "start"),
}


def draw_plaza(cv, polys, mini=False, with_ext=False):
    S = cv.S
    # districts
    if not mini:
        cv.rect(PLAZA[0], PLAZA[1], PLAZA[2], BLVD[1], "#FFF9EC", "none", 0, 0)
        cv.rect(PLAZA[0], BLVD[3], PLAZA[2], PLAZA[3], "#F4F2FC", "none", 0, 0)
    # boulevard + sightline corridor
    cv.rect(*BLVD, "#F6F1E7", "#C9B48A", 0.75, 0, 'stroke-dasharray="6 4"')
    corr = [(RW_X1, RW_Z0), (BOOTH_X0, BOOTH["z"][0]), (BOOTH_X0, BOOTH["z"][1]), (RW_X1, RW_Z1)]
    cv.poly(corr, "url(#hatchR)", "#D85A30", 0.6, 'stroke-dasharray="3 3"')
    if with_ext:
        cv.rect(EXT["x"][0], RW_Z0, EXT_X1, RW_Z1, "#D9D6CC", "#5F5E5A", 0.8, 0)
    # plaza boundary
    cv.rect(*PLAZA, "none", "#BA7517", 1.0 if not mini else 0.7, 0, 'stroke-dasharray="7 4"')
    # skyline flats
    for x0, x1 in ((31.8, 37.6), (38.6, 44.4), (45.4, 50.6)):
        cv.rect(x0, FLATS_N - 0.4, x1, FLATS_N, "#4A4A63", "#2C2C2A", 0.5, 1)
    for x0, x1 in ((31.8, 37.6), (38.6, 44.4), (45.4, 50.6)):
        cv.rect(x0, FLATS_S, x1, FLATS_S + 0.4, "#4A4A63", "#2C2C2A", 0.5, 1)
    # hub
    cv.rect(*HUB, "#FDEEE8", "#993C1D", 1.0, 3)
    if not mini:
        for k in range(3):   # queue switchbacks
            zq = HUB[1] + 1.0 + k * 1.05
            cv.line(HUB[0] + 0.5, zq, HUB[0] + 3.2, zq, "#993C1D", 1, 'stroke-dasharray="2 2"')
        cv.rect(HUB[0] + 3.7, HUB[1] + 0.6, HUB[0] + 4.6, HUB[3] - 0.6, "#F4C7B5", "#993C1D", 0.8, 1)   # desk
    # cables
    draw_cables(cv, 1.4 if not mini else 1.0, data=not mini)
    # holes
    for n, h in HOLES.items():
        fill = "#9FE1CB" if n in HERO else "#CDEFE3"
        if mini:
            cv.poly(polys[n], fill, "#0F6E56", 0.8)
            c = h["c"]
            cv.text(c[0], c[1] + 0.35, str(n), 8, "#04342C", weight="600")
            continue
        cx, cz = h["c"]
        cv.add(f'<g transform="translate({cv.X(cx):.1f},{cv.Z(cz):.1f}) rotate({h["th"]})">{hole_glyph(n, h, S, fill)}</g>')
        cv.poly(polys[n], "none", "#9FCFBF", 0.6, 'stroke-dasharray="2 3"')
    return corr


def figure_plaza(polys, res, stats):
    S = 26.0
    XL, XR = 29.0, 55.0
    OX, OY = 56, 128
    cv = Canvas(S, OX, OY, XL)
    map_w = (XR - XL) * S
    PANEL_X = OX + map_w + 34
    W = int(PANEL_X + 372)
    # room context (cropped)
    cv.rect(XL, 0, L_ROOM, D_ROOM, "#FAFAF7", "#888780", 1, 0)
    cv.rect(XL, 0, L_ROOM, 1.2, "#E7E5DE", "#B4B2A9", 0.5, 0)
    cv.rect(XL, RW_Z0, RW_X1, RW_Z1, "#D9D6CC", "#5F5E5A", 1, 0)
    cv.rect(EXT["x"][0], RW_Z0, EXT_X1, RW_Z1, "none", "#9A988F", 0.8, 0, 'stroke-dasharray="5 4"')
    cv.rect(BOOTH_X0, BOOTH["z"][0], L_ROOM - 0.1, BOOTH["z"][1], "#F1EFE8", "#5F5E5A", 0.75, 2)
    draw_plaza(cv, polys)
    cv.rect(COVER_ALONG[0][0] - 0.22, COVER_ALONG[0][1], COVER_ALONG[1][0] + 0.12, COVER_ALONG[1][1], "url(#ramp)", "#2C2C2A", 0.5, 1, 'opacity="0.6"')
    # route
    for name, route, col, mk in (("A", ROUTE_A, "#BA7517", "arA"), ("B", ROUTE_B, "#534AB7", "arB")):
        for hop in route:
            cv.pline(hop, col, 1.7, f'stroke-dasharray="5 3" stroke-linecap="round" marker-end="url(#{mk})"')
    # cable ramps / covers
    ramps = cable_crossings(segs(ROUTE_A) + segs(ROUTE_B))
    for zc in (RW_ZC,):   # boulevard crossings by the two drops
        for xc in (34.1, 43.3):
            ramps.append(((xc, zc), True))
    for (xr, zr), vertical in ramps:
        if vertical:
            cv.rect(xr - 0.5, zr - 0.18, xr + 0.5, zr + 0.18, "url(#ramp)", "#2C2C2A", 0.6, 1)
        else:
            cv.rect(xr - 0.18, zr - 0.5, xr + 0.18, zr + 0.5, "url(#ramp)", "#2C2C2A", 0.6, 1)
    # hero props
    for n, (a, v, lab) in PROP_AT.items():
        h = HOLES[n]
        wx, wz = local_to_world(h, a - h["L"] / 2, v)
        cv.add(star(cv.X(wx), cv.Z(wz), 7.5))
    # hole labels
    for n, (lx, lz, anc) in LABEL_AT.items():
        if anc == "vertical":
            cv.text(lx, lz, f"{n} · {NAMES[n]}", 10.5, "#085041", "middle", weight="600", halo=True,
                    extra=f'transform="rotate(-90 {cv.X(lx):.1f} {cv.Z(lz):.1f})"')
        else:
            cv.text(lx, lz, f"{n} · {NAMES[n]}", 10.5, "#085041", anc, weight="600", halo=True)
    # text on plan
    cv.text(41.2, 13.5, "Boulevard: open walkway on the runway axis · props ≤ 1.5 m (booth sightline)", 9.5, "#7A5B1E", halo=True)
    cv.text(37.6, 15.05, "overflow queue space ≈ " + f"{stats['blvd_queue']:.0f} m²", 9, "#7A5B1E", halo=True)
    cv.text((HUB[0] + HUB[2]) / 2, HUB[1] + 0.75 - 0.35, "HUB", 11, "#712B13", weight="700")
    cv.text(HUB[0] + 1.85, HUB[3] - 0.45, "queue", 9, "#712B13")
    cv.text(HUB[0] + 4.15, HUB[3] + 0.0 - 4.55, "", 9, "#712B13")
    cv.add(f'<text x="{cv.X(HUB[0] + 4.15):.1f}" y="{cv.Z((HUB[1] + HUB[3]) / 2):.1f}" font-size="8.5" fill="#712B13" text-anchor="middle" transform="rotate(-90 {cv.X(HUB[0] + 4.15):.1f} {cv.Z((HUB[1] + HUB[3]) / 2):.1f})">putters · balls · ball return</text>')
    cv.text(44.4, 5.75, "District A", 13, "#8A5A0F", weight="700", halo=True)
    cv.text(44.4, 6.4, "holes 10 → 6 · loop", 9.5, "#8A5A0F", halo=True)
    cv.text(39.9, 20.75, "District B", 13, "#3F3799", weight="700", halo=True)
    cv.text(39.9, 21.4, "holes 5 → 1 · loop", 9.5, "#3F3799", halo=True)
    cv.text(41.0, 0.85, "skyline flats 2.4–3.6 m (painted city silhouettes) · keep any exits clear", 9, "#2C2C2A")
    cv.text(41.0, 26.45, "skyline flats 2.4–3.6 m in front of the main trunk", 9, "#2C2C2A")
    cv.text(31.0, RW_ZC + 0.3, "Runway", 10, "#2C2C2A", "end", weight="600")
    cv.text((EXT["x"][0] + EXT_X1) / 2 + 0.6, RW_Z0 - 0.25, "possible extension (est., not confirmed)", 8.5, "#6E6C64", halo=True)
    cv.text(53.3, BOOTH["z"][0] - 0.35, "Booth", 9.5, "#444441", halo=True)
    cv.text(53.3, 3.0, "unknown", 8.5, "#888780")
    cv.text(53.3, 3.6, "(≈ 2.7 m to", 8.5, "#888780")
    cv.text(53.3, 4.2, "end wall)", 8.5, "#888780")
    cv.text(TRUNK_X + 0.2, 10.25, "trunk (est.)", 8.5, "#A32D2D", "start", halo=True)
    cv.text(43.1, 12.45, "D42 (est.)", 8.5, "#A32D2D", "end", halo=True)
    cv.text(33.85, 11.15, "ND31 (est.)", 8.5, "#A32D2D", "end", halo=True)
    cv.text(39.6, 2.2, "D53 (est.)", 8.5, "#A32D2D", "start", halo=True)
    cv.text(42.98, 20.0, "cable cover along walkway", 8, "#2C2C2A", "middle", halo=True,
            extra=f'transform="rotate(-90 {cv.X(42.98):.1f} {cv.Z(20.0):.1f})"')
    n_map = len(cv.els)
    # ticks
    for xx in range(30, 56, 5):
        cv.line(xx, D_ROOM, xx, D_ROOM + 0.3, "#888780", 0.8)
        cv.text(xx, D_ROOM + 0.95, f"x {xx}", 9, "#888780")
    for zz in range(0, 28, 5):
        cv.line(XL - 0.3, zz, XL, zz, "#888780", 0.8)
        cv.text(XL - 0.45, zz + 0.2, f"z {zz}", 9, "#888780", "end")
    # scale bar
    sb_y = cv.Z(D_ROOM) + 38
    cv.add(f'<rect x="{OX}" y="{sb_y}" width="{5 * S:.1f}" height="5" fill="#2C2C2A"/><text x="{OX + 5 * S + 6:.1f}" y="{sb_y + 6}" font-size="10" fill="#444441">5 m</text>')

    # ---- right panel
    pe = []
    y = OY + 4
    px_text(pe, PANEL_X, y, "How it plays", 13, "#2C2C2A", weight="600"); y += 18
    for ln in ["Two districts of 5 holes share one hub. Each", "district is a loop: leave the hub, play the 5 holes", "in order, end back beside the hub (6 and 1 finish", "next to it). A group can start at any open hole", "and play on until it's back where it started."]:
        px_text(pe, PANEL_X, y, ln, 10.5, "#444441"); y += 14
    y += 4
    pe.append(f'<rect x="{PANEL_X - 6}" y="{y - 13}" width="356" height="22" rx="3" fill="#FDEEE8" stroke="#993C1D" stroke-width="0.8"/>')
    px_text(pe, PANEL_X, y + 2, "Long queue: one district per group. Short queue: play both.", 10.5, "#712B13", weight="600"); y += 30
    px_text(pe, PANEL_X, y, "Legend", 13, "#2C2C2A", weight="600"); y += 16
    leg = [
        ("box", "#9FE1CB", "#0F6E56", "Hero hole (8, 4, 2, 1)"), ("box", "#CDEFE3", "#0F6E56", "Simple / mid hole"),
        ("star", None, None, "Tall prop (≈ 2–3 m, design target), kept off the axis"),
        ("lineA", None, None, "Walk route, district A (10 → 6)"), ("lineB", None, None, "Walk route, district B (5 → 1)"),
        ("box", "#FDEEE8", "#993C1D", "Hub: queue, putter & ball desk, ball return"),
        ("box", "#F6F1E7", "#C9B48A", "Boulevard (walkway, no holes)"), ("box", "url(#hatchR)", "#D85A30", "Booth sightline: props ≤ 1.5 m (to confirm)"),
        ("box", "#4A4A63", "#2C2C2A", "Skyline flats along the walls"),
        ("red", None, None, "Power cable / drop (est. ±1 m): no deck on top"),
        ("blue", None, None, "Wi-Fi AP + data cable (est.; floor or rigged?)"),
        ("ramp", None, None, "Cable ramp or cover where people walk"),
    ]
    for kind, f, st, lab in leg:
        if kind == "box":
            pe.append(f'<rect x="{PANEL_X}" y="{y - 10}" width="16" height="12" rx="2" fill="{f}" stroke="{st}"/>')
        elif kind == "star":
            pe.append(star(PANEL_X + 8, y - 4, 7))
        elif kind == "lineA":
            pe.append(f'<line x1="{PANEL_X}" y1="{y - 4}" x2="{PANEL_X + 18}" y2="{y - 4}" stroke="#BA7517" stroke-width="1.7" stroke-dasharray="5 3" marker-end="url(#arA)"/>')
        elif kind == "lineB":
            pe.append(f'<line x1="{PANEL_X}" y1="{y - 4}" x2="{PANEL_X + 18}" y2="{y - 4}" stroke="#534AB7" stroke-width="1.7" stroke-dasharray="5 3" marker-end="url(#arB)"/>')
        elif kind == "red":
            pe.append(f'<line x1="{PANEL_X}" y1="{y - 4}" x2="{PANEL_X + 18}" y2="{y - 4}" stroke="#E24B4A" stroke-width="2"/>')
        elif kind == "blue":
            pe.append(f'<line x1="{PANEL_X}" y1="{y - 4}" x2="{PANEL_X + 18}" y2="{y - 4}" stroke="#3B8BD9" stroke-width="1" stroke-dasharray="3 2.5"/><circle cx="{PANEL_X + 9}" cy="{y - 4}" r="3.2" fill="#fff" stroke="#3B8BD9"/>')
        elif kind == "ramp":
            pe.append(f'<rect x="{PANEL_X + 3}" y="{y - 9}" width="12" height="9" fill="url(#ramp)" stroke="#2C2C2A" stroke-width="0.6"/>')
        px_text(pe, PANEL_X + 26, y, lab, 10.5, "#444441")
        y += 17
    y += 6
    px_text(pe, PANEL_X, y, "Checks the script ran (all pass)", 13, "#2C2C2A", weight="600"); y += 16
    chk = [
        f"Hole to hole ≥ 1.2 m: min {res['hole_hole'][0]:.2f} m",
        f"Hole to wall / flats / plaza edge ≥ 1.2 m: min {res['hole_wall'][0]:.2f} m",
        f"Walkway corridor on every walk ≥ 1.2 m: min {res['route_corridor'][0]:.2f} m",
        f"Hole to hub ≥ 1.5 m: min {res['hole_hub'][0]:.2f} m · hub to edge {res['hub_east'][0]:.2f} m",
        f"Hole to power cable ≥ 0.5 m: min {res['hole_cable'][0]:.2f} m",
        f"Holes {stats['hole_bbox']:.0f} m² (bounding) in a {stats['B']:.0f} m² plaza ({100 * stats['hole_bbox'] / stats['B']:.0f}%)",
    ]
    for ln in chk:
        px_text(pe, PANEL_X, y, "✓ " + ln, 10.5, "#085041"); y += 14
    y += 12
    # ---- inset: U case
    px_text(pe, PANEL_X, y, "If the runway extension is built (U shape)", 13, "#2C2C2A", weight="600"); y += 10
    si = 8.2
    ic = Canvas(si, PANEL_X + 8, y + 6, 29.5)
    ic.rect(29.5, 0, L_ROOM, D_ROOM, "#FAFAF7", "#888780", 0.8, 0)
    ic.rect(29.5, RW_Z0, RW_X1, RW_Z1, "#D9D6CC", "#5F5E5A", 0.8, 0)
    ic.rect(BOOTH_X0, BOOTH["z"][0], L_ROOM - 0.1, BOOTH["z"][1], "#F1EFE8", "#5F5E5A", 0.6, 1)
    draw_plaza(ic, polys, mini=True, with_ext=True)
    for name, route, col in (("A", ROUTE_A, "#BA7517"), ("B", ROUTE_B, "#534AB7")):
        for hop in route:
            ic.pline(hop, col, 1.0, 'stroke-dasharray="3 2"')
    pe += ['<g clip-path="url(#cins)">'] + ic.els + ['</g>']
    iy = y + 6 + D_ROOM * si + 16
    verdict = ["Still fits. No hole moves: every hole stays", f"≥ 1.2 m from the extension (min {res['hole_extension'][0]:.2f} m), and", "neither district crosses the boulevard, so the", "routes don't change. West of x ≈ 41 the", "boulevard becomes two 1.2 m strips beside the", f"raised edge (mark it); overflow queue ≈ {stats['blvd_queue_ext']:.0f} m²."]
    for ln in verdict:
        px_text(pe, PANEL_X, iy, ln, 10.5, "#444441"); iy += 14
    H = int(max(cv.Z(D_ROOM) + 66, iy + 18)) + 26
    foot = []
    px_text(foot, OX, H - 14, "Source: floorplan/auditorium-dimensions-v1-cable-plan.json · docs/03-hole-spec-sheet.md (footprints, names) · cables, drops and Wi-Fi points scaled off screenshots 01 and 04 · tools/make_zone_options.py", 9.5, "#5F5E5A")
    head = []
    px_text(head, OX, 38, "Draft layout v2 (concept): 10 holes as a city plaza at the runway tip", 18, "#2C2C2A", weight="600")
    px_text(head, OX, 60, "Concept for discussion, not a construction drawing. To scale (26 px = 1 m). Positions estimated ±1 m. The dashed runway extension is unconfirmed.", 12, "#5F5E5A")
    px_text(head, OX, 77, "Hole footprints from the spec sheet. Confirm which floor cables and drops stay on the night before fixing any position: 75 mm decks cannot sit on a cable.", 12, "#5F5E5A")
    clip = (f'<clipPath id="cmap"><rect x="{cv.X(XL):.1f}" y="{cv.Z(0):.1f}" width="{(L_ROOM - XL) * S:.1f}" height="{D_ROOM * S:.1f}"/></clipPath>'
            f'<clipPath id="cins"><rect x="{ic.X(29.5):.1f}" y="{ic.Z(0):.1f}" width="{(L_ROOM - 29.5) * si:.1f}" height="{D_ROOM * si:.1f}"/></clipPath>')
    mapg = [clip, '<g clip-path="url(#cmap)">'] + cv.els[:n_map] + ['</g>'] + cv.els[n_map:]
    body = head + mapg + pe + foot
    svg = svg_doc(W, H, "Draft layout v2: the city plaza",
                  "Concept plan: 10 holes in two 5-hole districts looping from a shared hub on the runway axis at the runway tip, with boulevard, booth sightline, skyline flats, estimated cables and ramps, and an inset checking the U shape if the runway extension is built.",
                  body)
    return svg, W, H


# ---------------------------------------------------------------- render
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


def main():
    polys, res = run_checks()
    ext_area = (EXT_X1 - EXT["x"][0]) * (RW_Z1 - RW_Z0)
    stats = {
        "A": area(rect_poly(ZA["x"][0], ZA["z"][0], ZA["x"][1], ZA["z"][1])),
        "B": area(rect_poly(*PLAZA)),
        "C": (PLAZA[2] - 24.0) * (RW_Z0 - ZA["z"][0]) + (PLAZA[2] - 24.0) * (ZB["z"][1] - RW_Z1) + (PLAZA[2] - RW_X1) * (RW_Z1 - RW_Z0),
        "hole_bbox": sum(h["L"] * h["W"] for h in HOLES.values()),
        "blvd_queue": (HUB[0] - BLVD[0]) * (BLVD[3] - BLVD[1]),
    }
    stats["B_U"] = stats["B"] - ext_area
    stats["C_U"] = stats["C"] - ext_area
    stats["blvd_queue_ext"] = stats["blvd_queue"] - ext_area
    os.makedirs(OUT, exist_ok=True)
    s1, w1, h1 = figure_zone_options(stats)
    p1 = os.path.join(OUT, "zone-options.svg")
    open(p1, "w").write(s1)
    s2, w2, h2 = figure_plaza(polys, res, stats)
    p2 = os.path.join(OUT, "layout-draft-plaza.svg")
    open(p2, "w").write(s2)
    print(f"Zone A strip {stats['A']:.1f} m² · B plaza {stats['B']:.1f} m² (U with extension {stats['B_U']:.1f}) · "
          f"C U-around-runway {stats['C']:.1f} m² (with extension {stats['C_U']:.1f})")
    print(f"Open floor beyond runway tip: {BOOTH_X0 - RW_X1:.2f} m to booth face; {BOOTH_X0 - EXT_X1:.2f} m if extension built")
    print(f"Holes: bounding footprint {stats['hole_bbox']:.1f} m² ({100 * stats['hole_bbox'] / stats['B']:.0f}% of plaza)")
    for k in ("hole_hole", "hole_wall", "hole_cable", "hole_hub", "hub_east", "route_corridor", "hole_extension"):
        v, where = res[k]
        print(f"  {k:15s} min {v:.2f} m  ({where})")
    print(f"  route crossings (non-adjacent walk segments): {res.get('route_crossings', 'none')}")
    print(f"  extension blocks a walk route: {res['route_hits_extension']}")
    print(f"  overflow queue on boulevard: {stats['blvd_queue']:.0f} m² ({stats['blvd_queue_ext']:.0f} m² with extension)")
    print(f"  cable ramps on walk routes: {len(cable_crossings(segs(ROUTE_A) + segs(ROUTE_B)))} (+2 boulevard crossings, +1 cover along the hub -> 5 walkway)")
    if PNG:
        render_png(p1, p1[:-4] + ".png", w1, h1)
        render_png(p2, p2[:-4] + ".png", w2, h2)
        print("PNGs written")


if __name__ == "__main__":
    main()
