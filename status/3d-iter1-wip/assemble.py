#!/usr/bin/env python3
"""Assemble a test (or final) copy of the Countdown Golf 3D page from:
  - base.html            the 20 Nov artifact page (fragment), never edited by agents
  - holes/h<N>.js        one builder per hole:  HOLE_BUILDERS[N] = function (h, g, K) { ... return {...}; };
  - layout.json          optional: replaces the LAYOUT block (the layout agent writes it)
  - scenery.js           optional: shared scenery code, inserted after HOLES.forEach(buildHole)
  - extra-*.js           optional: other code blocks inserted after scenery (integrator only)

Usage:
  python assemble.py                                  # all holes found, out/test.html (full document, test hook on)
  python assemble.py --only 10,9,8 --out out/a.html   # only these builders (other holes get a plain placeholder deck)
  python assemble.py --base other.html                # assemble from another base page (the integrator's working page)
  python assemble.py --fragment --no-hook --out final.html   # Artifact fragment, no test hook

Test hook URL parameters (test builds only):
  ?hole=N         select hole N
  &cam=close|tee|top|side|overview   camera (default close: a raised three-quarter view from the tee end)
  &light=glow|house|dark
  &iso=1          hide every other hole, the skyline flats, the rig and labels, to look at one hole alone
  &ui=0           hide the header, side panel and buttons; the 3D view fills the window
  &zoom=1.0       move the close/top/side camera nearer (>1) or further (<1)
  &dump=1         write every hole's local extents and builder return value as JSON into <pre id="dump">
                  (read it with: python dump.py out/x.html)
"""
import argparse
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SKELETON_HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
"""
SKELETON_TAIL = "</body>\n</html>\n"

DISPATCH = """  const B = HOLE_BUILDERS[h.n];
  let built = null;
  if (B) {
    built = B(h, g, { fascia, led, s: h.mirror ? -1 : 1, L, W, a, b }) || {};
    if (built.tee) tee = built.tee;
    if (built.cup) cup = built.cup;
    if (built.cupY != null) cupY = built.cupY;
    if (built.outlines) outlines.push(...built.outlines);
  } else {
    rectDeck();
    built = { placeholder: true };
  }
  g.userData.build = built;
  g.userData.builderKids = g.children.length;   // children added before the totem and halo (the dump measures only these)
"""

TAIL_OLD = "  box(0.3, 0.008, 0.3, mats.tee, g, tee[0], DECK + 0.004, tee[1], false);\n  addCup(g, cup[0], cup[1], cupY);\n"
TAIL_NEW = ("  const teeY = built.teeY != null ? built.teeY : DECK;\n"
            "  if (!built.noTeeMat) box(0.3, 0.008, 0.3, mats.tee, g, tee[0], teeY + 0.004, tee[1], false);\n"
            "  if (!built.noCup) addCup(g, cup[0], cup[1], cupY);\n")

HOOK = r"""
/* ------------------------------------------------------------------ TEST HOOK (harness builds only; not in the published page) */
{
  const q = new URLSearchParams(location.search);
  window.__holeBuilds = Object.fromEntries(Object.entries(holeGroups).map(([k, g]) => [k, g.userData.build]));
  if (q.get('ui') === '0') {
    const st = document.createElement('style');
    st.textContent = 'header.band,aside.panel,footer,.lightbar,.corner{display:none!important} main.wrap{padding:0!important;max-width:none!important} .app{display:block!important} .viewer{position:fixed!important;inset:0!important;height:100vh!important;border-radius:0!important;border:0!important}';
    document.head.appendChild(st);
    resize();
  }
  if (q.has('light')) { applyLight(q.get('light')); document.querySelectorAll('[data-light]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.light === q.get('light')))); }
  const n = +q.get('hole');
  if (n && H[n] && holeGroups[n]) {
    const h = H[n], g = holeGroups[n];
    select(n, false);
    if (q.get('iso') === '1') {
      // the hole alone on the floor: hide every other top-level object except lights and the floor
      for (const ch of scene.children) { if (ch.isLight || ch === g || (ch.isMesh && ch.material === mats.floor)) continue; ch.visible = false; }
      cullShell = () => {};
      layers.tags = false; layers.labels = false; layers.rig = false; applyLayers();
    }
    const zoom = +(q.get('zoom') || 1);
    const bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3());
    const R = Math.max(sz.x, sz.z, 2.0) / zoom;
    const cam = q.get('cam') || 'close';
    tween = null;
    const side = h.tside || 1;
    if (cam === 'tee') { const v = holeView(h); camera.position.set(...v.pos); controls.target.set(...v.tgt); }
    else if (cam === 'top') { camera.position.set(c.x, R * 1.45 + 1.5, c.z + 0.002); controls.target.set(c.x, 0, c.z); }
    else if (cam === 'side') { const [px, pz] = l2w(h, 0, -side * (R * 2.2 + 1.5)); camera.position.set(px, 0.45, pz); controls.target.set(c.x, 0.3, c.z); camera.fov = 22; camera.updateProjectionMatrix(); }
    else if (cam === 'overview') { const v = VIEWS.golf; camera.position.set(...v.pos); controls.target.set(...v.tgt); }
    else { const [px, pz] = l2w(h, -h.L * 0.85 / zoom, -side * (h.W * 1.5 + 1.9) / zoom); camera.position.set(px, (R * 0.62 + 1.1) / zoom, pz); controls.target.set(c.x, 0.2, c.z); }
    controls.update();
  } else if (q.get('cam') === 'top') {
    camera.position.set(22, 46, 13.01); controls.target.set(22, 0, 13); controls.update();
  }
  if (q.get('dump') === '1') {
    // each hole's extents in its own local frame (u along, v across, y up), from the meshes actually built
    const out = {};
    for (const k in holeGroups) {
      const g = holeGroups[k]; g.updateMatrixWorld(true);
      const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), bb = new THREE.Box3(), tmp = new THREE.Box3();
      const parts = [];
      g.children.slice(0, g.userData.builderKids || g.children.length).forEach(ch => ch.traverse(o => { if (o.isMesh && o.geometry) { o.geometry.computeBoundingBox(); tmp.copy(o.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); bb.union(tmp); } }));
      const r = x => Math.round(x * 1000) / 1000;
      out[k] = { u: [r(bb.min.x), r(bb.max.x)], v: [r(bb.min.z), r(bb.max.z)], y: [r(bb.min.y), r(bb.max.y)], L: H[k].L, W: H[k].W, build: g.userData.build };
    }
    const pre = document.createElement('pre'); pre.id = 'dump'; pre.textContent = JSON.stringify(out); document.body.appendChild(pre);
  }
  window.__ready = true;
}
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default=os.path.join(HERE, "base.html"))
    ap.add_argument("--holes", default=os.path.join(HERE, "holes"))
    ap.add_argument("--layout", default=os.path.join(HERE, "layout.json"))
    ap.add_argument("--only", default="")
    ap.add_argument("--out", default=os.path.join(HERE, "out", "test.html"))
    ap.add_argument("--fragment", action="store_true")
    ap.add_argument("--no-hook", action="store_true")
    ap.add_argument("--no-layout", action="store_true")
    args = ap.parse_args()

    t = open(args.base, encoding="utf-8").read()

    # 1. layout
    if not args.no_layout and os.path.exists(args.layout):
        lay = json.load(open(args.layout, encoding="utf-8"))
        block = "const LAYOUT = " + json.dumps(lay, ensure_ascii=False, separators=(", ", ": ")) + ";"
        t2, k = re.subn(r"(/\* LAYOUT:BEGIN[^\n]*\*/\n).*?(\n/\* LAYOUT:END \*/)", lambda m: m.group(1) + block + m.group(2), t, flags=re.S)
        if k != 1:
            sys.exit("LAYOUT markers not found")
        t = t2

    # 1b. the factory deck height (brief G1): every hole's lowest playing surface sits at BASE
    if "const BASE =" not in t:
        t = t.replace("const DECK = 0.075,", "const BASE = 0.10;   // factory raised deck: turf top of each hole's lowest playing surface (proposal, 27 Nov)\nconst DECK = 0.075,", 1)

    # 2. builders
    only = {int(x) for x in args.only.split(",") if x.strip()}
    files = sorted(glob.glob(os.path.join(args.holes, "h*.js")))
    code = []
    for f in files:
        m = re.match(r"h(\d+)\.js$", os.path.basename(f))
        if not m:
            continue
        n = int(m.group(1))
        if only and n not in only:
            continue
        code.append(f"/* ---- {os.path.basename(f)} */\n" + open(f, encoding="utf-8").read().rstrip() + "\n")
    if "function buildHole(h) {" not in t:
        sys.exit("buildHole not found in base")
    if "const HOLE_BUILDERS = {};" not in t:
        t = t.replace("function buildHole(h) {", "const HOLE_BUILDERS = {};\n" + "".join(code) + "\nfunction buildHole(h) {", 1)
    else:  # an integrated base already has a builder block: replace it
        t = re.sub(r"const HOLE_BUILDERS = \{\};\n.*?\nfunction buildHole\(h\) \{", lambda m: "const HOLE_BUILDERS = {};\n" + "".join(code) + "\nfunction buildHole(h) {", t, count=1, flags=re.S)

    # 3. replace the old per-hole switch with the dispatch (only once, on the original base)
    if "  switch (h.n) {" in t:
        i = t.index("  switch (h.n) {")
        j = t.index(TAIL_OLD, i)
        t = t[:i] + DISPATCH + t[j:]
        t = t.replace(TAIL_OLD, TAIL_NEW, 1)

    # 4. shared scenery and integrator blocks after the holes are built
    extra = ""
    for name in ["scenery.js"] + sorted(os.path.basename(p) for p in glob.glob(os.path.join(HERE, "extra-*.js"))):
        p = os.path.join(HERE, name)
        if os.path.exists(p) and "/* ---- " + name not in t:
            extra += f"/* ---- {name} */\n" + open(p, encoding="utf-8").read().rstrip() + "\n"
    if extra:
        t = t.replace("HOLES.forEach(buildHole);\n", "HOLES.forEach(buildHole);\n" + extra, 1)

    # 5. test hook
    if not args.no_hook:
        k = t.rindex("</script>")
        t = t[:k] + HOOK + t[k:]

    out = t if args.fragment else SKELETON_HEAD + t + SKELETON_TAIL
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    open(args.out, "w", encoding="utf-8", newline="\n").write(out)
    print(f"wrote {args.out} ({len(out):,} bytes; builders: {len(code)})")


if __name__ == "__main__":
    main()
