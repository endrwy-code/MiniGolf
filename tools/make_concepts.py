"""Concept renders of the 10 holes (isometric SVG, no dependencies).

Usage:
    python3 tools/make_concepts.py OUT_DIR

Writes, for each palette (neon, carnival):
    holes-<palette>.svg      10 hole cards, played 10 -> 1
    course-<palette>.svg     whole course in Zone A of the auditorium

Geometry follows docs/03-hole-spec-sheet.md and floorplan/layout-draft-zone-a.svg.
Local hole coordinates: u = along the lane from the tee (m), v = across the lane (m).
These are concept sketches for discussion, not construction drawings.
"""
import math
import os
import sys

C = math.cos(math.radians(30))
S = math.sin(math.radians(30))
DECK = 0.075      # deck top height (m)
RAIL_H = 0.10     # rail height above deck
RAIL_T = 0.06     # rail thickness

PALETTES = {
    "neon": dict(
        name="Neon Countdown", bg="#0f0e17", floor="#17161f", floor_line="#24222f",
        turf="#2a2d35", turf_dark="#22252c", fascia="#08080c", rail_top="#f4f2ec",
        rail_side="#b9b6ae", glow=True, prop_body="#15141c", prop_trim=None,
        text="#e9e6f5", sub="#9a96ad", board="#0b0a10", wood=None,
    ),
    "carnival": dict(
        name="Bright Carnival", bg="#f3efe6", floor="#e6e0d3", floor_line="#d6cfbf",
        turf="#3f8f4a", turf_dark="#357a3f", fascia=None, rail_top="#e2bd84",
        rail_side="#b98d55", glow=False, prop_body="#fbf7ef", prop_trim=None,
        text="#2c2a26", sub="#6b665c", board="#fffdf8", wood="#b98d55",
    ),
}


def hexmix(c1, c2, t):
    """Mix two #rrggbb colours: t=0 -> c1, t=1 -> c2."""
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    m = [round(a[k] + (b[k] - a[k]) * t) for k in range(3)]
    return "#%02x%02x%02x" % tuple(m)


def shade(col, nx, ny):
    """Darken a colour for a vertical face with outward normal (nx, ny)."""
    n = math.hypot(nx, ny) or 1
    nx, ny = nx / n, ny / n
    k = 0.30 - 0.18 * nx + 0.10 * ny  # +x faces lit (lighter), +y faces darker
    return hexmix(col, "#000000", max(0.05, min(0.6, k)))


def signed_area(poly):
    return 0.5 * sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1]
                     for i in range(len(poly)))


def circle_pts(cx, cy, r, a0=0, a1=360, n=40):
    pts = []
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


class Scene:
    def __init__(self, s, ox, oy, pal, map_fn=None):
        self.s, self.ox, self.oy, self.pal = s, ox, oy, pal
        self.map = map_fn or (lambda u, v: (u, v))
        self.layers = {"glow": [], "deck": [], "obj": []}

    # projection ---------------------------------------------------------
    def P(self, u, v, z):
        x, y = self.map(u, v)
        return (self.ox + (x - y) * C * self.s, self.oy + (x + y) * S * self.s - z * self.s)

    def depth(self, pts2):
        return sum(sum(self.map(u, v)) for u, v in pts2) / len(pts2)

    def path(self, pts3):
        return " ".join("%.1f,%.1f" % self.P(*p) for p in pts3)

    def add(self, layer, depth, svg):
        self.layers[layer].append((depth, svg))

    # primitives ---------------------------------------------------------
    def prism(self, poly, z0, z1, top, side=None, layer="obj", depth=None, top_stroke=None, extra_top=""):
        """Vertical extrusion of a 2D polygon (u, v)."""
        if signed_area([self.map(*p) for p in poly]) < 0:
            poly = poly[::-1]
        side = side or top
        faces = []
        n = len(poly)
        for i in range(n):
            a, b = poly[i], poly[(i + 1) % n]
            xa, ya = self.map(*a)
            xb, yb = self.map(*b)
            nx, ny = (yb - ya), -(xb - xa)  # outward normal for CCW polygon
            if nx + ny > 1e-9:
                d = (xa + ya + xb + yb) / 2
                pts = [(a[0], a[1], z0), (b[0], b[1], z0), (b[0], b[1], z1), (a[0], a[1], z1)]
                faces.append((d, '<polygon points="%s" fill="%s"/>' % (self.path(pts), shade(side, nx, ny))))
        faces.sort()
        svg = "".join(f for _, f in faces)
        st = ' stroke="%s" stroke-width="0.8"' % top_stroke if top_stroke else ""
        svg += '<polygon points="%s" fill="%s"%s/>' % (self.path([(u, v, z1) for u, v in poly]), top, st) + extra_top
        self.add(layer, self.depth(poly) if depth is None else depth, "<g>%s</g>" % svg)

    def box(self, u0, u1, v0, v1, z0, z1, top, side=None, **kw):
        self.prism([(u0, v0), (u1, v0), (u1, v1), (u0, v1)], z0, z1, top, side, **kw)

    def flat(self, poly, z, fill, layer="obj", depth=None, opacity=1.0, stroke=None, sw=1.0, filt=None):
        st = ' stroke="%s" stroke-width="%.1f"' % (stroke, sw) if stroke else ""
        f = ' filter="url(#%s)"' % filt if filt else ""
        op = ' opacity="%.2f"' % opacity if opacity < 1 else ""
        self.add(layer, self.depth(poly) if depth is None else depth,
                 '<polygon points="%s" fill="%s"%s%s%s/>' % (self.path([(u, v, z) for u, v in poly]), fill, st, op, f))

    def quad(self, pts3, fill, layer="obj", depth=None, opacity=1.0, stroke=None):
        st = ' stroke="%s" stroke-width="1"' % stroke if stroke else ""
        op = ' fill-opacity="%.2f"' % opacity if opacity < 1 else ""
        d = self.depth([(p[0], p[1]) for p in pts3]) if depth is None else depth
        self.add(layer, d, '<polygon points="%s" fill="%s"%s%s/>' % (self.path(pts3), fill, op, st))

    def line(self, pts3, stroke, sw, layer="obj", depth=None, filt=None, cap="round", opacity=1.0):
        f = ' filter="url(#%s)"' % filt if filt else ""
        op = ' opacity="%.2f"' % opacity if opacity < 1 else ""
        d = self.depth([(p[0], p[1]) for p in pts3]) if depth is None else depth
        self.add(layer, d, '<polyline points="%s" fill="none" stroke="%s" stroke-width="%.1f" stroke-linecap="%s" stroke-linejoin="round"%s%s/>'
                 % (self.path(pts3), stroke, sw, cap, op, f))

    def text_xface(self, u, v, z, txt, size_m, fill, layer="obj", depth=None, filt=None, weight=800):
        """Text painted on a face whose normal points +x (plane spanned by -y and z)."""
        x, y = self.P(u, v, z)
        f = ' filter="url(#%s)"' % filt if filt else ""
        # text-x -> world -y (screen (C, -S)), text-y(down) -> world -z (screen (0, 1))
        fs = size_m * self.s
        self.add(layer, (self.depth([(u, v)]) if depth is None else depth) + 0.001,
                 '<text transform="matrix(%.4f,%.4f,0,1,%.1f,%.1f)" font-size="%.1f" font-weight="%d" fill="%s" '
                 'text-anchor="middle" font-family="Helvetica, Arial, sans-serif"%s>%s</text>'
                 % (C, -S, x, y, fs, weight, fill, f, txt))

    def person(self, u, v, colour, h=1.7, layer="obj"):
        """Flat standing figure (for scale), drawn upright in screen space."""
        x, y = self.P(u, v, 0)
        k = self.s
        hd = 0.11 * k
        svg = ('<g opacity="0.9" fill="%s">'
               '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f"/>'
               '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f"/>'
               '<circle cx="%.1f" cy="%.1f" r="%.1f"/></g>') % (
            colour,
            x - 0.13 * k, y - 0.85 * k, 0.26 * k, 0.85 * k, 0.06 * k,          # legs
            x - 0.2 * k, y - (h - 0.25) * k, 0.4 * k, (h - 0.25 - 0.8) * k, 0.12 * k,  # torso
            x, y - (h - 0.12) * k, hd)
        self.add(layer, self.depth([(u, v)]) + 0.02, svg)

    def cylinder(self, u, v, r, z0, z1, fill, n=14, layer="obj"):
        pts = circle_pts(u, v, r, n=n)[:-1]
        self.prism(pts, z0, z1, fill, layer=layer)

    def render(self):
        out = []
        for name in ("glow", "deck", "obj"):
            items = self.layers[name]
            items.sort(key=lambda t: t[0])
            out += [svg for _, svg in items]
        return "\n".join(out)


# ---------------------------------------------------------------- hole kit
def deck_with_rails(sc, poly, neon, z0=0.0, z1=DECK, rail_paths=None, turf=None):
    """Deck prism + glow + rails along rail_paths (defaults to the full outline)."""
    pal = sc.pal
    turf = turf or pal["turf"]
    if pal["glow"]:
        sc.flat(poly, 0.0, neon, layer="glow", opacity=0.75, stroke=neon, sw=sc.s * 0.55, filt="glowBig")
        fascia = hexmix(neon, "#000000", 0.45)
    else:
        fascia = hexmix(neon, "#ffffff", 0.05)
    sc.prism(poly, z0, z1, turf, fascia, layer="deck", depth=sc.depth(poly) + z1 * 0.01)
    if rail_paths is None:
        rail_paths = [poly + [poly[0]]]
    for path in rail_paths:
        rails(sc, path, z1, neon)


def rails(sc, path, zb, neon):
    pal = sc.pal
    for i in range(len(path) - 1):
        (ua, va), (ub, vb) = path[i], path[i + 1]
        L = math.hypot(ub - ua, vb - va)
        if L < 1e-6:
            continue
        nu, nv = -(vb - va) / L * RAIL_T / 2, (ub - ua) / L * RAIL_T / 2
        q = [(ua + nu, va + nv), (ub + nu, vb + nv), (ub - nu, vb - nv), (ua - nu, va - nv)]
        sc.prism(q, zb, zb + RAIL_H, pal["rail_top"], pal["rail_side"])
        if pal["glow"]:
            # LED line under the cap: thin bright line on the rail just below the top
            sc.line([(ua, va, zb + RAIL_H - 0.02), (ub, vb, zb + RAIL_H - 0.02)], neon, 1.2,
                    depth=sc.depth(q) + 0.002, opacity=0.9)


def cup(sc, u, v, z, neon, big=False):
    r1 = 0.17 if big else 0.13
    ring = neon if sc.pal["glow"] else "#ffffff"
    sc.flat(circle_pts(u, v, r1, n=24), z + 0.002, ring, depth=sc.depth([(u, v)]) - 0.3,
            filt="glowSmall" if sc.pal["glow"] else None)
    sc.flat(circle_pts(u, v, 0.075, n=20), z + 0.003, "#050507", depth=sc.depth([(u, v)]) - 0.29)
    # flag
    sc.line([(u, v, z), (u, v, z + 0.62)], "#d8d6cf", 1.6, depth=sc.depth([(u, v)]) + 0.01)
    flag = "#ff3b6b" if not sc.pal["glow"] else neon
    sc.quad([(u, v, z + 0.62), (u, v - 0.24, z + 0.55), (u, v, z + 0.48)], flag, depth=sc.depth([(u, v)]) + 0.011)


def tee(sc, u, v, z, neon):
    col = "#111116" if sc.pal["glow"] else "#2a5f31"
    sc.flat([(u - 0.15, v - 0.15), (u + 0.15, v - 0.15), (u + 0.15, v + 0.15), (u - 0.15, v + 0.15)], z + 0.004, col,
            depth=sc.depth([(u, v)]) - 0.4, stroke=neon if sc.pal["glow"] else "#ffffff", sw=1)


def chevrons(sc, u, v, z, neon, n=2):
    col = neon if sc.pal["glow"] else "#ffffff"
    for k in range(n):
        uu = u + k * 0.28
        sc.flat([(uu, v - 0.16), (uu + 0.16, v), (uu, v + 0.16), (uu + 0.05, v)], z + 0.004, col,
                depth=sc.depth([(uu, v)]) - 0.35, filt="glowSmall" if sc.pal["glow"] else None, opacity=0.95)


def totem(sc, u, v, num, neon):
    pal = sc.pal
    post = "#26252e" if pal["glow"] else pal["wood"]
    sc.box(u - 0.04, u + 0.04, v - 0.04, v + 0.04, 0, 0.95, post)
    sc.box(u - 0.03, u + 0.03, v - 0.32, v + 0.32, 0.95, 1.75, neon,
           "#121119" if pal["glow"] else hexmix(neon, "#000000", 0.05),
           depth=sc.depth([(u, v)]) + 0.01)
    col = neon if pal["glow"] else "#ffffff"
    sc.text_xface(u + 0.031, v, 1.18, str(num), 0.58, col, depth=sc.depth([(u, v)]) + 0.02,
                  filt="glowText" if pal["glow"] else None)


def prop_colour(sc, neon, t=0.0):
    return hexmix(neon, "#000000", 0.55) if sc.pal["glow"] else hexmix(neon, "#ffffff", t)


# ---------------------------------------------------------------- holes
def h10(sc, n):
    neon = n["neon"]
    poly = [(0, -0.6), (5.0, -0.6), (5.0, 0.6), (0, 0.6)]
    deck_with_rails(sc, poly, neon)
    sc.box(2.25, 2.75, -0.57, 0.57, DECK, DECK + 0.04, hexmix(neon, "#000000", 0.25) if sc.pal["glow"] else "#e9c46a")
    chevrons(sc, 0.75, 0, DECK, neon)
    tee(sc, 0.35, 0, DECK, neon)
    cup(sc, 4.4, 0, DECK, neon)
    totem(sc, -0.45, -1.0, 10, neon)


def h9(sc, n):
    neon = n["neon"]
    poly = [(0, -1.2), (5.0, -1.2), (5.0, 1.2), (3.8, 1.2), (3.8, 0), (0, 0)]
    deck_with_rails(sc, poly, neon)
    # 45-degree bank wall in the corner
    a, b = (4.35, -1.2), (5.0, -0.55)
    L = math.hypot(b[0] - a[0], b[1] - a[1])
    nu, nv = -(b[1] - a[1]) / L * 0.05, (b[0] - a[0]) / L * 0.05
    wall = [(a[0] + nu, a[1] + nv), (b[0] + nu, b[1] + nv), (b[0] - nu, b[1] - nv), (a[0] - nu, a[1] - nv)]
    sc.prism(wall, DECK, DECK + 0.16, neon if sc.pal["glow"] else "#e76f51", hexmix(neon, "#000000", 0.4))
    sc.flat([(4.2, -1.15), (4.95, -1.15), (4.95, -0.4)], DECK + 0.003,
            hexmix(neon, "#000000", 0.6) if sc.pal["glow"] else "#2f7a3a", depth=sc.depth([(4.6, -0.9)]) - 0.5)
    chevrons(sc, 0.75, -0.6, DECK, neon)
    tee(sc, 0.35, -0.6, DECK, neon)
    cup(sc, 4.4, 0.65, DECK, neon)
    totem(sc, -0.45, -1.6, 9, neon)


def h8(sc, n):
    neon = n["neon"]
    poly = [(0, -0.6), (6.0, -0.6), (6.0, 0.6), (0, 0.6)]
    deck_with_rails(sc, poly, neon)
    glow = sc.pal["glow"]
    body = "#1b1a24" if glow else "#ffffff"
    trim = neon if glow else "#2a6fdb"
    # tapered tower straddling the lane
    z0, z1 = DECK, DECK + 1.55
    b = [(2.5, -0.72), (3.3, -0.72), (3.3, 0.72), (2.5, 0.72)]
    t = [(2.62, -0.5), (3.18, -0.5), (3.18, 0.5), (2.62, 0.5)]
    for i in range(4):
        a0, a1 = b[i], b[(i + 1) % 4]
        c0, c1 = t[i], t[(i + 1) % 4]
        nx, ny = (a1[1] - a0[1]), -(a1[0] - a0[0])
        if nx + ny > 0:
            col = body if not glow else body
            sc.quad([(a0[0], a0[1], z0), (a1[0], a1[1], z0), (c1[0], c1[1], z1), (c0[0], c0[1], z1)],
                    shade(col, nx, ny), depth=sc.depth(b) + 0.01 * i)
    # yellow corner trims (carnival) / neon edges
    for (bu, bv), (tu, tv) in zip(b, t):
        if bu > 2.9 or bv > 0:
            sc.line([(bu, bv, z0), (tu, tv, z1)], trim, 2.2, depth=sc.depth(b) + 0.05,
                    filt="glowSmall" if glow else None)
    # roof pyramid
    apex = (2.9, 0.0, z1 + 0.5)
    roof = "#2a6fdb" if not glow else hexmix(neon, "#000000", 0.35)
    for i in range(4):
        c0, c1 = t[i], t[(i + 1) % 4]
        nx, ny = (c1[1] - c0[1]), -(c1[0] - c0[0])
        if nx + ny > 0:
            sc.quad([(c0[0], c0[1], z1), (c1[0], c1[1], z1), apex], shade(roof, nx, ny), depth=sc.depth(b) + 0.06)
    # tunnel exit and windows on the +u face
    tunnel = [(3.301, 0.2, z0), (3.301, -0.2, z0), (3.301, -0.2, z0 + 0.18), (3.301, -0.1, z0 + 0.25),
              (3.301, 0.1, z0 + 0.25), (3.301, 0.2, z0 + 0.18)]
    sc.quad(tunnel, "#050507", depth=sc.depth(b) + 0.07, stroke=trim)
    for wz in (0.65, 1.0):
        zz = z0 + wz
        frac = wz / 1.55
        uu = 3.3 - (3.3 - 3.18) * frac + 0.002
        sc.quad([(uu, 0.09, zz), (uu, -0.09, zz), (uu, -0.09, zz + 0.16), (uu, 0.09, zz + 0.16)],
                neon if glow else "#bfe3ff", depth=sc.depth(b) + 0.07)
    # sails in the v-z plane in front of the +u face
    hub = (3.24, 0.0, z1 - 0.12)
    sail = neon if glow else "#e63946"
    for ang in (30, 120, 210, 300):
        a = math.radians(ang)
        dv, dz = math.cos(a), math.sin(a)
        pv, pz = -dz, dv
        L, w = 1.0, 0.13
        p0 = (hub[0] + 0.12, hub[1] + dv * 0.12 + pv * 0.0, hub[2] + dz * 0.12)
        pts = [(hub[0] + 0.12, hub[1] + dv * 0.15 + pv * w, hub[2] + dz * 0.15 + pz * w),
               (hub[0] + 0.12, hub[1] + dv * L + pv * w, hub[2] + dz * L + pz * w),
               (hub[0] + 0.12, hub[1] + dv * L - pv * w, hub[2] + dz * L - pz * w),
               (hub[0] + 0.12, hub[1] + dv * 0.15 - pv * w, hub[2] + dz * 0.15 - pz * w)]
        sc.quad(pts, hexmix(sail, "#000000", 0.25) if glow else sail, depth=sc.depth(b) + 0.2, opacity=0.9,
                stroke=sail)
        sc.line([(p0[0], hub[1], hub[2]), (hub[0] + 0.12, hub[1] + dv * L, hub[2] + dz * L)], sail, 1.6,
                depth=sc.depth(b) + 0.21, filt="glowSmall" if glow else None)
    sc.cylinder(hub[0] + 0.1, hub[1], 0.07, hub[2] - 0.07, hub[2] + 0.07, "#f4f2ec")
    chevrons(sc, 0.75, 0, DECK, neon)
    tee(sc, 0.35, 0, DECK, neon)
    cup(sc, 5.4, 0, DECK, neon)
    totem(sc, -0.45, -1.0, 8, neon)


def h7(sc, n):
    neon = n["neon"]
    glow = sc.pal["glow"]
    poly = [(0, -0.9), (5.0, -0.9), (5.0, 0.9), (0, 0.9)]
    deck_with_rails(sc, poly, neon)
    # graffiti backboard along the far side
    bb = "#121118" if glow else "#ffffff"
    sc.box(1.1, 4.7, -0.98, -0.92, DECK, DECK + 0.6, bb, "#2c2b33" if glow else "#d8d4ca")
    zig = []
    for i in range(19):
        uu = 1.2 + i * 0.19
        zig.append((uu, -0.919, DECK + (0.18 if i % 2 else 0.42)))
    sc.line(zig, neon if glow else "#e63946", 3, depth=sc.depth([(2.9, -0.9)]) + 0.02, filt="glowSmall" if glow else None)
    zig2 = [(p[0], p[1], p[2] + 0.1) for p in zig]
    sc.line(zig2, "#ffffff" if glow else "#1d3557", 1.5, depth=sc.depth([(2.9, -0.9)]) + 0.021)
    # pin field
    pin = "#f4f2ec"
    for r in range(5):
        for c in range(5 if r % 2 == 0 else 4):
            uu = 1.6 + r * 0.42
            vv = -0.6 + c * 0.3 + (0.15 if r % 2 else 0)
            sc.cylinder(uu, vv, 0.035, DECK, DECK + 0.1, pin, n=8)
            if glow:
                sc.flat(circle_pts(uu, vv, 0.05, n=8), DECK + 0.101, neon, depth=sc.depth([(uu, vv)]) + 0.001,
                        filt="glowSmall")
    # bumper blocks
    for vv in (-0.45, 0.45):
        sc.box(3.85, 4.1, vv - 0.13, vv + 0.13, DECK, DECK + 0.13, neon if glow else "#e63946",
               hexmix(neon, "#000000", 0.4) if glow else "#a4161a")
    chevrons(sc, 0.75, 0, DECK, neon)
    tee(sc, 0.35, 0, DECK, neon)
    cup(sc, 4.55, 0, DECK, neon)
    totem(sc, -0.45, -1.35, 7, neon)


def h6(sc, n):
    neon = n["neon"]
    glow = sc.pal["glow"]
    poly = [(0, -0.5), (2.0, -0.5), (2.0, -1.2), (5.5, -1.2), (5.5, 1.2), (2.0, 1.2), (2.0, 0.5), (0, 0.5)]
    deck_with_rails(sc, poly, neon)
    wall = neon if glow else "#2a9d8f"
    for v0, v1 in ((-1.2, -0.86), (-0.64, -0.11), (0.11, 0.64), (0.86, 1.2)):
        sc.box(2.55, 2.7, v0, v1, DECK, DECK + 0.32, hexmix(neon, "#000000", 0.5) if glow else wall,
               hexmix(neon, "#000000", 0.65) if glow else hexmix(wall, "#000000", 0.2), top_stroke=neon if glow else None)
    # three tunnel mouths marked
    for vc in (-0.75, 0.0, 0.75):
        sc.flat([(2.71, vc - 0.11), (2.85, vc - 0.11), (2.85, vc + 0.11), (2.71, vc + 0.11)], DECK + 0.003,
                "#050507" if glow else "#ffffff", depth=sc.depth([(2.78, vc)]) - 0.4, opacity=0.6)
    # dividers making long and short routes
    sc.box(2.7, 4.1, -0.45, -0.39, DECK, DECK + 0.1, "#f4f2ec", "#b9b6ae")
    sc.box(2.7, 3.6, 0.39, 0.45, DECK, DECK + 0.1, "#f4f2ec", "#b9b6ae")
    chevrons(sc, 0.6, 0, DECK, neon)
    tee(sc, 0.3, 0, DECK, neon)
    cup(sc, 4.95, 0.65, DECK, neon)
    totem(sc, -0.45, -0.95, 6, neon)


def h5(sc, n):
    neon = n["neon"]
    glow = sc.pal["glow"]
    hi = DECK + 0.2
    deck_with_rails(sc, [(0, -0.6), (2.6, -0.6), (2.6, 0.6), (0, 0.6)], neon,
                    rail_paths=[[(2.6, -0.6), (0, -0.6), (0, 0.6), (2.6, 0.6)]])
    deck_with_rails(sc, [(3.8, -0.6), (6.0, -0.6), (6.0, 0.6), (3.8, 0.6)], neon, z1=hi,
                    rail_paths=[[(3.8, -0.6), (6.0, -0.6), (6.0, 0.6), (3.8, 0.6)]])
    # ramp surface and its visible side
    ramp = hexmix(neon, "#000000", 0.35) if glow else "#e9c46a"
    sc.quad([(2.6, -0.6, DECK), (3.8, -0.6, hi), (3.8, 0.6, hi), (2.6, 0.6, DECK)], ramp, layer="deck",
            depth=sc.depth([(3.2, 0)]) + 0.01)
    for k in range(4):
        uu = 2.75 + k * 0.28
        zz = DECK + (uu - 2.6) / 1.2 * 0.2 + 0.003
        sc.line([(uu, -0.55, zz), (uu, 0.55, zz)], neon if glow else "#ffffff", 2, layer="deck",
                depth=sc.depth([(3.2, 0)]) + 0.02, filt="glowSmall" if glow else None)
    sc.quad([(2.6, 0.6, 0), (3.8, 0.6, 0), (3.8, 0.6, hi), (2.6, 0.6, DECK)],
            hexmix(neon, "#000000", 0.55) if glow else hexmix(neon, "#ffffff", 0.05), layer="deck",
            depth=sc.depth([(3.2, 0.6)]))
    # clear ball guards along the ramp and raised green
    for vv in (-0.63, 0.63):
        sc.quad([(2.6, vv, DECK), (3.8, vv, hi), (6.0, vv, hi), (6.0, vv, hi + 0.3), (3.8, vv, hi + 0.3),
                 (2.6, vv, DECK + 0.3)], "#cfe9ff", depth=sc.depth([(4.3, vv)]) + (0.5 if vv > 0 else -0.5),
                opacity=0.18, stroke=neon if glow else "#8ecae6")
    chevrons(sc, 0.75, 0, DECK, neon)
    tee(sc, 0.35, 0, DECK, neon)
    cup(sc, 5.4, 0, hi, neon)
    totem(sc, -0.45, -1.0, 5, neon)


def h4(sc, n):
    neon = n["neon"]
    glow = sc.pal["glow"]
    poly = [(0, -1.0), (5.0, -1.0), (5.0, 1.0), (3.0, 1.0), (3.0, 0.2), (0, 0.2)]
    deck_with_rails(sc, poly, neon)
    # barn straddling the entry lane, ridge along v
    u0, u1, v0, v1 = 2.6, 3.4, -1.08, 0.28
    wallh, ridge = 0.75, 1.15
    red = hexmix(neon, "#000000", 0.5) if glow else "#c1121f"
    trim = neon if glow else "#ffffff"
    sc.box(u0, u1, v0, v1, DECK, DECK + wallh, red, red)
    # gable on +u face (pentagon) and roof slopes
    zt, zr = DECK + wallh, DECK + ridge
    um = (u0 + u1) / 2
    sc.quad([(u1, v0, zt), (u1, v1, zt), (um, v1, zr), (um, v0, zr)], shade("#3a3a44" if glow else "#6b2c2c", 1, 0),
            depth=sc.depth([(um, (v0 + v1) / 2)]) + 0.1)
    sc.quad([(u1, v1, DECK), (u0, v1, DECK), (u0, v1, zt), (um, v1, zr), (u1, v1, zt)], shade(red, 0, 1),
            depth=sc.depth([(um, v1)]) + 0.1)
    vm = (v0 + v1) / 2
    for a, b in (((u1, v1, zt), (um, v1, zr)), ((um, v1, zr), (u0, v1, zt)), ((u1, v0, zt), (u1, v1, zt)),
                 ((u1, v0, DECK + 0.002), (u1, v0, zt))):
        sc.line([a, b], trim, 2, depth=sc.depth([(um, v1)]) + 0.12, filt="glowSmall" if glow else None)
    # tunnel exit with X doors on the +u face
    uf = u1 + 0.002
    sc.quad([(uf, vm + 0.22, DECK), (uf, vm - 0.22, DECK), (uf, vm - 0.22, DECK + 0.22), (uf, vm, DECK + 0.32),
             (uf, vm + 0.22, DECK + 0.22)], "#050507", depth=sc.depth([(u1, vm)]) + 0.11, stroke=trim)
    for vv in (vm - 0.45, vm + 0.45):
        sc.line([(uf, vv - 0.14, DECK + 0.25), (uf, vv + 0.14, DECK + 0.6)], trim, 1.6, depth=sc.depth([(u1, vm)]) + 0.12)
        sc.line([(uf, vv + 0.14, DECK + 0.25), (uf, vv - 0.14, DECK + 0.6)], trim, 1.6, depth=sc.depth([(u1, vm)]) + 0.12)
    chevrons(sc, 0.75, -0.4, DECK, neon)
    tee(sc, 0.35, -0.4, DECK, neon)
    cup(sc, 4.4, 0.5, DECK, neon)
    totem(sc, -0.45, -1.45, 4, neon)


def h3(sc, n):
    neon = n["neon"]
    glow = sc.pal["glow"]
    cu, r = 3.8, 1.2
    j = cu - math.sqrt(r * r - 0.3 * 0.3)
    moat = "#1e6fff" if glow else "#4cc9f0"
    sc.flat(circle_pts(cu, 0, 1.55, n=48)[:-1], 0.0, moat, layer="glow" if glow else "deck",
            opacity=0.9 if glow else 1.0, filt="glowBig" if glow else None, depth=-50)
    sc.flat(circle_pts(cu, 0, 1.5, n=48)[:-1], 0.01, hexmix(moat, "#000000", 0.35) if glow else moat, layer="deck",
            depth=-49, stroke="#ffffff" if not glow else moat, sw=1.2)
    # ripple lines
    for rr in (1.3, 1.42):
        sc.line([(cu + rr * math.cos(math.radians(a)), rr * math.sin(math.radians(a)), 0.012)
                 for a in range(-60, 61, 6)], "#ffffff", 1, layer="deck", depth=-48, opacity=0.5)
    island = circle_pts(cu, 0, r, n=48)[:-1]
    bridge = [(0, -0.3), (j + 0.05, -0.3), (j + 0.05, 0.3), (0, 0.3)]
    deck_with_rails(sc, island, neon, rail_paths=[circle_pts(cu, 0, r, 194.5, 525.5, n=44)])
    deck_with_rails(sc, bridge, neon, rail_paths=[[(j, -0.3), (0, -0.3), (0, 0.3), (j, 0.3)]],
                    turf=sc.pal["turf_dark"])
    tee(sc, 0.3, 0, DECK, neon)
    cup(sc, 4.15, 0.35, DECK, neon)
    totem(sc, -0.45, -0.75, 3, neon)


def h2(sc, n):
    neon = n["neon"]
    glow = sc.pal["glow"]
    cu, r = 3.6, 1.5
    j = cu - math.sqrt(r * r - 0.5 * 0.5)
    face = "#1c1b26" if glow else "#fbf7ef"
    deck_with_rails(sc, circle_pts(cu, 0, r, n=56)[:-1], neon, rail_paths=[circle_pts(cu, 0, r, 199.5, 520.5, n=50)],
                    turf=face)
    deck_with_rails(sc, [(0, -0.5), (j + 0.05, -0.5), (j + 0.05, 0.5), (0, 0.5)], neon,
                    rail_paths=[[(j, -0.5), (0, -0.5), (0, 0.5), (j, 0.5)]])
    tick = neon if glow else "#1d1d1f"
    for h in range(12):
        a = math.radians(h * 30)
        r0, r1 = (1.12, 1.38) if h % 3 == 0 else (1.22, 1.38)
        sc.line([(cu + r0 * math.cos(a), r0 * math.sin(a), DECK + 0.004),
                 (cu + r1 * math.cos(a), r1 * math.sin(a), DECK + 0.004)], tick, 3 if h % 3 == 0 else 1.8,
                layer="deck", depth=sc.depth([(cu, 0)]) + 1, filt="glowSmall" if glow else None)
    # hands at 11:59 (12 o'clock = +u, 3 o'clock = +v)
    hand = neon if glow else "#1d1d1f"
    for ang, L, w in ((-6, 1.05, 0.05), (-0.5, 0.72, 0.08)):
        a = math.radians(ang)
        du, dv = math.cos(a), math.sin(a)
        pu, pv = -dv * w, du * w
        q = [(cu + pu, pv), (cu + du * L + pu, dv * L + pv), (cu + du * L - pu, dv * L - pv), (cu - pu, -pv)]
        sc.prism(q, DECK, DECK + 0.09, hand if not glow else hexmix(neon, "#ffffff", 0.2),
                 hexmix(hand, "#000000", 0.35))
    sc.cylinder(cu, 0, 0.11, DECK, DECK + 0.12, "#f4f2ec" if glow else "#c9a227")
    tee(sc, 0.3, 0, DECK, neon)
    chevrons(sc, 0.65, 0, DECK, neon)
    cup(sc, cu + 0.95 * math.cos(math.radians(25)), 0.95 * math.sin(math.radians(25)), DECK, neon)
    totem(sc, -0.45, -0.95, 2, neon)


def h1(sc, n):
    neon = n["neon"]
    glow = sc.pal["glow"]
    deck_with_rails(sc, [(0, -0.6), (6.0, -0.6), (6.0, 0.6), (0, 0.6)], neon)
    gold = neon if glow else "#d4a017"
    post = "#1b1a24" if glow else "#1d3557"
    au = 1.7
    for vv in (-0.88, 0.88):
        sc.box(au - 0.08, au + 0.08, vv - 0.08, vv + 0.08, 0, 2.05, post, post)
        if glow:
            sc.line([(au + 0.081, vv - 0.081 if vv < 0 else vv - 0.081, 0.05), (au + 0.081, vv - 0.081, 2.0)], gold,
                    2, depth=sc.depth([(au, vv)]) + 0.02, filt="glowSmall")
    sc.box(au - 0.1, au + 0.1, -1.0, 1.0, 1.85, 2.3, post, post, depth=sc.depth([(au, 0)]) + 0.5)
    sc.text_xface(au + 0.101, 0, 2.2, "2027", 0.4, gold if glow else "#ffd166", depth=sc.depth([(au, 0)]) + 0.55,
                  filt="glowText" if glow else None, weight=900)
    # stars / confetti inlays
    for (uu, vv) in ((3.1, -0.3), (3.6, 0.25), (4.2, -0.2), (4.7, 0.3)):
        sc.flat(circle_pts(uu, vv, 0.05, n=6), DECK + 0.004, gold if glow else "#ffffff", depth=-5,
                layer="deck", filt="glowSmall" if glow else None)
    chevrons(sc, 0.75, 0, DECK, neon)
    tee(sc, 0.35, 0, DECK, neon)
    cup(sc, 5.4, 0, DECK, neon, big=True)
    totem(sc, -0.45, -1.0, 1, neon)


HOLES = [
    dict(n=10, name="Warm-Up", par=2, cls="Simple", neon="#22d3ee", fn=h10, L=5.0,
         note="Straight lane with a gentle hump. Teaches the turf speed."),
    dict(n=9, name="Bank Shot", par=2, cls="Simple", neon="#e879f9", fn=h9, L=5.0,
         note="L-shape: bounce off the 45° wall to turn the corner."),
    dict(n=8, name="The Windmill", par=3, cls="Hero", neon="#facc15", fn=h8, L=6.0,
         note="Putt through the tunnel under the turning sails."),
    dict(n=7, name="Pinball", par=3, cls="Mid", neon="#fb923c", fn=h7, L=5.0,
         note="Pin field + bumpers + graffiti backboard (Punk Ball nod)."),
    dict(n=6, name="Split Decision", par=3, cls="Mid", neon="#a3e635", fn=h6, L=5.5,
         note="Three tunnels in a wall: one short route, two long."),
    dict(n=5, name="The Ramp", par=3, cls="Mid", neon="#38bdf8", fn=h5, L=6.0,
         note="Climb to a raised green; clear guards keep balls in."),
    dict(n=4, name="The Barn", par=3, cls="Hero", neon="#fb7185", fn=h4, L=5.0,
         note="Dogleg through the barn tunnel to the back green."),
    dict(n=3, name="Island Green", par=3, cls="Mid", neon="#60a5fa", fn=h3, L=5.0,
         note="Narrow bridge over a glowing moat to a round green."),
    dict(n=2, name="The Clock", par=3, cls="Hero", neon="#a78bfa", fn=h2, L=5.1,
         note="Clock-face green; the hands at 11:59 are bumpers."),
    dict(n=1, name="Midnight", par=2, cls="Hero", neon="#fbbf24", fn=h1, L=6.0,
         note="Under the 2027 arch; the last cup keeps your ball."),
]

DEFS = """<defs>
<filter id="glowBig" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="glowSmall" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/>
<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glowText" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/>
<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>"""


def floor_grid(sc, u0, u1, v0, v1, step=1.0, depth=-1e6):
    pal = sc.pal
    sc.flat([(u0, v0), (u1, v0), (u1, v1), (u0, v1)], 0, pal["floor"], layer="glow", depth=depth - 1)
    u = u0
    while u <= u1 + 1e-6:
        sc.line([(u, v0, 0), (u, v1, 0)], pal["floor_line"], 0.8, layer="glow", depth=depth)
        u += step
    v = v0
    while v <= v1 + 1e-6:
        sc.line([(u0, v, 0), (u1, v, 0)], pal["floor_line"], 0.8, layer="glow", depth=depth)
        v += step


def hole_sheet(pal_key):
    pal = PALETTES[pal_key]
    cw, ch, cols = 600, 500, 2
    head = 120
    rows = math.ceil(len(HOLES) / cols)
    W, H = cw * cols + 40, head + ch * rows + 40
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" '
             'font-family="Helvetica, Arial, sans-serif">' % (W, H, W, H), DEFS,
             '<rect width="%d" height="%d" fill="%s"/>' % (W, H, pal["bg"]),
             '<text x="30" y="52" font-size="28" font-weight="700" fill="%s">The 10 holes, concept v1: %s</text>'
             % (pal["text"], pal["name"]),
             '<text x="30" y="82" font-size="15" fill="%s">Played 10 → 1. Concept sketches to scale (1 grid square = 1 m), '
             'not construction drawings. Same geometry as docs/03-hole-spec-sheet.md.</text>' % pal["sub"]]
    for i, h in enumerate(HOLES):
        cx0 = 20 + (i % cols) * cw
        cy0 = head + (i // cols) * ch
        s = 58
        # centre the hole: middle of lane at card centre
        mid_u, mid_v = h["L"] / 2, 0
        ox = cx0 + cw / 2 - (mid_u - mid_v) * C * s
        oy = cy0 + ch / 2 + 88 - (mid_u + mid_v) * S * s
        sc = Scene(s, ox, oy, pal)
        floor_grid(sc, -1.0, h["L"] + 1.0, -2.0, 2.0)
        h["fn"](sc, h)
        if h["n"] in (10, 8, 1):
            sc.person(-0.1, 1.05, "#8f8aa6" if pal["glow"] else "#8a8275")
        parts.append('<g>')
        parts.append('<rect x="%d" y="%d" width="%d" height="%d" rx="14" fill="none" stroke="%s" stroke-width="1"/>'
                     % (cx0 + 6, cy0 + 4, cw - 12, ch - 10, pal["floor_line"]))
        parts.append(sc.render())
        parts.append('<text x="%d" y="%d" font-size="34" font-weight="800" fill="%s">%d</text>'
                     % (cx0 + 24, cy0 + 48, h["neon"] if pal["glow"] else hexmix(h["neon"], "#000000", 0.25), h["n"]))
        parts.append('<text x="%d" y="%d" font-size="20" font-weight="700" fill="%s">%s</text>'
                     % (cx0 + 24 + (26 if h["n"] < 10 else 44), cy0 + 44, pal["text"], h["name"]))
        parts.append('<text x="%d" y="%d" font-size="13" fill="%s">Par %d · %s · %s</text>'
                     % (cx0 + 26, cy0 + 70, pal["sub"], h["par"], h["cls"], h["note"]))
        parts.append('</g>')
    parts.append('</svg>')
    return "\n".join(parts), W, H


def course_view(pal_key):
    pal = PALETTES[pal_key]
    s = 21
    T0 = 4.35
    XE, pitch = 47.0, 3.9
    # world x = auditorium Z, world y = auditorium X; viewer looks from the strip side and the booth end
    W, H = 1340, 990
    ox, oy = 1025, 175
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" '
             'font-family="Helvetica, Arial, sans-serif">' % (W, H, W, H), DEFS,
             '<rect width="%d" height="%d" fill="%s"/>' % (W, H, pal["bg"]),
             '<text x="30" y="48" font-size="26" font-weight="700" fill="%s">The whole course in Zone A, concept v1: %s</text>'
             % (pal["text"], pal["name"]),
             '<text x="30" y="76" font-size="14" fill="%s">View from the central strip, booth end nearest. Queue at the booth end, '
             'holes 10 → 1 toward the stage, exit into the party. Room positions are estimates (±1 m).</text>' % pal["sub"]]
    base = Scene(s, ox, oy, pal, map_fn=lambda u, v: (u, v))
    # room context (u = Z, v = X here)
    def zone(z0, z1, x0, x1, fill, op=1.0, stroke=None):
        base.flat([(z0, x0), (z1, x0), (z1, x1), (z0, x1)], 0, fill, layer="glow", depth=-1e6, opacity=op,
                  stroke=stroke, sw=1)
    zone(0, 16.4, 0, 54.7, pal["floor"])
    zone(1.2, 12.82, 6.0, 51.95, hexmix(pal["floor"], "#ffffff", 0.04) if pal["glow"] else "#ece7dc",
         stroke=pal["floor_line"])
    zone(0.3, 16.3, 0.2, 5.8, "#24222e" if pal["glow"] else "#d9d2c3")             # stage
    zone(12.82, 15.22, 7.5, 31.22, "#1f1d29" if pal["glow"] else "#ddd6c8")        # central strip
    zone(1.3, 4.0, 6.2, 51.8, "#2a2416" if pal["glow"] else "#f6e7c4", stroke="#b98d3a")  # walkway
    zone(4.2, 12.6, 47.5, 51.8, "#2b1a1c" if pal["glow"] else "#f4d9d0", stroke="#b5533c")  # queue
    zone(11.8, 16.4, 51.95, 54.7, "#24222e" if pal["glow"] else "#d9d2c3")         # booth
    parts.append(base.render())
    for i, h in enumerate(sorted(HOLES, key=lambda h: h["n"])):  # hole 1 (far) first
        k = 10 - h["n"]
        cx = XE - k * pitch - pitch / 2
        sc = Scene(s, ox, oy, pal, map_fn=lambda u, v, cx=cx: (T0 + u, cx + v))
        h["fn"](sc, h)
        parts.append(sc.render())
    people = Scene(s, ox, oy, pal)
    for z, x in ((5.4, 48.6), (5.9, 50.3), (7.0, 49.4), (2.6, 44.5), (2.9, 33.0), (2.4, 21.0), (7.5, 7.0)):
        people.person(z, x, "#8f8aa6" if pal["glow"] else "#8a8275")
    parts.append(people.render())
    # labels
    def label(z, x, txt, size=14, col=None, weight=600):
        px, py = base.P(z, x, 0)
        parts.append('<text x="%.0f" y="%.0f" font-size="%d" font-weight="%d" fill="%s" text-anchor="middle">%s</text>'
                     % (px, py, size, weight, col or pal["sub"], txt))
    label(8.2, 3.0, "STAGE", 15)
    label(14.0, 19.0, "central strip", 12)
    label(10.6, 49.6, "QUEUE + KIT", 13, "#e07a5f")
    label(2.6, 52.6, "entry →", 12, "#e07a5f")
    label(8.5, 6.4, "exit to the party", 12, "#e07a5f")
    px, py = base.P(1.75, 22.6, 0)
    parts.append('<text transform="translate(%.0f,%.0f) rotate(-30)" font-size="12" font-weight="600" fill="#c9a24a" '
                 'text-anchor="middle">walkway → stage</text>' % (px, py + 4))
    label(14.3, 53.3, "booth", 12)
    parts.append('<text x="30" y="%d" font-size="13" fill="%s">Zone B (party side) is behind the central strip, not drawn. '
                 'Generated by tools/make_concepts.py.</text>' % (H - 24, pal["sub"]))
    parts.append('</svg>')
    return "\n".join(parts), W, H


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "concepts"
    os.makedirs(out, exist_ok=True)
    sizes = {}
    for key in PALETTES:
        svg, W, H = hole_sheet(key)
        open(os.path.join(out, "holes-%s.svg" % key), "w").write(svg)
        sizes["holes-%s" % key] = (W, H)
        svg, W, H = course_view(key)
        open(os.path.join(out, "course-%s.svg" % key), "w").write(svg)
        sizes["course-%s" % key] = (W, H)
    for k, (w, h) in sizes.items():
        print(k, w, h)


if __name__ == "__main__":
    main()
