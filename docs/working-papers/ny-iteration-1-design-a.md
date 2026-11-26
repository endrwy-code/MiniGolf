# New York iteration 1, design A (Kulnari-max): working paper (27 Nov)

**Status:** one of the two independent designs that `../14-new-york-iteration-1.md` was built from. Brief for this designer: push the Kulnari ideas as far as party pace allows. It has **not** been through the adversarial review, so it still contains the errors the review found (see `ny-iteration-1-review.md`; for example hole geometry and physics that did not add up). Doc 14 wins wherever they differ. Hole numbers here are this designer's, and may differ from doc 14's.

## Concept

"New York Countdown: Kulnari energy, party pace." Ten holes, ten mechanics, two 5-hole "rooms" off the Tee Booth. DOWNTOWN (10 to 6) is "The Block and the Harbour": a Brooklyn brownstone street that runs to a hot-dog corner, then back along the waterfront under the Brooklyn Bridge to Liberty. MIDTOWN (5 to 1) is "Park to Times Square": Central Park, Fifth Avenue traffic, a subway dive, Grand Central's whispering gallery, then the countdown billboard. Each district opens with a teaching hole and ends on a spectacle next to the hub, and the two "weenies" (Liberty's torch and the Times Square tower) can be seen from the hub and from the party floor.
The user's favourite gimmicks, one per hole: terraces of mismatched heights (10 Stoops), a curling target (9 Pizza), trick tubes that go in left and come out right (8 Hot Dog Cart, under a clear counter), a two-sided rally hill (7 Brooklyn Bridge), a quarter-pipe wave (6 Liberty), curves that guide the ball round direction changes (5 Central Park), a chance field of bumpers (4 Gridlock, kept from the current hole 7), a vanish-and-reappear tunnel whose exit faces the queue (3 Subway), an elliptical whispering-gallery bank where every bounce finds the cup (2 Grand Central), and a plinko billboard finale (1 Times Square).
Cups sit inside the props: a cellar hatch, a pepperoni, a mustard squiggle, the bridge plaque, Liberty's star fort, a fountain basin, a manhole and the clock's focus. Every cup is flush, sleeved in 110 mm PVC (about 104 mm inside) and about 64 mm deep with a soft bottom.
There are no motors in play. The only moving part on the course is the optional 12 V mirror-ball spinner on hole 1. Every miss rolls back, drains back or ends within putter reach. Hole 1 no longer keeps the ball: all slots drain to a tray, which solves the conflict with the hub handing balls out.
Estimated pace is 1.7 to 2.5 min per group of 4. Everything uses the route C standard: 45 x 95 ribbed rail with a white cap at least 85 mm above the surface, hidden plates, carpet grass, a D75 deck module (18 mm ply on a 45 x 45 frame plus 10 mm surface, about 73 to 75 mm) wherever a cup or a level is needed, flat cut-out props on weighted bases, a pun sign and totem per hole, and 24 V LED in each hole's colour. All numbers are estimates or design targets until the prototype on Fri 4 Dec.

## Course flow and rooms

LAYOUT (proposal, about ±0.5 m; same loops as v3, so the routes don't cross and every check passes on paper; to rerun in tools/make_layout_nyc.py).
DOWNTOWN, top side, z 1.6 to 9.9, played anticlockwise:
- Hub, then 10 Stoops at x 23.0 to 28.6, z 7.9 to 9.4, playing -x.
- 9 Pizza at x 15.9 to 21.0, z 7.6 to 9.5, playing -x.
- 8 Hot Dog Cart at the far end, x 12.6 to 14.4, z 2.2 to 7.4, playing -z.
- 7 Brooklyn Bridge along the top wall, x 15.8 to 21.2, z 2.0 to 3.6, two-ended.
- 6 Liberty (L shape) at x 22.6 to 27.6, z 1.8 to 5.4, ending 2.4 m from the hub.
- The spine walkway between the rows is at least 2.2 m wide. Tightest gaps: 8 to 7 and 8 to 9 at about 1.4 to 1.5 m.
MIDTOWN, bottom side:
- Hub, then 5 Central Park (Z shape) at x 22.4 to 27.2, z 16.2 to 19.0, playing -x.
- 4 Gridlock at x 15.0 to 20.0, z 16.4 to 18.4.
- 3 Subway (U) at the far end, x 12.8 to 17.8, z 20.6 to 23.0.
- 2 Grand Central at x 24.0 to 27.4, z 20.9 to 23.0, playing +x.
- 1 Times Square along the golf limit, x 30.0 to 32.2, z 17.4 to 23.6, playing -z toward the hub. It sits 2.7 m clear of the hub and 0.8 m inside the limit.
- The walkway between the rows is about 1.4 m.
Total bounding area is about 112 m² (v3 was 102). Footprints are listed per hole.

HOW THE HOLES BLEND (they never intersect, they share scenery):
- Holes 10 and 9 share one 4.8 x 2.4 m brownstone façade flat on the runway side (z ≈ 9.6 to 9.9). Its stoop end is hole 10 and its ground-floor pizzeria is hole 9, so it reads as one street. It also acts as the district's wall against the runway.
- The hot-dog cart's umbrella (8) sits at the street corner and can be seen down the whole row.
- The bridge towers (7) point at Liberty (6). Liberty's blue harbour carpet starts where the bridge's roadway ends.
- One harbour-skyline run of flats on the top wall (4 sheets) backs both 7 and 6, so every tee on that row looks at water and towers.
- Midtown: two borrowed Christmas trees and the park's bike-wheel fence (5) face Gridlock's "Fifth Avenue" (4) across a 600 mm park-wall cut-out laid outside the rails. The subway kiosk (3) stands on Gridlock's sidewalk.
- Grand Central's teal star-field flats (2) on the bottom wall glow amber into Times Square's magenta (1).
- Shared language everywhere: the same charcoal ribbed rail and white cap, zebra crossings and route arrows on floor-safe tape, green street-blade totems, and one font.

ROOMS IN A BIG HALL:
1. Light pools. The house wash comes down to a dim warm level of about 50 to 100 lux on walkways. Each green gets its own pool, at least 200 lux on the playing surface (design target, measured with a phone at the dry run), from a 24 V 10 to 20 W LED flood on the totem post aimed down the lane, plus the colour strip at the rail base. Darkness becomes the wall between holes, but nothing is Kulnari-dark: every sign must be readable in 3 s.
2. A backdrop flat faces every tee, so players see their own hole rather than the hall: the brownstone façade, the harbour skyline, the cart front, the tile wall, the star field and the billboards.
3. Local "ceilings" from string lights, all at least 2.1 m up and never over a walkway: bridge-cable festoons between the towers (7), fairy lights in the park trees (5) and marquee bulbs on the Times Square tower (1).
4. Each district has its own floor and a portal. Downtown walkways are charcoal "asphalt" with zebra crossings, entered through a brownstone-stoop portal arch at the hub. Midtown is light-grey "sidewalk" tape, entered under a park-gate portal.
5. Optional low sound from a battery Bluetooth speaker per district: harbour gulls and boat horns Downtown, traffic and a subway chime in Midtown.
6. Hide and reveal: the subway exit, the plinko rattle and the Liberty wave all face the waiting queue.
7. Big-room advantages are kept: both weenies (the torch at 2.6 m and the tower at 2.8 m) are visible from the hub, the party floor sees hole 1's billboards, and marshals at the hub can see both queues.

ORDER AND OPS:
- The host sends a group to either district. They play 5 holes back to the hub and then the other district.
- At peak, sell one-district rounds.
- 5-stroke cap. One shot each at hole 9.
- Hole 7 plays in two simultaneous pairs.
- The hub hands out colour-coded balls, and every hole returns them.

## Holes

### 10 Brownstone Stoops (Downtown)

**Sign:** Stoop to Conquer

**Ny icon:** Brooklyn brownstone stoops, iron railings and a fire escape

**Kulnari lesson:** K12 Rice Terraces (step-down framed ply boxes: quick, readable, skill without luck), plus the user's 'slopes of different heights that don't match': the drops are deliberately unequal, the terraces are staggered sideways like neighbouring stoops that never line up, and one stoop sags.

**Plays:** Players stand on the floor at the top of the stoop and putt along a +255 mm landing. The ball runs off a 90 mm drop, a 30 mm drop and a 60 mm drop, with the lane jogging left and then right at each one, and comes onto a long cup green at +75 mm. The cup sits in a painted iron cellar-hatch ring. A soft putt stalls on a terrace (that is the skill) and is played on from where it stops. Ace line: a firm, straight putt down the centre.

**Gimmick mechanics:**

Lane is 0.95 m inside. Four terraces:
- T1 tee landing: +255 mm, 1.1 m long.
- T2: +165 mm, 1.2 m long, offset 150 mm toward the façade, with a 1.5° cross-fall toward the façade ('the sagging stoop'). A 1.5° fall gives about 0.18 m/s² against about 0.6 m/s² carpet drag, so it bends a dying putt but a ball can rest on it.
- T3: +135 mm, 1.0 m long, offset back 150 mm.
- T4 green: +75 mm, 1.9 m long. Cup 1.3 m past the last lip and 0.25 m off centre.
Drops are 90, 30 and 60 mm. Lips have a 20 mm round-over and PVC angle nosing. At 1.0 m/s a ball leaving the 90 mm drop is airborne about 0.14 s and lands about 0.14 m out, which is fine on carpet.
Minimum putt to reach the first lip: about 1.15 m/s. Ace putt: about 2.3 to 2.5 m/s (5.0 m path, a ≈ 0.6 m/s², with some speed gained from the drops).
Rails: 45 x 95 fixed to the box sides, top at least 85 mm above each terrace, stepped with the terraces. Inside corners at the jogs filled with 100 x 100 blocks. Junior tee at the start of T2.

**Shape and footprint:** Straight with two 150 mm jogs. 5.4 x 1.05 m playing area; bounding 5.6 x 1.5 m including the jogs and rails. The façade flat 0.4 m behind the side is shared with hole 9.

**Direction changes:** 0

**Par:** 2

**Est minutes per group:** 2.0 min. 4 players x about 2.3 strokes = 9 strokes at about 10 s each = 1.5 min, plus about 30 s walking down the side and picking up. Nothing to read.

**Skill vs luck:** About 85% skill (weight control at each drop), 15% luck (bounce after a drop, the sag).

**Fallback for miss:** A short ball rests on a terrace, never more than 0.5 m from a rail, and is putted on from outside the rail. A long ball hits the green's back rail (filled corners) and stays on T4. Nothing can roll back up, and no marshal is needed.

**Build:**

Four ply boxes: 45 x 45 frames ripped to height (237, 147, 117 and 57 mm under the top), 18 mm ply tops (about 5.2 m², 2 sheets), 9 mm ply side skins. Cup sleeve in T4. Rails screwed to the box sides; PVC angle nosings.
Carpenter: 1.0 day.
Volunteers (about 2 days): paint risers and sides as brownstone with stone nosings; cut black iron stoop-railing silhouettes from 9 mm ply and screw them outside the rails; paint the 4.8 x 2.4 m façade flat (4 sheets of 9 mm on a frame, shared with 9) with lit windows (battery fairy lights behind cut-outs) and a fire-escape silhouette; paint the cellar-hatch ring around the cup; fit the green LED.

**Risks:** Lip chipping (fit the nosings, keep spare paint); players stepping onto terraces (sign 'play from outside the rail'; the boxes are built to take a step anyway); the sag reading as a build error (paint a crack and the 'sagging stoop' gag on the sign); trip at the box ends (chamfer them, add glow tape).

**Blends with:** Shares the brownstone façade with 9, so the stoop runs down into the pizzeria street. Green street-tree glow. A zebra crossing from the hub leads to the tee.

**Vs current:** REPLACE Bike Lane. It was a simple slalom with little New York identity and a tight 262 mm wheel gap. The stoops deliver the user's terraces (K12, 'low-cost high-value') for about the same carpentry, and the bike wheels move to Central Park (5) as found-object fencing.

### 9 Brooklyn Pizza (Downtown)

**Sign:** Pizza the Action

**Ny icon:** New York pizza: a giant pie, a slice sign, the oven glow

**Kulnari lesson:** K08 Persian Rug Six-Cup (multi-target scoring in a tray lane) as the user's curling-type target game. The cup is built into the prop as the centre pepperoni.

**Plays:**

One shot each, curling style. Each player slides the ball down a 3 m lane onto a 1.6 m pizza. Score by where it stops:
- In the centre pepperoni cup = 1.
- Inside the pepperoni ring = 2.
- Anywhere on the pizza = 3.
- Off the pizza = 4.
Balls stay where they stop until all four have putted, so later players can knock others off or in. Then everyone picks up.

**Gimmick mechanics:**

The whole hole is on a D75 deck so the house is level to ±2 mm (shimmed).
- Lane: 3.0 m x 0.95 m of carpet grass, flaring through 45° walls over 0.45 m to a 1.75 m wide house.
- Pizza: Ø 1.6 m of inlaid needle-punch (yellow cheese, eight Ø150 red pepperoni discs, a tan crust ring). The centre pepperoni is the flush cup. The scoring ring has radius 0.30 m.
- Crust line: a radiused hump 12 mm high and 200 mm wide under the carpet at the pizza's front edge. A ball needs about 0.41 m/s to cross it (step formula), so dead-weight balls stop short and score 4.
- Backstop: 0.3 m behind the pizza, an 8-segment rail faced with 25 mm EVA foam to kill overpowered balls.
- Speed: about 2.05 m/s from the adult tee (3.8 m to centre at a ≈ 0.55 m/s²). The 2-point ring is about ±4% of speed, which is real skill. A ball dying across the cup at under 1.2 m/s drops.
- Junior tee 1.8 m from the crust, 2.6 m to centre.

**Shape and footprint:** Keyhole: lane plus disc. 5.1 x 1.9 m bounding.

**Direction changes:** 0

**Par:** 3

**Est minutes per group:** 1.7 min. 4 single shots x about 12 s = 50 s, plus about 20 s scoring, about 15 s pick-up and 15 s walking. It is the fastest Downtown hole and absorbs bunching.

**Skill vs luck:** About 75% skill (pure weight), 25% luck (knock-ons and kisses off other balls).

**Fallback for miss:** Short balls stop on the lane (score 4, no replay). Long balls are stopped by the foam backstop. Every ball is within about 0.9 m of a rail, so players reach in or step onto the deck to pick up. No retries, so there is nothing to clear.

**Build:**

Deck: about 8.5 m², 3 sheets of 18 mm ply on a 45 x 45 frame. Crust hump from a sanded 12 mm ply strip; segmented foam backstop; cup sleeve.
Carpenter: 0.75 day.
Volunteers (about 1.5 days): cut and glue the needle-punch inlay from templates; paint a 1.2 m slice cut-out sign and the pizzeria shopfront on the shared façade; fit the orange 'oven' LED.

**Risks:** Inlaid needle-punch may run faster than carpet grass (test at the prototype; the fallback is to paint on carpet grass with flexible fabric paint); scoring disputes (rule: the ball's centre decides, the youngest player calls it); kids ignoring the one-shot rule (say it on the totem: '1 SHOT · CURLING').

**Blends with:** It is the ground floor of the brownstone row shared with 10. Its orange glow faces the hot-dog corner (8), and the slice sign can be seen from the hub.

**Vs current:** REPLACE Hot Dog Cart in this slot (the cart moves to 8 and gains the trick tubes). It adds the curling game the user asked for, the pizza the user wants kept, and a 1-shot hole that clears groups fast.

### 8 Hot Dog Cart (Downtown)

**Sign:** Relish the Moment

**Ny icon:** Hot dog cart with umbrella; ketchup, mustard and relish bottles

**Kulnari lesson:** The user's 'tubes that lead somewhere unexpected (left in, right out)', plus K05 (funnel lead-in into a themed box, mouth edges faced against wear), K01 (vanish into a prop) and ref 07 (an oversized everyday object with a pun sign). It follows K01's lesson that players should see the payoff: the crossing is visible under clear glass.

**Plays:** Players pick a sauce: three mouths in the cart front, Ketchup (left), Mustard (centre) and Relish (right). The ball rolls under the cart counter and players watch it criss-cross under the glass. Left comes out right, right comes out left, and sometimes the junction kicks it into the centre ('special sauce'). It exits onto the green, and players walk round and putt out. The cup lines up with the LEFT exit, so the mouth that looks right is wrong. The group ahead teaches the queue.

**Gimmick mechanics:**

Tee deck: +150 mm (stacked frame), 2.0 m x 0.95 m.
Cart box: 1.4 m long x 1.2 m wide.
- Three channels 110 mm wide (2.6 ball diameters) with 18 mm ply walls 60 mm high on a sealed, painted 12 mm ply floor.
- The floor falls 75 mm over 1.4 m, which is 3.1°. That gives about 0.38 m/s² down-slope against an estimated 0.1 to 0.2 m/s² drag on painted ply, so a ball cannot stall.
- Mouths at -350, 0 and +350 mm, flared to 160 mm with 45° jambs faced in PVC angle.
- The diagonals cross 0.7 m sideways over 1.4 m (26.6°). All three meet in a 300 mm open junction where the walls stop 150 mm short of centre. Balls keep their line through it an estimated 70 to 85% of the time.
- Lid: the rear 0.8 m is 4 mm clear polycarbonate, the front 0.6 m an opaque counter. Both lift off on dowels and are held by 2 turn-buttons. No run is longer than 1.4 m, so every channel can be pushed through with a putter.
- Rubber-faced bumper between the mouths.
Green: D75, +75 mm, 2.0 x 1.8 m. Exits are flush.
- Exit speeds about 1.2 to 1.9 m/s (entry 0.8 to 1.5 m/s plus the 75 mm drop).
- Cup 1.1 m from the exit face on the left exit's line. Back rail 0.9 m beyond the cup, corners filled.
Junior tee 0.8 m from the mouths.

**Shape and footprint:** Straight: tee deck, then cart box, then green. 5.2 x 1.8 m bounding. Umbrella and sign above the cart box only.

**Direction changes:** 1

**Par:** 2

**Est minutes per group:** 2.2 min. About 2.2 strokes each = 9 strokes x 10 s = 1.5 min, plus about 40 s for the walk-round and watching the crossing.

**Skill vs luck:** About 50/50: choosing the mouth and the weight is skill, the junction kick is luck (it evens up kids and adults).

**Fallback for miss:** A ball that misses a mouth bounces off the bumper and stays on the flat tee deck within reach, and is putted again. A ball inside a channel always rolls out (3.1° fall). In a freak jam, lift the lid. Green misses rest against filled corners.

**Build:**

Two deck levels, the channel box with junction, two-part lid (about 1.1 m² polycarbonate), cart front cut-out (1.8 m, 9 mm ply double-skin on the box), beach umbrella clamped to a post screwed to the box, 1 m 'sausage in a bun' from rail timber on top as the sign holder.
Carpenter: 1.25 days.
Volunteers (about 1.5 days): paint the cart, sauce bottles round the mouths and painted sausages on the channel floor under the glass; mustard-squiggle ring round the cup; red ketchup LED.

**Risks:** The junction sorting poorly (bench-test in week 1; if under 60% true, fall back to three plain diagonals with a 15 mm ply crossover saddle, losing the centre-kick drama); scratches and the fire certificate on the polycarbonate; kids lifting the lid (turn-buttons need a coin); mouth wear (PVC angle).

**Blends with:** The street corner of the brownstone block: its umbrella can be seen from 10 and 9, and its red glow sits beside the bridge's yellow (7).

**Vs current:** REPLACE Big Apple (a single-gate funnel with a flat apple and one obvious line). The trick tubes are the user's favourite unbuilt idea, and the cart keeps the decided ref-07 style. The apple's worm-hole vanish idea lives on, done better, in the Subway (3).

### 7 Brooklyn Bridge (Downtown)

**Sign:** Meet You in the Middle

**Ny icon:** Brooklyn Bridge silhouette: two gothic-arch towers, cable lights, plank roadway

**Kulnari lesson:** The user's two-sided rally hill (from their visit; not in the footage), using research B4's volcano numbers. Cut-out towers make a 'room' from string-light cables, as K10 does with string lights.

**Plays:**

Pairs face each other from the Manhattan end and the Brooklyn end of a narrow bridge with a hump in the middle, and the cup sits on the top of the span. On '3-2-1' both putt at once.
- Too soft: the ball rolls back to your own feet.
- Too hard: it crosses the bridge to the other borough, and you play your next shot from over there.
- Balls clash near the top.
Then the second pair plays.

**Gimmick mechanics:**

Lane is 0.8 m inside, 5.0 m long, with D-shaped end rails (45° fills) that send returning balls to the tee centre.
Hill, centred: a 0.45 m plateau at +150 mm with the cup in the middle, 12° ramps each side (0.71 m straight) and R 600 mm transitions at the foot and crest, so each side is about 0.95 m long. Flat approaches are 1.3 m each side.
Speeds:
- To crest H = 150 mm takes at least 1.45 m/s at the foot plus ramp drag, so about 2.2 m/s from the tee.
- A ball cresting at under about 1.3 m/s stays on the plateau or drops in.
- Over about 1.5 m/s at the crest it runs over the top.
- Launch check: the ball leaves the crest only if v² > gR, which is v > 2.4 m/s at the crest (a smash). Rails 90 mm.
Catch ring: soft rubber cord 10 mm high, Ø190 mm (40 mm outside the cup edge), chamfered. A slow ball needs about 0.56 m/s to pass it, so slow balls are turned back toward the cup. The cup lip itself is flush.
Junior tees 0.6 m nearer the hill at each end.

**Shape and footprint:** Straight two-ended lane, 5.0 x 0.9 m. Bounding 5.4 x 1.6 m with the tower bases and end standing room.

**Direction changes:** 0

**Par:** 2

**Est minutes per group:** 1.8 min. Two simultaneous pairs x about 2.2 strokes = about 5 shot-rounds x 12 s = 1 min, plus 30 to 40 s for pair changeover and walking to the far end.

**Skill vs luck:** About 80% skill (weight up a hill), 20% luck (clashes and the crest kick). A head-to-head duel.

**Fallback for miss:** Every miss returns by gravity to one of the two flat ends: a weak ball rolls back, a strong ball crosses over. A ball resting on the plateau is reachable over the 0.8 m-wide rail. It never needs a marshal.

**Build:**

Hill: five 18 mm ply profile ribs at 200 mm centres, skin of 2 x 6 mm flexi-ply glued and screwed, 18 mm plateau with the cup sleeve; the rest floor-laid. Two tower portals of 9 mm ply double-skin on 45 x 95 posts screwed to the outside of the rails plus sandbags, clear opening 0.85 x 1.2 m. Warm-white festoon 'cables' tower to tower and tower to lane end, at least 2.1 m up and never over a walkway.
Carpenter: 1.0 day (hill 0.5, towers 0.5).
Volunteers (about 1 day): paint the plank roadway, lattice railing on the rails, stone towers; yellow lamp LED.

**Risks:** Smash shots (rule card: 'no backswing above the knee'); ball collisions upsetting kids (it's part of the fun; the junior tee helps); hill skin seams (sand flush to 1 mm or less); pairs not starting together (a painted '3-2-1' on the totem).

**Blends with:** The towers frame the view to Liberty (6). Its roadway's end meets Liberty's blue harbour carpet. It shares the harbour-skyline flats on the top wall. The cable festoons form the Downtown canopy.

**Vs current:** REPLACE Gridlock in this slot (Gridlock moves to Midtown 4, almost unchanged). It brings the user's rally hill and the Brooklyn Bridge icon, and running two players at once is the fastest pace format on the course.

### 6 Liberty Island (Downtown)

**Sign:** Make Waves

**Ny icon:** Statue of Liberty (own drawing from the original statue), harbour wave, star-fort pedestal

**Kulnari lesson:** K04 Gallery Quarter-Pipe (one big legible 'wow', speed decides where the ball comes down, the arrival watched from the other space), built with K04's own method of ply skin on ribs. A raised island stands in for K04's lower room.

**Plays:** Players putt along a 3.6 m blue harbour at a breaking wave set across the corner. The ball rides up the wave, curls round 90° and comes down toward Liberty Island. If it has enough pace it climbs the shore onto the island green and runs to the cup set in Liberty's star-shaped pedestal. Too soft and it slides back to the foot of the wave; too hard and it rides high and lands deep on the island.

**Gimmick mechanics:**

Leg A (harbour): 3.6 m x 0.9 m, floor-laid blue carpet.
Wave: set at 45° across the corner, face 1.3 m wide, transition radius 450 mm, height 450 mm, with a 60 mm curl lip at the top overhanging back toward the lane, and closed ends.
Physics:
- The normal component of the ball's speed (v/√2) rides up h = 0.7 x v_n² / g. A 2 m/s putt rides about 0.14 m; 3 m/s rides about 0.32 m. So 0.45 m plus the curl contains anything short of a smash.
- The tangential component carries the ball round about 90°, and faster balls land further across.
Leg B (Liberty Island): 2.2 x 1.4 m raised D75 green.
- Its 1:5 shore bevel (375 mm, 11.3°) starts 0.3 m from the wave foot. A ball needs about 1.1 m/s at the shore foot.
- Cup 1.2 m beyond the shore crest inside a painted 11-point star.
- Ace putt: about 2.6 to 3.0 m/s.
Junior tee 1.2 m nearer the wave.

**Shape and footprint:** L shape: leg A 3.6 x 1.1 m outer, wave corner 1.3 x 1.3 m, leg B 2.2 x 1.6 m. Bounding 5.0 x 3.6 m; actual area about 10 m². The statue stands on its own base behind the island.

**Direction changes:** 1

**Par:** 3

**Est minutes per group:** 2.5 min, the slowest hole. About 2.7 strokes each = 11 strokes x 11 s = 2.0 min, plus about 30 s walking the L and watching. If the dry run is over 2.6 min, move the tee 1 m closer.

**Skill vs luck:** About 70% skill (pace into the wave and up the shore), 30% luck (the line off the wave, which varies with speed).

**Fallback for miss:** Weak balls roll back off the shore or the wave to the flat corner at the wave foot, at most 0.6 m from a rail, and are putted again. The curl lip stops ride-outs. Island misses rest against the filled back corners. No marshal.

**Build:**

Wave: six 18 mm ply ribs (quarter circle R450 plus curl) at 250 mm centres, skin of 2 x 6 mm flexi-ply, curl nosing from 18 mm ply, joint to the floor surface sanded flush and taped. Island: D75 plus bevel and cup. Statue: 2.6 m double-skin 9 mm cut-out with a battery LED flame, on a 600 mm pedestal box with at least 30 kg ballast, braced, outside the back rail.
Carpenter: 1.5 days (wave 0.75, island and bevel 0.5, statue 0.25).
Volunteers (about 2 days): paint the wave white and teal with foam; verdigris statue drawn from the original 1886 statue (not the Las Vegas replica); star-fort ring; skyline flats.

**Risks:** Rebound line too random (prototype one rib with a 0.4 m skin in week 1 and tune the 45° angle by ±5°); a seam at the wave foot kicking balls (keep it to 1 mm or less); skin denting under putter strikes (two plies, painted); the slowest hole setting the pace (tee can move 1 m forward).

**Blends with:** The harbour continues from the bridge roadway (7). It shares the top-wall harbour skyline. The torch is the Downtown weenie, seen from the hub and the spine walkway, and its teal glow faces the hub.

**Vs current:** UPGRADE Liberty Island. The statue, colour and slot are kept, but the flat 0.6 m gangway, which in route C left misses lying in the harbour, is replaced by the user's quarter-pipe 'wow' with a self-returning shore. About +0.5 carpenter-days.

### 5 Central Park (Midtown)

**Sign:** Take the Scenic Route

**Ny icon:** Central Park: stone arch bridge, lamp posts, benches, bike-wheel railings, lit trees

**Kulnari lesson:** K03 Riveted Curve (a smooth curved bank turns the ball predictably; build it from 2 plies screwed to blocks every 200 mm and cap the free ends) plus the user's 'curves that guide the ball' and 'change direction to make a small space more interesting'. K10's string-light canopy makes a room.

**Plays:** A gentle teaching hole that opens Midtown. Players putt along a park path that zig-zags twice. Each corner's curved outer wall carries the ball round, so a good-paced ball swings left, passes under a stone arch, swings right and runs at the fountain cup on a slightly raised lawn. A perfect firm putt can go round both bends for an ace.

**Gimmick mechanics:**

Path is 0.9 m inside: leg 1 is 2.0 m, leg 2 is 1.4 m (perpendicular), leg 3 is 2.2 m. Centre-line path about 6.3 m.
Corners: outer rails curved at R 0.9 m (centre-line radius about 0.55 m); inner corners rounded R 0.15 m and filled. An estimated 10 to 20% of speed is scrubbed per 90° (to test).
Last 1.2 m is a raised D75 green with a 1:5 bevel (needs at least 1.1 m/s at the foot). Cup 0.6 m past the bevel crest inside a painted fountain basin ring, flush.
Arch portal over leg 2: clear opening 0.9 x 0.5 m.
Putts: ace about 2.8 m/s; typical first putt about 2 m/s to reach leg 3.
Junior tee at the start of leg 2.

**Shape and footprint:** Z shape: 4.8 x 2.8 m bounding, about 7 m² actual. The two trees stand outside the outer corners.

**Direction changes:** 2

**Par:** 3

**Est minutes per group:** 2.3 min. About 2.6 strokes each = 10.5 strokes x 10 s = 1.75 min, plus about 30 s walking the Z (the corners are reachable from outside).

**Skill vs luck:** About 85% skill (pace through the curves), 15% luck.

**Fallback for miss:** A soft ball stops on the path, never more than 0.45 m from a rail. A ball that doesn't climb the bevel rolls back onto the flat. A hard ball rides the curve (it can't hop a 90 mm rail on a curve) and hits the filled back corners.

**Build:**

Curved rails from 2 x 9 mm ply bent across the grain (minimum about 0.9 m) or flexi-ply, screwed to 45 x 45 blocks at 200 mm, faced with 3 mm EVA, free ends capped. White cap cut in segments from 9 mm ply. Floor-laid lane plus D75 green.
Carpenter: 0.75 day.
Volunteers (about 1 day): two borrowed Christmas trees with warm fairy lights (the canopy); bike wheels cable-tied to the outside of the rails as park railings; two bench and three lamp-post cut-outs; stone-arch cut-out; fountain ring; blue 'lake at night' LED.

**Risks:** The curve scrubbing more speed than expected (tune the radius at the bench test with a 1:1 hardboard curve); tree loans falling through (a festoon arch instead); bevel too steep for kids (the junior tee is beyond corner 1).

**Blends with:** Faces Gridlock across a 600 mm painted park-wall cut-out laid outside the rails. The trees and fairy lights form Midtown's soft 'park room' right at the hub; the wheels echo the old Bike Lane.

**Vs current:** REPLACE The Subway in this slot (the subway moves to 3, upgraded into the vanish). Midtown now opens with a friendly hole that teaches pace, and delivers the user's curves and direction changes.

### 4 Gridlock (Midtown)

**Sign:** Don't Honk. Just Putt.

**Ny icon:** Yellow cabs (unbranded, invented roof sign 'CAB 2027'), crosswalk, manhole cover

**Kulnari lesson:** K13 Farmyard Block Green (scattered blocks, cheap pinball chaos), done properly as K13's lesson asks: blocks screwed from below, real rails, every gap closed or at least 0.25 m.

**Plays:** A chaos field on 'Fifth Avenue'. Players putt through a jam of eight cabs. There are two readable 'avenues' through the jam for the bold, and two angled cabs near the end act as a slingshot bank toward the manhole-cover cup on a raised crosswalk green. Bad shots ricochet unpredictably, and that is the fun.

**Gimmick mechanics:**

Lane: 5.0 x 1.8 m of floor-laid charcoal needle-punch ('asphalt').
Cabs: eight blocks 360 x 170 x 140 mm. Two staggered cross rows of 3 cabs leave two clear lengthwise avenues about 0.30 to 0.35 m wide, plus two cabs at 30° near the green making a bank. Every gap is at least 0.27 m or closed to the rail. Inside corners filled.
Green: the last 1.3 m is D75 with a 1:5 bevel painted as a zebra crossing. Cup 0.5 m past the crest in a painted manhole ring.
Battery LED cab roof lights are a bonus. Junior tee 1.5 m in.

**Shape and footprint:** Straight, 5.0 x 1.8 m (as current).

**Direction changes:** 0

**Par:** 3

**Est minutes per group:** 2.3 min. About 2.8 strokes each = 11 strokes x 10 s = 1.8 min, plus 30 s.

**Skill vs luck:** About 40% skill, 60% luck: Midtown's equaliser between kids and adults.

**Fallback for miss:** Every resting spot is at least 0.27 m from the nearest cab and within 0.9 m of a rail. A ball that doesn't climb the bevel rolls back to the flat.

**Build:**

As in the current pack: cab blocks from painted offcuts screwed through the needle-punch into hardboard plates, laid out with a jig; D75 green.
Carpenter: 0.25 day.
Volunteers (about 1 day): fix and paint the cabs (yellow, chequer stripe, no TLC marks), crosswalk, manhole ring, cones painted onto the rails (no loose cones); LED.

**Risks:** Low: already specified. Watch for luck fatigue next to the plinko (that's why the subway and Grand Central between them are skill holes).

**Blends with:** The street between the park (5) and the subway entrance (3): the subway kiosk stands on its sidewalk. Its purple and yellow neon reads as the start of the Times Square glow.

**Vs current:** KEEP and lightly UPGRADE the current hole 7 Gridlock, moved to slot 4 (it replaces Broadway). Upgrades: two readable avenues, an angled-cab bank and a manhole cup. It is the cheapest proven hole, and it frees carpenter days for the new heroes.

### 3 The Subway (Midtown)

**Sign:** Stand Clear of the Closing Doors

**Ny icon:** Generic subway entrance kiosk with green globe lamps, white tile platform, invented '2027' line diamond (no MTA bullets)

**Kulnari lesson:** K01 Furnace Room's vanish-and-reappear, applied as its own lesson says: 'a subway-entrance box could drop the ball onto a lower platform lane', with the exit placed where the waiting group can see it. Plus K05 (a funnel lead-in into a box mouth, faced against wear).

**Plays:** Players putt along the raised 'street' into the subway entrance. The ball vanishes down the stairs. A second later it shoots out of a tunnel mouth in the tiled platform wall on the other side of a divider, running back toward the tee end, where the queue is standing. Players walk round to the platform and putt out. Some first putts roll right up to the cup and drop.

**Gimmick mechanics:**

Street: 2.4 m x 0.95 m on a +225 mm deck (ripped 197 mm frame plus 18 mm top plus surface).
- Funnel walls narrow from 0.95 m to a 160 mm mouth over 0.4 m (painted as the entrance railings). Mouth jambs faced in PVC angle.
U-chute inside a 1.0 x 2.4 m box:
- 110 mm wide sealed ply channel falling 150 mm (+225 to +75) over a 1.9 m path, about 4.5°. That gives about 0.55 m/s² down-slope against about 0.15 drag, so it never stalls.
- 180° turn at centre-line radius 0.6 m; straights no longer than 1.5 m.
- Opaque lift-off lid in two halves with finger holes and turn-buttons.
Platform: 3.0 m x 0.95 m on D75 at +75 mm.
- Exit portal is a 200 x 150 mm arch.
- Exit speed about 1.4 to 1.7 m/s. Cup 1.8 m from the portal at the tee end, so an on-line ball arrives at about 0.6 m/s, inside the capture window.
Divider: a 1.2 m tile-wall flat between the lanes hides the platform from the street.
Junior tee 0.8 m from the funnel.

**Shape and footprint:** U shape: two parallel lanes plus the end box. 5.0 x 2.4 m bounding.

**Direction changes:** 2

**Par:** 2

**Est minutes per group:** 2.2 min. About 2.1 strokes each = 8.5 strokes x 11 s = 1.6 min, plus about 35 s for the walk round the U and watching the reveal.

**Skill vs luck:** About 55% skill (getting into the mouth; the putt-out), 45% luck (where it comes out).

**Fallback for miss:** Balls that miss the mouth stop on the flat street, within 0.5 m of a rail, and are putted again. A ball in the chute always comes out (4.5° fall); in a freak case, lift the lid. Platform misses rest against filled corners.

**Build:**

Street deck, chute box (ply channel walls on ribs), platform D75, divider flat, kiosk cut-out (1.6 m) with two battery LED globes on the box lid.
Carpenter: 1.25 days.
Volunteers (about 1.5 days): white tile with grout lines and a yellow platform-edge stripe; '2027' line diamond and invented line letters; ice-blue LED.

**Risks:** Chute stalling on the curve (bench-test the U channel in week 1; if needed steepen to 6° by raising the street to +250); balls jumping the channel wall on the curve at high speed (walls 60 mm, and the lid covers it anyway); mouth wear (PVC angle).

**Blends with:** The entrance kiosk stands on Gridlock's sidewalk (4). The tile wall's blue glow faces Grand Central's teal (2), and the queue for 2 can also watch the reveal.

**Vs current:** REPLACE The Rink in this slot. The white-felt speed and the turntable were both unknowns, and a fixed-skater rink is weak. The old Subway's three arches become a true vanish-and-reappear, the user's favourite Kulnari moment, with the exit visible.

### 2 Grand Central Whispering Gallery (Midtown)

**Sign:** Whisper Here, Heard There

**Ny icon:** Grand Central-style concourse: round information booth with the four-faced clock, teal star-field ceiling, whispering-gallery arches (architecture only, no logos)

**Kulnari lesson:** Kulnari's curved bank (K03) taken to its physical limit, plus the user's 'curves that guide the ball' and 'cups integrated into the design': the cup sits at the ellipse's second focus, the point every bank leads to. It works like the real whispering gallery, where a whisper in one corner arrives in the other.

**Plays:** Players tee at one 'whisper spot'. The round booth blocks the straight line to the cup at the other spot. The sign says: aim anywhere, every bounce is the same distance. Any putt off the elliptical wall, left, right or even backwards, rebounds through the cup. The whole game is the weight. An overcooked putt goes past, bounces back through the tee spot and comes round for a second go.

**Gimmick mechanics:**

Ellipse: a = 1.40 m, b = 0.95 m, c = √(a² - b²) = 1.03 m.
- Tee at focus A, 0.37 m from the end rail. Cup at focus B, 2.06 m away.
- Every path from A off the wall to B is exactly 2a = 2.80 m.
Speed: about 1.9 to 2.4 m/s (arrival at B 0.3 to 1.2 m/s, assuming a ≈ 0.6 m/s² on carpet grass and about 25% loss in the cushion bounce). This is the skill window.
Booth: Ø 0.40 m, 140 mm high, bolted through at the centre, faced with EVA. It carries a post with the four-faced clock cut-out (Ø0.5 m faces, top about 2.2 m, hands at 11:59).
Rail: 2 x 8 mm flexi-ply laminations, 90 mm tall, on 45 x 45 blocks at 200 mm, faced with 3 mm EVA. End radius b²/a = 0.64 m; side radius a²/b = 2.06 m. Cap of 9 mm ply in 8 segments. No corners anywhere.
Green: the whole ellipse on D75, level to ±2 mm, carpet grass.
Junior tee: a spot 0.5 m from B to one side, with a straight putt.

**Shape and footprint:** Ellipse 2.8 x 1.9 m inside; 3.4 x 2.1 m bounding including a 0.3 m tee apron.

**Direction changes:** 1

**Par:** 2

**Est minutes per group:** 2.1 min. About 2.0 strokes each = 8 strokes x 12 s = 1.6 min, plus 30 s. Nothing to read beyond 'aim anywhere'.

**Skill vs luck:** About 85% skill (pure pace; aim is forgiven), 15% luck (bounce scatter, the booth kicking second passes).

**Fallback for miss:** The ellipse returns every ball: misses re-cross the foci and settle on the green with no corners to hide in. Every point is within 0.95 m of the rail, and players can reach in or step onto the deck.

**Build:**

Ellipse marked on the ply with the string-and-two-pins method (pins at the foci, string 2a = 2.8 m), D75 deck (2 sheets), laminated rail, booth and clock post.
Carpenter: 1.25 days (rail 0.75, deck 0.25, booth 0.25).
Volunteers (about 1 day): teal star-field backdrop flats (2 sheets on the bottom wall), brass booth, clock faces, 'whisper spot' brass discs at A and B; amber LED.

**Risks:** Rebound scatter bigger than the cup (bench-test a full-size hardboard ellipse in week 1, 20 putts; if the scatter is over ±80 mm, raise the EVA face to 5 mm or shorten b); the deck not level (shim; roll-test from B); the lamination opening at the joints (stagger them, block every 200 mm).

**Blends with:** Teal star field and amber glow on the bottom wall, flowing into Times Square's magenta. The clock booth is visible from the subway queue.

**Vs current:** UPGRADE Grand Central. Slot, colour, clock and sign idea are kept, but the octagon of hand bumpers becomes the whispering-gallery ellipse: a unique, readable 'how did that work?' hole that gives the user's curves their best form. The footprint shrinks from 3 x 3 to 3.4 x 2.1 m.

### 1 Times Square (Midtown)

**Sign:** Drop the Ball

**Ny icon:** Times Square billboards (invented, church-friendly ads), countdown ball tower with a mirror ball, '2027' neon

**Kulnari lesson:** The user's plinko memory (from the visit; not in the footage), built to research B4's pegboard numbers. Research C1 says to end on a friendly spectacle finale. The Kulnari lesson 'one big gesture' applies: the billboard is the hole.

**Plays:** The finale. Players putt up a ramp to the 'marquee top'. Too soft and the ball rolls straight back to them, so they try again. Over the crest, the ball rattles down a lit billboard of pegs under clear cover and lands in a countdown slot labelled 3, 2, 1, 0, 1, 2, 3. Score = putts to get over the top plus the slot number. The centre 0 slot is 'DROP': the ball falls into the tower and the '2027' neon flashes. Every ball then rolls out to a tray for the group to take back.

**Gimmick mechanics:**

Tee: floor-laid lane, 1.5 m.
Ramp: 12° rising 225 mm (1.06 m straight plus R 600 transitions, about 1.25 m).
- Rolling gravity is about 1.46 m/s².
- Cresting needs at least 1.78 m/s at the foot plus drag, so about 2.5 m/s from the adult tee. The junior tee 0.5 m from the ramp foot needs about 2.2 m/s.
Crest plateau: 0.25 m.
Plinko board: 1.0 m wide x 1.1 m long, falling at 12° to about +20 mm.
- 12 mm hardwood dowel pegs, 40 mm proud (above the ball's 21 mm centre), glued 18 mm into the ply.
- Horizontal pitch 71 mm (59 mm clear, 1.4 x the ball). Rows 62 mm apart along the slope, offset half a pitch. 15 rows x 13 to 14 pegs, about 200 pegs.
- 4 mm polycarbonate cover 70 mm above the board on side stringers, lift-off with 4 turn-buttons.
- Seven slots, 130 mm wide, between 12 mm dividers 60 mm tall. Every slot drains on a 3° trough to the exit tray. The centre slot passes a battery microswitch (bonus flash) and a flush 'DROP' mouth into the tower box, which drains to the same tray.
Target spread: about 15 to 25% into DROP. Cap 5.

**Shape and footprint:** Straight along the golf limit: tee, ramp, crest, board, slots and tray. 6.2 x 2.2 m bounding including the tower base and the two billboards on their own feet.

**Direction changes:** 0

**Par:** 2

**Est minutes per group:** 2.0 min. About 1.4 putts each to crest (roll-backs come back by themselves) = 6 putts x 10 s, plus 4 x 5 s of rattle, plus 30 s of scoring and collecting from the tray, plus walking.

**Skill vs luck:** About 30% skill (cresting in one putt), 70% luck (the pegs): a deliberately friendly finale everyone can win.

**Fallback for miss:** A weak putt rolls back down the ramp to the tee. Nothing can stop on a 12° board. Every slot drains to the tray, so nothing needs a marshal and no ball is kept. That resolves the conflict with balls handed back at the hub.

**Build:**

Ramp with ribs and a flexi-ply skin (same detail as the bridge hill), board of 18 mm ply with a drilling jig at 71/62 mm, cover, troughs and tray, tower 2.8 m (framed, thin ply skin, '2027' LED neon flex, borrowed mirror ball on a 12 V battery spinner, the course's only moving part, decor only), two 2440 x 1220 billboards facing the party floor.
Carpenter: 1.75 days.
Volunteers (about 2 days): drill and glue pegs from the jig, paint the billboards and slot numbers, magenta LED with a slow pulse.

**Risks:** Kids unable to crest (junior tee at the ramp foot; prototype test: at least 50% of kids in 2 tries); balls hopping pegs on smashes (the cover stops it); a peg working loose (glued plus cover); 'pure luck' disappointing competitive players (they still win on cresting in 1). The mirror-ball spinner fails: the hole still plays.

**Blends with:** The whole-room weenie at the golf limit. Its billboards face the party floor, its magenta wraps Grand Central's amber, and it ends 2.7 m from the hub, so the group walks straight back to the Tee Booth.

**Vs current:** UPGRADE Times Square. Slot, sign, magenta and tower are kept; the 60 mm hump plus mouth becomes the user's plinko billboard. Balls are no longer kept. Similar carpentry (1.75 against 1.5 days).

## Difficulty curve

Each district is a fair 5-hole round on its own. Par is 12 per district and 25 in total.
- DOWNTOWN: 10 Stoops teaches weight with no reading (easy, par 2). Then 9 Pizza, one social shot (par 3). Then 8 Hot Dog, read the trick and play the chance (par 2). Then 7 Bridge, a skill duel (par 2). Then 6 Liberty, the hero spectacle and the hardest hole (par 3).
- MIDTOWN: 5 Central Park teaches pace through curves (easy, par 3). Then 4 Gridlock, a chaos break (par 3). Then 3 Subway, the reveal hero (par 2). Then 2 Grand Central, the skill spike: pure weight, aim forgiven (par 2). Then 1 Times Square, the friendly lottery finale (par 2).
- Skill against luck alternates so no two luck-heavy holes sit together within a district. The skill-heavy holes are 10, 7, 6, 5 and 2; the chance-heavy holes are 8, 4 and 1.
- Aces are possible on every hole.
- Kids get junior tees on all ten and two big equalisers (4 and 1). Adults get three real weight tests (9, 7, 2) and one power-and-line test (6).

## Throughput check

Estimated minutes per group of 4: 10 = 2.0, 9 = 1.7, 8 = 2.2, 7 = 1.8, 6 = 2.5, 5 = 2.3, 4 = 2.3, 3 = 2.2, 2 = 2.1, 1 = 2.0. That is about 21 min of play per 10-hole round, plus 3 to 4 min walking, so about 25 min.
- The slowest hole is 6 at about 2.5 min. That is 24 groups/h: 96 players/h with groups of 4, or about 84/h at an average 3.5 per group. The target was 77 to 90.
- Every hole is within about 0.5 min of the others (the rule asks for about 30 s; 9 and 7 are faster by design, which absorbs bunching).
- Pace savers: one shot each at 9, two players at once at 7, self-returning hazards at 7 and 1, every miss within reach, and signs readable in 3 s.
- If 6 times over 2.6 min at the dry run, move its tee 1 m toward the wave (the leg is 3.6 m, so it can lose 1 m). If 5 is slow, move its tee to the start of leg 2.
- The flow simulation (tools/flow_sim.py) needs rerunning with these times. At 2.5 min for the slowest hole and everyone playing all 10, it should land at about 80 to 95 players/h.
- Peak fallbacks are unchanged: one-district rounds (about 2.3x capacity), groups of 5, and a bypass rule.
- These are estimates. The 18 Dec dry run times every hole with real groups of 4, including at least one group with kids.

## Cost and time delta

Against the route C plan (about S$10.9k, about 12 carpenter-days). Estimates, not quotes.
CARPENTER (prop and structure days):
- New design: 10 = 1.0, 9 = 0.75, 8 = 1.25, 7 = 1.0, 6 = 1.5, 5 = 0.75, 4 = 0.25, 3 = 1.25, 2 = 1.25, 1 = 1.75. Total 10.75.
- Route C: about 7.25 to 8.
- Difference: about +2.75 to 3 days, so about 15 days in total. That is about +S$750 at S$250 a day (S$450 to 900).
- The days won't fit one person between 7 and 18 Dec (about 11 working days against about 11 needed plus rails and greens). Book a second carpenter for about 3 days from 7 to 12 Dec, or extend the first one's days, at the same cost.
MATERIALS:
- About 12 more sheets of 18 mm ply for the stepped and raised decks (stoops, pizza, cart levels, street, ellipse, ramp): +S$650 to 900.
- Flexi-ply, about 4 sheets (wave, hill, ramp, curves, ellipse): +S$250 to 320.
- Polycarbonate, about 2.2 m² (cart lid, plinko cover): +S$180 to 250.
- Dowels, PVC angle, EVA and rubber cord: +S$120 to 180.
- Festoon and fairy lights: +S$120 to 180.
- 4 extra 9 mm sheets for the façade and skyline, plus paint: +S$200 to 300.
- Mirror-ball spinner: +S$30.
- Savings: no rink felt or turntable, apple double-skin, strip curtain or wheel cradles: -S$250.
- Net materials: about +S$1.3 to 1.9k.
TOTAL:
- About +S$2.1 to 2.7k plus 10% contingency, so a plan of about S$13.2 to 13.9k.
- To bring it back: route C's four cuts (production lends the lights, borrow putters, fewer flats, plates from offcuts) save about S$1.05k. Two more cuts, pizza with a painted rather than inlaid house and an opaque cart lid with one clear strip, save about S$0.2k. That gives about S$12.0 to 12.6k, about S$1.1 to 1.7k over the current plan.
- The S$10k ceiling has never been set; this needs the project lead's call.
- Cheaper fallback, about -S$0.9k and -1.75 days: keep Liberty's gangway in place of the wave and swap Grand Central back to the octagon.
VOLUNTEERS:
- About +6 volunteer-days: peg jig and drilling 1, pizza inlay 1.5, wave and bridge paint 2, brownstone façade 1.5. That brings the total to about 51 to 56, still mostly before 18 Dec.
- Paint schemes stay two-colour on props.
DATA:
- Rail metres are about the same, at about 140 to 150 m: curves replace straights, the ellipse uses about 7.5 m of laminate.
- LED is about 150 m with ten controllers. If the ordered strip is RGB, retune 4 to taxi yellow and 7 to warm amber; if it is fixed colour, keep the slot colours as listed.

## Prototype first

Build Hole 1 Times Square (plinko) in full by Fri 4 Dec, plus four half-day bench rigs.
Why hole 1:
- It is the finale and the signature hole.
- It has the most numbers that only testing can settle: whether kids can crest a 225 mm, 12° ramp; peg pitch 71/62 mm and the jam rate; whether balls hop pegs under the cover; the slot spread; the drain to the tray.
- Its ramp detail (ribs, flexi-ply skin, R 600 transitions) is the same as the bridge hill (7) and the Liberty shore (6), so one test covers three holes.
- It also carries G2's standard details: a run of 45 x 95 rail on plates, the carpet-grass speed on the real floor and a floor-laid lane against a raised surface.
- Cost about 1.75 carpenter-days, Mon 30 Nov to Wed 2 Dec.
Thu 3 Dec, bench rigs (about 0.75 carpenter-day plus a helper, all from offcuts):
(a) The hot-dog X-junction: a 1.4 m channel board on trestles at 3.1°, 30 runs per mouth. Pass if the ball keeps its line at least 60% of the time, with zero stalls.
(b) The subway U-chute at 4.5°, 50 runs. Zero stalls.
(c) A full-size hardboard ellipse (a = 1.40, b = 0.95) laid on the carpet, 20 putts from focus A. Pass if the scatter at B is ±80 mm or less.
(d) One Liberty wave rib with a 0.4 m flexi skin: ride height at 2 and 3 m/s, and the curl lip.
Fri 4 Dec test-play: 8 volunteers including 3 kids. Pass criteria for hole 1:
- At least 70% of adults crest within 2 putts, and at least 50% of kids from the junior tee.
- Zero jams in 100 drops.
- No peg hop-outs.
- 15 to 25% of balls into DROP.
- A group of 4 finishes in 2.2 min or less.
Then buy the bulk timber and freeze the other nine drawings by Sat 5 Dec. Nothing else on the course has a mechanism; the mirror-ball spinner is bought ready-made.

## Open questions

1. Was G1 (25 Nov) passed with the current hole list? This redesign replaces 7 slots and upgrades 2, so the team has to agree the swap and the approximately S$12 to 12.6k plan, or name the cheaper fallback (keep the Liberty gangway and the Grand Central octagon).
2. Budget ceiling and carpenter: can the carpenter do about 15 days, or can we add a second carpenter for 3 days from 7 to 12 Dec?
3. Is the ordered LED strip RGB (ten controllers suggests yes) or fixed colour? That decides the 4 and 7 retune.
4. Floor flatness under 9 Pizza and 2 Grand Central: both need ±2 mm, so shim the decks; a 2 m straightedge check is needed at the venue.
5. Fire certificates for polycarbonate, flexi-ply paint, EVA and needle-punch inlay; whether SCDF's temporary change of use permit applies.
6. May players step onto decks to pick up (9, 2), or do we supply pick-up tubes?
7. Loans: two Christmas trees (5), the mirror ball (1), production's wash at about 50 to 100 lux on walkways and at least 200 lux on greens.
8. The approximately 8.6 m runway extension through the hub; clearance to the console sightline for the 2.6 m torch (6) and the 2.8 m tower (1).
9. Rally rules at 7 for odd-sized groups: the third player plays solo from one end.
10. Layout v4: rerun tools/make_layout_nyc.py and the carpenter pack gap check with these footprints. The 1.4 m gaps at 8 to 7, 8 to 9 and between the Midtown rows are the tightest.
11. Liberty artwork: draw it from the original statue, never from photos of the Las Vegas replica.
12. Does production want golf to close before midnight? If so, hole 1's tower may need to roll aside for the crowd.
