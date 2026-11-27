// Hole 3 The Subway, "Stand Clear of the Closing Doors" (doc 14, New York iteration 1, the prototype). Builder D2, 27 Nov 2026.
// Frame: a U turning toward +v. The ramp leg (clear v -1.2..-0.2) climbs +u to the tile wall at u = 1.25; the lidded loop box sits behind it
// (u 1.25..2.0, about 1.33 x 0.75 m); the return green (clear v 0.2..1.2) comes back -u. Clear widths are doc 14's 1.0 + 0.4 island + 1.0;
// the outer rails stand outside them (box 4.0 x 2.55 m over the rails).
// Heights: doc 14's floor-laid numbers are measured from the tee flat (doc 0, the hole's lowest surface), so tee flat = BASE (brief G1).
HOLE_BUILDERS[3] = function (h, g, K) {
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

  // ---- numbers (doc 14 hole 3, heights from the tee flat; m)
  const UW = 1.25, TW = 0.018;                 // tile wall front face (portal sills, exit mouths) and sheet thickness
  const UC = UW + 0.085, UH = UW + 0.20;       // hairpin centre (box 0.75 deep to the outer wall); raised threshold lid ends here
  const RI = [0.30, 0.44, 0.58];               // hairpin centre-line radii: Shuttle (inner), Local, Express (outer)
  const CH = 0.055, WALLS = [0.23, 0.37, 0.51, 0.65], WT = 0.03, RB = 0.665, RCORE = 0.215;   // 110 mm channels, 30 mm walls, box radius
  const UF = -0.72, UT = 0.75, CREST = 0.245;  // ramp foot and crest (grade-line points): 1:6 over 1.47 m
  const SILL = CREST - (UW - UT) / 12;         // platform 0.5 m falling 1:12 -> sills +203
  const Y0 = SILL - 0.025;                     // outer lead-in drops 25 mm: loop floor at the outer entry +178
  const T5 = Math.tan(rad(5)), plane = v => Y0 - T5 * (v + RI[2]);   // loop floor: one plane falling 5 deg across the box toward the exits (+v)
  const GREEN = 0.067, HEAD = 0.060, TH = SILL + HEAD;   // return green; 60 mm headroom; threshold lid underside over the lead-ins
  const VM0 = -0.65, VM1 = -0.23, UFU = UW - (VM0 + 1.2) / Math.tan(rad(20));   // funnel mouth 0.42 m; outer funnel rail at 20 deg from u = -0.26
  const curves = [[UF, 0, 0, 1 / 6], [UT, CREST, 1 / 6, -1 / 12]];
  const prof = vcurve(curves, u => u <= UF ? 0 : u <= UT ? (u - UF) / 6 : CREST - (u - UT) / 12);
  const us = stations(curves, [-2.0, UFU, UW]);
  const yLeg = (u, v) => BASE + prof(u);
  const EX = RI.map(r => plane(r)), LI = RI.map(r => SILL - plane(-r));
  let apex = 0; for (let u = 0.6; u < 0.9; u += 0.001) apex = Math.max(apex, prof(u));
  const vFoot = Math.sqrt(10 * 9.81 * apex / 7 + 2 * 0.6 * (UT - UF) * Math.hypot(1, 1 / 6)), vTee = Math.sqrt(vFoot * vFoot + 2 * 0.6 * (UF + 1.7));

  // ---- materials
  const tiles = canvasTex(256, 256, (x, w, hh) => { x.fillStyle = '#F3F1EA'; x.fillRect(0, 0, w, hh); x.strokeStyle = '#B9B6AD'; x.lineWidth = 2; for (let r = 0; r < 14; r++) { x.beginPath(); x.moveTo(0, r * 19); x.lineTo(w, r * 19); x.stroke(); for (let c = (r % 2) * 19; c < w; c += 38) { x.beginPath(); x.moveTo(c, r * 19); x.lineTo(c, r * 19 + 19); x.stroke(); } } }, { repeat: [1, 1] });
  const tileMat = M('#FFFFFF', { map: tiles, roughness: 0.35 });
  const wallMat = MC('#EEF1F4', { roughness: 0.6 });
  const pvc = MC('#F7F7F2', { roughness: 0.35 });
  const lidMat = M('#DDF4FF', { transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const LINES = [['#F2C230', 'diamond'], ['#2FB15A', 'ring'], ['#E8483A', 'star']];   // invented line symbols, same order as RI
  function sym(x, kind, col, cx, cy, r) {
    x.fillStyle = col; x.strokeStyle = col; x.beginPath();
    if (kind === 'star') { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); } x.closePath(); x.fill(); }
    else if (kind === 'ring') { x.lineWidth = r * 0.36; x.arc(cx, cy, r * 0.76, 0, 7); x.stroke(); }
    else { x.moveTo(cx, cy - r); x.lineTo(cx + r * 0.8, cy); x.lineTo(cx, cy + r); x.lineTo(cx - r * 0.8, cy); x.closePath(); x.fill(); }
  }

  // ---- ramp leg: tee flat, 1:6 ramp to +245 (rounded R 600), platform falling 1:12 to the sills; funnel 1.0 -> 0.42 m
  const legPoly = [[-2.0, -1.2], [UFU, -1.2], [UW, VM0], [UW, VM1], [UT, -0.2], [-2.0, -0.2]];
  const lv = [Math.min(-1.2 * s, -0.2 * s), Math.max(-1.2 * s, -0.2 * s)], legUV = [-2.0, UW, lv[0], lv[1]];
  const legTex = topTex(legUV, 160, (x, X, R, ppm) => {
    const W = x.canvas.width, Hh = x.canvas.height;
    x.fillStyle = '#7C818B'; x.fillRect(0, 0, W, Hh);
    const R0 = rand(33); for (let k = 0; k < 2500; k++) { x.fillStyle = `rgba(0,0,0,${R0() * 0.07})`; x.fillRect(R0() * W, R0() * Hh, 3, 3); }
    for (let k = 1; k < 6; k++) { const u = UF + k * (UT - UF) / 6; x.fillStyle = '#62676F'; x.fillRect(X(u), 0, 0.06 * ppm, Hh); x.fillStyle = '#F2C230'; x.fillRect(X(u) - 5, 0, 6, Hh); }   // painted station steps
    x.fillStyle = '#F2C230'; x.fillRect(X(UT) - 0.03 * ppm, 0, 0.06 * ppm, Hh);                    // yellow platform edge at the crest
    x.strokeStyle = '#FFFFFF'; x.lineWidth = 5; x.beginPath(); x.arc(X(1.0), R(s * -0.47), 0.04 * ppm, 0, 7); x.stroke();   // place-rule spot (+1)
  });
  fieldTop(legPoly, yLeg, M('#FFFFFF', { map: legTex, roughness: 0.92 }), us, legUV);
  { const tw = GB(); wall(tw, [-2.0, -0.2], [-2.0, -1.2], 0, 0, BASE, BASE, [-1, 0]); tw.build(K.fascia); }   // open tee end
  railRun(sampleRun([[-2.0, -1.2], [UFU, -1.2], [UW, VM0]], us, yLeg), -1);   // outer rail and funnel
  railRun(sampleRun([[-2.0, -0.2], [UT, -0.2], [UW, VM1]], us, yLeg), +1);    // island-side rail (kinks 30 mm in to the inner portal)

  // ---- return green at +67, closed lane; island box between the legs
  polyBox([[-1.35, 0.2], [UW, 0.2], [UW, 1.2], [-1.35, 1.2]], () => BASE + GREEN, mats.turf, { edge: { 1: null } });
  railRun([[UW, 1.2, BASE + GREEN], [-1.35, 1.2, BASE + GREEN], [-1.35, 0.2, BASE + GREEN], [UW, 0.2, BASE + GREEN]], -1);
  polyBox([[-1.35, -0.124], [UW, -0.124], [UW, 0.124], [-1.35, 0.124]], () => BASE + GREEN + RAIL_H, tileMat, { side: tileMat, edge: { 1: null } });
  // exits step down to the green on carpeted 1:4 bevels
  RI.forEach((r, i) => { const d = EX[i] - GREEN, len = 4 * d; polyBox([[UW - len, r - CH], [UW, r - CH], [UW, r + CH], [UW - len, r + CH]], u => BASE + GREEN + d * (u - UW + len) / len, mats.turf, { y0: BASE + GREEN, edge: { 1: null, 3: null } }); });

  // ---- loop box: plane floor, lead-ins, stacked-ply hairpin walls, clear lid
  const arcPts = (r, a0, a1, n) => { const p = []; for (let k = 0; k <= n; k++) { const t = a0 + (a1 - a0) * k / n; p.push([UC + r * Math.sin(t), -r * Math.cos(t)]); } return p; };
  const D = [[UW, -RB], ...arcPts(RB, 0, Math.PI, 48), [UW, RB]];
  const fuv = [UW, UC + RB, -RB, RB];
  const floorTex = topTex(fuv, 320, (x, X, R, ppm) => {
    x.fillStyle = '#323A47'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    x.lineWidth = 0.012 * ppm; x.lineCap = 'round';
    RI.forEach((r, i) => { x.strokeStyle = LINES[i][0]; x.beginPath(); x.moveTo(X(UW), R(-r)); x.lineTo(X(UC), R(-r)); x.arc(X(UC), R(0), r * ppm, -Math.PI / 2, Math.PI / 2); x.lineTo(X(UW), R(r)); x.stroke(); });
  });
  polyBox(D, (u, v) => BASE + plane(v), M('#FFFFFF', { map: floorTex, roughness: 0.7 }), { uvb: fuv, edge: { [D.length - 1]: null } });
  const leadMat = MC('#3A4250', { roughness: 0.7 });
  RI.forEach((rc, i) => {   // 1:4 lead-ins from the sill down to the plane: 25 / 37 / 50 mm (outer / middle / inner)
    const sEnd = 4 * LI[i] + 0.02, thE = Math.max(0.02, (sEnd - (UC - UW)) / rc), N = Math.max(4, Math.ceil(thE / 0.04));
    const sOf = (u, v) => u <= UC ? u - UW : (UC - UW) + rc * Math.atan2(u - UC, -v);
    sweep([[UW, -rc], ...arcPts(rc, 0, thE, N)], 2 * CH, (u, v) => BASE + Math.max(plane(v) + 0.0005, SILL - sOf(u, v) / 4), (u, v) => BASE + plane(v) - 0.002, leadMat, leadMat, leadMat);
  });
  const wTop = (u, v) => BASE + plane(v) + HEAD, wBot = (u, v) => BASE + plane(v) - 0.002;
  WALLS.forEach((rc, i) => {   // walls of three stacked 18 mm arcs, 60 mm above the floor; taller under the raised threshold lid on the entry side
    const th1 = Math.asin(Math.min(1, (UH - UC) / rc)), outer = i === WALLS.length - 1;
    sweep([[UW, -rc], ...arcPts(rc, 0, th1, 8)], WT, () => BASE + TH, wBot, wallMat, wallMat, outer ? K.fascia : wallMat);
    sweep([...arcPts(rc, th1, Math.PI, 40), [UW, rc]], WT, wTop, wBot, wallMat, wallMat, outer ? K.fascia : wallMat);
  });
  const core = [[UW, -RCORE], ...arcPts(RCORE, 0, Math.PI, 24), [UW, RCORE]];
  polyBox(core, wTop, wallMat, { side: wallMat, edge: { [core.length - 1]: null } });
  const thO = Math.asin((UH - UC) / RB);
  polyBox([[UW + TW, VM1], [UH, VM1], ...arcPts(RB, thO, Math.PI, 44), [UW + TW, RB]], (u, v) => BASE + plane(v) + HEAD + 0.004, lidMat, { walls: false });   // main lid, 60 mm over the plane
  polyBox([[UW + TW, VM1], [UW + TW, -RB], ...arcPts(RB, 0, thO, 4), [UH, VM1]], () => BASE + TH + 0.004, lidMat, { walls: false });   // raised threshold lid over the lead-ins
  { const rg = GB(), yl = v => BASE + plane(v) + HEAD + 0.004, yh = BASE + TH + 0.004, vo = -RB * Math.cos(thO);
    wall(rg, [UH, VM1], [UH, vo], yl(VM1), yl(vo), yh, yh, [1, 0]); wall(rg, [UW + TW, VM1], [UH, VM1], yl(VM1), yl(VM1), yh, yh, [0, 1]); rg.build(lidMat, false); }
  for (const [u, v] of [[UC + 0.6 * Math.sin(rad(60)), -0.6 * Math.cos(rad(60))], [UC + 0.6 * Math.sin(rad(120)), -0.6 * Math.cos(rad(120))], [UH + 0.07, -0.45], [UH + 0.07, 0.45]])
    cyl(0.013, 0.013, 0.012, mats.black, g, u, BASE + plane(v) + HEAD + 0.01, s * v, 12);   // 4 thumbscrews
  const ring = r => [[UW, -r], ...arcPts(r, 0, Math.PI, 48), [UW, r]];
  sweep(ring(0.632), 0.005, (u, v) => BASE + plane(v) + HEAD - 0.004, (u, v) => BASE + plane(v) + HEAD - 0.016, K.led, K.led, K.led, false);   // ice-blue glow under the lid
  sweep(ring(RB + 0.012), 0.02, () => 0.017, () => 0.003, K.led, K.led, K.led, false);   // kick strip round the box

  // ---- tile wall: the existing sheet re-cut with 3 portals (sill +203) and 3 mirrored exits; line symbols; platform clock
  const VT = 1.2 + 0.076, YT = BASE + SILL + 0.62;
  const sh = new THREE.Shape(); sh.moveTo(-VT, 0); sh.lineTo(VT, 0); sh.lineTo(VT, YT); sh.lineTo(-VT, YT); sh.closePath();
  const arch = (x, yb, w, hh) => { const p = new THREE.Path(); p.moveTo(x - w / 2, yb); p.lineTo(x + w / 2, yb); p.lineTo(x + w / 2, yb + hh - w / 2); p.absarc(x, yb + hh - w / 2, w / 2, 0, Math.PI, false); p.lineTo(x - w / 2, yb); sh.holes.push(p); };
  RI.forEach(r => { arch(s * -r, BASE + SILL, 2 * CH, HEAD); arch(s * r, BASE + plane(r + CH) - 0.002, 2 * CH, HEAD + 0.006); });
  const twg = new THREE.ExtrudeGeometry(sh, { depth: TW, bevelEnabled: false, curveSegments: 10 }); twg.rotateY(-Math.PI / 2); twg.translate(UW + TW, 0, 0);
  mesh(twg, [tileMat, tileMat], g);
  for (const v of [-0.37, -0.51]) cyl(0.015, 0.015, HEAD, pvc, g, UW - 0.002, BASE + SILL + HEAD / 2, s * v, 14);   // 30 mm PVC round noses
  const BH = 0.13;
  const band = canvasTex(2048, 104, (x, w, hh) => {
    x.fillStyle = '#16181C'; x.fillRect(0, 0, w, hh);
    const X = zg => (zg + VT) / (2 * VT) * w;
    RI.forEach((r, i) => { for (const sg of [-1, 1]) sym(x, LINES[i][1], LINES[i][0], X(s * sg * r), hh / 2, 38); });
    x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (const [t, v] of [['PICK A TRAIN', -0.97], ['ARRIVALS', 0.97]]) { fitText(x, t, 470, 62, 800, FD); x.fillText(t, X(s * v), hh / 2 + 3); }
  });
  box(0.012, BH, 2 * VT, [mats.base, lit(band, { glow: 0.7, house: 0.2, dark: 0.9 }), mats.base, mats.base, mats.base, mats.base], g, UW - 0.006, YT - BH / 2, 0);
  const rim = cyl(0.122, 0.122, 0.024, mats.black, g, UW - 0.012, BASE + 0.5, 0, 40); rim.rotation.z = Math.PI / 2;
  const ck = mesh(new THREE.CircleGeometry(0.11, 40), lit(clockTex(), { glow: 0.6, house: 0.15, dark: 0.8 }), g, UW - 0.027, BASE + 0.5, 0, false); ck.rotation.y = -Math.PI / 2;   // 11:59 platform clock
  boardSign(g, neonTex(['STAND CLEAR OF', 'THE CLOSING DOORS'], h.glow), UW + 0.17, 0, 1.9, 0.38, 0.98, true);

  // ---- junior tee at the ramp foot
  const JT = [-0.9, -0.7];
  teeMat(JT[0], JT[1], BASE, 0.22, '#7C8494');

  const ov = pts => pts.map(([u, v]) => [u, s * v]);
  return {
    check: { apex: mm(apex), sill: mm(SILL), loopEntry: RI.map(r => mm(plane(-r))), leadIn: LI.map(mm), exits: EX.map(mm), bevels: EX.map(e => mm(e - GREEN)), uFunnel: +UFU.toFixed(3), vFoot: +vFoot.toFixed(2), vTee: +vTee.toFixed(2) },
    tee: [-1.7, s * -0.7], teeY: BASE,
    cup: [UW - 1.2, s * RI[2]], cupY: BASE + GREEN,
    juniorTee: [JT[0], s * JT[1]], juniorTeeY: BASE,
    outlines: [
      { p: ov([[-2.0, -1.276], [UFU + 0.03, -1.276], [UW, VM0 - 0.08], [UW, -0.124], [-2.0, -0.124]]) },
      { p: ov([[-1.426, 0.124], [UW, 0.124], [UW, 1.276], [-1.426, 1.276]]) },
      { p: ov(D) },
    ],
    sizes: [
      ['U', '4.0 × 2.55 m over the rails: ramp leg 1.0 + island 0.4 + return 1.0 m clear (doc 14 box 4.0 × 2.4)'],
      ['Heights', `tee flat BASE · crest +${mm(CREST)} (rounded apex +${mm(apex)}) · sills +${mm(SILL)} · green +${mm(GREEN)} mm`],
      ['Ramp', `1:6 over ${(UT - UF).toFixed(2)} m, R 600 at foot and crest; about ${vFoot.toFixed(1)} m/s at the foot, ${vTee.toFixed(1)} m/s from the tee`],
      ['Platform', '0.50 m falling 1:12 to the portals; funnel 1.0 → 0.42 m (outer rail at 20°)'],
      ['Portals', '3 × 110 mm, 30 mm PVC round noses: Express ★ (outer) · Local ◯ · Shuttle ◆ (inner)'],
      ['Lead-ins', `1:4, ${LI.map(x => Math.round(x * 1000)).reverse().join(' / ')} mm (outer / middle / inner)`],
      ['Loop floor', `plane falling 5° across the box; hairpins R 0.30 / 0.44 / 0.58 m; entries +${RI.map(r => Math.round(plane(-r) * 1000)).reverse().join(' / ')}`],
      ['Exits', `+${EX.map(x => Math.round(x * 1000)).reverse().join(' / ')} mm, carpeted 1:4 bevels of ${EX.map(x => Math.round((x - GREEN) * 1000)).reverse().join(' / ')} mm to the green`],
      ['Lid', '4 mm polycarbonate, 60 mm headroom, 4 thumbscrews; raised 0.2 m strip over the lead-ins'],
      ['Return green', '1.0 × 2.6 m at +67; cup 1.2 m out on the Express exit line'],
      ['Junior tee', 'at the ramp foot; after two roll-backs place on the platform spot for +1'],
    ],
  };
};
