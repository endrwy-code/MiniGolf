/* Hole 4 Gridlock, "Don't Honk. Just Putt." (doc 14 iteration 1; builder group B, 27 Nov)
   Lane 5.0 x 1.8 m of charcoal needle-punch with the rails standing inside it (doc 14 gives the lane and the bounding box
   both as 5.0 x 1.8), so the clear lane is 4.91 x 1.71. Flat at BASE: G2 removes the +75 green and its bevel; the zebra
   crossing is printed flat where the bevel was and the manhole cup stays 0.5 m past where the crest was (u = 1.7).
   Eight cabs 360 x 170 x 140: two cross rows of 3 parked across the lane (outer cabs closed to the rails, two avenues of
   0.315 m), the middle cab of each row staggered 0.15 m, plus two cabs at 30 deg closed to the rails near the cup, with
   both acute V pockets each side of them filled by a low traffic-island kerb (review S7). */
HOLE_BUILDERS[4] = function (h, g, K) {
  const s = K.s;
  /* ---------- local helpers (the same block is in h2, h4, h5, h6) ---------- */
  const S3 = p => [p[0], s * p[1], p[2]];          // design (u, v, y) -> local, mirrored by K.s
  const S2 = p => [p[0], s * p[1]];
  function surf(P, UV, I, mat, want, parent = g, shadow = true) {
    // P flat [x,y,z...] in local coords; the first triangle is turned to face want(); all others follow it
    const a = I[0] * 3, b = I[1] * 3, c = I[2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], w = want();
    if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) for (let i = 0; i < I.length; i += 3) { const t = I[i + 1]; I[i + 1] = I[i + 2]; I[i + 2] = t; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    if (UV) geo.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    geo.setIndex(I); geo.computeVertexNormals();
    return mesh(geo, mat, parent, 0, 0, 0, shadow);
  }
  // a rectangular band swept along a polyline of local points [u, v, y] (y = the surface under that point):
  // offsets off0..off1 along the side outD (+1 = left of travel in the design frame), heights y+yb..y+yt.
  // Sharp turns split the band into runs so corners stay crisp; curves stay smooth.
  function band(pts, outD, off0, off1, yb, yt, mat, o = {}) {
    const closed = !!o.closed, n = pts.length, out = outD * s, nSeg = closed ? n : n - 1, sn = [];
    for (let i = 0; i < nSeg; i++) { const p = pts[i], q = pts[(i + 1) % n], du = q[0] - p[0], dv = q[1] - p[1], L = Math.hypot(du, dv) || 1e-9; sn.push([-dv / L * out, du / L * out, du / L, dv / L]); }
    const mn = [], sharp = [];
    for (let i = 0; i < n; i++) {
      const A = closed ? sn[(i - 1 + nSeg) % nSeg] : sn[Math.max(0, i - 1)], B = closed ? sn[i % nSeg] : sn[Math.min(nSeg - 1, i)];
      const d = 1 + A[0] * B[0] + A[1] * B[1]; mn.push([(A[0] + B[0]) / d, (A[1] + B[1]) / d]); sharp.push(A[0] * B[0] + A[1] * B[1] < 0.9);
    }
    const runs = [];
    if (closed) {
      const sh = []; for (let i = 0; i < n; i++) if (sharp[i]) sh.push(i);
      if (!sh.length) runs.push([...Array(n).keys(), 0]);
      else for (let k = 0; k < sh.length; k++) { const a = sh[k], b = sh[(k + 1) % sh.length], idx = []; let i = a; do { idx.push(i); i = (i + 1) % n; } while (i !== b); idx.push(b); runs.push(idx); }
    } else { let cur = [0]; for (let i = 1; i < n; i++) { cur.push(i); if (sharp[i] && i < n - 1) { runs.push(cur); cur = [i]; } } runs.push(cur); }
    const us = o.us || 1, made = [];
    for (const idx of runs) {
      const m = idx.length, IB = [], IT = [], OB = [], OT = [], U = []; let acc = 0;
      for (let k = 0; k < m; k++) {
        const i = idx[k], p = pts[i], q = mn[i];
        if (k) { const pp = pts[idx[k - 1]]; acc += Math.hypot(p[0] - pp[0], p[1] - pp[1]); }
        const y0 = p[2] + yb, y1 = p[2] + yt;
        IB.push([p[0] + q[0] * off0, y0, p[1] + q[1] * off0]); IT.push([p[0] + q[0] * off0, y1, p[1] + q[1] * off0]);
        OB.push([p[0] + q[0] * off1, y0, p[1] + q[1] * off1]); OT.push([p[0] + q[0] * off1, y1, p[1] + q[1] * off1]); U.push(acc * us);
      }
      const s0 = sn[idx[0] % nSeg];
      const strip = (A, B, want, mt) => { const P = [], UV = [], I = []; for (let k = 0; k < m; k++) { P.push(...A[k], ...B[k]); UV.push(U[k], 0, U[k], 1); } for (let k = 0; k < m - 1; k++) { const a = 2 * k; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } made.push(surf(P, UV, I, mt || mat, want, o.parent || g, o.shadow !== false)); };
      if (o.inner !== false) strip(IB, IT, () => [-s0[0], 0, -s0[1]], o.matInner);
      if (o.outer !== false) strip(OB, OT, () => [s0[0], 0, s0[1]], o.matOuter);
      if (o.top !== false) strip(IT, OT, () => [0, 1, 0], o.matTop);
      if (o.bottom) strip(IB, OB, () => [0, -1, 0]);
      if (!closed && o.caps !== false) {
        if (idx[0] === 0) made.push(surf([...IB[0], ...OB[0], ...OT[0], ...IT[0]], [0, 0, 1, 0, 1, 1, 0, 1], [0, 1, 2, 0, 2, 3], mat, () => [-s0[2], 0, -s0[3]], o.parent || g));
        if (idx[m - 1] === n - 1) { const e = sn[nSeg - 1]; made.push(surf([...IB[m - 1], ...OB[m - 1], ...OT[m - 1], ...IT[m - 1]], [0, 0, 1, 0, 1, 1, 0, 1], [0, 1, 2, 0, 2, 3], mat, () => [e[2], 0, e[3]], o.parent || g)); }
      }
    }
    return made;
  }
  // the rail family on a clear-edge polyline: 45 mm ribbed body, white cap with its top at +100 mm (G3), LED under the cap
  function rail(pts, outD, o = {}) {
    band(pts, outD, 0, RAIL_T, -0.002, RAIL_H - 0.018, mats.rail, o);
    band(pts, outD, -0.002, 0.076, RAIL_H - 0.018, RAIL_H, mats.cap, Object.assign({}, o, { bottom: true }));
    band(pts, outD, 0.059, 0.071, RAIL_H - 0.048, RAIL_H - 0.036, K.led, Object.assign({}, o, { shadow: false, caps: false }));
  }
  // LED kick strip at the deck base, just outside the deck edge (clear edge + 45 mm)
  function kick(pts2, outD, closed) { band(pts2.map(p => [p[0], p[1], 0]), outD, RAIL_T + 0.002, RAIL_T + 0.022, 0.003, 0.017, K.led, { closed, shadow: false, caps: false }); }
  /* ---------- end of helpers ---------- */

  const L = 5.0, W = 1.8, a = -L / 2, b = L / 2;
  const CU = b - RAIL_T, CV = W / 2 - RAIL_T;               // clear lane: u +-2.455, v +-0.855
  const CUP_U = 1.7, CROSS = [0.8, 1.2];                     // last 1.3 m was the +75 green (crest at u = 1.2); crossing printed where its bevel was
  const JR_U = -0.7;                                         // junior tee 1.5 m in from the adult tee (u = -2.2)

  // the lane: charcoal asphalt, two dashed avenue lines, a stop line, the zebra crossing and the manhole round the cup
  const tex = laneTex(a, -W / 2, b, W / 2, (x, w, hh, ppm) => {
    const X = u => (u - a) * ppm, Y = v => (W / 2 - v) * ppm;
    x.fillStyle = '#323439'; x.fillRect(0, 0, w, hh);
    const R0 = rand(41); for (let k = 0; k < 2600; k++) { x.fillStyle = `rgba(255,255,255,${R0() * 0.06})`; x.fillRect(R0() * w, R0() * hh, 2, 2); }
    x.fillStyle = 'rgba(244,244,239,.85)';
    for (const v of [-0.3375, 0.3375]) for (let u = -2.3; u < 0.55; u += 0.5) x.fillRect(X(u), Y(s * v) - 3, 0.25 * ppm, 6);
    x.fillRect(X(0.62), 0, 0.05 * ppm, hh);                                         // stop line
    for (let k = 0; k < 6; k++) { const v = -0.7 + k * 0.28; x.fillRect(X(CROSS[0]), Y(v + 0.07), (CROSS[1] - CROSS[0]) * ppm, 0.14 * ppm); }
    // manhole cover, flush, cup in its centre
    const cx = X(CUP_U), cy = Y(0), R = 0.23 * ppm;
    x.fillStyle = '#5A5C62'; x.beginPath(); x.arc(cx, cy, R + 4, 0, 7); x.fill();
    x.fillStyle = '#26272B'; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
    x.strokeStyle = '#4A4C52'; x.lineWidth = 3; for (const k of [0.82, 0.6]) { x.beginPath(); x.arc(cx, cy, R * k, 0, 7); x.stroke(); }
    x.save(); x.beginPath(); x.arc(cx, cy, R * 0.58, 0, 7); x.clip(); x.lineWidth = 2;
    for (let d = -R; d <= R; d += 9) { x.beginPath(); x.moveTo(cx + d, cy - R); x.lineTo(cx + d, cy + R); x.stroke(); x.beginPath(); x.moveTo(cx - R, cy + d); x.lineTo(cx + R, cy + d); x.stroke(); }
    x.restore();
  }, 160);
  const deckPts = rectPts(a, -W / 2, b, W / 2);
  deckPoly(deckPts, g, K.fascia, 0, BASE, M('#FFFFFF', { map: tex, roughness: 0.93 }));
  const clear = [[-CU, -CV], [CU, -CV], [CU, CV], [-CU, CV]].map(p => S3([p[0], p[1], BASE]));
  rail(clear, -1, { closed: true });
  kick([[-CU, -CV], [CU, -CV], [CU, CV], [-CU, CV]].map(S2), -1, true);

  // cones painted on the inner faces of the side rails (no loose cones)
  const coneTex = canvasTex(64, 96, (x, w, hh) => { x.clearRect(0, 0, w, hh); x.fillStyle = '#F26A1B'; x.beginPath(); x.moveTo(w / 2, 6); x.lineTo(w - 10, hh - 14); x.lineTo(10, hh - 14); x.fill(); x.fillStyle = '#F4F4EF'; x.fillRect(20, 34, 24, 9); x.fillRect(15, 56, 34, 9); x.fillStyle = '#F26A1B'; x.fillRect(4, hh - 14, w - 8, 10); });
  const coneM = new THREE.MeshStandardMaterial({ map: coneTex, transparent: true, alphaTest: 0.4, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  for (const sv of [-1, 1]) for (const u of [-1.85, -0.72, 0.5, 2.1]) {
    const pm = mesh(new THREE.PlaneGeometry(0.05, 0.075), coneM, g, u, BASE + 0.042, s * sv * (CV - 0.002), false);
    pm.rotation.y = (s * sv > 0) ? Math.PI : 0;   // face into the lane
  }

  // ---- the cabs: unbranded yellow blocks, checker band, invented "CAB 1159" roof sign
  const cabTex = canvasTex(256, 64, (x, w, hh) => { x.fillStyle = '#F7C51A'; x.fillRect(0, 0, w, hh); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#111' : '#F4F4EF'; x.fillRect(i * 16, 30, 16, 7); x.fillStyle = i % 2 ? '#F4F4EF' : '#111'; x.fillRect(i * 16, 37, 16, 7); } x.fillStyle = '#C79A0E'; x.fillRect(126, 4, 3, 56); });
  const cabSide = M('#FFFFFF', { map: cabTex, roughness: 0.45 }), cabY = MC('#F7C51A', { roughness: 0.45 }), glass = MC('#25303D', { roughness: 0.2 });
  const roofTex = canvasTex(128, 48, (x, w, hh) => { x.fillStyle = '#FFF3C4'; x.fillRect(0, 0, w, hh); x.fillStyle = '#1A1A1A'; x.textAlign = 'center'; x.textBaseline = 'middle'; fitText(x, 'CAB 1159', w - 10, 34, 900, FD); x.fillText('CAB 1159', w / 2, hh / 2 + 2); });
  const roofM = glow(M('#FFFFFF', { map: roofTex, emissive: '#FFFFFF', emissiveMap: roofTex, emissiveIntensity: 1, roughness: 0.4 }), { glow: 0.9, house: 0.12, dark: 1.2 });
  const roofEnd = glow(M('#FFF3C4', { emissive: '#FFE680', emissiveIntensity: 1 }), { glow: 0.9, house: 0.12, dark: 1.2 });
  const wheelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.006, 14), wheels = [];
  function cab(cu, cv, rotY) {   // cu, cv local; rotY about y; long axis 0.36 along the cab's local x
    const cg = new THREE.Group(); cg.position.set(cu, BASE, cv); cg.rotation.y = rotY; g.add(cg);
    box(0.36, 0.09, 0.17, [cabY, cabY, cabY, cabY, cabSide, cabSide], cg, 0, 0.045, 0);   // the 360 x 170 block the ball meets
    box(0.20, 0.05, 0.15, [glass, glass, cabY, glass, glass, glass], cg, -0.01, 0.115, 0);     // cabin: top of block at 140 mm
    box(0.07, 0.025, 0.035, [roofEnd, roofEnd, roofEnd, roofEnd, roofM, roofM], cg, -0.01, 0.1525, 0, false);
    for (const [wx, wz] of [[-0.12, -0.0885], [0.12, -0.0885], [-0.12, 0.0885], [0.12, 0.0885]]) { const p = new THREE.Vector3(wx, 0.028, wz).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY); wheels.push([cu + p.x, BASE + p.y, cv + p.z, Math.PI / 2, 0, -rotY]); }
    return cg;
  }
  // two cross rows of three, parked across the lane; outer cabs closed to the rails; middle cab staggered 0.15 m
  const ROWS = [{ u: -1.25, mid: -1.10 }, { u: -0.15, mid: -0.30 }];
  const CAB_V = 0.675;                                          // outer cab centre: 0.855 - 0.18
  for (const r of ROWS) { cab(r.u, s * -CAB_V, Math.PI / 2); cab(r.mid, 0, -Math.PI / 2); cab(r.u, s * CAB_V, -Math.PI / 2); }
  // two cabs at 30 deg, one corner on each rail, angled in toward the cup; low kerb islands fill the V pockets each side
  const U0 = 1.25, c30 = Math.cos(Math.PI / 6), s30 = Math.sin(Math.PI / 6);
  const kerbTex = canvasTex(64, 64, (x, w) => { x.fillStyle = '#A3A39C'; x.fillRect(0, 0, w, w); x.strokeStyle = '#F2C230'; x.lineWidth = 9; for (let k = -w; k < 2 * w; k += 22) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + w, w); x.stroke(); } }, { repeat: [6, 6] });
  const kerbTop = M('#FFFFFF', { map: kerbTex, roughness: 0.85 }), kerbSide = MC('#8C8C86', { roughness: 0.85 });
  for (const sv of [-1, 1]) {
    const P0 = [U0, sv * -CV], ax = [c30, sv * s30], nin = [-s30, sv * c30];   // corner on the rail, axis, inward normal (design frame)
    const at = (k1, k2) => [P0[0] + ax[0] * k1 + nin[0] * k2, P0[1] + ax[1] * k1 + nin[1] * k2];
    const ctr = at(0.18, 0.085);
    cab(ctr[0], s * ctr[1], -Math.atan2(s * ax[1], ax[0]));
    // kerb island: G (upstream, face at 30 deg to the rail) -> F (downstream, face square to the cab) -> P1 -> P3
    const P1 = at(0.36, 0), P3 = at(0, 0.17);
    const Gp = [P3[0] - Math.abs(P3[1] - P0[1]) / Math.tan(Math.PI / 6), P0[1]];
    const Fp = [P1[0] + Math.abs(P1[1] - P0[1]) * Math.tan(Math.PI / 6), P0[1]];
    extrudeXZ([Gp, Fp, P1, P3].map(S2), 0.07, [kerbTop, kerbSide], g, BASE);
  }
  inst(wheelGeo, MC('#141414', { roughness: 0.6 }), wheels, g);

  // ---- sign and the giant cab meter at 11:59, on a slim frame bolted to the end of the deck, facing the tee
  const fu = b + 0.015;
  for (const sv of [-0.55, 0.55]) box(0.03, 1.72, 0.035, mats.pole, g, fu + 0.003, 0.86, s * sv);
  const board = box(0.03, 0.36, 1.3, mats.base, g, fu, 0.95 + 0.18, 0);
  board.material = [mats.base, lit(neonTex(["DON'T HONK.", 'JUST PUTT.'], h.glow)), mats.base, mats.base, mats.base, mats.base];
  const meterTex = canvasTex(512, 300, (x, w, hh) => {
    x.fillStyle = '#1C1D21'; x.fillRect(0, 0, w, hh); x.strokeStyle = '#3A3C42'; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, hh - 16);
    x.fillStyle = '#0B0B0C'; x.fillRect(46, 42, w - 92, 150);
    x.fillStyle = '#FF3B30'; x.shadowColor = '#FF3B30'; x.shadowBlur = 18; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 130px ${FD}`; x.fillText('11:59', w / 2, 122); x.shadowBlur = 0;
    x.fillStyle = '#F7C51A'; x.font = `900 46px ${FD}`; x.fillText('CAB 1159', w / 2, 236);
    x.fillStyle = '#9AA0A8'; x.font = `700 24px ${FB}`; x.fillText('FARE', 90, 236); x.fillText('EXTRAS', w - 90, 236);
  });
  const mm = lit(meterTex, { glow: 1.0, house: 0.3, dark: 1.2 });
  box(0.11, 0.32, 0.54, [mats.base, mm, MC('#2A2C31'), mats.base, mats.base, mats.base], g, fu - 0.04, 1.40 + 0.16, 0);
  box(0.05, 0.05, 0.12, roofEnd, g, fu - 0.04, 1.745, 0, false);   // the meter's "for hire" light

  // junior tee (smaller, lighter)
  box(0.22, 0.008, 0.22, MC('#5B606B', { roughness: 0.9 }), g, JR_U, BASE + 0.004, 0, false);

  return {
    tee: [-2.2, 0], teeY: BASE,
    cup: [CUP_U, 0], cupY: BASE,
    juniorTee: [JR_U, 0], juniorTeeY: BASE,
    outlines: [{ p: deckPts.map(S2) }],
    sizes: [
      ['Lane', '5.0 x 1.8 m charcoal needle-punch, rails inside (clear 4.91 x 1.71 m)'],
      ['Surface', 'flat at deck height; zebra crossing printed flat (no raised green, G2)'],
      ['Cabs', '8 blocks 360 x 170 x 140 mm, screwed from below'],
      ['Rows', 'two cross rows of 3 at u -1.25 / -0.15; avenues 0.315 m'],
      ['Angled cabs', '2 at 30 deg, closed to the rails; V pockets filled with 70 mm kerbs'],
      ['Gaps', 'every gap 0.27 m or more, or closed'],
      ['Cup', 'manhole cover 0.46 m, 0.5 m past the old crest (u 1.7)'],
      ['Junior tee', '1.5 m in from the adult tee'],
      ['Rails', '45 mm, cap top 100 mm, cones painted on'],
    ],
  };
};
