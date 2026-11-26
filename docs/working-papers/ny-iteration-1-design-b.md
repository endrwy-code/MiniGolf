# New York iteration 1, design B (Buildable): working paper (27 Nov)

**Status:** one of the two independent designs that `../14-new-york-iteration-1.md` was built from. Brief for this designer: keep the current course and its standards, and change only what Kulnari proves. It has **not** been through the adversarial review, so it still contains the errors the review found (see `ny-iteration-1-review.md`; for example hole geometry and physics that did not add up). Doc 14 wins wherever they differ. Hole numbers here are this designer's, and may differ from doc 14's.

## Concept

"Downtown bends, Midtown stacks." This keeps the current course and its numbering, colours, totems, rail standard (D1-D9) and most of its names and signs. Each hole gets one upgrade: the single most valuable Kulnari lesson or user gimmick for that hole.

- **Downtown (10-6, top side): the old crooked streets of lower Manhattan.** Every hole turns or curves: an S-bend bike lane, a hot dog bun that funnels the ball into the cup, an apple that swallows the ball and spits it out round a corner, a taxi junction, and a two-sided rally hill on Liberty Island.
- **Midtown (5-1, bottom side): the grid built upwards.** Holes play in levels: subway loops where the left tube comes out on the right, brownstone stoop terraces, curling on the rink, a central info booth under the Grand Central clock, and a Times Square plinko billboard that "drops the ball".

Ten different mechanics. No moving parts at all: the one-moving-part allowance is deliberately left unused, so nothing can break and every hole plays with the power off. Par stays 27.

Changes from the current plan:
- **One real replacement:** hole 4, Brownstone Stoop terraces. The Broadway or Rooftop choice for that slot was never settled.
- **Two mechanics swapped in place, theme and props kept:**
  - Liberty: the bridge becomes a rally hill.
  - Rink: the turntable becomes curling.
- **Everything else is an upgrade on the same footprint**, except holes 8 and 7. Each becomes an L, so the layout script needs a v4 run.

Fixes along the way:
- Hole 1 now returns the ball to the player through a tray, which resolves the start-anywhere conflict.
- Every tee gets a pool of light from a lamp on its totem, which avoids Kulnari's darkness.

Every number below is an estimate or a design target until the prototype on Fri 4 Dec. Heights use the route C framing stack:
- **+67 mm:** standard raised green (45 mm frame + 12 mm top + 10 mm carpet).
- **+117 mm:** 45 × 95 on edge + 12 mm top + 10 mm carpet.
- **+162 mm:** 95 + 45 frame + 12 mm top + 10 mm carpet.

Speeds:
- **Crest speed** is v ≥ √(10gH/7).
- **Carpet grass slowing** is assumed at about 0.62 m/s², which corresponds to a Stimp of about 2.7 m. The prototype must measure it.

## Course flow and rooms

**Order and route.** Unchanged loops from the Tee Booth hub: Downtown 10, 9, 8, 7, 6, back to the hub; Midtown 5, 4, 3, 2, 1, back to the hub.

**Layout v4 changes:**
- **Hole 8** becomes an L. Leg 1 is x 13.2-14.4, z 2.25-7.75. Leg 2 is x 14.4-16.6, z 2.25-3.45.
- **Hole 7** moves to x 17.9 so it keeps 1.3 m from hole 8. Leg 1 is x 17.9-21.1, z 2.3-3.5. Leg 2 is x 19.9-21.1, z 3.5-5.5.
- **Hole 6** is 5.5 × 1.6 at about x 23.0-28.5, z 2.4-4.0, ending 1.5 m short of the hub.
- **Hole 5** shrinks to 4.0 × 2.4, for example x 21.5-25.5. It is a U, so it finishes back near its own tee.
- **Hole 3** narrows to 5.0 × 1.6.
- **Holes 10, 9, 4, 2 and 1** keep their v3 footprints.
- Bounding area is about 90 m² (v3: about 102).
- Rerun `tools/make_layout_nyc.py`. Rules stay ≥ 1.2 m hole to hole and ≥ 1.2 m walkways.

**Making rooms in the big hall.** Darkness is not the wall; light and flats are.
1. **Tee pool on every hole.** A 24 V 20-30 W warm LED flood clamped to the totem at about 2.1 m, aimed at the tee and the first 2 m. That gives about 150-200 lux at the tee (estimate). The cup end is lit by the hole-colour strip, so it is about 100 lux. A dim warm house wash of about 30-50 lux covers the walkways. Nobody needs a torch.
2. **A backdrop flat behind every cup, facing the tee.** 2.4 × 1.2 m, painted double-sided. The back face is painted for the neighbouring hole, so one sheet serves two holes. From the tee you see your own little street.
3. **A lower ceiling per district.** Festoon string lights zigzag between four 3 m poles on sandbagged bases, at ≥ 2.4 m, which clears the 2.1 m rule. Downtown has warm-white "old street" bulbs. Midtown has a few amber marquee bulbs and two overhead banner "billboards" with invented church-friendly brands. Borrow the Christmas stock if possible.
4. **Floors and portals.** Charcoal walkways with painted white zebra crossings link each cup to the next tee, so the route reads as one street. Two painted portal flats stand at the hub:
   - **Downtown:** a twin pointed-arch bridge-tower silhouette over the 1.6 m walkway.
   - **Midtown:** a bulb-edged "MIDTOWN" marquee.
   Both are optional if the budget is tight.
5. **Landmarks.** Each district has one tall landmark you can see from anywhere: Liberty's torch for Downtown, the Times Square tower for Midtown, and the stage countdown over everything. Players see them on the turns. Queues face the reveals (the apple exit, the subway exits, the plinko) so waiting groups are entertained.

**How neighbouring holes blend** (they look linked but never cross):
- **10 and 9:** the green bike-lane stripe runs on as the walkway edge up to the hot dog cart, and the cart umbrella shows past the end of the bike lane.
- **9 and 8:** share a brownstone street-corner flat with a fruit stand on the apple side.
- **8 and 7:** the apple's worm-hole exit faces hole 7's tee, and the worm wears a cabbie cap.
- **7 and 6:** the cabs queue for the ferry, and the blue harbour carpet starts where the asphalt ends.
- **5 and 4:** the back of the subway car flat is painted as a station exit stair coming up beside the stoop, with green globe lamps.
- **4 and 3:** the stoop's string lights carry on into the rink's tree lights.
- **3 and 2:** the gold constellation ceiling banner over Grand Central extends over the rink.
- **2 and 1:** the clock at 11:59 faces the tower's 2027. "One minute to go" reads across the pair.

Colours stay fixed per hole (the ordered strip). Each prop face that looks at a neighbour carries a stripe of that neighbour's colour. The "find the 11:59" game stays on every hole.

## Holes

### 10 Bike Lane (Downtown)

**Sign:** Wheel See You Next Year

**Ny icon:** Hudson River greenway bike lane, bike-rack hoop, bike wheels

**Kulnari lesson:** The user's 'curves that guide the ball', learning from K03's failure. Large-radius curves are made from two laminated 9 mm ply skins, not thin strips with free ends. K09: a long lane must earn its time, so there are fewer obstacles (5 wheels down to 2).

**Plays:** 1. The tee is at the hub end. The green lane bends gently left, then right, like a greenway, with a bike wheel at the inside of each bend. 2. A well-weighted putt runs along the outer rail of bend 1, which carries it round. 3. It comes off the rail heading into bend 2 and drifts to the cup under the bike-rack hoop. 4. A careless putt clips a wheel and stops mid-lane, leaving an easy second putt. It teaches 'the rail is your friend' for the rest of the course.

**Gimmick mechanics:** Lane 1.0 m clear inside the rails. The centreline shifts 0.6 m sideways over 5 m: two opposite bends of centreline R ≈ 3.0 m, each about 35-40°. The rails stay 85 mm above the surface. A ball tracking the outer rail at 1.2-1.8 m/s follows the curve (the centripetal force needed is about 0.5-1.1 m/s², which the rail supplies). The two wheels (Ø ≈ 660 mm) sit in the existing cradles at the bend apexes, rim touching the inside rail (gap 0, so nothing wedges). The cup is 110 mm PVC cut to 64 mm, on a +67 raised green 1.2 m long with a 1:5 bevel. The existing conduit bike-rack hoop arches over the cup at 0.45 m clear.

**Shape and footprint:** Gentle S inside the v3 bounding box of 6.0 × 1.6 m (x 23.0-29.0, z 7.5-9.1). No layout change.

**Direction changes:** 2

**Par:** 2

**Est minutes per group:** About 2.0 min: 4 players × about 2.3 strokes × 10 s = 92 s, plus about 25 s to walk in and pick up.

**Skill vs luck:** About 80/20. The rail ride rewards weight and line. The wheel spokes add a small random bounce.

**Fallback for miss:** Rails and wheels keep the ball in a 1.0 m lane. A ball that stops on the bevel rolls back to its foot, still in reach. No gaps under 0.25 m.

**Build:** Carpenter about 0.75 day, the same as now: 2 fewer wheel cradles (-0.25) and curved rails (+0.25). Curved rails: two layers of 9 mm ply, cross-grain (minimum bend R ≈ 0.9 m, so R 3 m is easy), glued and screwed to 45 × 45 blocks at 300 mm, blocks screwed to the hardboard plates. The white cap is 9 mm ply cut to the arc from a full-size template. About 10 m of curved rail uses about 3 sheets of 9 mm (about S$135), less about 10 m of straight rail timber saved, so about +S$70 net. Volunteers paint the green lane with the white bike stencil, dress the wheels, and fit EVA facing on the outer rails.

**Risks:** Bent ply springs back if the blocks are too far apart. Keep them at ≤ 300 mm and test a 1.2 m sample at the prototype. A carpet seam on a curve can drift the ball, so lay one piece cut to the curve.

**Blends with:** The green bike-lane stripe carries on along the walkway edge to hole 9's cart. Hole 9's striped umbrella shows past the cup. The rear face of the hole 10 backdrop is hole 9's street corner.

**Vs current:** UPGRADE. Same theme, sign, wheels and footprint. The straight five-wheel slalom was mostly luck and slow to read. The S-bend teaches the course's 'curves guide you' idea in the first 20 seconds, and it is faster.

### 9 Hot Dog Cart (Downtown)

**Sign:** Relish the Moment

**Ny icon:** Street hot dog cart with striped umbrella, giant bun, mustard squiggle

**Kulnari lesson:** The user's 'cups integrated into the design' plus 'curves that guide'. K05: funnel lead-in rails into a themed prop. The cup sits inside a giant hot dog bun whose curved halves steer the ball to it.

**Plays:** 1. Putt under the cart's arch. 2. Pass the fries box and the mustard and ketchup bottles, which stand against the rails. 3. Roll up the short bevel into the open giant bun. 4. The bun's inner faces narrow and steer the ball along a painted mustard squiggle to the cup near the bun's closed end. 5. A hard putt rebounds off the rounded bun end, usually back across the cup.

**Gimmick mechanics:** Lane 1.4 m wide, floor-laid, cart arch as now (opening 430 mm high, the full lane width). The +67 green starts at 2.7 m with a 1:5 bevel (0.34 m long); the ball needs about 0.97 m/s at the bevel foot. The bun is two halves 1.3 m long. The mouth is 0.90 m wide and narrows to a 0.40 m channel (≥ 0.25 m rule met), so each inner face is angled about 14°. A ball hitting it turns about 28° toward the centre. The channel ends in a closed semicircle R 0.20 m. The cup is centred 0.30 m from the end. Bun height 150 mm (above the 85 mm rail, so it reads as a soft cushion). Inner faces have 5 mm EVA.

**Shape and footprint:** Straight, 4.5 × 1.4 m (v3 x 16.85-21.35, z 7.5-8.9). Tee 0.5 m, approach 1.0 m, cart at 1.5 m, bun mouth at 3.0 m, end rail 4.4 m. No layout change.

**Direction changes:** 0

**Par:** 2

**Est minutes per group:** About 2.0 min: 4 × about 2.2 strokes × 10 s = 88 s, plus 25 s.

**Skill vs luck:** About 85/15. The funnel forgives the line, so getting the weight right is the skill.

**Fallback for miss:** A short putt rolls back off the bevel to its foot. A wide putt hits a bun's outer face or the rail and stays in the lane. Nothing narrower than 0.40 m.

**Build:** Carpenter about 0.75 day (+0.25). Each bun half is a box: top and bottom of 18 mm ply cut to the bun outline from a template, 95 mm spacer blocks, skinned with 3 mm hardboard bent round the outline (hardboard bends to about 0.3 m R), screwed through the green into the plates. About 1 sheet of 18 mm plus 1 sheet of hardboard, about +S$90. The old 1 m hot-dog bank wall is dropped (saves about S$30). A foam sausage is screwed on top of one half as decoration only. Volunteers paint the bun golden with sesame, paint the mustard squiggle on the carpet, and make the fries box.

**Risks:** The bun mouth corners take hits, so face them with PVC angle (K05 lesson). The cup must be dead flush: a raised rim rejects slow balls coming down the channel.

**Blends with:** The cart menu board reads 'Open till 11:59'. The cart umbrella is visible from hole 10. Its backdrop is a brownstone corner flat shared with hole 8, with a fruit stand on the apple side.

**Vs current:** UPGRADE. Cart, umbrella, bottles, sign and footprint are kept. The flat bank wall was a nothing-moment; now the hero prop is the cup.

### 8 The Big Apple (Downtown)

**Sign:** Take a Bite

**Ny icon:** Giant glossy apple with a worm hole, the Big Apple

**Kulnari lesson:** K01's 'ball vanishes into a prop and reappears elsewhere', fixed so the exit is visible to the queue. The user's 'tunnel that leads somewhere unexpected'. K05: funnel rails and a faced mouth.

**Plays:** 1. Putt down leg 1 toward a 1.8 m apple. 2. Up a short 'kerb' ramp, leaf boards funnel the ball into the bite-shaped mouth. 3. It vanishes. Inside the apple's base a curved channel turns it 90° to the right. 4. It pops out of the worm hole on the apple's side, onto leg 2, rolling toward the cup. Everyone walks round the apple to see where it went, and hole 7's queue watches it arrive. 5. A miss bounces off the leaves back down the ramp for another go.

**Gimmick mechanics:** Leg 1: 1.2 m wide, floor-laid, tee 0.5 m plus 2.0 m flat, then a 1:6 ramp of 0.88 m up to +147 mm. The ball needs ≥ 1.43 m/s at the ramp foot; anything slower rolls back. Leaf boards angle in about 20° to the mouth: 300 mm wide × 200 mm high, faced with PVC angle. The channel inside is 300 mm clear (meets the ≥ 0.25 m rule), centreline R 0.60 m (inner wall R 0.45, outer R 0.75), 90° turn, path about 0.94 m. The floor falls 80 mm (+147 to +67) at about 4.9°, so no ball can stop inside. Exit speed is about 0.8-1.2 m/s, so it rolls on for 0.5-1.1 m. Leg 2 is a +67 raised green 2.2 × 1.2 m. The cup is 0.8 m from the exit, offset 0.15 m from the exit line: ace possible, not automatic. End rail at 2.2 m.

**Shape and footprint:** L. Leg 1 is 5.5 × 1.2 (x 13.2-14.4, z 2.25-7.75), with the apple box 1.2 × 1.2 at the corner. Leg 2 is 2.2 × 1.2 (x 14.4-16.6, z 2.25-3.45). Bounding 3.4 × 5.5 m. Hole 7 must start at x ≥ 17.9.

**Direction changes:** 1

**Par:** 3

**Est minutes per group:** About 2.3 min: 4 × about 2.6 strokes × 10 s = 104 s, plus about 30 s to walk round the apple. The transit is 1-2 s.

**Skill vs luck:** About 75/25. The weight to clear the ramp, and the line to find the mouth, are skill. The exit roll is predictable once seen.

**Fallback for miss:** Too soft rolls back down the ramp to the player. Wide hits the leaf boards and comes back. Inside the channel it always rolls out, and the box top lifts off (4 thumbscrews) for a jam. Leg 2 is a closed 1.2 m green.

**Build:** Carpenter about 1.5 days (+0.5). The apple base is a box 1.2 × 1.2 × 0.30 m on a 45 × 95 frame. The channel floor is a 12 mm ply wedge. The outer wall is 2 × 6 mm ply (minimum R 0.6 m, so R 0.75 is fine); the inner wall is stacked 18 mm ply arcs (R 0.45 is too tight to bend). The lift-off top is 12 mm. The flat double-skin apple (as in the pack) bolts to the back of the box, and sandbags (30 kg) fill the dead corners of the box, so there is no bracing in the walkway. Extra: about 1 sheet each of 18, 12 and 6 mm, plus about 2.5 m more rail, about +S$200. Volunteers paint the apple gloss red, the worm and the leaves.

**Risks:** Channel scrub on the curve: confirm on the hole 5 prototype that a 0.3 m/s ball still exits. The mouth takes hits, so use PVC angle. The apple is top-heavy: 30 kg ballast, and test it with a 20 kg sideways push at 1.5 m.

**Blends with:** The worm hole faces hole 7's tee; the worm wears a cabbie cap and a watch at 11:59. The fruit-stand back face is shared with hole 9. The red glow pairs with the taxi yellow next door.

**Vs current:** UPGRADE. Same apple, sign and leaf-board idea. The straight single gate becomes a reveal with a real direction change. The best 'wow per dollar' upgrade in Downtown.

### 7 Gridlock (Downtown)

**Sign:** Don't Honk. Just Putt.

**Ny icon:** Yellow cabs (unbranded) at a box junction, zebra crossing, cones

**Kulnari lesson:** K13 scattered blocks, fixed properly with real kerbs. The user's 'change direction to make a small space interesting', using a straight 45° chamfer bank (no bending) so the turn still plays in 2-3 strokes.

**Plays:** 1. Putt along leg 1 through a stagger of two parked cabs. 2. At the junction (painted zebra), bank off the 45° corner board into leg 2. 3. Thread a 0.5 m gap between two cabs to the cup. A bold player banks first time and can ace; a cautious one lays up at the junction.

**Gimmick mechanics:** Lane 1.2 m wide, charcoal needle-punch with painted lane lines. Leg 1 is 3.2 m. Cab A sits against the inner rail at 1.5 m, cab B against the outer rail at 2.3 m (blocks 360 × 170 × 140 mm, 0.86 m clear between). The outer corner has a 45° chamfer board 0.85 m long, faced with 5 mm EVA; a ball meeting it square turns 90°. The inner corner is filled with a 100 × 100 block. Leg 2 is 2.0 m. Cabs C and D form a 0.50 m gate 0.6 m before the cup; E and F are parked tight against the rails (gap 0) as kerbs. The cup is on a +67 green, 0.8 m long, with a 1:5 bevel. Every gap is 0 or ≥ 0.25 m.

**Shape and footprint:** L. Leg 1 x 17.9-21.1, z 2.3-3.5. Leg 2 x 19.9-21.1, z 3.5-5.5. Bounding 3.2 × 3.2 m (v3 was 5.0 × 1.8).

**Direction changes:** 1

**Par:** 3

**Est minutes per group:** About 2.2 min: 4 × about 2.8 strokes × 10 s = 112 s, plus 20 s.

**Skill vs luck:** About 65/35. The bank angle is skill; the cab deflections add party luck.

**Fallback for miss:** Closed L, no gaps under 0.25 m, inside corner filled. The ball always stays in a 1.2 m lane.

**Build:** Carpenter about 0.75 day (+0.25 for the corner and the extra rail joint). The existing cab-block jig is reused, with 6 cabs instead of 8. About 1.5 m more rail, about +S$40. Volunteers paint the cabs (no TLC marks; invented 'CAB 1159' numbers), the cones and the zebra.

**Risks:** The chamfer board must be rigid (screwed every 150 mm) or the bank goes dead. The L needs the v4 layout check against hole 8.

**Blends with:** It faces hole 8's worm exit. The cabs queue toward hole 6's 'Ferry' sign, and the asphalt carpet meets the blue harbour at hole 6. A cab meter shows 11:59.

**Vs current:** UPGRADE. Same cabs, sign and colour. The straight pinball was mostly luck; the junction adds a readable skill shot and makes a smaller footprint more interesting.

### 6 Liberty Island (Downtown)

**Sign:** Lift Your Lamp

**Ny icon:** Statue of Liberty torch (public domain, own drawing), harbour, two ferry piers

**Kulnari lesson:** The user's two-person rally hill: players at both ends aim at a goal on top (Mt Holey Moley or volcano style). K12: different heights. A self-returning slope for pace.

**Plays:** 1. The group splits: two players at the 'Battery' pier, two at the 'Jersey' pier, facing each other across the island. 2. Ends take turns: Battery putts, then Jersey. 3. Each putts up the island hill toward the cup on the summit under Liberty's torch. Too soft rolls back to you. Too hard runs over the top and down to the other pier, and you play back from there. 4. Balls left on the summit can be knocked in or knocked off. It is noisy, social and quick, and it is the Downtown finale spectacle.

**Gimmick mechanics:** Hill H = 150 mm. Slopes 12° (run about 0.71 m each side). Crest and foot transitions R 600 mm (no launch below 2.4 m/s; crest speeds are ≤ 1.5 m/s). Plateau 0.30 m long with the cup centred. Each slope cross-falls 3° toward the centreline (outer ribs 37 mm higher), so climbing balls are steered onto the cup line. The ball needs ≥ 1.45 m/s at the hill foot to crest, about 1.73 m/s allowing for slope drag, so about 2.15 m/s from the tee 1.3 m back. A ball cresting at 0.3-1.2 m/s on the centreline drops into the 108 mm cup. That is a tee-speed window of about 2.15-2.46 m/s (about ±7%), forgiving rather than a lottery. Lane 1.4 m clear. Flat approach 1.3 m each side plus a 0.5 m tee.

**Shape and footprint:** Straight and symmetrical, 5.5 × 1.6 m (about x 23.0-28.5, z 2.4-4.0), with tees at both ends. v3 was 5.0 × 2.4. Walkways must reach both ends.

**Direction changes:** 0

**Par:** 3

**Est minutes per group:** About 2.0 min: two ends playing in turns with no walking between strokes. 4 × about 2.7 strokes × 8 s = 86 s, plus about 30 s to split up and gather.

**Skill vs luck:** About 70/30. Weight is everything. The other side's balls on the summit add chaos.

**Fallback for miss:** Fully self-returning: soft balls roll back to the player, hard balls run to the far end rail, which is the far player's area, so you play from there. End rails are 85 mm. Max 5 strokes.

**Build:** Carpenter about 1.25 days (+0.25). It replaces the gangway and island green. Five 18 mm ply profile ribs run along the lane at about 300 mm centres (outer ribs 37 mm higher for the cross-fall), skinned with 6 mm ply cross-grain (minimum R 0.6 m, which matches the transitions), carpet grass glued on with contact adhesive. The cup sleeve sits on a 12 mm cleat inside the plateau. The rest is floor-laid blue 'harbour' needle-punch inside the rails. The torch cut-out (2.0-2.4 m, as drawn) stands on its weighted pedestal outside the side rail at mid-length, so it rises from the island. About +S$50 net. Volunteers paint the pier signs and a little orange ferry flat.

**Risks:** If the carpet speed differs from 2.7 m Stimp, the window shifts. Tune H at the prototype bench sample (it can go down to 120 mm). Marshals brief 'ends take turns' so nobody putts into a ball coming over. If the floor is not flat the cross-fall changes, so shim the ribs.

**Blends with:** The harbour carpet continues the waterfront from Gridlock. Liberty's torch is Downtown's landmark, seen from the hub and every Downtown tee. Liberty's tablet reads XI:LIX.

**Vs current:** UPGRADE (the mechanic is swapped; theme, sign, torch prop and colour are kept). The bridge-and-harbour hole in route C left misses in the harbour to putt back. The rally hill self-returns, delivers the user's favourite social mini-game, and plays two ends at once.

### 5 The Subway (Midtown)

**Sign:** Stand Clear of the Closing Doors

**Ny icon:** White-tiled station wall, invented line symbols (a star 'Express', a ring 'Local', a diamond 'Shuttle'), subway car front (generic)

**Kulnari lesson:** The user's 'hit the leftmost tube and it comes out on the right', done with no crossing pipes: three concentric hairpin loops reverse the order naturally on one level. K01 and K05: vanish and reveal, funnel mouths. Research B4: falls of 2-5°, a clear section so players see the ball.

**Plays:** 1. Putt up the station steps, a short ramp, onto the 'platform'. 2. Funnel rails steer the ball into one of three tiled portals: left 'Express', centre 'Local', right 'Shuttle'. 3. Under a clear lid you watch it race round a hairpin loop and shoot out of the opposite side, travelling back toward you on the return track. The leftmost portal comes out rightmost, lined up on the cup. 4. Putt out on the return green. The line map on the wall rewards anyone who reads it.

**Gimmick mechanics:** Approach 1.0 m wide, tee 0.5 m plus 1.2 m flat. Ramp 1:6, 0.76 m, up to +127 mm (the ball needs ≥ 1.33 m/s at its foot). Platform 0.8 m long; funnel rails narrow it from 1.0 m to 0.42 m at about 20°. Portals are 3 × 110 mm clear with 30 mm walls, noses rounded and PVC-faced. The loops sit in a box: centreline radii r1 0.25, r2 0.39, r3 0.53 m, paths 0.79, 1.22 and 1.67 m. Channel floor falls 60 mm (+127 to +67): 4.4°, 2.8° and 2.1°, all above the roughly 1° a ball needs to keep rolling. Walls are 3 × 18 mm stacked ply arcs (54 mm), with a 4 mm clear polycarbonate lid on 4 thumbscrews (54 mm headroom, 1.26 × the ball). Exits face back toward the tee onto a +67 return green 1.0 × 3.0 m. The cup is 1.3 m from the exits on the line of the outer-loop exit (Express). The other two exits land 140 and 280 mm to one side. A 0.4 m solid island divides the two lanes.

**Shape and footprint:** U, 4.0 × 2.4 m (approach 1.0 + island 0.4 + return 1.0). For example x 21.5-25.5, z 16.3-18.7, tee at the hub end. Shorter than v3's 5.5 m, which frees floor.

**Direction changes:** 1

**Par:** 3

**Est minutes per group:** About 2.2 min: 4 × about 2.7 strokes × 10 s = 108 s, plus about 3 s transit each, plus 20 s.

**Skill vs luck:** About 70/30. Portal choice and ramp weight are skill; the first-time surprise is the luck.

**Fallback for miss:** Too soft rolls back down the ramp. A ball that hits the solid tile wall bounces back down the ramp. Every channel has a fall, so a ball cannot stop inside. If one does, the clear lid lifts off. The return green is a closed lane.

**Build:** Carpenter about 1.5 days (+0.75). Loop box 1.0 × 0.65 m on a 45 × 95 frame. The floor is a 12 mm ply wedge. Arcs are jigsawn from a full-size printed template (a volunteer can cut layers 2-3). Lid 4 mm polycarbonate, about 0.65 × 1.1 m (about S$60-90). The tile wall is the existing 18 mm sheet, now with 3 small portals. The car-front flat stands behind the loop box. About +S$250 net, less some rail saved by the shorter hole. Volunteers do the tile paint, line symbols and the map.

**Risks:** The main physics risk on the course is wall scrub in the 0.25 m hairpin slowing slow balls, which is why this hole is the prototype. If a ball stalls: raise the entry to +147 (more fall), or open r1 to 0.30 m. Hop-out at hard putts is stopped by the lid. Polycarbonate needs a fire-rating check. Fallback design: the current three straight tunnels.

**Blends with:** The back of the car-front flat is painted as a station exit stair coming up beside hole 4's stoop, with green globe lamps. Blue glow sits next to purple. The platform clock reads 11:59.

**Vs current:** UPGRADE. Same wall, car front, sign and colour. 'Pick a tunnel' becomes the user's crossover trick, done on one level with nothing that can jam.

### 4 Brownstone Stoop (Midtown)

**Sign:** Take It One Step at a Time

**Ny icon:** Brownstone stoop steps, fire escape and rooftop water tower (painted on the backdrop), fire hydrant

**Kulnari lesson:** K12 Rice Terraces (quick, readable, skill not luck), translated to stoop steps as the library suggests. The user's 'slopes of different heights that don't match'.

**Plays:** 1. The tee is at the brownstone's front door, on the top step. 2. Roll the ball off the top step. It drops to a middle landing that leans slightly to one side and has an angled edge, then drops again onto the sidewalk green, where the cup sits beside a painted hydrant. 3. It is all about pace: each drop speeds the ball up, so a soft touch wins.

**Gimmick mechanics:**

Three framed boxes:
- **T1 (tee):** +162 mm, 1.4 m long.
- **T2:** +117 mm, 1.6 m long, cross-tilted 1.5° toward the left (shims). Its downstream lip is skewed 20° to the lane, which kicks the ball slightly sideways as it drops.
- **T3:** +67 mm cup green, 2.8 m long.

The drops are 45 mm and 50 mm, with lips bullnosed to 10 mm radius and carpet wrapped and stapled under. The 95 mm total drop adds about 1.1 m/s of speed potential, so the right tee speed is gentle (about 0.8-1.0 m/s). The cup is 1.2 m into T3, offset 0.2 m to the right of centre. End rail at 2.8 m. Lane 1.0 m clear. The junior tee is on T2.

**Shape and footprint:** Straight, 6.0 × 1.2 m (v3 x 14.8-20.8, z 16.7-17.9). No layout change.

**Direction changes:** 0

**Par:** 3

**Est minutes per group:** About 2.0 min: 4 × about 2.5 strokes × 10 s = 100 s, plus 20 s. Kulnari's terraces were about 20 s a player.

**Skill vs luck:** About 85/15. Pace control; the tilt and the skewed lip are readable.

**Fallback for miss:** A closed lane that only goes downhill, so every ball ends on a lower terrace within reach. Nothing to stall in.

**Build:** Carpenter about 1.0 day. About the same as Broadway (0.75) and much less than Rooftop (+1.5 days). The frames use the standard stack: 95 + 45 + 12 mm, 95 + 12 mm, and 45 + 12 mm. One standard rail frame over all three, with the rail height following each step. About +S$100 of frame timber, offset by dropping Broadway's proscenium, curtain and marquee header (about S$100-150). Volunteers paint the brownstone flat with fire escape and water tower, the hydrant flat, and the step risers in brownstone colour.

**Risks:** The tee box at +162 mm is a step. Use glow tape on all lip and box edges, and a low step-in rail; players can putt standing on the floor beside the open tee side. Lips scuff, so carry touch-up paint and a spare carpet strip.

**Blends with:** A subway exit stair (painted on hole 5's flat) comes up beside the stoop. The stoop's string lights run on to hole 3's tree. The water tower is painted at the same skyline height as the Midtown flats. The rooftop party clock reads 11:59.

**Vs current:** REPLACE. The Broadway or Rooftop choice was never decided, and Broadway's push-through curtain needed its own prototype test. Terraces deliver a user favourite at the same cost, with no mechanism, and keep the Rooftop look as paint.

### 3 The Rink (Midtown)

**Sign:** Break the Ice

**Ny icon:** Winter ice rink under a big Christmas tree, skaters (cut-outs), curling house

**Kulnari lesson:** The user's curling target game, drawing on K08's multi-cup target idea. Research B4 and C2: one shot each, ring scoring, a gentle uphill run-out, knock-outs allowed.

**Plays:** 1. Each player gets one putt down the white rink at the curling house. 2. Your score is the ring your ball's centre ends in: in the button cup 1, inner ring 2, middle ring 3, outer ring 4, short of the outer ring or behind the back line 5. 3. Balls stay where they stop, so later players can knock others out, curling style. 4. It is the quick 'breather' hole in Midtown.

**Gimmick mechanics:** Lane 1.4 m clear × 5.0 m, white needle-punch or felt. Delivery 3.1 m from the tee. The house (rings painted through a stencil) is Ø 1.5 m outer, Ø 1.0 m middle, Ø 0.5 m inner. The flush 108 mm cup is in the centre, 1.25 m before the end rail. A 'snowbank' runs up 5° behind the house for 0.45 m, then a soft backstop: rail faced with 20 mm foam. An overhit ball loses energy on the slope and trickles back to the back rings rather than flying off the rail. A hog line is painted 1.0 m before the house. The junior tee is 1.5 m closer. The ball needs about 1.9-2.1 m/s to reach the button at about 2.7 m Stimp (if the felt is faster, pick up the speed at the prototype).

**Shape and footprint:** Straight, 5.0 × 1.6 m (v3 x 14.1-19.1, from z 19.9; narrowed from 2.6 m). The borrowed tree stands outside the rails, as now.

**Direction changes:** 0

**Par:** 3

**Est minutes per group:** About 1.75 min: 4 shots × about 15 s (wait for each to stop) = 60 s, plus 25 s scoring and pick-up, plus 20 s walking. The fastest hole, which offsets hole 2.

**Skill vs luck:** About 80/20. Pure weight; knock-outs add drama.

**Fallback for miss:** One shot each, so there is no retry loop. The snowbank stops runaway balls. Ring scoring means there is no 'miss' to recover.

**Build:** Carpenter about 0.5 day (unchanged; the snowbank wedge replaces the skater blocks). Rails are painted as white rink boards with a red stripe, as now. The skater cut-outs move outside the rails as a rink crowd. The ring stencil is volunteer-cut. About ±S$0.

**Risks:** White felt speed is unknown: test at the prototype bench. Paint on felt must stay flat (spray thin, test the roll). Score disputes: the rule is the 'ring under the ball's centre', written on the sign.

**Blends with:** The tree lights continue the stoop's string lights. The gold constellation banner over hole 2 extends over the rink. The ice-blue glow sits next to Grand Central's amber. The rink clock reads 11:59.

**Vs current:** UPGRADE. Same rink, tree, boards, sign and colour. The turntable was already cut in route C; curling is the user's favourite and the fastest format on the course.

### 2 Grand Central (Midtown)

**Sign:** Meet Me Under the Clock

**Ny icon:** Concourse info booth with four-faced gold clock, teal ceiling with gold constellations

**Kulnari lesson:** K02: a central blocker on a plinth forces an angle shot without frustrating anyone. The user's 'cup integrated into the design': the cup literally sits under the clock. Research C1: route choice, readable banks.

**Plays:** 1. Putt up the entry lane onto the big octagonal clock floor. 2. The round info booth stands in the centre, right in your line, and the clock on its post rises behind it. 3. Go left or right round the booth and bank off an octagon facet. 4. The cup is behind the booth at the 12 o'clock mark: you meet under the clock.

**Gimmick mechanics:** Octagon 3.0 m across at +67, with 22.5° cut rails as in the pack. The entry lane is 2.0 × 1.2 m with a 1:5 bevel. The booth is a drum Ø 0.70 m × 0.35 m high at the octagon centre, faced with 5 mm EVA and with a cone top so nobody sits on it. The cup is 0.45 m in from the 12 o'clock facet, on the far side of the booth. The two clear lanes round the booth are each about 1.1 m wide (≥ 0.25 m). The 135° facets at 10 and 2 o'clock send a ball arriving along the side of the booth toward 12, so an ace by bank is feasible. The clock hands are painted flat on the floor at 11:59 (no bumpers).

**Shape and footprint:** Entry lane plus octagon, 5.0 × 3.0 m (v3 x 21.4-26.4, z 20.7-23.7). No layout change.

**Direction changes:** 2

**Par:** 3

**Est minutes per group:** About 2.2 min: 4 × about 2.7 strokes × 10 s = 108 s, plus 25 s.

**Skill vs luck:** About 80/20. Bank angles are readable.

**Fallback for miss:** A closed octagon with no gaps. The booth is round, so nothing wedges. A ball that stops on the bevel rolls back to its foot.

**Build:** Carpenter about 0.75 day (unchanged). The screwed-down timber hands are replaced by the booth drum: two 18 mm ply discs with 3 mm hardboard bent round (R 0.35 m), 20 kg of ballast inside, screwed through the green into a plate. The Ø 1 m clock on its post (top about 2.4 m) stays outside the far rail, lined up above the booth from the tee. The backdrop is on the cut list; use the shared constellation banner instead. About ±S$0. Volunteers paint the numerals, hands and the 'Information' band on the booth.

**Risks:** Players may lean on the booth; the cone top and ballast prevent it. Ensure the clock prop outside the rails is braced (≥ 30 kg) because it is the main photo spot.

**Blends with:** The clock at 11:59 faces hole 1's 2027 tower across the walkway: 'one minute to go'. The constellation ceiling banner links it to the rink. The amber glow sits next to magenta.

**Vs current:** UPGRADE. Same octagon, clock, sign and colour. The fixed hands made a fiddly, luck-heavy green. One central booth makes it the real Grand Central picture and a clean route choice.

### 1 Times Square (Midtown)

**Sign:** Drop the Ball

**Ny icon:** Red steps, billboards (invented brands), countdown-ball tower with 2027, plinko 'billboard'

**Kulnari lesson:** The user's plinko (research B4 numbers: 71 mm peg pitch, a 10-15° board, a clear cover). Research C1: the finale is a friendly spectacle, and chance evens out kids and adults. K01: the payoff is visible to the crowd.

**Plays:** 1. Putt up the red steps, a ramp. Too soft rolls back to you. 2. Crest the top and the ball drops into a clear-lidded plinko board, bouncing through ten rows of pegs while everyone watches. 3. It lands in one of five slots marked 3, 2, 1, 2, 3. The centre slot is 'DROP THE BALL' and scores an ace. 4. Your score is any roll-back retries plus the slot number. 5. The ball rolls out to a tray at the tower front, where you pick it up and take it back to the hub.

**Gimmick mechanics:** Lane 1.0 m clear. Tee 0.6 m plus 1.4 m flat. Ramp 1:6, 1.2 m, up to +200 mm: the ball needs ≥ 1.67 m/s at the foot (about 1.9 m/s with drag), so about 2.2 m/s from the tee. The junior tee is at the ramp foot. Crest plateau 0.3 m; side rails narrow it to 0.70 m. The board is 0.70 × 0.72 m at 12°, falling 150 mm. Pegs are 10 mm hardwood dowel, 45 mm proud (above the ball's 21 mm centre), glued 15 mm into the 18 mm ply. Pitch is 71 mm across (clear gap 61 mm, 1.4 × the ball, so no jams) and 62 mm down the board, rows offset 35.5 mm, 10 rows, about 80 pegs. Half-round 'teeth' on the side walls keep the wall gaps at 61 mm (no wedge between peg and wall). A 4 mm polycarbonate lid sits 55 mm above the board on spacer blocks, so the ball cannot hop out and hands stay off the pegs. Five slots of 120 mm clear with 18 mm round-nosed dividers drop the ball into an internal tray that falls 2° to a front pick-up tray on the walkway side. Expected score about 2.2: roughly 30% aces, 45% 2s, 25% 3s, plus about 0.3 retries.

**Shape and footprint:** Straight, 6.0 × 1.4 m (v3 x 30.6-32.0, z 17.4-23.4), tower at the cup end as drawn. Uses about 5.1 m of it.

**Direction changes:** 0

**Par:** 2

**Est minutes per group:** About 2.0 min: 4 × (about 1.3 ramp attempts × 10 s + 5 s watching the drop) = 72 s, plus 30 s cheering and pick-up, plus 15 s.

**Skill vs luck:** About 40/60 by design. Getting the weight up the steps is skill, and where it crests nudges the slot; the plinko is luck. That evens out kids and adults at the finale.

**Fallback for miss:** Too soft rolls back to the player. Every ball over the crest goes through the board and comes out at the tray. The lid lifts off (4 thumbscrews) if anything sticks. There is no cup to miss, and the ball is handed back, which removes the 'hole 1 keeps the ball' conflict.

**Build:** Carpenter about 2.0 days (+0.5 over the 1.5 drawn). The ramp is a framed hump-ramp in place of the 60 mm hump. Board: 18 mm ply drilled through a peg template jig (a volunteer can glue the pegs). Lid about 0.75 × 0.75 m polycarbonate (about S$50). The slot tray box is 45 × 95 framed. Billboards and the about 2.4-2.8 m tower with mirror ball and 2027 neon are as drawn. Optional: a 12 V battery microswitch under the centre slot pulses the neon on an ace (a bonus only). About +S$150. Volunteers paint the red steps, billboards (invented brands), and the slot numbers.

**Risks:** Peg splinter: use sealed hardwood dowel and test 200 drops on the bench. Very hard putts slam the lid: screw the spacer blocks well and use a 4 mm sheet. Polycarbonate needs a fire-rating check. The tower must keep the 0.5 m console sightline (as v3).

**Blends with:** The 2027 tower answers hole 2's 11:59 clock. The neon pulse is the only animated light, at the finale. The billboards face the party floor. It is Midtown's landmark from the hub. The billboard clock reads 11:59.

**Vs current:** UPGRADE. Same tower, billboards, red steps, sign and colour. The plain hump gains the user's plinko as the spectacle, and the ball comes back to the player.

## Difficulty curve

Each district starts and ends at the hub, so each runs its own curve:

- **Downtown:**
  - 10 easy (par 2, teaches the rail)
  - 9 easy (par 2, funnel)
  - 8 hero (ramp plus reveal)
  - 7 mid (bank skill)
  - 6 hero finale (rally hill, social)
- **Midtown:**
  - 5 mid-hero (ramp plus tubes)
  - 4 mid (pace on terraces)
  - 3 breather (one-shot curling, the fastest hole)
  - 2 hero (banks round the booth)
  - 1 spectacle finale (par 2, plinko luck so everyone has a shot at an ace)

Pars: 2, 2, 3, 3, 3 and 3, 3, 3, 3, 2, for a total of 27, unchanged. Each district has two heroes, so a one-district round stays fair. Skill and luck run from about 85/15 (holes 9 and 4) down to 40/60 (hole 1).

The ramp holes (8, 5, 6, 1) need firm putts of about 1.9-2.2 m/s from the tee. Each has a junior tee at or near the ramp foot. House rule on ramp holes: after two roll-backs, kids may place the ball at the top for +1. The 5-stroke cap stays.

## Throughput check

Minutes per group of 4, estimated at about 10 s a stroke plus walking:

| Hole | Min |
|---|---|
| 10 | 2.0 |
| 9 | 2.0 |
| 8 | 2.3 |
| 7 | 2.2 |
| 6 | 2.0 |
| 5 | 2.2 |
| 4 | 2.0 |
| 3 | 1.75 |
| 2 | 2.2 |
| 1 | 2.0 |

- **Slowest hole:** about 2.3 min (hole 8), inside the 2-2.5 min aim and the 3 min ceiling.
- **Spread:** every hole is within about 35 s of the others.
- **Ceiling:** 60 ÷ 2.3 × 4 ≈ 104 players an hour with groups of 4, or about 91 an hour at an average group of 3.5. That covers the 77-90 an hour target with some margin for the stochastic loss the flow simulation shows.
- **Round time:** a 10-hole round is about 21 min plus walking, so about 25 min.

What protects the pace:
- 5-stroke cap.
- One shot each on hole 3. Hole 1 is one ramp putt plus a free drop.
- Hole 6 plays both ends in turns with no walking.
- Every miss returns itself (roll-back, rebound or plinko).
- No reading at the tee: signs readable in 3 s; the hole 5 map is optional.

Marshals float at holes 8 and 5 (the ramp-plus-tunnel holes) and at 6 (to brief 'ends take turns'). Re-time every hole at the 18 Dec dry run and rerun `tools/flow_sim.py` with the measured times. If any hole is over 2.5 min, first move its junior tee closer, then lower the ramp by one framing step.

## Cost and time delta

Estimates only, not quotes. Against route C (plan about S$10.9k, about S$9.8k with the four cuts; about 12 carpenter-days).

**Carpenter prop days, current to proposed:**

| Hole | Current | Proposed | Change |
|---|---|---|---|
| 10 | 0.75 | 0.75 | 0 |
| 9 | 0.5 | 0.75 | +0.25 |
| 8 | 1.0 | 1.5 | +0.5 |
| 7 | 0.5 | 0.75 | +0.25 |
| 6 | 1.0 | 1.25 | +0.25 |
| 5 | 0.75 | 1.5 | +0.75 |
| 4 | 0.75 | 1.0 | +0.25 |
| 3 | 0.5 | 0.5 | 0 |
| 2 | 0.75 | 0.75 | 0 |
| 1 | 1.5 | 2.0 | +0.5 |

That is about +2.75 days. Moving the templated work to a handy volunteer brings it to about +2.0 paid days: stacked-ply arcs (holes 5, 8, 9), plinko pegs and the booth drum. At about S$250 a day that is about +S$500-700.

**Materials** (about +S$0.8k):
- 9 mm and 6 mm bending ply about +S$200
- extra 18 mm and 12 mm ply about +S$250
- polycarbonate lids ×2 about S$110-140
- dowels and EVA about S$40
- frames for the terraces and hill about S$150
- less Broadway's proscenium and curtain, the hot-dog bank wall, 2 cab blocks and 2 wheel cradles, about -S$200

**Lighting** (about +S$0.3-0.5k): ten 24 V totem floods about S$250-300; district festoons S$0-200 if borrowed from the Christmas stock.

**Total:** about +S$1.6-2.0k, so about S$12.5-12.9k before cuts, or about S$11.4-11.8k with the four cuts.

**Getting back to about S$10.9-11.2k:**
- (a) production lends the tee floods (-S$300)
- (b) keep hole 10 straight with 3 wheels (-S$70, -0.25 day)
- (c) no Midtown and Downtown portal flats (not costed above, keep it that way)
- (d) LED neon on hole 1 only (-S$50-80)
- (e) carpet grass everywhere (already the plan)

Contingency (about S$995) should not be spent on this.

**Calendar:**
- The 7-18 Dec window had about 8 carpenter days for nine holes. It now needs about 9.5-10.
- Either book the carpenter for about 2 extra days (14 in total), or use 21-23 Dec buffer days for holes 3, 2 and 10, the simplest.
- Volunteer days rise by about 4-5: template cutting, pegs, terrace painting, bun.
- **Layout and pack rework:** holes 8, 7, 6, 5 and 3 change footprint, so update `tools/make_layout_nyc.py` and `tools/make_carpenter_pack.py` (gap check: the 110 mm channels in hole 5 need an explicit 'tube with lift-off lid' exemption). New pack sheets are needed for 1, 4, 5, 6 and 8. Totem artwork changes only for hole 4 (name and sign).

## Prototype first

**Build hole 5, The Subway, by Fri 4 Dec**, about 2 carpenter days from Mon 30 Nov.

**Why this hole:**
- It carries the course's biggest physics unknown: will a slow ball (0.3 m/s at the platform) make it round a 0.25 m hairpin with a 2-4° fall, or does wall scrub stop it? Hole 8's turning tunnel depends on the same answer.
- It also contains every standard detail G2 was meant to test: a run of rail with plates and corner joints, a +67 raised green with bevel, a flush cup, and a 1:6 ramp.
- It replaces hole 7 or 10 as the G2 sample at no extra cost.

**Pass criteria:**
1. 30 of 30 balls through each loop from a dead-slow crest, none stopping, exit ≥ 0.5 m/s.
2. No hop-outs at a full-power putt (about 3 m/s) with the lid on.
3. Lid off and back on in under 20 s.
4. A group of 4 clears the hole in ≤ 2.5 min.
5. Rails don't move when kicked.
6. A ball dropped at the cup edge stays in.
7. A Stimp reading of the carpet grass (target 2.4-3.0 m) to tune holes 6, 1 and 3.

**Volunteer bench samples the same week:**
- a 3-row plinko strip (200 drops, any jams or splinters)
- a 0.6 m hill skin with an R 600 transition and a 150 mm crest (tune H for hole 6)
- a 45 mm terrace lip
- a 1.2 m bent-ply curved rail
- a white felt speed strip

**If the loops fail:** raise the entry to +147 mm, open r1 to 0.30 m, and retest on Mon 7 Dec. Final fallback: the drawn three straight tunnels.

## Open questions

1. Was the hole list frozen at G1 on Wed 25 Nov? If so, the project lead must approve this change set. Hole 4 was still open either way.
2. What is the budget ceiling? This design is about S$11.4-11.8k with the cuts, about S$10.9-11.2k with the extra savings listed. Is +2 carpenter days (about 14 in total) bookable?
3. Will the team accept the format changes:
   - two-ended rally play on hole 6
   - one-shot ring scoring on hole 3
   - plinko slot scoring on hole 1
   - balls returned at hole 1's tray
4. Floor flatness. The terraces, the hill cross-fall and the loop falls all assume the floor is level to about 3 mm over 2 m. Measure it, or budget shims.
5. Fire rating for polycarbonate lids, felt, the EVA facing and festoon lights. The venue's requirement is still unknown.
6. Can production supply the 30-50 lux warm house wash, and lend the tee floods, festoon lights and RCD boards?
7. Run layout v4: holes 8 and 7 as L shapes (hole 7 starting at x 17.9), hole 6 with access at both ends and ≥ 1.5 m from the hub, hole 5 shortened.
8. Accessibility. Hole 4's +162 mm tee box and the 1.9-2.2 m/s ramp putts for small children. Should every ramp hole have a junior tee at its foot (as specified)?
9. Should the unused moving-part allowance stay unused? Recommended yes, for robustness.
10. Hole 5 line symbols and the totem 'bullet': confirm the invented shapes (star, ring, diamond) rather than the circled letters and numbers of real subway signage.
