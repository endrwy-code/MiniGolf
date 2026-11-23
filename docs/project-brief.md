# Project brief: countdown party mini golf

Compiled on 16 Nov 2026 from a claude.ai conversation with the HOGC team. `CLAUDE.md` holds the short version that every session needs; this file holds the detail, the reasoning and the sources. Prices and supplier details were looked up on 16 Nov 2026 and can change, so re-check them before anyone relies on them.

## What we're trying to do

The team wants a 10-hole mini golf course as one of the activities at the countdown party on 31 December 2026, set up inside the auditorium. It is a one-off event. The brief from the start was "the most value for our buck, but not low quality": something that looks custom and plays properly on the night, without paying for commercial-grade durability that will never be used.

The look comes from `reference/inspiration-backyard-minigolf.jpg`: a classic backyard course with a blue-and-yellow windmill, a red barn with a tunnel, a white water-wheel obstacle, timber edging, stone borders and a curving red path. That photo shows an outdoor build with real grass and brick, so it has to be translated into an indoor, modular version that can be set up on a finished floor and removed afterwards.

## How we got here

The team shared the reference image and four screenshots of their cable-planning tool, each with a measurement taken across the auditorium. Claude decoded the plan, produced the simplified plan in `floorplan/`, and researched where to source a custom course, initially assuming the course would be bought complete from a manufacturer in China. The team then confirmed it is a one-off event, on 31 Dec 2026, with 10 holes. With under seven weeks to go and a single use, the advice changed from "import a full course" to a hybrid build: buy only the turf ready-made and build everything else locally.

## The auditorium

### What the source plan is

The screenshots come from an event cable and power planning tool, not an architectural drawing. Its measuring tool locks to the X or Z axis and automatically suggests a cable length with 10% slack plus a 1 m service loop. The plan shows how power, lighting and network cables are laid out across the room.

| Label on plan | Meaning | Confidence |
|---|---|---|
| Red lines | Power cable runs | High |
| LX# (e.g. LX6, LX4.2) | Lighting circuits | High |
| ND# (e.g. ND18) | Power distribution nodes (distros) | High |
| D# (e.g. D47) | Device or data drops | Medium |
| "TRIP RISK x%" | Circuit load as a share of capacity | High |
| Blue fan icons | Wi-Fi access points | High |
| Dashed blue lines | Network cables to the access points | High |
| "IT-LAN-AP83 route TBD" | That access point's cable is not routed yet | High |
| Yellow marks along cable runs | Probably cable ramps or tape-down points | Low |
| Rivale 5–8 | Ayrton Rivale moving-head lights, which suggests the left end is the stage | Medium |
| "…e Blind 3–6" | Probably blinder lights (text is cut off on the left) | Medium |
| Hamond FL | Unknown | Unknown |
| White central strip | **A raised runway, part of the stage, joined to it in a cross shape (confirmed by the team 18 Nov).** Striped end probably steps or the joint with the stage; a dotted outline may be a proposed extension of about 8.6 m (estimated, unconfirmed) | High (purpose) |
| Boxed structure at the right | **The sound console (confirmed by the team 18 Nov)** | High |

### Measurements v2 (18 Nov 2026, current)

The team measured the room with a tape and wrote the numbers on a hand sketch (`floorplan/source-sketches/2026-11-18-hand-sketch-tape-measurements.jpg`). These replace the cable-plan measurements below, which had the width and the runway length wrong. Geometry: `floorplan/auditorium-dimensions.json`. Plan: `floorplan/auditorium-simplified.png`.

| Measurement | Value | How it's known |
|---|---|---|
| Room width | 25.6 m | Measured, rough |
| Top wall to runway | 11.65 m | Measured |
| Runway width | 2.4 m | Measured |
| Runway to LF platform | 10.25 m | Measured |
| LF platform depth | 1.3 m | Measured |
| Top wall to LF platform | 24.3 m | Measured (= 11.65 + 2.4 + 10.25) |
| Runway length, stage front to tip | 22.54 m | Measured |
| Stage front to golf limit | 27 m | Measured |
| Runway tip to golf limit | 4.46 m | Derived (27 − 22.54). The sketch's 4.9 m is wrong (team) |
| Speaker stands, out from the runway side | 51.5 cm | Measured |
| Room length | 54.7 m | Not re-measured: from the cable plan; the team says it is unchanged |

The team also confirmed what's on the sketch. Each side of the runway has stairs nearest the stage and two speaker stands toward the tip. The two curves at the stage-end corners are part of the stage. The marks either side of the sound console are doors or exits. The 11.65 m side goes at the top when the plan is drawn stage-left. Still not measured: stage depth, golf limit to the sound console, the console's size, the stage curves, the positions and sizes of the stairs and stands, the LF platform's length, and the door positions.

### Measurements v1 (16 Nov 2026, superseded)

All four were taken by the team in the planning tool. Geometry and coordinates for every zone are in `floorplan/auditorium-dimensions-v1-cable-plan.json`.

| Measurement | Value | Screenshot |
|---|---|---|
| Room size (tool tooltip) | 54.7 × 27.1 m | `01-x-45.95m-stage-edge-to-booth.jpg` |
| Stage edge to booth (X) | 45.95 m | `01-x-45.95m-stage-edge-to-booth.jpg` |
| Central strip to bottom wall (Z) | 11.58 m | `02-z-11.58m-strip-to-bottom-wall.jpg` |
| Top wall features to central strip (Z) | 11.62 m | `03-z-11.62m-top-wall-to-strip.jpg` |
| Strip end to booth (X) | 20.73 m | `04-x-20.73m-strip-end-to-booth.jpg` |

Derived from these: the strip is about 23.7 m long (45.95 − 20.73, minus about 1.5 m from the stage edge) and about 2.4 m wide, and the two open floor halves are about 46 × 11.6 m each (roughly 533 m² each). The depth adds up to about 26.8 m against the 27.1 m room, with the difference sitting in the dark blocks along the top wall and the bottom wall margin.

### From photos (19 Nov 2026)

The team's photos of the room in use put the back wall about 37 m from the stage front (about 10 m past the golf limit), not the 48.7 m the old cable plan implied, and show the heights (ceiling structure about 7.5–8.5 m, side trusses about 5.8 m), the wall finishes, the stage set and two exits in the 11.65 m wall. These are estimates, not measurements: method and implications in `13-auditorium-from-photos.md`.

**Revised 20 Nov:** the team says the room is much longer past the golf limit than the photos suggested ("maybe twice as long"). The estimate is now ≈ 20 m past the golf limit, so the back wall ≈ 47 m from the stage front and the room ≈ 53 m with the stage placeholder, which agrees with the old cable plan. The delay screen over the runway is two screens, one over each runway edge, facing outward (team). See the revision at the top of `13-auditorium-from-photos.md`.

### What the space means for golf

There is roughly 1,200 m² of open floor across the two halves. One adventure golf builder recommends 185–240 m² for an indoor 9-hole course, so 10 holes need roughly 200–270 m². That fits comfortably in one half with room for queues, leaving the other half free for the party.

The catch is cabling. Horizontal runs and vertical drops cross both halves every few metres. Either production routes the floor runs along the walls on the night, or the hole bases are raised (for example on battens) so cables pass underneath, with proper cable ramps wherever people walk. With one group of four per hole, about 40 people can play at once, so a big crowd needs a queue or timed slots.

### Safety flags

Two circuits on the plan are loaded past 100%: ND18 (LX4.2) at 101% and ND21 (LX6) at 106%. Above 100%, those breakers can trip in the middle of an event. This needs to go to whoever owns power, whatever happens with the golf. Separately, the course and its queues must not add new trip points over cable runs.

## Sourcing

### Recommended approach for a one-off event

| Option | What it means | When it makes sense |
|---|---|---|
| 1. Hybrid build (recommended) | Buy only the turf; a local carpenter or set builder makes bases, borders and obstacles from plywood or hard-coated foam, painted to the theme | Best value and most custom for a single event |
| 2. Hire a portable course | An event-rental company supplies, sets up and packs down | No build or storage; less custom. Get one quote as a price ceiling |
| 3. Buy a full course from China | Complete modular holes and fibreglass obstacles shipped in | Only if the course will realistically be reused or resold |

Turf is the one part worth buying ready-made, because it is light, cheap and hard to fake. 10 holes need roughly 60–80 m², which is below the 100 m² point where the cheaper bulk price starts on the listing found, so importing saves less than it would on a larger order. Get one local quote and one overseas quote with air freight in the week of 16 Nov, and choose whichever can guarantee delivery by mid-December.

The hero obstacles (windmill, barn tunnel, water wheel) should be built locally from plywood or hard-coated foam. Custom fibreglass from overseas is unlikely to arrive in time and is built for years of use the course doesn't need.

Most Alibaba listings called "mini golf course" are home putting mats. Useful search terms are "commercial portable mini golf", "adventure golf modular" and "putting turf".

### Quality checklist (one-off version)

- Get a turf swatch before ordering the full amount.
- Ask for fire-rating certificates for the turf and any foam, and check what the venue requires; this is about the indoor venue, not durability.
- A mid-range turf density is fine for one night; the top tier isn't needed.
- Skip the third-party pre-shipment inspection for a small turf order.
- Build modules two people can carry, that fit through the doors, and sit on rubber feet so nothing is screwed into the floor.
- If there's a real chance the course gets reused, screw the plywood bases together instead of gluing them so they can be stored.

### Research notes and sources (checked 16 Nov 2026)

| Source | Finding | Link |
|---|---|---|
| Alibaba listing, custom mini golf putting turf | $40/m² for 10–99 m², $20.60/m² from 100 m²; density tiers of 8,000, 12,000 and 15,000 tufts per m² | https://www.alibaba.com/product-introduction/Custom-Mini-Golf-Course-Indoor-Practice_1600560053544.html |
| Foshan Qingzhou Artificial Grass (PGM brand) | Verified custom manufacturer on Alibaba, about 490 staff, 100% on-time delivery record, 10 m² minimum order, about 20 days lead time for up to 1,000 m², ships from Guangzhou | https://pgmgolf.en.alibaba.com/product/1600249903020-817214813/PGM_custom_mini_golf_gazon_synthet_putting_green_grass_outdoor_yards_large_golf_training_aids_flag_poles_hole_cup_set_golf_green.html |
| Milco MFG (US) | Portable mini golf systems with powder-coated aluminium obstacles for daily commercial use; useful benchmark for "commercial grade" | https://portableminigolf.mediaroom.app/media-room/364747- |
| Natureworks (Australia) | Custom fibreglass mini golf props and themed courses; buy or hire | https://natureworks.com.au/products/minigolf-theming/custom-mini-golf-packages/custom-designed-mini-golf-course |
| Adventure Golf & Sports (AGS) | Custom modular mini golf system for courses in varied spaces | https://www.intergameonline.com/coin-op/news/modular-mini-golf-from-ags |
| Greenspan Projects brochure | Indoor 9-hole course needs about 185–240 m² | https://cdn.asp.events/CLIENT_DMG_Even_3A648F5C_9502_5004_99E8F7AED794D022/sites/SEA-2023-Arabic/media/libraries/brochures/12749-Greenspan-Projects-Adventure-Golf-Brochure-2023.pdf |
| ROLLER blog | Indoor 18-hole course about 5,000–10,000 sq ft; indoor 9-hole about 1,500–7,000 sq ft | https://www.roller.software/blog/cost-to-build-a-miniature-golf-course |

## Later research (16 Nov 2026, Claude Code)

Huadong Play evaluation, Singapore suppliers, other factories and cost benchmarks: see `04-sourcing.md` and `08-budget-model.md`. Planning logic: `01-how-to-think-about-this.md`.

## Ideas

Number the holes 10 down to 1, so finishing the course mirrors the midnight countdown, with hole 1 nearest the stage. The reference image's set pieces map well onto ten holes: windmill, barn tunnel, water wheel, curved path, plus simpler bank shots and ramps to keep build costs down.

## Decision log

Add a dated row whenever something is decided, and update the "Decided" section in `CLAUDE.md` to match. Recommendations from Claude are not decisions until the team confirms them.

| Date | Decision | Decided by |
|---|---|---|
| 2026-11-16 | Course is for a one-off event | Team |
| 2026-11-16 | Event is the countdown party on 31 Dec 2026 | Team |
| 2026-11-16 | 10 holes | Team |
| 2026-11-17 | One night only: temporary, movable set-up; no permanent install; no reuse planned | Team |
| 2026-11-18 | Fact confirmed: the central strip is a raised runway, part of the stage, joined in a cross shape. Players can't cross it. No extra cross-arm: stage plus runway form the cross. Runway height still to confirm | Team |
| 2026-11-18 | Design brief: holes read together as one coherent "city", not a straight line; each hole interesting to play; a story that works in any order. Look like the Pixar Putt references (method, not characters). Neon optional. Claude's response, not yet decided: `docs/09-city-concept.md` | Team |
| 2026-11-18 | Fact: the team's tape measurements replace the cable-plan geometry. Width 25.6 m (rough) = 11.65 + 2.4 runway + 10.25 + 1.3 LF platform; runway 22.54 m from the stage front to its tip. The box at the back is the sound console; each side of the runway has stairs nearest the stage, then two speaker stands (51.5 cm out); the stage corners curve to the side walls; doors or exits either side of the console. Plan v2: `floorplan/auditorium-simplified.png` | Team |
| 2026-11-18 | Golf zone: the mini golf stays on the stage side of a line 27 m from the stage front (4.46 m past the runway tip); the floor beyond it is for other activities. The plaza layout v2 sits mostly beyond this line, so it needs redoing | Team |
| 2026-11-18 | Design direction: New York on countdown night, with a Times Square feel. Holes in the style of the hot dog and bicycle-wheel photos (`reference/user-refs/07`, `08`); lighting like the Electric Greens photo (`06`): it glows, but you can still see. Every hole interesting to play and to look at, well thought out and robust. Claude's response, not yet decided: `docs/10-new-york-concept.md` (ten holes, layout v3, lighting spec) | Team |
| 2026-11-20 | Fact: the delay screen over the runway is two screens hung parallel to the runway, one over each edge (≈ 2.4 m apart), back to back: one faces the 11.65 m-side half of the room, the other the LF-platform half | Team |
| 2026-11-20 | Team's view (not measured): the room is much longer past the golf limit than the 19 Nov photo estimate, "maybe twice as long". Claude's estimate from that and the old cable plan: back wall ≈ 47 m from the stage front (44–50 m), ≈ 20 m past the golf limit; plan, layout v3 and the 3D model updated. Tape it to confirm | Team (estimate by Claude) |
| 2026-11-20 | Idea to explore, not decided: find the factories behind simple portable mini golf products (Taobao, Pinduoduo, 1688) and have one make custom lanes. Claude's response: `docs/14-china-factory-contacts.md` (contact list, message in English and Chinese, how to trace a shop to its factory) | Team |
| 2026-11-23 | Fact: the team's only marketplace account is Taobao (it also signs in to Tmall and 1688); no Pinduoduo or Alibaba.com account. The round-2 sourcing brief skips Pinduoduo and browses Alibaba.com without signing in; PGM's export contact is reached by WhatsApp or email | Team |
