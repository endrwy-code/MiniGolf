# Countdown party mini golf: project memory

Claude Code loads this file at the start of every session. Cloud sessions start from a fresh clone of this repo, so anything not committed here is lost. When a decision is made or a fact changes, update this file and the decision log in the brief, then commit and push.

Full background, floorplan decode, research and sources:
@docs/project-brief.md

## Goal

A 10-hole indoor mini golf course for the HOGC countdown party on 31 December 2026, set up in the auditorium. One-off event: best value that still looks custom and plays well on the night. Durability beyond one event is not a priority.

## Decided by the team

- Event: countdown party, 31 Dec 2026.
- Use: one-off event.
- Size: 10 holes.
- Format: one night only; temporary and movable (flat-pack style); no permanent install; no reuse planned (17 Nov).
- Design brief (18 Nov): the holes read together as one coherent "city", not a straight line; each hole is interesting to play; the story works in any order. Look like the Pixar Putt references (method, not characters). Neon optional.
- Fact (18 Nov): the central strip is a raised runway, part of the stage; stage plus runway form the cross (no extra cross-arm). Players can't cross it.
- Golf zone (18 Nov): the mini golf stays on the stage side of a line 27 m from the stage front (4.46 m past the runway tip). The floor beyond that line is left for other activities. See `floorplan/auditorium-simplified.png`.
- Design direction (18 Nov, later): New York on countdown night, with a Times Square feel (New York buildings and culture). Holes in the style of `reference/user-refs/07` (hot dog: oversized everyday objects and a pun sign) and `08` (bicycle wheels: found objects). Lighting like `06` (Electric Greens): coloured LED glow, but the room stays light enough to see. Every hole interesting to play and to look at, well thought out and robust.
- Fact (18 Nov, the team's tape measurements on a hand sketch): these replace the cable-plan geometry. Width 25.6 m (rough), made up of 11.65 m (top wall to runway) + 2.4 m runway + 10.25 m (runway to LF platform) + 1.3 m LF platform depth. Runway 22.54 m from the stage front to its tip. The box at the back is the sound console. On each side of the runway there are stairs nearest the stage, then two speaker stands that stick out 51.5 cm. The stage's front corners curve round to the side walls. There are doors or exits in the back wall on either side of the sound console. Positions and sizes the team did not measure are listed under open questions.
- Fact (20 Nov): the delay screen over the runway is two screens hung parallel to the runway, one over each edge (≈ 2.4 m apart), back to back: one faces the 11.65 m-side half, the other the LF-platform half.
- Fact (23 Nov): the team's only marketplace account is Taobao, which also signs in to Tmall and 1688. No Pinduoduo or Alibaba.com account; the round-2 brief and doc 14 are written for this.
- Team's view (20 Nov, not measured): the room is much longer past the golf limit than the 19 Nov photo estimate ("maybe twice as long"). Working estimate: back wall ≈ 47 m from the stage front, ≈ 20 m past the golf limit.

## Recommended, not yet decided

These came from Claude's research in claude.ai. Treat them as proposals until the team confirms.

- Hybrid build: buy only the turf (prefer local stock; import only if delivery by about 4 Dec is guaranteed in writing); a local set builder makes bases, borders and obstacles from plywood or hard-coated foam. See `docs/04-sourcing.md`.
- Art direction "New York Countdown" (18 Nov, later; replaces the Bright City recommendation, following the team's New York direction): the same ribbed rail, white cap and New York street-sign totem (green street blades plus a subway-style bullet) on every hole; each hole has its own LED colour at the deck base and under the rail cap; one neon-style pun sign per hole; skyline flats on both side walls; a dim warm wash from the rig, not a blackout. No real logos or trademarks. See `docs/10-new-york-concept.md`. Bright City (`docs/09-city-concept.md`) and the earlier options (`docs/02-reference-decoder.md`) are kept for reference.
- Ten New York holes, countdown order: 10 Bike Lane, 9 Hot Dog Cart, 8 The Big Apple, 7 Gridlock, 6 Liberty Island (Downtown); 5 The Subway, 4 Rooftop, 3 The Rink, 2 Grand Central, 1 Times Square (Midtown). Mix 4 hero (8, 6, 2, 1) · 4 mid · 2 simple, two heroes per district, ten different mechanics, one moving part (the rink turntable, optional). Every hole has a fallback for a miss, no loose props, no place a ball can stop out of reach. Story "11:59 in New York", with a "find the 11:59" game on every hole. A bench of eight more ideas. See `docs/10-new-york-concept.md`; `docs/03-hole-spec-sheet.md` still holds the build standard.
- Layout v3 (`floorplan/layout-v3-nyc.png`, from `tools/make_layout_nyc.py`): two districts beside the runway, each looping back to one hub (the Tee Booth) in the strip past the runway tip; about 6.5 m kept clear in front of the stage; hole 1 runs along the golf limit with its tower facing the party. The script checks every clearance (holes ≥ 1.2 m apart, ≥ 1.75 m from the runway, walkways ≥ 1.2 m, tall props outside the assumed console sightline). Positions are ±1 m until the stage depth and stair positions are measured. Earlier layouts (v2 plaza, zone options, v1 Zone A) are superseded and kept for reference.
- Ops: 5-stroke cap; groups start at any open hole and play their district in order; at most about 12 groups on the course; one district per group when the queue is long (≈ 2.3× capacity); balls handed back at the hub; about 7–9 volunteers per shift. See `docs/07-operations-and-safety.md`.
- Rental (18 Nov research, merged 27 Nov): nobody in Singapore or Malaysia rents a full themed course, only single carnival putting lanes (about S$100–550 each per day). Use 2–4 at most as kids' holes or backup. Ask every builder for a hire-basis price (they build, install and remove the course and keep the materials). See `docs/19-rental-options.md`.
- China factory lanes (20 Nov, the team's idea, explored by Claude): ask the factories behind simple portable mini golf products for ten turf lanes with built-in borders cut to our hole sizes, flown in by 10 Dec; props stay local. Best first contact Foshan Qingzhou (PGM). Only if a factory confirms the date in writing by about 27 Nov. See `docs/14-china-factory-contacts.md`. **Checked 22 Nov by a browsing agent on the live pages:** only one product fits, the PGM GL025 modular putting green (interlocking 60 × 60 cm PP tiles, 5 cm base, 3 cm edge lip, 16 mm putting turf, cups sunk in the base; custom shapes ¥270–300/m², ≈ S$4.5–5k for 83 m² before freight and GST; standard parts ship in 48 h; ≈ 11 kg/m², so ≈ 900 kg and ≈ 8 m³). It's a deck, not a rail: the lip won't take bank shots, so the 140 m of rail stays local; it would replace the surface and route C's raised greens. All PGM storefronts are one company (Yibang on 1688, Foshan Qingzhou on Alibaba). Freight and fire rating unknown. Next: send the GL025 message on 24 Nov (step by step in `docs/17-how-to-contact-suppliers.md`), get a forwarder's air and sea quote, decide by 27 Nov. **Correction (24 Nov):** the ten lane rectangles total 102.5 m², not 83 m² (83 m² is the shaped playing area inside them); if the decks are full rectangles the GL025 estimate is ≈ S$5.5–6.2k, ≈ 1.1 t and ≈ 10 m³ before freight and GST.
- Huadong Play: not suitable for this event (outdoor landscape and playground products; no indoor or modular course shown). Revisit only if a reusable course is wanted for 2027.

## Key numbers

| Item | Value | Confidence |
|---|---|---|
| Auditorium width | 25.6 m (11.65 + 2.4 + 10.25 + 1.3) | Measured 18 Nov, rough |
| Auditorium length | ≈ 53 m used: the 6 m stage placeholder + back wall ≈ 47 m from the stage front (range 44–50 m), i.e. ≈ 20 m past the golf limit (17–23 m); console front ≈ 43 m from the stage front | Estimated 20 Nov from the team's sense of the room and the old cable plan (54.7 m room, console 20.73 m past the runway tip); the 19 Nov photo estimate said 37 m. Not measured: tape golf limit → back wall |
| Other activities floor (golf limit to back wall, less the console and LF platform) | ≈ 470 m² (19 Nov photo estimate: ≈ 220 m²) | Estimated 20 Nov |
| Heights in the room | Ceiling structure ≈ 7.5–8.5 m · side lighting trusses ≈ 5.8 m along both side walls · two delay screens, one over each runway edge facing outward, underside ≈ 3.5 m · surround speakers ≈ 3.7 m · stage and runway decks ≈ 0.9 m | Estimated from photos 19 Nov, not measured |
| Runway (raised, part of stage) | 22.54 × 2.4 m, stage front to tip; 11.65 m from the top wall | Measured 18 Nov. Height ≈ 0.9 m (photos). Photos suggest the white top is ≈ 2.0 m wide: check whether 2.4 m includes the skirt or stairs |
| Runway to the bottom wall | 11.55 m (10.25 to the LF platform + its 1.3 m depth) | Derived from measured values |
| LF platform | 1.3 m deep, against the bottom wall, 10.25 m from the runway | Depth measured; length and position along the wall not measured |
| Speaker stands beside the runway | Stick out 51.5 cm (two per side, stairs nearest the stage) | Measured; positions not measured |
| Golf limit | 27 m from the stage front = 4.46 m past the runway tip | 27 m measured; 4.46 m derived |
| Golf zone | 27 × 25.6 m; ≈ 637 m² after the runway (≈ 263 + 260 m² beside it, ≈ 114 m² past the tip), before the stairs, stands and stage curves come off | Derived |
| Stage depth; golf limit to sound console | Stage depth unknown (photos hint more than 6 m); console front ≈ 16 m past the golf limit (20 Nov estimate, from the old cable plan), console ≈ 9 × 4 m | Not measured |
| Floor area for 10 holes | ≈ 200–270 m² | Rule of thumb |
| Turf for 10 holes | ≈ 72 m² net; order ≈ 85 m² | From spec sheet v1 (design target) |
| Playing surface, New York holes | ≈ 83 m²: ≈ 55 m² green turf, ≈ 20 m² charcoal or grey carpet (Gridlock, Subway), ≈ 8 m² white rink | Design target (`docs/10-new-york-concept.md`) |
| LED strip, New York look | ≈ 300 m (two layers: deck base and rail cap) | Estimate; the budget model allows 150 m |
| Tallest props | 3–3.6 m (Christmas tree, Grand Central backdrop, ball-drop tower) | Design target; clears the side trusses (≈ 5.8 m) by about 2 m (photo estimate) |
| Throughput | Ceiling ≈ 100–120 players/hour at 2–2.5 min per hole; realistic ≈ 75–90/h for the full 10 holes over a 3 h session (≈ 230–270 players); ≈ 2.3× that if each group plays one 5-hole district | Simulated (`tools/flow_sim.py`); time it at the dry run |
| Build scale | ≈ 70 plywood sheets, ≈ 3 t, 1–2 lorry loads, ≈ 120 person-days | Estimate (`docs/08-budget-model.md`) |
| Budget bands | Rent carnival lanes + dressing ≈ S$3–6k · DIY floor-laid ≈ S$1.7k bare / S$4–6.5k best value · carpenter + volunteers ≈ S$6–10k (New York cut down: plan ≈ S$10.9k with the carpenter's-pack quantities, ≈ S$9.8k with four cuts; `docs/11-route-c-carpenter-build.md`) · church crew (raised decks) ≈ S$14–31k · split ≈ S$30–56k · outsourced ≈ S$50–91k | Estimate, not quotes; low-budget lines from Singapore listing prices 18 Nov (`docs/08-budget-model.md` §6) |
| Materials only, New York design, team builds | ≈ S$13–27k all bought in Singapore · ≈ S$11–22k buying the light items (turf, LED, neon, printing, putters) from China · ≈ S$9–19k with plywood and timber from China too (not recommended: heavy and on the critical path). Includes 15% contingency and 9% import GST | Estimate, not quotes (`docs/08-budget-model.md` §8) |
| Deck height | ≈ 75 mm (revised from 120 mm) | Design target |
| Players on course at once | ≈ 40 (one group of 4 per hole) | Estimate |

Geometry for layouts and 3D: `floorplan/auditorium-dimensions.json` (v2, 18 Nov tape measurements plus 19 Nov photo estimates; each value is labelled measured, derived, not measured or estimated from photos). Picture: `floorplan/auditorium-simplified.png`. The old cable-plan measurements (54.7 × 27.1 m, 45.95, 20.73, 11.62 and 11.58 m) are superseded and kept in `floorplan/auditorium-dimensions-v1-cable-plan.json`. The zone options, both draft layouts and the status page still use them; layout v3 and the 3D model use v2.

## Timeline (gates; full detail in `docs/05-timeline-and-critical-path.md`)

27 Nov: G0 and G1 have passed with no team decision recorded since 18 Nov. Recommended catch-up (not decided; `docs/05` "27 Nov update"): one decision meeting and the carpenter booked by Mon 30 Nov; Singapore-stock turf and local or express LED by Tue 1 Dec; G2–G5 dates unchanged. If the carpenter only starts Mon 7 Dec there's no slack; later than that, ten holes don't fit without cuts.

- G0 Fri 20 Nov: budget ceiling, crowd estimate, reuse yes or no, install window confirmed.
- G1 Wed 25 Nov: art direction and hole list frozen; builder chosen from at least 2 quotes; turf ordered; rental fallback quote in hand.
- G2 Fri 4 Dec: prototype hole built and test-played. Turf in hand by about 7 Dec.
- G3 Fri 18 Dec: all 10 holes built; full dry-run assembly; timed play-test.
- G4 Wed 23 Dec: totems, kit and transport ready.
- G5 Wed 30 Dec, 6 pm: installed, test-played, venue safety walk passed. If weekend services use the auditorium on 26–27 Dec, install is only Mon 28 to Wed 30 Dec.
- 31 Dec: event.

## Open questions

- Budget ceiling? (biggest gap; suggested anchor about S$35–45k for the split route)
- Who builds: church crew, split, or outsourced? Is there December volunteer capacity alongside Christmas production?
- Does "movable" also mean the floor must be cleared before midnight? (If yes, use roll-in units.) With ≈ 20 m (≈ 470 m²) past the golf limit (20 Nov estimate), the countdown crowd may fit there, depending on its size; if it doesn't, yes for some holes.
- How lit is the auditorium while golf runs? (decides the art direction)
- Hours golf runs, and when it closes before midnight?
- Are the dark blocks along the top wall doors or exits? (the draft walkway runs there) The photos show two exit doors in the 11.65 m wall; where guessed (x ≈ 16–18 and 23–25 m), the totems of holes 7 and 6 stand ≈ 1.7 m in front of them. Measure the doors, then move the totems if needed.
- Is there a workshop or spare hall for a dry-run assembly in mid-December?
- Load-in window around Christmas services?
- Does production own stage decks or risers that are free from 28 Dec to 1 Jan? (They could serve as hole bases at no cost.)
- Where will floor cables run on the night: along the walls, or under raised hole bases?
- Ceiling height (photos: ≈ 7.5–8.5 m), door and load-in route widths. Floor finish (photos: light grey, smooth, slightly glossy): may vinyl floor graphics go on it?
- What is behind the glazed band on the LF-platform side wall (foyer, overflow room)? Is it used on the night?
- Atrium dimensions. The team is building a to-scale 3D model of the auditorium and atrium.
- Expected crowd size, and whether to run a queue or timed slots.
- Budget.
- The venue's fire-rating requirements for turf and foam.
- Runway: its height. Can the dotted extension from the old cable plan (≈ 8.6 m) still happen? It isn't on the 18 Nov sketch. If it is built, it runs past the golf limit and splits the golf zone in two, because players can't cross the runway.
- Not on the 18 Nov sketch, so still to measure: stage depth (back wall to stage front); room length (54.7 m comes from the old plan, but the sketch draws the room shorter beyond the golf limit); golf limit to the sound console, and the console's size; the size of the two curved stage corners; where the stairs and speaker stands sit along the runway, how long they are, and how deep the stairs are; the LF platform's length, where it starts along the wall, and what it is for; the positions and widths of the back-wall doors. The 22.1 m written beside the runway on the sketch is unexplained; the team gave 22.54 m as the runway length.
- Which side of the room is which in the cable-planning tool? The v2 plan puts the 11.65 m side at the top (the team's choice, 18 Nov), so it lines up with the tool's top wall, but this hasn't been checked against the cable plan.
- Can production give a dim warm wash over both golf districts while golf runs? (the New York look needs some light: glow, but people must see the floor and the ball)
- Clearance under the rig for 3–3.6 m props (tree, Grand Central backdrop, ball-drop tower).
- Where do guests enter the auditorium? Where will the countdown crowd stand? Does the sound console need a clear sightline down the middle of the room?

## Safety flags

- Power: ND18 (LX4.2) is at 101% load and ND21 (LX6) at 106% on the cable plan. Above 100%, breakers can trip mid-event. Raise this with whoever owns power, regardless of golf.
- Trip hazards: cable runs cross both floor halves. Holes and queues must not create new trip points.

## Next tasks

Done 16 Nov: spec sheet v1, draft layout v1, quote-request templates, planning guide, timeline, ops plan.
Done 18 Nov: runway confirmed; Bright City concept (`docs/09-city-concept.md`); zone options and plaza layout v2; flow simulation; throughput corrected. Later on 18 Nov: the team's tape measurements and the golf zone recorded; plan v2 (`floorplan/auditorium-simplified.png`) and geometry v2.

Done later on 18 Nov: the New York direction recorded; ten New York holes, robustness rules and lighting spec (`docs/10-new-york-concept.md`); layout v3 on the v2 geometry with checked clearances (`tools/make_layout_nyc.py`, `floorplan/layout-v3-nyc.png`); 3D model rebuilt on it; reference photos 06–08 saved.

Done 19 Nov: the room worked out from the team's photos (`docs/13-auditorium-from-photos.md`): back wall ≈ 10 m past the golf limit, heights, wall finishes, exits; geometry, plan v2 and layout v3 updated (hole 1 moved 0.15 m); the 3D room rebuilt to match the photos, scale figures removed, party glow brighter.

Done 20 Nov: room length re-estimated at ≈ 53 m (back wall ≈ 20 m past the golf limit) and the two delay screens recorded; geometry, plan v2, layout v3 (all checks pass) and the 3D model updated; the 3D model cleaned up by a helper agent; China factory contact list for custom lanes (`docs/14-china-factory-contacts.md`, `.csv`). 21 Nov: brief for a browsing agent to search Taobao, 1688, Pinduoduo and Alibaba with real pages and photos (`docs/15-sourcing-agent-brief.md`). 22 Nov: the agent's handback checked and merged (`docs/14-china-factory-contacts.md` and `.csv`; evidence in `reference/supplier-evidence/2026-11-22-sourcing-agent/`). 23 Nov: round-2 brief for a new browsing agent (`docs/16-sourcing-agent-brief-round-2.md`): same method, done thoroughly; find a maker independent of PGM and look for lanes with a real rail.

Done later on 18 Nov: route C (carpenter + volunteers, S$6–10k) broken down for the New York design (`docs/11-route-c-carpenter-build.md`), and a carpenter quote template (`docs/06-rfq-templates.md` E). Then the carpenter's pack (`carpenter-pack/`, `docs/12-carpenter-pack.md`), which raised the route C plan to ≈ S$10.9k.

Done 27 Nov (a new account; the earlier sessions' chats aren't visible to it, only what they pushed): merged the three branches that had never reached this line of work (benchmark visits, now `docs/18`; rental options, now `docs/19`; the 19–25 Nov work, docs 13–17); quote templates given a [decision date] and the New York hero props; a "27 Nov update" at the top of `docs/05`; the status page brought up to 27 Nov, its plan now injected from the data by `tools/make_status_page.py`; the cable trace saved in `tools/trace_cables.py` (not placed yet).

**Not on GitHub yet (27 Nov):** the team's computer has four unpushed commits on its local `main`, including `e428691`: the 3D page synced to the 20 Nov "Countdown Golf 3D" artifact; layout v4 (`tools/make_layout_nyc_v4.py`, `floorplan/layout-v4-nyc.*`, all clearance checks passing); and `status/3d-iter1-wip/`, a 3D iteration rebuilding all ten holes (ten hole files, the brief, build and screenshot tools, the agents' notes and the integrator's half-edited page; not integrated, reviewed or published). Its `BRIEF.md` holds that computer's folder paths, including a Windows username: replace them with placeholders when it's merged.

1. Team: one decision meeting by Mon 30 Nov: budget ceiling, route, the look and hole list, install window, and GL025 decks or a local surface. Record each answer in the decision log, then book the carpenter in writing (template E in `docs/06-rfq-templates.md`).
2. By Tue 1 Dec: the playing surface from Singapore stock, unless Yibang confirms GL025's price and delivery by 10 Dec in writing (chase price, ship date, weight, boxes and fire rating: `docs/17-how-to-contact-suppliers.md`); LED strip bought locally or sent express.
3. Push the team computer's `main`, merge it here, then finish the ten-hole 3D iteration: read its brief and notes, integrate the hole files, review each hole against `docs/10-new-york-concept.md` and its robustness rules, check it in the browser, and republish the 3D page.
4. Place the cables from `tools/trace_cables.py` on the final geometry and layout (v4): fill the `cables` object in `floorplan/auditorium-dimensions.json`, draw them only in separate internal `-cables` drawings (never on supplier-facing files such as `layout-v*-nyc.png`, which the carpenter's pack embeds), list where they cross holes, walkways or the Tee Booth, then re-run `python3 tools/make_status_page.py` and republish the status page.
5. Send the remaining quote requests (`docs/06-rfq-templates.md`), log the replies in `docs/04-sourcing.md`, and fill in `docs/08-budget-model.md` with real quotes.
6. Team measures what's missing (the five quick measurements in `docs/13-auditorium-from-photos.md`: golf limit to the back wall, the side-wall exits, runway width and height, rig heights, stage depth), then update `floorplan/auditorium-dimensions.json` and re-run the plan, layout and status scripts.
7. Production questions (`docs/09-city-concept.md` section 8), plus: which cable runs lie on the floor and which hang from the rig, where the bottom-wall trunk goes past the runway tip, and whether ND31 and FL·ND30 can move out of the Tee Booth.
8. Visit Kulnari Mystery Golf before G2 (Fri 4 Dec) with the scorecard in `docs/18-singapore-benchmark-visits.md`.
9. Once the hole list is decided: update the spec sheet's hole list (`docs/03-hole-spec-sheet.md` still shows the old windmill set) and redo the concept renders.

## Working rules

- Keep measured and estimated values clearly separate. Never present an estimate as measured.
- Coordinates: metres, origin at the top-left corner of the auditorium as drawn; +X from the stage end toward the sound console, +Z from the top wall (the 11.65 m side) to the bottom wall, Y up. Same X and Z axes as the team's planning tool.
- After any decision: update "Decided by the team" above, add a dated row to the decision log at the end of `docs/project-brief.md`, then commit and push.
- Recommendations are not decisions until the team confirms them.

### HOGC AI use guidelines

- Keep this repo private. It holds Internal data (floorplan, plans, schedules).
- Never add credentials, passwords, network or system configs, personal details of members or volunteers, giving or HR data, or anything about minors. If a person must be mentioned, anonymise them ("Member A").
- A team member must read, edit and own any output before it is used.
- Questions go to the AI Governance & Security Team.

### HOGC tech stack (if this becomes code, e.g. the 3D model)

- Node 20+; new projects use Node 26. Check `node -v`, `.nvmrc` and `engines`.
- Before adding or upgrading packages, run `npm audit` (or pnpm/yarn) and `osv-scanner scan source -r .` if installed. On Critical or High findings, stop and list the CVEs and fixed versions. Never run `audit fix --force` without approval.
- New packages: exact name, not deprecated or archived, released in the last 12 months, no open advisories, version at least 14 days old. Flag install scripts.
- Pin versions and commit lockfiles. Never print or commit `.env` or secrets; flag any that are committed.
- Use the secure-by-default skill for new projects if it is available.

## Files

- `README.md`: reading order and status.
- `docs/01-how-to-think-about-this.md`: constraints, truths, decision order, supplier scoring.
- `docs/02-reference-decoder.md`: what each reference is and what to copy.
- `docs/03-hole-spec-sheet.md`: build standard and the 10 holes.
- `docs/04-sourcing.md`: Huadong evaluation, alternatives, recommendation.
- `docs/05-timeline-and-critical-path.md`: gates and the week-by-week plan.
- `docs/06-rfq-templates.md`: quote requests for builders, turf, rental, factories and a freelance carpenter (route C).
- `docs/07-operations-and-safety.md`: throughput, staffing, kit and safety checklist.
- `docs/08-budget-model.md`: scale and budget for a movable, one-night build (formats, quantities, person-days, four cost scenarios, levers, low-budget routes and a DIY bill of materials).
- `docs/09-city-concept.md`: the 18 Nov city brief, logic-checked: Bright City look, where the course goes, play order and capacity, story, gimmicks, cost delta, decisions for G1. Its look is superseded by doc 10; its play-order and capacity analysis still applies.
- `docs/10-new-york-concept.md`: the New York Countdown proposal: what photos 06–08 teach, the look, the story, the ten holes (play, build, robustness, hidden 11:59), rules for every hole, lighting spec, layout v3 and its clearances, cost delta, decisions for G1, and a bench of eight more ideas.
- `floorplan/layout-v3-nyc.svg`, `.png` and `.json`: layout v3 (New York), generated by `tools/make_layout_nyc.py` (`python3 tools/make_layout_nyc.py floorplan/auditorium-dimensions.json floorplan --png --inject status/countdown-golf-3d.html`). The script holds the hole data (positions, names, play text), asserts the clearances and injects the data into the 3D page.
- `floorplan/layout-draft-zone-a.svg` and `.png`: draft layout v1 (superseded), generated by `tools/make_layout_svg.py`.
- `floorplan/zone-options.svg` and `.png`, `floorplan/layout-draft-plaza.svg` and `.png`: three candidate zones and the v2 plaza layout, generated by `tools/make_zone_options.py` (`python3 tools/make_zone_options.py floorplan/auditorium-dimensions-v1-cable-plan.json floorplan --png`). Both are on the v1 geometry and superseded by the 18 Nov golf zone.
- `tools/trace_cables.py`: cable runs, drops and the ND18 and ND21 flags traced from the cable-plan screenshots (27 Nov), in the planning tool's own frame with the mapping to the current geometry in three anchor functions. Internal: power and network details, never for suppliers.
- `tools/flow_sim.py`: capacity simulation (play order, districts, caps); `python3 tools/flow_sim.py --help`.
- `concepts/`: isometric concept renders (holes and whole course, Neon and Carnival), generated by `tools/make_concepts.py`. Concept sketches, not construction drawings. They predate the city concept and the v2 layout.
- `reference/user-refs/`, `reference/video-frames/`: the team's inspiration photos and stills from the Walker Art Center video. 06 (Electric Greens LED glow), 07 (hot dog hole) and 08 (bicycle-wheel hole) are the New York direction's references (18 Nov, later).
- `docs/19-rental-options.md`: what can be rented (18 Nov research, written before the New York direction), its quality and customisation, how to book it, hire-basis builds and renting stage decks as bases.
- `reference/supplier-evidence/`: what suppliers actually show (e.g. Huadong's product images). `2026-11-22-sourcing-agent/`: the browsing agent's handback as received (results CSV, summary, 30 screenshots; the team's Taobao account name blacked out in one screenshot, image metadata stripped).
- `status/countdown-golf-status.html`: visual status page (27 Nov snapshot; its plan is injected from the layout and room JSON by `tools/make_status_page.py [LAYOUT_JSON] [DIMENSIONS_JSON]`, which also draws cables once they are placed), published as a private Artifact at https://claude.ai/artifact/EUmyNjaUzF9bkhidKNNRUn. Republish from this file after decisions change. Fragment HTML (no doctype); the Artifact wraps it.
- `status/countdown-golf-3d.html`: interactive 3D model of layout v3, the New York holes on the v2 geometry, inside the auditorium as the team's photos show it (19 Nov): black walls and ceiling with ducts and downlights, light glossy floor, side trusses with LED batons and moving heads, the stage's blue LED wall and portrait screens, the delay screen, confidence monitors, exits, the console, the quilted wall and glazed band. Walls and ceiling hide themselves when the camera is outside them. three.js 0.186.1 from jsDelivr, pinned; vetted 18 Nov: no OSV advisories. Published as a private Artifact at https://claude.ai/artifact/C2jsJzR6ZqgchnAyumSqBJ (19 Nov; republish from this file). The 18 Nov version, https://claude.ai/artifact/V6KWW5KgTbNyyRVLupEtxf, belongs to another of the user's organizations and can't be updated from this account. Three lighting set-ups (party glow, house lights, fully dark; party glow brightened 19 Nov), a tee view and info card for every hole, camera views including "From the console" and "Back corner", and a walk mode at human scale (child 1.28 m, average adult 1.66 m, tall adult 1.88 m: typical eye heights, shoulder widths and walking speeds; your eyes or behind you; keys or touch pad, drag to look, a map, collisions with the holes, stage, runway, stairs and walls). No scale figures (removed 19 Nov so nothing blocks walking). Cleaned up 20 Nov: the 53 m room, the two delay screens over the runway edges, a calmer scene (plain floor, regular downlights, no hanging cables or haze cones, skyline flats with plain backs, no z-fighting), floating hole-number bullets, better tee views, neutral tone mapping, room labels and walk routes off by default (Show toggles for hole numbers and room labels), the lighting switch on the view. Full-screen button and a field-of-view slider; all settings sit in a drawer behind the Settings button. Its hole data block is injected by `tools/make_layout_nyc.py`: edit the script, not the block. The room's photo estimates are constants near the top of the script (`ROOM_L`, `CEIL`, `TRUSS_Y`, `DELAY`, `SIDE_DOORS`, `GLASS`, `QUILT`).
- `status/standalone/`: full HTML copies of both pages that open straight from disk in Chrome (the 3D one embeds three.js, so it works offline). Rebuild after editing either page: `python3 tools/make_standalone.py`.
- `docs/11-route-c-carpenter-build.md`: route C (one paid carpenter, volunteers paint and dress, S$6–10k) applied to the New York design: what changes (floor-laid holes with a raised green at each cup end, one LED layer, flat cut-out props), hole by hole with carpenter days, a costed plan (≈ S$10.9k with 10% contingency, ≈ S$9.8k with four cuts), roles and volunteer-days, the cut list, the schedule against the gates, risks and decisions. Proposal, not decided.
- `docs/18-singapore-benchmark-visits.md`: where to play in Singapore before we build (22 Nov research, no visits yet): Kulnari Mystery Golf (the only indoor course, must go), Dino Putt, UltraGolf, the USS New York zone for the look; what to study at each; a visit scorecard and visit log. Simulators and closed venues listed so nobody wastes a trip.
- `docs/12-carpenter-pack.md`: what a carpenter needs and why, how to read the drawings, materials and tools explained, what we still have to find out, how to use the pack, what it changed in the budget, glossary.
- `carpenter-pack/countdown-golf-carpenter-pack.pdf` (and `carpenter-pack.html`, `quantities.json`): the carpenter's drawing pack for route C, 16 A3 sheets (cover and notes, site plan, standard details D1–D9, one sheet per hole, Tee Booth and skyline flats, materials). Generated by `tools/make_carpenter_pack.py` (`python3 tools/make_carpenter_pack.py --pdf`), which holds the hole geometry in mm and fails if any gap breaks the 250 mm rule. Design intent for quoting, not engineered.
- `docs/14-china-factory-contacts.md` and `.csv`: the team's idea of having the factories behind simple portable mini golf products make custom lanes (20 Nov): whether it fits the date, 13 contacts in three groups (lanes cut to size, complete courses, accessories and lighting) with sources and confidence, what to ask for (ten lanes sized from layout v3), a message in English and Chinese, and how to trace a Taobao or Pinduoduo shop to its factory. 22 Nov: the browsing agent's results checked against its screenshots and merged (22 contacts in the CSV, with the agent's row ids and scores); the GL025 modular green assessed against the design and budget; the gaps; a GL025 message in English and Chinese. Nothing contacted.
- `docs/15-sourcing-agent-brief.md`: a self-contained brief (21 Nov) for a browsing agent with screen vision, working in the team's logged-in Taobao, 1688, Pinduoduo and Alibaba accounts: what to look for (type A: bordered, modular putting lanes cut to size), the ten lane sizes and requirements, search terms and listing vocabulary in Chinese, how to trace a shop to its factory, the seven leads to verify first, the results CSV and scoring, rules (research only unless told; no buying, no personal details, captchas go to the person) and the inquiry message. Results came back 22 Nov and are merged into `docs/14-china-factory-contacts.csv`.
- `docs/16-sourcing-agent-brief-round-2.md`: the round-2 brief (23 Nov) for a new browsing agent, self-contained: the project and why each lane requirement matters, the decision it feeds (factory decks, factory lanes with a real rail, or all local), what round 1 found (GL025, the PGM group as one company, every other company and what's still open on each), how round 1 searched and where it fell short, six goals in priority order (first: a maker independent of PGM; second: a lane with a bankable rail), how to work adaptively (plan and re-plan, snowball, follow the product, stop at saturation), a toolkit (search terms, image search, platforms incl. Pinduoduo, company registers, Douyin, trade-fair lists; tracing a shop to its factory; hard evidence of a real factory), scoring, the handback (results, search log, seen-and-skipped log, screenshots with the person's account details covered, summary), rules and messages. Results due end of Tue 24 Nov; merge into `docs/14-china-factory-contacts.csv`.
- `docs/17-how-to-contact-suppliers.md`: how to message the suppliers, step by step (24 Nov): who to contact today and who not to, for every row of the CSV; exact steps for 1688 chat (computer and phone), WhatsApp, email, WeChat, Taobao, Alibaba.com, Made-in-China and phone calls; Message 1 (GL025, English and Chinese, area corrected to 102.5 m²), Message 2 (plain putting turf price check), Message 3 (forwarder), a follow-up, useful replies in Chinese, logging, red flags and the Singapore suppliers. Proposal; nothing contacted.
- `docs/17-lane-sizes-for-suppliers.png`: the one-page lane-size sheet to attach to supplier messages (English and Chinese, to scale; nothing about the venue). Generated by `tools/make_supplier_lane_sheet.py` (`python3 tools/make_supplier_lane_sheet.py`), which reads L and W from `tools/make_layout_nyc.py`.
- `docs/13-auditorium-from-photos.md`: the auditorium worked out from the team's photos (19 Nov; length revised 20 Nov to ≈ 20 m past the golf limit): method (runway, people and doors as rulers; camera heights), the back-wall estimate, heights, wall-by-wall finishes, what it makes more and less possible, and five quick measurements to settle it. The photos aren't stored: they show identifiable people.
- `docs/project-brief.md`: full context, label key, research with links, quality checklist, decision log.
- `floorplan/auditorium-simplified.svg` and `.png`: simplified plan v2 (18 Nov tape measurements, golf zone, not-measured items dashed), generated by `tools/make_floorplan.py` (`python3 tools/make_floorplan.py floorplan/auditorium-dimensions.json floorplan --png`).
- `floorplan/auditorium-dimensions.json`: geometry v2 in metres, every value labelled measured, derived or not measured, plus the list of what's still to measure.
- `floorplan/auditorium-dimensions-v1-cable-plan.json`: geometry v1 from the cable-planning tool (superseded; still holds the cable runs and power flags).
- `floorplan/source-sketches/`: the team's 18 Nov hand sketch with tape measurements (photo metadata stripped).
- `floorplan/source-screenshots/`: the four original screenshots from the planning tool, named by measurement.
- `reference/inspiration-backyard-minigolf.jpg`: look-and-feel reference (outdoor build; translate to indoor modular).
