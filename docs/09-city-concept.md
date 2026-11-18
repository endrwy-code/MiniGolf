# The city: look, layout, flow and story (draft v1, 18 Nov)

**Status:** Claude's response to the team's direction of 18 Nov. Everything here is a recommendation for the team to decide, not a decision. Measured values are marked as measured; everything else is an estimate. Hole mechanics and build standards stay as in [`03-hole-spec-sheet.md`](03-hole-spec-sheet.md) until the team changes them.

## What the team asked for (18 Nov)

1. Make the course look more like the Pixar Putt photos (`reference/user-refs/01`, `04`, `05`).
2. The holes and props should work together to look like a city, almost a utopia: coherent and interesting to look at, not a straight line, so people are drawn in to play.
3. Neon or not: whatever fits best.
4. Each hole should be interesting to play: a gimmick that balances fun with taking a fair amount of time.
5. A story that works in any order, so groups don't have to play in sequence and more people can play at once.

The team also corrected a fact: the central strip is a **raised runway that is part of the stage**, joined to it in the shape of a cross.

## The short version

| Idea | Verdict | Why |
|---|---|---|
| A city, not a straight line | **Right, and affordable** | Coherence comes from a repeated frame, layered heights and a clustered layout, not from more props. The v1 layout is a line mainly because Zone A is a 46 × 11.6 m strip. |
| Look like Pixar Putt | **Copy the method, not the scale** | It's an 18-hole licensed touring attraction built to run for months. Its look comes from a few cheap principles we can copy. Its characters we can't. |
| Neon or not | **Not neon** | The references are bright colour lit from above. Neon and UV only pay off in a properly dark room, and a dark room full of people with putters and platform edges is harder to make safe. |
| A story that works in any order | **Right** | That's how the reference works: one film per hole. It also lets groups start on any hole. |
| Free order raises capacity | **Partly right, for a different reason** | No order can beat the slowest hole. Free order gains by filling every hole at once and letting groups take whichever hole is free. A loop you can start anywhere gets most of that, without people wandering. See section 4. |
| Holes that take "enough" time | **Careful** | Every extra minute per hole means fewer players an hour. Aim for every stroke to be interesting, not for more strokes. |

## 1. What makes the reference look like a city

From the decoder ([`02-reference-decoder.md`](02-reference-decoder.md), photos 4 and 5):

1. **The frame repeats and the content varies.** Same platform edge, same totem, same umbrellas on every hole. Only the inside of each platform changes. This is the main reason it looks like one place.
2. **Heights are layered:** ground, platforms, props, totems, umbrellas, lighting towers. The top layers form a skyline.
3. **The holes are clustered and turned at different angles,** with wandering walkways, so you see several holes at once and each from more than one side.
4. **The ground joins everything up** (paving or turf between holes).
5. **At night, light from above defines the space.** No neon.
6. **One self-contained idea per hole.**

All six are about layout, repetition and lighting. None needs expensive props.

## 2. The look: "Bright City" (replaces Neon Countdown as the recommendation)

| Layer | Bright City | Why |
|---|---|---|
| Frame (the same on every hole) | One fascia colour and one rail cap on every platform; one totem design (a "street sign" post with a big number) | The repeated frame is what makes ten different holes read as one city |
| Playing surface | Green turf with bold painted or vinyl inlays (roads, water, zebra crossings) | Bright, readable, photographs well; painted inlays save turf |
| Ground between holes | The floor becomes the streets: taped or vinyl road markings, with zebra crossings at walkway crossings. Cable ramps can be painted as zebra crossings or speed bumps | Joins the holes into one place and makes the safety items part of the theme. Check the floor finish and tape rules with the venue |
| Height | 10–14 painted skyline flats (flat city silhouettes, 2.4–3.6 m tall, on weighted bases) along the outer edges; landmark props (clock tower, Ferris wheel) above head height | Above-head-height elements are what people see across a crowded room. Flats are the cheapest way to get height: one sheet each, painted |
| Light | Production focuses part of the rig on the golf zone; warm festoon strings above the walkways if rigging allows | Copies the reference at night. LED strip only on platform edges for trip safety, plus a few signature glows (clock face, skyline windows) |
| Colour | One palette for the whole city: for example warm cream, brick red, teal, golden yellow and a night-blue sky on the flats | One palette across many objects reads as designed; ten unrelated palettes read as a fairground |

**What it depends on:** production agreeing to light the golf zone. That's the question to take to them now, instead of "how dark is the room?"

## 3. Where the city goes: the runway changes the layout

What the runway means (geometry in `floorplan/auditorium-dimensions.json`):

- Nobody can walk across it, so the two floor halves only join **beyond the runway tip**, between the runway end (about x 31.2) and the booth.
- The floor near the runway and stage is where the crowd will gather for the countdown. Golf there would compete with the show.
- The screenshots show a dotted outline that may extend the runway by about 8.6 m toward the booth (estimated). Nobody has confirmed it.
- The team says the stage and runway form a cross. The screenshots show no cross-arm along the runway, so its position and size are needed.

_Layout options and a to-scale draft are being added (zone areas, fit check)._

## 4. Play order and capacity

_Capacity simulation results are being added (fixed route vs start-anywhere loop vs free order)._

## 5. The story: ten places, one moment

**Idea (for the team to shape):** a city at 11:59 pm on New Year's Eve. Every hole is a different place in the same city at the same minute, all getting ready for midnight. Because everything happens at the same moment, there's no "first" or "last" chapter. You can start anywhere and still get the whole story. The skyline, palette and street ground tie the places together. The clock tower is the landmark you can see from every hole: a tall skyline flat with a lit clock face stopped at 11:59, standing behind hole 2.

The hole mechanics in spec v1 already fit. Only the skins change:

| # | Mechanic (spec v1, unchanged) | City place (proposal) | Notes |
|---|---|---|---|
| 10 | Straight lane with a hump | **Speed Bump**: a street with a zebra crossing | The hump becomes a literal speed bump |
| 9 | L-shape with a 45° bank wall | **The Bank**: bank off the bank's front wall to turn the corner | Pun for the sign |
| 8 | Rotating blades with a tunnel | **The Ferris Wheel**: putt under the turning wheel at the waterfront | Same build as the windmill; a city landmark instead of a farm one, and tall enough to be seen |
| 7 | Pin field with bumpers | **Rush Hour**: pins and blocks become traffic | Chaos is fun and quick |
| 6 | Three tunnels | **The Subway**: three train lines, one is the express | Choice and risk |
| 5 | Ramp to a raised green | **The Rooftop**: climb to the rooftop party | Needs side guards |
| 4 | Dogleg through a building tunnel | **The Station** (was the barn) | Same build as the barn |
| 3 | Bridge over a moat to an island green | **The Harbour** | Painted water |
| 2 | Clock-face green, hands at 11:59 | **Clock Tower Square** | The landmark and photo spot |
| 1 | Lane under an arch; cup keeps the ball | **Midnight**: the 2027 gate | Still collects balls if the route ends here |

If the team wants a faith link, two verses fit a city and a new year: "A city set on a hill cannot be hidden" (Matthew 5:14) and "Behold, I am making all things new" (Revelation 21:5). Whether to use them is the team's decision.

**What happens to the backyard reference:** the windmill and barn turn into the Ferris wheel and the station. The mechanics, cost and build stay the same.

## 6. Gimmicks: make every stroke interesting, not add strokes

**The time budget:** a group of 4 takes about 2–2.5 minutes per hole, so a 10-hole round takes about 20–25 minutes. That's a satisfying length for a party activity. Making holes longer doesn't make them more fun, and it directly cuts how many people get to play. The slowest hole sets the pace for the whole course, so **keep every hole within about 30 seconds of the others** and time each one at the dry run.

| Gimmick type | Example | Fun | Time | Use |
|---|---|---|---|---|
| **Choice** (risk and reward) | Subway tunnels, a short route past a hazard | High: every player decides | Neutral | Several holes |
| **Chaos** (luck evens out skill) | Rush Hour pins, bumpers | High: surprise, kids can beat adults | Neutral | 1–2 holes |
| **Timing** | Ferris wheel blades | High to watch | Adds waiting | **One hole only**, and still playable if the motor stops |
| **Skill with a fallback** | Rooftop ramp with a gutter that returns a weak shot | Medium to high | Slightly more | 1–2 holes |
| **Reward you can see** | Cup triggers a light or bell (battery microswitch) | High for players and anyone watching | Neutral | Clock tower and Midnight; it also draws people in |

**Avoid:** precision gates with no fallback (repeated failures, frustration and slow holes), anything a marshal has to reset after each group, loops or drops that hide the ball, and holes longer than about 6 m. The 5-stroke cap stays.

**What draws people in, in order of strength:** things above head height (skyline flats, Ferris wheel, clock tower); movement (the wheel turning); light; and seeing other people play and react. Face the most watchable holes toward where the party crowd stands.

## 7. What it adds to the cost (estimate)

Compared with v1 in [`08-budget-model.md`](08-budget-model.md):

| Change | Materials (S$, estimate) | Person-days (estimate) |
|---|---|---|
| 10–14 skyline flats (about 1–1.5 plywood sheets each, painted, weighted bases) | +1,000 to 2,000 | +10 to 14 |
| Street graphics on the floor (tape or vinyl) | +300 to 1,000 | +2 |
| Festoon strings, if rigging allows | +200 to 600 | +1 |
| LED strip cut back to safety edges and a few glows, if production lights the zone | −600 to −1,500 | −3 |
| Skins change (windmill to Ferris wheel, barn to station) | about the same | about the same |
| **Net** | **about +0.9k to +2.1k** | **about +10 to 14 (+8–12% on about 120)** |

A cheaper lever exists: 2 hero props instead of 4 (section 5 of the budget model) more than pays for the skyline.

## 8. To decide by G1 (Wed 25 Nov)

1. **Bright City as the art direction?** (replaces the Neon recommendation)
2. **Where the course goes:** Strip, Plaza at the runway tip, or U around the runway (section 3). Needs production's answers on the countdown audience area, booth sightline, runway extension and cross-arm.
3. **Play format:** fixed route, or a loop you can start anywhere (section 4).
4. **Story:** "ten places, one moment", another idea, or no story. Then the hole names.
5. **Questions for production this week:** can you light the golf zone? Is the runway extension being built? Where is the cross-arm? Does the booth need a clear sightline down the middle of the room? Where do guests come in?
