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

## Recommended, not yet decided

These came from Claude's research in claude.ai. Treat them as proposals until the team confirms.

- Hybrid build: buy only the turf (local or overseas, whichever guarantees delivery by mid-December); a local carpenter or set builder makes bases, borders and obstacles from plywood or hard-coated foam.
- Put the course in one half of the auditorium (Zone A or B) and keep the other half for the party.
- Number the holes 10 down to 1 to mirror the countdown, with hole 1 nearest the stage.
- Look and feel from `reference/inspiration-backyard-minigolf.jpg` (windmill, red barn tunnel, water wheel, timber edging), translated into an indoor modular build.

## Key numbers

| Item | Value | Confidence |
|---|---|---|
| Auditorium | 54.7 × 27.1 m | Measured |
| Stage edge to booth | 45.95 m | Measured |
| Strip end to booth | 20.73 m | Measured |
| Top wall features to strip | 11.62 m | Measured |
| Strip to bottom wall | 11.58 m | Measured |
| Each open floor half | ≈ 46 × 11.6 m (≈ 533 m²) | Derived |
| Central strip | ≈ 23.7 × 2.4 m | Estimated |
| Stage zone depth | ≈ 6 m | Estimated |
| Floor area for 10 holes | ≈ 200–270 m² | Rule of thumb |
| Turf for 10 holes | ≈ 60–80 m² | Estimate until holes are designed |
| Players on course at once | ≈ 40 (one group of 4 per hole) | Estimate |

Geometry for layouts and 3D: `floorplan/auditorium-dimensions.json`. Picture: `floorplan/auditorium-simplified.png`.

## Timeline (working back from 31 Dec 2026)

- Week of 16 Nov: lock the 10 hole designs and sizes, get turf quotes (one local, one overseas with air freight), book a builder, confirm the load-in window.
- Late Nov to mid-Dec: build and paint bases, borders and obstacles.
- Mid-Dec: turf arrives; fit turf, cut cups, test-play every hole.
- 21 Dec: everything finished (buffer week).
- From about 26 Dec (if Christmas services use the auditorium): load in, set up, test.
- 31 Dec: event.

## Open questions

- Load-in window around Christmas services?
- Where will floor cables run on the night: along the walls, or under raised hole bases?
- Ceiling height, door and load-in route widths, floor finish.
- Atrium dimensions. The team is building a to-scale 3D model of the auditorium and atrium.
- Expected crowd size, and whether to run a queue or timed slots.
- Budget.
- The venue's fire-rating requirements for turf and foam.
- Confirm the guesses on the plan: left end is the stage, central strip is a runway, right-hand box is the control booth.

## Safety flags

- Power: ND18 (LX4.2) is at 101% load and ND21 (LX6) at 106% on the cable plan. Above 100%, breakers can trip mid-event. Raise this with whoever owns power, regardless of golf.
- Trip hazards: cable runs cross both floor halves. Holes and queues must not create new trip points.

## Next tasks

1. A to-scale spec sheet for the 10 holes: footprint, lane width, obstacles, turf m² per hole, materials, build notes. One document both the builder and turf suppliers can use.
2. A layout of the 10 holes in Zone A or B that avoids cable runs and leaves room to walk and queue.
3. When the team adds the 3D model: place the holes to scale and generate a preview.
4. A request-for-quote message for turf suppliers (local and overseas).

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

- `docs/project-brief.md`: full context, label key, research with links, quality checklist, decision log.
- `floorplan/auditorium-simplified.svg` and `.png`: simplified plan with dimensions.
- `floorplan/auditorium-dimensions.json`: zones, measurements, cable runs and power flags in metres.
- `floorplan/source-screenshots/`: the four original screenshots from the planning tool, named by measurement.
- `reference/inspiration-backyard-minigolf.jpg`: look-and-feel reference (outdoor build; translate to indoor modular).
