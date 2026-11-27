# Review: fidelity of the ten hole builders against doc 14 (iteration 1)

Reviewer agent, 27 Nov 2026. Review only: no hole file, tool or page was changed.

## Method

- Read `BRIEF.md`, `LEAN.md`, every `ref/h<N>.md` extract, every builder's notes (`holes-A`, `A2`, `B`, `B2`, `C2`, `D2`) and the constants and geometry code of all ten builders. Doc 14 itself only by `grep`/`sed` (hole 3 flat, hole 6 cheek, trademark list); doc 13 section 5.3 (cups) and 5.8 item 6 (bullet); design B hole 3 (flat length); the review's M4 text.
- Test page: `assemble.py --layout layout-test.json` (all ten builders, the 27 Nov hole files including the `h9.js` re-centring wrapper). A second page from a copy of the test layout with **every** hole `mirror: true`.
- `dump.py` extents and builder return values for both pages, compared hole by hole.
- Tools: `shot.py` and `dump.py` still hard-code Windows Chrome. I ran scratch copies (originals untouched). `dump.py` works with `/opt/pw-browsers/chromium --headless=new --no-sandbox`. **`shot.py` with `--headless=new` writes blank tiles in about 3 s on this container (the virtual-time budget is ignored for `--screenshot`)**; it works with `chrome-headless-shell` (`/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`, no `--headless` flag). Tell the integrator if their fixed copy still produces near-uniform images.
- Dump caveat: `dump.py` measures an `InstancedMesh` by its base geometry at the group origin, so instanced parts (bulbs, sandbags, fairy lights, pegs, balusters, fries) are not placed correctly in the extents. The "y min below the floor" on holes 5 (-14 mm) and 7 (-35 mm) is only that (a bulb and a sandbag sphere at the origin); nothing really sinks into the floor.
- Physics checks use doc 14's own formula, v^2 = 10gH/7 + 2aL, a = 0.6 m/s^2.

Severity: **must-fix** = changes how the hole plays or what the factory would build; **should-fix**; **cosmetic**. "Doc" = a doc 14 problem that the model cannot fix alone.

## Summary of the numbers

Heights below are relative to the hole's lowest playing surface (= BASE 0.10 m above the floor, G1). Every hole's lowest playing surface is at BASE; every rail cap is 100 mm above its local surface (group A `railRun`, hole 4's own `rail()`), 45 mm rail body; every cup goes through the page's `addCup` at the returned `cupY`.

| # | Brief box | Real extents (dump, test layout) | Real L × W | Verdict |
|---|---|---|---|---|
| 10 | 5.4 × 1.25 | u -2.65 … 2.695, v ±0.60 | 5.35 × 1.20 | inside |
| 9 | 5.0 × 1.95 | u ±2.565, v ±0.951 | 5.13 × 1.90 | grew 0.13 m to keep doc 14's lengths (G5); layout v4 already 5.13 |
| 8 | 5.2 × 1.5 | u -2.60 … 2.585, v ±0.75 (umbrella to +1.70) | 5.19 × 1.50 + umbrella | inside; umbrella is the declared extra |
| 7 | 5.4 × 1.6 | u ±2.576, v ±0.78 | 5.15 × 1.56 | inside |
| 6 | 4.4 × 3.6 | u ±2.276, v ±1.80 | 4.55 × 3.60 | grew 0.15 m (doc 14's 3.0 + 1.4 m are clear lengths); layout v4 already 4.552 |
| 5 | 4.8 × 2.8 | u ±2.34, v ±1.38 | 4.68 × 2.76 (the Z itself 4.15 × 2.25) | inside, but see the hole 5 doc problem |
| 4 | 5.0 × 1.8 | u -2.531 … 2.533, v ±0.931 | 5.06 × 1.86 (cap overhang) | inside the 35 mm rail tolerance |
| 3 | 4.0 × 2.4 | u -2.0 … 2.022, v ±1.276 | 4.02 × 2.55 | grew W (doc 14's 1.0 + 0.4 + 1.0 are clear); layout v4 already 2.552 |
| 2 | 3.4 × 2.1 | u -1.53 … 1.69, v ±1.026 | 3.22 × 2.05 | inside |
| 1 | 6.2 × 2.2 | u -3.10 … 2.283, v ±1.07 | 5.38 × 2.14 | 0.82 m of the box unused behind the tower |

Mirroring: with every hole `mirror: true`, all ten builds run, every extent flips exactly in v, and every tee, cup, junior tee and hole 7's second tee keep u and flip v. Hole 8's umbrella and hole 7's lamp clock stay on the side away from the totem (they use `h.tside`, which is in group coordinates like the page's totem): correct. (Layout v4 mirrors only hole 10.)

## Hole by hole

### 10 Brownstone Stoops

All doc 14 numbers match: lane 950 (`HW` 0.475); boxes 1.0 / 1.2 / 1.0 / 1.9 m on the centre line (u -2.65, -1.65, -0.45, 0.55, 2.45); heights +125 / +60 / +40 / 0 (doc 14 +200 / +135 / +115 / +75 less 75); 1.5° cross-fall on T2 toward +v (the façade side, per the frame table), edges +72 / +48, pull (5/7)g sin 1.5° = 0.18 m/s^2 as doc 14 says; T2 → T3 lip skewed 20° (0.173 m at each rail); cup 1.2 m past the last lip and 0.2 m off centre away from the sag (`[1.75, -0.2]`); tee `[-2.35, 0]` on the landing; junior tee on T2; stepped rails with the cap 100 mm over each terrace and over the sagged edges; back corners filled; PVC nosing and glow tape on every lip; window clock at 11:59; neon "STOOP TO CONQUER".

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| Lip rounding | "Lips rounded 15–20 mm with PVC angle nosing" | square box edges with a 25 mm PVC angle drawn on them | radius not modelled | cosmetic |
| Tee end | "Stand on the floor beside the open tee side" | the tee **end** is open, both landing sides railed | reading | cosmetic (the open end is a 225 mm drop to the floor behind the tee; a back-spun ball drops off but is in reach) |

### 9 Brooklyn Pizza

Matches: lane 950 (`HL` 0.475) flaring to 1.75 m (`HH` 0.875, 45° flare walls over 0.40 m, design A); crust a full-width 1:5 bevel rising 75 mm (0.375 m); house +75; pizza Ø1.6 centred 3.8 m from the tee; eight Ø150 pepperoni, the centre one the cup; Ø0.60 dashed inner circle; oven gutter 120 mm wide, 45 mm deep at its high end, floor falling 3° to a 250 mm open pocket at one rail; 1.2 m slice sign; menu board "WHOLE PIE 11.59"; neon "PIZZA THE ACTION". Ace 2.37 m/s (doc 14 "about 2.3"). The 45 mm gutter step is taller than the ball's radius (21 mm), so nothing climbs back out: M6 holds.

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| Box length | 5.0 × 1.95 | 5.13 (tee 0.3 + lane 2.6 + crust 0.375 + 0.025 + pizza 1.6 + gutter 0.12 + rail) | +0.13 m | doc (justified; layout v4 already uses 5.13, and the `h9.js` wrapper re-centres it) |
| Lane 2.6 m | "Lane 2.6 m" | measured from the tee to the crust foot (from the open end it is 2.9 m) | reading | cosmetic; it is the only reading that gives "centre 3.8 m from the tee" |
| Gutter floor | 45 deep, 3° fall | 45 mm at the high end, 124 mm at the pocket (51 mm above the floor) | needs the raised deck | doc: on a floor-laid build it would go 49 mm below the floor; say so in the build guide |
| Gutter floor finish | not given | hard painted floor | — | should-fix in doc: 3° pulls 0.37 m/s^2, less than carpet drag (0.6), so it only drains on a hard floor |
| Cup collar | centre pepperoni Ø150 | the page's white Ø160 collar covers it | 10 mm | cosmetic |

### 8 Hot Dog Cart

Matches: lane 1.3 m; arch 430 mm, full width; counter 0.6 m deep; 1:5 kerb to +75; bun halves 1.3 m long (mouth to closed-end apex), 150 mm high, mouth 0.90 m to a 0.40 m channel (faces 12.8°), closed end R 0.20, filling to the rails, PVC noses; S3 45° fills; cup 0.30 m from the closed end, on the axis, flush at +75; junior tee 1.0 m past the cart on the sidewalk; Ø180 bottles touching the rails at the arch; umbrella 2.2 m on a sandbagged post outside the rail; "Open till 11:59"; "FERRY →"; neon "RELISH THE MOMENT".

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| Ace speed vs box | "Ace about 2.2–2.4 m/s" in a 5.2 m box | tee to cup 4.35 m → 2.50 m/s just to die in the cup | doc 14's speed is design B's 3.5 m hole | doc: either the ace speed is about 2.5–2.7 m/s, or the hole is about 0.8 m shorter (tee forward) |
| Kerb position | "1:5 kerb to +75 at 2.7 m" | kerb foot 2.7 m from the tee **end** (u 0.10), 0.575 m of sidewalk before the bun mouth | ambiguous | should-fix in doc (from the tee spot it would be u 0.40) |
| Fries carton | doc 14 lists "fries" only as volunteer dressing | a 0.20 × 0.13 m carton **inside the lane** against the -v rail at u -0.22 … -0.02, between the cart and the kerb | an obstacle doc 14 does not have | **should-fix**: it changes play (a block and two 90° corners on the line along the rail); move it outside the rail or onto the counter unless the team wants it |
| Cart wheels | — | wheel rings at v ±0.735 cut 6 mm into the rail cap overhang | 6 mm | cosmetic |

### 7 Brooklyn Bridge

Matches: lane 5.0 m clear with D ends (R 450); plateau 0.60 × 0.50 at +150 with the cup in the middle; 12° ramps with R 600 transitions; rails converge 0.90 → 0.50 over each ramp; 3° cross-fall toward the centre line (V across the ramp, faded through the transitions so nothing steps); 10 mm rubber catch ring Ø190; second tee at `[2.25, 0]`; junior tees 0.6 m nearer; two 2.6 m tower flats on posts outside the rails, 0.17 m clear of each ramp foot, arch clear 2.15 m over the lane (S4 "2.1 m or more"); festoons 2.42 m at the low point ("at least 2.4 m"); pun sign bottom 2.10 m; bridge lamp clock at 11:59 beside the plateau; neon "MEET YOU IN THE MIDDLE" two-faced. Speeds 1.76 m/s at the foot to crest, about 2.1–2.3 from the tee (doc 14 1.80 / 2.2–2.35).

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| Ramp length | "12° ramps with R 600 transitions (about 0.95 m each)" | 0.832 m each (150 mm rise at 12° with R 600 transitions cannot be longer); approaches 1.37 m ("about 1.25") | -0.12 m per ramp | doc: 0.95 m needs about 10° max slope with R 600, or R ≈ 1.16 m transitions at 12°; doc 14's 1.80 m/s uses 0.95 m. The drawings must pick one |
| Arch over the rail caps | S4 crossbeam ≥ 2.1 m | 2.15 m over the lane edge, 2.03 m over the caps' outer edge | -0.07 m at the caps | cosmetic (the legs at |v| 0.58–0.74 stop anyone standing there) |

### 6 Liberty Island

Matches: leg A 3.0 × 0.9 m clear, blue harbour at BASE; leg B 1.4 m clear × 2.2 m (from the harbour's inner rail line); 1:5 shore rising 75 mm over 0.375 m; island +75; cup 1.2 m past the crest on leg B's centre line in a painted star; tee 0.3 m from the end rail; conical 90° banked corner 400 mm high with a 50 mm curl lip, closed back, cheeks closed to the rails, padded nosing; pedestal outside the end rail; statue after the 1886 original, tablet XI:LIX, rotated not mirrored; neon "LIFT YOUR LAMP".

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| **Upstream cheek of the banked corner** | "The ball rides round at any speed" (M4: the conical corner replaces a face whose cheek sent balls back down leg A) | the cone starts with a full-height vertical cheek at u = 1.20 across the **outer 0.40 m of the 0.90 m harbour** (0 at 0.40 m from the outer rail, rising along the 45° face to +315 mm, then +400 mm at the curl and the closed back next to the rail). A putt along the outer 45% of leg A hits that cheek square-on and comes back down leg A: the M4 failure, kept for almost half the lane | play | **must-fix** (doc gap + model): add a tapered run-in so no face points at an incoming ball; see the must-fix table. The 5 Dec full-width rig must include it |
| Downstream end of the cone | — | the cone stops in the radial plane v = -0.724; a ball still high on the face there drops up to about 0.3 m onto the wave-foot strip | play detail | should-fix in doc (decide whether the face runs out into the shore foot; the rig will show it) |
| Closed back above the rails | "cheeks closed to the rails", S5 "closed back" | the corner fill's top is flat at +400 while the outer rails' caps stay at +100: a 300 mm block stands on the rail line, and a ball that clears the curl lands on a shelf with nothing behind it but a 300 mm drop over the rail | robustness | should-fix: raise the outer rails round the corner to the wave top (cap at about +450), or give the shelf a back edge, so a ball over the lip stays in the hole |
| "about R 1.0 m" | ambiguous for a 0.4 m-wide face | axis 1.0 m from both outer rails, face R 0.60 → 0.93 | reading | doc: if R 1.0 is the face's mid-radius the cone grows about 0.24 m each way and the shore and cup move |
| Face angle | not given | 45° | assumption | doc |
| Box length | 4.4 m | 4.55 m (doc 14's legs are clear lengths) | +0.15 m | doc (justified; layout v4 already 4.552) |
| Statue height | "the 2.6 m statue" | 2.6 m figure on a 0.6 m pedestal, flame top 3.2 m | reading | should-fix in doc: say whether 2.6 m is the figure or the total (the frame table says "statue 2.6 m on its pedestal") |
| Junior tee | silent | 1.2 m nearer the wave (design A) | — | cosmetic |
| Pun-sign posts | — | posts at u 2.245–2.275 pass through the far rail's cap overhang | 30 mm | cosmetic |

### 5 Central Park Loop

Matches: path 0.9 m clear; legs 1.8 / 1.2 / 2.2 m (centre-line reading); outer corners R 0.9 with a hard lacquered face (S6, G3); inner corners rounded R 0.15 and filled; flat at BASE (G2: no +75 lawn, no bevel; lawn still printed); cup 0.5 m past the old crest in a printed fountain; junior tee on leg 2; stone arch over leg 2; two trees 2.28 / 2.38 m with Ø0.84 foliage bases in the pockets (S6 ≤ 0.9); bike wheels outside the rails; benches, lamps, fountain; park clock at 11:59; neon "WHEEL SEE YOU NEXT YEAR"; "the rail is your friend" lectern.

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| **Legs vs box** | "Path 0.9 m; legs 1.8, 1.2 and 2.2 m ... R 0.9" in a 4.8 × 2.8 Z | centre-line reading: Z 4.0 × 2.1 clear, 4.15 × 2.25 over the rails, centred in the 4.8 × 2.8 box with dressing round it | box 0.65 × 0.55 m larger than the Z | **doc, team decision**: no reading fits both (straight-part reading gives 5.05 × 3.15). The builder's reading reproduces doc 14's own ace speed (2.95 m/s), so it is the defensible one. Doc 14 should state the Z as 4.15 × 2.25 over the rails, or change the legs |
| Tee and cup vs frame table | frame table tee `[-2.1, -0.93]`, cup `[1.9, 0.93]` | `[-1.7, -0.6]`, `[1.3, 0.6]` | 0.4–0.6 m | follows from the reading; layout v4 already uses the built values |
| Leg 2 straight | — | only 0.3 m between the two R 0.9 bends (they make an S) | consequence of R 0.9 = path width | doc note |
| Cup position | "Last 1.2 m a +75 green with a 1:5 bevel; cup 0.5 m past the crest" | crest taken at 1.2 m from the back rail → cup 0.7 m from it | reading | cosmetic (if the 1.2 m includes the bevel the cup is 0.33 m from the back) |
| Rail height | "five stacked 18 mm ply arcs, the top one forming the cap" = 90 mm | 100 mm (G3) | +10 mm | doc: the build guide needs a sixth layer or 20 mm caps |
| Arch piers | — | the piers pass through the filled inner-corner posts | overlap | cosmetic |
| Wheels | — | tyre rings sit 14 mm into the floor | 14 mm | cosmetic |

### 4 Gridlock

Matches: lane 5.0 × 1.8 charcoal needle-punch (rails stand inside it: clear 4.91 × 1.71, because doc 14 gives the lane and the box both as 5.0 × 1.8); eight cabs 360 × 170 × 140; two rows of three across the lane, outer cabs closed to the rails, two straight avenues of 0.315 m (doc 14 0.30–0.35); two cabs at 30° near the cup, both V pockets filled with 70 mm kerbs (S7); every gap ≥ 0.27 m or closed (checked: avenues 0.315, rows 0.63 apart, angled cabs 1.06 apart); flat at BASE with the crossing printed (G2); cup 0.5 m past the old crest (u 1.7); junior tee 1.5 m in; "CAB 1159", meter at 11:59, cones painted on the rails, neon "DON'T HONK. JUST PUTT.".

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| Lane width reading | other holes read doc 14 widths as clear | here the rails stand inside 1.8 | 90 mm narrower lane | cosmetic (consistent with the 5.0 × 1.8 box; say so in the drawings) |
| Tee end | — | closed (rail all round), unlike 10, 9, 8, 1 | — | cosmetic |

### 3 The Subway

Matches the height table exactly: crest grade point +245 (rounded apex +241 with R 600), sills +203.3, lead-ins 1:4 of 25 / 37 / 50 mm, loop entries +178 / 166 / 154, plane 5° across the box, exits +77 / 89 / 101, carpeted 1:4 bevels, return green +67, 1.0 × 2.6 m. Ramp 1:6 over 1.47 m; platform 0.5 m falling 1:12; portals 3 × 110 mm with 30 mm PVC noses; funnel 1.0 → 0.42 m; hairpin radii 0.30 / 0.44 / 0.58; loop box 1.33 × 0.75; 4 mm lid, 60 mm headroom, 4 thumbscrews; cup 1.2 m out on the Express exit line; junior tee at the ramp foot; place-rule spot on the platform; invented star / ring / diamond symbols (not round numbered bullets); platform clock at 11:59; neon "STAND CLEAR OF THE CLOSING DOORS". Speeds 2.27 m/s at the foot, 2.52 from the tee (doc 14 2.3 / 2.5). The tee flat is 1.28 m (tee 0.98 m before the foot): doc 14's "flat cut from 1.0 to 0.8 m" is the flat after design B's 0.5 m tee zone, so 1.28 m agrees with it and with the 4.0 m U.

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| **Lid over the lead-ins** | "4 mm polycarbonate lid, 60 mm headroom" over a plane falling 5° | a raised clear strip over the first 0.2 m behind the wall (lid at sill + 60) | not in doc 14 | **doc, must resolve before the build guide**: a lid 60 mm over the plane sits only 10 mm above the inner sill; the ball (42.7 mm) needs the lid at least sill + 43 mm, so the lid is too low at every portal (8 mm short at the outer, 20 mm at the middle, 32 mm at the inner) and no ball could enter. The builder's strip is a sound fix; doc 14 must adopt it or another |
| Wall height | "walls of three stacked 18 mm arcs" (54 mm) with "60 mm headroom" | 60 mm walls | +6 mm | doc: 54 mm walls can't carry a lid at 60 mm; a spacer or fourth layer |
| Box width | 4.0 × 2.4 U | 4.02 × 2.55 over the rails | +0.15 m | doc (justified; clear widths 1.0 + 0.4 + 1.0 leave no room for rails; layout v4 already 2.552) |
| Funnel | "funnel 1.0 → 0.42 m" | one-sided (the concentric hairpins put all portals against the island); outer rail at 20° starting on the ramp, crest 0.63 m wide | geometry | should-fix in doc: give the funnel's length and angle |
| R 600 at foot and crest | not given for hole 3 | added | apex -4 mm | cosmetic (needed: a sharp 9.5° break would launch balls) |
| Cup v | frame table "about 0.7" | 0.58, on the Express line | -0.12 | justified (doc 14 says on the Express line) |
| "left Express" | "left Express, centre Local, right Shuttle" | Express is the outer portal; when the layout mirrors the hole it is on the right | — | cosmetic doc wording (keep Express outer, it is what puts it on the cup line) |
| Floor triangle | — | a small deck triangle outside the funnel rail | — | cosmetic (no ball reaches it; paint it or fill it) |

### 2 Grand Central Whispering Gallery

Matches: ellipse a 1.40, b 0.95 on the rail's inner face, c = 1.028; tee on focus A, cup on focus B; booth Ø0.40, 0.35 m overall, at the centre, blocking about ±12.4°; hard lacquered hardboard face, no EVA (M7); one flat level at BASE (G1/G2: doc 14's +75 deck); Ø1.0 m clock at 11:59 on a braced post behind B, top 2.3 m; neon "MEET ME UNDER THE CLOCK"; sign line on a lectern. Nothing more than 0.95 m from the rail.

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| Booth height | "Ø0.40 m, 0.35 m high, ... cone top with four clock faces" | 0.35 m overall (drum 0.22 + cone) | reading | cosmetic |
| Clock facing | "Its clock faces hole 1's 2027" | single face toward hole 2's tee | layout | should-fix for the layout (check in v4 that the face also reads from hole 1) |
| Hole name | review S11: "Grand Central" is a licensed name, low risk | the layout record's name | — | team decision (not the builder's) |
| Clock post footprint | 30 kg braced post | 0.22 m behind the rail, braces run sideways to v ±0.55 | — | build-guide check (cosmetic in the model) |

### 1 Times Square

Matches: lane 1.0 m; adult tee 0.8 m of flat before the ramp foot (tee u -2.2); ramp 1:6 × 1.2 m to +200 with R 600; 0.3 m crest tilted 3° and narrowing to 0.80 m; board 0.80 × 0.80 at 12°; 116 Ø10 pegs, 45 mm proud, 71 × 62 mm pitch, 11 rows; 4 mm cover 55 mm up; five 130 mm slots, dividers 150 mm onto the tray; open carpet tray, rails 100 mm, open lip on the walkway side (flips with `tside`); junior tee at the foot; tower 2.8 m with 2027 neon and mirror ball, 60 kg+ plinth; two billboards 2.4 × 1.4 m to 2.0 m with invented brands, one reading 11:59; "DROP THE BALL". Speeds 2.06 / 2.29 m/s (doc 14 2.06 / 2.3).

| Item | Doc 14 | Built | Diff | Severity |
|---|---|---|---|---|
| Board end and tray drop | "slot end only about 35 mm off the floor ... about 25 mm drop" | with the 3° crest tilt the board ends at +18; tray at lane level, drop 18 mm | -7 mm | doc (within ±10 mm). On the factory deck the tray could sit 7 mm below the lane to keep 25 mm, if wanted |
| Wall teeth | "wall teeth keep every gap at 61 mm" | on the 11-peg rows the outer pegs are 40 mm from the wall (less than a ball), so the tooth closes that gap; 10-peg rows keep 61 mm | — | cosmetic (every gap is 61 mm or closed: that is the robust version) |
| Box length | 6.2 m | 5.38 m used; 0.82 m free behind the tower | -0.82 m | should-fix (team / layout): shorten the box to about 5.4 m or say what the 0.82 m is for |
| Tee position | frame table "about [-2.6, 0]" | -2.2 (0.8 m flat, as doc 14) | 0.4 m | justified |

## Rules

- **G1** (BASE): all ten correct. Only hole 9's oven gutter goes below BASE (by design; needs the raised deck).
- **G2**: hole 4 green and crossing flat, cup 0.5 m past the old crest; hole 5 lawn and bevel gone. Every gameplay slope kept (10 terraces, 9 crust, 8 kerb, 7 hill, 6 shore and corner, 3 ramp, platform, lead-ins, loop plane and exit bevels, 1 ramp and tilted crest).
- **G3**: cap 100 mm over the local surface everywhere, 45 mm body, rails stepped (10) and sloped (9, 8, 7, 6, 3, 1); hard faces on hole 2's ellipse and hole 5's curves. Exception: hole 6's corner (shelf above the rail line, above).
- **G4**: cups at the right spots and heights through `addCup`. Note for the integrator: `addCup` draws a 108 mm black disc and a white Ø160 collar 2 mm **above** the surface; doc 13 §5.3 says flush to 1–3 mm below, never proud, and 60–68 mm deep. In a render the 2 mm is invisible, but a white ring can read to a factory as a raised flange: should-fix (draw the collar flush, or as a thin dark rim, and give the cup a visible 64 mm sleeve wall).
- **G5**: within tolerance except the doc problems listed (holes 5, 6, 7, 8, 3, 1).
- **G6**: every hole has its neon pun sign and its 11:59 (10 window clock, 9 menu "WHOLE PIE 11.59", 8 "Open till 11:59", 7 lamp clock, 6 tablet XI:LIX, 5 park clock, 4 cab meter, 3 platform clock, 2 big clock, 1 billboard).
- **Robustness**: every miss falls back by design; no loose props (cabs screwed, bottles and fries fixed, signs on posts). Places a ball could leave the hole or stop out of reach: hole 6's shelf (above); hole 10's open tee end (a ball can drop behind the raised landing, in reach). Hole 9's pocket is 124 mm deep and 120 × 250 mm: hand-reachable.
- **Trademarks**: invented subway symbols (star, ring, diamond), unbranded cabs ("CAB 1159") and cart, invented billboard brands (Fizzleton Soda, Moonbeam Noodles, Glowpop Gum, Pretzeltron), Liberty from the 1886 statue, no "Times Square Ball" anywhere. The integrator's `base-v2.html` already replaces the totem's round bullet with a rounded square (doc 13 §5.8). Still round: the side-panel hole picker buttons (`.bullets button { border-radius: 50% }`), which appear in any screenshot taken with the UI on: should-fix (rounded squares to match the totem). "Stand Clear of the Closing Doors" and "Grand Central" are doc 14's S11 flags (team decision).
- **Text**: no mesh uses a negative scale in any builder; signs are placed by `K.s * v` and rotated; hole 7's two-faced sign is rotated π; hole 8's ferry blade has the correct arrow on each face. Mirrored text check: see `review-visual.md`.

## Doc 14 problems found (for the team)

1. Hole 5: legs 1.8 / 1.2 / 2.2 + 0.9 path + R 0.9 do not fit a 4.8 × 2.8 Z under any reading (centre-line: 4.15 × 2.25; straight parts: 5.05 × 3.15).
2. Hole 6: the conical corner as specified still has a full-height upstream cheek across 0.4 m of the 0.9 m harbour; "R 1.0" and the face angle are undefined; leg lengths are clear, so the box is 4.55 m.
3. Hole 3: a 60 mm lid over the 5° plane blocks every portal; 3 × 18 mm walls can't carry a 60 mm lid; clear widths leave no room for rails (2.55 m); the funnel is not defined.
4. Hole 7: "12° with R 600, about 0.95 m" is impossible for a 150 mm rise (0.83 m); the 1.80 m/s figure uses 0.95 m.
5. Hole 8: ace 2.2–2.4 m/s is design B's 3.5 m geometry; in the 5.2 m box it is about 2.5 m/s; "kerb at 2.7 m" is ambiguous.
6. Hole 1: "slot end about 35 mm" ignores the 3° crest tilt (+18 mm), so a 25 mm tray drop would put the tray 7 mm below the lane; the 6.2 m box has 0.8 m spare.
7. Hole 9: 5.0 m box vs 5.13 m of elements; the gutter only fits a raised deck; gutter finish must be hard.
8. Hole 5's five 18 mm arcs give a 90 mm rail, against the 100 mm cap of G3.

## Must-fix table (exact code changes)

| # | Hole | Problem | Fix (file, place, change) |
|---|---|---|---|
| MF1 | 6 | The banked corner's upstream cheek (vertical, 0 to 400 mm high, across the outer 0.40 m of the harbour at u = 1.20) faces every putt along the outer 45% of leg A: the M4 cheek strike doc 14 says the conical corner cures | **Team decision first** (doc 14 says "cheeks closed to the rails"; the 5 Dec full-width rig must include the run-in). Then in `holes/h6.js`, section "the conical banked corner", add a run-in surface before the cone: `const LRI = 0.8, NRI = 12;` and a second `grid(NRI, prof.length - 1, (i, j) => { const t = 1 - i / NRI; return [CU - LRI * i / NRI, BASE + t * prof[j][1], VA + t * (1.0 - prof[j][0])]; }, (i, j) => [1 - i / NRI, arcL[j] / arcL[arcL.length - 1]], (i, j) => [0, prof[j][3], -s * prof[j][2]], waveMat);` (i = 0 is the full profile at u = CU, so `grid`'s winding test runs on a non-degenerate cell; i = NRI collapses onto the rail line at the floor) (the profile shrinks toward the outer rail line, so the face rises out of the floor at about 27° to the rail and no face points back down leg A); close its back to the rail with `polyBox([[CU - LRI, VA], [CU, VA], [CU, VA + 1.0 - RTOP]], u => BASE + WH * (u - (CU - LRI)) / LRI, foamMat, { edge: { 0: backMat, 1: null, 2: null } })` (the triangle's third edge is exactly the curl-top line of the run-in, and its top rises linearly with it); drop the upstream cheek triangle in the `for (const [ph, out] of ...)` loop (keep only `ph = 0`). Add `['Run-in', '0.8 m tapered bank along the outer rail before the corner (rig to confirm)']` to `sizes`. Re-run `dump.py` (u extent unchanged; nothing new outside the box) |

Every other finding is should-fix, cosmetic or a doc 14 question; the code matches doc 14 wherever doc 14 is self-consistent.

### Suggested code for the main should-fixes

| Hole / file | Change |
|---|---|
| 6 `holes/h6.js`, "rails" | Raise the outer rails round the corner to the wave top: in `run`, replace the tail `[UC, SH0, BASE], [UC, VA, BASE]` with `[UC, SH0, BASE], [UC, CV, BASE], [UC, CV, BASE + WH - 0.05], [UC, VA, BASE + WH - 0.05], [CU, VA, BASE + WH - 0.05], [CU, VA, BASE]` (cap at +450 over the closed back; with MF1 make the last step a slope from `CU - LRI` to `CU`) |
| 8 `holes/h8.js`, "fries" | Move the carton out of the lane: `fv = -(HW + 0.076 + 0.09)` and stand it on the floor (`ST + 0.1` → `0.1`, `ST + 0.17` → `0.17`), or put it on the counter beside the display dog |
| 8 `holes/h8.js`, "far end" | Lift the pun sign clear of the cart and umbrella as seen from the tee: posts `box(0.04, 2.06, 0.04, ..., 1.03, ...)` and `boardSign(..., 2.49, 0, 1.2, 0.42, 1.6, false)` |
| tool `assemble.py` HOOK (integrator) | In the `iso` branch add `layers.flats = false;` before `applyLayers()`; under `ui=0` hide the selection label (`selLabel`) so it does not cover signs in renders |
| page `addCup` (integrator) | Draw the collar flush and dark (or drop it) and add a 64 mm open cylinder below the disc, so renders show a flush 108 mm cup, not a white flange |
| page CSS (integrator) | `.bullets button { border-radius: 10px }` so the hole picker matches the rounded-square totem badge |

## Counts and limits

- Must-fix: 1 (MF1). Should-fix: 11 here (fries in hole 8's lane; hole 6's corner block above the rails; hole 6's downstream drop; hole 8's kerb wording; hole 9's gutter finish; hole 3's funnel; hole 6's statue height; hole 2's clock facing; hole 1's box length; the cup collar; the round picker buttons), plus 3 visual ones in `review-visual.md`. Cosmetic: about 19 here and 7 visual. Doc 14 problems: the 8 above.
- Not fully checkable in a static model: rebounds and ball paths (hole 2's focus-to-focus accuracy, hole 6's ride round the cone, hole 1's peg gaps were checked from the code, not measured), so speeds are checked by doc 14's formula only. The page's cup is a disc (no 64 mm sleeve). `dump.py` misplaces instanced parts. Hole 7's hung pun sign could not be seen in any render (the selection label covers it); the code places it at 2.10–2.40 m.
