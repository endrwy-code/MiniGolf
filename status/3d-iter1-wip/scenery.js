/* ------------------------------------------------------------------ shared scenery (iteration 1, layout v4)
   Doc 14 "Blending" and "Rooms": charcoal "asphalt" tape Downtown and light-grey "sidewalk" tape in Midtown, zebra
   crossings from each cup to the next tee, the 4.8 x 2.4 m brownstone facade shared by 10 and 9 (stoops behind 10, the
   pizzeria shopfront behind 9's tee, braced through the hole frames plus one L-jack, M8), the 1.6 m subway kiosk of
   hole 3 on Gridlock's sidewalk, the 600 mm park-wall cut-out between 5 and 4, festoons on sandbagged 3 m poles at least
   2.4 m up, and the two hub portals (Downtown bridge arch, Midtown park gate; first cut if money is tight).
   Everything is placed from LAYOUT.scenery, written by tools/make_layout_nyc_v4.py, which checks every clearance and
   keeps props over 2 m at least 0.5 m outside the console sightline. Change positions there, not here.
   Simplified shapes at true size and position; design reference, not construction drawings. No real logos or names. */
const scenery = new THREE.Group(); scene.add(scenery);
const SCN = Object.fromEntries((LAYOUT.scenery || []).map(s => [s.id, s]));
const GLOW_OF = Object.fromEntries(HOLES.map(h => [h.n, h.glow]));
// an item's frame: local x along its length, local z the way its front faces (from `faces`), y up
function scFrame(s) {
  const g = new THREE.Group(); g.position.set(s.position[0], 0, s.position[1]);
  g.rotation.y = s.faces ? Math.atan2(s.faces[0], s.faces[1]) : -(s.rotation || 0) * Math.PI / 180;
  scenery.add(g); return g;
}
// a painted flat: `shape` (x across, y up, metres) extruded `t` thick and centred on z = 0; textured faces 1 mm proud of
// both sides. The back face is the same shape turned half a turn (never mirrored), so lettering reads from both sides.
function scFlat(shape, w, hgt, front, back, edge, parent, t = 0.04) {
  const body = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 14 }); body.translate(0, 0, -t / 2);
  mesh(body, edge, parent);
  const face = new THREE.ShapeGeometry(shape, 14), p = face.attributes.position, uv = face.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, p.getY(i) / hgt);
  mesh(face, front, parent, 0, 0, t / 2 + 0.001, false);
  if (back) mesh(face.clone(), back, parent, 0, 0, -t / 2 - 0.001, false).rotation.y = Math.PI;
}
const sandbag = (parent, x, y, z, ry = 0) => { const b = box(0.3, 0.1, 0.18, MC('#8A7A5C', { roughness: 1 }), parent, x, y + 0.05, z); b.rotation.y = ry; return b; };
const scWarm = glow(M('#FFE9B8', { emissive: '#FFC664', emissiveIntensity: 1, roughness: 0.4 }), { glow: 2.0, house: 0.45, dark: 2.4 });

/* ---- district floor tapes, drawn under everything else on the floor */
for (const id of ['tape-downtown', 'tape-midtown']) {
  const s = SCN[id]; if (!s) continue;
  const asphalt = id === 'tape-downtown';
  const tex = canvasTex(512, 512, (x, w, hh) => {
    x.fillStyle = s.color; x.fillRect(0, 0, w, hh);
    if (asphalt) { const r = rand(5); for (let i = 0; i < 2600; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.12)'; x.fillRect(r() * w, r() * hh, 2, 2); } }
    else { x.strokeStyle = 'rgba(90,96,108,.32)'; x.lineWidth = 3; for (let k = 0; k <= 2; k++) { x.beginPath(); x.moveTo(k * w / 2, 0); x.lineTo(k * w / 2, hh); x.stroke(); x.beginPath(); x.moveTo(0, k * hh / 2); x.lineTo(w, k * hh / 2); x.stroke(); } }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1 / 3, 1 / 3);   // a 3 m tile: 1.5 m sidewalk slabs in Midtown
  const sh = new THREE.Shape(); s.polygon.forEach(([px, pz], i) => i ? sh.lineTo(px, -pz) : sh.moveTo(px, -pz)); sh.closePath();
  const geo = new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, M('#FFFFFF', { map: tex, roughness: asphalt ? 0.95 : 0.85, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  m.position.y = 0.002; m.receiveShadow = true; scenery.add(m);
}

/* ---- zebra crossings on the walks from each cup to the next tee: white bars 0.2 m at 0.4 m pitch, parallel to the walk.
   In Midtown the light "sidewalk" needs a charcoal road strip under the bars, or the crossing would not read. */
{
  const white = [], road = [];
  const quad = (arr, cx, cz, ux, uz, len, wid, y) => {
    const nx = -uz * wid / 2, nz = ux * wid / 2, ax = ux * len / 2, az = uz * len / 2;
    const A = [cx - ax + nx, cz - az + nz], B = [cx + ax + nx, cz + az + nz], C = [cx + ax - nx, cz + az - nz], D = [cx - ax - nx, cz - az - nz];
    arr.push(A[0], y, A[1], C[0], y, C[1], B[0], y, B[1], A[0], y, A[1], D[0], y, D[1], C[0], y, C[1]);
  };
  for (const s of LAYOUT.scenery || []) {
    if (s.kind !== 'zebra') continue;
    const [p, q] = s.path, len = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / len, uz = (q[1] - p[1]) / len;
    const cx = (p[0] + q[0]) / 2, cz = (p[1] + q[1]) / 2, W = s.size[2], bw = s.bars.width, pitch = s.bars.pitch;
    if (s.district === 'B') quad(road, cx, cz, ux, uz, len + 0.1, W + 0.1, 0.0045);
    for (let o = -W / 2 + bw / 2; o <= W / 2 - bw / 2 + 1e-6; o += pitch) quad(white, cx - uz * o, cz + ux * o, ux, uz, len, bw, 0.006);
  }
  for (const [arr, mat] of [[road, MC('#34363B', { roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 })], [white, mats.paintWhite]]) {
    if (!arr.length) continue;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; scenery.add(m);
  }
}

/* ---- the brownstone facade shared by 10 and 9 (4.8 x 2.4 m, front toward the holes, back to the runway painted dark).
   Canvas left = the stoop end behind hole 10's green; canvas right = the pizzeria shopfront behind hole 9's tee. */
if (SCN['facade-10-9']) {
  const s = SCN['facade-10-9'], [FW, FH, FD0] = s.size, PX = 200, g = scFrame(s);
  const X = m => m * PX, Y = m => (FH - m) * PX;
  const paint = (x, em) => {
    const win = (x0, y0, w, h, lintel = '#B59A7E') => {   // a lit sash window; y0 = sill height above the floor
      if (!em) { x.fillStyle = lintel; x.fillRect(X(x0 - 0.04), Y(y0 + h + 0.08), X(w + 0.08), X(0.08)); x.fillRect(X(x0 - 0.03), Y(y0), X(w + 0.06), X(0.04)); }
      const gr = x.createLinearGradient(0, Y(y0 + h), 0, Y(y0)); gr.addColorStop(0, em ? '#FFD890' : '#FFE2A0'); gr.addColorStop(1, em ? '#C9782E' : '#E39A4C');
      x.fillStyle = gr; x.fillRect(X(x0), Y(y0 + h), X(w), X(h));
      if (!em) { x.fillStyle = '#2A1A12'; x.fillRect(X(x0), Y(y0 + h / 2 + 0.01), X(w), X(0.02)); x.fillRect(X(x0 + w / 2 - 0.01), Y(y0 + h), X(0.02), X(h)); x.strokeStyle = '#EDE3D2'; x.lineWidth = 4; x.strokeRect(X(x0), Y(y0 + h), X(w), X(h)); }
    };
    if (!em) {
      // brownstone townhouse (0 - 2.3 m): rusticated sandstone, cornice with brackets
      x.fillStyle = '#7B4B36'; x.fillRect(0, 0, X(2.3), X(FH));
      x.fillStyle = '#673C2B'; for (let yy = 0.12; yy < FH; yy += 0.12) x.fillRect(0, Y(yy), X(2.3), 3);
      x.fillStyle = '#4A2C20'; x.fillRect(0, 0, X(2.3), X(0.16)); for (let k = 0.1; k < 2.3; k += 0.26) x.fillRect(X(k), X(0.16), X(0.06), X(0.07));
      // red-brick tenement (2.3 - 4.8 m) with a dark cornice
      x.fillStyle = '#9A3B2C'; x.fillRect(X(2.3), 0, X(2.5), X(FH));
      x.fillStyle = 'rgba(60,20,14,.55)'; for (let yy = 0, r = 0; yy < FH; yy += 0.075, r++) { x.fillRect(X(2.3), Y(yy), X(2.5), 2); for (let xx = 2.3 + (r % 2) * 0.11; xx < 4.8; xx += 0.22) x.fillRect(X(xx), Y(yy + 0.075), 2, X(0.075)); }
      x.fillStyle = '#2E2A2A'; x.fillRect(X(2.3), 0, X(2.5), X(0.14)); x.fillStyle = '#4B4444'; x.fillRect(X(2.3), X(0.14), X(2.5), X(0.03));
      x.fillStyle = '#3C2A22'; x.fillRect(X(2.29), 0, X(0.03), X(FH));
    } else { x.fillStyle = '#000'; x.fillRect(0, 0, X(FW), X(FH)); }
    // townhouse windows: two upper, two parlour-floor beside the door, one garden window
    win(0.3, 1.55, 0.36, 0.55); win(0.95, 1.55, 0.36, 0.55); win(1.6, 1.55, 0.36, 0.55);
    win(0.25, 0.8, 0.34, 0.52); win(0.75, 0.8, 0.34, 0.52); win(0.2, 0.12, 0.42, 0.26);
    if (!em) {
      // the stoop: steps rising to the parlour door, iron railings either side (the doc 14 brownstone)
      x.fillStyle = '#5E3727'; x.beginPath(); x.moveTo(X(1.15), Y(0)); x.lineTo(X(2.2), Y(0)); x.lineTo(X(2.05), Y(0.75)); x.lineTo(X(1.5), Y(0.75)); x.closePath(); x.fill();
      x.fillStyle = '#A9846A'; for (let k = 0; k < 6; k++) { const yy = 0.125 * (k + 1), f = yy / 0.75; x.fillRect(X(1.15 + 0.35 * f), Y(yy), X(1.05 - 0.2 * f), 3); }
      x.strokeStyle = '#121212'; x.lineWidth = 4;
      for (const [b0, t0] of [[1.15, 1.5], [2.2, 2.05]]) { x.beginPath(); x.moveTo(X(b0), Y(0.32)); x.lineTo(X(t0), Y(1.08)); x.stroke(); for (let f = 0; f <= 1.001; f += 0.125) { const xx = b0 + (t0 - b0) * f, yy = 0.75 * f; x.beginPath(); x.moveTo(X(xx), Y(yy)); x.lineTo(X(xx), Y(yy + 0.32)); x.stroke(); } x.beginPath(); x.arc(X(b0), Y(0.36), 7, 0, 7); x.stroke(); }
      x.fillStyle = '#2B1A13'; x.fillRect(X(1.55), Y(1.62), X(0.45), X(0.87));   // the door with its transom
      x.fillStyle = '#4F2E22'; x.fillRect(X(1.6), Y(1.38), X(0.17), X(0.6)); x.fillRect(X(1.79), Y(1.38), X(0.17), X(0.6));
      x.fillStyle = '#E8C77A'; x.fillRect(X(1.6), Y(1.58), X(0.36), X(0.16));
      x.fillStyle = '#B59A7E'; x.fillRect(X(1.5), Y(1.7), X(0.55), X(0.08));
      x.fillStyle = '#3BE36B'; x.fillRect(0, Y(0.06), X(2.29), X(0.03));   // a stripe of hole 10's green along the foot
      // pizzeria shopfront behind hole 9's tee: awning, sign band, window, door; fire escape on the floor above
      x.fillStyle = '#1F2421'; x.fillRect(X(2.5), Y(1.3), X(2.15), X(1.3));
      x.fillStyle = '#FF6A2B'; x.fillRect(X(2.3), Y(0.06), X(2.5), X(0.03));   // a stripe of hole 9's orange
    }
    // shop window and door glass (lit)
    { const gr = x.createLinearGradient(0, Y(1.05), 0, Y(0.3)); gr.addColorStop(0, em ? '#FFCF85' : '#FFE0A6'); gr.addColorStop(1, em ? '#E06A2A' : '#F08A3C'); x.fillStyle = gr; x.fillRect(X(2.62), Y(1.05), X(1.35), X(0.75)); x.fillRect(X(4.12), Y(1.1), X(0.4), X(0.62)); }
    win(2.6, 1.72, 0.34, 0.42, '#8E8378'); win(3.25, 1.72, 0.34, 0.42, '#8E8378'); win(3.9, 1.72, 0.34, 0.42, '#8E8378'); win(4.45, 1.72, 0.28, 0.42, '#8E8378');
    if (!em) {
      // inside the window: a counter, the oven mouth and pies on the counter
      x.fillStyle = '#5A3A26'; x.fillRect(X(2.62), Y(0.55), X(1.35), X(0.25));
      x.fillStyle = '#3B2A20'; x.beginPath(); x.arc(X(3.55), Y(0.62), X(0.24), Math.PI, 0); x.fill();
      x.fillStyle = '#FF7A2A'; x.beginPath(); x.arc(X(3.55), Y(0.62), X(0.17), Math.PI, 0); x.fill();
      for (const cx of [2.82, 3.08]) { x.fillStyle = '#E9B95A'; x.beginPath(); x.ellipse(X(cx), Y(0.57), X(0.11), X(0.035), 0, 0, 7); x.fill(); x.fillStyle = '#C8402A'; x.beginPath(); x.ellipse(X(cx), Y(0.575), X(0.08), X(0.022), 0, 0, 7); x.fill(); }
      x.strokeStyle = '#1F2421'; x.lineWidth = 6; x.strokeRect(X(2.62), Y(1.05), X(1.35), X(0.75)); x.strokeRect(X(4.12), Y(1.1), X(0.4), X(1.1));
      // awning: red and white stripes, scalloped edge
      for (let k = 0; k < 14; k++) { x.fillStyle = k % 2 ? '#F6F1E6' : '#C8273A'; x.beginPath(); const a0 = 2.5 + k * 0.155, a1 = a0 + 0.155; x.moveTo(X(a0 + 0.03), Y(1.42)); x.lineTo(X(a1 + 0.03), Y(1.42)); x.lineTo(X(a1), Y(1.2)); x.lineTo(X(a0), Y(1.2)); x.closePath(); x.fill(); x.beginPath(); x.arc(X(a0 + 0.0775), Y(1.2), X(0.0775), 0, Math.PI); x.fill(); }
      // sign band (invented shop, generic words only)
      x.fillStyle = '#123D2A'; x.fillRect(X(2.5), Y(1.62), X(2.2), X(0.18));
      x.fillStyle = '#FFF3D6'; x.textAlign = 'center'; x.textBaseline = 'middle'; fitText(x, 'PIZZA · BY THE SLICE', X(2.05), X(0.13), 900, FD); x.fillText('PIZZA · BY THE SLICE', X(3.6), Y(1.53) + 2);
      // fire escape: a platform under the upper windows, railing, a ladder and the drop ladder
      x.strokeStyle = '#141414'; x.fillStyle = '#141414'; x.lineWidth = 4;
      x.fillRect(X(2.5), Y(1.68), X(2.0), X(0.035));
      x.beginPath(); x.moveTo(X(2.5), Y(1.98)); x.lineTo(X(4.5), Y(1.98)); x.stroke();
      for (let k = 2.5; k <= 4.501; k += 0.1) { x.beginPath(); x.moveTo(X(k), Y(1.68)); x.lineTo(X(k), Y(1.98)); x.stroke(); }
      x.beginPath(); x.moveTo(X(3.0), Y(1.71)); x.lineTo(X(3.55), Y(2.3)); x.moveTo(X(3.1), Y(1.71)); x.lineTo(X(3.65), Y(2.3)); x.stroke();
      for (let f = 0.1; f < 1; f += 0.12) { x.beginPath(); x.moveTo(X(3.0 + 0.55 * f), Y(1.71 + 0.59 * f)); x.lineTo(X(3.1 + 0.55 * f), Y(1.71 + 0.59 * f)); x.stroke(); }
      x.beginPath(); x.moveTo(X(4.3), Y(1.68)); x.lineTo(X(4.3), Y(1.42)); x.moveTo(X(4.42), Y(1.68)); x.lineTo(X(4.42), Y(1.42)); x.stroke();
    }
  };
  const col = canvasTex(Math.round(FW * PX), Math.round(FH * PX), x => paint(x, false));
  const em = canvasTex(Math.round(FW * PX), Math.round(FH * PX), x => paint(x, true));
  const front = glow(M('#FFFFFF', { map: col, emissive: '#FFFFFF', emissiveMap: em, emissiveIntensity: 1, roughness: 0.85 }), { glow: 0.75, house: 0.12, dark: 0.95 });
  const sh = new THREE.Shape(); sh.moveTo(-FW / 2, 0); sh.lineTo(FW / 2, 0); sh.lineTo(FW / 2, FH); sh.lineTo(-FW / 2, FH); sh.closePath();
  const drape = MC('#1B1C22', { roughness: 0.95 });
  const panel = new THREE.Group(); panel.position.z = FD0 / 2 - 0.03; g.add(panel);   // the painted face 30 mm behind the front of its 0.2 m strip
  scFlat(sh, FW, FH, front, drape, drape, panel, 0.04);
  box(FW + 0.04, 0.08, 0.14, MC('#3A2A24', { roughness: 0.7 }), g, 0, FH - 0.04, FD0 / 2 - 0.07);   // cornice, 9 mm proud of the face
  box(FW, 0.05, FD0, mats.darkSteel, g, 0, 0.025, 0);                                                  // base rail
  for (const k of [-1.6, 0, 1.6]) box(0.05, FH - 0.1, 0.05, mats.darkSteel, g, k, FH / 2, -FD0 / 2 + 0.04);   // back studs
  // steel-angle outriggers from the base rail under hole 9's and hole 10's frames (the holes are the ballast)
  for (const [[x0, z0], [x1, z1]] of (s.bracing && s.bracing.outriggers) || []) { const l = Math.hypot(x1 - x0, z1 - z0); const o = box(0.05, 0.04, l, mats.darkSteel, scenery, (x0 + x1) / 2, 0.02, (z0 + z1) / 2); o.rotation.y = Math.atan2(x1 - x0, z1 - z0); }
}
// the 2 x 15 kg L-jack in the 10/9 gap, on the hole side of the facade
if (SCN['facade-jack']) {
  const s = SCN['facade-jack'], [cx, cz] = s.position, zf = SCN['facade-10-9'] ? SCN['facade-10-9'].footprint[0][0][1] : cz + 0.3, zb = zf - s.size[0];
  const j = new THREE.Group(); scenery.add(j);
  cylBetween(V(cx, 0.03, zf - 0.03), V(cx, s.size[1], zf - 0.03), 0.022, mats.darkSteel, j, 8);
  cylBetween(V(cx, 0.03, zf - 0.03), V(cx, 0.03, zb + 0.03), 0.022, mats.darkSteel, j, 8);
  cylBetween(V(cx, 0.05, zb + 0.06), V(cx, 1.9, zf - 0.03), 0.018, mats.darkSteel, j, 8);
  for (const k of [0.2, 0.42]) box(0.26, 0.1, 0.18, MC('#5A5E66', { roughness: 0.6, metalness: 0.4 }), j, cx, 0.1, zb + k);   // 15 kg stage weights
}

/* ---- subway kiosk (hole 3's, on Gridlock's sidewalk): green iron railings round a painted stairwell, two battery globe
   lamps at 1.6 m, an entrance plate with the invented line symbols of hole 3 (star, ring, diamond) */
if (SCN['subway-kiosk']) {
  const s = SCN['subway-kiosk'], [KW, KH, KD] = s.size, g = scFrame(s), iron = MC('#1E4A37', { roughness: 0.5, metalness: 0.3 });
  const well = canvasTex(256, 180, (x, w, hh) => { x.fillStyle = '#2B2D31'; x.fillRect(0, 0, w, hh); for (let k = 0; k < 9; k++) { const t = k / 9; x.fillStyle = `rgb(${Math.round(150 - 120 * t)},${Math.round(152 - 120 * t)},${Math.round(156 - 120 * t)})`; x.fillRect(16, 10 + t * (hh - 20), w - 32, (hh - 20) / 9 - 3); } x.fillStyle = '#F2C230'; x.fillRect(16, hh - 14, w - 32, 6); });
  const fl = mesh(new THREE.PlaneGeometry(KW - 0.06, KD - 0.06), M('#FFFFFF', { map: well, roughness: 0.8 }), g, 0, 0.007, 0, false); fl.rotation.x = -Math.PI / 2; fl.rotation.z = Math.PI;
  const RH = 0.95, sides = [[[-KW / 2, -KD / 2], [KW / 2, -KD / 2]], [[-KW / 2, -KD / 2], [-KW / 2, KD / 2]], [[KW / 2, -KD / 2], [KW / 2, KD / 2]]];
  const bal = [];
  for (const [[ax, az], [bx, bz]] of sides) {
    for (const y of [0.08, RH - 0.03, RH]) cylBetween(V(ax, y, az), V(bx, y, bz), y === RH ? 0.02 : 0.012, iron, g, 8);
    const l = Math.hypot(bx - ax, bz - az); for (let t = 0.1; t < l - 0.05; t += 0.1) bal.push([ax + (bx - ax) * t / l, (RH + 0.08) / 2, az + (bz - az) * t / l]);
  }
  inst(new THREE.CylinderGeometry(0.007, 0.007, RH - 0.08, 6), iron, bal, g);
  for (const [px, pz] of [[-KW / 2, -KD / 2], [KW / 2, -KD / 2], [-KW / 2, KD / 2], [KW / 2, KD / 2]]) cyl(0.03, 0.035, RH + 0.04, iron, g, px, (RH + 0.04) / 2, pz, 10);
  // globe lamps on the two front posts
  const globeM = glow(M('#BFF5C9', { emissive: '#58E07A', emissiveIntensity: 1, roughness: 0.3, transparent: true, opacity: 0.92 }), { glow: 1.7, house: 0.4, dark: 2.0 });
  for (const sx of [-1, 1]) { cyl(0.022, 0.026, KH - 0.2 - RH, iron, g, sx * KW / 2, RH + (KH - 0.2 - RH) / 2, KD / 2, 10); cyl(0.05, 0.035, 0.05, iron, g, sx * KW / 2, KH - 0.19, KD / 2, 12); mesh(new THREE.SphereGeometry(0.1, 20, 14), globeM, g, sx * KW / 2, KH - 0.1, KD / 2); }
  // entrance plate on the back railing, readable from both sides
  const plate = canvasTex(640, 160, (x, w, hh) => {
    x.fillStyle = '#121212'; x.fillRect(0, 0, w, hh); x.fillStyle = '#FFFFFF'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.font = `900 76px ${FD}`; x.fillText('SUBWAY', 26, hh / 2 + 4);
    const sym = (kind, c, cx, cy, r) => { x.fillStyle = c; x.strokeStyle = c; x.lineWidth = 12; x.beginPath();
      if (kind === 'ring') { x.arc(cx, cy, r - 6, 0, 7); x.stroke(); return; }
      if (kind === 'diamond') { x.moveTo(cx, cy - r); x.lineTo(cx + r, cy); x.lineTo(cx, cy + r); x.lineTo(cx - r, cy); }
      else for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
      x.closePath(); x.fill(); };
    sym('star', '#E8483A', 420, hh / 2, 40); sym('ring', '#2FB15A', 505, hh / 2, 38); sym('diamond', '#F2C230', 585, hh / 2, 38);
    x.fillStyle = '#79DCFF'; x.fillRect(0, hh - 10, w, 10);   // a stripe of hole 3's ice blue
  });
  const pm = M('#FFFFFF', { map: plate, roughness: 0.5 });
  box(0.8, 0.2, 0.02, [mats.base, mats.base, mats.base, mats.base, pm, pm], g, 0, RH + 0.14, -KD / 2);
  for (const sx of [-0.38, 0.38]) box(0.02, 0.06, 0.02, iron, g, sx, RH + 0.02, -KD / 2);
}

/* ---- the park-wall cut-out: Central Park's low fieldstone wall, 600 mm, facing Fifth Avenue (hole 4) */
if (SCN['park-wall-cutout']) {
  const s = SCN['park-wall-cutout'], [PWL, PWH, PWD] = s.size, g = scFrame(s);
  const t = canvasTex(Math.round(PWL * 200), Math.round(PWH * 200), (x, w, hh) => {
    x.fillStyle = '#8D8A82'; x.fillRect(0, 0, w, hh); const r = rand(23);
    for (let row = 0; row < 4; row++) for (let cx = -r() * 40; cx < w; ) { const sw = 46 + r() * 50, y0 = 26 + row * 22; x.fillStyle = ['#9C988E', '#7E7B73', '#A7A296', '#8B867B'][Math.floor(r() * 4)]; x.beginPath(); x.ellipse(cx + sw / 2, y0 + 11, sw / 2 - 3, 10, 0, 0, 7); x.fill(); cx += sw; }
    x.fillStyle = '#B9B4A6'; x.fillRect(0, 0, w, 22); x.fillStyle = '#6F6C66'; x.fillRect(0, 22, w, 3);
    x.fillStyle = '#9B5CFF'; x.fillRect(0, hh - 7, w, 7);   // a stripe of hole 4's purple (it faces Gridlock)
  });
  const sh = new THREE.Shape(); sh.moveTo(-PWL / 2, 0); sh.lineTo(PWL / 2, 0); sh.lineTo(PWL / 2, PWH); sh.lineTo(-PWL / 2, PWH); sh.closePath();
  scFlat(sh, PWL, PWH, M('#FFFFFF', { map: t, roughness: 0.9 }), mats.flatBack, mats.flatBack, g, 0.04);
  for (const k of [-PWL / 2 + 0.2, PWL / 2 - 0.2]) box(0.12, 0.25, PWD, mats.flatBack, g, k, 0.125, 0);   // braced feet
}

/* ---- festoon poles (3 m, sandbagged base plates) and the festoon runs between them, lowest point at least 2.4 m */
for (const s of LAYOUT.scenery || []) {
  if (s.kind !== 'festoon_pole') continue;
  const [x, z] = s.position, H3 = s.size[1];
  box(0.4, 0.02, 0.4, mats.darkSteel, scenery, x, 0.01, z);
  cyl(0.025, 0.03, H3, mats.pole, scenery, x, H3 / 2, z, 10);
  cyl(0.035, 0.035, 0.04, mats.darkSteel, scenery, x, H3 - 0.02, z, 10);
  sandbag(scenery, x - 0.1, 0.02, z, Math.PI / 2); sandbag(scenery, x + 0.1, 0.02, z, Math.PI / 2);
}
{
  const bulbs = [], cable = MC('#1A1A1A', { roughness: 0.6 });
  for (const s of LAYOUT.scenery || []) {
    if (s.kind !== 'festoon') continue;
    const minH = s.min_height || 2.4;
    for (const [ia, ib] of s.runs) {
      const a = s.points[ia], b = s.points[ib]; if (!a || !b) continue;
      const ya = a[2] - 0.04, yb = b[2] - 0.04, sag = Math.max(0.05, Math.min(0.4, Math.min(ya, yb) - (minH + 0.05)));
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]), N = Math.max(8, Math.round(len / 0.3));
      const P = t => V(a[0] + (b[0] - a[0]) * t, ya + (yb - ya) * t - 4 * sag * t * (1 - t), a[1] + (b[1] - a[1]) * t);
      for (let i = 0; i < N; i++) { cylBetween(P(i / N), P((i + 1) / N), 0.005, cable, scenery, 5).castShadow = false; bulbs.push(P((i + 0.5) / N).toArray().map((v, k) => k === 1 ? v - 0.05 : v)); }
    }
  }
  if (bulbs.length) inst(new THREE.SphereGeometry(0.03, 10, 8), scWarm, bulbs, scenery);
}

/* ---- hub portals (first cut if money is tight): the Downtown bridge arch and the Midtown park gate. They also carry
   the district names, so the old street posts at the hub are gone (one stood in the Midtown walk on layout v4). */
if (SCN['portal-downtown']) {
  // a Brooklyn-Bridge-tower silhouette: granite flat with twin pointed arches over one 2.0 x 2.1 m walk-through opening
  const s = SCN['portal-downtown'], [PW, PH] = s.size, [OW, OH] = s.opening, g = scFrame(s);
  const sh = new THREE.Shape(), ox = OW / 2, ar = 0.36, pier = 0.07;
  sh.moveTo(-PW / 2, 0); sh.lineTo(-ox, 0); sh.lineTo(-ox, OH);
  const arch = (x0, x1) => { const xm = (x0 + x1) / 2, sp = x1 - x0; sh.bezierCurveTo(x0, OH + ar * 0.65, xm - sp * 0.16, OH + ar * 0.92, xm, OH + ar); sh.bezierCurveTo(xm + sp * 0.16, OH + ar * 0.92, x1, OH + ar * 0.65, x1, OH); };
  arch(-ox, -pier); sh.lineTo(pier, OH); arch(pier, ox);
  sh.lineTo(ox, 0); sh.lineTo(PW / 2, 0); sh.lineTo(PW / 2, PH); sh.lineTo(-PW / 2, PH); sh.closePath();
  const PXX = 220, t = canvasTex(Math.round(PW * PXX), Math.round(PH * PXX), (x, w, hh) => {
    const X = m => (m + PW / 2) * PXX, Y = m => (PH - m) * PXX;
    x.fillStyle = '#B4A68C'; x.fillRect(0, 0, w, hh);
    x.fillStyle = 'rgba(70,58,44,.35)'; for (let yy = 0.15; yy < PH; yy += 0.15) x.fillRect(0, Y(yy), w, 3);
    for (let yy = 0, r = 0; yy < PH; yy += 0.15, r++) for (let xx = -PW / 2 + (r % 2) * 0.15; xx < PW / 2; xx += 0.3) x.fillRect(X(xx), Y(yy + 0.15), 3, 0.15 * PXX);
    x.fillStyle = '#8E8068'; x.fillRect(0, Y(PH), w, 0.07 * PXX); x.fillRect(0, Y(OH + 0.02), w, 0.04 * PXX);   // cornice and the springing course
    x.fillStyle = '#123D2A'; x.fillRect(X(-0.62), Y(2.62), X(0.62) - X(-0.62), 0.15 * PXX);                     // district name in the street-blade green
    x.strokeStyle = '#FFFFFF'; x.lineWidth = 3; x.strokeRect(X(-0.6), Y(2.605), X(0.6) - X(-0.6), 0.12 * PXX);
    x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle'; fitText(x, 'DOWNTOWN', 1.1 * PXX, 0.1 * PXX, 800, FD); x.fillText('DOWNTOWN', X(0), Y(2.545) + 2);
    x.fillStyle = '#D69410'; x.fillRect(X(-PW / 2), Y(0.08), PW * PXX, 0.04 * PXX);                             // the Downtown route colour along the foot
  });
  const fm = M('#FFFFFF', { map: t, roughness: 0.85 });
  scFlat(sh, PW, PH, fm, fm, MC('#8E8068', { roughness: 0.9 }), g, 0.04);
  for (const [px, pz] of s.posts) { const lx = (px - s.position[0]) * (s.faces && s.faces[1] < 0 ? -1 : 1); box(0.3, 0.06, 0.3, mats.darkSteel, g, lx, 0.03, 0); sandbag(g, lx, 0.06, 0.08); sandbag(g, lx, 0.06, -0.08); }
}
if (SCN['portal-midtown']) {
  // Central Park gate: two stone pillars with caps and ball finials, an iron arch with an invented "MIDTOWN" sign
  const s = SCN['portal-midtown'], [GW, GH] = s.size, [OW, OH] = s.opening, g = scFrame(s);
  const stone = MC('#A39D90', { roughness: 0.9 }), capM = MC('#C2BCAE', { roughness: 0.8 }), iron = MC('#1D2420', { roughness: 0.45, metalness: 0.4 });
  const pw = (GW - OW) / 2, px = OW / 2 + pw / 2, ph = 2.0;
  for (const sx of [-1, 1]) {
    box(pw, ph, pw, stone, g, sx * px, ph / 2, 0);
    for (let yy = 0.3; yy < ph; yy += 0.3) box(pw + 0.012, 0.012, pw + 0.012, MC('#8A8478', { roughness: 0.9 }), g, sx * px, yy, 0, false);
    box(pw + 0.06, 0.06, pw + 0.06, capM, g, sx * px, ph + 0.03, 0);
    mesh(new THREE.SphereGeometry(0.09, 18, 12), capM, g, sx * px, ph + 0.15, 0);
    box(pw + 0.02, 0.04, 0.02, MC('#2F80FF'), g, sx * px, 0.3, pw / 2 + 0.006, false);   // a stripe of hole 5's blue on the face toward the hub
  }
  // the arch: chord OW at 2.0 m rising to GH at the centre, a straight bar at the opening height, the sign between them
  const rise = GH - ph, R = (OW * OW / 4 + rise * rise) / (2 * rise), half = Math.asin(OW / 2 / R);
  const arc = mesh(new THREE.TorusGeometry(R, 0.018, 8, 40, 2 * half), iron, g, 0, GH - R, 0); arc.rotation.z = Math.PI / 2 - half;
  cylBetween(V(-OW / 2, OH, 0), V(OW / 2, OH, 0), 0.016, iron, g, 8);
  for (const sx of [-1, 1]) { const ring = mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 20), iron, g, sx * 0.62, OH + 0.12, 0); ring.castShadow = false; }
  const signT = canvasTex(512, 112, (x, w, hh) => { x.fillStyle = '#123D2A'; x.fillRect(0, 0, w, hh); x.strokeStyle = '#E8D9A8'; x.lineWidth = 5; x.strokeRect(7, 7, w - 14, hh - 14); x.fillStyle = '#F4EBD0'; x.textAlign = 'center'; x.textBaseline = 'middle'; fitText(x, 'MIDTOWN', w - 60, 70, 800, FD); x.fillText('MIDTOWN', w / 2, hh / 2 + 3); });
  const sm = M('#FFFFFF', { map: signT, roughness: 0.5 });
  box(0.86, 0.17, 0.02, [iron, iron, iron, iron, sm, sm], g, 0, OH + 0.12, 0);
}
