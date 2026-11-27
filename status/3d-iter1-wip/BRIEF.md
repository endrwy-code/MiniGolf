# Brief: Countdown Golf 3D, iteration 1 (27 Nov 2026)

Working folder: `status/3d-iter1-wip/` in the repo (call it `W`; originally a local folder outside the repo). Repo root: call it `R`. Paths to Chrome in `shot.py`, `dump.py` and `tools/make_layout_nyc_v4.py` can be overridden with the `CHROME` environment variable.

## What we are making, and what we are not

The team's 3D model (Claude artifact "Countdown Golf 3D", 20 Nov version, saved as `W/base.html`, an HTML fragment) still shows the 18 Nov holes (doc 10). We are updating it to **New York iteration 1**, the ten holes in `R/docs/14-new-york-iteration-1.md` (doc 14), which came out of the team's Kulnari visit (`R/docs/13-kulnari-benchmark.md`).

The team is now going the **1688 factory route**: a Chinese mini golf factory will build the holes. The 3D model is the **design reference**: what each hole looks like, how it plays, and its true size. Screenshots of it will go to the factory as reference renders (效果图). It is **not** the factory build guide: no module splits, exploded views, fixings or fabrication detail. A separate professional build guide (dimensioned drawings, specs) comes later and will be built from the same numbers. So every dimension in the model must match doc 14 exactly; the renders must never contradict the drawings.

Everything is a proposal, not a decision. Doc 14 wins over everything else for the holes; its must-fixes M1–M9 are already folded into its hole sections. Doc 13 section 5.3 wins for cups. Where doc 14 is silent, use `R/docs/working-papers/ny-iteration-1-review.md`, then designs A and B in the same folder.

House rules (from `R/CLAUDE.md`): no real logos or trademarks (unbranded cart and cabs, invented subway line symbols, Liberty from the original 1886 statue, invented billboard brands, say "countdown ball"); no people's personal details; keep measured and estimated values separate.

## Global rules for iteration 1

- **G1 Factory deck.** Every hole is a raised factory deck. The hole's **lowest playing surface (turf top) sits at `BASE` = 0.10 m** above the floor. `BASE` is a page constant (the harness adds `const BASE = 0.10;` next to `DECK`). Doc 14's heights are measured from the floor of a floor-laid route C build; convert them by keeping every height **relative to that hole's lowest playing surface** and adding `BASE`. Example, hole 10: doc 14 says tee +200, T2 +135, T3 +115, green +75 (lowest) → tee `BASE+0.125`, T2 `BASE+0.060`, T3 `BASE+0.040`, green `BASE`. Never use the old `DECK` (0.075) for heights in new code. Deck sides use `K.fascia` from the floor up to the surface.
- **G2 Raised greens that only existed to give the cup depth in route C are removed**, because the factory deck gives cup depth everywhere: hole 4's +75 green / raised zebra crossing (the crossing becomes a flat printed crossing; cup stays 0.5 m past where the crest was), and hole 5's +75 lawn with its 1:5 bevel (the lawn stays flat; this also helps hole 5's pace, the course's slowest hole). Every gameplay slope stays: 10 terraces, 9 crust bevel, 8 kerb, 7 hill, 6 shore and banked corner, 3 ramp, platform and loop floor, 1 ramp and tilted crest.
- **G3 Rails.** Top of the white cap 100 mm above the local playing surface (`RAIL_H` = 0.1), 45 mm thick (`RAIL_T`), the existing dark ribbed fascia and white cap look, the hole's LED under the cap and at the deck base (`kickFor`). Rails follow steps and slopes (a stepped or sloped rail, not a flat one floating over a ramp). Hard faces where doc 14 says so (hole 2 ellipse: lacquered hardboard, no EVA; hole 5 curves: hard face).
- **G4 Cups.** Flush 108 mm cup, 64 mm deep (the page's `addCup(parent, u, v, y)`; the wrapper calls it for you at the `cup` and `cupY` you return).
- **G5 True size.** Playing surfaces, rails, ramps, slopes, radii, widths and cup positions to doc 14's numbers within ±10 mm in height and ±20 mm in plan. Props are simplified shapes at true size and position (statue 2.6 m, tower 2.8 m, kiosk 1.6 m, booth Ø0.40 × 0.35 m, and so on). If doc 14's numbers do not fit the box in the table below, **keep doc 14's numbers**, let the box grow, and report the real L × W.
- **G6 Look.** Same visual language as the page today: oversized everyday objects with a pun sign (ref 07 hot dog), found objects (ref 08 bike wheels), coloured LED glow, the neon-style pun sign (`neonTex` + `boardSign`) on every hole, and the hidden "11:59" detail doc 14 gives for each hole. Holes should blend (shared colours, zebra crossings, the same rail and sign family). Reuse props from the old builders where they fit (old case 9 hot dog cart, old case 7 cabs, old case 6 torch, old case 5 subway tiles and line roundels, old case 2 four-faced clock, old case 1 ball-drop tower and 2027 sign). Text must read correctly: never mirror a mesh with negative scale.

## Each hole's frame (shared by the hole builders and the layout)

Local coordinates in metres: the hole's bounding box is centred on the origin, `u` runs along its length (tee end at `-L/2`, far end at `+L/2`), `v` across it, `y` up from the floor (0). L-, Z- and U-shaped holes are drawn **turning toward +v**; the layout may mirror a hole, so builders multiply **every** `v` by `K.s` (`+1` or `-1`), including prop positions, and keep text readable (place signs by `K.s * v`, but never flip them). Boxes include the rails and anything standing inside them; the street-sign totem is added by the page outside the box at `u = -L/2 + 0.3`, `v = tside * (W/2 + 0.45)`.

| # | Hole | L × W (m) | Shape: occupied rectangles `[u0, v0, u1, v1]` | Tee `[u, v]` | Cup `[u, v]` | Props over 2 m `(u, v, height)` |
|---|---|---|---|---|---|---|
| 10 | Brownstone Stoops | 5.4 × 1.25 | straight, whole box | `[-2.35, 0]` on the tee landing | `[1.75, -0.2]` (0.2 m off centre away from the sag; the sag falls toward +v, the façade side) | none (the shared brownstone façade is scenery placed by the layout) |
| 9 | Brooklyn Pizza | 5.0 × 1.95 | straight; 0.95 m lane flaring to 1.75 m | `[-2.2, 0]` | `[1.6, 0]`, the centre pepperoni (3.8 m from the tee) | none |
| 8 | Hot Dog Cart | 5.2 × 1.5 | straight; 1.3 m lane | `[-2.3, 0]` | `[2.05, 0]` (0.30 m from the bun's closed end) | umbrella about 2.0–2.2 m on a sandbagged post outside the rail (extra) |
| 7 | Brooklyn Bridge | 5.4 × 1.6 | straight; two ends, D-shaped end rails | `[-2.25, 0]` (second tee at `[2.25, 0]`) | `[0, 0]` on the plateau | two tower flats about 2.6 m, on posts outside the rails |
| 6 | Liberty Island | 4.4 × 3.6 | L: harbour leg plus banked corner `[-2.2, -1.8, 2.2, -0.75]`; island `[0.75, -0.75, 2.2, 1.45]`; statue pedestal `[1.15, 1.45, 1.85, 1.8]` | `[-1.9, -1.28]` | about `[1.5, 0.95]` (1.2 m past the shore crest) | statue 2.6 m on its pedestal |
| 5 | Central Park Loop | 4.8 × 2.8 | Z: leg 1 `[-2.4, -1.4, 0.45, -0.45]`; leg 2 `[-0.55, -1.4, 0.45, 1.4]`; leg 3 `[-0.55, 0.45, 2.4, 1.4]`; tree pockets `[0.45, -1.4, 2.4, 0.45]` and `[-2.4, -0.45, -0.55, 1.4]` | `[-2.1, -0.93]` | `[1.9, 0.93]` | two borrowed Christmas trees about 2.1–2.4 m in the pockets (bases 0.9 m or less) |
| 4 | Gridlock | 5.0 × 1.8 | straight | `[-2.2, 0]` | `[1.7, 0]` | none |
| 3 | The Subway | 4.0 × 2.4 | U: ramp leg `[-2.0, -1.2, 1.25, -0.2]` going +u; loop box `[1.25, -1.2, 2.0, 1.2]`; return green `[-1.35, 0.2, 1.25, 1.2]` coming back −u; island box between the legs | `[-1.7, -0.7]` | about `[0.05, 0.7]` (1.2 m out from the Express exit, on its line) | none (the 1.6 m kiosk is scenery on Gridlock's sidewalk) |
| 2 | Grand Central Whispering Gallery | 3.4 × 2.1 | ellipse a = 1.40, b = 0.95 m plus rail; clock post behind B | focus A `[-1.03, 0]` | focus B `[1.03, 0]` | the Ø1 m clock at 11:59 on a braced post behind B, top about 2.2–2.4 m |
| 1 | Times Square | 6.2 × 2.2 | straight 1.0 m lane, billboards either side inside W, tower at the far end inside L | about `[-2.6, 0]` | none: return `noCup: true` and `cup` = the tray's centre | tower about 2.8 m (2027 neon, mirror ball); billboards about 2.0 m |

## Hole builder contract (`W/holes/h<N>.js`, one file per hole)

```js
HOLE_BUILDERS[10] = function (h, g, K) {
  // h: this hole's record from LAYOUT (n, name, sign, L, W, glow, mirror, tside, ...). Use your own constants for sizes, not h.L/h.W.
  // g: a THREE.Group already placed and rotated; add everything to it in local coordinates (u, y, v) → mesh(..., g, u, y, v).
  // K: { fascia (deck-side material: use it on deck sides so the selection highlight works), led (this hole's LED material), s (+1 or -1: multiply every v), L, W, a: -L/2, b: L/2 }
  ...
  return {
    tee: [u, v], teeY: BASE + 0.125,      // where the tee mat goes (the wrapper draws it), and its surface height
    cup: [u, v], cupY: BASE,              // the wrapper draws the cup here; return noCup: true to skip it
    juniorTee: [u, v], juniorTeeY: ...,   // draw the junior tee mat yourself (smaller, a lighter colour)
    outlines: [{ p: [[u, v], ...] }],     // deck outlines in plan, for the selection glow
    sizes: [['Lane width', '950 mm'], ['Terraces', '+125 / +60 / +40 / 0 mm'], ...],   // key dimensions for the hole card, from doc 14
  };
};
```

Helpers already in page scope (read them in `W/base.html`, roughly lines 450–660): `mesh(geo, mat, parent, x, y, z)`, `box(w, h, d, mat, parent, x, y, z)`, `cyl(rt, rb, h, mat, parent, x, y, z, seg)`, `cylBetween(a, b, r, mat, parent)`, `V(x, y, z)`, `extrudeXZ(pts, depth, mat, parent, y)`, `deckPoly(pts, parent, fascia, y, h, top)`, `deckCircle(...)`, `railsFor(pts, parent, led, skip, y0)`, `ringRail(...)`, `arcRing(...)`, `kickFor(pts, parent, led)`, `kickCircle(...)`, `segBox(p, q, width, height, mat, parent, y0)`, `rectPts(u0, v0, u1, v1)`, `laneTex(...)`, `canvasTex(w, h, draw)`, `neonTex(lines, color)`, `boardSign(parent, tex, u, v, w, hgt, y0, posts)`, `inst(geo, mat, list, parent)` (instancing: use it for the ~115 plinko pegs), `M(color, opts)`, `MC(color, opts)`, `mats.*`, `ledMat(c)`, `lit(tex)`, `glow(mat, levels)`, `rand(seed)`, `FD`, `FB`, `inkOn(hex)`, `animators.push((t, dt) => ...)` (respect `reduceMotion`), `THREE`. Sloped and curved surfaces (ramps, the conical bank, the hump, the ellipse rail, curved park rails, subway hairpins, the tilted plinko board) need your own geometry: build them properly (a `BufferGeometry`, `ExtrudeGeometry` along a path, or a lathe/cone segment), not as stacks of boxes that look stepped. Don't call `addLabel` or anything else defined after `HOLES.forEach(buildHole)`. Keep it light: instanced or merged geometry for repeated parts.

## Tools (all in `W`)

- `python assemble.py --only 10,9 --layout layout-test.json --out out/<you>.html` builds a full test page with your builders (holes without a builder get a plain placeholder deck). `layout-test.json` is a fixed test layout (18 Nov positions, iteration-1 sizes; holes may overlap): builders always test with it. The layout agent writes `layout.json`; the integrator uses that.
- `python shot.py --page out/<you>.html --sheet "hole=10&cam=close&iso=1&light=house;hole=10&cam=top&iso=1&light=house;hole=10&cam=side&iso=1&light=house;hole=10&cam=tee&light=glow" --out out/h10-sheet.png` makes one image with four views (about 45 s). Cameras: `close`, `tee`, `top`, `side` (low, long lens: an elevation), `overview`; `zoom=1.6` gets closer; `iso=1` shows the hole alone; `light=glow|house|dark`. One `--q "..."` instead of `--sheet` makes one shot. **Read images sparingly: each image read is re-sent every turn.** Make sheets, look at them once, fix, re-shoot.
- `python dump.py out/<you>.html 10 9` prints each hole's real extents in its local frame and your builder's return value, and flags anything outside its L × W box. Use it to check numbers instead of eyeballing images. If it says "no dump found", your code threw: run Chrome yourself with `--enable-logging=stderr --v=0` or temporarily wrap your builder in try/catch to find the error.

## Working rules for every agent

- Write notes to `W/notes/<your-id>.md` as you go (after each hole or major step): decisions, numbers, deviations from doc 14 and why, open issues. If you run out of budget, the notes and files on disk are all that survives.
- Image budget: hole builders at most 16 image reads, layout at most 6, integrator at most 14, visual reviewer at most 24, fidelity reviewer at most 8.
- Only write the files you own (below). Don't touch `W/base.html`, `assemble.py`, `shot.py`, `dump.py` or another agent's files. Never commit or push in `R`.
- Ownership: hole builders own `W/holes/h<N>.js` for their holes and `W/notes/holes-<group>.md`; the layout agent owns `R/tools/make_layout_nyc_v4.py`, `R/floorplan/layout-v4-nyc.*`, `W/layout.json`, `W/notes/layout.md`; the integrator owns `W/base-v2.html`, `W/scenery.js`, `W/extra-*.js`, the final outputs, and may make small integration fixes to hole files after the builders have finished; reviewers write only `W/notes/review-*.md`.
