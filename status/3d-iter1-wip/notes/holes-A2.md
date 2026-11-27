# Hole builder A2: holes 9 and 8 (27 Nov 2026)

Files: `W/holes/h9.js`, `W/holes/h8.js` (each carries the group A helper block copied verbatim from `h10.js`: `polyBox`, `railRun`, `GB`, `bar`, `teeMat`).
Test page `W/out/A2.html` (layout-test.json); sheets `W/out/A2-sheet1.png`, `W/out/A2-sheet2.png`.
Physics: v^2 = 10gH/7 + 2aL, a = 0.6 m/s^2 (doc 14). Heights below are relative to BASE (0.10 m above the floor).
Checks done: dump.py on the test layout and on a mirrored copy (mirror true, tside +1: builds cleanly, extents mirror, umbrella swaps side). Two sheets looked at: pizza, crust, gutter, slice sign, bun funnel in plan, squiggle, cart menu all read correctly. The `cam=side` views are blocked by layout scenery (brownstone, towers) even with iso=1, so no elevation check was possible.

## Hole 9 Brooklyn Pizza (5.0 x 1.95 box)

As built (local u from the open tee end at -2.5; tee -2.2, cup 1.6):
- Lane 950 mm, BASE, u -2.5 to 0.0; 45 deg flare walls u 0.0 to 0.40 (to 1.75 m). Flare geometry is design A's (doc 14 only says "flaring to 1.75 m").
- Crust: full-width 1:5 bevel u 0.40 to 0.775, BASE to BASE+75. Foot is 2.6 m from the tee (lane length taken as tee to crust foot). Needs 1.23 m/s at the foot.
- House BASE+75, u 0.775 to 2.40, 1.75 m wide. Painted pizza (S12) Ø1.6 centred at u 1.6 (3.8 m from the tee), pizza front edge 25 mm past the crust top. Crust ring 70 mm, eight Ø150 pepperoni (centre = cup, others on r 0.50), dashed inner circle Ø0.60, slice cuts.
- Oven gutter u 2.40 to 2.52 (120 mm), full width. Floor 45 mm under the house at the -v rail (BASE+30), falling 3 deg over 1.50 m to BASE-49 at the pocket. Pocket = last 250 mm at the +v rail (x K.s), 120 mm wide, floor flat at BASE-49 (124 mm under the house, 51 mm above the floor). Hard dark floor. Orange hole LED along the foot of the back wall.
- Rails: cap 100 mm above the local surface (BASE+100 on the lane, sloped over the crust, BASE+175 on the house and along the gutter). Tee end open (as h10).
- Far end: posts bolted to the back rail's outer face (no floor plates); neon "PIZZA THE ACTION" board at u 2.565; 1.2 m pizza-slice cut-out behind it (tip at 0.70 m, crust at 1.90 m); menu board on the +v post with the 11:59 detail "WHOLE PIE 11.59".
- Junior tee u -0.25, BASE (1.85 m to the centre, about 1.81 m/s).
- Real extents: u -2.50 to 2.63, v ±0.951. **L x W = 5.13 x 1.90** (the back rail outer face is at 2.596; the sign adds 0.03).
- Speeds: ace (dies in the cup) 2.37 m/s from the tee; inner circle window 2.29 to 2.45 m/s (about ±3.3%). Both match doc 14 (about 2.3, about ±4%).

Doubts and deviations:
1. **Length does not fit 5.0 m.** Tee 0.3 m from the end + lane 2.6 + crust 0.375 + 25 mm + pizza 1.6 + gutter 0.12 + rail 0.076 = 5.10 m to the back rail (5.13 with the sign). Kept doc 14's numbers (brief G5). If the lane were measured from the deck end, the centre would be 3.475 m from the tee, contradicting "centre 3.8 m".
2. **Gutter depth only works on the raised deck.** 45 mm deep plus a 3 deg fall over about 1.5 m reaches 124 mm under the +75 house at the pocket. In doc 14's floor-laid build that is 49 mm below the floor. On the factory deck it bottoms out 51 mm above the floor, so it fits; flag for the build guide.
3. **3 deg only drains a ball on a hard floor.** Rolling pull at 3 deg is 0.37 m/s^2, below carpet drag (0.6). Built as a hard painted floor; doc 14 does not say.
4. Pocket size and side are not given: built as the last 250 mm of the gutter at the +v rail, 120 mm wide.
5. Doc 14 has no junior tee for hole 9 (design A had one at 2.6 m from the centre, which needs 2.04 m/s). Placed by review S1 (at most about 1.8 m/s).
6. The page's cup collar (Ø160) covers the painted centre pepperoni (Ø150).
7. The 11:59 menu board may belong on the brownstone shopfront (scenery); here it hangs on the sign post so the hole carries it alone. "1 SHOT · CURLING" on the totem is the page's job.

## Hole 8 Hot Dog Cart (5.2 x 1.5 box)

As built (local u from the open tee end at -2.6; tee -2.3, cup 2.05):
- Street lane 1.3 m, BASE, charcoal with a printed zebra crossing (u -1.85 to -1.45).
- Cart (old case 9 cart, reshaped): counter 0.6 m deep at u -1.0 to -0.4, body 1.45 m wide, underside at BASE+430 (the full-width arch), top at BASE+900 plus a steel plate; dark steel legs on the rail caps; wheels; "HOT DOGS · PRETZELS · SODA / Open till 11:59" menu on its tee face (the 11:59 detail); old case 9 display dog on the counter.
- Ø180 ketchup and mustard bottles touching the rails at u -1.12 (framing the arch); giant fries carton against the -v rail at u -0.12.
- Kerb 1:5, BASE to BASE+75, u 0.10 to 0.475 (foot 2.7 m from the tee end); 1.23 m/s at its foot.
- Sidewalk BASE+75, u 0.475 to 2.35 (grey paving), mustard squiggle printed down the channel to the cup.
- Bun halves: mouth at u 1.05 (0.90 m), straight faces to 0.40 m at u 2.15 (12.8 deg), closed end R 0.20 centred at u 2.15, apex at u 2.35 = back rail face. Halves 1.3 m mouth to apex, fill to the rails (gap 0), crown 150 mm (BASE+225), inner EVA face 135 mm vertical then rounded; 0.2 m mouth faces square to the lane; PVC angle on the noses; S3 45 deg fills (0.10 m legs, assumed) in the mouth-face/rail corners.
- Cup u 2.05, on the axis, BASE+75 (0.30 m from the closed end). Channel there 0.445 m wide.
- Junior tee u 0.60 on the sidewalk, 1.0 m past the cart (1.45 m to the cup, about 1.32 m/s).
- Umbrella: post outside the rail at v = -tside x 0.9 (away from the totem), striped canopy R 0.8, rim 1.92 m, top 2.2 m; sandbag; "FERRY →" blade at 1.55 m pointing +u from both sides (integrator: flip if the next hole is the other way).
- Neon "RELISH THE MOMENT" at the far end, posts at u 2.525.
- Real extents: u -2.60 to 2.585, v -0.75 to 0.75 (the umbrella is the brief's declared extra, to v 1.7). **L x W = 5.19 x 1.50** inside the box.

Doubts and deviations:
1. **Ace speed vs box.** With the tee 0.3 m from the end and the cup 0.3 m from the closed end at the box's far end, tee to cup is 4.35 m and the ball needs 2.51 m/s just to die in the cup; doc 14 says 2.2–2.4 m/s, which is design B's 3.5 m geometry (4.5 m box). Either the hole is shorter than 5.2 m, or the tee moves about 0.8 m forward, or the ace speed is about 2.5–2.7 m/s. Built to the brief's frame (tee -2.3, cup 2.05).
2. "1:5 kerb to +75 at 2.7 m" is ambiguous: taken as the kerb foot 2.7 m from the tee end (design B wording "the green starts at 2.7 m with a bevel"). That leaves 0.575 m of flat sidewalk before the bun mouth, which doc 14 does not mention.
3. The cart position is not given: placed so that "junior tee 1.0 m past the cart" lands on the +75 sidewalk. A junior tee on the street would need at least 1.86 m/s (over the S1 limit).
4. Halves "1.3 m long" read as mouth to closed-end apex: then 0.25 m of taper per side over 1.10 m gives 12.8 deg, consistent with "about 13 deg".
5. S3 corner fills are an open should-fix; included at an assumed 0.10 m leg (doc 14 names S3 under risks).
