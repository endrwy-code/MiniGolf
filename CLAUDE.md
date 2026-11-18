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

## Recommended, not yet decided

These came from Claude's research in claude.ai. Treat them as proposals until the team confirms.

- Hybrid build: buy only the turf (prefer local stock; import only if delivery by about 4 Dec is guaranteed in writing); a local set builder makes bases, borders and obstacles from plywood or hard-coated foam. See `docs/04-sourcing.md`.
- Art direction "Bright City" (18 Nov, replaces "Neon Countdown"): bright colour; the same fascia, rail cap and totem on every hole; painted skyline flats for height; street graphics on the floor; lit by the room's rig, with LED only on safety edges and a few glows. Depends on production lighting the golf zone. See `docs/09-city-concept.md`. Earlier options (Neon Countdown, Bright Carnival): `docs/02-reference-decoder.md`.
- Layout: a clustered city plaza at the runway tip (between the runway end and the booth), not a line: two districts of 5 holes, each looping back to one hub. Fits with or without the runway extension, but cable drops ND31 and D42 and the top-wall exits must be confirmed first. See `floorplan/layout-draft-plaza.png` and `floorplan/zone-options.png`. The v1 Zone A line (`floorplan/layout-draft-zone-a.png`) is superseded and kept for reference.
- 10 holes in the mix 4 hero (8, 4, 2, 1) · 4 mid · 2 simple; mechanics unchanged; about 72 m² net turf, order about 85 m². Skins proposed as city places (e.g. windmill → Ferris wheel, barn → station); story "ten places, one moment" works in any order. See `docs/03-hole-spec-sheet.md` and `docs/09-city-concept.md`.
- Ops: 5-stroke cap; groups start at any open hole and play their district in order; at most about 12 groups on the course; one district per group when the queue is long (≈ 2.3× capacity); balls handed back at the hub; about 7–9 volunteers per shift. See `docs/07-operations-and-safety.md`.
- Huadong Play: not suitable for this event (outdoor landscape and playground products; no indoor or modular course shown). Revisit only if a reusable course is wanted for 2027.

## Key numbers

| Item | Value | Confidence |
|---|---|---|
| Auditorium | 54.7 × 27.1 m | Measured |
| Stage edge to booth | 45.95 m | Measured |
| Strip end to booth | 20.73 m | Measured |
| Top wall features to strip | 11.62 m | Measured |
| Strip to bottom wall | 11.58 m | Measured |
| Each open floor half | ≈ 46 × 11.6 m (≈ 533 m²) | Derived |
| Runway (raised, part of stage) | ≈ 25.2 × 2.4 m incl. connector; possible extension ≈ 8.6 m toward the booth | Purpose confirmed; size estimated |
| Stage zone depth | ≈ 6 m | Estimated |
| Floor area for 10 holes | ≈ 200–270 m² | Rule of thumb |
| Turf for 10 holes | ≈ 72 m² net; order ≈ 85 m² | From spec sheet v1 (design target) |
| Course footprint incl. walkway and queue | ≈ 46 × 11.4 m (Zone A) | Draft layout v1 |
| Throughput | Ceiling ≈ 100–120 players/hour at 2–2.5 min per hole; realistic ≈ 75–90/h for the full 10 holes over a 3 h session (≈ 230–270 players); ≈ 2.3× that if each group plays one 5-hole district | Simulated (`tools/flow_sim.py`); time it at the dry run |
| Build scale | ≈ 70 plywood sheets, ≈ 3 t, 1–2 lorry loads, ≈ 120 person-days | Estimate (`docs/08-budget-model.md`) |
| Budget bands | Rent carnival lanes + dressing ≈ S$3–6k · DIY floor-laid ≈ S$1.7k bare / S$4–6.5k best value · carpenter + volunteers ≈ S$6–10k · church crew (raised decks) ≈ S$14–31k · split ≈ S$30–56k · outsourced ≈ S$50–91k | Estimate, not quotes; low-budget lines from Singapore listing prices 18 Nov (`docs/08-budget-model.md` §6) |
| Deck height | ≈ 75 mm (revised from 120 mm) | Design target |
| Players on course at once | ≈ 40 (one group of 4 per hole) | Estimate |

Geometry for layouts and 3D: `floorplan/auditorium-dimensions.json`. Picture: `floorplan/auditorium-simplified.png`.

## Timeline (gates; full detail in `docs/05-timeline-and-critical-path.md`)

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
- Does "movable" also mean the floor must be cleared before midnight? (If yes, use roll-in units.)
- How lit is the auditorium while golf runs? (decides the art direction)
- Hours golf runs, and when it closes before midnight?
- Are the dark blocks along the top wall doors or exits? (the draft walkway runs there)
- Is there a workshop or spare hall for a dry-run assembly in mid-December?
- Load-in window around Christmas services?
- Where will floor cables run on the night: along the walls, or under raised hole bases?
- Ceiling height, door and load-in route widths, floor finish.
- Atrium dimensions. The team is building a to-scale 3D model of the auditorium and atrium.
- Expected crowd size, and whether to run a queue or timed slots.
- Budget.
- The venue's fire-rating requirements for turf and foam.
- Confirm the remaining guess on the plan: the right-hand box is the control booth. (Stage at the left end and the runway were confirmed 18 Nov.)
- Runway: its height; whether the dotted extension (≈ 8.6 m toward the booth) will be built.
- Can production light the golf zone from the rig? (decides whether Bright City works in a dark room)
- Where do guests enter the auditorium? Where will the countdown crowd stand? Does the booth need a clear sightline down the middle of the room?

## Safety flags

- Power: ND18 (LX4.2) is at 101% load and ND21 (LX6) at 106% on the cable plan. Above 100%, breakers can trip mid-event. Raise this with whoever owns power, regardless of golf.
- Trip hazards: cable runs cross both floor halves. Holes and queues must not create new trip points.

## Next tasks

Done 16 Nov: spec sheet v1, draft layout v1, quote-request templates, planning guide, timeline, ops plan.
Done 18 Nov: runway confirmed; Bright City concept (`docs/09-city-concept.md`); zone options and plaza layout v2; flow simulation; throughput corrected.

1. Team answers the G0 questions; record the answers in the decision log.
2. Send the quote requests (`docs/06-rfq-templates.md`) and log the replies in `docs/04-sourcing.md`.
3. Fill in `docs/08-budget-model.md` with real quotes.
4. Take the production questions in `docs/09-city-concept.md` section 8 to production this week (light the golf zone? runway extension? booth sightline? which floor cables and drops stay? where guests enter?).
5. Team decides by G1 (25 Nov): Bright City, plaza location, district format, story. Then revise `tools/make_zone_options.py` with the confirmed drops and exits, update the spec sheet's hole names, and redo the concept renders.
6. When the team adds the 3D model: place the holes to scale and generate a preview.

## Working rules

- Keep measured and estimated values clearly separate. Never present an estimate as measured.
- Coordinates: metres, origin at the top-left corner of the auditorium as drawn; +X from the stage end toward the booth, +Z from the top wall to the bottom wall, Y up. Same X and Z axes as the team's planning tool.
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
- `docs/06-rfq-templates.md`: quote requests for builders, turf, rental and factories.
- `docs/07-operations-and-safety.md`: throughput, staffing, kit and safety checklist.
- `docs/08-budget-model.md`: scale and budget for a movable, one-night build (formats, quantities, person-days, four cost scenarios, levers, low-budget routes and a DIY bill of materials).
- `docs/09-city-concept.md`: the 18 Nov city brief, logic-checked: Bright City look, where the course goes, play order and capacity, story, gimmicks, cost delta, decisions for G1.
- `floorplan/layout-draft-zone-a.svg` and `.png`: draft layout v1 (superseded), generated by `tools/make_layout_svg.py`.
- `floorplan/zone-options.svg` and `.png`, `floorplan/layout-draft-plaza.svg` and `.png`: three candidate zones and the v2 plaza layout, generated by `tools/make_zone_options.py` (`python3 tools/make_zone_options.py floorplan/auditorium-dimensions.json floorplan --png`).
- `tools/flow_sim.py`: capacity simulation (play order, districts, caps); `python3 tools/flow_sim.py --help`.
- `concepts/`: isometric concept renders (holes and whole course, Neon and Carnival), generated by `tools/make_concepts.py`. Concept sketches, not construction drawings. They predate the city concept and the v2 layout.
- `reference/user-refs/`, `reference/video-frames/`: the team's inspiration photos and stills from the Walker Art Center video.
- `reference/supplier-evidence/`: what suppliers actually show (e.g. Huadong's product images).
- `status/countdown-golf-status.html`: visual status page (18 Nov snapshot), published as a private Artifact at https://claude.ai/artifact/EUmyNjaUzF9bkhidKNNRUn. Republish from this file after decisions change. Fragment HTML (no doctype); the Artifact wraps it.
- `status/countdown-golf-3d.html`: interactive 3D model of the v2 plaza (three.js 0.186.1 from jsDelivr, pinned; vetted 18 Nov: no OSV advisories), published as a private Artifact at https://claude.ai/artifact/V6KWW5KgTbNyyRVLupEtxf. Hole data is copied from `tools/make_zone_options.py`; update both if positions change. Stage, runway and booth heights in it are placeholders.
- `docs/project-brief.md`: full context, label key, research with links, quality checklist, decision log.
- `floorplan/auditorium-simplified.svg` and `.png`: simplified plan with dimensions.
- `floorplan/auditorium-dimensions.json`: zones, measurements, cable runs and power flags in metres.
- `floorplan/source-screenshots/`: the four original screenshots from the planning tool, named by measurement.
- `reference/inspiration-backyard-minigolf.jpg`: look-and-feel reference (outdoor build; translate to indoor modular).
