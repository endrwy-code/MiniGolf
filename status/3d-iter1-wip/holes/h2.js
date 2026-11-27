// Hole 2 Grand Central Whispering Gallery, "Meet Me Under the Clock" (doc 14, New York iteration 1). Builder C2, 27 Nov 2026.
// Frame: u along the major axis (tee focus A at -1.03, cup focus B at +1.03), v across, y up from the floor. One flat level at BASE.
HOLE_BUILDERS[2] = function (h, g, K) {
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

  // ---- numbers (doc 14 hole 2): ellipse on the rail's inner (hard) face, a 1.40, b 0.95, so c = 1.028 (doc 14: 1.03)
  const EA = 1.40, EB = 0.95, EC = Math.sqrt(EA * EA - EB * EB), Y = BASE, N = 144;   // one flat level: the whole ellipse is the playing surface
  const ell = []; for (let k = 0; k < N; k++) { const t = 2 * Math.PI * k / N; ell.push([EA * Math.cos(t), EB * Math.sin(t)]); }
  const out = area(ell) > 0 ? -1 : 1;
  const hardboard = MC('#6A4630', { roughness: 0.18 });   // lacquered hardboard face, no EVA (M7)
  const eva = MC('#22252B', { roughness: 0.95 });

  // ---- deck top: teal star field (invented constellations), brass whisper spots at the foci
  const uvb = [-EA, EA, -EB, EB];
  const tex = topTex(uvb, 300, (x, X, R, ppm) => {
    const W = x.canvas.width, Hh = x.canvas.height;
    const gr = x.createRadialGradient(W / 2, Hh / 2, 0, W / 2, Hh / 2, W * 0.55); gr.addColorStop(0, '#2B7782'); gr.addColorStop(1, '#1A525B');
    x.fillStyle = gr; x.fillRect(0, 0, W, Hh);
    const rr = rand(41); x.fillStyle = '#F2D27A';
    for (let k = 0; k < 190; k++) { x.globalAlpha = 0.45 + rr() * 0.55; x.beginPath(); x.arc(rr() * W, rr() * Hh, 1 + rr() * 2.4, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    const star4 = (cx, cy, r) => { x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = i % 2 ? r * 0.32 : r; x.lineTo(cx + q * Math.cos(a), cy + q * Math.sin(a)); } x.closePath(); x.fill(); };
    for (let c = 0; c < 6; c++) {
      const pts = []; let px = (0.12 + 0.76 * rr()) * W, py = (0.15 + 0.7 * rr()) * Hh;
      for (let i = 0; i < 5; i++) { pts.push([px, py]); px += (rr() - 0.5) * 130; py += (rr() - 0.5) * 100; }
      x.strokeStyle = 'rgba(242,210,122,.45)'; x.lineWidth = 1.6; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
      pts.forEach(([a, b]) => star4(a, b, 7));
    }
    const ring = (u, r0, r1, col) => { x.fillStyle = col; x.beginPath(); x.arc(X(u), R(0), r1 * ppm, 0, 7); x.moveTo(X(u) + r0 * ppm, R(0)); x.arc(X(u), R(0), r0 * ppm, 0, 7); x.fill('evenodd'); };
    ring(-EC, 0.19, 0.225, '#C9A24A'); ring(EC, 0.08, 0.13, '#C9A24A'); ring(EC, 0.155, 0.172, '#C9A24A');
  });
  polyBox(ell, () => Y, M('#FFFFFF', { map: tex, roughness: 0.9 }), { edge: noWalls(ell), uvb });

  // ---- the elliptical rail: one closed run (cap 100 mm), lacquered hardboard face all round
  const outer = railRun(ell.map(p => [p[0], p[1], Y]), out, true);
  skin(ell, out, Y, Y + RAIL_H - CT, hardboard, true);

  // ---- information booth at the centre: Ø0.40 x 0.35 m overall, EVA face at ball height, brass, cone top with four clock faces at 11:59
  const RB = 0.2, HD = 0.22, HC = 0.115, HT = HD + HC + 0.015;   // drum 0.22, cone 0.115, finial: 0.35
  cyl(RB, RB, 0.1, eva, g, 0, Y + 0.05, 0, 40);
  cyl(RB, RB, HD - 0.1, mats.gold, g, 0, Y + 0.1 + (HD - 0.1) / 2, 0, 40);
  cyl(RB + 0.001, RB + 0.001, 0.035, MC('#F3E7C6', { roughness: 0.5 }), g, 0, Y + 0.175, 0, 40);   // cream window band
  mesh(new THREE.ConeGeometry(RB, HC, 40), mats.gold, g, 0, Y + HD + HC / 2, 0);
  mesh(new THREE.SphereGeometry(0.015, 12, 8), mats.gold, g, 0, Y + HT - 0.015, 0);
  {
    const dialM = lit(dialTex(256, '#FFF3D6', '#1D1D1D', '#B8892E', false), { glow: 1.0, house: 0.3, dark: 1.3 }), slope = Math.atan2(HC, RB), rm = 0.11;
    for (let k = 0; k < 4; k++) {
      const az = k * H, dx = Math.cos(az), dz = s * Math.sin(az), dg = new THREE.Group();
      dg.position.set(rm * dx, Y + HD + HC * (1 - rm / RB), rm * dz); dg.rotation.order = 'YXZ'; dg.rotation.y = Math.atan2(dx, dz); dg.rotation.x = -(H - slope); g.add(dg);
      mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 24).rotateX(H), mats.gold, dg);
      mesh(new THREE.CircleGeometry(0.04, 28), dialM, dg, 0, 0, 0.0155, false);
    }
  }

  // ---- the existing Ø1 m clock at 11:59 on a braced, ballasted post behind B (top 2.3 m), the pun sign under it
  const CU = 1.50, CY = 1.8, CR = 0.5, PU = 1.58;
  box(0.08, CY + 0.05, 0.08, mats.pole, g, PU, (CY + 0.05) / 2, 0);
  box(0.2, 0.02, 1.2, mats.base, g, 1.59, 0.01, 0);
  for (const sg of [-1, 1]) { bar([PU, 0.95, 0], [PU, 0.03, sg * 0.55], 0.03, 0.03, mats.pole); box(0.18, 0.1, 0.28, MC('#8A7A5C', { roughness: 1 }), g, 1.59, 0.07, s * sg * 0.3); }
  {
    const clk = new THREE.Group(); clk.position.set(CU, CY, 0); g.add(clk);
    mesh(new THREE.CylinderGeometry(CR, CR, 0.07, 64).rotateZ(H), mats.base, clk);
    const rim = mesh(new THREE.TorusGeometry(CR - 0.012, 0.028, 10, 64), mats.gold, clk, -0.035, 0, 0); rim.rotation.y = H;
    const face = mesh(new THREE.CircleGeometry(CR - 0.03, 64), lit(dialTex(512, '#FFF3D6', '#1A2238', '#B8892E', true), { glow: 0.9, house: 0.35, dark: 1.1 }), clk, -0.0365, 0, 0, false);
    face.rotation.y = -H;
    // integration fix (27 Nov): a second face on the back, so the 11:59 clock also faces hole 1's 2027 tower (doc 14 blending: "one minute to go")
    const rimB = mesh(new THREE.TorusGeometry(CR - 0.012, 0.028, 10, 64), mats.gold, clk, 0.035, 0, 0); rimB.rotation.y = H;
    const faceB = mesh(new THREE.CircleGeometry(CR - 0.03, 64), face.material, clk, 0.0365, 0, 0, false);
    faceB.rotation.y = H;
  }
  boardSign(g, neonTex(['MEET ME UNDER', 'THE CLOCK'], h.glow), CU, 0, 1.0, 0.3, 0.92, false);
  plaque(-1.45, (h.tside || -1) * 0.75, ['AIM ANYWHERE OFF THE WALL.', 'EVERY BOUNCE IS', 'THE SAME DISTANCE.'], '#1A2238', '#F2D27A', '#C9A24A');

  return {
    tee: [-EC, 0], teeY: Y,
    cup: [EC, 0], cupY: Y,
    outlines: [{ p: outer }],
    sizes: [
      ['Ellipse (rail face)', 'a 1.40 · b 0.95 m; foci ±1.03 m (c = 1.028)'],
      ['Tee / cup', 'tee on focus A, cup on focus B: every A → wall → B path 2.80 m'],
      ['Booth', 'Ø0.40 × 0.35 m at the centre, EVA face, cone top with four clock faces; blocks about ±12°'],
      ['Rail face', 'hard lacquered hardboard, no EVA (M7); cap 100 mm above the deck'],
      ['Deck', 'one flat level at the deck height, levelled to ±2 mm; teal star field, brass spots at A and B'],
      ['Clock', 'Ø1.0 m at 11:59 on a braced post behind B, top 2.3 m; two faces (the back one looks at hole 1\'s 2027 tower)'],
      ['Footprint', '2.95 × 2.05 m over the rail; 3.4 × 2.1 m with the clock post'],
    ],
  };
};
