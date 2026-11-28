/* ------------------------------------------------------------------ play the holes (27 Nov): a ball, a putter and putting physics
   Every hole is playable on the geometry its builder drew. The ball is a 42.7 mm sphere that collides with the triangles of the
   hole's own meshes, so steps, ramps, banks, tubes, lids, pegs and props play as modelled: no hand-made collision shapes.
   Numbers follow doc 14 and doc 13: 0.6 m/s² rolling drag on carpet grass (doc 14: "speeds assume about 0.6 m/s² drag";
   the prototype's Stimp reading replaces it), a rolling ball feels 5/7 of a slope's pull, flush 108 mm cups with a 64 mm sleeve,
   rails that lose about a quarter of the speed on a hit (doc 14 hole 2), and the five-stroke cap (doc 07).
   This is a model of the design for the team to feel and argue with, not a test of a built hole: the 3 Dec rigs and the G2
   prototype decide. The scorecard is kept in this browser only.
   28 Nov: play moved into walking (the team's feedback: the golf camera got stuck in walls, you floated over raised balls and
   the swing locked you in place). You now walk with a putter and ball, look with the mouse and a crosshair, place the ball
   on any tee and putt from wherever you stand; you walk on the decks at their real height. The physics above is unchanged. */
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


/* ------------------------------------------------------------------ walking on the holes (28 Nov)
   Each hole's own meshes become a height field (4 cm cells): the highest surface in each column below head height. You
   walk on decks, ramps and steps at their real height (a step up of at most 0.24 m: a rail cap or a deck edge), and
   anything taller (a prop, a totem, a tower, a lid's frame) stops you. Built per hole the first time you come near it. */
const WALK_CELL = 0.04, WALK_HEAD = 2.05, STEP_UP = 0.24;
const walkFields = {}, walkBoxes = {};
function walkBox(n) {
  if (walkBoxes[n]) return walkBoxes[n];
  const bb = new THREE.Box3().setFromObject(holeGroups[n]);
  return (walkBoxes[n] = [bb.min.x - 0.05, bb.max.x + 0.05, bb.min.z - 0.05, bb.max.z + 0.05]);
}
function walkField(n) {
  if (walkFields[n]) return walkFields[n];
  const g = holeGroups[n]; g.updateMatrixWorld(true);
  const [bx0, bx1, bz0, bz1] = walkBox(n), C = WALK_CELL;
  const x0 = bx0, z0 = bz0, nx = Math.ceil((bx1 - bx0) / C) + 1, nz = Math.ceil((bz1 - bz0) / C) + 1, top = new Float32Array(nx * nz);
  const mark = (x, z, y) => {
    if (y > WALK_HEAD || y < 0.004) return;
    const i = Math.floor((x - x0) / C), k = Math.floor((z - z0) / C);
    if (i < 0 || k < 0 || i >= nx || k >= nz) return;
    const c = k * nx + i; if (y > top[c]) top[c] = y;
  };
  const shown = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  const mi = new THREE.Matrix4(), mw = new THREE.Matrix4();
  g.traverse(o => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position || !shown(o)) return;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    if (ms.every(m => !m || m.colorWrite === false || m.blending === THREE.AdditiveBlending)) return;   // the cup mask, floor halos
    const pos = o.geometry.attributes.position, idx = o.geometry.index, cnt = idx ? idx.count : pos.count, reps = o.isInstancedMesh ? o.count : 1;
    const P = new Float64Array(pos.count * 3);
    for (let r = 0; r < reps; r++) {
      if (o.isInstancedMesh) { o.getMatrixAt(r, mi); mw.multiplyMatrices(o.matrixWorld, mi); } else mw.copy(o.matrixWorld);
      const e = mw.elements;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        P[3 * i] = e[0] * x + e[4] * y + e[8] * z + e[12]; P[3 * i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; P[3 * i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
      }
      for (let t = 0; t + 2 < cnt; t += 3) {
        const a = 3 * (idx ? idx.getX(t) : t), b = 3 * (idx ? idx.getX(t + 1) : t + 1), c = 3 * (idx ? idx.getX(t + 2) : t + 2);
        const ax = P[a], ay = P[a + 1], az = P[a + 2], bx = P[b], by = P[b + 1], bz = P[b + 2], cx = P[c], cy = P[c + 1], cz = P[c + 2];
        if (Math.min(ay, by, cy) > WALK_HEAD) continue;
        // the edges (walls, posts and thin panels have no area in plan), then the faces
        for (const [px, py, pz, qx, qy, qz] of [[ax, ay, az, bx, by, bz], [bx, by, bz, cx, cy, cz], [cx, cy, cz, ax, ay, az]]) {
          const L = Math.hypot(qx - px, qy - py, qz - pz), s = Math.max(1, Math.ceil(L / 0.02));
          for (let j = 0; j <= s; j++) { const f = j / s; mark(px + (qx - px) * f, pz + (qz - pz) * f, py + (qy - py) * f); }
        }
        const den = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(den) < 1e-10) continue;
        const i0 = Math.max(0, Math.floor((Math.min(ax, bx, cx) - x0) / C)), i1 = Math.min(nx - 1, Math.floor((Math.max(ax, bx, cx) - x0) / C));
        const k0 = Math.max(0, Math.floor((Math.min(az, bz, cz) - z0) / C)), k1 = Math.min(nz - 1, Math.floor((Math.max(az, bz, cz) - z0) / C));
        for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) {
          const x = x0 + (i + 0.5) * C, z = z0 + (k + 0.5) * C;
          const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / den, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / den, l3 = 1 - l1 - l2;
          if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
          mark(x, z, l1 * ay + l2 * by + l3 * cy);
        }
      }
    }
  });
  return (walkFields[n] = { x0, z0, nx, nz, C, top });
}
/* the highest hole surface at (x, z), 0 on the bare floor */
function walkTop(x, z) {
  let t = 0;
  for (const n of G_ORDER) {
    if (!holeGroups[n]) continue;
    const b = walkBox(n); if (x < b[0] || x > b[1] || z < b[2] || z > b[3]) continue;
    const F = walkField(n), i = Math.floor((x - F.x0) / F.C), k = Math.floor((z - F.z0) / F.C);
    if (i >= 0 && k >= 0 && i < F.nx && k < F.nz) { const v = F.top[k * F.nx + i]; if (v > t) t = v; }
  }
  return t;
}
const WALK_RING = Array.from({ length: 12 }, (_, i) => [Math.cos(i * Math.PI / 6), Math.sin(i * Math.PI / 6)]);
const WALK_RING2 = Array.from({ length: 6 }, (_, i) => [0.55 * Math.cos(i * Math.PI / 3 + 0.5), 0.55 * Math.sin(i * Math.PI / 3 + 0.5)]);
/* is anything taller than a step (from foot height fy) within r of (x, z)? */
function walkSolid(x, z, r, fy) {
  const lim = fy + STEP_UP;
  if (walkTop(x, z) > lim) return true;
  for (const [c, s] of WALK_RING) if (walkTop(x + c * r, z + s * r) > lim) return true;
  for (const [c, s] of WALK_RING2) if (walkTop(x + c * r, z + s * r) > lim) return true;
  return false;
}
/* where your feet rest: the highest surface under the middle of your stance that you could have stepped onto */
function walkFoot(x, z, fy) {
  const lim = fy + STEP_UP; let t = walkTop(x, z); if (t > lim) t = 0;
  for (const [c, s] of [[0.09, 0], [-0.09, 0], [0, 0.09], [0, -0.09]]) { const v = walkTop(x + c, z + s); if (v <= lim && v > t) t = v; }
  return t;
}
/* build the fields in the background once walking starts, one hole at a time, so nothing stalls when you reach a hole */
function walkWarm() { const n = G_ORDER.find(k => holeGroups[k] && !walkFields[k]); if (n) { walkField(n); setTimeout(walkWarm, 40); } }

/* ------------------------------------------------------------------ the game (28 Nov): golf is part of walking
   You carry a putter and a ball. Walk to any tee (the glowing rings) and click to place the ball; walk up to it, aim with
   the crosshair, hold the button to draw the putter back and let go to putt. Nothing takes the camera or your legs away:
   walk while the ball rolls, stand where you like, play any hole in any order. */
const G_REACH = 1.2, G_CHARGE = 1.5, G_TEE_NEAR = 2.3;
const golf = { carry: true, n: 0, ctx: null, me: null, ball: 'hand', aim: 0, addr: false, pow: G_VMIN, charging: false, chargeAim: 0,
  swing: null, strokes: 0, pens: 0, rolls: 0, done: false, first: true, rollT: 0, acc: 0, lastV: null, last: null, backAt: 0,
  top: false, tee: null, next: null, scores: {}, wobble: false, ballCam: true, howOpen: null, meshes: [], hint: '', act: '' };
try {
  const s = JSON.parse(localStorage.getItem('countdownGolf3d.golf.v1') || '{}');
  if (s && typeof s === 'object') {
    if (s.scores && typeof s.scores === 'object') for (const k of G_ORDER) if (Number.isFinite(s.scores[k])) golf.scores[k] = s.scores[k];
    if (typeof s.wobble === 'boolean') golf.wobble = s.wobble;
    if (typeof s.carry === 'boolean') golf.carry = s.carry;
    if (typeof s.ballCam === 'boolean') golf.ballCam = s.ballCam;
  }
} catch (e) { /* the scorecard is a convenience */ }
const golfSave = () => { try { localStorage.setItem('countdownGolf3d.golf.v1', JSON.stringify({ scores: golf.scores, wobble: golf.wobble, carry: golf.carry, ballCam: golf.ballCam })); } catch (e) { /* ignore */ } };

/* what you see: balls, aim dots, the putter, the ball in your hand, a marker over your ball and a ring on every tee */
const G_BALL_GEO = new THREE.SphereGeometry(G_R, 20, 14);
const golfBallMat = c => M(c, { roughness: 0.32, emissive: c, emissiveIntensity: 0.18 });
const golfRoot = new THREE.Group(); scene.add(golfRoot);
const golfDots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.008, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.9, depthWrite: false }), 34);
golfDots.frustumCulled = false; golfDots.renderOrder = 3; golfRoot.add(golfDots);
const putter = new THREE.Group(); golfRoot.add(putter);
const pMats = [M('#D5DAE2', { roughness: 0.35, metalness: 0.25 }), M('#1C1D22', { roughness: 0.8 }), M('#59606B', { roughness: 0.35, metalness: 0.3 }), M('#F2C230', { roughness: 0.5 })];   // its own materials: they switch to drawing on top
const pShaft = mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 1, 8), pMats[0], putter);
const pGrip = mesh(new THREE.CylinderGeometry(0.0125, 0.0105, 0.26, 10), pMats[1], putter);
const pHead = new THREE.Group(); putter.add(pHead);
box(0.026, 0.024, 0.105, pMats[2], pHead, 0, 0, 0);
box(0.006, 0.012, 0.09, pMats[3], pHead, -0.0135, 0.002, 0);   // a yellow face insert, toward the target
const heldBall = mesh(G_BALL_GEO, golfBallMat('#FFFFFF'), golfRoot);
const golfHeld = [pShaft, pGrip, ...pHead.children, heldBall];
golfHeld.forEach(m => { m.castShadow = false; m.receiveShadow = false; });
let golfVM = null;   // first person, nothing addressed: the putter and ball drawn over the scene, like held items in a game
function golfViewModel(on) {
  if (golfVM === on) return; golfVM = on;
  for (const m of golfHeld) { const ms = Array.isArray(m.material) ? m.material : [m.material]; ms.forEach(q => { q.depthTest = !on; q.depthWrite = !on; }); m.renderOrder = on ? 20 : 0; }
  pShaftR = on ? 1.35 : 1;
}
let pShaftR = 1;
const markGeo = new THREE.ConeGeometry(0.045, 0.1, 4); markGeo.rotateX(Math.PI);
const golfMark = new THREE.Mesh(markGeo, new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.85, depthTest: false, depthWrite: false }));
golfMark.renderOrder = 15; golfRoot.add(golfMark);
const golfTees = {};
const beamTex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 64; const x = c.getContext('2d'), g = x.createLinearGradient(0, 64, 0, 0); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); return new THREE.CanvasTexture(c); })();
const beamGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 24, 1, true); beamGeo.translate(0, 0.75, 0);
for (const h of HOLES) {
  if (!holeGroups[h.n]) continue;
  const m = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.215, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: h.glow, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.renderOrder = 4; golfRoot.add(m); golfTees[h.n] = m;
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: h.glow, map: beamTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  beam.scale.set(1 / 1.25, 1, 1 / 1.25); beam.renderOrder = 4; m.add(beam);   // inside the ring, so it follows its pulse and visibility
}
function golfTeeSpot(n) {   // the tee you place your ball on, in world coordinates
  const h = H[n], bt = holeGroups[n].userData.build || {}, t = bt.tee || [-h.L / 2 + 0.3, 0], [x, z] = l2w(h, t[0], t[1]);
  return { x, z, y: bt.teeY != null ? bt.teeY : DECK };
}

/* HUD: hole card (top left), the hint and speed meter (bottom middle), a touch action button, messages and the scorecard */
let gEl = null;
function golfInit() {
  const st = document.createElement('style');
  st.textContent = `
.g-card{position:absolute;left:calc(10px + var(--inset-l));top:calc(54px + var(--inset-t));z-index:5;width:min(320px,calc(100% - 20px));background:var(--label-bg);color:var(--label-ink);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:10px 12px 11px;display:grid;gap:6px;backdrop-filter:blur(4px);font-size:.84rem}
.g-head{display:grid;grid-template-columns:auto minmax(0,1fr);gap:9px;align-items:center}
.g-num{width:30px;height:30px;border-radius:6px;display:grid;place-items:center;background:var(--c);color:var(--t);font:900 1rem/1 var(--font-display)}
.g-name{font:800 1rem/1.15 var(--font-display);min-width:0}
.g-meta{font:600 .74rem/1.3 var(--font-mono);letter-spacing:.02em;color:rgba(255,255,255,.78)}
.g-meta b{color:#fff}
.g-card details summary{cursor:pointer;font-weight:650;color:var(--now)}
.g-card details p{margin-top:5px;color:rgba(255,255,255,.86);line-height:1.4}
.g-card details p.g-pace{color:rgba(255,255,255,.66);font-size:.78rem}
.g-row{display:flex;flex-wrap:wrap;gap:5px}
.g-row button,.g-sc button{font:600 .76rem/1.1 var(--font-body);color:inherit;background:transparent;border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:6px 10px;cursor:pointer}
.g-row kbd{font:700 .68rem/1 var(--font-mono);opacity:.7;margin-left:3px}
.g-low{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(12px + var(--inset-b));z-index:4;display:grid;justify-items:center;gap:6px;width:min(460px,calc(100% - 260px));min-width:min(300px,calc(100% - 20px));pointer-events:none}
.g-hint{font:650 .84rem/1.3 var(--font-body);color:#fff;background:rgba(10,12,20,.72);padding:7px 13px;border-radius:999px;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.g-hint:empty{display:none}
.g-meter{position:relative;width:100%;height:30px;border-radius:9px;background:rgba(10,12,20,.6);border:1px solid rgba(255,255,255,.28);overflow:hidden}
.g-meter i{position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,#3BE36B,#F2C230 60%,#FF5A3D);opacity:.9}
.g-meter u{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 3px #000}
.g-meter span{position:absolute;inset:0;display:grid;place-items:center;font:800 .86rem/1 var(--font-mono);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.9)}
.g-keys{font:600 .68rem/1.2 var(--font-mono);color:rgba(255,255,255,.82);background:rgba(10,12,20,.5);padding:3px 9px;border-radius:999px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
@media (pointer:coarse),(max-width:640px){.g-keys{display:none}.g-low{width:calc(100% - 40px);bottom:calc(140px + var(--inset-b))}}
@media (max-width:640px){.g-card{padding:8px 10px 9px;gap:5px;font-size:.8rem}.g-row button{padding:5px 9px}.g-num{width:26px;height:26px}.g-name{font-size:.92rem}}
.g-act{position:absolute;right:calc(14px + var(--inset-r));bottom:calc(150px + var(--inset-b));z-index:5;min-width:92px;min-height:64px;border-radius:16px;border:0;background:var(--now);color:#1b1404;font:800 .9rem/1.1 var(--font-body);padding:10px 14px;cursor:pointer;touch-action:none;box-shadow:0 3px 14px rgba(0,0,0,.35);user-select:none;-webkit-user-select:none}
.g-msg{position:absolute;left:50%;transform:translateX(-50%);top:calc(56px + var(--inset-t));z-index:6;max-width:min(460px,calc(100% - 24px));background:rgba(10,12,20,.88);color:#fff;font:600 .86rem/1.4 var(--font-body);padding:9px 14px;border-radius:12px;pointer-events:none;text-align:center}
.g-msg b{display:block;font:900 1.25rem/1.15 var(--font-display);color:var(--now);margin-bottom:2px}
@media (max-width:760px){.g-msg{top:auto;bottom:calc(210px + var(--inset-b))}}
.g-sc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:7;width:min(420px,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto;background:var(--label-bg);color:var(--label-ink);border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:16px 16px 14px;display:grid;gap:9px;backdrop-filter:blur(6px);box-shadow:0 10px 40px rgba(0,0,0,.45)}
.g-sc .g-prim{background:var(--now);color:#1b1404;border-color:var(--now);font-weight:750}
.g-sc h3{font:900 1.15rem/1.1 var(--font-display)}
.g-sc table{border-collapse:collapse;width:100%;font:600 .78rem/1.2 var(--font-mono);text-align:center}
.g-sc th,.g-sc td{padding:5px 2px;border-bottom:1px solid rgba(255,255,255,.14)}
.g-sc th{color:rgba(255,255,255,.6);font-weight:600}
.g-sc td.me{color:#fff;font-weight:800}
.g-sc .lo{color:#3BE36B}.g-sc .hi{color:#FF8A6B}
.play-hole{justify-self:start;font:700 .86rem/1.1 var(--font-body);background:var(--now);color:#1b1404;border:0;border-radius:8px;padding:9px 13px;cursor:pointer}
.g-inset{position:absolute;left:calc(12px + var(--inset-l));bottom:calc(12px + var(--inset-b));z-index:3;width:min(30%,340px);aspect-ratio:16/10;border:2px solid rgba(255,255,255,.55);border-radius:10px;pointer-events:none;box-shadow:0 4px 18px rgba(0,0,0,.4)}
.g-inset span{position:absolute;left:6px;top:5px;font:700 .66rem/1 var(--font-mono);letter-spacing:.04em;color:#fff;background:rgba(10,12,20,.6);padding:3px 6px;border-radius:5px}
@media (pointer:coarse){.g-inset{left:auto;right:calc(12px + var(--inset-r));bottom:auto;top:calc(54px + var(--inset-t));width:min(38%,240px)}}
.g-hidden{display:none!important}
`;
  document.head.appendChild(st);
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  gEl = {
    card: el(`<section class="g-card g-hidden" aria-label="The hole you're playing"><div class="g-head"><span class="g-num"></span><b class="g-name"></b></div>
      <div class="g-meta"></div>
      <details class="g-how"><summary>How to play it</summary><p class="g-play"></p><p class="g-shot"></p><p class="g-pace"></p></details>
      <div class="g-row"><button type="button" data-g="restart" title="Back to the tee and start the hole again">Restart<kbd>R</kbd></button><button type="button" data-g="drop" title="Replace the ball where you last played it from, one penalty stroke">Drop +1</button><button type="button" data-g="pick" title="Pick your ball up (the hole isn't scored)">Pick up<kbd>F</kbd></button><button type="button" data-g="card" title="Scorecard">Card<kbd>C</kbd></button></div></section>`),
    low: el(`<div class="g-low g-hidden"><div class="g-hint" role="status" aria-live="polite"></div><div class="g-meter g-hidden" role="meter" aria-label="Putt speed" aria-valuemin="${G_VMIN}" aria-valuemax="${G_VMAX}"><i></i><u class="g-hidden"></u><span></span></div>
      <div class="g-keys">click: place / putt · F ball · R restart · V overhead · C card · G putter · Esc mouse</div></div>`),
    act: el(`<button type="button" class="g-act g-hidden"></button>`),
    msg: el(`<div class="g-msg g-hidden" role="status" aria-live="polite"></div>`),
    inset: el(`<div class="g-inset g-hidden" aria-hidden="true"><span>BALL CAM</span></div>`),
    sc: el(`<section class="g-sc g-hidden" aria-label="Scorecard"><h3>Scorecard</h3><div class="g-tab"></div><p class="g-scnote" style="font-size:.78rem;color:rgba(255,255,255,.7)"></p><div class="g-row"><button type="button" class="g-prim" data-g="scclose">Close</button><button type="button" data-g="scclear">Clear the card</button></div></section>`),
  };
  for (const k of ['card', 'low', 'act', 'msg', 'inset', 'sc']) viewer.appendChild(gEl[k]);
  // a Play button beside Walk in the viewer's corner: walk with the putter and ball
  const pb = el(`<button type="button" class="icon-btn" id="b-golf" aria-pressed="false" aria-label="Play golf" title="Play golf: walk round with a putter and ball"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21V3l10 4-10 4"/><path d="M4 21h9"/><circle cx="17.5" cy="18.5" r="2"/></svg></button>`);
  document.querySelector('.corner').insertBefore(pb, document.getElementById('b-walk'));
  pb.addEventListener('click', () => {
    if (!walking) { golf.carry = true; golfSave(); enterWalk(); askLock(); }
    else { golf.carry = !golf.carry; golfSave(); if (golf.carry) askLock(); }
    golfSync();
  });
  gEl.pb = pb;
  // settings drawer: a Play golf section after Walk around
  const sec = el(`<section class="dr-sec" aria-labelledby="dg-h"><h3 id="dg-h">Play golf</h3>
    <button type="button" class="dr-primary" id="d-golf">Play the selected hole</button>
    <div class="toggles"><button type="button" id="o-carry" aria-pressed="true">Carry a putter</button><button type="button" id="o-wobble" aria-pressed="false">Human wobble</button><button type="button" id="o-ballcam" aria-pressed="true">Ball camera</button><button type="button" id="d-score">Scorecard</button></div>
    <p class="dr-fine">Golf is part of walking. You carry a putter and a ball: walk to any tee (they glow) and click to place the ball, walk up to it, aim with the crosshair, hold the mouse button (or Space) to draw the putter back and let go to putt. The longer you hold, the harder the putt; the meter shows the speed in m/s, so you can try doc 14's paces, and a white tick marks your last putt. You can walk while the ball rolls and stand wherever you like. F picks the ball up or places it, R starts the hole again, hold V to look down on the hole, C shows the card, G puts the putter away. The ball camera (bottom left) shows the ball from behind its line while you line up and follows it while it rolls, so you can look at the target and still see the ball. The holes play exactly as modelled (steps, ramps, banks, tubes, pegs) with doc 14's 0.6 m/s² carpet drag. Human wobble adds up to ±4% pace and ±1.5° line, like a real putt. Five strokes, then pick up (doc 07).</p></section>`);
  const walkSec = document.querySelector('[aria-labelledby="dw-h"]'); walkSec.after(sec);
  document.getElementById('d-golf').addEventListener('click', () => { openDrawer(false); golfPlayHole(selected || 10); });
  const cb = document.getElementById('o-carry'); gEl.cb = cb;
  cb.addEventListener('click', () => { golf.carry = !golf.carry; golfSave(); golfSync(); });
  const wb = document.getElementById('o-wobble'); wb.setAttribute('aria-pressed', String(golf.wobble));
  wb.addEventListener('click', () => { golf.wobble = !golf.wobble; wb.setAttribute('aria-pressed', String(golf.wobble)); golfSave(); });
  document.getElementById('d-score').addEventListener('click', () => { openDrawer(false); golfScorecard(true); });
  const bc = document.getElementById('o-ballcam'); bc.setAttribute('aria-pressed', String(golf.ballCam));
  bc.addEventListener('click', () => { golf.ballCam = !golf.ballCam; bc.setAttribute('aria-pressed', String(golf.ballCam)); golfSave(); });
  // the hole card's Play button
  info.addEventListener('click', e => { const b = e.target.closest('[data-play]'); if (b) golfPlayHole(+b.dataset.play); });
  // HUD buttons
  viewer.addEventListener('click', e => {
    const b = e.target.closest('[data-g]'); if (!b || !viewer.contains(b)) return;
    const k = b.dataset.g;
    if (k === 'card') golfScorecard(true);
    else if (k === 'scclose') golfScorecard(false);
    else if (k === 'scclear') { golf.scores = {}; golfSave(); golfScorecard(true); golfHud(); }
    else if (k === 'restart') golfRestart();
    else if (k === 'drop') golfDrop();
    else if (k === 'pick') golfPickUp(true);
  });
  gEl.card.querySelector('.g-how').addEventListener('toggle', e => { if (golf.n) golf.howOpen = e.target.open; });
  // touch (or a mouse that isn't captured): the action button places the ball, or hold it to putt
  const act = gEl.act; let actId = null;
  act.addEventListener('pointerdown', e => { actId = e.pointerId; try { act.setPointerCapture(actId); } catch (err) { /* optional */ } e.preventDefault(); golfPress(); });
  const actUp = e => { if (e.pointerId !== actId) return; actId = null; golfRelease(); };
  act.addEventListener('pointerup', actUp); act.addEventListener('pointercancel', e => { if (e.pointerId === actId) { actId = null; golfCancel(); } });
  // the mouse on the 3D view: left button places or putts (once the mouse is captured, or where it can't be), right cancels
  const cv = renderer.domElement;
  cv.addEventListener('pointerdown', e => {
    if (!walking || !golf.carry || e.pointerType !== 'mouse') return;
    if (e.button === 2) { golfCancel(); return; }
    if (e.button !== 0 || !mouseLooks()) return;
    golfPress();
  });
  window.addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && e.button === 0 && golf.charging && golf.chargeBy !== 'key') golfRelease(); });
  cv.addEventListener('contextmenu', e => { if (walking) e.preventDefault(); });
  // keys, captured before the page's own handlers while walking
  window.addEventListener('keydown', e => {
    if (!walking || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target && e.target.closest && (e.target.closest('.drawer') || e.target.closest('input,textarea,select'))) return;
    const c = e.code;
    if (c === 'Escape' && !gEl.sc.classList.contains('g-hidden')) { e.preventDefault(); e.stopImmediatePropagation(); golfScorecard(false); return; }
    if (c === 'Space') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat && golf.carry) golfPress('key'); return; }
    if (c === 'KeyV') { e.preventDefault(); golf.top = true; return; }
    if (e.repeat) return;
    if (c === 'KeyF') { if (golf.ball === 'hand') golfPress(); else golfPickUp(true); }
    else if (c === 'KeyR') golfRestart();
    else if (c === 'KeyC') golfScorecard(gEl.sc.classList.contains('g-hidden'));
    else if (c === 'KeyG') { golf.carry = !golf.carry; golfSave(); golfSync(); }
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);
  window.addEventListener('keyup', e => {
    if (e.code === 'Space' && golf.charging && golf.chargeBy === 'key') golfRelease();
    if (e.code === 'KeyV') golf.top = false;
  });
  window.addEventListener('blur', () => { golf.top = false; if (golf.charging) golfCancel(); });
  golfSync();
}
const golfNext = n => n > 1 ? n - 1 : 10;
function golfSay(text, ms = 3200, title = '') {
  if (!gEl) return;
  gEl.msg.innerHTML = (title ? `<b>${esc(title)}</b>` : '') + esc(text); gEl.msg.classList.toggle('g-hidden', !text && !title);
  clearTimeout(golfSay.t); if ((text || title) && ms) golfSay.t = setTimeout(() => gEl.msg.classList.add('g-hidden'), ms);
}
function golfTotals() {
  let s = 0, p = 0, k = 0;
  for (const n of G_ORDER) if (golf.scores[n] != null) { s += golf.scores[n]; p += H[n].par; k++; }
  return { s, p, k };
}
const golfRel = d => d === 0 ? 'E' : (d > 0 ? '+' : '−') + Math.abs(d);
function golfHud() {
  if (!gEl) return;
  const on = !!golf.n && walking && golf.carry;
  gEl.card.classList.toggle('g-hidden', !on); if (!on) return;
  const h = H[golf.n], t = golfTotals(), c = gEl.card;
  c.style.setProperty('--c', h.glow); c.style.setProperty('--t', inkOn(h.glow));
  c.querySelector('.g-num').textContent = h.n;
  c.querySelector('.g-name').textContent = h.name;
  const shot = golf.n === 9 ? 'one shot' : `stroke ${Math.min(golf.strokes + golf.pens + (golf.done ? 0 : 1), 9)}`;
  const extra = golf.n === 1 ? ` · roll-backs <b>${golf.rolls}</b>` : golf.pens ? ` · penalties <b>${golf.pens}</b>` : '';
  c.querySelector('.g-meta').innerHTML = `Par <b>${h.par}</b> · <b>${shot}</b>${extra} · card <b>${t.k ? golfRel(t.s - t.p) : '–'}</b>${golf.lastV ? ` · last <b>${golf.lastV.toFixed(2)} m/s</b>` : ''}`;
}
function golfScorecard(show) {
  if (!gEl) return;
  gEl.sc.classList.toggle('g-hidden', !show); if (!show) return;
  if (document.pointerLockElement) document.exitPointerLock();   // so its buttons can be clicked
  const t = golfTotals();
  const cell = n => { const s = golf.scores[n]; if (s == null) return '<td class="me">·</td>'; const d = s - H[n].par; return `<td class="me ${d < 0 ? 'lo' : d > 0 ? 'hi' : ''}">${s}</td>`; };
  const half = ns => `<table><tr><th>Hole</th>${ns.map(n => `<th>${n}</th>`).join('')}</tr><tr><th>Par</th>${ns.map(n => `<td>${H[n].par}</td>`).join('')}</tr><tr><th>You</th>${ns.map(cell).join('')}</tr></table>`;
  gEl.sc.querySelector('.g-tab').innerHTML = `<p style="font-size:.78rem;color:rgba(255,255,255,.7)">Downtown</p>${half([10, 9, 8, 7, 6])}<p style="font-size:.78rem;color:rgba(255,255,255,.7);margin-top:6px">Midtown</p>${half([5, 4, 3, 2, 1])}`;
  gEl.sc.querySelector('.g-scnote').textContent = t.k ? `${t.k} of 10 holes played: ${t.s} strokes against par ${t.p} (${golfRel(t.s - t.p)}). The course is par 25. Play the holes in any order.` : 'No holes played yet. The course is par 25. Play the holes in any order.';
}
/* the hole card in the side panel: a Play button and the intended shot */
function golfCardBits(n) {
  const G = GOLF[n] || {};
  return { button: `<button type="button" class="play-hole" data-play="${n}">Play this hole</button>`, shot: G.shot ? `${G.shot} ${G.pace || ''}` : '' };
}
function golfSync() {   // buttons and visibility after carry, walking or the hole changes
  if (!gEl) return;
  const on = walking && golf.carry;
  gEl.pb.setAttribute('aria-pressed', String(on)); gEl.pb.setAttribute('aria-label', on ? 'Put the putter away' : 'Play golf');
  gEl.pb.title = on ? 'Put the putter away (G)' : 'Play golf: walk round with a putter and ball';
  gEl.cb.setAttribute('aria-pressed', String(golf.carry));
  gEl.low.classList.toggle('g-hidden', !on);
  if (!on) { gEl.act.classList.add('g-hidden'); if (golf.charging) golfCancel(); }
  golfHud();
}

/* ---- placing, putting and picking up */
function golfPlace(n) {   // your ball on hole n's tee: the hole starts (a hole already under way is dropped, unscored)
  if (!holeGroups[n]) return;
  if (golf.n && golf.n !== n && !golf.done && golf.strokes + golf.pens > 0) golfSay(`Hole ${golf.n} left unfinished: not on the card.`, 2600);
  const W = golfWorld(n), p = golfParams(n);
  golf.ctx = { W, p, balls: [] };
  golf.n = n; golf.strokes = 0; golf.pens = 0; golf.rolls = 0; golf.done = false; golf.first = true; golf.acc = 0; golf.lastV = null; golf.backAt = 0;
  golf.charging = false; golf.swing = null;
  if (n === 9) {   // the group's other three balls putted first, curling style: they stay where they stopped
    for (const c of ['#FF4FA3', '#3DA5FF', '#FFB020']) {
      const b = golfNewBall(W, W.tees[0][0], W.tees[0][1], c); golf.ctx.balls.push(b);
      golfLaunch(b, golfAimTo(W, b, 'cup') + (Math.random() - 0.5) * 0.08, 2.0 + Math.random() * 0.6);
      for (let t = 0; t < 30 && golf.ctx.balls.some(q => !q.rest && !q.holed && !q.gone); t += G_DT) golfStep(golf.ctx, G_DT);
      if (b.oob) b.gone = true;
    }
  }
  const me = golfNewBall(W, W.tees[0][0], W.tees[0][1], '#FFFFFF');
  golf.ctx.balls.push(me); golf.me = me; golf.last = { x: me.x, y: me.y, z: me.z }; golf.ball = 'down';
  select(n, false);
  const c = gEl.card, G = GOLF[n] || {}, h = H[n];
  c.querySelector('.g-play').textContent = h.play || '';
  c.querySelector('.g-shot').textContent = G.shot || '';
  c.querySelector('.g-pace').textContent = G.pace || '';
  if (golf.howOpen == null) golf.howOpen = false;   // open it from the card; it stays as you leave it
  c.querySelector('.g-how').open = golf.howOpen;
  golfHud();
  golfSay(n === 9 ? 'One shot, curling style: your group\'s three balls are already down.' : n === 7 ? 'Rally: a rival putts from the far end with your first shot.' : `Par ${h.par}. Walk up to the ball, aim with the crosshair, hold to putt.`, 3600, `${n} · ${h.name}`);
}
function golfPickUp(say) {   // the ball back in your hand; an unfinished hole isn't scored
  if (golf.ball === 'hand') return;
  if (golf.ball === 'rolling' && !golf.done) { if (say) golfSay('Wait for the ball to stop.', 1400); return; }
  if (say && golf.me && !golf.done) {
    const d = Math.hypot(golf.me.x - me.x, golf.me.z - me.y);
    if (d > 3) { golfSay(`Walk to your ball to pick it up (${d.toFixed(1)} m), or R to start the hole again.`, 2400); return; }
  }
  const was = golf.n, unfinished = was && !golf.done && golf.strokes + golf.pens > 0;
  golf.ball = 'hand'; golf.ctx = null; golf.me = null; golf.n = 0; golf.charging = false; golf.swing = null; golf.done = false;
  golfSyncMeshes(); golfHud();
  if (say) golfSay(unfinished ? `Ball picked up: hole ${was} isn't on the card. Place it on any tee.` : 'Ball in your hand. Place it on any tee.', 2400);
}
function golfRestart() {
  const n = golf.n || golf.next; if (!n) return;
  if (golf.ball === 'rolling' && !golf.done) { golfSay('Wait for the ball to stop.', 1400); return; }
  golfPlace(n);
}
function golfPlayHole(n) {   // from the hole card, the drawer or the corner: walk to the tee with the ball on it
  if (!holeGroups[n]) return;
  golf.carry = true; golfSave();
  if (!walking) enterWalk();
  goToTee(H[n]); golfPlace(n); golfSync(); askLock();
  const vr = viewer.getBoundingClientRect();   // started from the side panel: bring the 3D view into sight
  if (vr.top < 0 || vr.bottom > window.innerHeight + 2) viewer.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
}
function golfPress(by = 'mouse') {
  if (!walking || !golf.carry) return;
  if (golf.ball === 'hand') {
    if (golf.tee) golfPlace(golf.tee);
    else golfSay('Walk to a tee (the glowing rings) to place your ball.', 2000);
    return;
  }
  if (golf.done || golf.ball !== 'down') return;
  if (golf.addr && !golf.swing && !golf.charging) { golf.charging = true; golf.chargeBy = by; golf.pow = G_VMIN; golf.chargeAim = golf.aim; }
  else if (!golf.addr) golfSay('Walk up to your ball to putt (it has a marker over it).', 1800);
}
function golfRelease() {
  if (!golf.charging) return;
  golf.charging = false;
  const b = golf.me;
  golf.swing = { t: 0, v: golf.pow, a: golf.chargeAim, back: 0.03 + 0.17 * (golf.pow - G_VMIN) / (G_VMAX - G_VMIN), x: b.x, y: b.y, z: b.z, hit: false };
}
function golfCancel() { if (golf.charging) { golf.charging = false; golfSay('Putt cancelled.', 1000); } }
function golfStrike(v, a) {
  const W = golf.ctx.W, me = golf.me;
  if (golf.wobble) { const g2 = () => (Math.random() + Math.random() - 1); v *= 1 + 0.04 * g2(); a += 1.5 * Math.PI / 180 * g2(); }
  golf.last = { x: me.x, y: me.y, z: me.z };
  golfLaunch(me, a, v); golf.lastV = v; golf.strokes++;
  if (golf.ctx.p.rally && golf.first && W.tees[1]) {   // the rival putts from the far end on "3-2-1"
    const r = golfNewBall(W, W.tees[1][0], W.tees[1][1], '#FF4FA3'); r.rival = true; golf.ctx.balls.push(r);
    golfLaunch(r, golfAimTo(W, r, 'cup') + (Math.random() - 0.5) * 0.05, 2.1 + Math.random() * 0.35);
  }
  golf.first = false; golf.ball = 'rolling'; golf.rollT = 0; golf.acc = 0; golfHud();
}
function golfDrop() {   // replace the ball where it was last played from, one penalty stroke
  if (!golf.n || golf.done || golf.ball !== 'down' || !golf.last || golf.n === 9) return;
  const me = golf.me; Object.assign(me, { x: golf.last.x, y: golf.last.y, z: golf.last.z, vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0, rest: true, oob: false });
  golf.pens++; golfSay('Ball dropped where you last played it from: one penalty stroke.'); golfHud(); golfAfterCheckCap();
}
function golfAfterCheckCap() {
  if (golf.n !== 9 && golf.strokes + golf.pens >= G_CAP && !golf.done) { golfFinish(6, 'Picked up', 'Five strokes, then pick up (doc 07): it goes on the card as a 6.'); return true; }
  return false;
}
function golfAfterRoll() {
  const ctx = golf.ctx, W = ctx.W, me = golf.me, n = golf.n;
  const rival = ctx.balls.find(b => b.rival);
  let note = '';
  if (rival) { note = rival.holed ? ' Your rival holed theirs.' : ''; ctx.balls.splice(ctx.balls.indexOf(rival), 1); }
  golf.ball = 'down';
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
    golfFinish(Math.min(9, golf.rolls + me.slot + golf.pens), me.slot === 1 ? 'DROP!' : `Slot ${me.slot}`, `Score = roll-backs (${golf.rolls}) + the slot (${me.slot})${golf.pens ? ` + penalties (${golf.pens})` : ''}. Launched at ${golf.lastV.toFixed(2)} m/s.`);
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
  golfHud();
}
function golfFinish(score, title, detail) {
  golf.done = true; golf.scores[golf.n] = score; golfSave(); golfHud();
  const n = golf.n, t = golfTotals(), all = t.k === 10;
  const open = G_ORDER.filter(k => golf.scores[k] == null && holeGroups[k]);
  golf.next = open.find(k => k < n) || open[0] || golfNext(n);
  const tail = all ? `Round complete: ${t.s} against par ${t.p} (${golfRel(t.s - t.p)}). C for the card.` : `Card: ${t.k} hole${t.k > 1 ? 's' : ''}, ${golfRel(t.s - t.p)}. ${open.length ? `Next unplayed: ${golf.next} ${H[golf.next].name} (its tee ring pulses).` : ''}`;
  golfSay(`${detail} ${tail}`, 6500, title);
  golf.backAt = performance.now() + 1800;   // the ball comes back to your hand once you've seen it drop
}

/* ---- every frame: the physics, your putter and ball, the hints */
const gDir = new THREE.Vector3(), gV = new THREE.Vector3(), gV2 = new THREE.Vector3(), golfDotM = new THREE.Matrix4();
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
function golfAimDots(show) {
  golfDots.visible = !!show; if (!show) return;
  const b = golf.me, a = golf.charging ? golf.chargeAim : golf.aim, cx = Math.cos(a), cz = Math.sin(a);
  let k = 0;
  for (let i = 0; i < 34; i++) {
    const d = 0.07 + i * 0.06, x = b.x + cx * d, z = b.z + cz * d, y = golfGround(golf.ctx.W, x, z, b.y + 0.12);
    if (y == null) continue;
    golfDotM.makeTranslation(x, y + 0.003, z); golfDots.setMatrixAt(k++, golfDotM);
  }
  golfDots.count = k; golfDots.instanceMatrix.needsUpdate = true;
}
function putterPose(head, hands, ang, sw = 0) {   // shaft from the head's heel to the hands; the face square to the line `ang`
  pHead.position.copy(head); pHead.rotation.set(0, Math.PI - ang, -sw * 0.6);
  gV.copy(head); gV.y += 0.01;
  gV2.copy(hands).sub(gV); const len = gV2.length(); gV2.normalize();
  pShaft.scale.set(pShaftR, len, pShaftR); pShaft.position.copy(gV).addScaledVector(gV2, len / 2); pShaft.quaternion.setFromUnitVectors(G_UP, gV2);
  pGrip.position.copy(hands).addScaledVector(gV2, -0.12); pGrip.quaternion.setFromUnitVectors(G_UP, gV2);
}
const G_UP = new THREE.Vector3(0, 1, 0);
const camPt = (x, y, z, out) => out.set(x, y, z).applyMatrix4(camera.matrixWorld);
function golfFrame(dt) {
  if (!gEl) return;
  const ctx = golf.ctx, now = performance.now();
  // 1. physics, whether or not you're watching
  if (ctx && ctx.balls.some(b => !b.rest && !b.holed && !b.gone)) {
    golf.acc += dt; let k = 0;
    while (golf.acc >= G_DT && k < 200) { golfStep(ctx, G_DT); golf.acc -= G_DT; k++; }
    if (k >= 200) golf.acc = 0;
  }
  if (golf.ball === 'rolling' && ctx) {
    golf.rollT += dt;
    const me = golf.me, settled = !ctx.balls.some(b => !b.rest && !b.holed && !b.gone);
    const meDone = me.holed || (golf.n === 1 && me.slot && (me.rest || golf.rollT > 6));
    if (settled || meDone || golf.rollT > 40) {
      if (golf.rollT > 40) for (const b of ctx.balls) { b.rest = true; b.vx = b.vy = b.vz = 0; }
      golfAfterRoll();
    }
  }
  if (golf.done && golf.backAt && now > golf.backAt && !(ctx && ctx.balls.some(b => !b.rest && !b.holed && !b.gone))) { golf.backAt = 0; golfPickUp(false); }
  // 2. the swing: the head comes through, strikes, follows through; you can keep walking
  const S = golf.swing;
  if (S) {
    S.t += dt; const T2 = reduceMotion ? 0.04 : 0.11;
    if (!S.hit && S.t >= T2) { S.hit = true; golfStrike(S.v, S.a); }
    if (S.t > T2 + 0.4) golf.swing = null;
  }
  if (golf.charging) {
    golf.pow = Math.min(G_VMAX, golf.pow + G_CHARGE * dt);
    if (!golf.addr) golfCancel();
  }
  golfSyncMeshes();
  const on = walking && golf.carry;
  golfRoot.visible = on || !!golf.n;
  for (const m of [putter, heldBall]) m.visible = on;
  if (!on) { golfDots.visible = false; golfMark.visible = false; for (const k in golfTees) golfTees[k].visible = false; xhair.classList.remove('act'); return; }
  camera.updateMatrixWorld();
  const third = settings.pov === 'third', fwdX = -Math.sin(yaw), fwdZ = -Math.cos(yaw), rtX = Math.cos(yaw), rtZ = -Math.sin(yaw);
  // 3. which tee you'd place on, whether you can reach your ball, where you're aiming
  const b = golf.me;
  golf.addr = !!(b && golf.ball === 'down' && !golf.done && Math.hypot(b.x - me.x, b.z - me.y) < G_REACH);
  camera.getWorldDirection(gDir);
  if (golf.addr && !golf.charging) {
    let ang = Math.atan2(gDir.z, gDir.x);
    if (gDir.y < -0.03) {
      const t = (b.y - G_R - camera.position.y) / gDir.y, px = camera.position.x + gDir.x * t, pz = camera.position.z + gDir.z * t;
      if (t > 0 && Math.hypot(px - b.x, pz - b.z) > 0.12) ang = Math.atan2(pz - b.z, px - b.x);
    }
    golf.aim = ang;
  }
  golf.tee = null;
  if (golf.ball === 'hand') {
    let best = 1e9;
    for (const k in golfTees) {
      const t = golfTeeSpot(+k), d = Math.hypot(t.x - me.x, t.z - me.y); if (d > G_TEE_NEAR) continue;
      let da = Math.abs(Math.atan2(t.z - me.y, t.x - me.x) - Math.atan2(fwdZ, fwdX)); if (da > Math.PI) da = 2 * Math.PI - da;
      const sc = d + da * 0.8 + (+k === selected ? -0.3 : 0);
      if (sc < best) { best = sc; golf.tee = +k; }
    }
  }
  // 4. the putter and the ball in your hand
  const sy = standY;
  if (golf.addr || S) {
    golfViewModel(false);
    const A = S ? S.a : golf.charging ? golf.chargeAim : golf.aim, cx = Math.cos(A), cz = Math.sin(A);
    const P0 = S ? S : b;
    let off = 0;
    if (golf.charging) off = -(0.03 + 0.17 * (golf.pow - G_VMIN) / (G_VMAX - G_VMIN));
    else if (S) { const T2 = reduceMotion ? 0.04 : 0.11; off = S.t < T2 ? -S.back * (1 - Math.pow(S.t / T2, 2)) : Math.min(1, (S.t - T2) / 0.18) * Math.max(0.06, S.back * 0.6); }
    const lift = off < 0 ? off * off * 0.9 : off * off * 0.5, gap = G_R + 0.016;
    gV.set(P0.x + cx * (off - gap), P0.y - G_R + 0.012 + lift, P0.z + cz * (off - gap));
    const hx = me.x + (P0.x - me.x) * 0.5, hz = me.y + (P0.z - me.y) * 0.5;
    const hands = new THREE.Vector3(hx + cx * off * 0.3, sy + 0.5 * P.h, hz + cz * off * 0.3);
    putterPose(gV.clone(), hands, A, off * 1.5);
    heldBall.visible = false;
  } else if (third) {
    golfViewModel(false);
    const rh = P.shoulders / 2, hand = new THREE.Vector3(me.x + rtX * rh + fwdX * 0.04, sy + 0.42 * P.h, me.y + rtZ * rh + fwdZ * 0.04);
    putterPose(new THREE.Vector3(me.x + rtX * 0.3 + fwdX * 0.3, sy + 0.012, me.y + rtZ * 0.3 + fwdZ * 0.3), hand, Math.atan2(fwdZ, fwdX));
    heldBall.visible = golf.ball === 'hand';
    heldBall.position.set(me.x - rtX * rh, sy + 0.42 * P.h - 0.03, me.y - rtZ * rh);
  } else {
    // first person, walking about: held low on the right, the ball in your left hand
    golfViewModel(true);
    putterPose(camPt(0.13, -0.215, -0.64, new THREE.Vector3()), camPt(0.25, -0.075, -0.4, new THREE.Vector3()), Math.atan2(fwdZ, fwdX) + 0.5);
    heldBall.visible = golf.ball === 'hand';
    camPt(-0.2, -0.14, -0.5, heldBall.position);
  }
  // 5. guides: aim dots, the marker over your ball, the tee rings
  golfAimDots(golf.addr || golf.charging);
  golfMark.visible = !!(b && golf.ball !== 'hand' && !b.holed);
  if (golfMark.visible) {
    const far = Math.hypot(b.x - me.x, b.z - me.y);
    golfMark.position.set(b.x, b.y + 0.2 + 0.03 * Math.sin(now / 300) + Math.min(0.4, far * 0.04), b.z);
    golfMark.scale.setScalar(Math.min(3, 0.8 + far * 0.12));
    golfMark.material.color.set(golf.n ? H[golf.n].glow : '#FFFFFF');
  }
  for (const k in golfTees) {
    const m = golfTees[k], t = golfTeeSpot(+k), show = golf.ball === 'hand';
    m.visible = show; if (!show) continue;
    const hot = +k === golf.tee, nx = +k === golf.next && golf.scores[k] == null;
    m.position.set(t.x, t.y + 0.012, t.z);
    m.scale.setScalar(hot ? 1.25 + 0.08 * Math.sin(now / 160) : nx ? 1 + 0.15 * Math.sin(now / 260) : 1);
    m.material.opacity = hot ? 1 : nx ? 0.85 : 0.5;
  }
  xhair.classList.toggle('act', !!(golf.addr || (golf.ball === 'hand' && golf.tee)));
  // 6. the hint, the meter and the touch button
  const mouse = mouseLooks(), click = coarse ? 'Tap the button' : mouse ? 'Click' : 'Click the view first, then click';
  let hint = '', act = '';
  if (golf.ball === 'hand') {
    if (golf.tee) { hint = `${click} to place your ball on ${golf.tee} · ${H[golf.tee].name}`; act = `Place ball on ${golf.tee}`; }
    else hint = 'Ball in hand: walk to any tee (the glowing rings) to place it';
  } else if (golf.done) hint = '';
  else if (golf.ball === 'rolling' || S) hint = 'Rolling… walk wherever you like';
  else if (golf.charging) { hint = coarse ? 'Let go to putt' : 'Let go to putt · right-click cancels'; act = 'Let go to putt'; }
  else if (golf.addr) { hint = coarse ? 'Aim with the crosshair · hold the button to putt' : `Aim with the crosshair · ${mouse ? 'hold the mouse button' : 'hold Space'} to putt`; act = 'Hold to putt'; }
  else if (b) hint = `Walk to your ball · ${Math.hypot(b.x - me.x, b.z - me.y).toFixed(1)} m`;
  if (hint !== golf.hint) { golf.hint = hint; gEl.low.querySelector('.g-hint').textContent = hint; }
  const showAct = !!act && (coarse || !mouse);
  if (act !== golf.act || showAct === gEl.act.classList.contains('g-hidden')) { golf.act = act; gEl.act.textContent = act; gEl.act.classList.toggle('g-hidden', !showAct); }
  const meter = gEl.low.querySelector('.g-meter'), showM = golf.addr || golf.charging || !!S;
  meter.classList.toggle('g-hidden', !showM);
  if (showM) {
    const v = golf.charging ? golf.pow : S ? S.v : 0, fr = x => ((x - G_VMIN) / (G_VMAX - G_VMIN) * 100).toFixed(1) + '%';
    meter.querySelector('i').style.width = golf.charging || S ? fr(v) : '0%';
    meter.querySelector('span').textContent = golf.charging || S ? `${v.toFixed(2)} m/s` : golf.lastV ? `last ${golf.lastV.toFixed(2)} m/s` : 'hold to putt';
    const u = meter.querySelector('u'); u.classList.toggle('g-hidden', !golf.lastV); if (golf.lastV) u.style.left = fr(golf.lastV);
    meter.setAttribute('aria-valuenow', v.toFixed(2));
  }
  // 7. hold V: look straight down on the hole you're playing (or the nearest one)
  if (golf.top) {
    let n = golf.n;
    if (!n) { let bd = 1e9; for (const h of HOLES) { const d = Math.hypot(h.c[0] - me.x, h.c[1] - me.y); if (d < bd) { bd = d; n = h.n; } } }
    const h = H[n], g = holeGroups[n], ext = Math.max(h.L, h.W), ht = ext * 0.95 / Math.tan(camera.fov * Math.PI / 360) * 0.62 + 0.8;
    camera.position.set(g.position.x, ht, g.position.z + 0.01); camera.lookAt(g.position.x, BASE, g.position.z);
    avatar.visible = true; avatar.position.set(me.x, sy, me.y); avatar.rotation.y = yaw;
    if (golfVM) { putter.visible = false; heldBall.visible = false; }
  }
}
/* the ball camera: a small view from behind the ball along your line while you line up, and chasing it while it rolls.
   Drawn into a corner of the same canvas after the main view (only while it's showing, so walking costs nothing extra). */
const gSize = new THREE.Vector2(), gCam = new THREE.PerspectiveCamera(52, 1.6, 0.02, 120), gCamP = new THREE.Vector3(), gCamT = new THREE.Vector3(), gCamDir = new THREE.Vector2(1, 0);
let gCamOn = false;
function golfInset() {
  if (!gEl) return;
  const b = golf.me, rolling = golf.ball === 'rolling' || !!golf.swing;
  const show = !!(walking && golf.carry && golf.ballCam && b && !golf.top && !b.gone && (golf.addr || golf.charging || rolling || (golf.done && golf.backAt)));
  gEl.inset.classList.toggle('g-hidden', !show);
  if (!show) { gCamOn = false; return; }
  const sp = Math.hypot(b.vx, b.vz);
  let dx, dz;
  if (rolling && sp > 0.08) { dx = b.vx / sp; dz = b.vz / sp; }
  else { const a = golf.swing ? golf.swing.a : golf.charging ? golf.chargeAim : golf.aim; dx = Math.cos(a); dz = Math.sin(a); }
  const k0 = gCamOn ? Math.min(1, 0.08 + 0.12 * (rolling ? 1 : 2)) : 1;
  gCamDir.x += (dx - gCamDir.x) * k0; gCamDir.y += (dz - gCamDir.y) * k0; gCamDir.normalize();
  const back = rolling ? 0.75 : 0.85, up = rolling ? 0.38 : 0.32;
  let cx = b.x - gCamDir.x * back, cz = b.z - gCamDir.y * back, cy = b.y + up;
  cy = Math.max(cy, walkTop(cx, cz) + 0.12);
  const k = gCamOn ? 0.25 : 1;
  gCamP.lerp(new THREE.Vector3(cx, cy, cz), k); if (!gCamOn) gCamP.set(cx, cy, cz);
  const tx = b.x + gCamDir.x * 0.7, tz = b.z + gCamDir.y * 0.7;
  if (!gCamOn) gCamT.set(tx, b.y, tz); else gCamT.lerp(new THREE.Vector3(tx, b.y, tz), 0.35);
  gCam.position.copy(gCamP); gCam.lookAt(gCamT); gCamOn = true;
  const cv = renderer.domElement, cr = cv.getBoundingClientRect(), r = gEl.inset.getBoundingClientRect();
  const x = r.left - cr.left + 2, y = cr.bottom - r.bottom + 2, w = r.width - 4, h = r.height - 4;
  if (w < 20 || h < 20) return;
  gCam.aspect = w / h; gCam.updateProjectionMatrix();
  const vis = [putter.visible, heldBall.visible, golfMark.visible, avatar.visible];
  if (golfVM) { putter.visible = false; heldBall.visible = false; }
  golfMark.visible = false; avatar.visible = false;   // your own body would fill the frame
  renderer.setScissorTest(true); renderer.setScissor(x, y, w, h); renderer.setViewport(x, y, w, h);
  renderer.render(scene, gCam);
  const sz = renderer.getSize(gSize); renderer.setScissorTest(false); renderer.setViewport(0, 0, sz.x, sz.y);
  [putter.visible, heldBall.visible, golfMark.visible, avatar.visible] = vis;
}
/* the map: your ball, and the tees while the ball is in your hand */
function golfMini(x, S) {
  if (!walking || !golf.carry) return;
  const d = miniDpr;
  if (golf.ball === 'hand') for (const k in golfTees) {
    const t = golfTeeSpot(+k); x.strokeStyle = H[k].glow; x.lineWidth = 1.5 * d; x.beginPath(); x.arc(t.x * S, t.z * S, 3.2 * d, 0, Math.PI * 2); x.stroke();
  } else if (golf.me) { x.fillStyle = '#FFFFFF'; x.strokeStyle = '#000'; x.lineWidth = 1 * d; x.beginPath(); x.arc(golf.me.x * S, golf.me.z * S, 2.6 * d, 0, Math.PI * 2); x.fill(); x.stroke(); }
}
