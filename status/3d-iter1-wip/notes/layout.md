# Layout agent notes (layout v4, iteration 1)

Status: in progress. Script: `R/tools/make_layout_nyc_v4.py` (v3 untouched). Outputs: `W/layout.json`, `R/floorplan/layout-v4-nyc.{svg,json,png}`.

## Decisions so far (planning, before the first run)

- Start from design A's layout (doc 14's "Layout v4" paragraph is design A's), resized to doc 14 / brief frame-table sizes.
- Hole 10 must be `mirror: true` with th 180: the frame table puts the façade on builder +v, and the façade is on the runway side (+z). With th 180, page +v is -z, so mirroring is the only way.
- Holes 10 and 9 share a runway-side edge at z 9.0 (not 9.45 as in design A). Reason: it lets the façade sit at z 9.15-9.35, 2.3 m from the runway (not the bare 1.75 m minimum the review flagged), and keeps the 2.4 m façade 0.9 m outside the console sightline cone with no exemption.
- Console sightline: base.html's cone (49, 8.35)-(49, 17.35)-(6, 14.05)-(6, 11.65). The whole hub is inside it. So 2.4-2.7 m hub portal flats cannot stand "at the hub" without breaking the sightline rule: the Downtown bridge arch goes about 2 m north of the hub (z 8.95) straddling both Downtown routes; the Midtown park gate goes at hole 5's tee approach (x 28.55) because hole 1 and hole 5 leave no room for a portal between the hub and the cone edge.
- Doc 14 open question 9: the exemptions it names (lidded channels on 3, covered board on 1) belong to the carpenter pack's 250 mm ball-gap check, not to floor clearances. The façade bracing and the Liberty corner are things to include in the rerun, not exemptions. The brief's wording reads them as exemptions; noted.
