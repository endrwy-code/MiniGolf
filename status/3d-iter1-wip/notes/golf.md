# Play mode and sprint (27 Nov, cloud session)

The team asked for: a sprint on Shift, the holes playable with putters and a ball, and an explanation of how each hole is meant to be played (which they will refine).

## What was built

- **Sprint** (`base-v2.html` and the doc 10 page `status/countdown-golf-3d.html`): hold Shift while walking (or latch RUN beside the touch pad). Sprint speeds are child 4.0, adult 5.5, tall 6.0 m/s, against walking speeds of 1.1–1.45 m/s. The speed eases in over about half a second, the view widens up to 8° (not with reduced motion), and the step bob gets longer and deeper.
- **Play mode** (`extra-golf.js`, inserted by `assemble.py` after the scenery): the ⛳ corner button, "Play this hole" on the hole card, the drawer's "Play golf" section, or F at a tee while walking. You get a golfer (your walking body) with a putter, the ball on the tee, aim dots, a speed bar in m/s, a scorecard (this browser only), and a five-stroke cap (doc 07). Controls are A/D or ◀ ▶ or dragging to aim, W/S or the bar for speed (Shift for fine steps), Space or PUTT to hit, V for the top view, R to restart and Esc to stop.
- **Rules per hole:** 9 is one shot, curling style, scored 1–4 by where the ball's centre stops, with the group's other three balls already putted (random 2.0–2.6 m/s) so knock-ons happen. On 7 a rival putts from the far end with your first shot, at the same moment. On 1 the score is roll-backs plus the slot (3·2·1·2·3). Everywhere else, strokes count.
- **Test hook:** test builds expose `window.__golf.putt(n, {v, dAng, ang, from, tee, trace})`, which returns where the ball ends up. Scripts used: a speed sweep, an angle × speed grid, a 200-putt Monte Carlo for hole 1, and a trace.

## Physics (model, not a rig)

- The ball is Ø42.7 mm and collides with every triangle of the hole's own meshes, so there are no hand-made colliders. Triangles sit in a 0.1 m grid in plan, at 1/600 s steps.
- Skipped as flush: the cup mask, the floor halo, Circle and Ring decals (the cup's steel lip) and the 8 mm tee mats. A junior mat in the middle of hole 9's lane used to launch the ball. The 10 mm rubber catch ring on 7 stays solid.
- **The cup:** the deck top runs over the cup in the model, so contacts inside the 108 mm opening are ignored and the ball meets the sleeve's edge. A ball that has sunk 12 mm is holed. Capture and lip-outs come out of the geometry; there is no capture-speed rule.
- **Rolling ball:** angular momentum about the contact point carries over, so v_t' = (5 v_t + 2 s) / 7, where s is the spin's surface speed along the new direction. This gives a pivot over steps and lips, 5/7 of a slope's pull, and the classic rolling-ball rebound off a rail: the perpendicular part comes back at (5e − 2)/7, so a rebound is steeper than a mirror. The ball leaves the putter already rolling, the same sense as doc 14's speeds.
- **Drag:** 0.6 m/s² on carpet (doc 14), and 0.15 m/s² on hard faces. Every turf or carpet material has roughness 0.9 or more; the loop floor (0.7), plinko board (0.6), wave bank (0.55) and oven gutter (0.8) count as hard.
- **Rails:** restitution 0.72 and wall friction 0.12 × the normal impulse. Hole 2's lacquered face is 0.8 and 0.04; hole 5 is 0.62 and 0.17, the review's scrub; hole 1's pegs are 0.65 with random scatter.
- **Anti-balance nudge:** a ball resting on a slope that should roll it (a peg crown) gets a 3 cm/s sideways nudge, alternating sides, up to 60 times.

## Checks against doc 14 (sweeps from the tee along the default line)

| Hole | Model | Doc 14 |
|---|---|---|
| 7 | crests from 2.1 m/s, cup 2.3–2.6, runs over from 2.8 | crest about 1.8 at the foot, 2.2–2.35 from the tee |
| 9 | crests at 2.2, 2 points at 2.3, centre 2.4–2.9 | crust about 1.2 at the foot, centre about 2.3 |
| 8 | crests the kerb at 2.1, aces 2.5–3.0 (straight only) | 2.2–2.4 |
| 1 | crests at 2.3 | 2.3 from the new tee |
| 3 | reaches the portals from 2.5 | about 2.5 from the tee |
| 10 | aces only started 3–4° up the sag, 2.7–3.2 | 2.4–2.5 |

## Findings for the team (model results; the 3 Dec rigs decide)

1. **Hole 2:** aces only from wall shots about 20–40° either side of the straight line. A rolling ball's spin brings its rebound off steeper than a mirror, so "aim anywhere off the wall" overstates it. This adds to M7's rebound-scatter point.
2. **Hole 1, crest:** a ball can stop on the 3° crest. On carpet, 3° can't restart a stopped ball: it needs about 5° (5/7 g sin θ > 0.6 m/s²), or a hard face as on hole 9's oven. In the model, fast balls bounce back off the first pegs onto it, about a quarter of putts that reach the board. Doc 14's "every ball that crests is in play" assumes it rolls on.
3. **Hole 1, jam:** the builder's last-row outer pegs (v ±0.284) and the 2|3 divider noses (v ±0.24, Ø30) leave a 24 mm pocket that holds a 42.7 mm ball: about 17% of drops in the model. Keep that gap at 61 mm or more, or closed, in the factory drawing. The descent also takes about 8 s in the model.
4. **Hole 3:** the loop only runs because its floor is hard. With carpet drag the ball stalls at doc 14's 3–4° average path slope, so specify a hard loop floor. Putts started 2–8° toward the outer funnel rail can roll all the way back down and off the open tee end.
5. **Hole 5:** a ball on the leg's centre line hits the R 0.9 outer corner at about 30° and loses about 70%. It has to arrive along the outer rail to ride it, which is where the review's 25–30% figure applies.
6. **Hole 8:** the bun's 13° faces don't re-centre an off-line ball onto the 108 mm cup. In the model only near-straight putts drop (within about ±1°), so doc 14's "aces over about 40%" looks optimistic.
7. **Hole 10:** works as designed: the sag bends the ball and the ace needs a line up the slope.

## Files

- `extra-golf.js` (new), `base-v2.html` (sprint; loop, picking, card and `enterWalk(at)` hooks; `golfInit()`; a "Play it" bullet), `assemble.py` (the test hook exposes `window.__golf`).
- `status/countdown-golf-3d.html` (doc 10 page): sprint only.
