# Hole builder B2: holes 7 and 6 (notes)

Agent B2, 27 Nov 2026. Files: `W/holes/h7.js`, `W/holes/h6.js`. Test page `W/out/B2.html` (layout-test.json). Sheets `W/out/B2-r1.png`, `B2-r2.png`, `B2-r3.png`.

Shared approach: both builders carry group A's helper block verbatim (spliced from `h10.js`: `polyBox`, `railRun`, `GB`, `topTex`, `teeMat`, `clockTex` ...) plus a small B2 block: `grid()` (indexed surface with smooth normals; picks its winding from an outward vector, so mirroring stays outward-facing) and `limb()` (tapered cylinder). Rails are `railRun` (cap top +100 mm over the local surface, LED under the cap and at the floor). Every v goes through `P3`/`s`; the statue and signs are rotated, never scaled negative. Widths are clear (between rail faces); rails stand outside them. Physics: v^2 = 10gH/7 + 2aL, a = 0.6 m/s^2 (doc 14).

## Hole 7 Brooklyn Bridge (yellow LED)

As built (local frame, heights relative to BASE = 0.10):
- Lane 0.90 m clear on the approaches, converging linearly to 0.50 m over each ramp; plateau 0.60 x 0.50 m. Lane 5.00 m clear D apex to D apex; D ends R 450 (half the lane), D centres at u = +-2.05.
- Heights: both ends BASE; plateau BASE +150 (rail caps BASE +100 on the ends, BASE +250 on the plateau).
- Ramps: 12 deg straight with R 600 transitions top and bottom. Transition plan length 0.125 m each, straight 0.582 m, ramp 0.832 m in plan; ramp foot at |u| = 1.132; approaches 1.368 m (foot to D apex).
- Cross-fall: 3 deg toward the centre line on the 12 deg straight, faded in and out with the slope through the R 600 transitions (so the ends and plateau stay flat and nothing steps). Edges sit up to about 18 mm above the centre line mid-ramp; the rails follow that height.
- One smooth surface (indexed grid, 19 stations per ramp) for both ramps and the plateau; flat turf ends with the D. Printed plank "promenade" carpet on the hill, turf on the ends.
- Cup flush at [0, 0], BASE +150, with the 10 mm rubber catch ring, 190 mm across (torus, tube 5 mm).
- Tees: [-2.25, 0] (wrapper) and [2.25, 0] (drawn), both BASE. Junior tees 0.6 m nearer at +-1.65.
- Towers (S4): two 2.60 m portal flats (40 mm, granite-course print) at u = +-1.30, i.e. 0.17 m clear of each ramp foot, legs at |v| 0.58-0.74 outside the rails, flat bottom at 0.30 m on two posts each (posts on the plateau side, so each end sees the stone face), sandbags. Pointed arch: springing 1.78, apex 2.38; clear height 2.15 m over the lane edge, 2.03 m over the rail caps' outer edge. Cornice 2.45-2.60.
- Festoon cables tower to tower at |v| 0.66, 2.56 m at the towers, 2.42 m at mid-span (doc 14: at least 2.4 m); warm bulbs every 0.2 m.
- Pun sign "MEET YOU / IN THE MIDDLE", two-faced, hung mid-span over the cup, bottom 2.10 m, top 2.40 m.
- 11:59: a bridge lamp clock (lamp post, lantern at 1.70 m, double-faced clock at 1.38 m) beside the plateau at |v| 0.60, on the side away from the totem (uses h.tside).
- Painted lattice railing on the rails' outer faces along the hill (design A's volunteer paint), below the LED line.
- Box: 5.152 x 1.56 m inside the 5.4 x 1.6 brief box (towers' cornice to |v| 0.78). Dump: u +-2.576, v +-0.78, y to 2.60.

Physics as built: about 1.76 m/s at the foot to crest (doc 14: 1.80 with its 0.95 m ramp), stops on top up to about 1.96 m/s (doc 1.99); from the tee 2.11-2.27 m/s (doc 2.2-2.35).

Doubts (doc 14):
- **Ramp length.** 12 deg + R 600 transitions + 150 mm rise gives a 0.832 m ramp, not "about 0.95 m"; doc 14's 1.80 m/s uses 0.95 m. To get 0.95 m you need R about 1.16 m transitions at 12 deg, or about 10.1 deg max slope with R 600. I kept 12 deg / R 600 / +150 / 0.60 plateau / 5.0 m lane (the hard numbers) and let the approaches grow to 1.37 m ("about 1.25"). The drawings must pick one.
- **"Cross-fall 3 deg toward the centre"** read as a shallow V across each ramp (edges higher). It cannot be full 3 deg right at the foot or the crest without a step at the flat ends and plateau, so it fades in with the slope. Say so on the drawing.
- **Tower position**: doc 14 S4 says "clear of the ramp foot"; I set the flats 0.17 m out from each foot on the approach side. Arch clearance meets "crossbeam 2.1 m or more" over the lane (2.15) but only 2.03 m over the rail caps; open pylons would remove the question.

## Hole 6 Liberty Island (teal LED)

As built (heights relative to BASE):
- Leg A (harbour) 0.90 m clear x 3.00 m clear (tee-end rail face u = -2.2 to the island leg's inner rail face u = 0.8), blue printed carpet at BASE. Leg B (island leg) 1.40 m clear (u 0.8-2.2) x 2.20 m (from the harbour's inner rail line v = -0.824 to the end rail face v = 1.376).
- **Box grew to 4.552 x 3.60 m** (brief 4.4 x 3.6): doc 14's 3.0 + 1.4 m are clear lengths, so the rails add 0.152 m. Dump: u +-2.276 (flagged "outside box", expected), v -1.80 to 1.799, y to 3.20. The occupied rectangles shift accordingly: harbour + corner [-2.276, -1.8, 2.276, -0.748]; island [0.724, -0.748, 2.276, 1.452]; pedestal [1.15, 1.453, 1.85, 1.799].
- Banked corner (M4): a 90 deg cone segment, axis at (1.20, -0.724), i.e. 1.00 m from both outer rail faces (my reading of "about R 1.0 m"). 45 deg straight face from R 0.60 at the foot (BASE) to R 0.915 at +315 mm, then a R 50 curl turning 135 deg to the lip at +400 mm (lip edge R 0.879, overhang 50 mm, max R 0.929). Closed back: the corner behind the face filled solid to +400 between the lip and the rails (S5 closed back); cheeks are vertical end panels in the radial planes at the two tangent ends (u = 1.20 facing leg A, v = -0.724 facing the island), closed to the rails; padded nosing on the lip. Built as one smooth indexed surface (36 x 11), white and teal wave print.
- Shore 1:5, 375 mm, v -0.624 (BASE) to -0.249 (+75), full leg B width; its foot 0.10 m past the wave's downstream cheek, 0.20 m past the harbour rail line (the wave-foot strip of leg B stays harbour, BASE).
- Island BASE +75, 1.625 m flat from the crest to the end rail; cup [1.5, 0.951] = 1.2 m past the crest on leg B's centre line, in a painted 11-point star (outer R 0.42) - the star fort.
- Tee [-1.9, -1.274] (0.30 m from the tee-end rail, lane centre); junior tee 1.2 m nearer at [-0.7, -1.274] (design A; doc 14 silent).
- Rails: one closed run round the L, cap +100 over the local surface, sloped up the shore on both sides.
- Pun sign "LIFT YOUR / LAMP" on slim posts at the far rail behind the wave (u 2.25, v -0.65 to -1.75, 1.05-1.45 m), facing the tee.
- Statue after the original 1886 statue: robe (lathe, fold print), palla drapes, raised right arm with torch (gold cup, glowing flickering battery flame, reduceMotion respected), left arm holding the tablet reading XI:LIX (11:59), crown with seven rays, broken chain and right foot at the hem. 2.60 m from sole to flame tip, on a 0.60 m granite pedestal (0.70 x 0.35 m) outside the end rail; flame top 3.20 m above the floor. Faces the island (-v), turned 6 deg toward the tee; rotated, never mirrored (torch stays in her right hand).

Physics as built: about 1.23 m/s at the shore foot to crest (doc 14 about 1.2); about 1.72 m/s at the foot to reach the cup.

Doubts (doc 14), physically doubtful parts flagged rather than "fixed":
- **Upstream cheek.** A 90 deg cone tangent to both outer rails ends at u = 1.20 with a vertical cheek facing leg A across the outer 0.40 m of the 0.90 m harbour (0 at 0.5 m from the outer rail, about 0.28 m tall near the rail). A putt in that band strikes the cheek instead of riding the face - the same failure M4 cured on the downstream side. Likewise a ball still high on the face at the downstream end runs off the cone's end over the cheek. Doc 14 says "cheeks closed to the rails" and gives no run-in/run-out; the full-width rig (Sat 5 Dec) should test a tapered run-in along the outer rail before the drawings are frozen.
- **"About R 1.0 m"** is ambiguous for a 0.4 m-wide cone face: I set the axis 1.0 m from both rails (so the closed back meets the rails at the tangent ends); the face itself spans R 0.60-0.93. If R 1.0 is meant as the face's mid-radius, the cone grows about 0.24 m each way and the shore and cup move along leg B by about the same.
- **Face angle** not given in doc 14: 45 deg assumed (the M4 lineage; 400 mm high on a 0.40 m run).
- **Leg sizes vs box**: doc 14's 3.0 + 1.4 m only fit 4.4 m if they include the rails; kept them clear and grew L to 4.55 m (G5). The brief's island box (1.45 m outer = 1.30 m clear) would be 0.1 m narrower than doc 14's 1.4 m.
- **Statue height**: doc 14 "the 2.6 m statue" read as the cut-out (design A: 2.6 m cut-out on a 600 mm pedestal box), so the flame top is 3.20 m. If 2.6 m is meant overall, the figure is 2.0 m.
- Island length: doc 14's 2.2 m "island" read as the whole of leg B from the harbour rail line (0.20 m wave-foot strip + 0.375 m shore + 1.625 m flat).
