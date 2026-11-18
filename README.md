# MiniGolf: countdown party course

A 10-hole indoor mini golf course for the HOGC countdown party on **Thu 31 Dec 2026**, set up in the auditorium. It's a one-off event: we want the best value that still looks custom and plays well on the night.

> Private repo. Internal data only. Don't add personal details, credentials or system configs. Anything AI-drafted here must be read, edited and owned by a team member before it's used.

## Start here

1. **[How to think about this](docs/01-how-to-think-about-this.md)**: the constraints, seven truths to align on, and the decision order.
2. **[Sourcing: Huadong Play and the alternatives](docs/04-sourcing.md)**: who to buy, rent or build from, and why.
3. **[Timeline and critical path](docs/05-timeline-and-critical-path.md)**: gates from now to install.

## Everything else

| Doc | What it's for |
|---|---|
| [Reference decoder](docs/02-reference-decoder.md) | What each inspiration photo really is, and what to copy |
| [10-hole spec sheet](docs/03-hole-spec-sheet.md) | Build standard plus the 10 holes, for the builder and turf supplier |
| **[The city concept](docs/09-city-concept.md)** | **18 Nov: the city brief, logic-checked. Look, where it goes, play order and capacity, story, gimmicks** |
| [Zone options](floorplan/zone-options.png) · [Plaza layout v2](floorplan/layout-draft-plaza.png) | Where the course could go now the runway is confirmed; 10 holes as two districts at the runway tip |
| [Draft layout v1](floorplan/layout-draft-zone-a.png) | Superseded: 10 holes in a line in Zone A |
| **Concept renders** (predate the city concept) | What the course looks like: [holes, Neon](concepts/holes-neon.png) · [course, Neon](concepts/course-neon.png) · [holes, Carnival](concepts/holes-carnival.png) · [course, Carnival](concepts/course-carnival.png) |
| [Scale and budget](docs/08-budget-model.md) | Movable formats, quantities, person-days, four cost scenarios, levers |
| [Quote-request templates](docs/06-rfq-templates.md) | Messages for builders, turf suppliers, rental companies and factories |
| [Operations and safety](docs/07-operations-and-safety.md) | Throughput, staffing, kit and safety checklist |
| [Status page](status/countdown-golf-status.html) | 18 Nov: one visual page with the gates, what's decided, today's changes, the plaza layout, capacity and cost. Published privately as an Artifact |
| [Project brief](docs/project-brief.md) | Original context, floorplan decode, earlier research and the **decision log** |
| [`CLAUDE.md`](CLAUDE.md) | Project memory for Claude Code sessions |

## Status (18 Nov 2026)

**Decided:** one night only · 31 Dec 2026 · 10 holes · temporary, movable set-up (no permanent install, no reuse).

**Needed by Fri 20 Nov (Gate 0):**
- [ ] Budget ceiling
- [ ] Expected crowd, and the hours golf runs
- [ ] Who builds: church crew, split, or outsourced?
- [ ] Install window confirmed (are 26–27 Dec used for services?)

**Team input 18 Nov:** the central strip is a raised runway (part of the stage). Design brief: one coherent "city", not a line; fun holes; a story that works in any order.

**Recommended, not decided:** hybrid local build · Bright City art direction · plaza at the runway tip, two 5-hole districts sharing one hub · 4 hero holes (8, 4, 2, 1) · see [the city concept](docs/09-city-concept.md).

## Folder map

```
docs/          planning documents (numbered in reading order)
floorplan/     auditorium plan, dimensions JSON, draft layout, source screenshots
reference/     inspiration photos and video stills
concepts/      isometric concept renders of the holes and the whole course (two art directions)
tools/         make_layout_svg.py (layout v1) · make_zone_options.py (zones, layout v2) · flow_sim.py (capacity) · make_concepts.py (renders)
```

Regenerate the layout after editing the dimensions or hole plan:

```bash
python3 tools/make_layout_svg.py floorplan/auditorium-dimensions.json floorplan/layout-draft-zone-a.svg
```
