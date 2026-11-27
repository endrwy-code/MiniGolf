/* ------------------------------------------------------------------ play the holes (27 Nov): a ball, a putter and putting physics
   Every hole is playable on the geometry its builder drew. The ball is a 42.7 mm sphere that collides with the triangles of the
   hole's own meshes, so steps, ramps, banks, tubes, lids, pegs and props play as modelled: no hand-made collision shapes.
   Numbers follow doc 14 and doc 13: 0.6 m/s² rolling drag on carpet grass (doc 14: "speeds assume about 0.6 m/s² drag";
   the prototype's Stimp reading replaces it), a rolling ball feels 5/7 of a slope's pull, flush 108 mm cups with a 64 mm sleeve,
   rails that lose about a quarter of the speed on a hit (doc 14 hole 2), and the five-stroke cap (doc 07).
   This is a model of the design for the team to feel and argue with, not a test of a built hole: the 3 Dec rigs and the G2
   prototype decide. The scorecard is kept in this browser only. */
const G_R = 0.02135, G_CUP = 0.054, G_CUPIN = 0.0532, G_DRAG = 0.6, G_DT = 1 / 600, G_VMAX = 4.5, G_VMIN = 0.2, G_CAP = 5;
const G_YMAX = 0.95, G_CELL = 0.1, G_ORDER = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const G_HARD = 0.25;   // drag on hard faces (painted ply, the plinko board, the loop floor, the oven gutter) as a share of the carpet's: about 0.15 m/s²
const GOLF = {
  10: { aim: 'cup', e: 0.72, mu: 0.12,
    shot: 'Straight down the stoops with honest pace. The middle stoop sags toward the façade, so a slow ball bends that way: start it a hand\'s width up the slope. The drops add no speed, so don\'t trust them to carry you.',
    pace: 'Design pace: the first lip needs about 1.1 m/s; the ace about 2.4–2.5 m/s from the tee (review).' },
  9: { aim: 'cup', e: 0.72, mu: 0.12, oneShot: true,
    shot: 'One putt, curling style. It must climb the crust (about 1.2 m/s at its foot) and then die on the pizza. Where the ball\'s centre stops is the score: centre pepperoni 1, inner circle 2, pizza 3, anywhere else 4. Your group\'s other three balls are already lying where they stopped, and knock-ons count.',
    pace: 'Design pace: about 2.3 m/s for the centre; the 2-point window is only about ±4% of speed.' },
  8: { aim: 'cup', e: 0.72, mu: 0.12,
    shot: 'The friendly ace. Straight under the cart\'s arch between the bottles, up the kerb and into the open bun, whose faces funnel the ball along the mustard to the cup. Too soft rolls back off the kerb; too hard bounces off the rounded end.',
    pace: 'Design pace: about 1.2 m/s at the kerb; the ace about 2.2–2.4 m/s.' },
  7: { aim: 'cup', e: 0.72, mu: 0.12, rally: true,
    shot: 'Up the bridge to the cup on the hump. On the night two players putt at once from opposite ends on "3-2-1"; here a rival putts from the far end with your first shot, so the balls can clash. Too soft rolls back to you; too hard runs over to the other borough, and you play it from there.',
    pace: 'Design pace: about 1.8 m/s at the ramp foot to crest, about 2.2–2.35 m/s from the tee; over about 0.85 m/s at the crest it runs over.' },
  6: { aim: 'u', e: 0.72, mu: 0.12,
    shot: 'Along the blue harbour at the breaking wave in the corner. The banked corner carries the ball round 90° toward the island; with pace it climbs the shore and runs at the cup in the star by the statue. Keep to the outer half of the harbour so the wave takes it.',
    pace: 'Design pace: the shore needs about 1.2 m/s at its foot; the review\'s rig test putts at 1.5, 2 and 3 m/s.' },
  5: { aim: 'u', e: 0.62, mu: 0.17,
    shot: '"The rail is your friend." Play firmly into the first curved outer rail and let it carry the ball round; the second bend does the same, then under the arch to the cup by the fountain. Each bend scrubs off speed, so the sensible plan is two bends, then a putt.',
    pace: 'Design pace: the design assumed an ace at about 2.9–3.0 m/s; the review expects 25–30% lost per corner, which makes it doubtful.' },
  4: { aim: 'cup', e: 0.68, mu: 0.12,
    shot: 'Thread the jam. Two avenues about 0.30–0.35 m wide run through the eight cabs: bold players pick one and go straight; the two angled cabs at the end bank a ball toward the manhole cup. A wild shot gets lucky as often as a careful one, which is the point.',
    pace: 'Design pace: no single number; an avenue taken at about 2 m/s is the bold line.' },
  3: { aim: 'u', e: 0.7, mu: 0.12, loopU: 1.25,
    shot: 'Up the station steps. The funnel steers the ball into one of three portals: the outer one (away from the return green) is the Express, whose exit points at the cup. It vanishes, races round a hairpin under the clear lid and shoots out the other side heading back toward you. Walk round and putt out.',
    pace: 'Design pace: about 2.3 m/s at the ramp foot, about 2.5 m/s from the tee. Too soft rolls back down the steps.' },
  2: { aim: 'cup', e: 0.8, mu: 0.04,
    shot: '"Aim anywhere off the wall. Every bounce is the same distance." The booth blocks the straight line, but the ellipse sends any ball from this brass spot off the wall to the cup\'s spot under the clock. Pick a wall; the game is the weight.',
    pace: 'Design pace: about 1.9–2.4 m/s from the spot, arriving at the cup at 0.3–1.2 m/s (every wall path is 2.8 m).' },
  1: { aim: 'cup', e: 0.65, mu: 0.06, plinko: true, jitter: 1.0,
    shot: 'The finale. Putt up the red steps; too soft rolls back (a roll-back). Over the crest the ball rattles down the lit peg board under the cover into a slot: 3, 2, DROP, 2, 3. Score = roll-backs + the slot. Your line matters less than you think: the pegs decide.',
    pace: 'Design pace: about 2.06 m/s at the ramp foot, about 2.3 m/s from the tee.' },
};

/* ---- collision world: every triangle of a hole's meshes (world coordinates) in a 0.1 m grid over the floor plan */
const golfWorlds = {};
function golfWorld(n) {
  if (golfWorlds[n]) return golfWorlds[n];
  const g = holeGroups[n]; g.updateMatrixWorld(true);
  const out = [], dk = [], mi = new THREE.Matrix4(), mw = new THREE.Matrix4();
  const shown = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  g.traverse(o => {
    if (!o.isMesh || o.userData.golfSkip || !o.geometry || !o.geometry.attributes.position || !shown(o)) return;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    if (ms.every(m => !m || m.colorWrite === false || m.blending === THREE.AdditiveBlending)) return;   // the cup mask, floor halo
    // flush on a real course: printed circles and the cup's steel lip, and the 8 mm tee mats (a mat mid-lane would launch the ball)
    const gt = o.geometry.type, gp = o.geometry.parameters || {};
    if (gt === 'CircleGeometry' || gt === 'RingGeometry' || (gt === 'BoxGeometry' && gp.height <= 0.009 && gp.width >= 0.15 && gp.depth >= 0.15)) return;
    const pos = o.geometry.attributes.position, idx = o.geometry.index, cnt = idx ? idx.count : pos.count;
    const P = new Float64Array(pos.count * 3), reps = o.isInstancedMesh ? o.count : 1, grp = o.geometry.groups || [];
    // carpet grass (every turf and carpet material here is rough, 0.9 or more) or a hard face
    const dragOf = t => { let m = ms[0]; if (Array.isArray(o.material)) { const gr = grp.find(q => t >= q.start && t < q.start + q.count); m = o.material[gr ? gr.materialIndex : 0] || m; } return m && m.roughness != null && m.roughness < 0.88 ? G_HARD : 1; };
    for (let k = 0; k < reps; k++) {
      if (o.isInstancedMesh) { o.getMatrixAt(k, mi); mw.multiplyMatrices(o.matrixWorld, mi); } else mw.copy(o.matrixWorld);
      const e = mw.elements;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        P[3 * i] = e[0] * x + e[4] * y + e[8] * z + e[12]; P[3 * i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; P[3 * i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
      }
      for (let t = 0; t + 2 < cnt; t += 3) {
        const a = 3 * (idx ? idx.getX(t) : t), b = 3 * (idx ? idx.getX(t + 1) : t + 1), c = 3 * (idx ? idx.getX(t + 2) : t + 2);
        if (Math.min(P[a + 1], P[b + 1], P[c + 1]) > G_YMAX) continue;
        const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
        const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
        if (cx * cx + cy * cy + cz * cz < 1e-14) continue;
        out.push(P[a], P[a + 1], P[a + 2], P[b], P[b + 1], P[b + 2], P[c], P[c + 1], P[c + 2]); dk.push(dragOf(t));
      }
    }
  });
  const N = out.length / 9, T = new Float32Array(out), B = new Float32Array(N * 6), D = new Float32Array(dk);
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < N; i++) {
    const o = 9 * i;
    const bx0 = Math.min(T[o], T[o + 3], T[o + 6]), bx1 = Math.max(T[o], T[o + 3], T[o + 6]), by0 = Math.min(T[o + 1], T[o + 4], T[o + 7]), by1 = Math.max(T[o + 1], T[o + 4], T[o + 7]);
    const bz0 = Math.min(T[o + 2], T[o + 5], T[o + 8]), bz1 = Math.max(T[o + 2], T[o + 5], T[o + 8]);
    B.set([bx0, bx1, by0, by1, bz0, bz1], 6 * i);
    x0 = Math.min(x0, bx0); x1 = Math.max(x1, bx1); z0 = Math.min(z0, bz0); z1 = Math.max(z1, bz1);
  }
  const C = G_CELL, pad = G_R + 0.004;
  x0 -= pad + C; z0 -= pad + C;
  const nx = Math.ceil((x1 + pad + C - x0) / C) + 1, nz = Math.ceil((z1 + pad + C - z0) / C) + 1;
  const off = new Int32Array(nx * nz + 1);
  const cells = (i, f) => {
    const a0 = Math.max(0, Math.floor((B[6 * i] - pad - x0) / C)), a1 = Math.min(nx - 1, Math.floor((B[6 * i + 1] + pad - x0) / C));
    const b0 = Math.max(0, Math.floor((B[6 * i + 4] - pad - z0) / C)), b1 = Math.min(nz - 1, Math.floor((B[6 * i + 5] + pad - z0) / C));
    for (let kz = b0; kz <= b1; kz++) for (let kx = a0; kx <= a1; kx++) f(kz * nx + kx);
  };
  for (let i = 0; i < N; i++) cells(i, c => off[c + 1]++);
  for (let c = 0; c < nx * nz; c++) off[c + 1] += off[c];
  const fill = off.slice(0, nx * nz), items = new Int32Array(off[nx * nz]);
  for (let i = 0; i < N; i++) cells(i, c => { items[fill[c]++] = i; });
  const build = g.userData.build || {}, h = H[n];
  const W = { n, g, h, T, B, D, N, x0, z0, nx, nz, C, off, items, stamp: new Uint32Array(N), sid: 1, inv: g.matrixWorld.clone().invert(), build };
  const toW = (u, y, v) => g.localToWorld(new THREE.Vector3(u, y, v));
  if (!build.noCup && build.cup) { const c = toW(build.cup[0], build.cupY != null ? build.cupY : DECK, build.cup[1]); W.cup = { x: c.x, y: c.y, z: c.z }; }
  W.tees = [build.tee || [-h.L / 2 + 0.3, 0]];
  if (build.secondTee) W.tees.push(build.secondTee);
  W.teeY = build.teeY != null ? build.teeY : DECK;
  W.slotU = build.check && build.check.uBoardEnd != null ? build.check.uBoardEnd : null;
  golfWorlds[n] = W;
  return W;
}
/* closest point on triangle o (index into T) to p: Ericson, Real-Time Collision Detection 5.1.5 */
let QX = 0, QY = 0, QZ = 0;
function golfClosest(px, py, pz, T, o) {
  const ax = T[o], ay = T[o + 1], az = T[o + 2], bx = T[o + 3], by = T[o + 4], bz = T[o + 5], cx = T[o + 6], cy = T[o + 7], cz = T[o + 8];
  const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  if (d1 <= 0 && d2 <= 0) { QX = ax; QY = ay; QZ = az; return; }
  const bpx = px - bx, bpy = py - by, bpz = pz - bz;
  const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
  if (d3 >= 0 && d4 <= d3) { QX = bx; QY = by; QZ = bz; return; }
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); QX = ax + v * abx; QY = ay + v * aby; QZ = az + v * abz; return; }
  const cpx = px - cx, cpy = py - cy, cpz = pz - cz;
  const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
  if (d6 >= 0 && d5 <= d6) { QX = cx; QY = cy; QZ = cz; return; }
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); QX = ax + w * acx; QY = ay + w * acy; QZ = az + w * acz; return; }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); QX = bx + w * (cx - bx); QY = by + w * (cy - by); QZ = bz + w * (cz - bz); return; }
  const dn = 1 / (va + vb + vc), v = vb * dn, w = vc * dn;
  QX = ax + abx * v + acx * w; QY = ay + aby * v + acy * w; QZ = az + abz * v + acz * w;
}
/* the highest surface under (x, z), no higher than yTop; null if none */
function golfGround(W, x, z, yTop) {
  const i = Math.floor((x - W.x0) / W.C), k = Math.floor((z - W.z0) / W.C);
  if (i < 0 || k < 0 || i >= W.nx || k >= W.nz) return null;
  const c = k * W.nx + i, T = W.T; let best = null;
  for (let j = W.off[c]; j < W.off[c + 1]; j++) {
    const o = 9 * W.items[j];
    const ax = T[o], ay = T[o + 1], az = T[o + 2], bx = T[o + 3], by = T[o + 4], bz = T[o + 5], cx = T[o + 6], cy = T[o + 7], cz = T[o + 8];
    const den = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(den) < 1e-12) continue;
    const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / den, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / den, l3 = 1 - l1 - l2;
    if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
    const y = l1 * ay + l2 * by + l3 * cy;
    if (y <= yTop && (best === null || y > best)) best = y;
  }
  return best;
}
const golfLocal = (W, x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(W.inv);   // u = .x, v = .z (mirror already in v)

/* ---- one ball, one fixed step */
function golfCollide(W, p, b) {
  const r = G_R, r2 = r * r, C = W.C, T = W.T, Bb = W.B, cup = W.cup;
  let sx = 0, sy = 0, sz = 0, sup = 0, dg = 0;
  for (let pass = 0; pass < 2; pass++) {
    if (++W.sid > 4e9) { W.stamp.fill(0); W.sid = 1; }
    const sid = W.sid;
    const i0 = Math.max(0, Math.floor((b.x - r - W.x0) / C)), i1 = Math.min(W.nx - 1, Math.floor((b.x + r - W.x0) / C));
    const k0 = Math.max(0, Math.floor((b.z - r - W.z0) / C)), k1 = Math.min(W.nz - 1, Math.floor((b.z + r - W.z0) / C));
    let hit = false;
    for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) {
      const c = k * W.nx + i;
      for (let j = W.off[c]; j < W.off[c + 1]; j++) {
        const t = W.items[j]; if (W.stamp[t] === sid) continue; W.stamp[t] = sid;
        const o6 = 6 * t;
        if (b.x + r < Bb[o6] || b.x - r > Bb[o6 + 1] || b.y + r < Bb[o6 + 2] || b.y - r > Bb[o6 + 3] || b.z + r < Bb[o6 + 4] || b.z - r > Bb[o6 + 5]) continue;
        golfClosest(b.x, b.y, b.z, T, 9 * t);
        let dx = b.x - QX, dy = b.y - QY, dz = b.z - QZ; const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= r2) continue;
        // the deck top runs over the cup in the model: inside the opening there is no floor, only the sleeve and its bottom
        if (cup && QY > cup.y - 0.006 && (QX - cup.x) * (QX - cup.x) + (QZ - cup.z) * (QZ - cup.z) < G_CUPIN * G_CUPIN) continue;
        let d = Math.sqrt(d2);
        if (d < 1e-9) {   // centre on the face: push back the way the ball came
          const o = 9 * t, ux = T[o + 3] - T[o], uy = T[o + 4] - T[o + 1], uz = T[o + 5] - T[o + 2], vx = T[o + 6] - T[o], vy = T[o + 7] - T[o + 1], vz = T[o + 8] - T[o + 2];
          dx = uy * vz - uz * vy; dy = uz * vx - ux * vz; dz = ux * vy - uy * vx;
          const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
          if (dx * (b.px - QX) + dy * (b.py - QY) + dz * (b.pz - QZ) < 0) { dx = -dx; dy = -dy; dz = -dz; }
          d = 0;
        } else { dx /= d; dy /= d; dz /= d; }
        const pen = r - d; b.x += dx * pen; b.y += dy * pen; b.z += dz * pen;
        const vn = b.vx * dx + b.vy * dy + b.vz * dz;
        if (dy >= 0.3) {   // something to roll on: decks, ramps, banks, lips
          sup++; sx += dx; sy += dy; sz += dz; dg = Math.max(dg, W.D[t]);
          if (vn < 0) { const k2 = !b.sup && vn < -0.5 && dy > 0.8 ? 1.25 : 1; b.vx -= k2 * vn * dx; b.vy -= k2 * vn * dy; b.vz -= k2 * vn * dz; }   // a small hop only when landing from a drop
        } else if (vn < 0) {   // rails, walls, pegs, props: a cushion bounce, and the face scrubs the ball as it slides
          const dvn = -(1 + (vn < -0.18 ? p.e : 0)) * vn;
          b.vx += dvn * dx; b.vy += dvn * dy; b.vz += dvn * dz;
          const vn2 = b.vx * dx + b.vy * dy + b.vz * dz, tx = b.vx - vn2 * dx, ty = b.vy - vn2 * dy, tz = b.vz - vn2 * dz, tl = Math.hypot(tx, ty, tz);
          if (tl > 1e-6) { const f = Math.min(1, p.mu * dvn / tl); b.vx -= tx * f; b.vy -= ty * f; b.vz -= tz * f; }
          if (dvn > 0.3) b.hits++;
          if (p.jitter && dvn > 0.05) { const j = (Math.random() - 0.5) * p.jitter * dvn; b.vx += -dz * j; b.vz += dx * j; }   // pegs are never quite round or square to the ball
        }
        hit = true;
      }
    }
    if (!hit) break;
  }
  if (sup) { const l = Math.hypot(sx, sy, sz); b.nx = sx / l; b.ny = sy / l; b.nz = sz / l; b.sup = true; b.dk = dg; } else b.sup = false;
  return sup > 0;
}
function golfStep(ctx, dt) {
  const W = ctx.W, p = ctx.p;
  for (const b of ctx.balls) {
    if (b.rest || b.holed || b.gone) continue;
    b.px = b.x; b.py = b.y; b.pz = b.z;
    b.vy -= 9.81 * dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    if (golfCollide(W, p, b)) {
      /* rolling-ball physics: angular momentum about the contact point carries over. A ball meeting a ramp, a lip or a step
         keeps (5 v_t + 2 s) / 7 of its speed, where s is its spin's surface speed along the new direction: so it pivots over
         edges instead of stopping dead, feels 5/7 of a slope's pull, and after a rail bounce its spin drags it back toward
         the rail (a rolling ball's rebound comes off steeper than a mirror, as on a pool table). Then the carpet's drag. */
      const nx = b.nx, ny = b.ny, nz = b.nz;
      const vn = b.vx * nx + b.vy * ny + b.vz * nz;
      let tx = b.vx - vn * nx, ty = b.vy - vn * ny, tz = b.vz - vn * nz, tl = Math.hypot(tx, ty, tz);
      const wn = b.wx * nx + b.wy * ny + b.wz * nz;
      if (tl < 1e-7) { tx = b.wx - wn * nx; ty = b.wy - wn * ny; tz = b.wz - wn * nz; const l2 = Math.hypot(tx, ty, tz); if (l2 > 1e-7) { tx /= l2; ty /= l2; tz /= l2; } tl = 0; }
      else { tx /= tl; ty /= tl; tz /= tl; }
      const n0t = b.mx * tx + b.my * ty + b.mz * tz, n0n = b.mx * nx + b.my * ny + b.mz * nz;
      const s = n0n * (b.wx * tx + b.wy * ty + b.wz * tz) - n0t * wn;
      let vt = (5 * tl + 2 * s) / 7;
      const dec = G_DRAG * (b.dk || 1) * ny * dt;
      vt = vt > dec ? vt - dec : vt < -dec ? vt + dec : 0;
      const vn2 = Math.max(vn, 0);
      b.vx = tx * vt + nx * vn2; b.vy = ty * vt + ny * vn2; b.vz = tz * vt + nz * vn2;
      b.wx = tx * vt; b.wy = ty * vt; b.wz = tz * vt; b.mx = nx; b.my = ny; b.mz = nz;
    }
    b.t += dt;
    const s2 = b.vx * b.vx + b.vy * b.vy + b.vz * b.vz;
    if (b.sup && s2 < 1.2e-4) {
      b.still += dt;
      if (b.still > (b.nudge < 60 && b.ny < 0.995 ? 0.12 : 0.25)) {
        // balanced on a peg or a ridge on a slope that should roll it on: a real ball never is, so give it a 1 cm/s sideways nudge
        const sl = Math.sqrt(Math.max(0, 1 - b.ny * b.ny)), pull = 9.81 * 5 / 7 * sl;
        if (pull > 2.5 * G_DRAG * (b.dk || 1) && (b.nudge || 0) < 60) {
          b.nudge = (b.nudge || 0) + 1; const dh = Math.hypot(b.nx, b.nz) || 1; if (!b.nsg) b.nsg = Math.random() < 0.5 ? -1 : 1; if (b.nudge % 8 === 0) b.nsg = -b.nsg; const sg = b.nsg * (b.nudge > 24 ? 2 : 1);   // try one side, then the other, then harder
          b.vx += sg * 0.03 * -b.nz / dh; b.vz += sg * 0.03 * b.nx / dh; b.wx = b.vx; b.wz = b.vz; b.still = 0;
        } else { b.rest = true; b.vx = b.vy = b.vz = 0; b.wx = b.wy = b.wz = 0; }
      }
    } else b.still = 0;
    golfRules(ctx, b);
  }
  if (ctx.balls.length > 1) golfBallHits(ctx.balls);
}
function golfRules(ctx, b) {
  const W = ctx.W, cup = W.cup;
  if (cup && !b.holed) {
    const dx = b.x - cup.x, dz = b.z - cup.z, d = Math.hypot(dx, dz);
    if (d < G_CUP && b.y < cup.y - 0.012) {
      b.holed = true; b.rest = true; b.vx = b.vy = b.vz = 0; b.wx = b.wy = b.wz = 0;
      const m = Math.min(1, (G_CUP - G_R) / Math.max(d, 1e-6)); b.x = cup.x + dx * m; b.z = cup.z + dz * m; b.y = cup.y - 0.064 + G_R;
      return;
    }
  }
  const l = golfLocal(W, b.x, b.y, b.z);
  if (W.slotU != null && b.slot == null && l.x > W.slotU + 0.02 && b.y < BASE + 0.1) { const av = Math.abs(l.z); b.slot = av < 0.08 ? 1 : av < 0.24 ? 2 : 3; }
  if (b.y < 0.042 || Math.abs(l.x) > W.h.L / 2 + 0.7 || Math.abs(l.z) > W.h.W / 2 + 0.7) {
    b.oob = true; b.rest = true; b.vx = b.vy = b.vz = 0;
    b.offTee = l.x < W.tees[0][0] - 0.05 && Math.abs(l.z - W.tees[0][1]) < W.h.W / 2;   // rolled back off the open tee end: replay from the tee
  }
}
function golfBallHits(balls) {
  const d0 = 2 * G_R;
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
    const a = balls[i], c = balls[j];
    if (a.holed || c.holed || a.gone || c.gone || (a.rest && c.rest)) continue;
    let dx = c.x - a.x, dy = c.y - a.y, dz = c.z - a.z; const d = Math.hypot(dx, dy, dz);
    if (d >= d0 || d < 1e-9) continue;
    dx /= d; dy /= d; dz /= d;
    const pen = (d0 - d) / 2; a.x -= dx * pen; a.y -= dy * pen; a.z -= dz * pen; c.x += dx * pen; c.y += dy * pen; c.z += dz * pen;
    const rel = (c.vx - a.vx) * dx + (c.vy - a.vy) * dy + (c.vz - a.vz) * dz;
    if (rel < 0) {
      const jn = -(1 + 0.9) / 2 * rel;
      a.vx -= jn * dx; a.vy -= jn * dy; a.vz -= jn * dz; c.vx += jn * dx; c.vy += jn * dy; c.vz += jn * dz;
      for (const q of [a, c]) { q.rest = false; q.still = 0; }
    }
  }
}
function golfNewBall(W, u, v, colour) {
  const g = W.g.localToWorld(new THREE.Vector3(u, 0, v));
  const y = golfGround(W, g.x, g.z, W.teeY + 0.3);
  return { x: g.x, y: (y != null ? y : W.teeY + 0.008) + G_R + 0.0005, z: g.z, vx: 0, vy: 0, vz: 0, px: g.x, py: 0, pz: g.z, nx: 0, ny: 1, nz: 0,
    wx: 0, wy: 0, wz: 0, mx: 0, my: 1, mz: 0, sup: true, rest: true, still: 0, holed: false, oob: false, gone: false, slot: null, hits: 0, t: 0, colour };
}
const golfParams = n => Object.assign({ e: 0.72, mu: 0.12 }, GOLF[n] || {});
function golfAimTo(W, b, target) {   // world angle in the floor plan toward a point; or along the hole
  if (target === 'u') { const t = W.h.th * Math.PI / 180; return t; }
  const c = W.cup || (() => { const w = W.g.localToWorld(new THREE.Vector3(W.build.cup ? W.build.cup[0] : W.h.L / 2 - 0.4, 0, W.build.cup ? W.build.cup[1] : 0)); return { x: w.x, z: w.z }; })();
  return Math.atan2(c.z - b.z, c.x - b.x);
}
function golfLaunch(b, ang, v) {   // the ball leaves the putter already rolling, the same sense as doc 14's speeds
  ang += (Math.random() - 0.5) * 0.001;   // no putt is perfectly straight: ±0.03°, so a ball never balances on a peg's crown
  b.vx = Math.cos(ang) * v; b.vz = Math.sin(ang) * v; b.vy = 0; b.wx = b.vx; b.wy = 0; b.wz = b.vz; b.mx = 0; b.my = 1; b.mz = 0; b.rest = false; b.still = 0; b.t = 0; b.nudge = 0; b.nsg = 0;
}
/* hole 9: where the ball's centre stops scores (doc 14) */
function golfZone9(W, b) {
  if (b.holed) return 1;
  if (b.oob) return 4;
  const l = golfLocal(W, b.x, b.y, b.z), c = W.build.cup || [1.6, 0];
  if (b.y < BASE + 0.075 + G_R - 0.01) return 4;
  const d = Math.hypot(l.x - c[0], l.z - c[1]);
  return d <= 0.30 ? 2 : d <= 0.80 ? 3 : 4;
}
/* headless checks (the test hook exposes this as window.__golf): putt from a tee and report where the ball ends up */
const golfApi = {
  putt(n, o = {}) {
    const W = golfWorld(n), p = golfParams(n), tee = o.from || W.tees[o.tee || 0];
    const b = golfNewBall(W, tee[0], tee[1], '#fff'), ctx = { W, p, balls: [b] };
    const base = o.ang != null ? W.h.th * Math.PI / 180 + o.ang * Math.PI / 180 : golfAimTo(W, b, o.toward || p.aim);
    golfLaunch(b, base + (o.dAng || 0) * Math.PI / 180, o.v);
    let t = 0, k = 0; const tr = o.trace ? [] : null;
    while (t < (o.maxT || 40) && !b.rest && !b.holed) {
      const v0 = Math.hypot(b.vx, b.vy, b.vz); golfStep(ctx, G_DT); t += G_DT; k++;
      if (tr) { const v1 = Math.hypot(b.vx, b.vy, b.vz), l = golfLocal(W, b.x, b.y, b.z); if (k % (o.trace || 30) === 0 || v0 - v1 > 0.05) tr.push([+t.toFixed(3), +l.x.toFixed(3), +l.z.toFixed(3), +b.y.toFixed(4), +v1.toFixed(3), b.sup ? +b.ny.toFixed(3) : 0, +(v0 - v1).toFixed(3)]); }
    }
    const l = golfLocal(W, b.x, b.y, b.z), r = x => Math.round(x * 1000) / 1000;
    return { trace: tr, holed: b.holed, slot: b.slot, oob: b.oob, zone: n === 9 ? golfZone9(W, b) : undefined, u: r(l.x), v: r(l.z), y: r(b.y), t: r(t), hits: b.hits, tris: W.N };
  },
};

/* ---- the game */
const golf = { on: false, n: 0, from: 'orbit', phase: 'idle', ctx: null, me: null, aim: 0, pow: 1.6, strokes: 0, pens: 0, rolls: 0, done: false,
  first: true, camDist: 2.4, camPitch: 0.42, top: false, acc: 0, rollT: 0, finishAt: 0, wobble: false, scores: {}, keys: new Set(), drag: null,
  swT: 0, swMax: 0, howOpen: null, last: null, lastV: null, meshes: [], golferFor: null, prompt: null };
try {
  const s = JSON.parse(localStorage.getItem('countdownGolf3d.golf.v1') || '{}');
  if (s && typeof s === 'object') {
    if (s.scores && typeof s.scores === 'object') for (const k of G_ORDER) if (Number.isFinite(s.scores[k])) golf.scores[k] = s.scores[k];
    if (typeof s.wobble === 'boolean') golf.wobble = s.wobble;
    if (Number.isFinite(s.pow)) golf.pow = Math.min(G_VMAX, Math.max(G_VMIN, s.pow));
  }
} catch (e) { /* the scorecard is a convenience */ }
const golfSave = () => { try { localStorage.setItem('countdownGolf3d.golf.v1', JSON.stringify({ scores: golf.scores, wobble: golf.wobble, pow: golf.pow })); } catch (e) { /* ignore */ } };
const golfOn = () => golf.on;

/* ball meshes, aim dots, the golfer and the putter */
const G_BALL_GEO = new THREE.SphereGeometry(G_R, 20, 14);
const golfBallMat = c => M(c, { roughness: 0.32, emissive: c, emissiveIntensity: 0.18 });
const golfRoot = new THREE.Group(); golfRoot.visible = false; scene.add(golfRoot);
const golfDots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.0065, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.85, depthWrite: false }), 14);
golfDots.frustumCulled = false; golfDots.renderOrder = 3; golfRoot.add(golfDots);
const golfer = new THREE.Group(); golfRoot.add(golfer);
const putter = { shaft: null, grip: null, head: null };
function golfBuildGolfer() {
  golfer.clear();
  const f = figure(P.h, P.shoulders, '#F2C230', '#C9A88A'); golfer.add(f);
  const k = P.h / 1.66, hr = 0.066 * P.h, capM = MC('#C8273A', { roughness: 0.6 });
  mesh(new THREE.SphereGeometry(hr + 0.008, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), capM, golfer, 0, P.h - hr, 0);
  box(0.15 * k, 0.012, 0.11 * k, capM, golfer, 0, P.h - hr, -(hr + 0.045 * k));
  // arms forward and in, hands together in front of the hips: the putting grip
  const rt = P.shoulders / 2, arms = f.children.filter(o => o.isMesh && Math.abs(o.position.y - 0.62 * P.h) < 1e-6 && Math.abs(o.position.x) > 0.01);
  for (const a of arms) {
    const sx = Math.sign(a.position.x), pv = new THREE.Group(); pv.position.set(a.position.x, 0.8 * P.h, 0); f.add(pv);
    f.remove(a); a.position.set(0, 0.62 * P.h - 0.8 * P.h, 0); pv.add(a); pv.rotation.set(0.55, 0, -sx * 0.2);
  }
  const lh = 0.345 * P.h + 0.04 * k;
  golf.hand = new THREE.Vector3(0, 0.8 * P.h - lh * Math.cos(0.55) * Math.cos(0.2), -lh * Math.sin(0.55));
  golf.stance = -golf.hand.z + 0.11 * k;
  const steel = MC('#C9CED6', { roughness: 0.3, metalness: 0.8 });
  putter.shaft = mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 1, 8), steel, golfer);
  putter.grip = mesh(new THREE.CylinderGeometry(0.0125, 0.0105, 0.26, 10), MC('#1C1D22', { roughness: 0.8 }), golfer);
  putter.head = new THREE.Group(); golfer.add(putter.head);
  box(0.026, 0.024, 0.105, MC('#3A3F48', { roughness: 0.35, metalness: 0.7 }), putter.head, 0, 0, 0);
  box(0.006, 0.012, 0.09, MC('#F2C230', { roughness: 0.5 }), putter.head, -0.0135, 0.002, 0);   // a yellow face insert, toward the target
  golf.golferFor = P;
}
const G_UP = new THREE.Vector3(0, 1, 0), G_DN = new THREE.Vector3(0, -1, 0);
function golfPose(sw = 0, at = golf.me) {   // stand the golfer at the ball, facing across the line (right-handed), putter behind the ball
  const b = at; if (!b) return;
  if (golf.golferFor !== P) golfBuildGolfer();
  const a = golf.aim, yawG = Math.PI - a, fx = -Math.sin(a), fz = Math.cos(a);   // f: the way the golfer faces
  const gx = b.x - fx * golf.stance, gz = b.z - fz * golf.stance;
  let gy = golfGround(golf.ctx.W, gx, gz, b.y + 0.2); if (gy == null || gy < 0) gy = 0;
  golfer.position.set(gx, gy, gz); golfer.rotation.y = yawG;
  // in golfer space the target is -x; the ball sits at (0, by, -stance)
  const by = b.y - G_R - gy, hand = golf.hand.clone(); hand.x += sw * 0.28;
  const head = new THREE.Vector3(0.045 + sw, by + 0.013 + sw * sw * 0.9, -golf.stance);
  const dir = hand.clone().sub(head), len = dir.length(); dir.normalize();
  putter.shaft.scale.set(1, len, 1); putter.shaft.position.copy(head).addScaledVector(dir, len / 2); putter.shaft.quaternion.setFromUnitVectors(G_UP, dir);
  putter.grip.position.copy(hand).addScaledVector(dir, -0.12); putter.grip.quaternion.setFromUnitVectors(G_UP, dir);
  putter.head.position.copy(head); putter.head.rotation.set(0, 0, -sw * 0.6);
}
function golfSyncMeshes() {
  const bs = golf.ctx ? golf.ctx.balls : [];
  while (golf.meshes.length < bs.length) { const m = mesh(G_BALL_GEO, golfBallMat('#FFFFFF'), golfRoot); m.receiveShadow = false; golf.meshes.push(m); }
  golf.meshes.forEach((m, i) => {
    const b = bs[i]; m.visible = !!b && !b.gone;
    if (!b) return;
    if (m.userData.c !== b.colour) { m.material = golfBallMat(b.colour); m.userData.c = b.colour; }
    m.position.set(b.x, b.y, b.z);
  });
}
const golfDotM = new THREE.Matrix4();
function golfAimDots() {
  const b = golf.me, show = golf.phase === 'aim' && b && !golf.done;
  golfDots.visible = !!show; if (!show) return;
  const cx = Math.cos(golf.aim), cz = Math.sin(golf.aim);
  let k = 0;
  for (let i = 0; i < 14; i++) {
    const d = 0.07 + i * 0.05, x = b.x + cx * d, z = b.z + cz * d, y = golfGround(golf.ctx.W, x, z, b.y + 0.12);
    if (y == null) continue;
    golfDotM.makeTranslation(x, y + 0.003, z); golfDots.setMatrixAt(k++, golfDotM);
  }
  golfDots.count = k; golfDots.instanceMatrix.needsUpdate = true;
}

/* HUD: hole card (top left), putt controls (bottom), messages, result and scorecard; built in golfInit() */
let gEl = null;
function golfInit() {
  const st = document.createElement('style');
  st.textContent = `
.viewer.golf-on .lbl{display:none!important}
.g-card{position:absolute;left:calc(10px + var(--inset-l));top:calc(54px + var(--inset-t));z-index:5;width:min(330px,calc(100% - 20px));background:var(--label-bg);color:var(--label-ink);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:10px 12px 11px;display:grid;gap:6px;backdrop-filter:blur(4px);font-size:.84rem}
.g-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:9px;align-items:center}
.g-num{width:30px;height:30px;border-radius:6px;display:grid;place-items:center;background:var(--c);color:var(--t);font:900 1rem/1 var(--font-display)}
.g-name{font:800 1rem/1.15 var(--font-display);min-width:0}
.g-x{width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:transparent;color:inherit;font:600 .95rem/1 var(--font-body);cursor:pointer}
.g-meta{font:600 .74rem/1.3 var(--font-mono);letter-spacing:.02em;color:rgba(255,255,255,.78)}
.g-meta b{color:#fff}
.g-card details summary{cursor:pointer;font-weight:650;color:var(--now)}
.g-card details p{margin-top:5px;color:rgba(255,255,255,.86);line-height:1.4}
.g-card details p.g-pace{color:rgba(255,255,255,.66);font-size:.78rem}
.g-row{display:flex;flex-wrap:wrap;gap:5px}
.g-row button,.g-res button,.g-sc button{font:600 .76rem/1.1 var(--font-body);color:inherit;background:transparent;border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:6px 10px;cursor:pointer}
.g-row button[aria-pressed="true"]{background:var(--now);color:#1b1404;border-color:var(--now)}
.g-ctl{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(12px + var(--inset-b));z-index:5;display:grid;grid-template-columns:44px minmax(0,1fr) 44px auto;gap:6px;align-items:center;width:min(500px,calc(100% - 20px));background:var(--label-bg);border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:7px;backdrop-filter:blur(4px)}
.g-ctl > button{height:44px;border-radius:10px;border:1px solid rgba(255,255,255,.28);background:transparent;color:var(--label-ink);font:800 1rem/1 var(--font-display);cursor:pointer;touch-action:none}
.g-ctl .g-putt{background:var(--now);color:#1b1404;border-color:var(--now);padding:0 18px;font-size:1rem;letter-spacing:.04em}
.g-ctl .g-putt:disabled{opacity:.45;cursor:default}
.g-pow{position:relative;height:44px;border-radius:10px;background:rgba(255,255,255,.1);overflow:hidden;cursor:ew-resize;touch-action:none}
.g-pow i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#3BE36B,#F2C230 60%,#FF5A3D);opacity:.85}
.g-pow span{position:absolute;inset:0;display:grid;place-items:center;font:800 .92rem/1 var(--font-mono);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
.g-keys{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(72px + var(--inset-b));z-index:4;font:600 .7rem/1.2 var(--font-mono);color:rgba(255,255,255,.85);background:rgba(10,12,20,.55);padding:4px 9px;border-radius:999px;white-space:nowrap}
@media (pointer:coarse),(max-width:640px){.g-keys{display:none}}
@media (max-width:640px){.g-card{padding:8px 10px 9px;gap:5px;font-size:.8rem}.g-row button{padding:5px 9px}.g-num{width:26px;height:26px}.g-name{font-size:.92rem}}
.g-msg{position:absolute;left:50%;transform:translateX(-50%);top:calc(56px + var(--inset-t));z-index:6;max-width:min(440px,calc(100% - 24px));background:rgba(10,12,20,.86);color:#fff;font:650 .86rem/1.35 var(--font-body);padding:8px 13px;border-radius:10px;pointer-events:none;text-align:center}
@media (max-width:760px){.g-msg{top:auto;bottom:calc(76px + var(--inset-b))}}
.g-res,.g-sc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:7;width:min(420px,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto;background:var(--label-bg);color:var(--label-ink);border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:16px 16px 14px;display:grid;gap:9px;backdrop-filter:blur(6px);box-shadow:0 10px 40px rgba(0,0,0,.45)}
.g-res h3{font:900 1.6rem/1.1 var(--font-display);color:var(--now)}
.g-res p{font-size:.88rem;color:rgba(255,255,255,.86)}
.g-res .g-prim,.g-sc .g-prim{background:var(--now);color:#1b1404;border-color:var(--now);font-weight:750}
.g-sc h3{font:900 1.15rem/1.1 var(--font-display)}
.g-sc table{border-collapse:collapse;width:100%;font:600 .78rem/1.2 var(--font-mono);text-align:center}
.g-sc th,.g-sc td{padding:5px 2px;border-bottom:1px solid rgba(255,255,255,.14)}
.g-sc th{color:rgba(255,255,255,.6);font-weight:600}
.g-sc td.me{color:#fff;font-weight:800}
.g-sc .lo{color:#3BE36B}.g-sc .hi{color:#FF8A6B}
.g-prompt{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(14px + var(--inset-b));z-index:5;font:750 .9rem/1 var(--font-body);background:var(--now);color:#1b1404;border:0;border-radius:999px;padding:12px 18px;cursor:pointer;box-shadow:0 3px 14px rgba(0,0,0,.35)}
.play-hole{justify-self:start;font:700 .86rem/1.1 var(--font-body);background:var(--now);color:#1b1404;border:0;border-radius:8px;padding:9px 13px;cursor:pointer}
.g-hidden{display:none!important}
`;
  document.head.appendChild(st);
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  gEl = {
    card: el(`<section class="g-card g-hidden" aria-label="Playing this hole"><div class="g-head"><span class="g-num"></span><b class="g-name"></b><button type="button" class="g-x" aria-label="Stop playing" title="Stop playing (Esc)">✕</button></div>
      <div class="g-meta"></div>
      <details class="g-how"><summary>How to play it</summary><p class="g-play"></p><p class="g-shot"></p><p class="g-pace"></p></details>
      <div class="g-row"><button type="button" data-g="top" aria-pressed="false" title="Look straight down (V)">Top view</button><button type="button" data-g="card" title="Scorecard (C)">Card</button><button type="button" data-g="restart" title="Restart this hole (R)">Restart</button><button type="button" data-g="drop" title="Replace the ball where you last played it from, one penalty stroke">Drop +1</button></div></section>`),
    ctl: el(`<div class="g-ctl g-hidden" role="group" aria-label="Putt controls"><button type="button" data-g="left" aria-label="Aim left">◀</button>
      <div class="g-pow" role="slider" tabindex="0" aria-label="Putt speed" aria-valuemin="${G_VMIN}" aria-valuemax="${G_VMAX}"><i></i><span></span></div>
      <button type="button" data-g="right" aria-label="Aim right">▶</button><button type="button" class="g-putt" data-g="putt">PUTT</button></div>`),
    keys: el(`<div class="g-keys g-hidden">A D aim · W S speed (Shift fine) · Space putt · drag to aim · V top view · Esc stop</div>`),
    msg: el(`<div class="g-msg g-hidden" role="status" aria-live="polite"></div>`),
    res: el(`<section class="g-res g-hidden" aria-live="polite"><h3></h3><p class="g-det"></p><div class="g-row"></div></section>`),
    sc: el(`<section class="g-sc g-hidden" aria-label="Scorecard"><h3>Scorecard</h3><div class="g-tab"></div><p class="g-scnote" style="font-size:.78rem;color:rgba(255,255,255,.7)"></p><div class="g-row"><button type="button" class="g-prim" data-g="scclose">Close</button><button type="button" data-g="scclear">Clear the card</button></div></section>`),
    prompt: el(`<button type="button" class="g-prompt g-hidden"></button>`),
  };
  for (const k of ['card', 'ctl', 'keys', 'msg', 'res', 'sc', 'prompt']) viewer.appendChild(gEl[k]);
  // a Play button beside Walk in the viewer's corner
  const pb = el(`<button type="button" class="icon-btn" id="b-golf" aria-pressed="false" aria-label="Play golf" title="Play golf: putt the selected hole"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21V3l10 4-10 4"/><path d="M4 21h9"/><circle cx="17.5" cy="18.5" r="2"/></svg></button>`);
  document.querySelector('.corner').insertBefore(pb, document.getElementById('b-walk'));
  pb.addEventListener('click', () => golf.on ? golfStop() : golfStart(selected || 10));
  gEl.pb = pb;
  // settings drawer: a Play golf section after Walk around
  const sec = el(`<section class="dr-sec" aria-labelledby="dg-h"><h3 id="dg-h">Play golf</h3>
    <button type="button" class="dr-primary" id="d-golf">Play the selected hole</button>
    <div class="toggles"><button type="button" id="o-wobble" aria-pressed="false">Human wobble</button><button type="button" id="d-score">Scorecard</button></div>
    <p class="dr-fine">Putt every hole as doc 14 draws it: same slopes, steps, banks, tubes and pegs, with 0.6 m/s² drag on the carpet (doc 14's figure; the prototype's Stimp reading replaces it). Aim with A and D, the arrow buttons or by dragging; set the speed with W and S or the speed bar (it shows m/s, so you can try doc 14's numbers); Space or PUTT to hit. Human wobble adds up to ±4% pace and ±1.5° line, like a real putt. Five strokes, then pick up (doc 07). While walking, step up to a tee and press F.</p></section>`);
  const walkSec = document.querySelector('[aria-labelledby="dw-h"]'); walkSec.after(sec);
  document.getElementById('d-golf').addEventListener('click', () => { openDrawer(false); golfStart(selected || 10); });
  const wb = document.getElementById('o-wobble'); wb.setAttribute('aria-pressed', String(golf.wobble));
  wb.addEventListener('click', () => { golf.wobble = !golf.wobble; wb.setAttribute('aria-pressed', String(golf.wobble)); golfSave(); });
  document.getElementById('d-score').addEventListener('click', () => { openDrawer(false); golfScorecard(true); });
  // the hole card's Play button
  info.addEventListener('click', e => { const b = e.target.closest('[data-play]'); if (b) golfStart(+b.dataset.play); });
  // HUD buttons
  viewer.addEventListener('click', e => {
    const b = e.target.closest('[data-g]'); if (!b || !viewer.contains(b)) return;
    const k = b.dataset.g;
    if (k === 'putt') golfPutt();
    else if (k === 'top') { golf.top = !golf.top; b.setAttribute('aria-pressed', String(golf.top)); }
    else if (k === 'card') golfScorecard(true);
    else if (k === 'scclose') golfScorecard(false);
    else if (k === 'scclear') { golf.scores = {}; golfSave(); golfScorecard(true); golfHud(); }
    else if (k === 'restart') golfStart(golf.n);
    else if (k === 'drop') golfDrop();
    else if (k === 'next') golfStart(golfNext(golf.n));
    else if (k === 'again') golfStart(golf.n);
    else if (k === 'stop') golfStop();
  });
  gEl.card.querySelector('.g-x').addEventListener('click', golfStop);
  gEl.card.querySelector('.g-how').addEventListener('toggle', e => { if (golf.on) golf.howOpen = e.target.open; });
  gEl.prompt.addEventListener('click', () => { if (golf.prompt) golfStart(golf.prompt); });
  // aim buttons: hold to turn
  for (const [k, code] of [['left', 'GLeft'], ['right', 'GRight']]) {
    const b = gEl.ctl.querySelector(`[data-g="${k}"]`);
    b.addEventListener('pointerdown', e => { golf.keys.add(code); try { b.setPointerCapture(e.pointerId); } catch (err) { /* optional */ } e.preventDefault(); });
    const up = () => golf.keys.delete(code);
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  }
  // speed bar: drag or tap to set
  const pw = gEl.ctl.querySelector('.g-pow'); let pid = null;
  const setFrom = e => { const r = pw.getBoundingClientRect(); const k = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); golf.pow = Math.round((G_VMIN + k * (G_VMAX - G_VMIN)) * 100) / 100; golfHud(); };
  pw.addEventListener('pointerdown', e => { pid = e.pointerId; try { pw.setPointerCapture(pid); } catch (err) { /* optional */ } setFrom(e); e.preventDefault(); });
  pw.addEventListener('pointermove', e => { if (e.pointerId === pid) setFrom(e); });
  const pend = e => { if (e.pointerId === pid) { pid = null; golfSave(); } };
  pw.addEventListener('pointerup', pend); pw.addEventListener('pointercancel', pend);
  pw.addEventListener('wheel', e => { e.preventDefault(); golf.pow = Math.min(G_VMAX, Math.max(G_VMIN, Math.round((golf.pow - Math.sign(e.deltaY) * 0.05) * 100) / 100)); golfHud(); }, { passive: false });
  // drag on the view to aim (sideways) and tilt the camera (up and down); wheel to zoom
  const cv = renderer.domElement;
  cv.addEventListener('pointerdown', e => { if (golf.on) golf.drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
  window.addEventListener('pointermove', e => {
    const d = golf.drag; if (!golf.on || !d || e.pointerId !== d.id) return;
    const k = (e.pointerType === 'touch' ? 0.0045 : 0.0032) * settings.fov / 75;
    if (golf.phase === 'aim' && !golf.top) golf.aim += (e.clientX - d.x) * k * (golf.camDist > 3 ? 0.6 : 1);
    else if (golf.phase === 'aim' && golf.top) golf.aim += (e.clientX - d.x) * k;
    golf.camPitch = Math.min(1.35, Math.max(0.12, golf.camPitch + (e.clientY - d.y) * k));
    d.x = e.clientX; d.y = e.clientY;
  });
  const dend = e => { if (golf.drag && e.pointerId === golf.drag.id) golf.drag = null; };
  window.addEventListener('pointerup', dend); window.addEventListener('pointercancel', dend);
  cv.addEventListener('wheel', e => { if (!golf.on) return; e.preventDefault(); golf.camDist = Math.min(9, Math.max(0.6, golf.camDist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
  // keys: captured before the page's own handlers while playing
  const AIM_KEYS = { KeyA: 'GLeft', ArrowLeft: 'GLeft', KeyD: 'GRight', ArrowRight: 'GRight', KeyW: 'GUp', ArrowUp: 'GUp', KeyS: 'GDown', ArrowDown: 'GDown' };
  window.addEventListener('keydown', e => {
    if (!golf.on) {
      if (walking && e.code === 'KeyF' && golf.prompt && !e.repeat && !(e.target && e.target.closest && e.target.closest('.drawer'))) { e.preventDefault(); golfStart(golf.prompt); }
      return;
    }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target && e.target.closest && (e.target.closest('.drawer') || e.target.closest('input,textarea,select'))) return;
    const c = e.code;
    if (c === 'Escape') {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!gEl.sc.classList.contains('g-hidden')) golfScorecard(false); else golfStop();
      return;
    }
    if (AIM_KEYS[c]) { golf.keys.add(AIM_KEYS[c]); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (c === 'ShiftLeft' || c === 'ShiftRight') { golf.keys.add('GFine'); return; }
    if ((c === 'Space' || c === 'Enter') && !e.repeat) {
      if (e.target && e.target.closest && e.target.closest('button') && c === 'Enter') return;   // Enter on a focused button presses it
      e.preventDefault(); e.stopImmediatePropagation();
      if (golf.done) golfStart(golfNext(golf.n)); else golfPutt();
      return;
    }
    if (e.repeat) return;
    if (c === 'KeyV') { golf.top = !golf.top; gEl.card.querySelector('[data-g="top"]').setAttribute('aria-pressed', String(golf.top)); }
    else if (c === 'KeyR') golfStart(golf.n);
    else if (c === 'KeyC') golfScorecard(gEl.sc.classList.contains('g-hidden'));
    else if (c === 'KeyN' && golf.done) golfStart(golfNext(golf.n));
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);
  window.addEventListener('keyup', e => {
    const k = AIM_KEYS[e.code]; if (k) golf.keys.delete(k);
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') golf.keys.delete('GFine');
    if ((e.code === 'KeyW' || e.code === 'KeyS' || e.code.startsWith('Arrow')) && golf.on) golfSave();
  });
  window.addEventListener('blur', () => golf.keys.clear());
}
const golfNext = n => n > 1 ? n - 1 : 10;
function golfSay(text, ms = 3200) {
  if (!gEl) return;
  gEl.msg.textContent = text; gEl.msg.classList.toggle('g-hidden', !text);
  clearTimeout(golfSay.t); if (text && ms) golfSay.t = setTimeout(() => gEl.msg.classList.add('g-hidden'), ms);
}
function golfTotals() {
  let s = 0, p = 0, k = 0;
  for (const n of G_ORDER) if (golf.scores[n] != null) { s += golf.scores[n]; p += H[n].par; k++; }
  return { s, p, k };
}
const golfRel = d => d === 0 ? 'E' : (d > 0 ? '+' : '−') + Math.abs(d);
function golfHud() {
  if (!gEl || !golf.on) return;
  const h = H[golf.n], t = golfTotals(), c = gEl.card;
  c.style.setProperty('--c', h.glow); c.style.setProperty('--t', inkOn(h.glow));
  c.querySelector('.g-num').textContent = h.n;
  c.querySelector('.g-name').textContent = h.name;
  const shot = golf.n === 9 ? 'one shot' : `stroke ${Math.min(golf.strokes + golf.pens + (golf.done ? 0 : 1), 9)}`;
  const extra = golf.n === 1 ? ` · roll-backs <b>${golf.rolls}</b>` : golf.pens ? ` · penalties <b>${golf.pens}</b>` : '';
  c.querySelector('.g-meta').innerHTML = `Par <b>${h.par}</b> · <b>${shot}</b>${extra} · card <b>${t.k ? golfRel(t.s - t.p) : '–'}</b>${golf.lastV ? ` · last <b>${golf.lastV.toFixed(2)} m/s</b>` : ''}`;
  const pw = gEl.ctl.querySelector('.g-pow');
  pw.querySelector('i').style.width = ((golf.pow - G_VMIN) / (G_VMAX - G_VMIN) * 100).toFixed(1) + '%';
  pw.querySelector('span').textContent = golf.pow.toFixed(2) + ' m/s';
  pw.setAttribute('aria-valuenow', golf.pow.toFixed(2)); pw.setAttribute('aria-valuetext', golf.pow.toFixed(2) + ' metres per second');
  gEl.ctl.querySelector('.g-putt').disabled = golf.phase !== 'aim' || golf.done;
}
function golfScorecard(show) {
  if (!gEl) return;
  gEl.sc.classList.toggle('g-hidden', !show); if (!show) return;
  const t = golfTotals();
  const cell = n => { const s = golf.scores[n]; if (s == null) return '<td class="me">·</td>'; const d = s - H[n].par; return `<td class="me ${d < 0 ? 'lo' : d > 0 ? 'hi' : ''}">${s}</td>`; };
  const half = ns => `<table><tr><th>Hole</th>${ns.map(n => `<th>${n}</th>`).join('')}</tr><tr><th>Par</th>${ns.map(n => `<td>${H[n].par}</td>`).join('')}</tr><tr><th>You</th>${ns.map(cell).join('')}</tr></table>`;
  gEl.sc.querySelector('.g-tab').innerHTML = `<p style="font-size:.78rem;color:rgba(255,255,255,.7)">Downtown</p>${half([10, 9, 8, 7, 6])}<p style="font-size:.78rem;color:rgba(255,255,255,.7);margin-top:6px">Midtown</p>${half([5, 4, 3, 2, 1])}`;
  gEl.sc.querySelector('.g-scnote').textContent = t.k ? `${t.k} of 10 holes played: ${t.s} strokes against par ${t.p} (${golfRel(t.s - t.p)}). The course is par 25.` : 'No holes played yet. The course is par 25.';
}
function golfShowHud(on) {
  for (const k of ['card', 'ctl', 'keys']) gEl[k].classList.toggle('g-hidden', !on);
  if (!on) { gEl.res.classList.add('g-hidden'); gEl.sc.classList.add('g-hidden'); golfSay(''); }
  gEl.pb.setAttribute('aria-pressed', String(on)); gEl.pb.setAttribute('aria-label', on ? 'Stop playing' : 'Play golf'); gEl.pb.title = on ? 'Stop playing' : 'Play golf: putt the selected hole';
}
/* the hole card in the side panel: a Play button and the intended shot */
function golfCardBits(n) {
  const G = GOLF[n] || {};
  return { button: `<button type="button" class="play-hole" data-play="${n}">Play this hole</button>`, shot: G.shot ? `${G.shot} ${G.pace || ''}` : '' };
}

function golfStart(n, opt = {}) {
  if (!holeGroups[n] || !gEl) return;
  if (!golf.on) {
    golf.from = walking ? 'walk' : 'orbit';
    if (walking) {   // put walking away without flying the camera anywhere
      walking = false; keys.clear(); joyV.x = joyV.y = 0; knob.style.transform = ''; avatar.visible = false; viewer.classList.remove('walking');
      curV = 0; runLatch = false; runBtn.setAttribute('aria-pressed', 'false'); if (fovKick) { fovKick = 0; applyFov(); }
      syncWalkButtons(); applyOpts(); applyLayers();
    }
  }
  golf.on = true; golf.n = n; openDrawer(false); tween = null; controls.enabled = false;
  camera.near = 0.03; camera.updateProjectionMatrix();
  viewer.classList.add('golf-on'); golfRoot.visible = true;
  select(n, false);
  const W = golfWorld(n), p = golfParams(n);
  golf.ctx = { W, p, balls: [] };
  golf.strokes = 0; golf.pens = 0; golf.rolls = 0; golf.done = false; golf.first = true; golf.top = false; golf.acc = 0; golf.finishAt = 0; golf.lastV = null;
  gEl.card.querySelector('[data-g="top"]').setAttribute('aria-pressed', 'false');
  if (n === 9) {   // the group's other three balls putted first, curling style: they stay where they stopped
    const cols = ['#FF4FA3', '#3DA5FF', '#FFB020'];
    for (const c of cols) {
      const b = golfNewBall(W, W.tees[0][0], W.tees[0][1], c); golf.ctx.balls.push(b);
      golfLaunch(b, golfAimTo(W, b, 'cup') + (Math.random() - 0.5) * 0.08, 2.0 + Math.random() * 0.6);
      for (let t = 0; t < 30 && golf.ctx.balls.some(q => !q.rest && !q.holed && !q.gone); t += G_DT) golfStep(golf.ctx, G_DT);
      if (b.oob) b.gone = true;
    }
  }
  const me = golfNewBall(W, W.tees[0][0], W.tees[0][1], '#FFFFFF');
  golf.ctx.balls.push(me); golf.me = me; golf.last = { x: me.x, y: me.y, z: me.z };
  golf.aim = golfAimTo(W, me, p.aim);
  golf.phase = 'aim'; golf.swT = 0;
  golf.camDist = Math.max(1.8, Math.min(3.2, golf.camDist)); golf.camPitch = 0.42;
  golfPose(0); golfSyncMeshes(); golfShowHud(true);
  gEl.res.classList.add('g-hidden'); gEl.sc.classList.add('g-hidden'); gEl.prompt.classList.add('g-hidden');
  const c = gEl.card, G = GOLF[n] || {}, h = H[n];
  c.querySelector('.g-play').textContent = h.play || '';
  c.querySelector('.g-shot').textContent = G.shot || '';
  c.querySelector('.g-pace').textContent = G.pace || '';
  if (golf.howOpen == null) golf.howOpen = window.innerWidth >= 1000;   // open on wide screens until you close it
  c.querySelector('.g-how').open = golf.howOpen;
  golfHud();
  golfSay(n === 9 ? 'One shot, curling style: your group\'s three balls are already down.' : n === 7 ? 'Rally: a rival putts from the far end with your first shot.' : `Hole ${n}: ${h.name}. Par ${h.par}.`, 3600);
  if (opt.snap !== false) golfCam(1, true);
  const vr = viewer.getBoundingClientRect();   // started from the side panel: bring the 3D view into sight
  if (vr.top < 0 || vr.bottom > window.innerHeight + 2) viewer.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  try { viewer.focus({ preventScroll: true }); } catch (e) { /* convenience */ }
}
function golfStop() {
  if (!golf.on) return;
  golf.on = false; golf.phase = 'idle'; golf.keys.clear(); golf.drag = null;
  golfRoot.visible = false; viewer.classList.remove('golf-on'); golfShowHud(false);
  camera.near = 0.5; camera.updateProjectionMatrix();
  const b = golf.me || { x: camera.position.x, y: 0, z: camera.position.z };
  if (golf.from === 'walk') {
    const fx = Math.cos(golf.aim), fz = Math.sin(golf.aim), yw = Math.atan2(-fx, -fz);
    let spot = null;
    for (const r of [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.5]) { for (let k = 0; k < 12 && !spot; k++) { const a = k * Math.PI / 6, x = golfer.position.x + Math.cos(a) * r, z = golfer.position.z + Math.sin(a) * r; if (!blocked(x, z)) spot = { x, z }; } if (spot) break; }
    enterWalk(spot ? { x: spot.x, z: spot.z, yaw: yw } : null);
  } else {
    controls.enabled = true; controls.target.set(b.x, b.y, b.z); controls.update();
  }
}
function golfPutt() {
  if (!golf.on || golf.phase !== 'aim' || golf.done) return;
  golf.phase = 'swing'; golf.swT = 0; golf.swMax = 0.04 + 0.2 * golf.pow / G_VMAX;
  gEl.res.classList.add('g-hidden'); golfHud();
}
function golfStrike() {
  const W = golf.ctx.W, me = golf.me;
  let v = golf.pow, a = golf.aim;
  if (golf.wobble) { const g2 = () => (Math.random() + Math.random() - 1); v *= 1 + 0.04 * g2(); a += 1.5 * Math.PI / 180 * g2(); }
  golf.last = { x: me.x, y: me.y, z: me.z }; golf.addr = { x: me.x, y: me.y, z: me.z };
  golfLaunch(me, a, v); golf.lastV = v; golf.strokes++;
  if (golf.ctx.p.rally && golf.first && W.tees[1]) {   // the rival putts from the far end on "3-2-1"
    const r = golfNewBall(W, W.tees[1][0], W.tees[1][1], '#FF4FA3'); r.rival = true; golf.ctx.balls.push(r);
    golfLaunch(r, golfAimTo(W, r, 'cup') + (Math.random() - 0.5) * 0.05, 2.1 + Math.random() * 0.35);
  }
  golf.first = false; golf.phase = 'roll'; golf.rollT = 0; golf.acc = 0; golfHud();
}
function golfDrop() {   // replace the ball where it was last played from, one penalty stroke
  if (!golf.on || golf.done || golf.phase !== 'aim' || !golf.last) return;
  const me = golf.me; Object.assign(me, { x: golf.last.x, y: golf.last.y, z: golf.last.z, vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0, rest: true, oob: false });
  golf.pens++; golfSay('Ball dropped where you last played it from: one penalty stroke.'); golfHud(); golfAfterCheckCap();
}
function golfAfterCheckCap() {
  if (golf.n !== 9 && golf.strokes + golf.pens >= G_CAP && !golf.done) { golfFinish(6, 'Picked up', `Five strokes, then pick up (doc 07): it goes on the card as a 6.`); return true; }
  return false;
}
function golfAfterRoll() {
  const ctx = golf.ctx, W = ctx.W, me = golf.me, n = golf.n;
  const rival = ctx.balls.find(b => b.rival);
  let note = '';
  if (rival) { note = rival.holed ? ' Your rival holed theirs.' : ''; ctx.balls.splice(ctx.balls.indexOf(rival), 1); }
  if (n === 9) {
    const z = golfZone9(W, me), names = { 1: 'Centre pepperoni!', 2: 'Inner circle', 3: 'On the pizza', 4: me.oob ? 'Off the pizza' : (me.y < BASE + 0.075 + G_R - 0.01 && golfLocal(W, me.x, me.y, me.z).x > 2.0 ? 'In the oven' : 'Rolled back off the crust') };
    golfFinish(z, names[z], `One shot, curling style: ${z} point${z > 1 ? 's' : ''} on the card (par 3). Launched at ${golf.lastV.toFixed(2)} m/s.`);
    return;
  }
  if (me.oob && me.offTee) {
    const t0 = golfNewBall(W, W.tees[0][0], W.tees[0][1], me.colour);
    Object.assign(me, { x: t0.x, y: t0.y, z: t0.z, vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0, rest: true, oob: false, offTee: false });
    if (n === 1) golf.rolls++;
    golfSay('Rolled all the way back off the tee end: play it again from the tee (the stroke counts, no penalty).' + note, 4000);
  } else if (me.oob) {
    golf.pens++; Object.assign(me, { x: golf.last.x, y: golf.last.y, z: golf.last.z, vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0, rest: true, oob: false });
    golfSay('Out of bounds: one penalty stroke, replaced where you played it from.' + note);
  } else if (n === 1 && me.slot) {
    const lab = me.slot === 1 ? 'DROP!' : `Slot ${me.slot}`;
    golfFinish(Math.min(9, golf.rolls + me.slot + golf.pens), lab, `Score = roll-backs (${golf.rolls}) + the slot (${me.slot})${golf.pens ? ` + penalties (${golf.pens})` : ''}. Launched at ${golf.lastV.toFixed(2)} m/s.`);
    return;
  } else if (me.holed) {
    const s = golf.strokes + golf.pens, d = s - H[n].par;
    const word = s === 1 ? 'Hole in one!' : d <= -2 ? 'Eagle!' : d === -1 ? 'Birdie!' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : d === 2 ? 'Double bogey' : `${s} strokes`;
    golfFinish(s, word, `In the cup in ${s} (par ${H[n].par}). Last putt ${golf.lastV.toFixed(2)} m/s.${note}`);
    return;
  } else if (n === 1 && W.slotU != null && golfLocal(W, me.x, me.y, me.z).x > W.slotU - 0.8 && golfLocal(W, me.x, me.y, me.z).x <= W.slotU + 0.02) {
    // jammed on the board: in the model this happens between a last-row peg and a divider nose (24 mm gap); a marshal tips it down
    const av = Math.abs(golfLocal(W, me.x, me.y, me.z).z); me.slot = av < 0.08 ? 1 : av < 0.24 ? 2 : 3;
    golfFinish(Math.min(9, golf.rolls + me.slot + golf.pens), `Jammed: slot ${me.slot}`, `The ball lodged on the board (between a last-row peg and a divider nose in this model, a 24 mm pocket), so a marshal tipped it into slot ${me.slot}. Doc 14 lists peg jams as a risk for the 200-drop rig.`);
    return;
  } else if (n === 1) {
    const lu = golfLocal(W, me.x, me.y, me.z).x;
    golf.rolls++;
    golfSay(lu > -0.3 ? 'Stopped on the crest: +1. A 3° tilt can\'t restart a ball on carpet (it needs about 5°, or a hard face). Tap it on.' : 'Roll-back: +1. Play it again from where it stopped.' + note, 4200);
  } else {
    const l = golfLocal(W, me.x, me.y, me.z);
    if (n === 3 && l.x > (ctx.p.loopU || 99) && l.x < W.h.L / 2) golfSay('Stalled in the loop: doc 14\'s main physics risk on this hole. Putt it on, or restart.' + note, 4500);
    else if (note) golfSay(note.trim());
  }
  if (golfAfterCheckCap()) return;
  golf.phase = 'aim'; golf.aim = golfAimTo(W, me, 'cup'); golfHud();
}
function golfFinish(score, title, detail) {
  golf.done = true; golf.phase = 'over'; golf.scores[golf.n] = score; golfSave(); golfHud();
  const n = golf.n, nx = golfNext(n), t = golfTotals(), all = t.k === 10;
  gEl.res.querySelector('h3').textContent = title;
  gEl.res.querySelector('.g-det').textContent = `${detail} ${all ? `Round complete: ${t.s} against par ${t.p} (${golfRel(t.s - t.p)}).` : `Card: ${t.k} hole${t.k > 1 ? 's' : ''}, ${golfRel(t.s - t.p)}.`}`;
  gEl.res.querySelector('.g-row').innerHTML = (n > 1 ? `<button type="button" class="g-prim" data-g="next">Next: ${nx} ${esc(H[nx].name)} →</button>` : `<button type="button" class="g-prim" data-g="card">Scorecard</button><button type="button" data-g="next">Start again at 10 →</button>`)
    + `<button type="button" data-g="again">Play it again</button>${n > 1 ? '<button type="button" data-g="card">Scorecard</button>' : ''}<button type="button" data-g="stop">Stop playing</button>`;
  setTimeout(() => { if (golf.on && golf.done) gEl.res.classList.remove('g-hidden'); }, 450);
}

/* camera: behind the ball looking down the line while you aim; trailing the ball while it rolls; or straight down (V) */
const gCamPos = new THREE.Vector3(), gCamTgt = new THREE.Vector3(), gLook = new THREE.Vector3(), gTmp = new THREE.Vector3();
function golfCam(dt, snap = false) {
  const b = golf.me, h = H[golf.n]; if (!b) return;
  if (golf.top) {
    const g = holeGroups[golf.n], ext = Math.max(h.L, h.W), a = h.th * Math.PI / 180;
    const ht = ext * 0.95 / Math.tan(camera.fov * Math.PI / 360) * 0.62 + 0.8;
    gCamTgt.set(g.position.x, BASE, g.position.z);
    gCamPos.set(g.position.x - Math.cos(a) * 0.25, ht, g.position.z - Math.sin(a) * 0.25);
  } else if (golf.phase === 'roll' || golf.phase === 'over') {
    gTmp.set(camera.position.x - b.x, 0, camera.position.z - b.z); const l = gTmp.length() || 1; gTmp.multiplyScalar(1 / l);
    const dd = Math.max(1.3, Math.min(golf.camDist * 1.1, 3.2));
    gCamPos.set(b.x + gTmp.x * dd, b.y + 0.35 + dd * Math.sin(golf.camPitch) * 0.9, b.z + gTmp.z * dd);
    gCamTgt.set(b.x, b.y, b.z);
  } else {
    const cx = Math.cos(golf.aim), cz = Math.sin(golf.aim), D = golf.camDist, pc = Math.cos(golf.camPitch), ps = Math.sin(golf.camPitch);
    gCamPos.set(b.x - cx * D * pc, b.y + 0.12 + D * ps, b.z - cz * D * pc);
    const ahead = 0.35 + D * 0.3;
    gCamTgt.set(b.x + cx * ahead, b.y, b.z + cz * ahead);
  }
  const k = snap ? 1 : 1 - Math.exp(-dt * (golf.phase === 'roll' ? 4 : 7));
  camera.position.lerp(gCamPos, k); gLook.lerp(gCamTgt, k); if (snap) gLook.copy(gCamTgt);
  camera.lookAt(gLook); controls.target.copy(gLook);
}
function golfFrame(dt) {
  if (!golf.on) return;
  const ctx = golf.ctx;
  if (golf.phase === 'aim') {
    const fine = golf.keys.has('GFine');
    if (golf.keys.has('GLeft')) golf.aim -= (fine ? 0.07 : 0.7) * dt;
    if (golf.keys.has('GRight')) golf.aim += (fine ? 0.07 : 0.7) * dt;
    const pv = (golf.keys.has('GUp') ? 1 : 0) - (golf.keys.has('GDown') ? 1 : 0);
    if (pv) { golf.pow = Math.min(G_VMAX, Math.max(G_VMIN, golf.pow + pv * (fine ? 0.1 : 0.9) * dt)); golfHud(); }
    golfPose(0);
  } else if (golf.phase === 'swing') {
    const T1 = reduceMotion ? 0.05 : 0.42, T2 = reduceMotion ? 0.03 : 0.13, T3 = 0.22;
    const t0 = golf.swT; golf.swT += dt; const t = golf.swT;
    let sw;
    if (t < T1) sw = golf.swMax * Math.sin(t / T1 * Math.PI / 2);
    else if (t < T1 + T2) sw = golf.swMax * (1 - Math.pow((t - T1) / T2, 2));
    else sw = -golf.swMax * 0.6 * Math.min(1, (t - T1 - T2) / T3);
    golfPose(sw);
    if (t0 < T1 + T2 && t >= T1 + T2) golfStrike();
  }
  if (golf.phase === 'roll' || (golf.phase === 'over' && ctx.balls.some(b => !b.rest && !b.holed && !b.gone))) {
    if (golf.phase === 'roll' && golf.swT < 1.2) { golf.swT += dt; golfPose(-golf.swMax * 0.6, golf.addr); }
    golf.acc += dt; let k = 0;
    while (golf.acc >= G_DT && k < 200) { golfStep(ctx, G_DT); golf.acc -= G_DT; k++; }
    golf.rollT += dt;
    if (golf.phase === 'roll') {
      const me = golf.me, settled = !ctx.balls.some(b => !b.rest && !b.holed && !b.gone);
      const meDone = me.holed || (golf.n === 1 && me.slot && (me.rest || golf.rollT > 6));
      if (settled || meDone || golf.rollT > 40) {
        if (golf.rollT > 40) for (const b of ctx.balls) { b.rest = true; b.vx = b.vy = b.vz = 0; }
        golfAfterRoll(); if (!golf.done) golfPose(0);
      }
    }
  }
  golfSyncMeshes(); golfAimDots(); golfCam(dt);
}
/* walking: offer to play when you stand at a tee */
function golfIdle() {
  if (!gEl) return;
  let best = null, bd = 1.7;
  if (walking) for (const h of HOLES) {
    const bt = (holeGroups[h.n] && holeGroups[h.n].userData.build) || {}, tees = [bt.tee || [-h.L / 2 + 0.3, 0]];
    if (bt.secondTee) tees.push(bt.secondTee);
    for (const t of tees) {
      const [x, z] = l2w(h, t[0], t[1]), d = Math.hypot(x - me.x, z - me.y);
      if (h.n === selected && d < 2.4) { best = h.n; bd = -1; }   // the hole you jumped to wins over a neighbour's tee
      else if (d < bd) { bd = d; best = h.n; }
    }
  }
  if (best !== golf.prompt) {
    golf.prompt = best;
    gEl.prompt.classList.toggle('g-hidden', !best);
    if (best) gEl.prompt.textContent = `⛳ Play hole ${best}: ${H[best].name}${coarse ? '' : ' (F)'}`;
  }
}
