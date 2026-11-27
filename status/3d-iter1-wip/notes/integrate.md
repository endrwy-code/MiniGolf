# Integrator notes (27 Nov)

## Step 1: sizes (done)
- `out/all.html` from all ten builders + layout v4; dump: only hole 8's umbrella canopy sticks out (v to 1.70, a declared extra).
- Layout script `R/tools/make_layout_nyc_v4.py` edited (original copy kept in the session scratchpad):
  - SIZES: 9 -> 5.13 x 1.95, 6 -> 4.552 x 3.6, 3 -> 4.0 x 2.552 (u 2.022 is the 22 mm kick strip, inside the 35 mm rail
    tolerance like hole 4's 33 mm, so L stays 4.0). Hole 1 keeps doc 14's 6.2 m box (built hole uses 5.38 m; 0.82 m
    free behind the tower) -> open question for the team.
  - SHAPES 6, 5, 3 replaced with the builders' real rectangles over the rails (5 gets a "sign and lamp" strip at the
    far end, which the old pockets did not cover).
  - POINTS: tees/cups as built (9 shifted, 6, 5, 3, 2, 1); tall props as built (8 umbrella post at (-0.7, 0.9), 7 towers
    at u +-1.3 / v +-0.66, 6 statue 3.2 m to the flame, 5 trees, 2 clock post at u 1.58 top 2.3, 1 tower at u 1.88 and
    billboards at u -0.4 / v +-0.98); hole 8's extras rectangle follows the real post and sandbag.
  - GAP_10_9 2.2 -> 2.07 so 9-8 stays at 1.21 m after hole 9 grew. All rules pass (tightest: 9-8 1.21, portal
    sightline 0.53, route corridor 1.26).
- `holes/h9.js`: appended a wrapper that re-centres the builder (-0.065 m in u, child group; tee/cup/junior/outlines
  shifted), so the 5.13 m box is centred like every other hole. Original in scratchpad.

## Step 2: assembly and scenery (27 Nov, cloud session on Linux)

Tools (Linux): `shot.py`, `dump.py` and `R/tools/make_layout_nyc_v4.py` now take `CHROME` from the environment, else
`/opt/pw-browsers/chromium` when it exists, else the old Windows path; `--no-sandbox` is added on Linux only (root in the
container). The layout script's PNG step now builds its file URL with `pathlib` (the old `"file:///" + path` broke on
Linux). three.js 0.186.1 loads from jsDelivr through the proxy, so headless Chromium renders the page here.
Layout v4 rerun into the scratchpad: every rule passes, and the SVG and JSON it writes are byte-identical to the
committed `floorplan/layout-v4-nyc.*` and `W/layout.json` (tightest: 9-8 1.21 m, portal sightline 0.53 m, route
corridor 1.26 m). Not regenerated in the repo.

Page = `base-v2.html` + `holes/h*.js` + `layout.json` + `scenery.js` (assemble.py inserts scenery after the holes).

`scenery.js` (new, integrator): everything placed from `LAYOUT.scenery`, so the layout script stays the single source
of positions and clearances.
- Floor tapes: charcoal "asphalt" Downtown (speckle), light-grey "sidewalk" Midtown with 1.5 m slab joints, at y 2 mm.
- Zebra crossings: white bars 0.2 m at 0.4 m pitch along each walk (as the layout specifies); Midtown ones get a
  charcoal road strip underneath, otherwise white on light grey doesn't read.
- Brownstone facade 4.8 x 2.4 m: stoop townhouse behind 10 (lit windows, stoop with iron railings, door), red-brick
  tenement behind 9's tee (awning, "PIZZA · BY THE SLICE" band, lit shop window with oven, fire escape); runway side a
  dark drape; base rail, back studs, steel-angle outriggers under the hole frames (from `bracing`), the L-jack with two
  15 kg weights. A 30 mm stripe of 10's green and 9's orange at the foot (doc 14: neighbour's colour on facing props).
- Subway kiosk (hole 3's, on Gridlock's sidewalk): green iron railings round a painted stairwell, two green battery
  globe lamps at 1.6 m, a "SUBWAY" plate with hole 3's invented symbols (star, ring, diamond) and an ice-blue stripe.
- Park-wall cut-out: 600 mm fieldstone print facing Gridlock, a stripe of hole 4's purple.
- Festoon poles (3 m, sandbagged plates) and runs (parabolic sag, lowest point kept >= min_height + 0.05; the 3.0 m to
  2.8 m tower run bottoms at about 2.54 m), warm bulbs every ~0.3 m (instanced).
- Portals: Downtown bridge arch (granite flat, twin pointed arches above one 2.0 x 2.1 m opening, a hanging pier only
  above 2.1 m, "DOWNTOWN" band) and Midtown park gate (stone pillars with ball finials, iron arch, "MIDTOWN" sign).
  They now carry the district names.

`base-v2.html` changes in step 2:
- LAYOUT marker comment names the v4 script.
- The two hub street posts (DOWNTOWN / MIDTOWN) and their walk-collision circles are gone: on layout v4 the Midtown
  post stood inside the Midtown walk corridor (0.36 m from route B hop 0) and the Downtown one 0.85 m behind the
  bridge-arch post with its blade over the walk. The portals carry the names instead. If the portals are cut, put the
  posts back clear of the routes.
- Walk collisions and the walk-mode map include every scenery footprint (facade, jack, kiosk, park wall, poles,
  portal posts).
- Tee view (`holeView`) and walk-to-tee (`goToTee`) start from the tee the builder returned (holes 6, 5, 3 have their
  tee off the centre line), and the tee view treats scenery as a blocker and skips camera spots within 0.6 m of a
  scenery footprint, trying the far side before going higher (hole 10's view had the bridge-arch portal in its face).
- Totem: a warm flood head at 2.1 m aimed down the hole (doc 14 "Light pools"); emissive lens only, no real light.
- Title "Countdown Golf 3D, Iteration 1", h1 "...: iteration 1", eyebrow "Iteration 1 (doc 14) ... Proposal, not
  decided"; a "Shared scenery" bullet in the "What changed" card; footer points at `status/3d-iter1-wip/`.

Hole-file fixes (integration only):
- `holes/h2.js`: the Ø1 m clock gets a second rim and face on its back, so the 11:59 clock also faces hole 1's 2027
  tower (doc 14 blending: "one minute to go"); it showed a black disc to hole 1 before. Sizes row says so.
  Original in the session scratchpad.

## Step 3: the reviewers' fixes the coordinator asked for (27 Nov)

Read `notes/review-fidelity.md` and `notes/review-visual.md` (not edited). Applied as integration work; the doc 14
contradictions (holes 3, 5, 7, 8, 9, 1) are left to the coordinator and the team. Originals of every touched hole file
are in the session scratchpad.
- **MF1, `holes/h6.js`** (doc 14 to follow, flagged as a review fix for the team to confirm at the full-width rig):
  the vertical upstream cheek (ph -90 deg) is gone; a 0.8 m tapered run-in (12 stations) grows the full wave profile
  out of the floor along the outer rail, from u 0.4 to the cone at u 1.2, as the review's code gives. The closed back
  no longer stands 300 mm above the rail caps: the old flat +400 shelf (polyBox with rail-line walls) is replaced by a
  flat crest band (R 0.879-0.959 at +400) and a fairing sloping from it down to +100 at the outer rail lines, level with
  the rail-cap tops (doc 14's updated wording: "the corner's back stays level with the rail caps"), round the cone and
  along the run-in; the downstream cheek's outline follows the slope. New
  sizes row "Run-in"; "Banked corner" row updated. dump: extents unchanged (u +-2.276, v -1.80..1.799).
  Open: a ball that clears the curl lip now rolls down the fairing and over the rail cap (the old flat shelf kept it on
  top). The rig should show whether the 50 mm curl ever lets a ball over; if it does, stop the fairing 40 mm under the
  caps (`YR = 0.06` in h6.js) so the rail catches it.
- **Cup (page `addCup`)**: no white Ø160 collar 2 mm proud any more. A flush 108 mm opening with a 3 mm steel lip,
  and the 64 mm sleeve and its soft floor drawn below the surface; a depth-only disc at the surface (renderOrder -1,
  drawn after the sleeve, before the deck) keeps the deck top from painting over the opening, so you see into the cup.
- **Picker and tags**: side-panel hole buttons are 10 px rounded squares; the floating hole numbers 6 px rounded squares
  (same reason as the totem badge, doc 13 section 5.8).
- **`holes/h8.js`**: the fries carton moves from the lane (against the -v rail at u -0.22..-0.02, an obstacle doc 14
  does not have) onto the counter beside the display dog (u -0.51, v -0.47 x s, on the plate). The neon "RELISH THE
  MOMENT" is raised to 1.60-2.02 m on 2.06 m posts so the cart, dog and umbrella no longer hide it from the tee
  (checked in a tee render). Props sizes row updated.
- **Test hook (`assemble.py`)**: `iso=1` also turns the skyline flats off (applyLayers turned them back on); new
  `label=0` hides the floating selection label for factory renders. Docstring updated.
- **Tools on Linux**: `shot.py` now prefers `chrome-headless-shell` from `/opt/pw-browsers/chromium_headless_shell-*`
  with no headless flag (Chromium's `--headless=new --screenshot` gives blank WebGL tiles here), then Chromium, then
  the Windows path; `CHROME` still overrides. `dump.py` keeps Chromium `--headless=new`, and its docstring now says
  instanced meshes are measured at the group origin, so holes 5's and 7's small "below the floor" readings are false.
- The page's "What changed" card has bullets for the rounded-square numbers, the flush cups and these review fixes.

Not done from the reviews (cosmetic or for the team): hole 9's pizza-slice cut-out sits in the bottom corner of hole
8's tee view; hole 2's tee view camera stands over hole 3 (1.2 m apart), so hole 3's sign shows at the frame's foot;
hole 5's tree B fairy lights over part of its sign; hole 1's walkway billboard hides the peg board from the side (use
the top or tee view for the factory); hole 6's downstream cone end and pun-sign posts through the cap overhang.

## Step 4: checks and the final page (27 Nov)

- `dump.py` (test build of the final): every hole inside its layout-v4 box except hole 8's umbrella (v to 1.70, the
  brief's declared extra). Extents: 10 5.345 x 1.20; 9 5.13 x 1.90; 8 5.19 x 1.50 (+ umbrella); 7 5.15 x 1.56; 6 4.552 x
  3.60; 5 4.68 x 2.76; 4 5.06 x 1.86 (rails inside the 35 mm tolerance); 3 4.02 x 2.55; 2 3.22 x 2.05; 1 5.38 x 2.14.
- Console: no page errors, failed requests or console errors (desktop 1280 and phone 390); only SwiftShader's
  "GPU stall due to ReadPixels" performance warnings, which come from headless software WebGL.
- UI (Playwright): all ten hole buttons select their hole; every info card has Mechanism, Build, If the putt misses,
  Sizes in this model (7-11 rows), Find the 11:59, Kulnari lesson, Surface; the three lighting buttons work; no
  horizontal scroll at 390 px (scrollWidth = clientWidth = 390), picker and card render at phone width.
- Renders (9 contact sheets, 9 image reads): Downtown and Midtown views, top and golf overviews, every hole's tee view,
  console view with the sightline layer (portals and facade outside the cone, as the layout checks), dark, house and
  glow lighting, the scenery close-ups, the fixes above, phone UI.
- Final Artifact fragment: `R/status/countdown-golf-3d-iter1.html` (`python3 assemble.py --base base-v2.html --layout
  layout.json --fragment --no-hook --out ../countdown-golf-3d-iter1.html`): no test hook, no doctype (the Artifact wraps
  it), three.js 0.186.1 pinned from jsDelivr, no local paths or personal details. Title "Countdown Golf 3D, Iteration 1".
  `R/status/countdown-golf-3d.html` (doc 10, `tools/make_layout_nyc.py`) is untouched. Not published.

## Open issues for the team (integration view)

- Hole 1: layout v4 keeps doc 14's 6.2 m box, the built hole is 5.38 m (0.82 m free behind the tower). Shorten the box
  in the layout script or keep the slack.
- Hole 5: doc 14's legs (1.8 / 1.2 / 2.2 on the centre line, R 0.9 corners) give a 4.15 x 2.25 m Z, not 4.8 x 2.8; the
  Z is centred in the 4.8 x 2.8 box and dressing fills the rest. Doc 14 must change either the legs or the box.
- Hole 6: the run-in and lowered back are a review fix for the 5 Dec full-width rig to confirm (doc 14 to be updated).
- Hub portals carry the district names now; if they're the first cut, the hub street posts must come back clear of
  the walk routes (the old spots are inside the v4 Midtown route).
- Doc 14 contradictions (holes 3, 5, 7, 8, 9, 1): see the builders' notes and `review-fidelity.md`; not integration work.
- `CLAUDE.md`'s Files section doesn't list `status/countdown-golf-3d-iter1.html` or `scenery.js` yet (not mine to edit).
