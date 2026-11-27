# Hole builder D2: holes 3 and 1 (notes)

Agent: hole builder D2, 27 Nov 2026. Files: `W/holes/h3.js`, `W/holes/h1.js`. Test page `W/out/D2.html` (layout-test.json); sheets `W/out/D2-sheet1.png`, `D2-sheet2.png`. Mirror check (`mirror: true`, K.s = -1) built and dumped clean (scratch layout, not kept).

Shared: the group A helper block from h10.js (polyBox gains `opt.side` and `opt.walls`), plus a D2 block: `fieldTop` (deck top over a polygon cut into u-slabs, exact at every station, for rounded ramps), `sweep` (a band along a plan path, for the hairpin walls, lead-ins and LED rings), `sampleRun` (rail points at every station so rails follow vertical curves), `vcurve` (grade line through PVIs with R 600 parabolic rounding). Rails come from `railRun`: cap top +100 above the local surface, stepped or sloped. Each builder returns a `check` object (key heights and speeds computed from its own constants), which `dump.py` prints.

## Hole 3 The Subway (h3.js)

Frame: a U turning toward +v. Ramp leg clear v -1.2..-0.2, island v -0.2..0.2 (tiled infill), return green clear v 0.2..1.2 from u -1.35 to the tile wall at u 1.25. Loop box behind the wall from u 1.25 to 2.0.

As built (heights above BASE = the tee flat, doc 14's 0; mm):
| Point | Built | Doc 14 |
|---|---|---|
| Tee flat u -2.0..-0.72 (tee [-1.7, -0.7], 0.98 m to the ramp foot) | 0 | 0 |
| Ramp 1:6, foot u -0.72, crest u 0.75 (1.47 m) | crest grade point +245; R 600 rounding gives an apex of +240.8 | about +245 |
| Platform 0.5 m, falling 1:12 | sills +203.3 | about +203 |
| Lead-ins 1:4 (outer / middle / inner) | 25.0 / 37.2 / 49.5 mm drops, 100 / 149 / 198 mm long | 25 / about 37 / about 50 |
| Loop floor entries (outer / middle / inner) | +178.3 / +166.1 / +153.8 | outer about +178 |
| Plane | 5.0° across the box, falling toward the exits | 5–6° |
| Exits (outer / middle / inner) | +76.8 / +89.1 / +101.3 | outer about +77 |
| Exit bevels 1:4 to the green | 9.8 / 22.1 / 34.3 mm, 39 / 88 / 137 mm long | 10 mm step (outer) |
| Return green | +67 | +67 |

- The height chain closes: 245 − 41.7 (platform) − 25 (lead-in) − 101.5 (outer loop) − 9.8 (bevel) = 67.
- Speeds (v² = 10gH/7 + 2aL, a = 0.6): 2.27 m/s at the foot, 2.52 m/s from the tee. Doc 14 says about 2.3 and 2.5.
- Hairpins are concentric about (u 1.335, v 0), with radii 0.30 / 0.44 / 0.58. Channels are 110 mm wide, walls 30 mm (radii 0.23 / 0.37 / 0.51 / 0.65), core r 0.215. The box is 1.33 m across and 0.75 m deep (outer wall apex at u 2.0).
- Portals sit at v -0.30 / -0.44 / -0.58 (Shuttle ◆ inner, Local ◯, Express ★ outer, which is left from the tee). Exits mirror them at +0.30 / +0.44 / +0.58. Two 30 mm PVC round noses stand between the portals.
- Cup at [0.05, 0.58]: 1.2 m out from the Express exit, on its line.
- Funnel mouth 0.42 m (v -0.23..-0.65). The outer funnel rail runs at 20° from u -0.26 on the ramp. The island-side rail kinks 30 mm in over the platform.
- Lid: 4 mm clear, 60 mm over the plane, 4 thumbscrews. Ice-blue LED ring under the lid and a kick strip round the box.
- Tile wall: 18 mm tiled sheet across the full width, 0.62 m above the sill, with a black band carrying the line symbols over each portal and exit ("PICK A TRAIN" / "ARRIVALS"). The 11:59 platform clock is on the wall above the island. The neon pun sign stands on posts behind the wall (bottom 0.98 m, top 1.36 m).
- Junior tee [-0.9, -0.7] at the ramp foot. A white place-rule spot is painted on the platform at [1.0, -0.47].

Deviations and doubts (decisions for the team):
1. **Headroom versus lead-ins (doc 14 inconsistency).** A lid 60 mm above the plane leaves only about 10 mm over the inner sill (the floor there is 50 mm above the plane), so the ball cannot enter. I built a raised clear strip over the first 0.2 m behind the wall: lid at sill + 60 mm, walls taller under it, clear risers. Doc 14 does not show this; it needs a decision.
2. **Wall height.** Doc 14's "three stacked 18 mm arcs" make 54 mm, but 60 mm headroom needs 60 mm walls. I built 60 mm (a 6 mm spacer or a fourth layer).
3. **Width.** Doc 14's clear widths (1.0 + 0.4 + 1.0 = 2.4) leave no room for the outer rails. Real box: 4.02 × 2.55 m over the rails and the kick strip. The layout should reserve 2.55 m.
4. **Funnel angle.** Concentric hairpins force the portals against the island, so the funnel narrows from one side only. Doc 14 gives no funnel length; over the 0.5 m platform alone the rail would sit at about 48°. Design B's "about 20°" only works for a symmetric funnel. I kept 20°, so the funnel starts on the ramp and the crest is 0.63 m wide. A small floor triangle stays outside the funnel rail.
5. **Lead-ins run into the arcs.** A 0.75 m deep box puts the hairpin centre only 85 mm behind the wall, so the middle and inner lead-ins (149 and 198 mm long) continue into the curve. I built them that way, height following path distance.
6. **R 600 transitions** at the ramp foot and crest are my addition. Doc 14 specifies them for holes 1 and 7 but says nothing for hole 3, and a sharp 14° crest break would launch balls. The apex comes out at +241 against the +245 grade point.
7. **Cup.** Doc 14's "on the Express line" puts the cup at v 0.58, not the brief's "about 0.7".
8. **The tile wall hides the loop box from the tee.** You see the hairpins from the sides and above; the pun sign partly shades the box in overhead renders. The 1.6 m kiosk is scenery on hole 4's sidewalk (not built here). No car front, since doc 14 lists no props over 2 m.

## Hole 1 Times Square (h1.js)

Frame: straight. Open tee end at u -3.1, lane 1.0 m clear. The walkway side is taken as the totem side: local sign `h.tside * K.s`, -1 in the test layout.

As built (heights above BASE = the lane; mm):
| Item | Built | Doc 14 |
|---|---|---|
| Adult tee | u -2.2, 0.8 m of flat to the ramp foot (0.9 m from the open end) | 0.6 m forward, 0.8 m flat |
| Ramp 1:6, 1.2 m, R 600 at foot and crest | foot u -1.4, top u -0.2, +200 (rounded apex +197.4) | +200, R 600 |
| Crest 0.3 m, 3° toward the board, narrowing 1.0 → 0.80 m | +200 → +184.3 | as built |
| Board 0.80 × 0.80 at 12° (u 0.1..0.8825) | +184.3 → +17.9 | "slot end about 35 mm" |
| Pegs | 116 (6 rows of 11, 5 rows of 10), Ø10, 45 mm proud, 71 × 62 mm pitch, 11 rows, perpendicular to the board | about 115 |
| Cover | 4 mm clear, 55 mm above the board, 4 thumbscrews | as built |
| Slots | five × 130 mm (centres 0, ±0.16, ±0.32), 30 mm dividers, 15 mm wall fillers; dividers run 150 mm onto the tray | as built |
| Tray | lane level (BASE), 0.47 m long, carpet with 3 · 2 · DROP · 2 · 3, rails 100 mm, 15 mm open lip on the walkway side | about 25 mm drop, rails ≥ 90 mm |
| Tower | centre u 1.88: 0.8 × 0.8 m ballast plinth with sandbags, braced 0.3 m truss, DROP THE BALL neon at 1.42–1.76 m, 2027 neon at 2.0–2.35 m, Ø0.4 mirror ball, top 2.80 m (slow spin, honours reduceMotion) | about 2.8 m |
| Billboards | two, 2.4 × 1.4 m panels from 0.6 to 2.0 m at v ±0.98, lit both faces, invented brands; the 11:59 is an inner face ("11:59 · ONE MINUTE TO GO") | about 2.0 m |

- Speeds: 2.06 m/s at the foot, 2.29 m/s from the tee. Doc 14 says about 2.06 and 2.3.
- Junior tee at u -1.57, the ramp foot. `noCup: true`; `cup` is the tray centre [1.118, 0].
- Extents: u -3.1..2.28, v ±1.07. Inside the 6.2 × 2.2 box.

Deviations and doubts:
1. **Board and tray height chain (doc 14 inconsistency).** Doc 14 quotes the review's "slot end about 35 mm off the floor", but that figure ignores the 3° crest tilt. With the tilt it is +200 → +184 → +18, and a 25 mm tray drop would put the tray 7 mm below the lane. I kept every slope and length, set the tray at lane level and let the drop be 18 mm (within ±10 mm of "about 25").
2. **Tee spot.** Doc 14's 2.3 m/s from the tee only works with the tee spot 0.8 m before the ramp foot. "Moves 0.6 m forward" leaves the old 0.6 m tee zone as lane behind it. The brief's "about -2.6" would give 1.1 m of flat and about 2.4 m/s.
3. **Spare length.** Doc 14's elements add up to about 5.4 m of the 6.2 m box. The tower sits right behind the tray (design B: "a tray at the tower front"), leaving about 0.8 m free behind it. The layout can keep the slack or shorten the box.
4. **Wall teeth.** With 11-peg rows at 71 mm pitch on a 0.80 m board, the outer pegs are 40 mm from the wall. That is less than the 42.7 mm ball, a wedge, and teeth cannot widen it. On those rows the tooth fills the gap (r 40 mm, touching the outer peg). On 10-peg rows the teeth protrude 14.5 mm to give 61 mm gaps. Doc 14's "wall teeth keep every gap at 61 mm" cannot hold literally for the 11-peg rows.
5. **Walkway side and billboard sizes are assumptions.** The tray's open lip goes on the totem side and flips with the layout. Doc 14 gives the billboards only as "about 2.0 m" and "facing the party floor", so both faces are lit.
