#!/usr/bin/env python3
"""Layout v4, "New York Countdown" iteration 1 (docs/14-new-york-iteration-1.md): the ten iteration-1 holes in the
golf zone, on the v2 (18 Nov) geometry plus the 20 Nov room facts from the 3D page (sound console at x 49-53,
two side exits in the top wall).

Usage:
    python tools/make_layout_nyc_v4.py floorplan/auditorium-dimensions.json floorplan [--png]
           [--layout-out ../_work/3d-iter1/layout.json] [--inject PAGE.html]

Writes floorplan/layout-v4-nyc.svg, .json (and .png with --png, rendered with headless Chrome). With --layout-out it
also writes the same LAYOUT object for the 3D page; with --inject it replaces the page's /* LAYOUT:BEGIN */ block.
Layout v3 (tools/make_layout_nyc.py, doc 10's holes) is left as it was.

Everything here is a proposal (Claude, 27 Nov), not a decision. Positions sit on values that are not measured
(stage depth, stair and speaker-stand positions, the console, the exits), so treat them as about +-0.5 m (doc 14).

Editing sizes: change SIZES (and, for the L, Z and U holes, their shapes in SHAPES). Holes are placed from the
anchors under "placement", so a longer hole grows away from its anchored end. Re-run and read the checks: the script
stops on any broken rule and prints the tightest value of each.

Rules checked (distances between footprints: occupied deck rectangles, the street-sign totem, props beside a deck,
and shared scenery that stands on the floor):
  - hole to hole                     >= 1.2 m   (a walkway between any two holes)
  - hole to side wall                >= 1.6 m   (skyline flats 0.4 m deep on the wall, then a 1.2 m walkway)
  - hole to runway side              >= 1.75 m  (speaker stands stick out 0.515 m, then a 1.2 m walkway)
  - hole to stage front              >= 6.5 m   (stairs and performer access kept clear; stage front not measured)
  - hole to golf limit               >= 0.6 m
  - hole to hub                      >= 1.5 m
  - hub to runway tip                >= 1.2 m   (the only walkway between the two districts)
  - every walk route keeps a 1.2 m corridor clear of every hole except the hole it starts or ends at, and of all
    standing scenery; a route never runs closer than 0.3 m to its own holes; routes never cross
  - props taller than 2 m (hole props, the facade, portal flats, festoon poles and festoon runs) stay at least
    0.5 m outside the assumed sound-console sightline to the runway
  - side exits in the top wall: nothing standing within 1.5 m of the wall across the door width +-0.3 m
  - scenery: the same wall, runway, stage-front, golf-limit and hub rules as the holes; >= 1.2 m from every hole
    it is not attached to (attached scenery is exempt from its own hole's clearance and listed as an exemption)
  - the shared brownstone facade stays inside z 9.9 (doc 14, M8)
"""
import json
import math
import os
import pathlib
import re
import subprocess
import sys
import tempfile

FONT = "Helvetica, Arial, sans-serif"

# ---------------------------------------------------------------- inputs
ARGS = [a for a in sys.argv[1:]]
dims = json.load(open(ARGS[0], encoding="utf-8"))
OUT = ARGS[1] if len(ARGS) > 1 and not ARGS[1].startswith("--") else "floorplan"
PNG = "--png" in ARGS
INJECT = ARGS[ARGS.index("--inject") + 1] if "--inject" in ARGS else None
LAYOUT_OUT = ARGS[ARGS.index("--layout-out") + 1] if "--layout-out" in ARGS else None
_WIN_CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
_LINUX_CHROME = "/opt/pw-browsers/chromium"
CHROME = os.environ.get("CHROME") or (_LINUX_CHROME if os.path.exists(_LINUX_CHROME) else _WIN_CHROME)
# Linux containers run as root: Chrome needs --no-sandbox there. Windows keeps its sandbox.
CHROME_EXTRA = ["--no-sandbox"] if sys.platform.startswith("linux") else []

ROOM_W = dims["auditorium"]["width_z"]           # 25.6, measured (rough)
SX = dims["stage"]["front_x"]                    # 6.0, not measured
RW_X0, RW_X1 = dims["runway"]["x"]               # 6.0 .. 28.54
RW_Z0, RW_Z1 = dims["runway"]["z"]               # 11.65 .. 14.05
GX = dims["golf_limit"]["x"]                     # 33.0
STAND_OUT = 0.515
# 20 Nov room facts (the 3D page, W/base.html), where they differ from the JSON. None of these are measured.
ROOM_L_EST = 53.0                                # back wall about 47 m from the stage front (20 Nov estimate)
CON = {"x": [49.0, 53.0], "z": [8.35, 17.35]}    # JSON says x 50.7-54.7; the page moved it with the back wall
SIDE_EXITS_TOP = [(16.0, 17.8), (23.0, 24.8)]    # exits seen in photos; positions are guesses (+-2-3 m)
EXIT_CLEAR = 1.5                                 # keep this deep clear in front of each exit
EXIT_SIDE_MARGIN = 0.3                           # ... across the door width plus this on each side

WALL_CLEAR = 1.6
RUNWAY_CLEAR = 1.75
APRON_X = SX + 6.5
LIMIT_CLEAR = 0.6
HUB = (30.0, 11.0, 32.6, 14.7)                   # x0, z0, x1, z1: the Tee Booth (unchanged from v3)
ACC = 0.6                                        # tee standing point, metres behind the tee end
FACADE_Z_MAX = 9.9                               # doc 14 M8: the facade and its bracing stay inside z 9.9
TALL_MARGIN = 0.5
TOTEM_HALF = 0.18                                # totem base 0.36 m square (the page draws it there)

# ---------------------------------------------------------------- the holes
# Builder frame (the brief's frames table): u along the hole (tee end at -L/2), v across it, metres; L, Z and U
# shapes turn toward +v. mirror=True multiplies every v by -1 (the builders do the same with K.s). The page puts the
# totem at u = -L/2 + 0.3, v = tside * (W/2 + 0.45) in the page frame, NOT mirrored, so tside is a page-frame side.
# Integration (27 Nov): 9, 6 and 3 take the real sizes their builders report (doc 14's numbers kept, the box grew:
# 9 needs 5.13 m to the back rail, 6 keeps its 3.0 and 1.4 m legs clear inside the rails, 3's rails stand outside
# doc 14's 2.4 m of clear widths). Hole 1 keeps doc 14's 6.2 m box although the built hole uses 5.38 m of it.
SIZES = {10: (5.4, 1.25), 9: (5.13, 1.95), 8: (5.2, 1.5), 7: (5.4, 1.6), 6: (4.552, 3.6),
         5: (4.8, 2.8), 4: (5.0, 1.8), 3: (4.0, 2.552), 2: (3.4, 2.1), 1: (6.2, 2.2)}

# Occupied rectangles (u0, v0, u1, v1) for the shaped holes, over the rails as the builders built them (integration,
# 27 Nov; the frames table's first guesses are replaced). Straight holes use their whole box. Labels are for the plan
# drawing only.
SHAPES = {
    6: [("harbour leg and banked corner", (-2.276, -1.8, 2.276, -0.748)), ("island", (0.724, -0.748, 2.276, 1.452)),
        ("statue pedestal", (1.15, 1.452, 1.85, 1.8))],
    5: [("leg 1", (-2.076, -1.126, 0.326, -0.074)), ("leg 2", (-0.726, -1.126, 0.326, 1.126)),
        ("leg 3", (-0.726, 0.074, 2.076, 1.126)),
        ("tree pocket", (0.326, -1.4, 2.4, 0.074)), ("tree pocket", (-2.4, -0.074, -0.726, 1.4)),
        ("sign and lamp", (2.076, 0.074, 2.4, 1.4))],
    3: [("ramp leg", (-2.0, -1.276, 1.25, -0.124)), ("loop box and tile wall", (1.25, -1.276, 2.022, 1.276)),
        ("return green", (-1.426, 0.124, 1.25, 1.276)), ("island box", (-1.426, -0.124, 1.25, 0.124))],
}

# Card text (doc 14, plain English; G1/G2 applied: heights are relative to each hole's lowest playing surface, which
# sits 100 mm off the floor on the factory deck; holes 4 and 5 have no raised green).
TEXT = {
    10: dict(
        play="Stand beside the open tee side and putt along the top landing. The ball drops onto a stoop that sags toward the façade, over a skewed lip, then onto the green, and runs at the cup in a painted cellar hatch. A soft putt stalls on a terrace and is played on from there.",
        mech="Lane 0.95 m on four boxes, each lower than the last: tee landing (1.0 m), T2 65 mm down (1.2 m, 1.5° cross-fall toward the façade), T3 20 mm down (1.0 m, lip skewed 20°), green 40 mm down (1.9 m). Cup 1.2 m past the last lip, 0.2 m off centre away from the sag. Ace about 2.4–2.5 m/s.",
        build="Four terrace boxes on the factory deck with rounded lips and PVC angle nosings, one stepped rail, back corners filled. Brownstone-painted risers, iron-railing silhouettes, glow tape on every nosing, green LED. Shares the brownstone façade (lit windows, fire escape) with hole 9.",
        miss="A short ball rests on a terrace within 0.5 m of a rail, so it is always in reach, and nothing rolls back up a step. A drop adds no speed, so the pace stays in the player's hands.",
        risks="Chipped lips; players stepping onto terraces (boxes rated to stand on); the sag read as a build fault (paint a crack); the tee landing, about 225 mm off the floor, is high for small kids (junior tee on T2).",
        clock="A window clock on the façade reads 11:59.",
        surface="Green carpet grass on four terraces; brownstone risers with stone-look nosings."),
    9: dict(
        play="One shot each, curling style. Putt down the lane, up the crust and onto a 1.6 m pizza. The ball's centre scores: centre pepperoni (the cup) 1, inner circle 2, on the pizza 3, anywhere else 4. Balls stay until all four have putted, so knock-ons count; the youngest player calls close ones.",
        mech="Lane 2.6 m, 0.95 m wide, flaring to 1.75 m. The crust is a full-width 1:5 bevel rising 75 mm onto a house levelled to ±2 mm: eight Ø150 pepperoni, the centre one the flush cup, 3.8 m from the tee, inside a Ø0.60 m dashed circle. Ace about 2.3 m/s; the 2-point window is about ±4% of speed.",
        build="A lane and a raised house deck, the crust bevel, flare walls, and an oven gutter behind the pizza: 120 mm wide, 45 mm deep, falling 3° to an open 250 mm pick-up pocket at one rail. Painted pizza, a 1.2 m slice sign, the pizzeria shopfront on the shared façade, \"1 SHOT · CURLING\" on the totem, orange LED.",
        miss="Too soft rolls back down the crust and scores 4. Too hard drops into the oven gutter, scores 4 and can't come back, so smashing never pays. Nothing to clear between players.",
        risks="Speed of the pizza surface (speed strip on 3 Dec); seams in the pizza; floor flatness under the levelled house; kids asking for another go.",
        clock="The pizzeria's menu board reads 11:59.",
        surface="Green carpet grass lane; a pizza painted on one carpet (cheese, pepperoni, crust ring)."),
    8: dict(
        play="Putt under the cart's arch between the ketchup and mustard bottles, up a short kerb and into an open giant bun whose curved faces steer the ball along a mustard squiggle to the cup near its closed end. Too soft rolls back off the kerb; too hard rebounds off the rounded end. The friendly ace hole and the food photo.",
        mech="Lane 1.3 m. Cart arch 430 mm high, full width, counter 0.6 m deep. A 1:5 kerb rises 75 mm into the bun: halves 1.3 m long and 150 mm high, mouth 0.90 m narrowing to a 0.40 m channel, closed end R 0.20 m, cup 0.30 m from the end. Ace about 2.2–2.4 m/s.",
        build="Bun boxes skinned in bent 3 mm hardboard, 5 mm EVA on the inner faces, PVC angle on the mouth noses, filled to the rails; the cart counter and arch as a flat. Golden bun, Ø180 bottles touching the rails, fries, a striped umbrella on a sandbagged post outside the rail, red LED.",
        miss="Short rolls back off the kerb; wide stays in the lane; under the counter is at most 0.3 m in. Every ball ends within putter reach.",
        risks="Mouth corners (PVC angle, 45° fills where they meet the rails); the cup must be dead flush; if aces pass about 40%, move the cup 0.1 m off axis.",
        clock="The cart's menu board: \"Open till 11:59\".",
        surface="Green carpet grass lane; a mustard squiggle painted inside the bun."),
    7: dict(
        play="One pair at each end of a narrow bridge with a hump and the cup on top. On \"3-2-1\" both putt at once. Too soft rolls back; too hard crosses to the other borough and is played by its owner from that end. Then the second pair. Groups with small kids take turns.",
        mech="Lane 5.0 m, D-shaped end rails. A 0.60 m plateau 150 mm up with the cup in the middle; 12° ramps about 0.95 m long; approaches about 1.25 m. Rails narrow from 0.9 to 0.50 m over each ramp, which cross-falls 3° to the centre. A 10 mm rubber catch ring circles the flush cup. About 2.2–2.35 m/s from the tee.",
        build="Graded ribs under a flexi-ply skin, a solid plateau for the cup sleeve, tapered rails. Two bridge-tower flats on posts outside the rails, sandbagged, crossbeams at 2.1 m or more, with festoon \"cables\" at least 2.4 m up. Plank-printed roadway, yellow LED.",
        miss="Every miss returns by gravity to an end, so nothing stops out of reach. A ball that crosses is played by its owner from the end it reached, after the other player.",
        risks="Smashes (\"no backswing above the knee\"); simultaneous clashes upsetting kids; floor level under the cross-fall; tower openings at head height.",
        clock="A bridge lamp clock reads 11:59.",
        surface="Plank-printed roadway over the hump; its ends meet Liberty's harbour carpet."),
    6: dict(
        play="Putt along the blue harbour at a breaking wave in the corner. The ball rides round it 90° toward Liberty Island; with pace it climbs the shore and runs at the cup in the star-shaped pedestal. Too soft slides back to the wave foot; too hard lands deep.",
        mech="Leg A: a 3.0 × 0.9 m harbour. The corner is a conical banked face curved at about R 1.0 m in plan, 400 mm high with a 50 mm curl lip and cheeks closed to the rails, so the ball rides round at any speed. Leg B: a 2.2 × 1.4 m island 75 mm up a 1:5 shore; cup 1.2 m past the crest.",
        build="Tapered radial ribs at 150 mm or less under a flexi-ply skin, closed back, padded curl nosing, foot seam 1 mm or less; island deck; the 2.6 m statue (drawn from the original 1886 statue) with a battery flame on a pedestal of at least 30 kg outside the rail. Wave paint, harbour skyline, teal LED.",
        miss="Weak balls roll back to the wave foot within 0.6 m of a rail. The bank is closed at both cheeks, so nothing leaves the hole.",
        risks="Kids treating the wave as a skate ramp (\"no climbing\" pictogram, marshal brief); pace (lever: cup 0.3 m nearer the crest). The full-width rig on 3 Dec must send at least 70% to the island, or it falls back to a flat chamfer bank.",
        clock="Liberty's tablet reads XI:LIX.",
        surface="Blue harbour carpet with a painted breaking wave; green island with a painted star."),
    5: dict(
        play="Midtown's teaching hole. A park path zig-zags twice; each curved outer rail carries a well-paced ball round, under a stone arch and onto a flat lawn to the cup in a fountain. Sign line: \"the rail is your friend\".",
        mech="Path 0.9 m; legs 1.8, 1.2 and 2.2 m. Outer corners curved R 0.9 m with a hard, low-friction face; inner corners rounded and filled. The lawn stays flat: the factory deck gives the cup its depth. Expect 25–30% speed loss per corner, so an ace is doubtful.",
        build="Each curve is five stacked plywood arcs, the top one forming the cap, screwed to plates every 300 mm: no spring-back, no free ends. Two borrowed Christmas trees (bases 0.9 m or less) with fairy lights in the Z's pockets, the old bike wheels outside the rails, benches, lamp posts, arch, fountain, blue LED. A painted park-wall cut-out faces Gridlock.",
        miss="A soft ball stops within 0.45 m of a rail; a hard one rides the curve. Every resting spot is in reach.",
        risks="Scrub on the curves (measure the loss on the 3 Dec corner rig); tree bases breaking clearances; the course's slowest hole at up to 2.7 min (lever: tee at leg 2).",
        clock="A park clock reads 11:59.",
        surface="Green carpet grass path and a flat lawn round the fountain cup."),
    4: dict(
        play="Putt through a jam of eight cabs on Fifth Avenue; bold players thread one of two avenues, and two angled cabs bank toward a manhole-cover cup on a zebra crossing. The kids-against-adults equaliser.",
        mech="Lane 5.0 × 1.8 m. Cabs 360 × 170 × 140 mm in two staggered rows of 3 (avenues about 0.30–0.35 m) plus two at 30°. Every gap at least 0.27 m or closed, and the acute pockets by the angled cabs filled. The zebra crossing is printed flat, with the manhole-cover cup on it.",
        build="Charcoal needle-punch lane, yellow lines and a printed zebra crossing; cab blocks screwed down from below; invented \"CAB 1159\" livery, cones painted on the rails, purple LED. Hole 3's subway kiosk stands on its sidewalk.",
        miss="Every resting spot is within 0.9 m of a rail, and no pocket can trap a ball where a putter can't reach.",
        risks="Acute V pockets by the angled cabs (fill them); chaos strokes slowing the hole (lever: open an avenue).",
        clock="A cab meter reads 11:59.",
        surface="Charcoal \"asphalt\" needle-punch, yellow lane lines, a printed zebra crossing."),
    3: dict(
        play="Putt up the station steps. Funnel rails steer the ball into one of three tiled portals (left Express, centre Local, right Shuttle). It vanishes, races round a hairpin under a clear lid and shoots out on the opposite side heading back toward you, with the Express exit on the cup line. Walk round and putt out.",
        mech="A 1:6 ramp climbs about 245 mm to a 0.5 m platform falling 1:12 to three 110 mm portals. 1:4 lead-ins drop each ball into a loop floor tilted 5–6°: hairpins R 0.30, 0.44 and 0.58 m under a clear lid. Carpeted bevels step down to the return green; cup 1.2 m out on the Express line.",
        build="Ramp and platform; a loop box with a tilted plane floor, shaped lead-ins and walls of stacked plywood arcs (CNC-cut); a 4 mm polycarbonate lid with 60 mm headroom and four thumbscrews; return green; a 0.4 m island box. White-tile portal wall with invented line symbols (star, ring, diamond), ice-blue LED. Its 1.6 m kiosk with globe lamps stands on Gridlock's sidewalk.",
        miss="Too soft rolls back down the ramp to the tee; every channel falls, so no ball can stall inside, and the lid lifts off in under 20 s if one ever does.",
        risks="Loop stall is the course's main physics unknown (lever: a bigger entry drop, not a bigger radius); the ramp needs about 2.5 m/s, hard for small kids (junior tee at the ramp foot; after two roll-backs, place it on the platform for +1); polycarbonate fire rating. Built first, as the 4 Dec prototype.",
        clock="The platform clock reads 11:59.",
        surface="Carpet grass steps, platform and return green; white subway-tile portal wall; clear lid over the loops."),
    2: dict(
        play="Tee at the brass whisper spot. A round information booth blocks the straight line to the cup at the other spot, under the big clock. The sign: \"Aim anywhere off the wall. Every bounce is the same distance.\" The game is the weight.",
        mech="Ellipse a = 1.40, b = 0.95 m, so each focus is 1.03 m from the centre: tee at one, cup at the other, and every wall path is 2.80 m. The Ø0.40 × 0.35 m booth blocks shots within about ±12° of the straight line. One flat deck levelled to ±2 mm. About 1.9–2.4 m/s from the tee.",
        build="A deck in three pieces (seams over 300 mm from the spots), a three-lamination flexi-ply rail with a hard lacquered face (no EVA), the ballasted booth with four clock faces, and the Ø1 m clock at 11:59 on a 30 kg braced post behind the cup. Teal star field, brass spots, amber LED.",
        miss="The ellipse returns every ball; nothing is ever more than 0.95 m from the rail.",
        risks="Real rebounds (the 3 Dec rig with the real face decides; the octagon fallback is drawn); deck level; laminations opening. If scatter fails, a shallow 1.5–2° dish round the cup.",
        clock="The big clock at 11:59, facing hole 1's 2027.",
        surface="Green carpet grass ellipse, brass whisper spots, teal star-field backdrop."),
    1: dict(
        play="The finale. Putt up the red steps; too soft rolls back for another try. Over the crest the ball rattles down a lit peg board under a clear cover into a slot marked 3, 2, 1, 2, 3; the centre is DROP and the 2027 neon flashes. Score is roll-backs plus the slot number. Every ball rolls out to a tray and goes back to the hub.",
        mech="Lane 1.0 m with 0.8 m of flat from the tee. A 1:6 ramp, 1.2 m long, climbs 200 mm; the 0.3 m crest tilts 3° toward the board. Board 0.80 × 0.80 m at 12° with about 115 pegs under a clear cover; five 130 mm slots run out to an open tray. About 2.3 m/s from the tee.",
        build="Ribbed ramp with a flexi skin, a jig-drilled peg board under a 4 mm polycarbonate cover, slots and a carpet-lined floor tray. A 2.8 m tower with 2027 neon and a borrowed mirror ball (optional battery spinner, decor only), braced and ballasted at 60 kg or more; two billboards with invented brands facing the party floor; magenta LED.",
        miss="A weak putt rolls back to the tee; nothing can stop on the covered board or the tilted crest; no ball is kept.",
        risks="Kids cresting (junior tee at the ramp foot, place rule); peg jams (200-drop rig); tower ballast; fire rating; rolling it aside if golf closes before midnight. Say \"countdown ball\", never the trademarked name.",
        clock="A billboard clock reads 11:59.",
        surface="Red-step ramp, lit peg board under a clear cover, carpet-lined tray."),
}

META = {  # n: district, name, sign, role (doc 14 difficulty curve), par, minutes per group (review figure), lesson, glow
    10: ("A", "Brownstone Stoops", "Stoop to Conquer", "Teach", 2, "2.3", "K12 Rice Terraces", "#3BE36B"),
    9: ("A", "Brooklyn Pizza", "Pizza the Action", "Social", 3, "1.9–2.1", "K08 Six-Cup", "#FF6A2B"),
    8: ("A", "Hot Dog Cart", "Relish the Moment", "Friendly ace", 2, "2.1–2.3", "K05 funnel; ref-07", "#FF2E4D"),
    7: ("A", "Brooklyn Bridge", "Meet You in the Middle", "Spike", 2, "2.2–2.4", "K10 canopy", "#FFE21A"),
    6: ("A", "Liberty Island", "Lift Your Lamp", "Hardest", 3, "2.4", "K04 Quarter-Pipe", "#2EE6B8"),
    5: ("B", "Central Park Loop", "Wheel See You Next Year", "Teach", 3, "2.5–2.7", "K03 Riveted Curve; ref-08", "#2F80FF"),
    4: ("B", "Gridlock", "Don't Honk. Just Putt.", "Chaos", 3, "2.5–2.6", "K13 Block Green", "#9B5CFF"),
    3: ("B", "The Subway", "Stand Clear of the Closing Doors", "Spike", 3, "2.3–2.5", "K01 vanish; K05 funnel", "#79DCFF"),
    2: ("B", "Grand Central Whispering Gallery", "Meet Me Under the Clock", "Spike", 2, "2.2–2.4 (2.5–2.7 if rebounds scatter)", "K03 further; K02 blocker", "#E8A33A"),
    1: ("B", "Times Square", "Drop the Ball", "Lottery finale", 2, "2.2–2.5", "\"One big gesture\"", "#FF3DCB"),
}

# Points in the builder frame: tee, cup (frames table), the exit standing point (where players leave for the next
# hole), props over 2 m (u, v, height) and props that stand outside the box (extras: label, (u0, v0, u1, v1), height).
POINTS = {
    10: dict(tee=(-2.35, 0.0), cup=(1.75, -0.2), exit=(2.2, -1.225), tall=[], extras=[]),
    9: dict(tee=(-2.265, 0.0), cup=(1.535, 0.0), exit=(2.0, 1.575), tall=[], extras=[]),   # builder re-centred by -0.065 m
    # umbrella: sandbagged post beside the cart, outside the rail on +v (toward 9 and 10); position assumed, see notes
    # (integration: the post as built, at the cart's centre u -0.7, 0.9 m off the axis on the side away from the totem)
    8: dict(tee=(-2.3, 0.0), cup=(2.05, 0.0), exit=(2.1, 1.35), tall=[(-0.7, 0.9, 2.2)],
            extras=[("umbrella post and sandbag", (-0.9, 0.735, -0.5, 1.065), 2.2)]),
    # two tower flats spanning the lane over the approaches (>= 0.6 m clear of each ramp foot), posts at v +-0.7
    7: dict(tee=(-2.25, 0.0), tee2=(2.25, 0.0), cup=(0.0, 0.0), exit=(3.3, 0.0),
            tall=[(-1.3, -0.66, 2.6), (-1.3, 0.66, 2.6), (1.3, -0.66, 2.6), (1.3, 0.66, 2.6)], extras=[]),   # as built
    6: dict(tee=(-1.9, -1.274), cup=(1.5, 0.951), exit=(2.8, 0.95), tall=[(1.5, 1.626, 3.2)], extras=[]),   # flame top 3.2 m
    5: dict(tee=(-1.7, -0.6), cup=(1.3, 0.6), exit=(3.2, 0.93), tall=[(0.95, -0.75, 2.28), (-1.12, 0.78, 2.38)], extras=[]),
    4: dict(tee=(-2.2, 0.0), cup=(1.7, 0.0), exit=(2.0, -1.5), tall=[], extras=[]),
    3: dict(tee=(-1.7, -0.7), cup=(0.05, 0.58), exit=(1.0, 1.8), tall=[], extras=[]),
    2: dict(tee=(-1.028, 0.0), cup=(1.028, 0.0), exit=(2.3, 0.0), tall=[(1.58, 0.0, 2.3)], extras=[]),
    # (integration: tower and billboards as built; the tower stands right behind the tray, 0.82 m short of the box end)
    1: dict(tee=(-2.2, 0.0), cup=None, exit=(3.7, -0.8), tall=[(1.88, 0.0, 2.8), (-0.4, 0.98, 2.0), (-0.4, -0.98, 2.0)], extras=[]),
}

# ---------------------------------------------------------------- placement (anchors; edit these, not the centres)
# Downtown (top side, z < 11.65)
ZR = 9.0           # runway-side edge of holes 10 and 9; the facade stands 0.15 m behind it (doc 14: inside z 9.9)
X10E = 28.45       # hole 10's tee end (tee point 0.6 m further, 0.78 m from the bridge-arch post)
GAP_10_9 = 2.07    # doc 14 M8: the facade's L-jack stands in this gap (2.2 before hole 9 grew to 5.13 m; keeps 9-8 at 1.2 m)
X8C, Z8N = 13.9, 1.7      # hole 8: centre line (its totem on the stage side just clears the 12.5 m apron), north end
X7W, Z7AX = 15.95, 2.4    # hole 7: west end and axis (wall side 1.6 m from the top wall)
X6E = 27.5                # hole 6: east end (2.5 m short of the hub; doc 14 says about 2.8)
# Midtown (bottom side, z > 14.05)
Z_ROW1 = RW_Z1 + RUNWAY_CLEAR   # 15.8: runway side of holes 5 and 4
X5E = 27.4
GAP_5_4 = 1.6             # leaves 1.35 m from hole 4 to the park-wall cut-out on hole 5's end
X3W, Z3S = 19.1, 23.4     # hole 3: west end, south edge (1.8 m walkway along the bottom-wall flats for putting out)
GAP_3_2 = 1.3
Z2C = 22.3
X1C, Z1N = 31.25, 17.4    # hole 1: centre line (0.65 m inside the golf limit), north end (2.7 m from the hub)


def _hole(n, c, th, mirror, tside):
    d, name, sign, role, par, mins, lesson, glow = META[n]
    L, W = SIZES[n]
    h = dict(n=n, d=d, name=name, sign=sign, role=role, cls=role, par=par, mins=mins, lesson=lesson, L=L, W=W,
             c=c, th=th, mirror=mirror, tside=tside, glow=glow)
    h.update(TEXT[n])
    h.update(POINTS[n])
    h["shape"] = SHAPES.get(n, [("deck", (-L / 2, -W / 2, L / 2, W / 2))])
    return h


def build_holes():
    L = {n: SIZES[n][0] for n in SIZES}
    W = {n: SIZES[n][1] for n in SIZES}
    x9e = X10E - L[10] - GAP_10_9
    x4e = X5E - L[5] - GAP_5_4
    x2w = X3W + L[3] + GAP_3_2
    leg_a_axis = (SHAPES[6][0][1][1] + SHAPES[6][0][1][3]) / 2       # -1.275: hole 6's harbour leg lines up with 7
    return [
        # th: tee -> far end direction in degrees from +X toward +Z (as v3 and the page)
        _hole(10, (X10E - L[10] / 2, ZR - W[10] / 2), 180, True, 1),    # mirror: the facade (builder +v) is on +z
        _hole(9, (x9e - L[9] / 2, ZR - W[9] / 2), 180, False, 1),     # totem on the walkway side: the facade stands on the runway side
        _hole(8, (X8C, Z8N + L[8] / 2), -90, False, -1),
        _hole(7, (X7W + L[7] / 2, Z7AX), 0, False, 1),
        _hole(6, (X6E - L[6] / 2, Z7AX - leg_a_axis), 0, False, 1),
        _hole(5, (X5E - L[5] / 2, Z_ROW1 + W[5] / 2), 180, False, -1),
        _hole(4, (x4e - L[4] / 2, Z_ROW1 + W[4] / 2), 180, False, -1),
        _hole(3, (X3W + L[3] / 2, Z3S - W[3] / 2), 0, False, -1),
        _hole(2, (x2w + L[2] / 2, Z2C), 0, False, -1),
        _hole(1, (X1C, Z1N + L[1] / 2), -90, False, -1),
    ]


HOLES = build_holes()
H = {h["n"]: h for h in HOLES}


# ---------------------------------------------------------------- geometry
def s_of(h):
    return -1 if h["mirror"] else 1


def l2w(h, u, v):
    """Page-frame local (u, v) to world (x, z)."""
    t = math.radians(h["th"])
    return (h["c"][0] + u * math.cos(t) - v * math.sin(t), h["c"][1] + u * math.sin(t) + v * math.cos(t))


def b2w(h, u, v):
    """Builder-frame local (u, v) to world: the builders multiply v by K.s."""
    return l2w(h, u, s_of(h) * v)


def lrect(h, u0, v0, u1, v1):
    return [l2w(h, u, v) for u, v in ((u0, v0), (u1, v0), (u1, v1), (u0, v1))]


def brect(h, u0, v0, u1, v1):
    s = s_of(h)
    return lrect(h, u0, s * v0, u1, s * v1)


def totem_uv(h):
    return (-h["L"] / 2 + 0.3, h["tside"] * (h["W"] / 2 + 0.45))


def occupied(h):
    return [brect(h, *r) for _, r in h["shape"]]


def footprints(h):
    """Occupied rectangles, totem and extras, as world polygons (what the page's walk mode collides with)."""
    fps = occupied(h)
    tu, tv = totem_uv(h)
    fps.append(lrect(h, tu - TOTEM_HALF, tv - TOTEM_HALF, tu + TOTEM_HALF, tv + TOTEM_HALF))
    for _, r, _ in h["extras"]:
        fps.append(brect(h, *r))
    return fps


def tee_pt(h):
    return b2w(h, -h["L"] / 2 - ACC, h["tee"][1])


def tee2_pt(h):
    return b2w(h, h["L"] / 2 + ACC, h["tee2"][1])


def exit_pt(h):
    return b2w(h, *h["exit"])


def _cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def seg_intersect(p1, p2, q1, q2):
    d1, d2 = _cross(q1, q2, p1), _cross(q1, q2, p2)
    d3, d4 = _cross(p1, p2, q1), _cross(p1, p2, q2)
    return (d1 * d2 < 0) and (d3 * d4 < 0)


def pt_seg(p, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]
    L2 = dx * dx + dz * dz
    t = 0 if L2 == 0 else max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2))
    return math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz))


def seg_seg(p1, p2, q1, q2):
    if seg_intersect(p1, p2, q1, q2):
        return 0.0
    return min(pt_seg(p1, q1, q2), pt_seg(p2, q1, q2), pt_seg(q1, p1, p2), pt_seg(q2, p1, p2))


def edges(P):
    return [(P[i], P[(i + 1) % len(P)]) for i in range(len(P))]


def inside(p, P):
    """Point in a convex polygon (either winding)."""
    s = [_cross(a, b, p) for a, b in edges(P)]
    return all(x >= -1e-9 for x in s) or all(x <= 1e-9 for x in s)


def poly_poly(P, Q):
    if any(inside(p, Q) for p in P) or any(inside(q, P) for q in Q):
        return 0.0
    return min(seg_seg(a, b, c, d) for a, b in edges(P) for c, d in edges(Q))


def poly_seg(P, a, b):
    if inside(a, P) or inside(b, P):
        return 0.0
    return min(seg_seg(a, b, c, d) for c, d in edges(P))


def rect_poly(x0, z0, x1, z1):
    return [(x0, z0), (x1, z0), (x1, z1), (x0, z1)]


def sq(x, z, half):
    return rect_poly(x - half, z - half, x + half, z + half)


def bbox(P):
    xs, zs = [p[0] for p in P], [p[1] for p in P]
    return min(xs), min(zs), max(xs), max(zs)


# ---------------------------------------------------------------- shared scenery
def build_scenery():
    """Scenery that stands on the floor ("solid"), plus flat floor graphics. Positions follow the holes."""
    sc = []
    h10, h9, h8, h7, h6, h5, h4, h3, h2, h1 = (H[n] for n in (10, 9, 8, 7, 6, 5, 4, 3, 2, 1))
    # 1. brownstone facade shared by 10 and 9: 4.8 m long, centred on the 10/9 gap, 0.15 m behind their runway edge
    x9e = h9["c"][0] + h9["L"] / 2
    x10w = h10["c"][0] - h10["L"] / 2
    gx = (x9e + x10w) / 2
    fz0, fd = ZR + 0.15, 0.2
    sc.append(dict(id="facade-10-9", kind="facade", position=[gx, fz0 + fd / 2], rotation=0, size=[4.8, 2.4, fd],
                   faces=[0, -1], attached=[10, 9], tall=2.4, solid=[rect_poly(gx - 2.4, fz0, gx + 2.4, fz0 + fd)],
                   note="Stoops painted on the hole-10 part, the pizzeria shopfront behind hole 9's tee; runway-facing back painted or draped. "
                        "Braced by steel-angle outriggers from its base rail under hole 9's and hole 10's frames (doc 14 M8), plus one 2 x 15 kg L-jack in the gap.",
                   bracing=dict(outriggers=[[[gx - 1.8, fz0], [gx - 1.8, ZR - 1.2]], [[gx + 1.8, fz0], [gx + 1.8, ZR - 1.0]]],
                                outrigger_note="under the hole frames, so no floor space; the holes are the ballast")))
    jx = x10w - 0.5                                           # L-jack nearer hole 10, clear of hole 9's tee point
    sc.append(dict(id="facade-jack", kind="facade_jack", position=[jx, fz0 - 0.3], rotation=90, size=[0.6, 2.2, 0.3],
                   attached=[10, 9], tall=0, solid=[rect_poly(jx - 0.15, fz0 - 0.6, jx + 0.15, fz0)],
                   note="2 x 15 kg L-jack on the hole side, in the 10/9 gap (doc 14 M8)"))
    # 2. subway kiosk (hole 3's prop) on Gridlock's sidewalk: beside hole 4's bottom rail, on the walk from 4 to 3
    kx, kz = h4["c"][0] - 0.5, h4["c"][1] + h4["W"] / 2 + 0.25 + 0.35
    sc.append(dict(id="subway-kiosk", kind="kiosk", position=[kx, kz], rotation=0, size=[1.0, 1.6, 0.7], faces=[0, 1],
                   attached=[4], tall=1.6, solid=[rect_poly(kx - 0.5, kz - 0.35, kx + 0.5, kz + 0.35)],
                   note="1.6 m subway entrance kiosk with battery globe lamps; entrance faces the walk to hole 3"))
    # 3. painted park-wall cut-out on hole 5's far end, facing Gridlock (covers the tree-pocket half, leaves the cup leg open)
    x5w = h5["c"][0] - h5["L"] / 2
    pocket = [r for lab, r in h5["shape"] if lab == "tree pocket"][0]
    pz = sorted([b2w(h5, h5["L"] / 2, pocket[1])[1], b2w(h5, h5["L"] / 2, pocket[3])[1]])
    cx_ = x5w - 0.1 - 0.075
    sc.append(dict(id="park-wall-cutout", kind="cutout", position=[cx_, (pz[0] + pz[1]) / 2], rotation=90,
                   size=[pz[1] - pz[0], 0.6, 0.15], faces=[-1, 0], attached=[5], tall=0.6,
                   solid=[rect_poly(cx_ - 0.075, pz[0], cx_ + 0.075, pz[1])],
                   note="600 mm painted Central Park wall, 0.1 m outside hole 5's end rail, facing Gridlock (Fifth Avenue)"))
    # 4. festoon poles (3 m, sandbagged, festoons at least 2.4 m up): park fairy lights at 5, marquee bulbs at 1
    poles = []
    p5a = b2w(h5, h5["L"] / 2 - 0.2, -(h5["W"] / 2 + 0.25))  # outside the far end's tee-leg side corner
    p5b = b2w(h5, -h5["L"] / 2 - 0.25, h5["W"] / 2 - 0.75)   # beyond the tee end, toward the runway but >= 0.5 m outside the console sightline
    p1a = b2w(h1, 1.3, -(h1["W"] / 2 + 0.25))
    p1b = b2w(h1, -2.2, -(h1["W"] / 2 + 0.25))
    for pid, p, n in (("pole-5a", p5a, 5), ("pole-5b", p5b, 5), ("pole-1a", p1a, 1), ("pole-1b", p1b, 1)):
        poles.append(pid)
        sc.append(dict(id=pid, kind="festoon_pole", position=list(p), rotation=0, size=[0.4, 3.0, 0.4], attached=[n],
                       tall=3.0, solid=[sq(p[0], p[1], 0.2)], note="3 m pole on a sandbagged base plate"))
    tower = b2w(h1, *POINTS[1]["tall"][0][:2])
    sc.append(dict(id="festoon-5", kind="festoon", position=[(p5a[0] + p5b[0]) / 2, (p5a[1] + p5b[1]) / 2], rotation=0,
                   size=[math.dist(p5a, p5b), 0.6, 0.05], attached=[5], tall=3.0, min_height=2.4,
                   runs=[["pole-5a", "pole-5b"]], points={"pole-5a": [*p5a, 3.0], "pole-5b": [*p5b, 3.0]},
                   lines=[[p5a, p5b]], note="Park fairy lights: warm-white festoon diagonally over the Z, lowest point >= 2.4 m; more fairy lights in the two trees"))
    sc.append(dict(id="festoon-1", kind="festoon", position=[(p1a[0] + p1b[0]) / 2, (p1a[1] + p1b[1]) / 2], rotation=0,
                   size=[math.dist(p1a, p1b), 0.6, 0.05], attached=[1], tall=3.0, min_height=2.4,
                   runs=[["pole-1a", "pole-1b"], ["pole-1a", "tower-1"], ["pole-1b", "tower-1"]],
                   points={"pole-1a": [*p1a, 3.0], "pole-1b": [*p1b, 3.0], "tower-1": [*tower, 2.8]},
                   lines=[[p1a, p1b], [p1a, tower], [p1b, tower]],
                   note="Times Square marquee bulbs from two poles on the walkway side to the top of the 2.8 m tower; lowest point >= 2.4 m"))
    # 5. hub portal flats. The whole hub is inside the assumed console sightline, so a 2.7 m flat can't stand at the
    #    hub itself. Downtown: a bridge arch about 2 m north of the hub that both Downtown routes pass through.
    #    Midtown: a park gate at hole 5's tee approach (no room between hole 1, hole 5 and the cone edge).
    az = 8.95
    pa = [(29.85, az), (32.15, az)]
    sc.append(dict(id="portal-downtown", kind="portal_flat", theme="bridge arch", position=[(pa[0][0] + pa[1][0]) / 2, az],
                   rotation=0, size=[2.6, 2.7, 0.3], opening=[2.0, 2.1], posts=[list(p) for p in pa], faces=[0, 1],
                   attached=[], tall=2.7, solid=[sq(p[0], p[1], 0.15) for p in pa],
                   tall_poly=[rect_poly(pa[0][0] - 0.15, az - 0.15, pa[1][0] + 0.15, az + 0.15)],
                   note="Brooklyn-Bridge-tower silhouette (pointed twin arch), painted both sides; both Downtown routes pass under it. First cut if money is tight"))
    tp5 = tee_pt(h5)
    gx_ = tp5[0] + 0.55
    pb = [(gx_, tp5[1] - 0.95), (gx_, tp5[1] + 0.95)]
    sc.append(dict(id="portal-midtown", kind="portal_flat", theme="park gate", position=[gx_, tp5[1]], rotation=90,
                   size=[2.2, 2.4, 0.3], opening=[1.6, 2.1], posts=[list(p) for p in pb], faces=[1, 0],
                   attached=[5], tall=2.4, solid=[sq(p[0], p[1], 0.15) for p in pb],
                   tall_poly=[rect_poly(gx_ - 0.15, pb[0][1] - 0.15, gx_ + 0.15, pb[1][1] + 0.15)],
                   note="Central Park gate: two stone pillars and an iron arch with an invented sign; the Midtown route passes through it to hole 5's tee. First cut if money is tight"))
    return sc


SCENERY = build_scenery()


# ---------------------------------------------------------------- routes (hub -> district -> hub)
HUB_A_OUT = (30.65, HUB[1] - 0.2)
HUB_A_IN = (31.35, HUB[1] - 0.2)
HUB_B_OUT = (30.1, HUB[3] + 0.2)
HUB_B_IN = (31.0, HUB[3] + 0.2)


def route_A():
    t10 = tee_pt(H[10])
    hops = [[HUB_A_OUT, (HUB_A_OUT[0], 7.75), t10]]
    hops.append([exit_pt(H[10]), tee_pt(H[9])])
    e9, t8 = exit_pt(H[9]), tee_pt(H[8])
    hops.append([e9, (X8C + 1.3, e9[1]), (X8C + 1.3, t8[1]), t8])   # square round the corners of 9 and 8, between them
    hops.append([exit_pt(H[8]), tee_pt(H[7])])
    hops.append([tee2_pt(H[7]), tee_pt(H[6])])          # hole 7 is two-ended: the group leaves from the far end
    hops.append([exit_pt(H[6]), (HUB_A_IN[0], 5.5), HUB_A_IN])
    return hops


def route_B():
    t5 = tee_pt(H[5])
    hops = [[HUB_B_OUT, (29.35, 16.0), (29.35, t5[1]), t5]]
    hops.append([exit_pt(H[5]), tee_pt(H[4])])
    hops.append([exit_pt(H[4]), tee_pt(H[3])])
    e3, t2 = exit_pt(H[3]), tee_pt(H[2])
    hops.append([e3, (t2[0], e3[1]), t2])
    e2, t1 = exit_pt(H[2]), tee_pt(H[1])
    hops.append([e2, (e2[0] + 0.5, t1[1]), t1])
    hops.append([exit_pt(H[1]), HUB_B_IN])
    return hops


def segs(route):
    out = []
    for hop in route:
        out += list(zip(hop[:-1], hop[1:]))
    return out


def zebras():
    """Zebra crossings along each cup-to-next-tee hop (not the hub hops: the page already paints those)."""
    out = []
    for name, route, nums in (("A", route_A(), [10, 9, 8, 7, 6]), ("B", route_B(), [5, 4, 3, 2, 1])):
        for i in range(1, len(nums)):
            hop = route[i]
            for k, (p, q) in enumerate(zip(hop[:-1], hop[1:])):
                L = math.dist(p, q)
                ux, uz = (q[0] - p[0]) / L, (q[1] - p[1]) / L
                if L < 1.2:                           # very short hop: one 1.2 m patch centred on it
                    m = ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)
                    p, q, L = (m[0] - ux * 0.6, m[1] - uz * 0.6), (m[0] + ux * 0.6, m[1] + uz * 0.6), 1.2
                else:                                 # keep 0.3 m off the tee and exit points
                    trim0 = 0.3 if k == 0 else 0.0
                    trim1 = 0.3 if k == len(hop) - 2 else 0.0
                    p, q = (p[0] + ux * trim0, p[1] + uz * trim0), (q[0] - ux * trim1, q[1] - uz * trim1)
                    L = math.dist(p, q)
                ang = math.degrees(math.atan2(q[1] - p[1], q[0] - p[0]))
                out.append(dict(id=f"zebra-{nums[i - 1]}-{nums[i]}-{k}", kind="zebra", district=name,
                                position=[(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], rotation=ang, size=[L, 0.003, 1.0],
                                path=[list(p), list(q)], bars=dict(width=0.2, pitch=0.4, along_walk=True),
                                note="floor tape: white bars 0.2 m at 0.4 m pitch, parallel to the walk (like the hub crossings in the page)"))
    return out


def tape_zones():
    top = [(APRON_X, 0.45), (GX - 0.05, 0.45), (GX - 0.05, HUB[1] - 0.1), (APRON_X, HUB[1] - 0.1)]
    bot = [(APRON_X, HUB[3] + 0.1), (GX - 0.05, HUB[3] + 0.1), (GX - 0.05, ROOM_W - 0.45), (APRON_X, ROOM_W - 0.45)]
    out = []
    for zid, poly, col, lab in (("tape-downtown", top, "#2E2F33", "charcoal \"asphalt\""),
                                ("tape-midtown", bot, "#C9CCD0", "light-grey \"sidewalk\"")):
        x0, z0, x1, z1 = bbox(poly)
        out.append(dict(id=zid, kind="floor_tape", label=lab, color=col, position=[(x0 + x1) / 2, (z0 + z1) / 2], rotation=0,
                        size=[x1 - x0, 0.002, z1 - z0], polygon=[list(p) for p in poly],
                        note="district floor colour, drawn under the holes; clear of the wall flats, speaker stands and the hub"))
    return out


# ---------------------------------------------------------------- sightline (assumed)
def sight_poly():
    """Console front face to the runway sides at the stage front: where tall props would block its view.
    Assumed: the console's size and position are not measured, and production hasn't said what it needs to see."""
    cx0 = CON["x"][0]
    return [(cx0, CON["z"][0]), (cx0, CON["z"][1]), (RW_X0, RW_Z1), (RW_X0, RW_Z0)]


# ---------------------------------------------------------------- checks
def _apply_room_rules(Ps, tag, acc):
    for P in Ps:
        zs, xs = [p[1] for p in P], [p[0] for p in P]
        acc["wall"] = min(acc["wall"], (min(zs), f"{tag} top wall"), (ROOM_W - max(zs), f"{tag} bottom wall"))
        acc["apron"] = min(acc["apron"], (min(xs) - SX, tag))
        acc["lim"] = min(acc["lim"], (GX - max(xs), tag))
        if min(xs) < RW_X1:
            if max(zs) <= (RW_Z0 + RW_Z1) / 2:
                acc["rwy"] = min(acc["rwy"], (RW_Z0 - max(zs), tag))
            else:
                acc["rwy"] = min(acc["rwy"], (min(zs) - RW_Z1, tag))


def run_checks():
    res, exempt, fails = {}, [], []

    def need(ok, msg):
        if not ok:
            fails.append(msg)

    fps = {h["n"]: footprints(h) for h in HOLES}
    solids = [(s["id"], s) for s in SCENERY if s.get("solid")]
    # hole to hole
    worst = (99, "")
    for a in fps:
        for b in fps:
            if a <= b:
                continue
            d = min(poly_poly(P, Q) for P in fps[a] for Q in fps[b])
            worst = min(worst, (d, f"{a}-{b}"))
    res["hole_hole"] = worst
    need(worst[0] >= 1.2 - 1e-6, f"holes {worst[1]} only {worst[0]:.2f} m apart")
    # walls, runway, stage front, golf limit (holes, then standing scenery)
    acc = {k: (99, "") for k in ("wall", "apron", "lim", "rwy")}
    for n, Ps in fps.items():
        _apply_room_rules(Ps, f"hole {n}", acc)
    res["hole_wall"], res["hole_runway"], res["hole_stage_front"], res["hole_golf_limit"] = acc["wall"], acc["rwy"], acc["apron"], acc["lim"]
    sacc = {k: (99, "") for k in ("wall", "apron", "lim", "rwy")}
    for sid, s in solids:
        _apply_room_rules(s["solid"], sid, sacc)
    res["scenery_wall"], res["scenery_runway"], res["scenery_stage_front"], res["scenery_golf_limit"] = sacc["wall"], sacc["rwy"], sacc["apron"], sacc["lim"]
    for k, (rule, lab) in {"wall": (WALL_CLEAR, "wall"), "rwy": (RUNWAY_CLEAR, "runway"), "apron": (APRON_X - SX, "stage front"), "lim": (LIMIT_CLEAR, "golf limit")}.items():
        for a, who in ((acc, "hole"), (sacc, "scenery")):
            need(a[k][0] >= rule - 1e-6, f"{who} {a[k][1]}: {a[k][0]:.2f} m from the {lab} (rule {rule})")
    # hub
    hub = rect_poly(*HUB)
    hd = min((min(poly_poly(P, hub) for P in Ps), f"hole {n}") for n, Ps in fps.items())
    sd = min((min(poly_poly(P, hub) for P in s["solid"]), sid) for sid, s in solids)
    res["hole_hub"], res["scenery_hub"] = hd, sd
    need(hd[0] >= 1.5 - 1e-6, f"{hd[1]} {hd[0]:.2f} m from the hub")
    need(sd[0] >= 1.5 - 1e-6, f"{sd[1]} {sd[0]:.2f} m from the hub")
    res["hub_runway_tip"] = (HUB[0] - RW_X1, "walkway between the districts")
    need(res["hub_runway_tip"][0] >= 1.2 - 1e-6, "hub too close to the runway tip")
    need(HUB[2] <= GX + 1e-6, "hub past the golf limit")
    # scenery to holes
    worst = (99, "")
    for sid, s in solids:
        for n, Ps in fps.items():
            d = min(poly_poly(P, Q) for P in s["solid"] for Q in Ps)
            if n in s["attached"]:
                need(d > 0.02, f"{sid} overlaps its own hole {n}")
                if d < 1.2 - 1e-6:
                    exempt.append(f"{sid} is {d:.2f} m from hole {n} (attached to it, so exempt from the 1.2 m rule)")
            else:
                worst = min(worst, (d, f"{sid} to hole {n}"))
    res["scenery_hole"] = worst
    need(worst[0] >= 1.2 - 1e-6, f"{worst[1]}: {worst[0]:.2f} m")
    # the facade stays inside z 9.9
    fz = max(p[1] for s in SCENERY if s["kind"] in ("facade", "facade_jack") for P in s["solid"] for p in P)
    res["facade_z_max"] = (fz, f"rule <= {FACADE_Z_MAX}")
    need(fz <= FACADE_Z_MAX + 1e-6, f"facade reaches z {fz:.2f}")
    # routes: 1.2 m corridor (0.6 each side) clear of every hole except the hop's own, and of all standing scenery
    worst, worst_own = (99, ""), (99, "")
    for name, route, nums in (("A", route_A(), [10, 9, 8, 7, 6]), ("B", route_B(), [5, 4, 3, 2, 1])):
        for i, hop in enumerate(route):
            own = set()
            if i > 0:
                own.add(nums[i - 1])
            if i < len(nums):
                own.add(nums[i])
            for s0, s1 in zip(hop[:-1], hop[1:]):
                for n, Ps in fps.items():
                    d = min(poly_seg(P, s0, s1) for P in Ps)
                    if n in own:
                        worst_own = min(worst_own, (d, f"district {name}, hop {i}, own hole {n}"))
                    else:
                        worst = min(worst, (d, f"district {name}, hop {i}, near hole {n}"))
                for sid, s in solids:
                    d = min(poly_seg(P, s0, s1) for P in s["solid"])
                    worst = min(worst, (d, f"district {name}, hop {i}, near {sid}"))
        for s0, s1 in segs(route):
            for p in (s0, s1):
                need(0.3 <= p[1] <= ROOM_W - 0.3 and APRON_X - 1e-6 <= p[0] <= GX + 1e-6, f"route point {p} outside the golf zone (or in the stage apron)")
                need(not (RW_X0 <= p[0] <= RW_X1 + 0.6 and RW_Z0 - 0.6 <= p[1] <= RW_Z1 + 0.6), f"route point {p} on the runway")
    res["route_corridor"] = (2 * worst[0], worst[1])
    res["route_own_hole"] = worst_own
    need(worst[0] >= 0.6 - 1e-6, f"walkway only {2 * worst[0]:.2f} m wide, {worst[1]}")
    need(worst_own[0] >= 0.3 - 1e-6, f"route runs {worst_own[0]:.2f} m from its own hole, {worst_own[1]}")
    allseg = segs(route_A()) + segs(route_B())
    crossings = [(i, j) for i in range(len(allseg)) for j in range(i + 2, len(allseg)) if seg_intersect(*allseg[i], *allseg[j])]
    res["route_crossings"] = crossings
    need(not crossings, f"walk routes cross: {crossings}")
    # tall props outside the sightline, with a 0.5 m margin
    sp = sight_poly()
    tall = []
    for h in HOLES:
        for u, v, ht in h["tall"]:
            p = b2w(h, u, v)
            d = 0.0 if inside(p, sp) else min(pt_seg(p, a, b) for a, b in edges(sp))
            tall.append((d, f"hole {h['n']} prop {ht} m at ({p[0]:.2f}, {p[1]:.2f})"))
    for s in SCENERY:
        if s.get("tall", 0) > 2.0:
            for P in s.get("tall_poly", s.get("solid") or []):
                tall.append((poly_poly(P, sp), f"{s['id']} ({s['tall']} m)"))
            for a, b in s.get("lines", []):
                d = 0.0 if (inside(a, sp) or inside(b, sp)) else min(seg_seg(a, b, c, e) for c, e in edges(sp))
                tall.append((d, f"{s['id']} run ({s.get('min_height', 2.4)}-{s['tall']} m)"))
    tall.sort()
    res["tall_sightline"] = tall[0]
    res["_tall_all"] = tall
    need(tall[0][0] >= TALL_MARGIN - 1e-6, f"{tall[0][1]} only {tall[0][0]:.2f} m from the console sightline")
    # side exits in the top wall: nothing standing within 1.5 m of the wall across the door +-0.3 m
    every = [P for Ps in fps.values() for P in Ps] + [P for _, s in solids for P in s["solid"]]
    ex = []
    for x0, x1 in SIDE_EXITS_TOP:
        zone = rect_poly(x0 - EXIT_SIDE_MARGIN, 0.0, x1 + EXIT_SIDE_MARGIN, EXIT_CLEAR)
        hits = [P for P in every if poly_poly(P, zone) == 0.0]
        need(not hits, f"something stands in front of the exit at x {x0}-{x1}")
        depth = min([min(p[1] for p in P) for P in every if bbox(P)[2] > x0 - EXIT_SIDE_MARGIN and bbox(P)[0] < x1 + EXIT_SIDE_MARGIN] + [ROOM_W])
        ex.append((depth, f"exit x {x0}-{x1}"))
    res["exit_clear"] = min(ex)
    res["_exits"] = ex
    return fps, res, exempt, fails


# ---------------------------------------------------------------- svg
class Canvas:
    def __init__(self, S, ox, oy):
        self.S, self.ox, self.oy, self.els = S, ox, oy, []

    def X(self, x):
        return self.ox + x * self.S

    def Z(self, z):
        return self.oy + z * self.S

    def add(self, s):
        self.els.append(s)

    def poly(self, pts, fill, stroke="none", sw=1, extra=""):
        d = " ".join(f"{self.X(x):.1f},{self.Z(z):.1f}" for x, z in pts)
        self.add(f'<polygon points="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def rect(self, x0, z0, x1, z1, fill, stroke="none", sw=1, extra=""):
        self.poly(rect_poly(x0, z0, x1, z1), fill, stroke, sw, extra)

    def pline(self, pts, stroke, sw=1, extra=""):
        d = " ".join(f"{self.X(x):.1f},{self.Z(z):.1f}" for x, z in pts)
        self.add(f'<polyline points="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def circle(self, x, z, r, fill, stroke="none", sw=1, extra=""):
        self.add(f'<circle cx="{self.X(x):.1f}" cy="{self.Z(z):.1f}" r="{r * self.S:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def text(self, x, z, t, size=11, fill="#2C2C2A", anchor="middle", weight="400", extra=""):
        t = t.replace("&", "&amp;").replace("<", "&lt;")
        self.add(f'<text x="{self.X(x):.1f}" y="{self.Z(z):.1f}" font-family="{FONT}" font-size="{size}" fill="{fill}" '
                 f'text-anchor="{anchor}" font-weight="{weight}" dominant-baseline="middle" {extra}>{t}</text>')


SHAPE_FILL = {"harbour leg and banked corner": "#7FB8E6", "island": "#5DAA6E", "statue pedestal": "#9FB3A8",
              "tree pocket": "#A9CFA0", "loop box": "#CFE8F5", "island box": "#B9B5AA", "ramp leg": "#5DAA6E",
              "return green": "#5DAA6E", "leg 1": "#5DAA6E", "leg 2": "#5DAA6E", "leg 3": "#5DAA6E", "deck": "#5DAA6E"}


def draw_hole(cv, h):
    glow = h["glow"]
    if h["n"] == 2:   # ellipse plus rail inside its box
        a, b = 1.40 + 0.045, 0.95 + 0.045
        cv.poly(lrect(h, -h["L"] / 2, -h["W"] / 2, h["L"] / 2, h["W"] / 2), "#E9E4D6", "#8A8472", 0.7)
        cv.poly([l2w(h, a * math.cos(k * math.pi / 24), b * math.sin(k * math.pi / 24)) for k in range(48)], "#5DAA6E", "#1E3B2A", 1.1)
        x, z = l2w(h, 0, 0)
        cv.circle(x, z, 0.2, "#C9A24A", "#5B4614", 0.8)
    else:
        for lab, r in h["shape"]:
            cv.poly(brect(h, *r), SHAPE_FILL.get(lab, "#5DAA6E"), "#1E3B2A", 1.1)
    for _, r, _ in h["extras"]:
        cv.poly(brect(h, *r), "#D9D3C4", "#8A8472", 0.7)
    tu, tv = totem_uv(h)
    x, z = l2w(h, tu, tv)
    cv.rect(x - TOTEM_HALF, z - TOTEM_HALF, x + TOTEM_HALF, z + TOTEM_HALF, "#1B5E3B", "#0E3322", 0.7)
    for P in occupied(h):
        cv.poly(P, "none", glow, 2.0, 'stroke-opacity="0.9"')
    # tee mat, cup
    tx, tz = b2w(h, *h["tee"])
    cv.rect(tx - 0.15, tz - 0.15, tx + 0.15, tz + 0.15, "#2B2B2B")
    if h.get("tee2"):
        tx, tz = b2w(h, *h["tee2"])
        cv.rect(tx - 0.15, tz - 0.15, tx + 0.15, tz + 0.15, "#2B2B2B")
    if h.get("cup"):
        x, z = b2w(h, *h["cup"])
        cv.circle(x, z, 0.09, "#FFFFFF", "#111", 1.2)
    for u, v, ht in h["tall"]:
        x, z = b2w(h, u, v)
        cv.add(star(cv.X(x), cv.Z(z), 6, "#2C2C2A"))


def star(cx, cy, r, fill):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.45
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def draw_scenery(cv):
    for s in SCENERY:
        k = s["kind"]
        if k == "facade":
            for P in s["solid"]:
                cv.poly(P, "#8C4B32", "#4A2414", 0.9)
            for a, b in s["bracing"]["outriggers"]:
                cv.pline([a, b], "#6B6B6B", 1.2, 'stroke-dasharray="3 2"')
        elif k == "facade_jack":
            for P in s["solid"]:
                cv.poly(P, "#6B6B6B", "#333", 0.6)
        elif k == "kiosk":
            for P in s["solid"]:
                cv.poly(P, "#2E7D4F", "#123", 0.8)
        elif k == "cutout":
            for P in s["solid"]:
                cv.poly(P, "#8E8A7E", "#444", 0.6)
        elif k == "festoon_pole":
            x, z = s["position"]
            cv.circle(x, z, 0.14, "#F2C230", "#5A4A10", 0.9)
        elif k == "festoon":
            for a, b in s["lines"]:
                cv.pline([a, b], "#D9A400", 1.3, 'stroke-dasharray="1.5 3" stroke-linecap="round"')
        elif k == "portal_flat":
            p0, p1 = s["posts"]
            cv.pline([p0, p1], "#9C2C6E", 3.0, 'stroke-opacity="0.55"')
            for P in s["solid"]:
                cv.poly(P, "#9C2C6E", "#4E0F33", 0.8)


def figure(fps, res, exempt):
    S = 38.0
    x_hi = 37.5
    ox, oy = 64, 128
    Wpx = int(ox + x_hi * S + 360)
    Hpx = int(oy + ROOM_W * S + 230)
    cv = Canvas(S, ox, oy)
    cv.rect(0, 0, x_hi, ROOM_W, "#EFEDE7")
    cv.rect(GX, 0, x_hi, ROOM_W, "#F3EBDD")
    cv.rect(SX, 0, GX, ROOM_W, "#E4F0EA")
    for z in tape_zones():
        cv.poly(z["polygon"], z["color"], "none", 0, 'fill-opacity="0.16"')
    cv.rect(SX, 0, APRON_X, ROOM_W, "#EDEFEA")
    cv.rect(0, 0, SX, ROOM_W, "#D8D4CB", "#9A958A", 0.8)
    for cc in dims["stage"]["corner_curves"]:
        a, o = cc["along_front"], cc["out_from_front"]
        zw = cc["wall_z"]
        sgn = 1 if zw == 0 else -1
        pts = [(SX + o * math.cos(k * (math.pi / 2) / 16), zw + sgn * a * math.sin(k * (math.pi / 2) / 16)) for k in range(17)]
        pts.append((SX, zw))
        cv.poly(pts, "#D8D4CB", "#9A958A", 0.8, 'stroke-dasharray="4 3"')
    cv.text(SX / 2, ROOM_W / 2, "Stage", 13, "#4A463E", weight="700")
    cv.text(SX / 2, ROOM_W / 2 + 0.8, "depth not measured", 9, "#77736A")
    cv.rect(RW_X0, RW_Z0, RW_X1, RW_Z1, "#D8D4CB", "#7A756B", 0.9)
    cv.text((RW_X0 + RW_X1) / 2 - 3, (RW_Z0 + RW_Z1) / 2, "Runway (raised, part of the stage) · 22.54 × 2.4 m · players can't cross", 10.5, "#3C3932")
    for it in dims["runway_side_items"]["items"]:
        x0, x1 = RW_X1 - it["from_tip"][1], RW_X1 - it["from_tip"][0]
        col = "#F4C46A" if it["type"] == "speaker_stand" else "#CFC8BA"
        cv.rect(x0, RW_Z0 - it["out"], x1, RW_Z0, col, "#8A6A2A", 0.7, 'stroke-dasharray="3 2"')
        cv.rect(x0, RW_Z1, x1, RW_Z1 + it["out"], col, "#8A6A2A", 0.7, 'stroke-dasharray="3 2"')
    cv.text((SX + APRON_X) / 2 + 0.3, 5.6, "Kept clear", 10, "#5D6B60", weight="700")
    cv.text((SX + APRON_X) / 2 + 0.3, 6.3, "stage stairs and", 9, "#5D6B60")
    cv.text((SX + APRON_X) / 2 + 0.3, 6.9, "performer access", 9, "#5D6B60")
    cv.text((SX + APRON_X) / 2 + 0.3, 19.0, "Kept clear", 10, "#5D6B60", weight="700")
    cv.text((SX + APRON_X) / 2 + 0.3, 19.7, "(about 6.5 m)", 9, "#5D6B60")
    cv.add(f'<clipPath id="room"><rect x="{cv.X(0):.1f}" y="{cv.Z(0):.1f}" width="{x_hi * S:.1f}" height="{ROOM_W * S:.1f}"/></clipPath>')
    cv.poly(sight_poly(), "#E0533F", "#C2412E", 0.8, 'fill-opacity="0.07" stroke-dasharray="5 4" clip-path="url(#room)"')
    cv.text(35.6, 12.55, "assumed console sightline", 9, "#A63A2A")
    cv.text(35.6, 13.1, "(console x 49–53, 20 Nov):", 9, "#A63A2A")
    cv.text(35.6, 13.65, "nothing over 2 m inside", 9, "#A63A2A")
    # skyline flats with gaps at the exits; exits and their 1.5 m clear zones
    gaps = [(x0 - 0.3, x1 + 0.3) for x0, x1 in SIDE_EXITS_TOP]
    xs = [APRON_X] + [g for gg in gaps for g in gg] + [32.6]
    for i in range(0, len(xs), 2):
        cv.rect(xs[i], 0.05, xs[i + 1], 0.4, "#2E3350")
    cv.rect(APRON_X, ROOM_W - 0.4, 32.6, ROOM_W - 0.05, "#2E3350")
    for x0, x1 in SIDE_EXITS_TOP:
        cv.rect(x0 - EXIT_SIDE_MARGIN, 0, x1 + EXIT_SIDE_MARGIN, EXIT_CLEAR, "#1E9E57", "#1E9E57", 0.8, 'fill-opacity="0.12" stroke-dasharray="3 2"')
        cv.rect(x0, -0.12, x1, 0.12, "#1E9E57")
        cv.text((x0 + x1) / 2, 0.85, "EXIT (guess ±2–3 m)", 8, "#146B3B", weight="700")
    cv.text(28.4, 0.85, "skyline flats on the wall, gaps at the exits", 8.5, "#3A3F5C")
    cv.text(22.5, ROOM_W - 0.95, "skyline flats on the wall (2.4–3.6 m), then a 1.2 m walkway", 9, "#3A3F5C")
    cv.add(f'<line x1="{cv.X(GX):.1f}" y1="{cv.Z(0) - 14:.1f}" x2="{cv.X(GX):.1f}" y2="{cv.Z(ROOM_W) + 6:.1f}" stroke="#0F6E56" stroke-width="3" stroke-dasharray="10 6"/>')
    cv.text(GX, -0.75, "Golf limit · 27 m from the stage front (decided 18 Nov)", 11, "#0F6E56", weight="700")
    cv.text(35.3, 4.0, "Other", 12, "#6B5426", weight="700")
    cv.text(35.3, 4.6, "activities", 12, "#6B5426", weight="700")
    lf = dims["lf_platform"]
    cv.rect(lf["x"][0], lf["z"][0], lf["x"][1], lf["z"][1], "#DCD6F0", "#5A4FA0", 0.8, 'stroke-dasharray="3 2"')
    cv.rect(*HUB, "#F6D9E9", "#9C2C6E", 1.2)
    cv.text((HUB[0] + HUB[2]) / 2, (HUB[1] + HUB[3]) / 2 - 0.55, "TEE BOOTH", 11, "#6E1B4C", weight="800")
    cv.text((HUB[0] + HUB[2]) / 2, (HUB[1] + HUB[3]) / 2 + 0.05, "hub: queue, putters,", 8.5, "#6E1B4C")
    cv.text((HUB[0] + HUB[2]) / 2, (HUB[1] + HUB[3]) / 2 + 0.55, "balls · all ≤ 1.5 m", 8.5, "#6E1B4C")
    # zebras under the routes
    for zb in zebras():
        (x0, z0), (x1, z1) = zb["path"]
        cv.pline([(x0, z0), (x1, z1)], "#FFFFFF", 1.0 * S * 0.9, 'stroke-opacity="0.85" stroke-dasharray="4 4"')
    for route, col in ((route_A(), "#C98A12"), (route_B(), "#7E3FC0")):
        for hop in route:
            cv.pline(hop, col, 2, 'stroke-dasharray="6 4" stroke-linecap="round"')
            (x0, z0), (x1, z1) = hop[-2], hop[-1]
            ang = math.atan2(z1 - z0, x1 - x0)
            tip = (cv.X(x1), cv.Z(z1))
            p1 = (tip[0] - 9 * math.cos(ang) + 5 * math.sin(ang), tip[1] - 9 * math.sin(ang) - 5 * math.cos(ang))
            p2 = (tip[0] - 9 * math.cos(ang) - 5 * math.sin(ang), tip[1] - 9 * math.sin(ang) + 5 * math.cos(ang))
            cv.add(f'<polygon points="{tip[0]:.1f},{tip[1]:.1f} {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}" fill="{col}"/>')
    for h in HOLES:
        draw_hole(cv, h)
    draw_scenery(cv)
    for h in HOLES:
        cx, cz = h["c"]
        bx, bz = {6: (0.0, 1.2), 5: (0.0, 0.0), 3: (0.0, 0.0)}.get(h["n"], (0.0, 0.0))
        bx, bz = l2w(h, bx, s_of(h) * bz)
        cv.circle(bx, bz, 0.36, h["glow"], "#1B1B1B", 1.2)
        cv.text(bx, bz + 0.02, str(h["n"]), 12, "#111", weight="800")
    name_pos = {10: (25.75, 10.1, "middle"), 9: (18.35, 10.1, "middle"), 8: (12.75, 7.95, "start"), 7: (18.65, 4.55, "middle"),
                6: (23.7, 6.9, "middle"), 5: (25.0, 14.95 + 4.55, "middle"), 4: (18.5, 19.25, "middle"), 3: (21.1, 20.1, "middle"),
                2: (26.1, 20.3, "middle"), 1: (32.7, 25.05, "end")}
    name_pos[5] = (24.8, 19.85, "middle")
    for h in HOLES:
        x, z, anc = name_pos[h["n"]]
        cv.text(x, z, f"{h['n']} · {h['name']}", 11, "#14201A", anchor=anc, weight="700")
        cv.text(x, z + 0.52, f"“{h['sign']}” · {h['role']} · par {h['par']}", 8.5, "#4C5A50", anchor=anc, extra='font-style="italic"')
    cv.text(26.4, 10.95, "brownstone façade (shared, 4.8 × 2.4 m)", 8, "#5A2A16")
    cv.text(16.7, 6.05, "DOWNTOWN · 10 → 6 · charcoal “asphalt”", 12, "#7A5A0C", weight="800", extra='letter-spacing="1.2"')
    cv.text(16.0, 24.4, "MIDTOWN · 5 → 1 · light-grey “sidewalk”", 12, "#6A2FA8", weight="800", extra='letter-spacing="1.2"')
    cv.text(31.0, 8.35, "bridge-arch portal", 8, "#6E1B4C", weight="700")
    cv.text(28.55, 20.0, "park gate", 8, "#6E1B4C", weight="700", anchor="middle")
    cv.text(18.0, 19.0 + 0.1, "", 8)
    cv.rect(0, 0, x_hi, ROOM_W, "none", "#2C2C2A", 2.2)
    cv.add(f'<line x1="{cv.X(x_hi):.1f}" y1="{cv.Z(0):.1f}" x2="{cv.X(x_hi):.1f}" y2="{cv.Z(ROOM_W):.1f}" stroke="#F7F6F2" stroke-width="5"/>')
    cv.text(x_hi - 0.2, ROOM_W / 2 + 4.6, "room continues to the", 9, "#77736A", anchor="end")
    cv.text(x_hi - 0.2, ROOM_W / 2 + 5.1, "sound console (≈ 47 m, est.)", 9, "#77736A", anchor="end")
    sx0, sz = 0.0, ROOM_W + 1.6
    for k in range(5):
        cv.rect(sx0 + k, sz, sx0 + k + 1, sz + 0.25, "#2C2C2A" if k % 2 == 0 else "#FFFFFF", "#2C2C2A", 0.6)
    cv.text(sx0, sz + 0.75, "0", 9)
    cv.text(sx0 + 5, sz + 0.75, "5 m", 9)
    head = [
        f'<text x="{ox}" y="40" font-family="{FONT}" font-size="22" font-weight="700" fill="#1A1A18">Layout v4 · New York Countdown, iteration 1 (doc 14) · proposal, not decided</text>',
        f'<text x="{ox}" y="66" font-family="{FONT}" font-size="12.5" fill="#55524B">Ten iteration-1 holes at true footprint (L, Z and U shapes as drawn), two five-hole loops from the Tee Booth. Plan v2 (18 Nov tape measurements) plus the 20 Nov room facts (console, side exits).</text>',
        f'<text x="{ox}" y="86" font-family="{FONT}" font-size="12.5" fill="#55524B">Positions sit on values that are not measured (stage depth, stairs, stands, console, exits): treat them as about ±0.5 m. Stars mark props over 2 m; dotted gold lines are festoons; white dashes are zebra crossings.</text>',
    ]
    px = cv.X(x_hi) + 22
    lines = [("Clearances checked (tightest)", 13, "700", "#1A1A18")]
    labels = {
        "hole_hole": ("Hole to hole", "≥ 1.2"), "hole_wall": ("Hole to side wall", "≥ 1.6"), "hole_runway": ("Hole to runway side", "≥ 1.75"),
        "hole_stage_front": ("Hole to stage front", "≥ 6.5"), "hole_golf_limit": ("Hole to golf limit", "≥ 0.6"), "hole_hub": ("Hole to hub", "≥ 1.5"),
        "hub_runway_tip": ("Hub to runway tip", "≥ 1.2"), "route_corridor": ("Walkway width", "≥ 1.2"), "route_own_hole": ("Route to its own hole", "≥ 0.3"),
        "tall_sightline": ("Tall props to sightline", "≥ 0.5"), "exit_clear": ("Clear in front of exits", "≥ 1.5"),
        "scenery_hole": ("Scenery to other holes", "≥ 1.2"), "scenery_runway": ("Scenery to runway", "≥ 1.75"), "facade_z_max": ("Façade back face z", "≤ 9.9"),
    }
    for k, (lab, need) in labels.items():
        v = res[k][0]
        lines.append((f"{lab}: {v:.2f} m ({need})", 10.5, "400", "#2C2C2A"))
    lines.append(("", 5, "400", "#000"))
    lines.append(("Exempted (attached scenery)", 13, "700", "#1A1A18"))
    for e in compact_exemptions(exempt):
        lines.append((e, 9.5, "400", "#5A4A2A"))
    lines.append(("", 5, "400", "#000"))
    lines.append(("Walk routes", 13, "700", "#1A1A18"))
    lines.append(("Downtown: hub → 10 → 9 → 8 → 7 → 6 → hub", 10.5, "400", "#9A6A0C"))
    lines.append(("Midtown: hub → 5 → 4 → 3 → 2 → 1 → hub", 10.5, "400", "#6A2FA8"))
    lines.append(("Routes don't cross. Hole 7 is two-ended:", 10.5, "400", "#2C2C2A"))
    lines.append(("the group leaves from its far end.", 10.5, "400", "#2C2C2A"))
    lines.append(("", 5, "400", "#000"))
    lines.append(("Footprint", 13, "700", "#1A1A18"))
    bnd = sum(h["L"] * h["W"] for h in HOLES)
    occ = sum(abs((r[2] - r[0]) * (r[3] - r[1])) for h in HOLES for _, r in h["shape"])
    lines.append((f"Bounding boxes {bnd:.0f} m² (doc 14: ≈ 101)", 10.5, "400", "#2C2C2A"))
    lines.append((f"Occupied (L, Z, U as drawn) {occ:.0f} m²", 10.5, "400", "#2C2C2A"))
    y = cv.Z(0) + 4
    side = []
    for t, s, w, c in lines:
        t = t.replace("&", "&amp;")
        side.append(f'<text x="{px:.1f}" y="{y:.1f}" font-family="{FONT}" font-size="{s}" font-weight="{w}" fill="{c}">{t}</text>')
        y += s + 6.5
    foot = [
        f'<text x="{ox}" y="{Hpx - 52}" font-family="{FONT}" font-size="11" fill="#55524B">Not shown: cable runs and drops (old cable-plan geometry), the runway extension (if built it would run through the hub). Hub portals sit outside the assumed sightline, not at the hub itself (the hub is inside it).</text>',
        f'<text x="{ox}" y="{Hpx - 34}" font-family="{FONT}" font-size="11" fill="#55524B">Generated by tools/make_layout_nyc_v4.py from floorplan/auditorium-dimensions.json · holes: docs/14-new-york-iteration-1.md · AI-drafted: a team member must check and own it.</text>',
    ]
    body = "\n".join(head + cv.els + side + foot)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{Wpx * 2}" height="{Hpx * 2}" viewBox="0 0 {Wpx} {Hpx}">'
           f'<title>Layout v4: New York Countdown, iteration 1</title><rect width="{Wpx}" height="{Hpx}" fill="#F7F6F2"/>{body}</svg>')
    return svg, Wpx, Hpx


def compact_exemptions(exempt):
    out = []
    for e in exempt:
        sid, rest = e.split(" is ", 1)
        d, hole = rest.split(" m from ")
        out.append(f"{sid} – {hole.split(' (')[0]}: {d} m")
    return out


def render_png(svg_path, png_path, W, H):
    """Headless Chrome screenshot of the SVG at 2x."""
    svg = open(svg_path, encoding="utf-8").read().replace(f'width="{W * 2}" height="{H * 2}"', f'width="{W}" height="{H}"', 1)
    with tempfile.TemporaryDirectory() as td:
        html = os.path.join(td, "page.html")
        open(html, "w", encoding="utf-8").write(f'<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff">{svg}</body></html>')
        url = pathlib.Path(html).as_uri()
        subprocess.run([CHROME, *CHROME_EXTRA, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                        f"--window-size={W},{H}", f"--screenshot={os.path.abspath(png_path)}", url],
                       check=True, capture_output=True, timeout=120)


# ---------------------------------------------------------------- export
def r3(v):
    return round(v + 0.0, 3)


def export_json(res):
    keep = ("n", "d", "name", "sign", "role", "cls", "par", "mins", "lesson", "L", "W", "th", "mirror", "tside", "glow",
            "play", "mech", "build", "miss", "risks", "clock", "surface")
    holes = []
    for h in HOLES:
        o = {k: h[k] for k in keep}
        o["c"] = [r3(h["c"][0]), r3(h["c"][1])]
        o["exit"] = [r3(h["exit"][0]), r3(s_of(h) * h["exit"][1])]     # page-frame local (u, v) of the exit standing point
        o["prop"], o["robust"] = h["build"], h["miss"]                  # the 20 Nov page's card still reads these two
        holes.append(o)
    r = lambda pts: [[r3(x), r3(z)] for x, z in pts]
    scen = []
    for s in SCENERY + zebras() + tape_zones():
        o = {k: v for k, v in s.items() if k not in ("solid", "tall_poly", "lines")}
        o["position"] = [r3(o["position"][0]), r3(o["position"][1])]
        o["rotation"] = round(o["rotation"], 2)
        o["size"] = [r3(v) for v in o["size"]]
        if s.get("solid"):
            o["footprint"] = [r(P) for P in s["solid"]]
        for key in ("posts", "path", "polygon"):
            if key in o:
                o[key] = r(o[key])
        if "points" in o:
            o["points"] = {k: [r3(v) for v in p] for k, p in o["points"].items()}
        if "bracing" in o:
            o["bracing"] = dict(o["bracing"], outriggers=[r(seg) for seg in o["bracing"]["outriggers"]])
        scen.append(o)
    fp = {str(h["n"]): [r(P) for P in footprints(h)] for h in HOLES}
    fp["scenery"] = [r(P) for s in SCENERY if s.get("solid") for P in s["solid"]]
    return {
        "_about": "Layout v4 (New York Countdown, iteration 1: doc 14's ten holes), proposal by Claude 27 Nov 2026, not decided. "
                  "Generated by tools/make_layout_nyc_v4.py on geometry v2 plus the 20 Nov room facts (console x 49-53, side exits). "
                  "Positions are about +-0.5 m: they sit on values that are not measured. Hole local frames: see W/BRIEF.md; "
                  "'exit' is the page-frame local (u, v) where players leave for the next hole. footprints['scenery'] are standing "
                  "scenery for walk-mode collisions. Scenery: position (x, z), rotation in degrees from +X toward +Z (the direction "
                  "of the item's length), size [length, height, depth].",
        "hub": list(HUB),
        "apron_x": APRON_X,
        "routes": {"A": [r(hop) for hop in route_A()], "B": [r(hop) for hop in route_B()]},
        "sightline": r(sight_poly()),
        "checks_m": {k: round(v[0], 2) for k, v in res.items() if isinstance(v, tuple) and not k.startswith("_")},
        "footprints": fp,
        "holes": holes,
        "scenery": scen,
    }


def inject(path, data):
    page = open(path, encoding="utf-8").read()
    block = "/* LAYOUT:BEGIN (generated by tools/make_layout_nyc_v4.py; edit the script, not this block) */\nconst LAYOUT = " + json.dumps(data, ensure_ascii=False) + ";\n/* LAYOUT:END */"
    new, n = re.subn(r"/\* LAYOUT:BEGIN.*?/\* LAYOUT:END \*/", lambda m: block, page, flags=re.S)
    if n != 1:
        sys.exit(f"{path}: LAYOUT markers not found exactly once")
    open(path, "w", encoding="utf-8").write(new)
    print(f"injected layout into {path}")


def main():
    fps, res, exempt, fails = run_checks()
    print(f"Bounding area {sum(h['L'] * h['W'] for h in HOLES):.1f} m²")
    for k, v in res.items():
        if isinstance(v, tuple) and not k.startswith("_"):
            print(f"  {k:20s} {v[0]:6.2f}  ({v[1]})")
    print(f"  route crossings: {res['route_crossings'] or 'none'}")
    print("  props over 2 m, distance to the console sightline:")
    for d, lab in res["_tall_all"]:
        print(f"    {d:5.2f} m  {lab}")
    print("  exits, clear depth in front:", ", ".join(f"{lab}: {d:.2f} m" for d, lab in res["_exits"]))
    print("  exemptions:")
    for e in exempt:
        print("    " + e)
    if fails:
        print("RULES BROKEN:")
        for f in fails:
            print("  - " + f)
        sys.exit(1)
    os.makedirs(OUT, exist_ok=True)
    svg, W, Hh = figure(fps, res, exempt)
    p = os.path.join(OUT, "layout-v4-nyc.svg")
    open(p, "w", encoding="utf-8").write(svg)
    data = export_json(res)
    for path in [os.path.join(OUT, "layout-v4-nyc.json")] + ([LAYOUT_OUT] if LAYOUT_OUT else []):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=1, ensure_ascii=False)
            f.write("\n")
        print(f"wrote {path}")
    if PNG:
        render_png(p, p[:-4] + ".png", W, Hh)
        print("PNG written")
    if INJECT:
        inject(INJECT, data)


if __name__ == "__main__":
    main()
