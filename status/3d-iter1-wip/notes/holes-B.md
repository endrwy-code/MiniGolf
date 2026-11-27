# Hole builder group B: holes 6, 5, 4, 2 (notes as I go)

Agent: hole builder group B, 27 Nov. Files: `W/holes/h6.js`, `h5.js`, `h4.js`, `h2.js`. Test page: `W/out/group-B.html`.

## Shared decisions (all four holes)

- Heights: lowest playing surface at `BASE` (0.10). Hole 6's island is `BASE + 0.075`; holes 5, 4, 2 are flat at `BASE` (G2 removes the +75 lawn on 5 and the +75 green on 4).
- Widths: doc 14's lane widths are read as **clear** widths between rail faces (0.9 m path, 0.9 m harbour, 1.4 m island), with the 45 mm rail outside them. Exception, hole 4: doc 14 gives the lane and the bounding box both as 5.0 x 1.8, so there the rails stand inside the 5.0 x 1.8 (clear 4.91 x 1.71).
- Rails: my own rail code (a band swept along the clear-edge polyline, so rails follow curves, steps and slopes as one piece). Profile copied from the page's `railsFor` look (dark ribbed 45 mm body, 72 mm white cap overhanging outside, LED under the cap, LED kick strip at the deck base), but with the **cap top at exactly +100 mm** above the local surface as G3 says. Flag for the integrator: the page's `railsFor` draws the body 100 mm tall and puts the 18 mm cap on top of it, so its cap top is at +118 mm, not +100.
- Every v is multiplied by `K.s`; custom geometry re-orients its triangles after mirroring; no negative scales; the statue is rotated, never mirrored, so the torch stays in her right hand.

(hole sections follow as each is finished)
