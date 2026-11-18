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
| **[New York Countdown](docs/10-new-york-concept.md)** | **18 Nov (later): the ten New York holes, how each is built and why it holds up, the LED glow, layout v3 and decisions for G1** |
| **[Layout v3](floorplan/layout-v3-nyc.png)** | **The ten holes inside the golf zone, two districts and one hub, with every clearance checked** |
| [The city concept](docs/09-city-concept.md) | 18 Nov: the city brief, logic-checked. Its look is superseded by New York Countdown; play order and capacity still apply |
| **[Auditorium plan v2](floorplan/auditorium-simplified.png)** | **18 Nov: the team's tape measurements and the golf zone (stage side of a line 27 m from the stage front). Not-measured items are dashed** |
| [Zone options](floorplan/zone-options.png) · [Plaza layout v2](floorplan/layout-draft-plaza.png) | Superseded by the golf zone (18 Nov), and drawn on the old cable-plan geometry: 10 holes as two districts at the runway tip |
| [Draft layout v1](floorplan/layout-draft-zone-a.png) | Superseded: 10 holes in a line in Zone A |
| **Concept renders** (predate the city concept) | What the course looks like: [holes, Neon](concepts/holes-neon.png) · [course, Neon](concepts/course-neon.png) · [holes, Carnival](concepts/holes-carnival.png) · [course, Carnival](concepts/course-carnival.png) |
| [Scale and budget](docs/08-budget-model.md) | Movable formats, quantities, person-days, four cost scenarios, levers |
| **[Route C: carpenter + volunteers](docs/11-route-c-carpenter-build.md)** | **18 Nov: how to do New York for S$6–10k: what changes, hole by hole, a costed plan (≈ S$9.5k), who does what, the cut list, schedule and risks** |
| [Quote-request templates](docs/06-rfq-templates.md) | Messages for builders, turf suppliers, rental companies, factories and a freelance carpenter |
| [Operations and safety](docs/07-operations-and-safety.md) | Throughput, staffing, kit and safety checklist |
| [Status page](status/countdown-golf-status.html) | 18 Nov: one visual page with the gates, what's decided, today's changes, the plaza layout, capacity and cost. Published privately as an Artifact |
| [3D view](status/countdown-golf-3d.html) | 18 Nov (later): the New York holes on layout v3, to scale, with three lighting set-ups, a tee view of each hole, full screen, and a walk mode at human scale (child, average adult or tall adult). Published privately as an Artifact |
| [Project brief](docs/project-brief.md) | Original context, floorplan decode, earlier research and the **decision log** |
| [`CLAUDE.md`](CLAUDE.md) | Project memory for Claude Code sessions |

## Status (18 Nov 2026)

**Decided:** one night only · 31 Dec 2026 · 10 holes · temporary, movable set-up (no permanent install, no reuse).

**Needed by Fri 20 Nov (Gate 0):**
- [ ] Budget ceiling
- [ ] Expected crowd, and the hours golf runs
- [ ] Who builds: church crew, split, or outsourced?
- [ ] Install window confirmed (are 26–27 Dec used for services?)

**Team input 18 Nov:** the central strip is a raised runway (part of the stage). Design brief: one coherent "city", not a line; fun holes; a story that works in any order. New tape measurements (width 25.6 m, runway 22.54 × 2.4 m) and the golf zone: golf stays on the stage side of a line 27 m from the stage front. Later: a New York direction (Times Square on countdown night), holes like the hot dog and bicycle-wheel photos, lighting like the Electric Greens photo.

**Recommended, not decided:** hybrid local build · New York Countdown look and ten New York holes · layout v3: two 5-hole districts beside the runway sharing one hub at the tip · 4 hero holes (8, 6, 2, 1) · see [New York Countdown](docs/10-new-york-concept.md).

## Folder map

```
docs/          planning documents (numbered in reading order)
floorplan/     auditorium plan v2, dimensions JSON (v2; v1 kept), draft layouts, source sketch and screenshots
reference/     inspiration photos and video stills
concepts/      isometric concept renders of the holes and the whole course (two art directions)
tools/         make_floorplan.py (plan v2) · make_layout_nyc.py (layout v3, checks, 3D data) · make_layout_svg.py (layout v1) · make_zone_options.py (zones, layout v2) · flow_sim.py (capacity) · make_concepts.py (renders) · make_standalone.py (offline copies)
```

Redraw the auditorium plan after editing `floorplan/auditorium-dimensions.json`:

```bash
python3 tools/make_floorplan.py floorplan/auditorium-dimensions.json floorplan --png
```

Regenerate layout v3 and the 3D page's hole data after moving a hole (the script fails if a clearance breaks), then rebuild the offline copies:

```bash
python3 tools/make_layout_nyc.py floorplan/auditorium-dimensions.json floorplan --png --inject status/countdown-golf-3d.html
```

```bash
python3 tools/make_standalone.py
```

Regenerate the old v1 layout (v1 geometry) after editing its dimensions or hole plan:

```bash
python3 tools/make_layout_svg.py floorplan/auditorium-dimensions-v1-cable-plan.json floorplan/layout-draft-zone-a.svg
```
