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
