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
| White central strip | Possibly a runway off the stage; striped end may be steps; a dotted outline may be a proposed extension | Low |
| Boxed structure at the right | Probably the control booth | Low |

### Measurements

All four were taken by the team in the planning tool. Geometry and coordinates for every zone are in `floorplan/auditorium-dimensions.json`.

| Measurement | Value | Screenshot |
|---|---|---|
| Room size (tool tooltip) | 54.7 × 27.1 m | `01-x-45.95m-stage-edge-to-booth.jpg` |
| Stage edge to booth (X) | 45.95 m | `01-x-45.95m-stage-edge-to-booth.jpg` |
| Central strip to bottom wall (Z) | 11.58 m | `02-z-11.58m-strip-to-bottom-wall.jpg` |
| Top wall features to central strip (Z) | 11.62 m | `03-z-11.62m-top-wall-to-strip.jpg` |
| Strip end to booth (X) | 20.73 m | `04-x-20.73m-strip-end-to-booth.jpg` |

Derived from these: the strip is about 23.7 m long (45.95 − 20.73, minus about 1.5 m from the stage edge) and about 2.4 m wide, and the two open floor halves are about 46 × 11.6 m each (roughly 533 m² each). The depth adds up to about 26.8 m against the 27.1 m room, with the difference sitting in the dark blocks along the top wall and the bottom wall margin.

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

## Ideas

Number the holes 10 down to 1, so finishing the course mirrors the midnight countdown, with hole 1 nearest the stage. The reference image's set pieces map well onto ten holes: windmill, barn tunnel, water wheel, curved path, plus simpler bank shots and ramps to keep build costs down.

## Decision log

Add a dated row whenever something is decided, and update the "Decided" section in `CLAUDE.md` to match. Recommendations from Claude are not decisions until the team confirms them.

| Date | Decision | Decided by |
|---|---|---|
| 2026-11-16 | Course is for a one-off event | Team |
| 2026-11-16 | Event is the countdown party on 31 Dec 2026 | Team |
| 2026-11-16 | 10 holes | Team |
