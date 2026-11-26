# Kulnari footage: what we have, and how to read it

Evidence index for `docs/13-kulnari-benchmark.md`. The team played Kulnari Mystery Golf (Boat Quay) on Tue 24 Nov 2026, about 19:30–21:30, four players, 18 holes. The videos and photos are too big for the repo, so they stay on a team member's computer (a local `MINIGOLF` folder, with the extracted frames and raw agent outputs in `MINIGOLF/_work/`). This folder holds what a cloud session needs instead.

## Start here

- **`overview-1-K01-K09.jpg` and `overview-2-K10-K14.jpg`:** all 29 stills on two labelled sheets. Each one fits a single image read at full size, so read these before opening single stills.
- **`K01-…-1.jpg` to `K14-…-3.jpg`:** the stills, named by library ID (our play-order estimate, not Kulnari's numbering). Faces are left out (HOGC rules: no personal details of members). `K09` is un-mirrored, and `K12-…-3` is turned upright.
- **Text:** the edited library is `docs/13-kulnari-benchmark.md` section 3. Every field the analyst recorded per hole (room, layout, gimmicks, construction, cup, play notes, key frames, confidence) is in `docs/working-papers/kulnari-hole-library-full.md`.

## The clips

There were 19 clips (about 14.5 minutes) from two phones. A phone numbers its clips in recording order, which is what fixed the play order (see below). Times are Singapore time. Only the two untouched 4K originals kept a real capture time; the other files carry transfer times.

**Phone A (IMG_28xx)**

| Clip | Length | Captured | Hole | Notes | Stills from it |
|---|---|---|---|---|---|
| IMG_2897 | 28 s | | K01 (hole 1) | | K01-1 (t0041) |
| IMG_2898 | 39 s | | K01 | | K01-2 (t0029) |
| IMG_2899 | 24 s | | K01 | | K01-3 (t0021) |
| *IMG_2900* | | | | **not shared** | |
| IMG_2901 | 40 s | 19:51:33 | K04 (hole 4) | Synced to B's IMG_0017 by its sound: A time = B time − 2.1 s | K04-3 (t0013) |
| *IMG_2902* | | | | **not shared** | |
| IMG_2903 | 33 s | 20:10:48 | K07 (about hole 7) | The timestamp fixes this hole's position | K07-1, K07-2 (t0001, t0049) |
| IMG_2904 | 110 s | | K09 | Recorded mirrored | K09-1, K09-2 (t0169, t0013) |
| *IMG_2905* | | | | **not shared** | |
| IMG_2906 | 40 s | | none | A walk from the jungle area to the courtyard; ends at two lectern tees with hazard tape | |
| IMG_2907 | 78 s | | K11 | | K11-1 (t0021) |
| IMG_2908 | 39 s | | K14 | The last clip on both phones | K14-1, K14-3 (t0013, t0065) |

**Phone B (IMG_00xx)**

| Clip | Length | Hole | Notes | Stills from it |
|---|---|---|---|---|
| a.MOV | 57 s | K02 (hole 2) | Renamed file; it belongs to phone B by its content | K02-1 (t0013) |
| IMG_0014 | 22 s | K02 | | |
| *IMG_0015–16* | | | **not shared** (probably the hole 3 window) | |
| IMG_0017 | 42 s | K04 (hole 4) | | K04-1, K04-2 (t0013, t0045) |
| *IMG_0018–19* | | | **not shared** | |
| IMG_0020 | 49 s | K06 | | K06-1 (t0037) |
| IMG_0021 | 100 s | K06 | | K06-2 (t0085) |
| *IMG_0022* | | | **not shared** | |
| IMG_0023 | 46 s | K10 | | K10-1, K10-2 (t0001, t0057) |
| *IMG_0024* | | | **not shared** | |
| IMG_0025 | 29 s | K12 | Filmed upside down | K12-3 (t0021) |
| *IMG_0026* | | | **not shared** | |
| IMG_0027 | 26 s | K12 | | K12-1, K12-2 (t0005, t0041) |
| IMG_0028 | 47 s | K13 | | K13-1, K13-2 (t0037, t0033) |
| *IMG_0029–30* | | | **not shared** | |
| IMG_0031 | 24 s | K14 | | K14-2 (t0033) |

`tNNNN` is a frame from a 2 fps extract: frame k is at (k − 1) × 0.5 s, so t0045 is 22 s in.

**Photos** (no capture time; the names are transfer times)

| Photo | Hole | Stills |
|---|---|---|
| photo_2026-11-25_00-33-48 | K08 Persian Rug Six-Cup (position unknown) | K08-1 |
| photo_2026-11-26_16-45-36, -38 | K05 Reliquary Tunnel (turf, box tunnel) | K05-1, K05-2 |
| photo_2026-11-26_16-45-41, -43 | K03 Riveted Curve (grey carpet, curved rail) | K03-1, K03-2 |

The team said "the pictures are hole 3". But the four 26 Nov photos show two different cups on two different surfaces, so they cover two holes. Our best estimate is that the grey-carpet curve is hole 3 and the turf box tunnel comes after hole 4, because its floor matches hole 4's lower room. It could be the other way round. One answer from the team settles it (doc 13, question 1).

## How the play order was worked out

1. **Fixed points.** Hole 1 = IMG_2897–2899 and hole 2 = a.MOV + IMG_0014: the team's own labels, both confirmed. Hole 4 = IMG_0017 + IMG_2901: two phones filming the same hole, confirmed by matching frames and by lining up the sound. The bamboo hole is the last clip on both phones.
2. **Order within each phone.** Camera-roll numbers give it: phone A has K07 < K09 < K11, and phone B has K06 < K10 < K12 < K13. Every cross-phone pair that was checked turned out to be a different hole, so the two lists interleave.
3. **Interleaving.** Starting at about 19:30 and averaging 6.7 minutes a hole, hole 7 should start at about 20:10, and IMG_2903 is stamped 20:10:48. After that the order follows how the zones connect: house, then brick-and-ivy garden, then planter jungle, then the walk (IMG_2906), then the courtyard, then bamboo.
4. **Result.** Holes 1, 2 and 4 are certain, hole 7 is fixed by its timestamp, and the rest are ±1–2. This covers 12–14 of the 18 holes. The end of the course (about holes 15–18) isn't in the material.

The full reasoning, the cross-phone checks and what is still unresolved are in `docs/working-papers/kulnari-hole-library-full.md`, sections 2, 3 and 9.

## What's missing

The **rally hill, the trick tubes (in on the left, out on the right) and plinko** that the team remembers are not in any shared clip, and neither are holes 15–18. They are probably among the unshared camera-roll numbers above. Doc 13 and doc 14 describe those three gimmicks from the team's memory and from other courses, not from this footage.

## Adding new footage

1. Copy the clips to a local folder, never into the repo.
2. Run `python3 tools/video_sheets.py <clips folder> <work folder>`. Add `--rotate180 NAME` for an upside-down clip and `--mirror NAME` for a mirrored one. You get 2 fps frames, labelled sheets (1 frame every 2 s) and an index of clip lengths and timestamps.
3. **Keep the agents cheap.** Give each video agent the sheets first and cap it at about 30 image reads. Have it append notes to a file after every clip, and use about 4 agents, not 15. A 15-agent run on 26 Nov used about 2.3M tokens and returned nothing, because images are re-sent every turn and agents that hit the limit lose everything they haven't written to disk.
4. Copy only chosen face-free stills here, named `Kxx-name-n.jpg`, at a long side of 960 px. Add any new hole to `labels.json`, rebuild the overview sheets with `python3 tools/video_sheets.py --stills reference/kulnari`, and update docs 13, 14 and this index.
