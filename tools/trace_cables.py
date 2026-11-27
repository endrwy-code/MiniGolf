"""Cable runs, drops and power flags traced from the cable-plan screenshots.

Traced 27 Nov 2026 by a Claude helper agent from floorplan/source-screenshots/.
Not measured. Not yet merged into floorplan/auditorium-dimensions.json, because
the room geometry and layout are about to change (the 53 m re-estimate on an
unmerged branch, and layout v4 on the team's computer).

How it was traced:
- Each screenshot was scaled by its own measurement line (01: 24.18 px/m,
  02: 50.7, 03: 53.3, 04: 46.26) and tied to the others by the 8 m Wi-Fi
  access-point grid and drops seen in more than one shot (agree within ~0.1 m).
- Positions below are in the planning tool's own frame: x_t = metres from the
  tool's stage front; "d above/below" = metres from the runway's top/bottom edge.
  These numbers don't depend on the room geometry.
- In the tool, stage front to runway tip is about 22.2 m (shots 01, 02, 04 give
  22.17-22.25). That may be the unexplained 22.1 m on the team's sketch
  (inference). The v1 file's runway x 6.0-31.22 doesn't match the pixels, so v1
  x values aren't used.

To re-place on new geometry, change only the anchor functions X(), ZT(), ZB().
Current anchors (geometry v2): tool stage front -> x 6.0, tool runway tip ->
28.54 (scale 22.54/22.23), 1:1 past the tip and on the stage; top wall z 0,
runway 11.65-14.05, bottom wall 25.6.

Uncertainty: ~0.2 m in tracing, 1-2 m overall. Ids ending _assumed are
continuations not visible in any screenshot. The tool doesn't say which cables
are on the floor and which are flown. Production decides what stays on the night.

INTERNAL: power and network details. Never put this output on anything sent to
suppliers (see docs/06-rfq-templates.md).

Usage: python3 tools/trace_cables.py > cables.json
"""
import json
TIP_T = 22.23            # tool: stage front -> runway tip (from pixels)
def X(xt):
    if xt < 0: return round(6.0 + xt, 2)
    if xt <= TIP_T: return round(6.0 + xt * 22.54 / TIP_T, 2)
    return round(28.54 + (xt - TIP_T), 2)
def ZT(d):   # d = metres above the runway top edge (tool)
    return round(11.65 - d * 11.65 / 11.62, 2)
def ZB(d):   # d = metres below the runway bottom edge (tool)
    return round(14.05 + d * 11.55 / 11.58, 2)
H1 = ZT(10.45); H2 = ZT(9.23); TR = ZB(10.80); SR = ZB(9.29)
runs = [
 dict(id="feed_top_wall", label="Feeder along the top wall (from the main vertical to D53)", kind="run",
      points=[[X(7.11), H1], [X(30.45), H1]]),
 dict(id="run_nd18_ext", label="Run on the top bar: ND18 Ext / LX7 · ND22", kind="run",
      points=[[X(3.93), H2], [X(27.25), H2]]),
 dict(id="link_nd18_ext", label="Link: top feeder to ND18 Ext", kind="drop", points=[[X(19.27), H1], [X(19.27), H2]]),
 dict(id="link_lx7_nd22", label="Link: top feeder to LX7 · ND22", kind="drop", points=[[X(26.05), H1], [X(26.05), H2]]),
 dict(id="trunk_bottom_wall", label="Main trunk along the bottom wall (visible part)", kind="trunk",
      points=[[X(-2.6), TR], [X(22.62), TR]]),
 dict(id="trunk_bottom_wall_assumed", label="Main trunk, assumed continuation toward the sound console (not visible in the screenshots)", kind="trunk",
      points=[[X(22.62), TR], [50.7, TR]]),
 dict(id="run_south_bar", label="Run on the bottom bar (visible part)", kind="run",
      points=[[X(3.59), SR], [X(22.62), SR]]),
 dict(id="run_south_bar_assumed", label="Run on the bottom bar, assumed end (mirrors the top bar; not visible)", kind="run",
      points=[[X(22.62), SR], [X(27.25), SR]]),
 dict(id="v_lx3_nd15", label="LX3 · ND15 (pair of cables), top bar to trunk", kind="run",
      points=[[X(3.15), H2], [X(3.15), TR]]),
 dict(id="v_main_lx2_lx5", label="Main vertical: LX2 · ND11 · Hamond FL / LX5 · ND17 / ND25 (stack), top feeder to trunk", kind="run",
      points=[[X(7.11), H1], [X(7.11), TR]]),
 dict(id="v_d39_nd18_nd21", label="Bundle: D39, LX4.2 · ND18 (101%), LX6 · ND21 (106%), to trunk", kind="run",
      points=[[X(12.22), ZT(1.80)], [X(12.22), TR]]),
 dict(id="v_lx44_nd19", label="LX4.4 · ND19, to trunk", kind="drop",
      points=[[X(16.11), ZT(1.28)], [X(16.11), TR]]),
 dict(id="v_d47_d73", label="D47 / D73 (two cables), to trunk", kind="drop",
      points=[[X(21.40), ZT(2.68)], [X(21.40), TR]]),
 dict(id="v_d88", label="D88 (starts on the runway), to trunk", kind="drop",
      points=[[X(20.92), ZB(-0.34)], [X(20.92), TR]]),
 dict(id="net_x18", label="Network cable (Wi-Fi APs; blue dashed in the tool), top feeder to trunk", kind="run",
      points=[[X(11.62), H1], [X(11.62), TR]]),
 dict(id="net_x27", label="Network cable (Wi-Fi APs; blue dashed in the tool), top feeder to trunk, beside D47/D88", kind="run",
      points=[[X(21.09), H1], [X(21.09), TR]]),
 dict(id="d_nd31_fl_nd30", label="ND31 / FL · ND30 drop past the runway tip (visible part)", kind="drop",
      points=[[X(25.23), ZT(1.71)], [X(25.23), ZT(-4.23)]]),
 dict(id="d_nd31_fl_nd30_assumed", label="ND31 / FL · ND30, assumed continuation to the trunk (not visible)", kind="drop",
      points=[[X(25.23), ZT(-4.23)], [X(25.23), TR]]),
 dict(id="d_d53", label="D53 (outside the golf zone)", kind="drop", points=[[X(30.45), H1], [X(30.45), ZT(5.56)]]),
 dict(id="d_d42", label="D42 (outside the golf zone; lower end not visible)", kind="drop",
      points=[[X(34.38), ZT(1.66)], [X(34.38), ZT(-4.23)]]),
]
flags = [
 dict(node="ND18", circuit="LX4.2", load_percent=101, x=X(12.21), z=ZT(1.63)),
 dict(node="ND21", circuit="LX6", load_percent=106, x=X(12.21), z=ZB(7.71)),
]
print(json.dumps({"runs": runs, "power_flags": flags}, indent=1))
