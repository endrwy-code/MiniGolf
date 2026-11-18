# Operations and safety on the night

A great course with a bad flow feels worse than a simple course that moves. This page covers throughput, staffing, kit and safety.

## Throughput

**Formula:** players per hour ≈ (holes × group size × 60) ÷ (minutes per hole × number of holes). With one group per hole, that simplifies to **players per hour ≈ (group size × 60) ÷ minutes per hole**. This is a **ceiling**: the course never reaches it, because it takes about 25 minutes to fill at opening and groups vary in speed (see "Simulated" below).

| Minutes per hole (group of 4) | Round time | Players on course | **Ceiling, players per hour** |
|---|---|---|---|
| 3.0 (casual, no rules) | 30 min | 40 | ≈ 80 |
| 2.5 | 25 min | 40 | ≈ 96 |
| **2.0 (5-stroke cap, marshals)** | **20 min** | 40 | **≈ 120** |
| 1.5 (groups of 3, quick holes) | 15 min | 30 | ≈ 120 |

The slowest hole sets the pace for everyone, so a 4-minute hero hole caps the whole course. **Time every hole at the dry run.**

### Simulated (18 Nov, `tools/flow_sim.py`)

A model of a real session (queue never empties, groups vary about ±35% in speed, walking time included, 300 runs) gives what to plan on. Assumes balanced holes at 2.0–2.25 min each, run as a loop you can start anywhere (`09-city-concept.md`, section 4):

| If golf runs for… | Full 10-hole round | One 5-hole district per group |
|---|---|---|
| 2 hours | ≈ 140–165 players | ≈ 340–380 players |
| 3 hours | ≈ 230–270 players | ≈ 540–600 players |

What the model says moves the number:
- **Free-order play doesn't help.** It serves 5–15% fewer players than an ordered course, because groups spend time finding free holes.
- **The slowest hole matters most.** Four hero holes a minute slower than the rest cut capacity by about a quarter.
- **Playing 5 holes instead of 10 more than doubles the people served.**
- **Capping the course at about 12 groups** keeps rounds short at little cost; the waiting moves to the queue.

Run `python3 tools/flow_sim.py --help` to test other assumptions.

**Compare this with the expected crowd.** If far more people want to play than the course can take:
- Switch to one 5-hole district per group (the biggest lever)
- Timed slots (free tickets for e.g. 20-minute waves) instead of an open queue
- A 5-stroke cap per hole (pick up after 5)
- Groups of 2–4; singles join a group
- A visible queue length sign ("about 20 min wait from here")
- Course closes at about 11:30 pm for the countdown itself (decide the exact time with production)

## Rules card (print on each totem or at the entry)

1. Putts only: no backswing above the knee.
2. Maximum 5 strokes, then pick up.
3. Let faster groups play through.
4. A ball off the course goes back to where it left, plus 1 stroke.
5. **Hole 1 keeps your ball.** That's the end of your round. (If the course runs as a start-anywhere loop, hand balls back at the hub instead: see `09-city-concept.md`.)

## Staffing (per shift; suggest 2 shifts)

| Role | Count | Job |
|---|---|---|
| Course lead | 1 | Decisions, radio to production, safety call |
| Entry and queue | 1–2 | Group people, explain the rules, hold the wave timing |
| Kit desk | 1–2 | Hand out putters and balls, collect putters at the exit |
| Course marshals | 3 | Each covers about 3 holes; keeps groups moving; resets props; watches edges and kids |
| Fixer | 1 | Toolkit, spare LED, tape and shims; fixes things fast |

That's about **7–9 volunteers per shift**. Brief them at the dry run, so they've played the course themselves.

## Kit list

| Item | Quantity | Notes |
|---|---|---|
| Putters | about 50 | Mixed lengths: kids (about 26–28"), standard (33–35"). About 40 in use plus spares. |
| Balls | about 120 | Bright or UV-reactive; several colours so groups can tell them apart; hole 1 keeps them, so plan to refill. |
| Ball-return bin at hole 1 | 1 | Staff empty it back to the kit desk. |
| Scorecards and pencils | Optional | Skipping scoring speeds things up. Decide this. |
| Spare LED strip, connectors, power supply | 1 set | |
| Gaffer tape, cable ramps, levelling shims, cordless drill | 1 kit | |
| Spare battery for the windmill motor | 2 | If it's motorised. |
| Torches, first aid kit, radios | per shift | |

## Safety checklist (walk it with the venue before doors)

**Trips and edges**
- [ ] Every platform edge has a contrasting colour and glow; tee entries are bevelled.
- [ ] No cable crosses a walkway without a flat cable ramp or matting.
- [ ] Gaps between holes are ≥ 1.2 m for walking, and wider at the queue.

**Exits and evacuation**
- [ ] **Check whether the dark blocks along the top wall are doors or exits.** The draft layout puts the walkway there. Keep the required exit widths completely clear.
- [ ] The course doesn't block any aisle, exit route or fire equipment on the venue's evacuation plan.

**Fire**
- [ ] Flame-retardant certificates for turf, carpet, vinyl wraps, foam and paint, to the venue's requirement (ask the venue's fire-safety manager what they need; in Singapore this is set by the venue's fire certificate and SCDF rules).
- [ ] No open flames, haze or pyro near the course without production's sign-off.

**Power**
- [ ] Course lighting is on its **own RCD-protected circuit**, not ND18 (101%) or ND21 (106%).
- [ ] Only low voltage (12/24 V) on the course; power supplies are off the course and protected.
- [ ] Rough load: 10 holes × about 15 m of LED × up to 10 W/m ≈ 1.5 kW, plus any UV floods. Production confirms the circuit.

**Balls and swings**
- [ ] Ramps and raised tiers have ball guards.
- [ ] The rules card says "putts only".
- [ ] Marshals collect stray balls from walkways continuously.

**Kids**
- [ ] Children play with a parent or guardian.
- [ ] No small loose parts on props.
- [ ] Props can't be climbed: bolted and stable.

**Accessibility**
- [ ] At least some holes can be played from the walkway edge (no step up needed) by wheelchair users or people with limited mobility.

## Golf run-of-show (template)

| Time | What |
|---|---|
| 4:00 pm | Course lead final check: level, LEDs, props, kit counted |
| 6:30 pm | Volunteer briefing; marshals play one round |
| Doors | Course opens |
| ~11:30 pm | Last group in (time agreed with production) |
| ~11:45 pm | Course closed; balls swept; putters collected |
| Midnight | Countdown |
| After | Load-out as agreed |
