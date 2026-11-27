// Hole 1 Times Square, "Drop the Ball" (doc 14, New York iteration 1, the finale). Builder D2, 27 Nov 2026.
// Frame: straight; u along the lane (open tee end -3.1), v across. Lane 1.0 m clear, red-step ramp to +200, a 3 deg tilted crest,
// a covered 12 deg plinko board, five slots and an open floor tray at the tower front; billboards either side; tower behind the tray.
// Heights: doc 14's floor-laid numbers, measured from the lane (the lowest playing surface), lifted onto the deck: lane = BASE (brief G1).
HOLE_BUILDERS[1] = function (h, g, K) {
  // ---- group A helpers BEGIN (copied from h10.js; polyBox gains opt.side and opt.walls)
  const s = K.s, RT = RAIL_T, CT = 0.018;
  const P3 = (u, y, v) => [u, y, s * v];
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const crs3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const rad = d => d * Math.PI / 180;
  function GB() {
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
  function wall(gb, p, q, yb0, yb1, yt0, yt1, n) {
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    gb.quad(P3(p[0], yb0, p[1]), P3(q[0], yb1, q[1]), P3(q[0], yt1, q[1]), P3(p[0], yt0, p[1]), [n[0], 0, s * n[1]], [[0, yb0], [L, yb1], [L, yt1], [0, yt0]]);
  }
  const tuvOf = uvb => (u, v) => uvb ? [(u - uvb[0]) / (uvb[1] - uvb[0]), (uvb[3] - s * v) / (uvb[3] - uvb[2])] : [u, v];
  function topTex(uvb, ppm, draw) {
    const W = Math.round((uvb[1] - uvb[0]) * ppm), Hh = Math.round((uvb[3] - uvb[2]) * ppm);
    return canvasTex(W, Hh, x => draw(x, u => (u - uvb[0]) * ppm, v => (v - uvb[2]) * ppm, ppm));
  }
  function polyBox(poly, yF, topMat, opt = {}) {
    let A = 0; poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; A += p[0] * q[1] - q[0] * p[1]; });
    const ccw = A > 0, top = GB(), walls = new Map(), tuv = tuvOf(opt.uvb), y0 = opt.y0 || 0;
    for (const t of THREE.ShapeUtils.triangulateShape(poly.map(p => new THREE.Vector2(p[0], p[1])), [])) {
      const [a, b, c] = t.map(i => poly[i]);
      top.tri(P3(a[0], yF(a[0], a[1]), a[1]), P3(b[0], yF(b[0], b[1]), b[1]), P3(c[0], yF(c[0], c[1]), c[1]), tuv(a[0], a[1]), tuv(b[0], b[1]), tuv(c[0], c[1]), [0, 1, 0]);
    }
    if (opt.walls !== false) poly.forEach((p, i) => {
      const m = opt.edge && i in opt.edge ? opt.edge[i] : (opt.side || K.fascia); if (!m) return;
      const q = poly[(i + 1) % poly.length], du = q[0] - p[0], dv = q[1] - p[1], L = Math.hypot(du, dv); if (L < 1e-6) return;
      if (!walls.has(m)) walls.set(m, GB());
      wall(walls.get(m), p, q, y0, y0, yF(p[0], p[1]), yF(q[0], q[1]), ccw ? [dv / L, -du / L] : [-dv / L, du / L]);
    });
    const tm = top.build(topMat); walls.forEach((gb, m) => gb.build(m));
    return tm;
  }
  function prism(gb, a0, a1, b0, b1, yb0, yb1, yt0, yt1, n, d) {
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
  function teeMat(u, v, y, size = 0.22, col = '#6B7280', tilt = 0) {
    const m = box(size, 0.008, size, MC(col, { roughness: 0.9 }), g, u, y + 0.004, s * v, false); m.rotation.x = tilt; return m;
  }
  function clockTex(face = '#F6F1E3', ink = '#1D1D1D', rim = '#2B2B2B') {
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
  // ---- group D2 helpers (same block in h1.js)
  function clipU(poly, ua, ub) {   // plan polygon clipped to the slab ua <= u <= ub
    const cut = (pts, keep, at) => { const o = []; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], kp = keep(p), kq = keep(q); if (kp) o.push(p); if (kp !== kq) { const t = (at - p[0]) / (q[0] - p[0]); o.push([at, p[1] + t * (q[1] - p[1])]); } } return o; };
    return cut(cut(poly, p => p[0] >= ua - 1e-9, ua), p => p[0] <= ub + 1e-9, ub);
  }
  function fieldTop(poly, yF, mat, us, uvb) {   // top surface over a plan polygon with height yF(u, v), exact at every vertex and station u (ramps, rounded crests)
    const top = GB(), tuv = tuvOf(uvb);
    for (let i = 0; i < us.length - 1; i++) {
      const sl = clipU(poly, us[i], us[i + 1]).filter((p, k, a) => { const q = a[(k + 1) % a.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-7; });
      if (sl.length < 3) continue;
      for (const t of THREE.ShapeUtils.triangulateShape(sl.map(p => new THREE.Vector2(p[0], p[1])), [])) {
        const [a, b, c] = t.map(k => sl[k]);
        top.tri(P3(a[0], yF(a[0], a[1]), a[1]), P3(b[0], yF(b[0], b[1]), b[1]), P3(c[0], yF(c[0], c[1]), c[1]), tuv(a[0], a[1]), tuv(b[0], b[1]), tuv(c[0], c[1]), [0, 1, 0]);
      }
    }
    return top.build(mat);
  }
  function sweep(path, w, yT, yB, mTop, mL, mR, caps = true) {   // band of width w along plan path [[u, v], ...]; mL = side to the left of the run
    const n = path.length, L = [], R = [], gbs = new Map(), gb = m => { if (!gbs.has(m)) gbs.set(m, GB()); return gbs.get(m); };
    for (let i = 0; i < n; i++) {
      const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]), tu = (b[0] - a[0]) / l, tv = (b[1] - a[1]) / l, p = path[i];
      L.push([p[0] - tv * w / 2, p[1] + tu * w / 2]); R.push([p[0] + tv * w / 2, p[1] - tu * w / 2]);
    }
    const pt = (q, f) => P3(q[0], f(q[0], q[1]), q[1]);
    for (let i = 0; i < n - 1; i++) {
      const l0 = L[i], l1 = L[i + 1], r0 = R[i], r1 = R[i + 1], nL = [l0[0] - r0[0], 0, s * (l0[1] - r0[1])];
      gb(mTop).quad(pt(l0, yT), pt(l1, yT), pt(r1, yT), pt(r0, yT), [0, 1, 0]);
      if (mL) gb(mL).quad(pt(l0, yB), pt(l1, yB), pt(l1, yT), pt(l0, yT), nL);
      if (mR) gb(mR).quad(pt(r0, yB), pt(r1, yB), pt(r1, yT), pt(r0, yT), [-nL[0], 0, -nL[2]]);
    }
    if (caps) for (const [i, j] of [[0, 1], [n - 1, n - 2]]) gb(mL || mTop).quad(pt(L[i], yB), pt(R[i], yB), pt(R[i], yT), pt(L[i], yT), [path[i][0] - path[j][0], 0, s * (path[i][1] - path[j][1])]);
    gbs.forEach((b, m) => b.build(m));
  }
  const sampleRun = (pl, us, yF) => {   // polyline [[u, v], ...] -> rail points [u, v, y] with a point at every station u it crosses
    const o = [];
    for (let i = 0; i < pl.length - 1; i++) {
      const p = pl[i], q = pl[i + 1], ts = [0];
      if (Math.abs(q[0] - p[0]) > 1e-9) for (const u of us) { const t = (u - p[0]) / (q[0] - p[0]); if (t > 1e-6 && t < 1 - 1e-6) ts.push(t); }
      ts.sort((a, b) => a - b).forEach(t => { const u = p[0] + t * (q[0] - p[0]), v = p[1] + t * (q[1] - p[1]); o.push([u, v, yF(u, v)]); });
    }
    const l = pl[pl.length - 1]; o.push([l[0], l[1], yF(l[0], l[1])]); return o;
  };
  const vcurve = (curves, base) => u => {   // grade line through PVIs [u, y, grade in, grade out], each rounded with a 600 mm vertical curve
    let y = base(u);
    for (const [u0, y0, g1, g2] of curves) { const Lc = 0.6 * Math.abs(g2 - g1), x = u - u0 + Lc / 2; if (x > 0 && x < Lc) y = y0 + g1 * (u - u0) + (g2 - g1) * x * x / (2 * Lc); }
    return y;
  };
  const stations = (curves, extra) => { const o = [...extra]; for (const [u0, , g1, g2] of curves) { const Lc = 0.6 * Math.abs(g2 - g1); for (let k = 0; k <= 12; k++) o.push(u0 - Lc / 2 + Lc * k / 12); } return o.sort((a, b) => a - b).filter((u, i, a) => !i || u - a[i - 1] > 1e-6); };
  const mm = x => Math.round(x * 10000) / 10;
  // ---- group D2 helpers END
  // ---- numbers (doc 14 hole 1; m)
  const HW = 0.5, HC = 0.4;                          // lane 1.0 m clear; crest narrows to the 0.80 m board
  const U0 = -3.1, TEE = -2.2;                       // open tee end; adult tee 0.6 m forward of the old tee zone
  const UF = TEE + 0.8, UR = UF + 1.2, UB = UR + 0.3;   // ramp foot (0.8 m of flat from the tee), ramp top, crest end / board top edge
  const CR = 0.200, GC = Math.tan(rad(3)), TB = rad(12), BL = 0.80;
  const YC = CR - GC * (UB - UR);                    // crest falls 3 deg toward the board: +184
  const UE = UB + BL * Math.cos(TB), YE = YC - BL * Math.sin(TB);   // board end: +18 above the lane
  const UT1 = UE + 0.47, TU = UT1 + 0.53;            // tray far rail (inner face); tower centre
  const curves = [[UF, 0, 0, 1 / 6], [UR, CR, 1 / 6, -GC]];   // R 600 transitions at foot and crest
  const prof = vcurve(curves, u => u <= UF ? 0 : u <= UR ? (u - UF) / 6 : u <= UB ? CR - (u - UR) * GC : YC - (Math.min(u, UE) - UB) * Math.tan(TB));
  const us = stations(curves, [U0, UR, UB]);
  const yL = (u, v) => BASE + prof(u);
  const WK = (h.tside || -1) * s;                    // walkway side, local sign: the side the route and the totem are on
  let apex = 0; for (let u = UR - 0.1; u < UB; u += 0.001) apex = Math.max(apex, prof(u));
  const vFoot = Math.sqrt(10 * 9.81 * CR / 7 + 2 * 0.6 * 1.2 * Math.hypot(1, 1 / 6)), vTee = Math.sqrt(vFoot * vFoot + 2 * 0.6 * (UF - TEE));

  // ---- materials
  const pvc = MC('#F7F7F2', { roughness: 0.35 });
  const coverMat = M('#E6F0FF', { transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const SLOTS = [[-0.32, '3', '#4DE1FF'], [-0.16, '2', '#FFD45A'], [0, 'DROP', '#FF3DCB'], [0.16, '2', '#FFD45A'], [0.32, '3', '#4DE1FF']];   // 130 mm slots, centres

  // ---- lane: tee flat, red-step ramp (1:6, 1.2 m, +200), crest 0.3 m tilted 3 deg and narrowing to 0.80 m
  const lUV = [U0, UB, -HW, HW];
  const laneTex = topTex(lUV, 128, (x, X, R, ppm) => {
    const W = x.canvas.width, Hh = x.canvas.height;
    x.fillStyle = '#3E9B57'; x.fillRect(0, 0, W, Hh);
    x.fillStyle = '#C8273A'; x.fillRect(X(UF), 0, W - X(UF), Hh);
    for (let k = 1; k <= 6; k++) { const u = UF + k * 0.2; x.fillStyle = '#8E1726'; x.fillRect(X(u) - 0.04 * ppm, 0, 0.04 * ppm, Hh); x.fillStyle = '#F6D7DB'; x.fillRect(X(u) - 2, 0, 3, Hh); }   // painted red steps
  });
  fieldTop([[U0, -HW], [UR, -HW], [UB, -HC], [UB, HC], [UR, HW], [U0, HW]], yL, M('#FFFFFF', { map: laneTex, roughness: 0.9 }), us, lUV);
  { const tw = GB(); wall(tw, [U0, HW], [U0, -HW], 0, 0, BASE, BASE, [-1, 0]); tw.build(K.fascia); }   // open tee end

  // ---- covered plinko board: 0.80 x 0.80 m at 12 deg, 11 rows of 10 mm pegs 45 mm proud at 71 x 62 mm, wall teeth, five 130 mm slots
  const bPoly = [[UB, -HC], [UE, -HC], [UE, HC], [UB, HC]], bUV = [UB, UE, -HC, HC];
  const SD0 = 0.72, uS = UB + SD0 * Math.cos(TB);
  const boardTex = topTex(bUV, 400, (x, X, R, ppm) => {
    const W = x.canvas.width, Hh = x.canvas.height, gr = x.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, '#1A0A2C'); gr.addColorStop(1, '#2C0E3D'); x.fillStyle = gr; x.fillRect(0, 0, W, Hh);
    x.strokeStyle = 'rgba(255,61,203,.35)'; x.lineWidth = 3; x.strokeRect(6, 6, W - 12, Hh - 12);
    for (const [v, , col] of SLOTS) { x.fillStyle = col; x.globalAlpha = 0.6; x.fillRect(X(uS), R(v - 0.065), X(UE) - X(uS), 0.13 * ppm); }
    x.globalAlpha = 1;
  });
  polyBox(bPoly, yL, lit(boardTex, { glow: 0.8, house: 0.25, dark: 1.0 }), { uvb: bUV, edge: { 0: null, 2: null, 3: null } });
  const onBoard = (sd, v, up = 0) => [UB + sd * Math.cos(TB) + up * Math.sin(TB), BASE + YC - sd * Math.sin(TB) + up * Math.cos(TB), v];   // [u, y, v] at slope distance sd
  const pegGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.045, 8).translate(0, 0.0225, 0);
  const pegMat = MC('#EAD9B0', { roughness: 0.5 }), divMat = MC('#F4F1EA', { roughness: 0.4 });
  const pegs = [], wood = [];
  for (let k = 0; k < 11; k++) {
    const sd = 0.07 + 0.062 * k, nP = k % 2 ? 10 : 11;
    for (let j = 0; j < nP; j++) { const v = (j - (nP - 1) / 2) * 0.071, p = onBoard(sd, v); pegs.push([p[0], p[1], s * v, 0, 0, -TB]); }
    // half-round wall teeth: on 10-peg rows they close the 75.5 mm wall gap to 61 mm; on 11-peg rows the 40 mm gap (narrower than the ball,
    // a wedge) is filled by a tooth touching the outer peg
    for (const sg of [-1, 1]) { const p = onBoard(sd, sg * HC), r = k % 2 ? 2.9 : 8; wood.push([p[0], p[1], s * sg * HC, 0, 0, -TB, r, 1, r]); }
  }
  inst(pegGeo, pegMat, pegs, g);
  for (const v of [-0.24, -0.08, 0.08, 0.24]) {   // 30 mm round-nosed dividers, run 150 mm out onto the tray
    bar(onBoard(SD0, v, 0.0225), onBoard(BL, v, 0.0225), 0.03, 0.045, divMat);
    const p = onBoard(SD0, v); wood.push([p[0], p[1], s * v, 0, 0, -TB, 3, 1, 3]);
    box(0.15, 0.06, 0.03, divMat, g, UE + 0.075, BASE + 0.03, s * v);
  }
  for (const sg of [-1, 1]) bar(onBoard(SD0, sg * 0.3925, 0.0225), onBoard(BL, sg * 0.3925, 0.0225), 0.015, 0.045, divMat);   // 15 mm fillers at the walls
  inst(pegGeo, divMat, wood, g);
  polyBox(bPoly, (u, v) => yL(u, v) + 0.059, coverMat, { walls: false });   // 4 mm polycarbonate cover, 55 mm up
  for (const sd of [0.05, 0.75]) for (const sg of [-1, 1]) { const p = onBoard(sd, sg * 0.34, 0.059); const k = cyl(0.012, 0.012, 0.01, mats.black, g, p[0], p[1] + 0.004, s * p[2], 12); k.rotation.z = -TB; }

  // ---- open floor tray at lane level: carpet-lined, slot numbers, rails 100 mm, open lip on the walkway side
  const trUV = [UE, UT1, -HC, HC];
  const trayTex = topTex(trUV, 400, (x, X, R, ppm) => {
    x.fillStyle = '#2B2433'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    for (const [v, t, col] of SLOTS) {
      x.save(); x.translate(X(UE + 0.075), R(s * v)); x.rotate(Math.PI / 2); x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle';
      fitText(x, t, 0.115 * ppm, t.length > 1 ? 0.05 * ppm : 0.11 * ppm, 900, FD); x.fillText(t, 0, 4); x.restore();
    }
  });
  polyBox([[UE, -HC], [UT1, -HC], [UT1, HC], [UE, HC]], () => BASE, M('#FFFFFF', { map: trayTex, roughness: 0.95 }), { uvb: trUV });
  box(UT1 - UE, 0.015, 0.03, pvc, g, (UE + UT1) / 2, BASE + 0.0075, s * WK * (HC + 0.015));            // open lip (15 mm)
  box(UT1 - UE, 0.014, 0.02, K.led, g, (UE + UT1) / 2, 0.01, s * WK * (HC + 0.045), false);

  // ---- rails: tee end open; the walkway-side rail stops at the board end, the other wraps round the tray
  const side = sg => sampleRun([[U0, sg * HW], [UR, sg * HW], [UB, sg * HC], [UE, sg * HC]], us, yL);
  const oN = railRun([...side(-WK), [UE, -WK * HC, BASE], [UT1, -WK * HC, BASE], [UT1, WK * HC, BASE]], -WK);
  const oW = railRun(side(WK), WK);

  // ---- billboards either side (invented brands, lit both faces; one shows 11:59), 2.4 x 1.4 m, top 2.0 m
  function adTex(set) {
    return canvasTex(1200, 700, (x, w, hh) => {
      x.fillStyle = '#0E0C14'; x.fillRect(0, 0, w, hh);
      set.forEach(([lines, col, clock], i) => {
        const x0 = i * w / 2 + 16, bw = w / 2 - 32; x.fillStyle = '#181425'; x.fillRect(x0, 16, bw, hh - 32);
        x.strokeStyle = col; x.globalAlpha = 0.5; x.lineWidth = 6; x.strokeRect(x0 + 10, 26, bw - 20, hh - 52); x.globalAlpha = 1;
        x.textAlign = 'center'; x.textBaseline = 'middle';
        const lh = clock ? 300 : 170;
        lines.forEach((t, j) => { fitText(x, t, bw - 60, lh * 0.85, 900, FD); const y = hh / 2 + (j - (lines.length - 1) / 2) * lh + (clock ? -30 : 8); x.shadowColor = col; x.shadowBlur = 30; x.fillStyle = col; x.fillText(t, x0 + bw / 2, y); x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText(t, x0 + bw / 2, y); });
        if (clock) { fitText(x, 'ONE MINUTE TO GO', bw - 80, 54, 800, FD); x.fillStyle = '#FFFFFF'; x.fillText('ONE MINUTE TO GO', x0 + bw / 2, hh - 120); }
      });
    });
  }
  const adL = { glow: 1.0, house: 0.3, dark: 1.2 };
  const ads = {
    in1: lit(adTex([[['FIZZLETON', 'SODA'], '#4DE1FF'], [['11:59'], '#FF3DCB', true]]), adL),
    in2: lit(adTex([[['MOONBEAM', 'NOODLES'], '#FFD45A'], [['SEE YOU', 'IN 2027'], '#7CFF6B']]), adL),
    out1: lit(adTex([[['HAPPY', 'NEW YEAR'], '#FFD45A'], [['GLOWPOP', 'GUM'], '#FF3DCB']]), adL),
    out2: lit(adTex([[['PRETZEL', 'TRON'], '#FF7A2B'], [['COUNTDOWN', 'GOLF'], '#4DE1FF']]), adL),
  };
  const BU0 = UF - 0.2, BU1 = UE - 0.08, BV = 0.98;
  for (const sg of [-1, 1]) {   // group sides; faces: +z index 4, -z index 5
    const f = [mats.base, mats.base, mats.base, mats.base, mats.base, mats.base];
    f[sg > 0 ? 5 : 4] = sg > 0 ? ads.in1 : ads.in2; f[sg > 0 ? 4 : 5] = sg > 0 ? ads.out1 : ads.out2;
    box(BU1 - BU0, 1.4, 0.08, f, g, (BU0 + BU1) / 2, 1.3, sg * BV);
    for (const u of [BU0 + 0.25, BU1 - 0.25]) { box(0.08, 0.6, 0.06, mats.pole, g, u, 0.3, sg * BV); box(0.3, 0.03, 0.22, mats.base, g, u, 0.015, sg * (BV - 0.02)); }
  }

  // ---- tower behind the tray: ballast plinth (60 kg+), braced truss mast, DROP THE BALL sign, 2027 neon, mirror ball (top 2.8 m)
  box(0.8, 0.2, 0.8, mats.base, g, TU, 0.1, 0);
  const sand = MC('#B9A57E', { roughness: 0.95 });
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(0.3, 0.09, 0.17, sand, g, TU + a * 0.22, 0.245, b * 0.24);
  const q = 0.15, cs = [[-q, -q], [q, -q], [q, q], [-q, q]];
  cs.forEach(([a, b], i) => {
    cylBetween(V(TU + a, 0.2, b), V(TU + a, 2.42, b), 0.02, mats.steel, g, 8);
    cylBetween(V(TU + a * 2.4, 0.2, b * 2.4), V(TU + a, 1.0, b), 0.014, mats.steel, g, 6);   // braces (S9)
    const [c, d] = cs[(i + 1) % 4]; for (let y = 0.3; y < 2.3; y += 0.4) cylBetween(V(TU + a, y, b), V(TU + c, y + 0.4, d), 0.006, mats.steel, g, 4);
  });
  box(0.36, 0.02, 0.36, mats.darkSteel, g, TU, 2.43, 0);
  cyl(0.015, 0.015, 0.16, mats.steel, g, TU, 2.5, 0, 8);
  boardSign(g, neonTex(['DROP', 'THE BALL'], h.glow), TU - q - 0.045, 0, 0.9, 0.34, 1.42, false);
  const yr = canvasTex(512, 180, (x, w, hh) => { x.fillStyle = '#0E0C14'; x.fillRect(0, 0, w, hh); x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 150px ${FD}`; x.shadowColor = '#FFD45A'; x.shadowBlur = 30; x.fillStyle = '#FFD45A'; x.fillText('2027', w / 2, hh / 2 + 12); x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,.75)'; x.fillText('2027', w / 2, hh / 2 + 12); });
  const ym = lit(yr, { glow: 1.4, house: 0.3, dark: 1.7 });
  box(0.06, 0.34, 1.0, [ym, ym, mats.base, mats.base, mats.base, mats.base], g, TU - q - 0.05, 2.18, 0);
  const tiles = canvasTex(256, 128, (x, w, hh) => { const R0 = rand(11); const cl = ['#FF3DCB', '#4DE1FF', '#FFD45A', '#FFFFFF', '#7CFF6B', '#9B5CFF']; for (let i = 0; i < w; i += 16) for (let j = 0; j < hh; j += 16) { x.fillStyle = cl[Math.floor(R0() * cl.length)]; x.fillRect(i + 1, j + 1, 14, 14); } });
  const ballM = glow(M('#FFFFFF', { map: tiles, emissive: '#FFFFFF', emissiveMap: tiles, emissiveIntensity: 1, roughness: 0.25, metalness: 0.5, flatShading: true }), { glow: 1.5, house: 0.35, dark: 1.8 });
  const ball = mesh(new THREE.IcosahedronGeometry(0.2, 2), ballM, g, TU, 2.6, 0);
  animators.push((t, dt) => { if (!reduceMotion) ball.rotation.y += dt * 0.5; });   // the optional battery spinner (decor only)

  // ---- junior tee at the ramp foot
  const JT = [UF - 0.17, 0];
  teeMat(JT[0], JT[1], BASE, 0.22, '#7C8494');

  return {
    check: { apex: mm(apex), crestEnd: mm(YC), boardEnd: mm(YE), trayDrop: mm(YE), uFoot: +UF.toFixed(3), uBoardEnd: +UE.toFixed(4), pegs: pegs.length, vFoot: +vFoot.toFixed(2), vTee: +vTee.toFixed(2), walkway: WK },
    tee: [TEE, 0], teeY: BASE,
    noCup: true, cup: [(UE + UT1) / 2, 0], cupY: BASE,
    juniorTee: [JT[0], 0], juniorTeeY: BASE,
    outlines: [{ p: [...oN, ...oW.reverse()] }],
    sizes: [
      ['Lane', '1.0 m clear, open tee end; red-step ramp 1:6, 1.2 m to +200 mm, R 600 transitions'],
      ['Adult tee', `0.6 m forward: 0.8 m of flat to the ramp foot; about ${vFoot.toFixed(2)} m/s at the foot, ${vTee.toFixed(1)} m/s from the tee`],
      ['Crest', `0.3 m tilted 3° toward the board (+${Math.round(CR * 1000)} → +${Math.round(YC * 1000)} mm), narrowing 1.0 → 0.80 m`],
      ['Board', `0.80 × 0.80 m at 12° (+${Math.round(YC * 1000)} → +${Math.round(YE * 1000)} mm); ${pegs.length} Ø10 hardwood pegs 45 mm proud, 71 × 62 mm pitch, 11 rows; wall teeth keep 61 mm gaps`],
      ['Cover', '4 mm polycarbonate 55 mm above the board'],
      ['Slots', 'five × 130 mm: 3 · 2 · DROP · 2 · 3; dividers run 150 mm out onto the tray'],
      ['Tray', `open, carpet-lined, at lane level (${Math.round(YE * 1000)} mm drop); rails 100 mm; open lip on the walkway side`],
      ['Score', 'roll-backs + slot number; every ball goes back to the hub'],
      ['Tower', '2.8 m: braced truss on a 60 kg+ ballast plinth, 2027 neon, mirror ball'],
      ['Billboards', 'two, 2.4 × 1.4 m, top 2.0 m, lit both faces; invented brands; one reads 11:59'],
    ],
  };
};
