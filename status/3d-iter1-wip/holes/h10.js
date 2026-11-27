// Hole 10 Brownstone Stoops, "Stoop to Conquer" (doc 14, New York iteration 1). Builder by group A, 27 Nov 2026.
// Frame: u along the hole (tee end -2.7), v across (the façade side is +v; the stoop sags toward it), y up from the floor.
// Heights are doc 14's, made relative to the green (its lowest surface) and lifted onto the factory deck (brief G1).
HOLE_BUILDERS[10] = function (h, g, K) {
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

  // ---- numbers (doc 14 hole 10; floor-laid heights +200/+135/+115/+75 become BASE+125/+60/+40/0)
  const HW = 0.475;                                   // lane 950 mm inside the rails
  const TL = BASE + 0.125, T2 = BASE + 0.060, T3 = BASE + 0.040, GR = BASE;
  const XF = Math.tan(rad(1.5)), SK = Math.tan(rad(20));
  const U0 = -2.65, U1 = -1.65, U2 = -0.45, U3 = 0.55, U4 = 2.45;   // tee end (open), lips on the centre line, back rail face
  // tee landing 1.0 m, T2 1.2 m, T3 1.0 m, green 1.9 m (on the centre line); cup 1.2 m past the last lip
  const lip2 = v => U2 + v * SK;                      // T2 -> T3 lip, skewed 20 deg: further down the hole on the façade side, so its edge nudges a ball back toward the cup
  const yT2 = (u, v) => T2 - v * XF;                  // T2 sags 1.5 deg toward +v; +60 is on the centre line (edges +72 / +48)
  const ySurf = (u, v) => u < U1 ? TL : u < lip2(v) ? yT2(u, v) : u < U3 ? T3 : GR;
  const CUP = [1.75, -0.2];                           // 0.2 m off centre away from the sag

  // ---- materials
  const brown = MC('#7B4B36', { roughness: 0.85 });   // brownstone paint on the risers
  const pvc = MC('#D9DAD5', { roughness: 0.5 });
  const tape = glow(M('#ECFFEA', { emissive: '#B6FFC2', emissiveIntensity: 1, roughness: 0.5 }), { glow: 1.5, house: 0.08, dark: 1.9 });
  const iron = MC('#16181B', { roughness: 0.45, metalness: 0.45 });

  // ---- the four boxes
  polyBox([[U0, -HW], [U1, -HW], [U1, HW], [U0, HW]], () => TL, mats.turf, { edge: { 1: brown } });
  const t2uv = [U1, lip2(HW), -HW, HW];
  const crack = topTex(t2uv, 200, (x, X, R) => {
    x.fillStyle = '#3E9B57'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    // the painted crack that says "this stoop sags on purpose" (doc 14 risk list), near the façade edge
    x.strokeStyle = '#1F2A22'; x.lineWidth = 3; x.lineJoin = 'round'; x.beginPath();
    const pts = [[-1.55, 0.36], [-1.42, 0.31], [-1.33, 0.34], [-1.18, 0.27], [-1.05, 0.30], [-0.92, 0.22]];
    pts.forEach(([u, v], i) => i ? x.lineTo(X(u), R(s * v)) : x.moveTo(X(u), R(s * v))); x.stroke();
  });
  polyBox([[U1, -HW], [lip2(-HW), -HW], [lip2(HW), HW], [U1, HW]], yT2, M('#FFFFFF', { map: crack, roughness: 0.95 }), { edge: { 1: brown, 3: null }, uvb: [t2uv[0], t2uv[1], -HW, HW] });
  polyBox([[lip2(-HW), -HW], [U3, -HW], [U3, HW], [lip2(HW), HW]], () => T3, mats.turf, { edge: { 1: brown, 3: null } });
  const guv = [U3, U4, -HW, HW];
  const hatch = topTex(guv, 256, (x, X, R) => {
    x.fillStyle = '#3E9B57'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    // painted two-leaf steel cellar hatch round the cup (0.58 x 0.44 m), diamond plate, kerb frame
    const cu = CUP[0], cv = s * CUP[1], hu = 0.29, hv = 0.22;
    const x0 = X(cu - hu), x1 = X(cu + hu), y0 = R(cv - hv), y1 = R(cv + hv);
    x.fillStyle = '#8D8A82'; x.fillRect(x0 - 9, y0 - 9, x1 - x0 + 18, y1 - y0 + 18);
    x.fillStyle = '#33403A'; x.fillRect(x0, y0, x1 - x0, y1 - y0);
    x.strokeStyle = 'rgba(255,255,255,.17)'; x.lineWidth = 3;
    for (let i = x0 + 5; i < x1 - 6; i += 15) for (let j = y0 + 5; j < y1 - 6; j += 15) { x.beginPath(); if ((Math.round((i - x0) / 15) + Math.round((j - y0) / 15)) % 2) { x.moveTo(i, j); x.lineTo(i + 7, j + 7); } else { x.moveTo(i + 7, j); x.lineTo(i, j + 7); } x.stroke(); }
    x.fillStyle = '#141917'; x.fillRect(x0, (y0 + y1) / 2 - 3, x1 - x0, 6);
    x.fillStyle = '#69736D'; for (const yy of [y0 + 6, y1 - 14]) for (const xx of [x0 + 16, x1 - 46]) x.fillRect(xx, yy, 30, 8);
  });
  polyBox([[U3, -HW], [U4, -HW], [U4, HW], [U3, HW]], () => GR, M('#FFFFFF', { map: hatch, roughness: 0.95 }), { edge: { 3: null }, uvb: guv });
  for (const sg of [-1, 1]) polyBox([[U4, sg * HW], [U4 - 0.1, sg * HW], [U4, sg * (HW - 0.1)]], () => GR + RAIL_H, mats.cap, { y0: GR });   // back corners filled

  // ---- PVC angle nosings with glow tape on every lip (S2)
  for (const [u, y] of [[U1, TL], [U3, T3]]) {
    box(0.025, 0.003, 2 * HW, pvc, g, u - 0.0125, y + 0.0015, 0);
    box(0.003, 0.025, 2 * HW, pvc, g, u + 0.0015, y - 0.0125, 0);
    box(0.012, 0.0012, 2 * HW, tape, g, u - 0.009, y + 0.0036, 0, false);
  }
  {
    const dn = [Math.cos(rad(20)), -Math.sin(rad(20))];   // downstream normal of the skewed lip (plan)
    const at = (v, k, dy) => [lip2(v) + dn[0] * k, yT2(0, v) + dy, v + dn[1] * k];
    bar(at(-HW, -0.0125, 0.0015), at(HW, -0.0125, 0.0015), 0.025, 0.003, pvc);
    bar(at(-HW, 0.0015, -0.0125), at(HW, 0.0015, -0.0125), 0.003, 0.025, pvc);
    bar(at(-HW, -0.009, 0.0036), at(HW, -0.009, 0.0036), 0.012, 0.0012, tape).castShadow = false;
  }

  // ---- rails: one stepped run, tee end open (players stand on the floor beside the open tee side)
  const yE = v => yT2(0, v);
  const run = [
    [U0, HW, TL], [U1, HW, TL], [U1, HW, yE(HW)], [lip2(HW), HW, yE(HW)], [lip2(HW), HW, T3], [U3, HW, T3], [U3, HW, GR], [U4, HW, GR],
    [U4, -HW, GR], [U3, -HW, GR], [U3, -HW, T3], [lip2(-HW), -HW, T3], [lip2(-HW), -HW, yE(-HW)], [U1, -HW, yE(-HW)], [U1, -HW, TL], [U0, -HW, TL],
  ];
  const outer = railRun(run, +1);

  // ---- iron stoop-railing silhouettes (9 mm ply, black) on the rails' outer faces, low so players can still reach in
  const vR = HW + 0.0845, hrA = -2.6, hrB = U3 + 0.08;
  const hr = u => TL + 0.30 + (GR - TL) * (u - hrA) / (hrB - hrA);   // handrail 300 mm over the playing surface at both ends
  const bal = new THREE.BoxGeometry(0.012, 1, 0.012).translate(0, 0.5, 0);
  for (const sg of [-1, 1]) {
    const v = sg * vR, list = [];
    bar([hrA, hr(hrA), v], [hrB, hr(hrB), v], 0.02, 0.026, iron);
    const br = [hrA, U1, lip2(sg * HW), U3, hrB];
    for (let k = 0; k < br.length - 1; k++) { const y = ySurf((br[k] + br[k + 1]) / 2, sg * HW) + RAIL_H - 0.008; bar([br[k], y, v], [br[k + 1], y, v], 0.012, 0.016, iron); }
    for (let u = hrA + 0.1; u < hrB - 0.04; u += 0.12) { const yb = ySurf(u, sg * HW) + RAIL_H, yt = hr(u); list.push([u, yb, s * v, 0, 0, 0, 1, yt - yb, 1]); }
    inst(bal, iron, list, g);
    for (const [u, y0] of [[hrA, TL], [hrB, GR]]) {
      box(0.04, hr(u) + 0.07 - (y0 + RAIL_H - 0.02), 0.04, iron, g, u, (y0 + RAIL_H - 0.02 + hr(u) + 0.07) / 2, s * v);
      mesh(new THREE.SphereGeometry(0.03, 14, 10), iron, g, u, hr(u) + 0.09, s * v);
    }
    const vol = mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 20, Math.PI * 1.6), iron, g, hrB - 0.06, GR + RAIL_H + 0.07, s * v); vol.rotation.z = 0.4;
  }

  // ---- far end: the neon pun sign on slim posts, and the parlour window with the 11:59 clock (doc 14: "a window clock")
  for (const sg of [-1, 1]) { box(0.04, 1.66, 0.04, mats.pole, g, 2.635, 0.83, sg * 0.5); box(0.12, 0.02, 0.12, mats.base, g, 2.635, 0.01, sg * 0.5); }
  boardSign(g, neonTex(['STOOP TO', 'CONQUER'], h.glow), 2.6, 0, 1.2, 0.42, 1.2, false);
  const win = canvasTex(256, 320, (x, w, hh) => {
    x.fillStyle = '#7B4B36'; x.fillRect(0, 0, w, hh);
    x.fillStyle = '#62392A'; for (let y = 62; y < hh; y += 42) x.fillRect(0, y, w, 3);
    x.fillStyle = '#B08D73'; x.fillRect(8, 6, w - 16, 34); x.fillRect(14, hh - 36, w - 28, 24);   // stone lintel and sill
    x.fillStyle = '#111'; x.fillRect(34, 46, w - 68, hh - 88);
    const gr = x.createLinearGradient(0, 54, 0, hh - 48); gr.addColorStop(0, '#FFE2A0'); gr.addColorStop(1, '#E8A04B');
    x.fillStyle = gr; x.fillRect(42, 54, w - 84, hh - 104);
    x.fillStyle = '#6E4A2E'; x.fillRect(42, 236, w - 84, 18);                                       // mantel shelf inside
    const c = [w / 2, 188], r = 44;                                                                    // mantel clock at 11:59
    x.fillStyle = '#4A2E1E'; x.beginPath(); x.arc(c[0], c[1], r + 8, 0, 7); x.fill(); x.fillRect(c[0] - r, c[1], 2 * r, 48);
    x.fillStyle = '#FBF3DF'; x.beginPath(); x.arc(c[0], c[1], r, 0, 7); x.fill();
    x.strokeStyle = '#1A1A1A'; x.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; x.lineWidth = 3; x.beginPath(); x.moveTo(c[0] + r * 0.78 * Math.sin(an), c[1] - r * 0.78 * Math.cos(an)); x.lineTo(c[0] + r * 0.92 * Math.sin(an), c[1] - r * 0.92 * Math.cos(an)); x.stroke(); }
    const hand = (an, len, wd) => { x.lineWidth = wd; x.beginPath(); x.moveTo(c[0], c[1]); x.lineTo(c[0] + len * Math.sin(an), c[1] - len * Math.cos(an)); x.stroke(); };
    hand((11 + 59 / 60) * Math.PI / 6, r * 0.5, 6); hand(59 * Math.PI / 30, r * 0.78, 4);
    x.fillStyle = '#111'; x.fillRect(42, 132, w - 84, 9);                                              // meeting rail of the sash
  });
  const wm = lit(win, { glow: 0.9, house: 0.3, dark: 1.1 });
  box(0.04, 0.62, 0.5, [mats.base, wm, mats.base, mats.base, mats.base, mats.base], g, 2.6, 0.42 + 0.31, 0);

  // ---- junior tee on T2 (tilted with the sag)
  const JT = [-1.35, 0];
  teeMat(JT[0], JT[1], T2, 0.22, '#7C8494', s * rad(1.5));

  return {
    tee: [-2.35, 0], teeY: TL,
    cup: [CUP[0], s * CUP[1]], cupY: GR,
    juniorTee: [JT[0], s * JT[1]], juniorTeeY: T2,
    outlines: [{ p: [...outer, [U0, -s * (HW + 0.076)], [U0, s * (HW + 0.076)]] }],
    sizes: [
      ['Lane', '950 mm inside; 5.10 m from the open tee end to the back rail'],
      ['Boxes (centre line)', 'tee landing 1.0 · T2 1.2 · T3 1.0 · green 1.9 m'],
      ['Heights', 'deck BASE +125 / +60 / +40 / 0 mm (doc 14 floor-laid +200 / +135 / +115 / +75)'],
      ['Drops', '65 / 20 / 40 mm on the centre line'],
      ['T2 sag', '1.5° cross-fall toward the façade (+v); +60 on the centre line, edges +72 / +48'],
      ['T2 → T3 lip', 'skewed 20° (0.17 m offset at each rail)'],
      ['Lips', 'rounded R 15–20, PVC angle nosing, glow tape on every nosing'],
      ['Cup', '1.2 m past the last lip, 0.2 m off centre away from the sag, in a painted cellar hatch'],
      ['Junior tee', 'on T2, 0.3 m past the first lip'],
      ['Rails', 'cap 100 mm above each terrace, stepped; tee end open'],
    ],
  };
};
