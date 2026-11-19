# The auditorium from photos (19 Nov 2026)

The team shared six photos of the auditorium in use: five from services (a wide shot from a back corner, one from the middle of the crowd, three from the stage) and one from a 2020 event with the house lights on and the floor nearly empty. This note records what they show, what I estimated from them and how, and what that changes for the golf. Everything here is an **estimate from photos, not a measurement**: build to none of it until someone tapes it.

The photos aren't stored in the repo, because they show identifiable people. If the team wants them kept, crop or blur the people first.

## The short version

| What | Estimate | Range | How sure | What it was before |
|---|---|---|---|---|
| Stage front to the back wall | **≈ 37 m** | 34–40 m | Medium | 48.7 m (the old cable plan's 54.7 m room, minus the 6 m stage placeholder) |
| Golf limit to the back wall ("other activities") | **≈ 10 m** | 7–13 m | Medium | 21.7 m |
| Floor left for other activities, after the console | **≈ 220 m²** | 150–300 m² | Medium | ≈ 555 m² |
| Height to the black ceiling structure | ≈ 7.5–8 m (8.5 m used for the ceiling deck) | 7–9.5 m | Medium-low | Not drawn |
| Side lighting trusses | ≈ 5.8 m up, along both side walls | 5.3–6.2 m | Medium | Not drawn |
| Long delay screen over the runway | Underside ≈ 3.5 m, ≈ 2.2 m tall | 3.2–4.5 m | Medium-low | Not drawn |
| Round surround speakers on both side walls | ≈ 3.7 m up | 3.4–4.2 m | Medium | Not drawn |
| Stage and runway deck height | ≈ 0.9 m | 0.8–1.0 m | Medium | 0.8 m placeholder |
| Runway's white top, width | ≈ 2.0 m in the photos | 1.9–2.2 m | Medium-low | 2.4 m measured: **kept** |
| Stage depth | More than 6 m, maybe 9–12 m | — | Low | 6 m placeholder: **kept** |

The model and the plan now use a 43 m room: the 6 m stage placeholder plus ≈ 37 m. The old cable plan's 54.7 m is kept in `floorplan/auditorium-dimensions-v1-cable-plan.json`.

## How I got there

### Using the room's own rulers

A photo has no scale on its own. You get one from things whose size you know, and from the fact that parallel lines meet at a vanishing point on the horizon, which always sits at the camera's height.

- **The runway** is the best ruler: 22.54 m long and 2.4 m wide (both measured). In the three stage-view photos you can see it from root to tip, so the shrinking of its width with distance gives depth.
- **People** are rough rulers: about 1.6–1.7 m for an adult. Where a person stands on the runway or the floor, the gap between their feet and the horizon tells you the camera's height above that surface, without knowing the lens.
- **A door** is a ruler too: about 2.1 m high. The 2020 photo shows doors in a side wall with the house lights on.

### Camera heights (why things "look" further or closer)

| Photo | Camera position | Camera height | How I know |
|---|---|---|---|
| Stage views, looking down the runway | On the stage, behind the band | ≈ 2.45 m above the deck (≈ 3.35 m above the floor) | Two performers on the deck: their heights only work out with the camera there |
| Wide shot, back corner | Near the back wall on the LF-platform side, looking diagonally at the stage | ≈ 4 m | The surround speakers (≈ 3.7 m) sit just under its horizon |
| Middle of the crowd, facing the stage | Held up above the crowd | ≈ 2.2 m | The singer at the stage front: feet against the horizon |
| 2020, house lights on | On a raised spot on the LF-platform side | ≈ 3.5 m | A side-wall door (≈ 2.1 m) and people standing: both give the same height. The long screen's bottom edge lies on its horizon, so the screen's underside is at ≈ 3.5 m too |

A high camera makes the floor look deeper and the room look longer than it feels at eye level. A wide lens stretches the edges. Both were taken into account above.

### The back of the room

Three separate clues point the same way:

1. **The sketch is drawn close to scale.** Across the width it runs at about 41 px per metre, and along the 27 m to the golf limit at about 37 px per metre. At that scale the back wall is about 9.7 m past the golf limit, and the console's front about 6 m past it.
2. **The stage-view photos.** With the camera height from the performers, and the runway tip at a measured 22.54 m, the back of the crowd (right in front of the console) comes out at about 29–34 m from the stage front, depending on where exactly the horizon sits. The console sits behind that, against the back wall.
3. **Things on the back wall.** The confidence monitor hung over the console, if it's a standard 85-inch screen, comes out about 36–37.5 m from the stage front. The two inner exit signs on the back wall, if mounted at about 2.3 m, come out about 37–39 m from the stage front.

The old cable plan put the console about 20.7 m past the runway tip (about 16 m past the golf limit). That plan already had the width (27.1 vs 25.6 m) and the runway length (25.2 vs 22.54 m) wrong, so I've given it the least weight. **One tape measurement settles it: golf limit to the back wall.**

### The runway's width

On the stage-view photos the two performers come out at about 2 m tall if the runway is 2.4 m wide, and at a normal 1.62 m and 1.67 m if its white top is about 2.0 m wide. Both performers are standing on the deck, so they agree with each other. I kept the measured 2.4 m in the model and plan. Worth checking: does the 2.4 m include the black skirt, the stair units or the speaker-stand bases? A 2 m runway is common, because stage decks come 2 × 1 m. The golf clearances (≥ 1.75 m from the runway) are measured from the 2.4 m edge, so a narrower runway only adds room.

## What the room looks like, wall by wall

| Part | What the photos show | In the 3D model |
|---|---|---|
| Floor | Light grey, smooth, a little glossy | Light grey with a faint mottle |
| 11.65 m side wall | Navy-black acoustic panels; a row of round black surround speakers; two doors with green exit signs; blue wall-wash lights near the top during services | All of these. The doors are placed at about x 16–18 and 23–25 m: guessed, ±3 m |
| LF-platform side wall | A long glazed band at floor level looking into a lit room (foyer or overflow?) in the middle stretch; beige diamond-quilted acoustic panels toward the back; surround speakers; an exit door near the back corner | Glazing from about x 9 to 31 m, quilted panels from about x 31 m to the back wall: extents guessed |
| Back wall | Black drapes; the sound console on a riser with lit desks and a camera on a tripod; a confidence monitor with a red clock hung above it, facing the stage; four exit signs across the back | Drapes, the console, the monitor and clock, the two doors from the sketch |
| Ceiling | Black, exposed ducts and beams, a grid of black cylinder downlights hanging below it | All of these, at about 7.6–8.5 m |
| Rig | Box trusses along both side walls carrying white LED batons (the white dashes in the stage photos), moving heads and blue wall washers; trusses over the stage and across the room; line arrays at the ends of the LED wall; one more confidence monitor hung mid-room on the 11.65 m side | All of these |
| Stage | Glossy pale grey deck, black fascia, a light-blue LED strip along the front edge, wedge monitors, a trap outline; a wide blue LED wall upstage with two portrait screens each side (inner ones hung, outer ones standing near the curved corners), orange type on blue | All of these. Screen content is a placeholder in the same style ("COUNTDOWN 2027") |
| Runway | Glossy white top, black skirt; black side stairs with four risers and pale nosings | All of these; the stairs are drawn 1.0 m deep (estimated) |
| Delay screen | A long LED screen hung along the room over the runway, lit face toward the audience, an unlit lattice section at the back end | Double-sided, x 8–24 m plus a 3.4 m lattice tail. Which way each face points is the least certain thing here |

## What this makes more possible

- **Production can light the golf from what's already there.** The side trusses run right over both golf districts at about 5.8 m, with moving heads and LED batons. A warm wash on the districts (the party-glow proposal) is a focus-and-colour job for the lighting operator, not new rigging. Ask for two to four fixtures per side truss pointed straight down on the holes.
- **The LED glow will look better than planned.** The room is black (walls, ceiling, drapes) and the floor is light and glossy, so each hole's deck-base LED will reflect in the floor and the outline will read from across the room.
- **Height is fine.** Wall tops at about 7.5–8 m and side trusses at about 5.8 m leave at least 2 m over the tallest props (3.6 m). The only low thing is the delay screen (underside ≈ 3.5 m), and it hangs over the runway, where no hole goes.
- **The stage is a free backdrop.** The stage screens already run blue with bold orange type. A "New York countdown" content file for the LED wall and portrait screens would tie the course to the stage at no build cost.
- **There's already a clock.** The confidence monitor over the console carries a red LED clock. It could run the countdown for the stage, and the "find the 11:59" game could point to it.
- **Floor graphics will work.** A smooth, light, sealed floor takes vinyl street markings well (check the venue allows them and that they peel clean).

## What this makes less possible, or adds work

- **The party side is small.** At about 10 m deep, minus the console, there's roughly 220 m² for other activities, not 555 m². The Tee Booth's queue lanes, any other activities and the countdown crowd won't all fit there. The countdown crowd will probably need the golf zone too, so either the golf closes and is roped off or cleared before midnight, or the crowd stands among the holes. This turns the open question "does movable mean cleared before midnight?" into a likely yes for at least some holes. Decide it with production.
- **Two exits in the 11.65 m wall.** Where I've guessed them, the street-sign totems of holes 7 and 6 would stand about 1.7 m in front of them, and the skyline flats would have covered them. Exits and their signs must stay clear. The model now leaves gaps in the flats at the doors. Once the doors are measured, move the two totems (or the holes) so each exit has a clear path at least as wide as the door.
- **Don't fix anything to the walls.** The side walls are acoustic panels, one stretch is quilted fabric, and one is glass. Skyline flats must be free-standing, on weighted bases, as already planned.
- **The glass band looks into a lit room.** On the LF-platform side, skyline flats would cover the windows. That's fine for the look, but check whether the room behind is used on the night (an overflow room or an entrance needs its view or its door kept).
- **The stage set is busy and bright.** At eye level the blue LED wall and the delay screen dominate the view toward the stage. Hole signs facing the stage will compete with it; keep them facing the players.
- **Haze.** The services run haze, which makes beams and LEDs look great but hides the floor and the ball. Ask production to keep it light, or off, while golf runs.

## What to measure next (about 20 minutes with a tape and a laser measure)

1. Golf limit to the back wall, along the room's centre line and along one side.
2. The two exit doors in the 11.65 m wall: distance of each door's edges from the stage front, and their widths. Same for the exit near the back corner on the LF-platform side.
3. Runway: width of the white top, width including the skirt, and its height. Stair units: how far they stick out.
4. Heights, with a laser measure: the bottom of the side trusses, the delay screen's underside, the ceiling structure.
5. Stage depth (stage front to the back wall behind the LED wall).

Update `floorplan/auditorium-dimensions.json` with the answers, then re-run `python3 tools/make_floorplan.py floorplan/auditorium-dimensions.json floorplan --png` and `python3 tools/make_layout_nyc.py floorplan/auditorium-dimensions.json floorplan --png --inject status/countdown-golf-3d.html`. The 3D model's room constants (`ROOM_L`, `CEIL`, `TRUSS_Y`, `DELAY`, `SIDE_DOORS`, `GLASS`, `QUILT`) sit near the top of its script.

## What changed in the files

- `floorplan/auditorium-dimensions.json`: room length 43 m (estimated), console at x 39–43 m, stage and runway heights 0.9 m, side-wall doors, and a `photo_estimates` block. Every new value is labelled "estimated from photos".
- `floorplan/auditorium-simplified.png` and `layout-v3-nyc.png`: redrawn on the shorter room.
- Layout v3: with the console 11.7 m closer, the assumed console sightline got wider near the golf limit, and hole 1's 3.6 m tower came within 0.42 m of it (the rule is 0.5 m). Hole 1 moved 0.15 m toward the LF-platform wall. All clearance checks pass again; the tightest is now that tower at 0.57 m.
- `status/countdown-golf-3d.html`: the room rebuilt as above; the scale figures removed so you can walk anywhere; party glow a little brighter; new camera views "From the console" and "Back corner" (roughly where the wide service photo was taken); a Show toggle for the lighting rig and screens.
