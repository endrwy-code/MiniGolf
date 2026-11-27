// Hole 6 Liberty Island, "Lift Your Lamp" (doc 14, New York iteration 1, M4 and S5). Builder B2, 27 Nov 2026.
// Frame: u along leg A (tee end -u), v across; the L turns toward +v at the far end. y up from the floor.
// Heights: the harbour (leg A and the corner) is the lowest surface (BASE); the island is BASE + 75 with a 1:5 shore.
// Size: leg A 3.0 m and leg B 1.4 m are clear (inside the rails) as doc 14 gives them, so the box is 4.55 m long, not 4.4 (brief G5).
HOLE_BUILDERS[6] = function (h, g, K) {
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

  // ---- numbers (doc 14 hole 6), rail inner faces
  const UA = -2.2, UB = 0.8, UC = 2.2;           // tee-end rail, island leg's inner rail, far rail: leg A 3.0 m + leg B 1.4 m
  const VA = -1.724, VB = -0.824, VE = 1.376;    // harbour outer rail, harbour inner rail (0.90 m harbour), island end rail (leg B 2.20 m)
  const ISL = BASE + 0.075;                      // island +75
  const SH0 = -0.624, SH1 = SH0 + 0.375;         // 1:5 shore (375 mm), its foot 0.10 m past the wave's downstream cheek
  const CU = UC - 1.0, CV = VA + 1.0;            // cone axis: the wave's top edge (R 1.0) is tangent to both outer rails
  const RF = 0.60, WH = 0.40, RHO = 0.05;        // 45 deg cone face from R 0.60 at the foot; 400 mm high including the 50 mm curl lip
  const CUP = [1.5, SH1 + 1.2];                  // 1.2 m past the shore crest, on leg B's centre line
  const TEE = [-1.9, (VA + VB) / 2], JT = [-0.7, (VA + VB) / 2];
  // wave profile in its radial plane: [r, y, normal r, normal y] (normal = the visible side)
  const SQ = Math.SQRT1_2, DS = WH - RHO * (1 + SQ), PR = RF + DS, CR = PR - RHO * SQ, CYc = DS + RHO * SQ;
  const prof = [[RF, 0, -SQ, SQ], [RF + DS / 2, DS / 2, -SQ, SQ], [PR, DS, -SQ, SQ]];
  for (let k = 1; k <= 9; k++) { const a = rad(-45 + 135 * k / 9); prof.push([CR + RHO * Math.cos(a), CYc + RHO * Math.sin(a), -Math.cos(a), -Math.sin(a)]); }
  const RTOP = CR;                               // the curl's top edge overhangs back toward the axis (50 mm lip)
  const arcL = [0]; for (let j = 1; j < prof.length; j++) arcL.push(arcL[j - 1] + Math.hypot(prof[j][0] - prof[j - 1][0], prof[j][1] - prof[j - 1][1]));

  // ---- materials
  const harUvb = s > 0 ? [UA, UC, VA, SH0] : [UA, UC, -SH0, -VA];
  const harTex = topTex(harUvb, 100, (x, X, R) => {
    x.fillStyle = '#2A78BE'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    const r = rand(66); x.lineCap = 'round';
    for (let k = 0; k < 170; k++) {
      const px = X(UA + r() * (UC - UA)), py = R(s * (VA + r() * (SH0 - VA))), rr = 5 + r() * 9;
      x.strokeStyle = `rgba(160,215,250,${0.25 + r() * 0.3})`; x.lineWidth = 1.5 + r() * 1.5; x.beginPath(); x.arc(px, py, rr, Math.PI * 1.15, Math.PI * 1.85); x.stroke();
    }
  });
  const islUvb = s > 0 ? [UB, UC, SH1, VE] : [UB, UC, -VE, -SH1];
  const islTex = topTex(islUvb, 200, (x, X, R, ppm) => {   // island lawn with Fort Wood's 11-point star painted round the cup
    x.fillStyle = '#3E9B57'; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
    const cx = X(CUP[0]), cy = R(s * CUP[1]), ro = 0.42 * ppm, ri = 0.31 * ppm, a0 = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    x.beginPath(); for (let k = 0; k < 22; k++) { const a = a0 + k * Math.PI / 11, rr = k % 2 ? ri : ro; x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); } x.closePath();
    x.fillStyle = '#BAB4A6'; x.fill(); x.lineWidth = 4; x.strokeStyle = '#726C60'; x.stroke();
    x.beginPath(); x.arc(cx, cy, 0.2 * ppm, 0, 7); x.fillStyle = '#A49D8E'; x.fill();
  });
  const waveTex = canvasTex(512, 256, (x, w, hh) => {     // canvas bottom = the wave's foot, top = the curl
    const gr = x.createLinearGradient(0, hh, 0, 0);
    gr.addColorStop(0, '#155E80'); gr.addColorStop(0.55, '#1E9EA6'); gr.addColorStop(0.8, '#6FDCCB'); gr.addColorStop(0.9, '#F2FBF9'); gr.addColorStop(1, '#FFFFFF');
    x.fillStyle = gr; x.fillRect(0, 0, w, hh);
    const r = rand(606); x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineCap = 'round';
    for (let k = 0; k < 60; k++) { const y = hh * (0.06 + Math.pow(r(), 1.6) * 0.5), x0 = r() * w, L = 30 + r() * 90; x.lineWidth = 2 + r() * 4; x.beginPath(); x.moveTo(x0, y); x.quadraticCurveTo(x0 + L / 2, y - 6 - r() * 8, x0 + L, y); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,0.9)'; for (let k = 0; k < 120; k++) { x.beginPath(); x.arc(r() * w, hh * (0.03 + r() * 0.2), 1.5 + r() * 3.5, 0, 7); x.fill(); }
  });
  const waveMat = M('#FFFFFF', { map: waveTex, roughness: 0.55 });
  const foamMat = MC('#EAF6F3', { roughness: 0.8 }), backMat = MC('#1B7F8C', { roughness: 0.7 }), cheekMat = MC('#1C8A96', { roughness: 0.7 });

  // ---- playing surfaces
  const harbour = [[UA, VA], [UC, VA], [UC, SH0], [UB, SH0], [UB, VB], [UA, VB]];   // leg A, the corner under the wave, the wave-foot strip of leg B
  polyBox(harbour, () => BASE, M('#FFFFFF', { map: harTex, roughness: 0.92 }), { edge: allNull(harbour), uvb: harUvb });
  const shore = [[UB, SH0], [UC, SH0], [UC, SH1], [UB, SH1]];
  polyBox(shore, (u, v) => BASE + 0.075 * (v - SH0) / (SH1 - SH0), MC('#D6BF86', { roughness: 0.95 }), { edge: allNull(shore) });
  const island = [[UB, SH1], [UC, SH1], [UC, VE], [UB, VE]];
  polyBox(island, () => ISL, M('#FFFFFF', { map: islTex, roughness: 0.95 }), { edge: allNull(island), uvb: islUvb });

  // ---- the conical banked corner: a 90 deg cone segment (developable, so flexi-ply wraps it), curl lip, closed cheeks and back
  const NPH = 36;
  grid(NPH, prof.length - 1,
    (i, j) => { const ph = rad(-90 + 90 * i / NPH); return [CU + prof[j][0] * Math.cos(ph), BASE + prof[j][1], CV + prof[j][0] * Math.sin(ph)]; },
    (i, j) => [i / NPH, arcL[j] / arcL[arcL.length - 1]],
    (i, j) => { const ph = rad(-90 + 90 * i / NPH); return [prof[j][2] * Math.cos(ph), prof[j][3], s * prof[j][2] * Math.sin(ph)]; }, waveMat);
  {
    const cp = [...prof.map(p => [p[0], p[1]]), [1.0, WH], [1.0, 0]];
    const tris = THREE.ShapeUtils.triangulateShape(cp.map(p => new THREE.Vector2(p[0], p[1])), []), ch = GB();
    for (const [ph, out] of [[-Math.PI / 2, [-1, 0, 0]], [0, [0, 0, s]]]) {
      const c = Math.cos(ph), sn = Math.sin(ph), at = p => P3(CU + p[0] * c, BASE + p[1], CV + p[0] * sn);
      for (const t of tris) ch.tri(at(cp[t[0]]), at(cp[t[1]]), at(cp[t[2]]), [0, 0], [0, 0], [0, 0], out);
    }
    ch.build(cheekMat);
    const shelf = [[UC, CV], [UC, VA], [CU, VA]];
    for (let k = 0; k <= NPH; k++) { const ph = rad(-90 + 90 * k / NPH); shelf.push([CU + RTOP * Math.cos(ph), CV + RTOP * Math.sin(ph)]); }
    const se = allNull(shelf); se[0] = backMat; se[1] = backMat;
    polyBox(shelf, () => BASE + WH, foamMat, { edge: se });     // closed back: the corner behind the face, topped at the curl
    const nose = mesh(new THREE.TorusGeometry(RTOP + 0.006, 0.02, 8, 48, Math.PI / 2), MC('#F3F6F7', { roughness: 0.95 }), g, CU, BASE + WH - 0.006, s * CV);
    nose.rotation.x = -s * Math.PI / 2;                          // padded curl nosing (S5)
  }

  // ---- rails: one closed run round the L, sloped up the shore
  const run = [[UA, VA, BASE], [UA, VB, BASE], [UB, VB, BASE], [UB, SH0, BASE], [UB, SH1, ISL], [UB, VE, ISL], [UC, VE, ISL], [UC, SH1, ISL], [UC, SH0, BASE], [UC, VA, BASE]];
  const outer = railRun(run, +1, true);

  // ---- junior tee (design A: 1.2 m nearer the wave; doc 14 is silent)
  teeMat(JT[0], JT[1], BASE, 0.22, '#7C8494');

  // ---- the pun sign on slim posts at the far rail, behind the wave, facing the tee
  for (const pv of [-1.63, -0.77]) box(0.03, 1.42, 0.03, mats.pole, g, 2.26, 0.71, s * pv);
  boardSign(g, neonTex(['LIFT YOUR', 'LAMP'], h.glow), 2.25, s * -1.2, 1.1, 0.40, 1.05, false);

  // ---- Liberty, after the original 1886 statue: 2.6 m from sole to flame on a 0.60 m pedestal outside the end rail
  const PU = 1.5, PV = 1.626, PED = 0.60;
  box(0.70, 0.06, 0.346, mats.granite, g, PU, 0.03, s * PV);
  box(0.64, 0.50, 0.30, mats.granite, g, PU, 0.31, s * PV);
  box(0.70, 0.04, 0.346, mats.granite, g, PU, PED - 0.02, s * PV);
  const lib = new THREE.Group(); g.add(lib); lib.position.set(PU, PED, s * PV);
  lib.rotation.y = Math.atan2(-Math.sin(rad(6)), -s * Math.cos(rad(6)));   // faces the island (-v), turned 6 deg toward the tee; rotated, never mirrored
  const robeTex = canvasTex(256, 256, (x, w, hh) => {
    x.fillStyle = '#5FA38F'; x.fillRect(0, 0, w, hh);
    const r = rand(1886);
    for (let k = 0; k < 44; k++) { const xx = r() * w, wd = 3 + r() * 7, gr = x.createLinearGradient(xx - wd, 0, xx + wd, 0); gr.addColorStop(0, 'rgba(30,70,58,0)'); gr.addColorStop(0.5, 'rgba(30,70,58,0.5)'); gr.addColorStop(1, 'rgba(30,70,58,0)'); x.fillStyle = gr; x.fillRect(xx - wd, hh * (0.04 + r() * 0.3), 2 * wd, hh); }
    for (let k = 0; k < 30; k++) { x.fillStyle = 'rgba(205,240,226,0.14)'; x.fillRect(r() * w, r() * hh, 2 + r() * 4, 20 + r() * 80); }
  });
  const verdR = M('#FFFFFF', { map: robeTex, roughness: 0.7 }), verd = mats.verdigris;
  const robePts = [[0.001, 0], [0.205, 0], [0.215, 0.04], [0.2, 0.3], [0.185, 0.7], [0.165, 1.0], [0.152, 1.16], [0.168, 1.32], [0.172, 1.42], [0.15, 1.5], [0.09, 1.55], [0.055, 1.57], [0.05, 1.64]];
  const robe = mesh(new THREE.LatheGeometry(robePts.map(p => new THREE.Vector2(p[0], p[1])), 36), verdR, lib); robe.scale.z = 0.7;
  limb(lib, [0.15, 1.47, 0.04], [-0.12, 0.98, 0.1], 0.05, 0.04, verd);           // the palla draped from her left shoulder across the robe
  limb(lib, [0.17, 1.3, 0.05], [-0.15, 0.62, 0.11], 0.045, 0.035, verd);
  limb(lib, [0.17, 1.45, -0.02], [0.19, 0.55, 0.0], 0.05, 0.07, verd);
  mesh(new THREE.BoxGeometry(0.07, 0.04, 0.1), verd, lib, -0.06, 0.02, 0.12);  // right foot stepping out of the hem
  const chain = new THREE.TorusGeometry(0.03, 0.007, 6, 14);                       // the broken chain at her feet
  [[-0.2, 0.05, 0], [-0.24, 0.0, 1.2], [-0.21, -0.05, 0.3]].forEach(([x, z, r]) => { const m = mesh(chain, mats.darkSteel, lib, x, 0.01, z); m.rotation.set(Math.PI / 2, 0, r); });
  cyl(0.045, 0.05, 0.12, verd, lib, 0, 1.6, 0, 14);
  mesh(new THREE.SphereGeometry(0.105, 20, 16), verd, lib, 0, 1.735, 0.01).scale.set(1, 1.18, 1.05);
  mesh(new THREE.CylinderGeometry(0.113, 0.117, 0.045, 24), verd, lib, 0, 1.82, 0.005);
  const rayGeo = new THREE.ConeGeometry(0.02, 0.19, 6), up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < 7; k++) {                                                    // seven rays
    const ps = rad(-72 + 24 * k), el = rad(22), d = new THREE.Vector3(Math.sin(ps) * Math.cos(el), Math.sin(el), Math.cos(ps) * Math.cos(el));
    const m = mesh(rayGeo, verd, lib, 0.113 * Math.sin(ps) + d.x * 0.095, 1.835 + d.y * 0.095, 0.113 * Math.cos(ps) + 0.005 + d.z * 0.095);
    m.quaternion.setFromUnitVectors(up, d);
  }
  const SR = [-0.15, 1.46, 0], ER = [-0.19, 1.8, 0.06], HR = [-0.21, 2.15, 0.1];   // right arm raised (her right is -x; she faces +z)
  limb(lib, SR, ER, 0.065, 0.052, verd); limb(lib, ER, HR, 0.05, 0.04, verd);
  mesh(new THREE.SphereGeometry(0.045, 12, 10), verd, lib, ...HR);
  limb(lib, [HR[0], HR[1] - 0.06, HR[2]], [HR[0], HR[1] + 0.13, HR[2]], 0.032, 0.036, verd);
  cyl(0.075, 0.042, 0.08, mats.gold, lib, HR[0], 2.31, HR[2], 18);
  mesh(new THREE.TorusGeometry(0.078, 0.01, 6, 24), mats.gold, lib, HR[0], 2.35, HR[2]).rotation.x = Math.PI / 2;
  const flame = glow(M('#FFB13B', { emissive: '#FFB13B', emissiveIntensity: 1, roughness: 0.4 }), { glow: 2.6, house: 0.8, dark: 3.0 });
  const fl = mesh(new THREE.ConeGeometry(0.062, 0.25, 18), flame, lib, HR[0], 2.475, HR[2], false);   // battery flame, top 2.60 m above her sole
  mesh(new THREE.ConeGeometry(0.034, 0.16, 12), glow(M('#FFF2B0', { emissive: '#FFF2B0', emissiveIntensity: 1 }), { glow: 3.0, house: 1.0, dark: 3.4 }), lib, HR[0], 2.43, HR[2], false);
  animators.push(t => { if (!reduceMotion) fl.scale.set(1 + Math.sin(t * 9) * 0.06, 1 + Math.sin(t * 13) * 0.06, 1); });
  const SL = [0.15, 1.45, 0], EL = [0.21, 1.17, 0.03], HL = [0.18, 1.08, 0.13];    // left arm holding the tablet
  limb(lib, SL, EL, 0.06, 0.05, verd); limb(lib, EL, HL, 0.045, 0.04, verd);
  mesh(new THREE.SphereGeometry(0.04, 12, 10), verd, lib, ...HL);
  const tabTex = canvasTex(256, 440, (x, w, hh) => {                                // 11:59 on Liberty's tablet: XI:LIX
    x.fillStyle = '#62A792'; x.fillRect(0, 0, w, hh);
    x.strokeStyle = '#3E7A68'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, hh - 28);
    x.fillStyle = '#2F5E52'; x.textAlign = 'center'; x.textBaseline = 'middle';
    fitText(x, 'XI:LIX', w - 50, 96, 800, 'Georgia,"Times New Roman",serif'); x.fillText('XI:LIX', w / 2, hh / 2);
  });
  const tab = mesh(new THREE.BoxGeometry(0.23, 0.4, 0.035), [verd, verd, verd, verd, M('#FFFFFF', { map: tabTex, roughness: 0.7 }), verd], lib, 0.215, 1.16, 0.12);
  tab.rotation.set(0, 0.5, -0.12);

  return {
    tee: [TEE[0], s * TEE[1]], teeY: BASE,
    cup: [CUP[0], s * CUP[1]], cupY: ISL,
    juniorTee: [JT[0], s * JT[1]], juniorTeeY: BASE,
    outlines: [{ p: outer }],
    sizes: [
      ['Leg A (harbour)', '0.90 m inside x 3.00 m (tee-end rail to the island leg), blue carpet at BASE; tee 0.3 m from the end rail'],
      ['Banked corner', 'conical 90 deg segment, axis 1.00 m from both outer rails: 45 deg face from R 0.60 (foot) to R 0.91 at +315 mm, 50 mm curl lip to +400 (lip edge R 0.88); closed back filled to the rails; cheeks closed to the rails; padded nosing'],
      ['Leg B (island)', '1.40 m inside x 2.20 m (harbour rail line to the end rail)'],
      ['Shore', '1:5, 375 mm long, BASE to +75; its foot 0.10 m past the wave\'s cheek'],
      ['Island', 'BASE +75, 1.63 m flat from the crest to the end rail'],
      ['Cup', '1.2 m past the shore crest on leg B\'s centre line, in a painted 11-point star'],
      ['Junior tee', '1.2 m nearer the wave (design A; doc 14 is silent)'],
      ['Statue', '2.6 m sole to flame, on a 0.60 m pedestal outside the end rail; flame top 3.20 m above the floor'],
      ['Rails', 'cap 100 mm above the local surface, sloped up the shore'],
      ['Box', '4.55 x 3.60 m (leg A 3.0 + leg B 1.4 m inside the rails)'],
    ],
  };
};
