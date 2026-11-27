// Hole 7 Brooklyn Bridge, "Meet You in the Middle" (doc 14, New York iteration 1, M5 and S4). Builder B2, 27 Nov 2026.
// Frame: u along the bridge (a tee at each end), v across, y up from the floor. The hole is symmetric in u and in v.
// Heights: the two flat ends are the lowest surface (BASE); the plateau is BASE + 150 (doc 14: +150 above the ends).
HOLE_BUILDERS[7] = function (h, g, K) {
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
  // ---- B2 helpers BEGIN (grid surface with smooth normals; tapered limb)
  function grid(nu, nv, at, uvAt, outAt, mat, parent = g, shadow = true) {
    // indexed surface over (i, j): at(i, j) -> [u, y, v] (unmirrored); outAt(i, j) -> visible-side vector in group coordinates
    const pos = [], uvs = [], idx = [], G = [];
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = at(i, j), q = P3(p[0], p[1], p[2]); G.push(q); pos.push(q[0], q[1], q[2]); const t = uvAt(i, j, p); uvs.push(t[0], t[1]); }
    const id = (i, j) => i * (nv + 1) + j;
    const flip = dot3(crs3(sub3(G[id(1, 0)], G[id(0, 0)]), sub3(G[id(0, 1)], G[id(0, 0)])), outAt(0, 0)) < 0;
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = id(i, j), b = id(i + 1, j), c = id(i + 1, j + 1), d = id(i, j + 1); if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    return mesh(geo, mat, parent, 0, 0, 0, shadow);
  }
  function limb(parent, a, b, ra, rb, mat, seg = 12) {   // tapered cylinder from a to b ([x, y, z] in parent coordinates), radius ra at a, rb at b
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
    const m = mesh(new THREE.CylinderGeometry(rb, ra, L, seg), mat, parent, (A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  }
  const allNull = poly => Object.fromEntries(poly.map((_, i) => [i, null]));
  // ---- B2 helpers END

  // ---- numbers (doc 14 hole 7)
  const HW0 = 0.45, HW1 = 0.25;                  // lane 0.90 m inside on the approaches; rails converge to 0.50 m over each ramp
  const UE = 2.5, UD = UE - HW0;                 // D-end apex (lane 5.0 m inside, apex to apex) and the D's centre (R 450, half the lane)
  const HT = 0.150, TH = rad(12), RR = 0.6;      // plateau +150; 12 deg ramps; R 600 transitions
  const aT = RR * Math.sin(TH), hA = RR * (1 - Math.cos(TH));
  const LS = (HT - 2 * hA) / Math.tan(TH), LR = 2 * aT + LS;   // straight 0.582 m; ramp 0.832 m in plan (doc 14 says "about 0.95": see notes)
  const UP = 0.30, UF = UP + LR;                 // plateau 0.60 m; ramp foot at |u| = 1.132; approaches 1.368 m to the D apex
  const XF3 = Math.tan(rad(3));                  // ramp cross-fall toward the centre line
  const TOP = BASE + HT;
  function prof(x) {                             // x = distance from the ramp foot toward the plateau -> [rise, slope]
    if (x <= 0) return [0, 0];
    if (x < aT) { const q = Math.sqrt(RR * RR - x * x); return [RR - q, x / q]; }
    if (x < aT + LS) return [hA + (x - aT) * Math.tan(TH), Math.tan(TH)];
    if (x < LR) { const xp = LR - x, q = Math.sqrt(RR * RR - xp * xp); return [HT - (RR - q), xp / q]; }
    return [HT, 0];
  }
  const xOf = u => UF - Math.abs(u);
  const hw = u => HW0 - (HW0 - HW1) * Math.min(Math.max(xOf(u), 0), LR) / LR;
  const xfall = u => XF3 * prof(xOf(u))[1] / Math.tan(TH);     // the full 3 deg on the 12 deg straight, faded in and out through the R 600 transitions
  const yS = (u, v) => BASE + prof(xOf(u))[0] + xfall(u) * Math.abs(v);
  const xs = [];
  for (let k = 0; k < 6; k++) xs.push(aT * k / 6);
  for (let k = 0; k < 6; k++) xs.push(aT + LS * k / 6);
  for (let k = 0; k <= 6; k++) xs.push(aT + LS + aT * k / 6);
  const us = [...xs.map(x => -UF + x), 0, ...xs.slice().reverse().map(x => UF - x)];   // -UF .. -UP, 0, UP .. UF

  // ---- materials
  const plankTex = canvasTex(256, 256, (x, w, hh) => {   // 0.6 x 0.6 m tile: 100 mm promenade planks laid across the lane
    const r = rand(77), cols = ['#9C7650', '#8F6A47', '#A57F59', '#946F4C', '#A07A52', '#8B6845'], pw = w / 6;
    for (let i = 0; i < 6; i++) {
      x.fillStyle = cols[i]; x.fillRect(i * pw, 0, pw, hh);
      for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(60,38,20,${0.06 + r() * 0.1})`; x.fillRect(i * pw + r() * pw, 0, 1 + r() * 2, hh); }
      x.fillStyle = '#4A3322'; x.fillRect(i * pw, r() * hh, pw, 2);
    }
    x.fillStyle = '#4A3322'; for (let i = 0; i <= 6; i++) x.fillRect(i * pw - 1.5, 0, 3, hh);
  }, { repeat: [1, 1] });
  const deckMat = M('#FFFFFF', { map: plankTex, roughness: 0.9 });
  const latTex = canvasTex(128, 128, (x, w, hh) => {     // 0.2 x 0.2 m tile of the painted steel lattice railing
    x.fillStyle = '#262B38'; x.fillRect(0, 0, w, hh);
    x.strokeStyle = '#AEB6C4'; x.lineWidth = 7; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, hh); x.moveTo(w, 0); x.lineTo(0, hh); x.stroke();
    x.lineWidth = 4; x.beginPath(); x.moveTo(1, 0); x.lineTo(1, hh); x.stroke();
  }, { repeat: [1, 1] });
  const latMat = M('#FFFFFF', { map: latTex, roughness: 0.6 });
  const stone = canvasTex(128, 128, (x, w, hh) => {      // 0.6 x 0.6 m tile of granite courses for the tower flats
    x.fillStyle = '#AAA294'; x.fillRect(0, 0, w, hh);
    const r = rand(9); for (let k = 0; k < 160; k++) { x.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '60,55,48'},${0.05 + r() * 0.07})`; x.fillRect(r() * w, r() * hh, 2 + r() * 6, 2 + r() * 4); }
    x.fillStyle = '#7E7769'; for (let i = 0; i < 4; i++) { x.fillRect(0, i * 32, w, 2); const o = i % 2 ? 0 : 32; for (let j = 0; j < 2; j++) x.fillRect(o + j * 64, i * 32, 2, 32); }
  }, { repeat: [1, 1] });
  stone.repeat.set(1 / 0.6, 1 / 0.6);
  const stoneMat = M('#FFFFFF', { map: stone, roughness: 0.92 });
  const iron = MC('#1E2A24', { roughness: 0.45, metalness: 0.4 });

  // ---- the two flat ends (Brooklyn at -u, Manhattan at +u), each with its D-shaped end
  for (const sg of [-1, 1]) {
    const poly = [[sg * UF, -HW0], [sg * UF, HW0]];
    for (let k = 0; k <= 16; k++) { const ps = rad(90 - 180 * k / 16); poly.push([sg * (UD + HW0 * Math.cos(ps)), HW0 * Math.sin(ps)]); }
    polyBox(poly, () => BASE, mats.turf, { edge: allNull(poly) });
  }
  // ---- the hill: ramps and plateau as one smooth surface (12 deg, R 600 transitions, 3 deg cross-fall toward the centre line)
  const NV = 6;
  grid(us.length - 1, NV, (i, j) => { const u = us[i], v = (-1 + 2 * j / NV) * hw(u); return [u, yS(u, v), v]; },
    (i, j, p) => [p[0] / 0.6, s * p[2] / 0.6], () => [0, 1, 0], deckMat);
  // 10 mm rubber catch ring, 190 mm across, round the flush cup
  const ring = mesh(new THREE.TorusGeometry(0.09, 0.005, 8, 40), MC('#161616', { roughness: 0.85 }), g, 0, TOP + 0.005, 0); ring.rotation.x = Math.PI / 2;

  // ---- rails: one closed run (D ends, converging over the ramps, sloped with the hill and its cross-fall)
  const edge = us.map(u => [u, hw(u), yS(u, hw(u))]);
  const arcP = (sgU, from, to, n) => { const o = []; for (let k = 0; k <= n; k++) { const ps = rad(from + (to - from) * k / n); o.push([sgU * (UD + HW0 * Math.cos(ps)), HW0 * Math.sin(ps), BASE]); } return o; };
  const run = [
    [-UD, HW0, BASE], ...edge, [UD, HW0, BASE],
    ...arcP(1, 90, -90, 16).slice(1),
    ...edge.slice().reverse().map(p => [p[0], -p[1], p[2]]), [-UD, -HW0, BASE],
    ...arcP(-1, -90, 90, 16).slice(1, -1),
  ];
  const outer = railRun(run, +1, true);
  // painted lattice railing on the rails' outer faces along the bridge (design A volunteers' paint), below the LED line
  function skin(pts, k, y0, dTop, mat) {
    const gb = GB(); let run = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1], du = q[0] - p[0], dv = q[1] - p[1], L = Math.hypot(du, dv); if (L < 1e-6) continue;
      const n = [-dv / L, du / L], a = [p[0] + n[0] * k, p[1] + n[1] * k], b = [q[0] + n[0] * k, q[1] + n[1] * k];
      const ta = p[2] + RAIL_H - dTop, tb = q[2] + RAIL_H - dTop;
      gb.quad(P3(a[0], y0, a[1]), P3(b[0], y0, b[1]), P3(b[0], tb, b[1]), P3(a[0], ta, a[1]), [n[0], 0, s * n[1]],
        [[run / 0.2, y0 / 0.2], [(run + L) / 0.2, y0 / 0.2], [(run + L) / 0.2, tb / 0.2], [run / 0.2, ta / 0.2]]);
      run += L;
    }
    return gb.build(mat, false);
  }
  skin(edge, RT + 0.0015, 0.02, 0.034, latMat);
  skin(edge.slice().reverse().map(p => [p[0], -p[1], p[2]]), RT + 0.0015, 0.02, 0.034, latMat);

  // ---- tee mats: the wrapper draws the -u one; the +u one and both junior tees (0.6 m nearer) here
  box(0.3, 0.008, 0.3, mats.tee, g, 2.25, BASE + 0.004, 0, false);
  for (const sg of [-1, 1]) teeMat(sg * 1.65, 0, BASE, 0.22, '#7C8494');

  // ---- two tower portal flats (S4: the arch clears 2.15 m over the lane, 2.03 m over the rail caps), 170 mm clear of each ramp foot
  const UT = 1.30, LW = 0.74, LI = 0.58, Y0 = 0.30, YS = 1.78, AR = 0.60, AC = AR - LI, HTW = 2.60;
  const tw = new THREE.Shape();
  tw.moveTo(-LW, Y0); tw.lineTo(-LI, Y0); tw.lineTo(-LI, YS);
  tw.absarc(AC, YS, AR, Math.PI, Math.acos(-AC / AR), true);      // pointed Gothic arch: left arc centred right of the axis
  tw.absarc(-AC, YS, AR, Math.acos(AC / AR), 0, true);
  tw.lineTo(LI, Y0); tw.lineTo(LW, Y0); tw.lineTo(LW, 2.45); tw.lineTo(0.78, 2.45); tw.lineTo(0.78, HTW); tw.lineTo(-0.78, HTW); tw.lineTo(-0.78, 2.45); tw.lineTo(-LW, 2.45);
  const twGeo = new THREE.ExtrudeGeometry(tw, { depth: 0.04, bevelEnabled: false, curveSegments: 18 });
  const bagGeo = new THREE.SphereGeometry(1, 10, 6).scale(0.08, 0.035, 0.055), bags = [];
  for (const sgU of [-1, 1]) {
    const f = mesh(twGeo, stoneMat, g, sgU * UT - 0.02, 0, 0); f.rotation.y = Math.PI / 2;
    box(0.05, 0.025, 1.56, mats.base, g, sgU * UT, 2.4375, 0);                              // cornice shadow line
    for (const sg of [-1, 1]) {
      const pu = sgU * (UT - 0.055), pv = s * sg * 0.66;   // post on the plateau side, so each end sees the stone face
      box(0.07, 2.20, 0.07, mats.pole, g, pu, 1.10, pv);                                     // post outside the rail
      for (const du of [-0.1, 0.1]) bags.push([pu + du, 0.035, pv, 0, 0, 0, 1, 1, 1]);
    }
  }
  inst(bagGeo, MC('#B9A57E', { roughness: 1 }), bags, g);

  // ---- festoon "cables" tower to tower, 2.42 m at the low point (doc 14: at least 2.4 m up)
  const cableMat = MC('#202329', { roughness: 0.6 }), cy = u => 2.56 - 0.14 * (1 - (u / UT) ** 2);
  const bulbMat = glow(M('#FFE9B8', { emissive: '#FFD27A', emissiveIntensity: 1, roughness: 0.4 }), { glow: 2.2, house: 0.6, dark: 2.6 });
  const bulbs = [];
  for (const sg of [-1, 1]) {
    const pts = []; for (let k = 0; k <= 24; k++) { const u = -UT + 2 * UT * k / 24; pts.push(new THREE.Vector3(...P3(u, cy(u), sg * 0.66))); }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.006, 6, false), cableMat, g, 0, 0, 0, false);
    for (let u = -1.2; u < 1.21; u += 0.2) bulbs.push([u, cy(u) - 0.03, s * sg * 0.66, 0, 0, 0, 1, 1, 1]);
  }
  inst(new THREE.SphereGeometry(0.022, 10, 8), bulbMat, bulbs, g);
  // the pun sign hangs mid-span over the cup, two-faced so both ends read it (bottom 2.10 m)
  bar([0, 2.425, -0.66], [0, 2.425, 0.66], 0.015, 0.015, mats.pole);
  const signMat = lit(neonTex(['MEET YOU', 'IN THE MIDDLE'], h.glow));
  boardSign(g, null, -0.026, 0, 1.1, 0.30, 2.10, false, signMat);
  boardSign(g, null, 0.026, 0, 1.1, 0.30, 2.10, false, signMat).rotation.y = Math.PI;

  // ---- 11:59: a bridge lamp clock beside the plateau, on the side away from the totem walkway
  const vL = -(h.tside || -1) * 0.60;
  box(0.16, 0.05, 0.16, iron, g, 0, 0.025, vL);
  cyl(0.045, 0.06, 0.25, iron, g, 0, 0.175, vL, 14);
  cyl(0.022, 0.028, 1.32, iron, g, 0, 0.96, vL, 12);
  const drum = mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 32), iron, g, 0, 1.38, vL); drum.rotation.z = Math.PI / 2;
  const clockMat = lit(clockTex(), { glow: 0.9, house: 0.35, dark: 1.1 });
  for (const sg of [-1, 1]) { const f = mesh(new THREE.CircleGeometry(0.1, 32), clockMat, g, sg * 0.0255, 1.38, vL, false); f.rotation.y = sg * Math.PI / 2; }
  const pane = glow(M('#FFE9A8', { emissive: '#FFD86B', emissiveIntensity: 1, roughness: 0.4 }), { glow: 2.0, house: 0.5, dark: 2.4 });
  box(0.12, 0.18, 0.12, pane, g, 0, 1.70, vL);
  for (const [du, dv] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) box(0.014, 0.19, 0.014, iron, g, du * 0.06, 1.70, vL + dv * 0.06);
  box(0.15, 0.02, 0.15, iron, g, 0, 1.60, vL);
  const hat = mesh(new THREE.ConeGeometry(0.11, 0.09, 4), iron, g, 0, 1.835, vL); hat.rotation.y = Math.PI / 4;
  mesh(new THREE.SphereGeometry(0.018, 10, 8), iron, g, 0, 1.89, vL);

  return {
    tee: [-2.25, 0], teeY: BASE,
    cup: [0, 0], cupY: TOP,
    juniorTee: [-1.65, 0], juniorTeeY: BASE,
    secondTee: [2.25, 0], secondJuniorTee: [1.65, 0],
    outlines: [{ p: outer }],
    sizes: [
      ['Lane', '0.90 m inside on the approaches, converging to 0.50 m over each ramp; 5.00 m inside, D apex to D apex (D ends R 450)'],
      ['Plateau', '0.60 x 0.50 m at BASE +150 mm, cup in the middle'],
      ['Ramps', `12 deg with R 600 transitions: ${LR.toFixed(3)} m in plan each (doc 14 "about 0.95")`],
      ['Approaches', `${(UE - UF).toFixed(2)} m flat from each ramp foot to the D apex`],
      ['Cross-fall', '3 deg toward the centre line on the ramps, faded in and out through the transitions; plateau flat'],
      ['Catch ring', '10 mm rubber, 190 mm across, round the flush 108 mm cup'],
      ['Tees', 'one at each end, 0.25 m from the D apex; junior tees 0.6 m nearer'],
      ['Towers', 'two 2.60 m portal flats on posts outside the rails, 0.17 m clear of each ramp foot; arch 2.15 m over the lane'],
      ['Festoons', 'tower to tower, 2.42 m at the low point'],
      ['Rails', 'cap 100 mm above the local surface, sloped over the hill'],
    ],
  };
};
