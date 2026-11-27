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
