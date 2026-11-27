// Hole 9 Brooklyn Pizza, "Pizza the Action" (doc 14, New York iteration 1). Builder A2, 27 Nov 2026.
// Frame: u along the hole (open tee end -2.5), v across, y up from the floor. The lane is the lowest playing surface (BASE);
// doc 14's floor-laid lane 0 / house +75 become BASE / BASE+75 (brief G1). One shot each, curling style.
HOLE_BUILDERS[9] = function (h, g, K) {
  // ---- group A helpers BEGIN (same block in h7-h10; local so each file stands alone)
  const s = K.s, RT = RAIL_T, CT = 0.018;
  const P3 = (u, y, v) => [u, y, s * v];   // local unmirrored (u, y, v) -> group coordinates
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const crs3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const rad = d => d * Math.PI / 180;
  function GB() {   // triangles oriented to a given outward vector, so mirrored geometry stays outward-facing
    const pos = [], uv = [];
    const tri = (a, b, c, ta, tb, tc, out) => {
      if (dot3(crs3(sub3(b, a), sub3(c, a)), out) < 0) { const t = b; b = c; c = t; const tt = tb; tb = tc; tc = tt; }
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); uv.push(ta[0], ta[1], tb[0], tb[1], tc[0], tc[1]);
    };
    const quad = (a, b, c, d, out, t = [[0, 0], [1, 0], [1, 1], [0, 1]]) => { tri(a, b, c, t[0], t[1], t[2], out); tri(a, c, d, t[0], t[2], t[3], out); };
    const build = (mat, shadow = true) => {
      if (!pos.length) return null;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.computeVertexNormals();
      return mesh(geo, mat, g, 0, 0, 0, shadow);
    };
    return { tri, quad, build };
  }
  function wall(gb, p, q, yb0, yb1, yt0, yt1, n) {   // vertical face over plan edge p->q; n = outward [nu, nv] (unmirrored); uv in metres (fascia ribs keep their pitch)
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    gb.quad(P3(p[0], yb0, p[1]), P3(q[0], yb1, q[1]), P3(q[0], yt1, q[1]), P3(p[0], yt0, p[1]), [n[0], 0, s * n[1]], [[0, yb0], [L, yb1], [L, yt1], [0, yt0]]);
  }
  const tuvOf = uvb => (u, v) => uvb ? [(u - uvb[0]) / (uvb[1] - uvb[0]), (uvb[3] - s * v) / (uvb[3] - uvb[2])] : [u, v];
  // canvas for a deck top: uvb = [u0, u1, v0, v1] in group coordinates; draw(x, X, R, ppm) with X(u) and R(vGroup) in pixels (canvas down = +v)
  function topTex(uvb, ppm, draw) {
    const W = Math.round((uvb[1] - uvb[0]) * ppm), Hh = Math.round((uvb[3] - uvb[2]) * ppm);
    return canvasTex(W, Hh, x => draw(x, u => (u - uvb[0]) * ppm, v => (v - uvb[2]) * ppm, ppm));
  }
  function polyBox(poly, yF, topMat, opt = {}) {
    // deck box over plan polygon poly [[u, v], ...] (unmirrored), planar top yF(u, v); walls from opt.y0 (default the floor) up to the top,
    // K.fascia unless opt.edge[i] names another material (null: no wall on edge i, which runs poly[i] -> poly[i+1])
    let A = 0; poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; A += p[0] * q[1] - q[0] * p[1]; });
    const ccw = A > 0, top = GB(), walls = new Map(), tuv = tuvOf(opt.uvb), y0 = opt.y0 || 0;
    for (const t of THREE.ShapeUtils.triangulateShape(poly.map(p => new THREE.Vector2(p[0], p[1])), [])) {
      const [a, b, c] = t.map(i => poly[i]);
      top.tri(P3(a[0], yF(a[0], a[1]), a[1]), P3(b[0], yF(b[0], b[1]), b[1]), P3(c[0], yF(c[0], c[1]), c[1]), tuv(a[0], a[1]), tuv(b[0], b[1]), tuv(c[0], c[1]), [0, 1, 0]);
    }
    poly.forEach((p, i) => {
      const m = opt.edge && i in opt.edge ? opt.edge[i] : K.fascia; if (!m) return;
      const q = poly[(i + 1) % poly.length], du = q[0] - p[0], dv = q[1] - p[1], L = Math.hypot(du, dv); if (L < 1e-6) return;
      if (!walls.has(m)) walls.set(m, GB());
      wall(walls.get(m), p, q, y0, y0, yF(p[0], p[1]), yF(q[0], q[1]), ccw ? [dv / L, -du / L] : [-dv / L, du / L]);
    });
    const tm = top.build(topMat); walls.forEach((gb, m) => gb.build(m));
    return tm;
  }
  function prism(gb, a0, a1, b0, b1, yb0, yb1, yt0, yt1, n, d) {   // a = inner edge, b = outer edge (plan, unmirrored); heights at both ends
    const N = [n[0], 0, s * n[1]], L = Math.hypot(d[0], d[1]), D = [d[0] / L, 0, s * d[1] / L];
    const A0 = P3(a0[0], yb0, a0[1]), A1 = P3(a1[0], yb1, a1[1]), B0 = P3(b0[0], yb0, b0[1]), B1 = P3(b1[0], yb1, b1[1]);
    const A0t = P3(a0[0], yt0, a0[1]), A1t = P3(a1[0], yt1, a1[1]), B0t = P3(b0[0], yt0, b0[1]), B1t = P3(b1[0], yt1, b1[1]);
    const t = [[0, yb0], [L, yb1], [L, yt1], [0, yt0]];
    gb.quad(A0t, A1t, B1t, B0t, [0, 1, 0]);
    gb.quad(B0, B1, B1t, B0t, N, t);
    gb.quad(A0, A1, A1t, A0t, [-N[0], 0, -N[2]], t);
    gb.quad(A0, B0, B0t, A0t, [-D[0], 0, -D[2]]);
    gb.quad(A1, B1, B1t, A1t, D);
  }
  function railRun(pts, out, closed = false) {
    // rail along its inner face pts [[u, v, ySurface], ...] (unmirrored); out = +1 when the outside is to the left of the run direction.
    // One body from the floor to the cap (deck side and rail in one, K.fascia); white cap with its top RAIL_H above the local surface;
    // the LED under the cap's outer overhang and a kick strip on the floor. Repeat a point with a new height for a step. Returns the outer outline.
    const n = pts.length, segs = closed ? n : n - 1, segN = [];
    for (let i = 0; i < segs; i++) { const p = pts[i], q = pts[(i + 1) % n], du = q[0] - p[0], dv = q[1] - p[1], L = Math.hypot(du, dv); segN.push(L < 1e-6 ? null : [-dv / L * out, du / L * out]); }
    const find = (i, dir) => { for (let k = 0; k < segs; k++) { let j = dir < 0 ? i - 1 - k : i + k; if (closed) j = ((j % segs) + segs) % segs; else if (j < 0 || j >= segs) return null; if (segN[j]) return segN[j]; } return null; };
    const ptN = pts.map((p, i) => {
      const a = find(i, -1), b = find(i, 1); if (!a) return b; if (!b) return a;
      const m = [a[0] + b[0], a[1] + b[1]], ml = Math.hypot(m[0], m[1]); if (ml < 1e-6) return a;
      const c = (m[0] * a[0] + m[1] * a[1]) / ml; return [m[0] / ml / c, m[1] / ml / c];
    });
    const off = (i, k) => [pts[i][0] + ptN[i][0] * k, pts[i][1] + ptN[i][1] * k];
    const body = GB(), cap = GB(), strip = GB(), kick = GB();
    for (let i = 0; i < segs; i++) {
      if (!segN[i]) continue;
      const j = (i + 1) % n, yi = pts[i][2], yj = pts[j][2], d = [pts[j][0] - pts[i][0], pts[j][1] - pts[i][1]], nn = segN[i];
      prism(body, off(i, 0), off(j, 0), off(i, RT), off(j, RT), 0, 0, yi + RAIL_H - CT, yj + RAIL_H - CT, nn, d);
      prism(cap, off(i, 0.004), off(j, 0.004), off(i, 0.076), off(j, 0.076), yi + RAIL_H - CT, yj + RAIL_H - CT, yi + RAIL_H, yj + RAIL_H, nn, d);
      prism(strip, off(i, 0.059), off(j, 0.059), off(i, 0.071), off(j, 0.071), yi + RAIL_H - 0.03, yj + RAIL_H - 0.03, yi + RAIL_H - CT, yj + RAIL_H - CT, nn, d);
      prism(kick, off(i, RT + 0.002), off(j, RT + 0.002), off(i, RT + 0.022), off(j, RT + 0.022), 0.003, 0.003, 0.017, 0.017, nn, d);
    }
    body.build(K.fascia); cap.build(mats.cap); strip.build(K.led, false); kick.build(K.led, false);
    return pts.map((p, i) => { const o = off(i, RT + 0.031); return [o[0], s * o[1]]; });
  }
  function bar(a, b, w, hgt, mat, parent = g) {   // thin box from a to b ([u, y, v] unmirrored), w across (horizontal), hgt up
    const A = P3(...a), B = P3(...b), d = sub3(B, A), L = Math.hypot(d[0], d[1], d[2]);
    const m = mesh(new THREE.BoxGeometry(L, hgt, w), mat, parent, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2);
    m.rotation.order = 'YZX'; m.rotation.y = Math.atan2(-d[2], d[0]); m.rotation.z = Math.atan2(d[1], Math.hypot(d[0], d[2]));
    return m;
  }
  function teeMat(u, v, y, size = 0.22, col = '#6B7280', tilt = 0) {   // extra tee mats (junior, second end); the wrapper draws the main one
    const m = box(size, 0.008, size, MC(col, { roughness: 0.9 }), g, u, y + 0.004, s * v, false); m.rotation.x = tilt; return m;
  }
  function clockTex(face = '#F6F1E3', ink = '#1D1D1D', rim = '#2B2B2B') {   // a clock face at 11:59
    return canvasTex(256, 256, (x, w) => {
      const c = w / 2; x.fillStyle = rim; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill(); x.fillStyle = face; x.beginPath(); x.arc(c, c, c * 0.88, 0, 7); x.fill();
      x.strokeStyle = ink; x.lineCap = 'round';
      for (let i = 0; i < 60; i++) { const an = i * Math.PI / 30, r0 = c * (i % 5 ? 0.78 : 0.7); x.lineWidth = i % 5 ? 3 : 8; x.beginPath(); x.moveTo(c + r0 * Math.sin(an), c - r0 * Math.cos(an)); x.lineTo(c + c * 0.83 * Math.sin(an), c - c * 0.83 * Math.cos(an)); x.stroke(); }
      const hand = (an, len, wd) => { x.lineWidth = wd; x.beginPath(); x.moveTo(c, c); x.lineTo(c + len * Math.sin(an), c - len * Math.cos(an)); x.stroke(); };
      hand((11 + 59 / 60) * Math.PI / 6, c * 0.45, 12); hand(59 * Math.PI / 30, c * 0.68, 7);
      x.fillStyle = ink; x.beginPath(); x.arc(c, c, 9, 0, 7); x.fill();
    });
  }
  // ---- group A helpers END

  // ---- numbers (doc 14 hole 9)
  const U0 = -2.5;                         // open tee end (0.3 m behind the tee)
  const HL = 0.475, HH = 0.875;            // half widths inside the rails: lane 950 mm, house 1750 mm
  const UF = 0.0, UK = 0.40;               // 45 deg flare walls from UF to UK (design A; doc 14 says only "flaring to 1.75 m"); UK = crust foot, 2.6 m from the tee
  const UH = UK + 0.375;                   // crust top: full-width 1:5 bevel rising 75 mm
  const UG = 2.40, UR = 2.52;              // oven gutter 120 mm wide, from the pizza's back edge to the back rail face
  const LN = BASE, HS = BASE + 0.075;      // lane, house (levelled with the pizza)
  const PC = [1.6, 0], PR = 0.80, IR = 0.30;   // pizza Ø1.6 centred 3.8 m from the tee (centre pepperoni = cup); inner circle Ø0.60
  const GD = 0.045, GF = Math.tan(rad(3));     // gutter 45 mm deep at its high end, floor falling 3 deg toward the pocket
  const VP = HH - 0.25;                    // pocket: the last 250 mm of the gutter, at the +v rail (unmirrored)
  const yG = v => HS - GD - GF * (Math.min(v, VP) + HH);   // gutter floor height at v (unmirrored)
  const GLO = yG(VP);                      // pocket floor, 124 mm under the house (51 mm above the floor)
  const JT = [-0.25, 0];                   // junior tee (doc 14 silent; review S1: at most about 1.8 m/s)

  // ---- materials
  const crustM = MC('#C98B4A', { roughness: 0.92 });       // the "crust" kerb (painted needle-punch)
  const ovenM = MC('#2B1C17', { roughness: 0.8 });          // gutter: hard painted floor (it must be hard for 3 deg to drain a ball)

  // ---- the painted pizza on the house (S12: one carpet, painted)
  const huv = [UH, UG, -HH, HH];
  const pizza = topTex(huv, 256, (x, X, R, ppm) => {
    const W = x.canvas.width, Hh = x.canvas.height, Rr = rand(29);
    x.fillStyle = '#3E9B57'; x.fillRect(0, 0, W, Hh);       // house turf: off the pizza scores 4
    const cx = X(PC[0]), cy = R(s * PC[1]);
    const disc = (u, v, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(u, v, r * ppm, 0, 7); x.fill(); };
    disc(cx, cy, PR, '#A9672E'); disc(cx, cy, PR - 0.012, '#D49852'); disc(cx, cy, PR - 0.07, '#B8452C');   // crust ring, sauce edge
    disc(cx, cy, PR - 0.085, '#F2C34A');                                                                     // cheese
    for (let i = 0; i < 260; i++) {                                                                          // cheese mottling
      const a = Rr() * 7, r = Math.sqrt(Rr()) * (PR - 0.1);
      x.globalAlpha = 0.25; disc(cx + Math.cos(a) * r * ppm, cy + Math.sin(a) * r * ppm, 0.01 + Rr() * 0.025, Rr() < 0.5 ? '#FFE08A' : '#E0A63A');
    }
    x.globalAlpha = 1;
    x.strokeStyle = 'rgba(150,95,30,.45)'; x.lineWidth = 2;                                                  // slice cuts
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * (PR - 0.02) * ppm, cy + Math.sin(a) * (PR - 0.02) * ppm); x.stroke(); }
    const pep = (u, v) => { disc(u, v, 0.075, '#9E2B22'); disc(u, v, 0.066, '#B7372B'); x.globalAlpha = 0.6; for (let k = 0; k < 6; k++) { const a = Rr() * 7, r = Rr() * 0.05; disc(u + Math.cos(a) * r * ppm, v + Math.sin(a) * r * ppm, 0.008, '#7A1E17'); } x.globalAlpha = 1; };
    pep(cx, cy);                                                                                             // centre pepperoni (the cup)
    for (let k = 0; k < 7; k++) { const a = k * 2 * Math.PI / 7 + 0.35; pep(cx + Math.cos(a) * 0.5 * ppm, cy + Math.sin(a) * 0.5 * ppm); }
    x.strokeStyle = '#FFF7E0'; x.lineWidth = 0.014 * ppm; x.setLineDash([0.05 * ppm, 0.035 * ppm]);           // dashed inner circle Ø0.60
    x.beginPath(); x.arc(cx, cy, IR * ppm, 0, 7); x.stroke(); x.setLineDash([]);
  });

  // ---- deck boxes: lane with its flare, crust bevel, house, oven gutter and pocket
  polyBox([[U0, -HL], [UF, -HL], [UK, -HH], [UK, HH], [UF, HL], [U0, HL]], () => LN, mats.turf, { edge: { 2: null } });
  polyBox([[UK, -HH], [UH, -HH], [UH, HH], [UK, HH]], u => LN + (u - UK) / 5, crustM, { edge: { 1: null, 3: null } });
  polyBox([[UH, -HH], [UG, -HH], [UG, HH], [UH, HH]], () => HS, M('#FFFFFF', { map: pizza, roughness: 0.92 }), { edge: { 1: ovenM, 3: null }, uvb: [UH, UG, -HH, HH] });
  const none = { 0: null, 1: null, 2: null, 3: null };
  polyBox([[UG, -HH], [UR, -HH], [UR, VP], [UG, VP]], (u, v) => yG(v), ovenM, { edge: none });
  polyBox([[UG, VP], [UR, VP], [UR, HH], [UG, HH]], () => GLO, ovenM, { edge: none });
  // the oven glow: the hole's orange LED along the foot of the gutter's back wall
  bar([UR - 0.004, yG(-HH) + 0.008, -HH + 0.01], [UR - 0.004, GLO + 0.008, VP], 0.006, 0.012, K.led).castShadow = false;
  bar([UR - 0.004, GLO + 0.008, VP], [UR - 0.004, GLO + 0.008, HH - 0.01], 0.006, 0.012, K.led).castShadow = false;

  // ---- rails: one run, the flare mitred, the crust sloped; tee end open
  const run = [
    [U0, HL, LN], [UF, HL, LN], [UK, HH, LN], [UH, HH, HS], [UR, HH, HS],
    [UR, -HH, HS], [UH, -HH, HS], [UK, -HH, LN], [UF, -HL, LN], [U0, -HL, LN],
  ];
  const outer = railRun(run, +1);

  // ---- far end: a 1.2 m pizza-slice cut-out behind the neon pun sign, on slim posts
  // posts bolted to the back rail's outer face (no floor plates), to keep the hole as short as doc 14's numbers allow
  for (const sg of [-1, 1]) { box(0.04, 1.86, 0.04, mats.pole, g, 2.61, 0.93, sg * 0.55); for (const y of [0.12, 0.24]) box(0.03, 0.03, 0.06, mats.pole, g, UR + 0.0605, y, sg * 0.55); }
  const sl = new THREE.Shape(); sl.moveTo(0, 0); sl.lineTo(0.36, 1.05); sl.quadraticCurveTo(0, 1.35, -0.36, 1.05); sl.lineTo(0, 0);
  const sliceTex = canvasTex(256, 390, (x, w, hh) => {
    const Y = y => hh * (1 - y / 1.22), Xs = v => w * (v + 0.4) / 0.8;
    x.fillStyle = '#C98B4A'; x.fillRect(0, 0, w, hh);
    x.fillStyle = '#F2C34A'; x.beginPath(); x.moveTo(Xs(0), Y(0.05)); x.lineTo(Xs(0.31), Y(0.98)); x.quadraticCurveTo(Xs(0), Y(1.2), Xs(-0.31), Y(0.98)); x.closePath(); x.fill();
    x.fillStyle = '#B7372B'; for (const [v, y] of [[0, 0.32], [-0.12, 0.62], [0.13, 0.78], [-0.06, 0.95]]) { x.beginPath(); x.arc(Xs(v), Y(y), 0.065 * w / 0.8, 0, 7); x.fill(); }
  });
  sliceTex.repeat.set(1 / 0.8, 1 / 1.22); sliceTex.offset.set(0.5, 0); sliceTex.wrapS = sliceTex.wrapT = THREE.ClampToEdgeWrapping;
  const slice = mesh(new THREE.ExtrudeGeometry(sl, { depth: 0.02, bevelEnabled: false, curveSegments: 16 }), [lit(sliceTex, { glow: 0.5, house: 0.12, dark: 0.6 }), MC('#A9672E')], g, 2.62, 0.70, 0);
  slice.rotation.y = -Math.PI / 2;   // shape x -> +v, extrusion toward -u: the front face looks at the tee and reads unmirrored
  boardSign(g, neonTex(['PIZZA THE', 'ACTION'], h.glow), 2.565, 0, 1.2, 0.40, 1.02, false);
  // 11:59: the menu board (a whole pie costs 11.59), hung on the post on the +v side
  const menu = canvasTex(256, 300, (x, w, hh) => {
    x.fillStyle = '#5A3A22'; x.fillRect(0, 0, w, hh); x.fillStyle = '#1E2220'; x.fillRect(10, 10, w - 20, hh - 20);
    x.fillStyle = '#F4F1E8'; x.textAlign = 'center'; x.textBaseline = 'middle';
    fitText(x, 'MENU', w - 60, 52, 900, FD); x.fillText('MENU', w / 2, 52);
    x.textAlign = 'left'; fitText(x, 'PLAIN SLICE', 150, 28, 700, FB);
    const rows = [['PLAIN SLICE', '3.00'], ['PEPPERONI', '3.50'], ['GARLIC KNOTS', '4.00'], ['WHOLE PIE', '11.59']];
    rows.forEach(([a, b], i) => { const y = 112 + i * 44; x.fillStyle = i === 3 ? '#FFD36B' : '#F4F1E8'; x.textAlign = 'left'; x.fillText(a, 26, y); x.textAlign = 'right'; x.fillText(b, w - 26, y); });
  });
  box(0.025, 0.40, 0.34, [mats.base, lit(menu, { glow: 0.55, house: 0.15, dark: 0.7 }), mats.base, mats.base, mats.base, mats.base], g, 2.5775, 0.70, s * 0.55);

  // ---- junior tee
  teeMat(JT[0], JT[1], LN, 0.22, '#7C8494');

  return {
    tee: [-2.2, 0], teeY: LN,
    cup: [PC[0], s * PC[1]], cupY: HS,
    juniorTee: [JT[0], s * JT[1]], juniorTeeY: LN,
    outlines: [{ p: [...outer, [U0, -s * (HL + 0.076)], [U0, s * (HL + 0.076)]] }],
    sizes: [
      ['Lane', '950 mm inside the rails, 2.6 m from the tee to the crust foot; 45° flare walls to 1.75 m over 0.40 m'],
      ['Crust', 'full-width 1:5 bevel rising 75 mm (0.375 m); about 1.23 m/s needed at its foot'],
      ['House', 'deck BASE +75 mm, levelled ±2 mm; painted pizza Ø1.6 m centred 3.8 m from the tee'],
      ['Scoring', 'centre pepperoni cup 1 · inner circle Ø0.60 m 2 · pizza 3 · anywhere else or the oven 4'],
      ['Pepperoni', 'eight Ø150 mm, the centre one the flush cup'],
      ['Oven gutter', 'full width × 120 mm, 45 mm deep at the high end, hard floor falling 3° to a 250 mm open pocket at one rail (124 mm deep there)'],
      ['Speeds', 'ace about 2.37 m/s from the tee; 2-point window about ±3.5% of speed'],
      ['Junior tee', '1.85 m from the centre (about 1.8 m/s)'],
      ['Rails', 'cap 100 mm above the local surface, sloped over the crust; tee end open'],
    ],
  };
};

/* Integration (27 Nov): the real hole runs u -2.50 to 2.63 (5.13 m). Layout v4 reserves a 5.13 m box centred on the
   origin like every other hole, so the whole builder is shifted -0.065 m in u (a child group; nothing is mirrored). */
{
  const B0 = HOLE_BUILDERS[9], DU = -0.065;
  HOLE_BUILDERS[9] = function (h, g, K) {
    const sub = new THREE.Group(); sub.position.x = DU; g.add(sub);
    const r = B0(h, sub, K) || {};
    const sh = p => (p ? [p[0] + DU, p[1]] : p);
    for (const k of ['tee', 'cup', 'juniorTee']) if (r[k]) r[k] = sh(r[k]);
    if (r.outlines) r.outlines = r.outlines.map(o => Object.assign({}, o, { p: o.p.map(sh) }));
    return r;
  };
}
