// Hole 8 Hot Dog Cart, "Relish the Moment" (doc 14, New York iteration 1). Builder A2, 27 Nov 2026.
// Frame: u along the hole (open tee end -2.6), v across, y up from the floor. The street lane is the lowest playing surface (BASE);
// doc 14's floor-laid lane 0 / +75 become BASE / BASE+75 (brief G1). The cup sits inside a giant bun whose faces funnel the ball.
HOLE_BUILDERS[8] = function (h, g, K) {
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

  // ---- numbers (doc 14 hole 8)
  const U0 = -2.6, HW = 0.65;              // open tee end; lane 1.3 m inside the rails
  const KF = 0.10, KT = KF + 0.375;        // 1:5 kerb to +75: foot 2.7 m from the tee end (as design B: "the green starts at 2.7 m with a bevel")
  const UM = 1.05, UT = 2.15, UB = 2.35;   // bun mouth; end of the taper = centre of the R 0.20 closed end; closed end apex = back rail face
  const MH = 0.45, CH = 0.20, BR = 0.20;   // mouth 0.90 m, channel 0.40 m, closed end R 0.20 m
  const ST = BASE, SW = BASE + 0.075, BH = 0.15;   // street, sidewalk (+75), bun height above the sidewalk
  const CU0 = -1.0, CU1 = -0.4, ARCH = 0.43;       // cart counter 0.6 m deep; arch 430 mm high, full width
  const CUP = [2.05, 0];                   // 0.30 m from the closed end (UB - 0.30)
  const JT = [CU1 + 1.0, 0];               // junior tee 1.0 m past the cart (on the +75 sidewalk)
  const FACE = Math.atan2(MH - CH, UT - UM);       // 12.8 deg ("about 13")

  // ---- materials
  const kerbM = MC('#8C8C86', { roughness: 0.85 });
  const bunTop = MC('#C98A3B', { roughness: 0.7 }), crumb = MC('#F2DCAE', { roughness: 0.95 }), pvc = MC('#E4E4DE', { roughness: 0.45 });
  const steel = mats.steel, plate = MC('#D8DDE3', { roughness: 0.2, metalness: 0.8 });

  // ---- deck: street (zebra crossing), kerb, sidewalk with the mustard squiggle
  const suv = [U0, KF, -HW, HW];
  const street = topTex(suv, 128, (x, X, R, ppm) => {
    x.fillStyle = '#3B3F45'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    x.fillStyle = '#ECECE4'; for (let k = 0; k < 8; k++) x.fillRect(X(-1.85), R(-0.6 + k * 0.16), 0.40 * ppm, 0.08 * ppm);
  });
  polyBox([[U0, -HW], [KF, -HW], [KF, HW], [U0, HW]], () => ST, M('#FFFFFF', { map: street, roughness: 0.95 }), { edge: { 1: null }, uvb: suv });
  polyBox([[KF, -HW], [KT, -HW], [KT, HW], [KF, HW]], u => ST + (u - KF) / 5, kerbM, { edge: { 1: null, 3: null } });
  const wuv = [KT, UB, -HW, HW];
  const walk = topTex(wuv, 200, (x, X, R, ppm) => {
    x.fillStyle = '#A3A39C'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    x.strokeStyle = 'rgba(40,40,40,.22)'; x.lineWidth = 2;
    for (let u = KT + 0.5; u < UB; u += 0.6) { x.beginPath(); x.moveTo(X(u), 0); x.lineTo(X(u), x.canvas.height); x.stroke(); }
    // mustard squiggle down the channel, ending on the axis at the cup collar
    const u0 = 0.72, u1 = CUP[0] - 0.09, pts = [];
    for (let u = u0; u <= u1 + 1e-6; u += 0.01) { const t = (u - u0) / (u1 - u0); pts.push([u, (0.13 * (1 - t) + 0.035 * t) * Math.sin(2 * Math.PI * (u1 - u) / 0.26)]); }
    const path = () => { x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(X(u), R(s * v)) : x.moveTo(X(u), R(s * v))); };
    x.lineCap = x.lineJoin = 'round';
    x.strokeStyle = '#B8860B'; x.lineWidth = 0.046 * ppm; path(); x.stroke();
    x.strokeStyle = '#F4C430'; x.lineWidth = 0.032 * ppm; path(); x.stroke();
  });
  polyBox([[KT, -HW], [UB, -HW], [UB, HW], [KT, HW]], () => SW, M('#FFFFFF', { map: walk, roughness: 0.92 }), { edge: { 3: null }, uvb: wuv });

  // ---- rails: tee end open, sloped over the kerb; the bun halves fill to them
  const run = [[U0, HW, ST], [KF, HW, ST], [KT, HW, SW], [UB, HW, SW], [UB, -HW, SW], [KT, -HW, SW], [KF, -HW, ST], [U0, -HW, ST]];
  const outer = railRun(run, +1);

  // ---- the bun: two golden halves, 150 mm high, EVA-faced inner faces tapering 0.90 -> 0.40 m, closed end R 0.20 touching the back rail
  const ein = x => Math.sqrt(1 - Math.pow(1 - Math.min(x, 1), 2));
  const hb = (di, dout) => BH - 0.015 * (1 - ein(di / 0.04)) - 0.02 * (1 - ein(dout / 0.05));   // rounded inner and outer top edges, crown at 150
  function surf(rows, mat, out) {   // smooth indexed surface over rows[i][k] = [u, y, v] (unmirrored), oriented to out
    const pos = [], idx = [], nk = rows[0].length;
    rows.forEach(r => r.forEach(p => { const q = P3(...p); pos.push(q[0], q[1], q[2]); }));
    for (let i = 0; i < rows.length - 1; i++) for (let k = 0; k < nk - 1; k++) { const a = i * nk + k, b = a + nk; idx.push(a, b, b + 1, a, b + 1, a + 1); }
    const i0 = Math.floor(rows.length / 3) * nk + Math.floor(nk / 2), P = j => [pos[3 * j], pos[3 * j + 1], pos[3 * j + 2]];
    if (dot3(crs3(sub3(P(i0 + nk), P(i0)), sub3(P(i0 + nk + 1), P(i0))), out) < 0) for (let j = 0; j < idx.length; j += 3) { const t = idx[j + 1]; idx[j + 1] = idx[j + 2]; idx[j + 2] = t; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    return mesh(geo, mat, g, 0, 0, 0);
  }
  const thc = Math.atan2(UB - UT, HW);
  const ths = []; for (let k = 1; k <= 12; k++) ths.push(k * Math.PI / 24); ths.push(thc); ths.sort((a, b) => a - b);
  for (const sg of [-1, 1]) {
    const S = [];   // inner face samples (nose -> apex) with their outer partners on the side rail or the back rail
    for (let i = 0; i <= 8; i++) { const u = UM + (UT - UM) * i / 8, w = MH + (CH - MH) * i / 8; S.push([[u, w], [u, HW]]); }
    for (const th of ths) { const d = [Math.sin(th), Math.cos(th)], ro = Math.min((UB - UT) / d[0], d[1] > 1e-6 ? HW / d[1] : 9); S.push([[UT + BR * d[0], BR * d[1]], [UT + ro * d[0], ro * d[1]]]); }
    const NK = 10, rows = S.map(([I, O]) => {
      const w = Math.hypot(O[0] - I[0], O[1] - I[1]), r = [];
      for (let k = 0; k <= NK; k++) { const f = k / NK; r.push([I[0] + (O[0] - I[0]) * f, SW + hb(f * w, (1 - f) * w), sg * (I[1] + (O[1] - I[1]) * f)]); }
      return r;
    });
    surf(rows, bunTop, [0, 1, 0]);
    const inner = GB(), outerW = GB(), front = GB();
    for (let i = 0; i < S.length - 1; i++) {
      const a = rows[i][0], b = rows[i + 1][0], n = [S[i][0][0] - S[i][1][0], sg * (S[i][0][1] - S[i][1][1])];
      inner.quad(P3(a[0], SW, a[2]), P3(b[0], SW, b[2]), P3(b[0], b[1], b[2]), P3(a[0], a[1], a[2]), [n[0], 0, s * n[1]]);
      const c = rows[i][NK], d = rows[i + 1][NK];
      outerW.quad(P3(c[0], SW + RAIL_H, c[2]), P3(d[0], SW + RAIL_H, d[2]), P3(d[0], d[1], d[2]), P3(c[0], c[1], c[2]), [-n[0], 0, -s * n[1]]);
    }
    for (let k = 0; k < NK; k++) { const a = rows[0][k], b = rows[0][k + 1]; front.quad(P3(a[0], SW, a[2]), P3(b[0], SW, b[2]), P3(b[0], b[1], b[2]), P3(a[0], a[1], a[2]), [-1, 0, 0]); }
    inner.build(crumb); outerW.build(bunTop); front.build(crumb);
    // S3: a 45 deg fill in the corner between the mouth face and the rail (size assumed 0.10 x 0.10 m)
    polyBox([[UM, sg * (MH + 0.10)], [UM, sg * HW], [UM - 0.10, sg * HW]], () => SW + 0.13, bunTop, { y0: SW, edge: { 0: null, 1: null, 2: crumb } });
    // PVC angle on the mouth nose (25 mm legs)
    const nI = [-Math.sin(FACE), -sg * Math.cos(FACE)], tD = [Math.cos(FACE), -sg * Math.sin(FACE)], yc = SW + 0.0675;
    bar([UM - 0.0015, yc, sg * MH], [UM - 0.0015, yc, sg * (MH + 0.025)], 0.003, 0.135, pvc);
    bar([UM + nI[0] * 0.0015, yc, sg * MH + nI[1] * 0.0015], [UM + tD[0] * 0.025 + nI[0] * 0.0015, yc, sg * MH + tD[1] * 0.025 + nI[1] * 0.0015], 0.003, 0.135, pvc);
  }

  // ---- the cart (old case 9, reshaped): counter 0.6 m deep spanning the lane, a full-width 430 mm arch under it, legs on the rail caps
  const cu = (CU0 + CU1) / 2, yb = ST + ARCH, yt = ST + 0.90;
  const menu = canvasTex(768, 250, (x, w, hh) => {
    x.fillStyle = '#F4EBD6'; x.fillRect(0, 0, w, hh); x.fillStyle = '#C8273A'; x.fillRect(0, 0, w, 80);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#FFFFFF'; fitText(x, 'HOT DOGS · PRETZELS · SODA', w - 60, 54, 900, FD); x.fillText('HOT DOGS · PRETZELS · SODA', w / 2, 43);
    x.fillStyle = '#1A1A1A'; fitText(x, 'Open till 11:59', w - 80, 74, 800, FD); x.fillText('Open till 11:59', w / 2, 158);
    for (let i = 0; i < 24; i++) { x.fillStyle = i % 2 ? '#F4EBD6' : '#C8273A'; x.fillRect(i * w / 24, hh - 26, w / 24 + 1, 26); }
  });
  box(0.6, yt - yb, 1.452, [steel, M('#FFFFFF', { map: menu, roughness: 0.6 }), steel, mats.darkSteel, steel, steel], g, cu, (yb + yt) / 2, 0);
  box(0.64, 0.03, 1.5, plate, g, cu, yt + 0.015, 0);
  for (const sg of [-1, 1]) {
    box(0.6, yb - (ST + RAIL_H), 0.06, mats.darkSteel, g, cu, (yb + ST + RAIL_H) / 2, sg * 0.69);
    const wh = mesh(new THREE.TorusGeometry(0.19, 0.015, 8, 32), mats.black, g, cu + 0.12, 0.205, sg * 0.735);
    const hub = cyl(0.035, 0.035, 0.03, mats.darkSteel, g, cu + 0.12, 0.205, sg * 0.735, 12); hub.rotation.x = Math.PI / 2;
    for (let k = 0; k < 3; k++) { const sp = box(0.37, 0.012, 0.012, mats.darkSteel, g, cu + 0.12, 0.205, sg * 0.735); sp.rotation.z = k * Math.PI / 3; }
  }
  // the display dog on the counter (old case 9's dog), lengthwise across the cart
  const dog = new THREE.Group(); dog.position.set(cu, yt + 0.03, 0); dog.rotation.y = Math.PI / 2; g.add(dog);
  const bunC = mesh(new THREE.CapsuleGeometry(0.1, 0.7, 6, 16), MC('#D9A35A', { roughness: 0.8 }), dog, 0, 0.1, 0); bunC.rotation.z = Math.PI / 2; bunC.scale.set(1, 1, 1.15);
  const saus = mesh(new THREE.CapsuleGeometry(0.06, 0.82, 6, 16), MC('#A9412A', { roughness: 0.5 }), dog, 0, 0.18, 0); saus.rotation.z = Math.PI / 2;
  const zz = []; for (let k = 0; k <= 10; k++) zz.push(V(-0.38 + k * 0.076, 0.24, k % 2 ? 0.03 : -0.03));
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zz), 60, 0.013, 6, false), MC('#F2C230', { roughness: 0.5 }), dog);

  // ---- ketchup and mustard bottles (Ø180) touching the rails either side of the arch
  for (const [v, col] of [[-0.56, '#F2C230'], [0.56, '#C8273A']]) {
    const bm = MC(col, { roughness: 0.4 }), u = CU0 - 0.12;
    cyl(0.09, 0.09, 0.45, bm, g, u, ST + 0.225, s * v); cyl(0.02, 0.09, 0.15, bm, g, u, ST + 0.525, s * v); cyl(0.006, 0.014, 0.08, bm, g, u, ST + 0.64, s * v, 8);
  }
  // ---- fries: a giant carton on the cart's counter, beside the display dog (integration fix 27 Nov: it stood in the lane
  //      against the -v rail, an obstacle doc 14 does not have; doc 14 lists fries as dressing only)
  {
    const fu = CU1 - 0.11, fv = -0.47, FY = yt + 0.03 - ST, red = MC('#C8273A', { roughness: 0.6 }), fry = MC('#E8C26A', { roughness: 0.8 }), Rf = rand(9), list = [];
    box(0.2, 0.2, 0.13, [red, red, red, red, MC('#F4EBD6'), MC('#F4EBD6')], g, fu, ST + FY + 0.1, s * fv);
    const fg = new THREE.BoxGeometry(0.022, 1, 0.022).translate(0, 0.5, 0);
    for (let k = 0; k < 12; k++) { const l = 0.14 + Rf() * 0.12; list.push([fu - 0.08 + Rf() * 0.16, ST + FY + 0.17, s * (fv - 0.045 + Rf() * 0.09), (Rf() - 0.5) * 0.4, Rf() * 3, (Rf() - 0.5) * 0.4, 1, l, 1]); }
    inst(fg, fry, list, g);
  }

  // ---- umbrella on a sandbagged post outside the rail (the side away from the street-sign totem), with the "FERRY" blade
  {
    const pv = -(h.tside || -1) * 0.9, pu = cu;
    box(0.3, 0.02, 0.3, mats.base, g, pu, 0.01, pv);
    const bag = mesh(new THREE.SphereGeometry(0.15, 14, 10), MC('#B59E72', { roughness: 1 }), g, pu, 0.075, pv); bag.scale.set(1.35, 0.5, 1.1);
    cyl(0.02, 0.02, 2.18, mats.pole, g, pu, 1.09, pv, 10);
    const stripes = canvasTex(512, 64, (x, w, hh) => { for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#F4EBD6' : '#C8273A'; x.fillRect(i * w / 12, 0, w / 12 + 1, hh); } });
    mesh(new THREE.ConeGeometry(0.8, 0.28, 12, 1, true), M('#FFFFFF', { map: stripes, side: THREE.DoubleSide, roughness: 0.7 }), g, pu, 2.2 - 0.14, pv);
    mesh(new THREE.SphereGeometry(0.025, 10, 8), mats.pole, g, pu, 2.215, pv);
    const blade = t => canvasTex(512, 128, (x, w, hh) => { x.fillStyle = '#17603A'; x.fillRect(0, 0, w, hh); x.strokeStyle = '#FFFFFF'; x.lineWidth = 5; x.strokeRect(8, 8, w - 16, hh - 16); x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle'; fitText(x, t, w - 60, 80, 800, FD); x.fillText(t, w / 2, hh / 2 + 4); });
    const fR = M('#FFFFFF', { map: blade('FERRY →'), roughness: 0.5 }), fL = M('#FFFFFF', { map: blade('← FERRY'), roughness: 0.5 });
    box(0.44, 0.11, 0.012, [mats.base, mats.base, mats.base, mats.base, fR, fL], g, pu + 0.24, 1.55, pv);   // the arrow points +u (on down the hole) from both sides
  }

  // ---- far end: the neon pun sign on slim posts behind the back rail, raised to 1.6-2.02 m (integration fix 27 Nov) so the
  //      cart, display dog and umbrella no longer hide it from the tee
  for (const sg of [-1, 1]) { box(0.04, 2.06, 0.04, mats.pole, g, 2.525, 1.03, sg * 0.5); box(0.12, 0.02, 0.12, mats.base, g, 2.525, 0.01, sg * 0.5); }
  boardSign(g, neonTex(['RELISH THE', 'MOMENT'], h.glow), 2.49, 0, 1.2, 0.42, 1.6, false);

  // ---- junior tee on the sidewalk
  teeMat(JT[0], JT[1], SW, 0.22, '#7C8494');

  return {
    tee: [-2.3, 0], teeY: ST,
    cup: [CUP[0], s * CUP[1]], cupY: SW,
    juniorTee: [JT[0], s * JT[1]], juniorTeeY: SW,
    outlines: [{ p: [...outer, [U0, -s * (HW + 0.076)], [U0, s * (HW + 0.076)]] }],
    sizes: [
      ['Lane', '1.3 m inside the rails; street at deck BASE, tee end open'],
      ['Cart', 'counter 0.6 m deep (1.6–2.2 m from the tee end), arch 430 mm high, full width'],
      ['Kerb', '1:5 to +75 mm, foot 2.7 m from the tee end (0.375 m); about 1.23 m/s at its foot'],
      ['Bun', 'halves 1.3 m (mouth to closed end), 150 mm high, filling to the rails; 5 mm EVA inner faces, PVC angle noses'],
      ['Funnel', 'mouth 0.90 m narrowing to a 0.40 m channel (faces 12.8°), closed end R 0.20 m'],
      ['Corner fills', '45° in the mouth-face/rail corners (S3; 0.10 m legs assumed)'],
      ['Cup', '0.30 m from the closed end, on the axis (lever: 0.1 m off axis if aces run over 40%)'],
      ['Heights', 'street BASE, sidewalk BASE +75 mm, bun crown BASE +225 mm'],
      ['Junior tee', 'on the sidewalk 1.0 m past the cart, 1.45 m from the cup (about 1.3 m/s)'],
      ['Props', 'Ø180 bottles touching the rails at the arch; fries carton on the counter (dressing, not in the lane); umbrella about 2.2 m on a sandbagged post outside the rail; pun sign 1.6–2.02 m'],
    ],
  };
};
