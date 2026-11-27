# Hole builder C2: holes 5 and 2 (27 Nov 2026)

Files: `W/holes/h5.js`, `W/holes/h2.js`. Test page `W/out/C2.html` (layout-test.json). Sheets: `W/out/C2-sheet1.png` (close/top/close/side), `W/out/C2-sheet2.png` (top zoom + tee glow, both holes). A mirrored build (`mirror: true` for both) also runs clean, and tee, cup and junior tee flip as they should.

Shared: both builders carry group A's helper block unchanged (`polyBox`, `railRun`, `GB`...) plus a small C2 block: `skin()` (a hard face on a rail's inner face, 1.5 mm proud), `plaque()` (small tilted lectern), `dialTex()` (clock face at 11:59), `arc()`, `noWalls()`. Deck tops are lane polygons with no walls of their own, because `railRun`'s body is the deck side from the floor up (K.fascia). Rail cap top is 100 mm above the surface everywhere (G3). All v values are multiplied by `K.s`, and no mesh uses a negative scale.

## Hole 5 Central Park Loop

**Reading of doc 14 (main doubt).** Doc 14 gives a 0.9 m path, legs 1.8 / 1.2 / 2.2 m, outer corners R 0.9 and a 4.8 × 2.8 Z. These numbers do not agree under any reading:
- *Centre-line lengths* (tee-end rail face to the first centre-line intersection, then between the intersections, then to the back rail face) give a Z of 4.0 × 2.1 m clear, **4.15 × 2.25 m over the rails**.
- *Straight parts between the bends* give 4.9 × 3.0 clear, 5.05 × 3.15 m over the rails, which does not fit doc 14's box.
- The brief's frame table fills the 4.8 × 2.8 box, which needs legs of about 2.35 / 1.75 / 2.45 on the centre line. That matches no doc 14 number.
I built the **centre-line reading**. It is the natural one for a path, and it reproduces doc 14's own pace figure: with the old +75 lawn and 12.5% loss per corner, the ace speed works out at 2.95 m/s, and doc 14 says "about 2.9–3.0". The straight-parts reading gives 3.4 m/s. The Z is centred in doc 14's 4.8 × 2.8 box, and the trees, benches, lamps, wheels, fountain, clock and sign fill the rest. So L × W stays 4.8 × 2.8 including dressing (dump: u ±2.34, v ±1.38).

**As built (local unmirrored frame, metres):**
- Lane faces: tee end u = -2.00, back u = +2.00. Leg 1 v ∈ [-1.05, -0.15], leg 3 v ∈ [0.15, 1.05], leg 2 u ∈ [-0.65, 0.25]. Centre lines v = ∓0.6 and u = -0.2.
- Occupied rectangles over the rails: leg 1 [-2.076, -1.126, 0.326, -0.074], leg 2 [-0.726, -1.126, 0.326, 1.126], leg 3 [-0.726, 0.074, 2.076, 1.126]. Pockets: A [0.326, -1.4, 2.4, 0.074], B [-2.4, -0.074, -0.726, 1.4]. **These replace the brief table's rectangles.**
- Outer corners: R 0.9 on the rail face, centred on the inner corners (-0.65, -0.15) and (0.25, 0.15). With R equal to the path width, leg 2 has only a **0.3 m straight**, so the two bends make an S. Inner corners are rounded R 0.15, and the void behind each rounding is filled with a solid post up to the cap.
- Tee [-1.70, -0.60], 0.3 m from the tee-end face (doc 14 silent). Cup [1.30, 0.60]: 0.5 m past the old crest, which is 0.7 m from the back rail. Junior tee [-0.20, -0.32] on leg 2, 0.28 m past the first intersection.
- **Brief table had tee [-2.1, -0.93] and cup [1.9, 0.93]. Both move** (the layout should use the values above).
- Heights: the whole path is at **BASE** (G2: no +75 lawn, no 1:5 bevel). The lawn (last 1.2 m) is still printed in lighter mown stripes, with a printed fountain basin round the cup. Rail cap at BASE+0.100. Stone arch over leg 2: piers stand 0.15 m behind the lane faces, clear of the rails (opening 1.2 m). Springline BASE+0.113, crown BASE+0.713, so the clear height over the lane edges is 0.51 m (design A's 0.9 × 0.5 portal; doc 14 gives no size). Arch top 1.00 m from the floor.
- Hard face: lacquered-ply face (honey colour, gloss) on both R 0.9 outer curves, per S6 and G3. Straight rails are the standard rail.
- Props: two Christmas trees, 2.28 and 2.38 m high, foliage bases Ø0.84 (doc 14 asks 0.9 or less), at (0.95, -0.75) in pocket A and (-1.12, 0.78) in pocket B, with fairy lights (instanced). Five old Bike Lane wheels (R 0.33) stand on the floor tangent to the outside of the curves (two per bend) and one beside leg 3. Two bench cut-outs, three lamp posts (1.85 m), a fountain (0.55 m) in pocket A, and the park clock at 11:59 (post clock, 1.97 m, two dials) in pocket A. The neon "WHEEL SEE YOU / NEXT YEAR" board sits beyond the back rail (bottom 1.18, top 1.56 m). The "THE RAIL IS YOUR FRIEND" lectern is in the tee-end corner, clear of the putting line.
- Pace with the flat lawn (drag 0.6 m/s², arriving at 0.3 m/s): ace about 2.5–2.7 m/s at doc 14's 10–15% corner loss, and **3.2–3.55 m/s at the review's 25–30%**. G2 helps the pace a little, but at the review's loss an ace stays doubtful (S6).

**Deviations:** rail cap 100 mm (G3), where doc 14's "five stacked 18 mm arcs, top one the cap" make 90 mm. Lawn and bevel removed (G2), so the review's "move the bevel 0.3 m if loss > 20%" is moot. Tee, cup, leg rectangles and pockets differ from the brief table (see above).

**Open issues / doubts:** (1) the leg / box inconsistency above needs a decision by the team: either the legs or the box should change in doc 14. (2) The 0.3 m leg-2 straight puts the junior tee and the arch right next to the bends. (3) I read "last 1.2 m green, cup 0.5 m past the crest" as a 1.2 m flat green with the crest at its leading edge, which gives a cup 0.7 m from the back. Reading the 1.2 m as including the bevel would put the cup 0.33 m from the back.

## Hole 2 Grand Central Whispering Gallery

**As built:**
- Ellipse on the rail's inner (hard) face: a 1.40, b 0.95, c = 1.028 (doc 14: 1.03), 144 points. Every A → wall → B path is 2a = 2.80 m. The rail outline (45 mm body, 76 mm with the cap) measures **2.95 × 2.05 m**.
- Tee at focus A [-1.028, 0], cup at focus B [+1.028, 0], unchanged under mirroring.
- Heights: the whole ellipse is one flat level at **BASE**, cap at BASE+0.100. Booth at the centre is Ø0.40 and 0.35 m overall: EVA band BASE..+0.10, brass drum to +0.22 with a cream band, brass cone to +0.335, finial to +0.35, and four clock dials at 11:59 (Ø0.08 bosses) on the cone. It blocks ±12.4° from A, counting the ball's radius (doc 14: about ±12°).
- Rail face: lacquered hardboard (dark brown gloss) all round, no EVA (M7). Amber LED from `K.led`.
- Deck print: teal star field with invented constellations (not the terminal's zodiac), a brass ring round A (the wrapper's tee mat sits in it) and a brass double ring round B.
- Behind B: the existing Ø1.0 m clock at 11:59, centre 1.80 m, **top 2.30 m**, with a numerals face, brass bezel, lit opal, facing the tee. It hangs on an 80 mm post at u = 1.58, braced by two diagonal struts out to v ±0.55. A 0.2 × 1.2 m base plate and two sandbags stand in for the 30 kg ballast. Neon "MEET ME UNDER / THE CLOCK" board under the clock (0.92–1.22 m). The "AIM ANYWHERE OFF THE WALL. EVERY BOUNCE IS THE SAME DISTANCE." lectern is at the tee-end corner on the totem side. Extents u [-1.53, 1.69], v ±1.03, so it sits inside doc 14's 3.4 × 2.1.

**Checks:** 1.9 m/s from A reaches B at 0.5 m/s, and 2.4 m/s at 1.55 m/s, before any wall loss (drag only). After a hard-face rebound loss, doc 14's 0.3–1.2 m/s at B is plausible. No point is more than 0.95 m from the rail.

**Deviations / interpretations:** (1) "Booth Ø0.40 m, 0.35 m high, … cone top with four clock faces": I read the 0.35 as overall height including the cone, so the four faces are small dials on the cone. If doc 14 means a 0.35 m drum with the cone above it, the booth grows to about 0.5 m. (2) No junior tee: doc 14 gives none, and any other tee spot loses the focus-to-focus property. (3) Not modelled: the three-piece deck seams (S8, factory detail), the octagon fallback, and the optional 1.5–2° dish (both are contingencies). (4) The clock is single-faced toward the tee. "Its clock faces hole 1's 2027" is for the layout to arrange.

**Doubts:** the clock post has only 0.22 m behind the rail inside doc 14's 3.4 m length, so the braces run sideways. That is fine in the model, but a 30 kg Ø1 m clock at 1.8 m on that footprint needs the build guide's check. Review item 11 flags "Grand Central" as a licensed name, and the hole name and sign come from the layout record, not from this builder.
