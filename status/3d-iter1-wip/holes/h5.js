// Hole 5 Central Park Loop, "Wheel See You Next Year" (doc 14, New York iteration 1). Builder C2, 27 Nov 2026.
// Frame: u along the hole (tee end -u), v across; the Z turns toward +v (leg 1 at -v, leg 3 at +v), y up from the floor.
// Flat at BASE (G2 removes the +75 lawn). Doc 14's legs 1.8 / 1.2 / 2.2 m are read as centre-line lengths (notes/holes-C2.md).
HOLE_BUILDERS[5] = function (h, g, K) {
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

  // ---- group C2 extras (same block in h5 and h2)
  const H = Math.PI / 2;
  const arc = (c, r, t0, t1, n) => { const o = []; for (let k = 0; k <= n; k++) { const t = t0 + (t1 - t0) * k / n; o.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); } return o; };
  const area = p => { let A = 0; p.forEach((a, i) => { const b = p[(i + 1) % p.length]; A += a[0] * b[1] - b[0] * a[1]; }); return A / 2; };
  const noWalls = p => Object.fromEntries(p.map((_, i) => [i, null]));   // deck top only: railRun's body is the deck side
  function skin(pts, out, y0, y1, mat, closed = false) {
    // hard face (lacquered ply / hardboard) on a rail's inner face, 1.5 mm proud, facing the lane; pts [[u, v], ...] unmirrored, out as railRun
    const n = pts.length, gb = GB(), segs = closed ? n : n - 1;
    const nrm = i => { const p = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], q = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)], du = q[0] - p[0], dv = q[1] - p[1], L = Math.hypot(du, dv); return [-dv / L * out, du / L * out]; };
    const at = i => { const p = pts[i % n], m = nrm(i % n); return [p[0] - m[0] * 0.0015, p[1] - m[1] * 0.0015, m]; };
    let run = 0;
    for (let i = 0; i < segs; i++) {
      const a = at(i), b = at(i + 1), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      gb.quad(P3(a[0], y0, a[1]), P3(b[0], y0, b[1]), P3(b[0], y1, b[1]), P3(a[0], y1, a[1]), [-(a[2][0] + b[2][0]), 0, -s * (a[2][1] + b[2][1])], [[run, 0], [run + L, 0], [run + L, 1], [run, 1]]);
      run += L;
    }
    return gb.build(mat, false);
  }
  function plaque(u, vG, lines, bg, ink, rim) {   // small tilted lectern facing the tee end (-u); vG in group coordinates (same side as the page's totem)
    const tex = canvasTex(512, 200, (x, w, hh) => {
      x.fillStyle = rim; x.fillRect(0, 0, w, hh); x.fillStyle = bg; x.fillRect(8, 8, w - 16, hh - 16);
      x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle';
      const lh = (hh - 30) / lines.length;
      lines.forEach((t, i) => { fitText(x, t, w - 50, Math.min(62, lh * 0.8), 800, FD); x.fillText(t, w / 2, 15 + lh * (i + 0.5) + 2); });
    });
    const pg = new THREE.Group(); pg.position.set(u, 0, vG); g.add(pg);
    box(0.04, 0.72, 0.04, mats.pole, pg, 0.02, 0.36, 0);
    box(0.2, 0.02, 0.2, mats.base, pg, 0.02, 0.01, 0);
    const pl = box(0.016, 0.16, 0.4, [mats.base, lit(tex, { glow: 0.7, house: 0.25, dark: 0.9 }), mats.base, mats.base, mats.base, mats.base], pg, 0, 0.78, 0);
    pl.rotation.z = -0.55;   // top leans away from the reader
    return pg;
  }
  function dialTex(sz, face, ink, rim, numerals) {   // clock face at 11:59
    return canvasTex(sz, sz, (x, w) => {
      const c = w / 2; x.fillStyle = rim; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill(); x.fillStyle = face; x.beginPath(); x.arc(c, c, c * 0.92, 0, 7); x.fill();
      x.strokeStyle = ink; x.lineCap = 'round';
      for (let i = 0; i < 60; i++) { const an = i * Math.PI / 30, r0 = c * (i % 5 ? 0.82 : 0.75); x.lineWidth = (i % 5 ? 2 : 6) * w / 256; x.beginPath(); x.moveTo(c + r0 * Math.sin(an), c - r0 * Math.cos(an)); x.lineTo(c + c * 0.87 * Math.sin(an), c - c * 0.87 * Math.cos(an)); x.stroke(); }
      if (numerals) { x.fillStyle = ink; x.font = `800 ${Math.round(w * 0.085)}px ${FD}`; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const an = i * Math.PI / 6, r = c * 0.62; x.fillText(String(i), c + r * Math.sin(an), c - r * Math.cos(an) + w * 0.006); } }
      const hand = (an, len, wd) => { x.lineWidth = wd * w / 256; x.beginPath(); x.moveTo(c, c); x.lineTo(c + len * Math.sin(an), c - len * Math.cos(an)); x.stroke(); };
      hand((11 + 59 / 60) * Math.PI / 6, c * 0.45, 11); hand(59 * Math.PI / 30, c * 0.7, 6);
      x.fillStyle = ink; x.beginPath(); x.arc(c, c, w * 0.035, 0, 7); x.fill();
    });
  }
  // ---- group C2 extras END

  // ---- numbers (doc 14 hole 5). Path 0.9 m clear between rail faces. Legs 1.8 / 1.2 / 2.2 m read as CENTRE-LINE lengths:
  // tee-end rail face -> first centre-line intersection, intersection -> intersection, second intersection -> back rail face.
  // That reading reproduces doc 14's own "ace about 2.9-3.0 m/s" (with its old lawn and 10-15% loss per corner); the Z then
  // measures 4.15 x 2.25 m over the rails, so it is centred in doc 14's 4.8 x 2.8 m box with the park dressing round it.
  const PW = 0.9, LEG1 = 1.8, LEG2 = 1.2, LEG3 = 2.2, RO = 0.9, RI = 0.15, Y = BASE;   // flat: G2 removes the +75 lawn and its 1:5 bevel
  const U0 = -(LEG1 + LEG3) / 2, U1 = U0 + LEG1 + LEG3;   // -2.0 / +2.0 rail faces
  const VA = -(LEG2 + PW) / 2, VC = -VA;                  // -1.05 / +1.05 outer faces of legs 1 and 3
  const UL = U0 + LEG1 - PW / 2, UR = UL + PW;            // leg 2 between -0.65 and +0.25
  const vL1 = VA + PW / 2, vL3 = VC - PW / 2;             // leg centre lines -0.6 / +0.6
  const P1 = [UL, VA + PW], Q2 = [UR, VC - PW];           // inner corners = centres of the R 0.9 outer arcs
  const TEE = [U0 + 0.3, vL1];
  const LAWN0 = U1 - 1.2;                                 // where doc 14's lawn crest was (lawn flat now, still painted)
  const CUP = [LAWN0 + 0.5, vL3];                         // 0.5 m past the old crest = 0.7 m from the back rail
  const JT = [UL + PW / 2, vL1 + 0.28];                   // junior tee on leg 2, just past the first bend

  // ---- materials
  const hard = MC('#C9A46A', { roughness: 0.22 });        // lacquered ply face on the curves (S6: hard, low friction, no EVA)
  const iron = MC('#16181B', { roughness: 0.45, metalness: 0.45 });
  const warm = glow(M('#FFE6B0', { emissive: '#FFC870', emissiveIntensity: 1, roughness: 0.4 }), { glow: 1.8, house: 0.35, dark: 2.2 });
  const stoneTex = canvasTex(256, 256, (x, w) => {
    x.fillStyle = '#A7A296'; x.fillRect(0, 0, w, w); const rr = rand(9);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 5; c++) { const xx = c * 64 - (r % 2) * 32; x.fillStyle = `rgba(${90 + rr() * 40 | 0},${88 + rr() * 30 | 0},${80 + rr() * 25 | 0},.25)`; x.fillRect(xx + 2, r * 32 + 2, 60, 28); }
    x.strokeStyle = '#6F6B62'; x.lineWidth = 3;
    for (let r = 0; r < 8; r++) { const y = r * 32; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); for (let c = 0; c < 5; c++) { const xx = c * 64 - (r % 2) * 32; x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y + 32); x.stroke(); } }
  }, { repeat: [1, 1] });
  const stone = M('#FFFFFF', { map: stoneTex, roughness: 0.9 });

  // ---- the path: one closed lane outline (unmirrored), outer arcs R 0.9 centred on the inner corners, inner corners rounded R 0.15
  const arc1 = arc(P1, RO, -H, 0, 24), arc2 = arc(Q2, RO, H, Math.PI, 24);
  const F2 = [Q2[0] + RI, Q2[1] - RI], F1 = [P1[0] - RI, P1[1] + RI];
  const fil2 = arc(F2, RI, Math.PI, H, 8), fil1 = arc(F1, RI, 0, -H, 8);
  const lane = [[U0, VA], ...arc1, ...fil2, [U1, VC - PW], [U1, VC], ...arc2, ...fil1, [U0, VA + PW]];
  const out = area(lane) > 0 ? -1 : 1;

  const uvb = [U0, U1, VA, VC];   // symmetric in v, so the same in group coordinates
  const tex = topTex(uvb, 220, (x, X, R, ppm) => {
    x.fillStyle = '#3E9B57'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    // the little lawn: last 1.2 m of leg 3, mown stripes (flat now)
    const ya = R(s * (VC - PW)), yb = R(s * VC), y0 = Math.min(ya, yb), y1 = Math.max(ya, yb);
    for (let k = 0; LAWN0 + k * 0.2 < U1 + 0.01; k++) { x.fillStyle = k % 2 ? '#5BB669' : '#4FAA60'; x.fillRect(X(LAWN0 + k * 0.2), y0, 0.2 * ppm + 1, y1 - y0); }
    // fountain basin printed flush round the cup
    const cx = X(CUP[0]), cy = R(s * CUP[1]);
    x.fillStyle = '#C2BCAE'; x.beginPath(); x.arc(cx, cy, 0.24 * ppm, 0, 7); x.fill();
    x.fillStyle = '#8C867A'; x.beginPath(); x.arc(cx, cy, 0.205 * ppm, 0, 7); x.fill();
    const wg = x.createRadialGradient(cx, cy, 0.04 * ppm, cx, cy, 0.19 * ppm); wg.addColorStop(0, '#A8E2F7'); wg.addColorStop(1, '#2F7FC6');
    x.fillStyle = wg; x.beginPath(); x.arc(cx, cy, 0.19 * ppm, 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2; for (const r of [0.095, 0.135, 0.17]) { x.beginPath(); x.arc(cx, cy, r * ppm, 0, 7); x.stroke(); }
  });
  polyBox(lane, () => Y, M('#FFFFFF', { map: tex, roughness: 0.95 }), { edge: noWalls(lane), uvb });

  // ---- rails: one closed run, cap 100 mm over the path; hard lacquered faces on both R 0.9 curves; inner corners filled solid
  const outer = railRun(lane.map(p => [p[0], p[1], Y]), out, true);
  skin(arc1, out, Y, Y + RAIL_H - CT, hard); skin(arc2, out, Y, Y + RAIL_H - CT, hard);
  for (const f of [F1, F2]) mesh(new THREE.CylinderGeometry(RI - RT - 0.001, RI - RT - 0.001, Y + RAIL_H, 20), [K.fascia, mats.cap, mats.base], g, f[0], (Y + RAIL_H) / 2, s * f[1]);

  // ---- stone arch over leg 2 (clear 0.9 x 0.5 m over the path; piers stand clear of the rails)
  {
    const uc = (UL + UR) / 2, rr = PW / 2 + RI, ys = Y + 0.5 - Math.sqrt(rr * rr - PW * PW / 4) + 0.01, uA = uc - rr - 0.14, uB = uc + rr + 0.14, top = ys + rr + 0.15;
    const sh = new THREE.Shape(); sh.moveTo(uA, 0); sh.lineTo(uc - rr, 0); sh.lineTo(uc - rr, ys); sh.absarc(uc, ys, rr, Math.PI, 0, true); sh.lineTo(uc + rr, 0); sh.lineTo(uB, 0); sh.lineTo(uB, top); sh.lineTo(uA, top); sh.lineTo(uA, 0);
    const ag = new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false, curveSegments: 24 }); ag.translate(0, 0, -0.1);
    mesh(ag, stone, g, 0, 0, (VA + PW + VC - PW) / 2 * s);
    box(uB - uA + 0.06, 0.04, 0.26, mats.granite, g, uc, top + 0.02, 0);
    box(0.09, 0.13, 0.22, mats.granite, g, uc, ys + rr + 0.035, 0);   // keystone
  }

  // ---- two borrowed Christmas trees in the Z's pockets (foliage base 0.84 m: doc 14 asks 0.9 m or less), fairy lights
  const needle = MC('#1F5A33', { roughness: 0.85 }), needle2 = MC('#27703F', { roughness: 0.85 }), bark = MC('#5A3B24'), bucket = MC('#B3262E', { roughness: 0.5 });
  const bulbs = [];
  function tree(u, v, top, seed) {
    const V_ = s * v, tiers = [[0.28, 1.15, 0.42], [0.85, 1.7, 0.33], [1.35, top - 0.1, 0.22]];
    cyl(0.17, 0.14, 0.26, bucket, g, u, 0.13, V_, 20); cyl(0.04, 0.05, 0.4, bark, g, u, 0.3, V_, 8);
    tiers.forEach(([y0, y1, r], i) => mesh(new THREE.ConeGeometry(r, y1 - y0, 20), i % 2 ? needle2 : needle, g, u, (y0 + y1) / 2, V_));
    const st = mesh(new THREE.OctahedronGeometry(0.06), mats.gold, g, u, top - 0.06, V_); st.scale.set(1, 1.3, 0.45);
    const rr = rand(seed), rAt = y => { let r = 0; for (const [y0, y1, R0] of tiers) if (y >= y0 && y <= y1) r = Math.max(r, R0 * (y1 - y) / (y1 - y0)); return r; };
    for (let j = 0; j < 72; j++) { const t = j / 72, y = 0.32 + t * (top - 0.55), a = t * Math.PI * 12 + rr() * 0.4, r = rAt(y) + 0.012; bulbs.push([u + r * Math.cos(a), y, V_ + r * Math.sin(a)]); }
  }
  tree(0.95, -0.75, 2.28, 11); tree(-1.12, 0.78, 2.38, 23);

  // ---- the old Bike Lane's wheels as park railings, standing on the floor just outside the curved rails (and one on leg 3)
  const tyre = MC('#151515', { roughness: 0.75 }), hubM = MC('#2F80FF', { roughness: 0.4, metalness: 0.4 }), WR = 0.33, spokes = [];
  function wheel(u, v, tu, tv) {
    const ps = Math.atan2(-s * tv, tu), w = new THREE.Group(); w.position.set(u, WR, s * v); w.rotation.y = ps; g.add(w);
    mesh(new THREE.TorusGeometry(WR - 0.018, 0.02, 10, 48), tyre, w);
    mesh(new THREE.TorusGeometry(WR - 0.045, 0.009, 6, 48), mats.steel, w);
    const hb = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 12), hubM, w); hb.rotation.x = H;
    for (let k = 0; k < 16; k++) spokes.push([u, WR, s * v, 0, ps, k * Math.PI / 8]);
  }
  for (const th of [-60, -30]) { const t = rad(th); wheel(P1[0] + 1.03 * Math.cos(t), P1[1] + 1.03 * Math.sin(t), -Math.sin(t), Math.cos(t)); }
  for (const th of [120, 150]) { const t = rad(th); wheel(Q2[0] + 1.03 * Math.cos(t), Q2[1] + 1.03 * Math.sin(t), -Math.sin(t), Math.cos(t)); }
  wheel(0.75, VC + 0.12, 1, 0);
  inst(new THREE.CylinderGeometry(0.0035, 0.0035, WR - 0.05, 4).translate(0, (WR - 0.05) / 2, 0), mats.steel, spokes, g);
  inst(new THREE.SphereGeometry(0.014, 6, 4), warm, bulbs, g);

  // ---- benches (flat cut-outs), lamp posts, the fountain, the park clock at 11:59
  const benchTex = canvasTex(400, 210, (x, w, hh) => {
    x.clearRect(0, 0, w, hh); x.fillStyle = '#2E5E3B';
    for (let k = 0; k < 3; k++) x.fillRect(30, 22 + k * 30, w - 60, 20);
    x.fillRect(22, 118, w - 44, 22);
    x.fillStyle = '#1A1C1E';
    for (const xx of [44, w - 70]) { x.fillRect(xx, 10, 26, 128); x.fillRect(xx - 8, 138, 18, 72); x.fillRect(xx + 16, 138, 18, 72); x.fillRect(xx - 14, 100, 54, 12); }
  });
  const benchM = M('#FFFFFF', { map: benchTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 });
  for (const [u, v] of [[-0.95, VA - 0.22], [1.55, VC + 0.22]]) mesh(new THREE.PlaneGeometry(0.8, 0.42), benchM, g, u, 0.21, s * v);
  function lamp(u, v) {
    const V_ = s * v; cyl(0.07, 0.09, 0.06, mats.base, g, u, 0.03, V_, 12); cyl(0.022, 0.028, 1.5, iron, g, u, 0.78, V_, 10);
    mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.2, 6), warm, g, u, 1.63, V_); cyl(0.0, 0.1, 0.09, iron, g, u, 1.775, V_, 6);
    mesh(new THREE.SphereGeometry(0.02, 8, 6), iron, g, u, 1.83, V_);
  }
  lamp(2.25, 1.28); lamp(-2.25, 1.22); lamp(0.35, -1.28);
  {
    const fu = 1.75, fv = s * -0.3;
    const wat = glow(M('#4FA8E0', { emissive: '#2F80FF', emissiveIntensity: 1, roughness: 0.15 }), { glow: 0.6, house: 0.05, dark: 0.8 });
    cyl(0.25, 0.27, 0.14, stone, g, fu, 0.07, fv, 28); cyl(0.215, 0.215, 0.01, wat, g, fu, 0.137, fv, 28);
    cyl(0.04, 0.05, 0.24, stone, g, fu, 0.26, fv, 12); cyl(0.13, 0.05, 0.06, stone, g, fu, 0.4, fv, 20); cyl(0.11, 0.11, 0.006, wat, g, fu, 0.43, fv, 20);
    mesh(new THREE.CylinderGeometry(0.006, 0.02, 0.2, 10), glow(M('#DDF3FF', { emissive: '#9AD8FF', emissiveIntensity: 1, transparent: true, opacity: 0.7, roughness: 0.1 }), { glow: 1.2, house: 0.2, dark: 1.5 }), g, fu, 0.53, fv, false);
  }
  {
    const cu = 2.05, cv = s * -1.05;
    cyl(0.08, 0.1, 0.08, iron, g, cu, 0.04, cv, 12); cyl(0.035, 0.04, 1.55, iron, g, cu, 0.8, cv, 12);
    const hd = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.09, 32), iron, g, cu, 1.75, cv); hd.rotation.z = H;
    const fm = lit(dialTex(256, '#F6F1E3', '#1D1D1D', '#2B2B2B', false), { glow: 0.8, house: 0.25, dark: 1.0 });
    for (const sg of [-1, 1]) { const f = mesh(new THREE.CircleGeometry(0.165, 40), fm, g, cu + sg * 0.046, 1.75, cv, false); f.rotation.y = sg * H; }
    mesh(new THREE.SphereGeometry(0.035, 10, 8), mats.gold, g, cu, 1.97, cv);
  }

  // ---- the pun sign at the far end, and the sign line on a lectern in the tee-end corner (clear of the putting line)
  for (const dv of [-0.42, 0.42]) { box(0.04, 1.56, 0.04, mats.pole, g, 2.265, 0.78, s * (vL3 + dv)); box(0.12, 0.02, 0.12, mats.base, g, 2.265, 0.01, s * (vL3 + dv)); }
  boardSign(g, neonTex(['WHEEL SEE YOU', 'NEXT YEAR'], h.glow), 2.235, s * vL3, 1.05, 0.38, 1.18, false);
  plaque(-2.22, s * (VA - 0.13), ['THE RAIL IS', 'YOUR FRIEND'], '#1F4D35', '#F4EBD0', '#C9A24A');

  teeMat(JT[0], JT[1], Y, 0.22, '#7C8494');

  return {
    tee: [TEE[0], s * TEE[1]], teeY: Y,
    cup: [CUP[0], s * CUP[1]], cupY: Y,
    juniorTee: [JT[0], s * JT[1]], juniorTeeY: Y,
    outlines: [{ p: outer }],
    sizes: [
      ['Path', '0.9 m clear between rail faces'],
      ['Legs (centre line)', '1.8 · 1.2 · 2.2 m'],
      ['Corners', 'outer R 0.9 m with a hard lacquered face (S6); inner corners rounded R 0.15 and filled'],
      ['Surface', "flat at the deck: doc 14's +75 lawn and 1:5 bevel removed (G2); lawn still printed"],
      ['Cup', '0.5 m past the old crest (0.7 m from the back rail), in a printed fountain basin'],
      ['Junior tee', 'leg 2, just past the first bend'],
      ['Arch', 'stone arch over leg 2, clear 0.9 × 0.5 m over the path'],
      ['Rails', 'cap 100 mm above the path'],
      ['Trees', "two, 2.3 and 2.4 m, foliage bases Ø0.84 m, in the Z's pockets"],
      ['Footprint', "Z 4.15 × 2.25 m over the rails, centred in doc 14's 4.8 × 2.8 m box"],
    ],
  };
};
