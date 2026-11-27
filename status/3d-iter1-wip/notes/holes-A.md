# Hole builders, group A (holes 10, 9, 8, 7): notes

Agent: hole builder group A, 27 Nov 2026. Files: `W/holes/h10.js`, `h9.js`, `h8.js`, `h7.js`.
Test page: `W/out/group-A.html` (built with `layout-test.json`). Sheets: `W/out/h10-sheet.png` etc.

## Shared approach (all four holes)

- Every builder carries the same small helper block (between `group A helpers BEGIN/END`), kept inside the builder so each file stands alone. It gives:
  - `polyBox(poly, yF, topMat, opt)`: a deck box from the floor up to a planar top (flat, sloped or cross-falling), sides in `K.fascia`, any edge can take another material (risers, oven paint) or be skipped.
  - `railRun(pts, out, closed)`: the rail as one body from the floor to the cap (the deck side and the rail in one piece, `K.fascia`, which is what a factory frame does), the white cap 72 mm wide with its **top 100 mm above the local playing surface** (brief G3; note the old `railsFor` puts the cap top at 118 mm), the hole LED under the cap's outer overhang and a kick strip on the floor. Points carry the local surface height, so rails step with terraces and slope with ramps and kerbs. Corners are mitred.
  - `GB()`: a tiny geometry builder that orients every face outward, so mirroring (`K.s = -1`) never turns faces inside out.
- Deck-top textures map canvas x to +u and canvas down to +v (as seen from above, unmirrored), so painted details sit where the mirrored geometry puts them. No text is painted on decks.
- Rail convention as the page: the rail's inner face is the lane edge; the rail body (45 mm) lies outside it; the cap overhangs outward by 31 mm.
- Physics checks use v^2 = 10gH/7 + 2aL with a = 0.6 m/s^2 (doc 14's drag), rolling-ball slope pull = (5/7) g sin(angle). Script: scratchpad `nums.py`; outputs quoted per hole below.

