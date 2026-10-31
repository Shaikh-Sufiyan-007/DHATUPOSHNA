// Explore3D Body Mesh Toolbox — lofting, anatomy profiles, and geometry ops
// shared by every tissue-layer generator. Deterministic: no Math.random.

import * as THREE from 'three';
import { TubeField, fbm, clamp, mirroredField, muscleEnvelope, bodyForm, bodyInward, insideShellWithMargin, nearestField, skinSurfaceDistance, skinInward, SKIN_SEARCH_PAD, sdBone } from './frame.js';

const AX_X = [1, 0, 0];
const AX_Z = [0, 0, 1];
const AX_Y = [0, 1, 0];

export function axesFor(path) {
  // Pick cross-section reference axes so sections stay anatomically aligned:
  // width along the dominant horizontal perpendicular, depth the other.
  const a = new THREE.Vector3(...path[0]);
  const b = new THREE.Vector3(...path[path.length - 1]);
  const d = b.clone().sub(a);
  if (Math.abs(d.y) > Math.abs(d.x) && Math.abs(d.y) > Math.abs(d.z)) return { refW: AX_X, refD: AX_Z };
  if (Math.abs(d.z) > Math.abs(d.x)) return { refW: AX_X, refD: AX_Y };
  return { refW: AX_Z, refD: AX_Y };
}

/**
 * Fusiform muscle belly profile: thin at origin, maximal at `peak`, thin again
 * at insertion. Returns the [t, [rx, rz, o]] section table TubeField expects.
 */
export function fusiformSections({ w, d, r0 = 0.32, r1 = 0.3, peak = 0.48, flat = 0.72, o = 0 }) {
  const shape = (t) => {
    const x = clamp(t, 0, 1);
    const bell = Math.sin(Math.PI * Math.pow((x + 0.5 * (1 - peak)) / 1.0, 0.82));
    const endA = r0 * (1 - clamp(x / (peak || 1e-3), 0, 1));
    const endB = r1 * (1 - clamp((x - peak) / Math.max(1e-3, 1 - peak), 0, 1));
    return Math.max(Math.min(bell, Math.max(endA, endB) + 0.55), 0.06);
  };
  const ts = [0, 0.04, 0.12, 0.24, 0.38, 0.5, 0.62, 0.76, 0.88, 0.96, 1];
  return ts.map((t) => {
    const k = shape(t);
    return [t, [w * k, d * k * flat, o]];
  });
}

/** Build a muscle TubeField from origin->insertion control points. */
export function muscleTube(path, opts = {}) {
  const {
    w = 0.02, d = 0.016, r0 = 0.32, r1 = 0.3, peak = 0.48, flat = 0.72, o = 0,
    samples = 0, inflate = 0,
  } = opts;
  const sections = opts.sections || fusiformSections({ w, d, r0, r1, peak, flat, o });
  const { refW, refD } = axesFor(path);
  const len = new THREE.CatmullRomCurve3(path.map((q) => new THREE.Vector3(...q))).getLength();
  const n = samples || Math.max(12, Math.min(40, Math.round(len * 260)));
  return new TubeField(path, sections, { samples: n, refW, refD, inflate });
}

/** Vessel / nerve / duct: near-cylindrical tube with a taper table. */
export function vesselTube(path, radii, opts = {}) {
  const { samples = 0, refW, refD, roundness = 0.94, inflate = 0 } = opts;
  const curve = new THREE.CatmullRomCurve3(path.map((q) => new THREE.Vector3(...q)));
  const len = curve.getLength();
  const n = samples || Math.max(8, Math.min(48, Math.round(len * 300)));
  const rr = Array.isArray(radii) ? radii : [radii, radii * 0.72];
  const ts = [0, 0.1, 0.35, 0.7, 0.93, 1];
  const sections = ts.map((t) => {
    const r = rr[0] + (rr[1] - rr[0]) * t;
    return [t, [r, r * roundness, 0]];
  });
  const ax = refW ? { refW, refD } : axesFor(path);
  return new TubeField(path, sections, { samples: n, refW: ax.refW, refD: ax.refD, inflate });
}

/** Bean-shaped lymph node: flattened, slightly notched loft. */
export function beanTube(centre, size, rot = [0, 0, 0], seed = 0) {
  const [sx, sy, sz] = size;
  const path = [[0, -sy, 0], [0, 0, 0], [0, sy, 0]].map((q) => rotOn(q, rot).map((v, i) => v + centre[i]));
  const ts = [0, 0.12, 0.3, 0.5, 0.7, 0.88, 1];
  const sections = ts.map((t) => {
    const k = Math.max(0.04, Math.sin(Math.PI * clamp(0.08 + t * 0.86, 0, 1)));
    const notch = t > 0.78 && t < 0.94 ? 0.82 : 1;
    return [t, [sx * k * notch, sz * k * notch, 0]];
  });
  void seed;
  return new TubeField(path, sections, { samples: 12, refW: AX_X, refD: AX_Z });
}

function rotOn(p, rot) {
  const v = new THREE.Vector3(...p);
  v.applyEuler(new THREE.Euler(rot[0], rot[1], rot[2], 'YXZ'));
  return [v.x, v.y, v.z];
}

// ---------------------------------------------------------------------------
// Lofting (closed manifold ellipsoidal tube)
// ---------------------------------------------------------------------------
export function loftTube(tube, opts = {}) {
  const {
    rings = 0,
    radial = 16,
    inset = 0,
    capRings = 3,
    noise = null,
    seed = 0,
    closeEnds = [true, true],
  } = opts;

  const insetFn = typeof inset === 'function' ? inset : () => inset;
  const n = Math.max(4, rings || Math.max((tube.samples.length - 1) * 2, 12));
  const R = Math.max(6, radial);
  const pos = [];
  const idx = [];
  const nrm = [0, 0, 0];

  const place = (p) => {
    const d = insetFn(p);
    if (d !== 0) {
      tube.inward(p, nrm);
      p[0] += nrm[0] * d; p[1] += nrm[1] * d; p[2] += nrm[2] * d;
    }
    if (noise) {
      const w = fbm(p[0] * noise.freq + seed, p[1] * noise.freq - seed * 0.5, p[2] * noise.freq + seed * 0.25, noise.octaves || 3);
      tube.inward(p, nrm);
      const amp = noise.amp * w;
      p[0] -= nrm[0] * amp; p[1] -= nrm[1] * amp; p[2] -= nrm[2] * amp;
    }
    pos.push(p[0], p[1], p[2]);
  };

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j < R; j++) {
      const q = tube.surfacePoint(i / n, (j / R) * Math.PI * 2);
      place(q);
    }
  }

  // body strips: ring i is at smaller t than ring i+1
  for (let i = 0; i < n; i++) strip(i * R, (i + 1) * R);
  const lastBodyRing = n * R;

  function strip(a, b) {
    for (let j = 0; j < R; j++) {
      const nj = (j + 1) % R;
      idx.push(a + j, b + j, a + nj);
      idx.push(a + nj, b + j, b + nj);
    }
  }

  function cap(tEnd, dir) {
    const s = tube.frameAt(tEnd);
    const cInset = insetFn([s.c[0], s.c[1], s.c[2]]);
    const rCap = Math.max(0.0004, s.rCap - cInset);
    let prev = dir > 0 ? lastBodyRing : 0;
    for (let d = 1; d <= capRings; d++) {
      const phi = (d / (capRings + 1)) * (Math.PI / 2);
      const sc = Math.cos(phi);
      const axial = dir * Math.sin(phi) * rCap;
      const rx = s.rx * sc, rz = s.rz * sc, off = s.o * sc;
      const base = pos.length / 3;
      for (let j = 0; j < R; j++) {
        const a = (j / R) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        place([
          s.c[0] + s.u[0] * ca * rx + s.v[0] * (sa * rz + off) + s.t[0] * axial,
          s.c[1] + s.u[1] * ca * rx + s.v[1] * (sa * rz + off) + s.t[1] * axial,
          s.c[2] + s.u[2] * ca * rx + s.v[2] * (sa * rz + off) + s.t[2] * axial,
        ]);
      }
      if (dir > 0) strip(prev, base); else strip(base, prev);
      prev = base;
    }
    const apex = pos.length / 3;
    place([s.c[0] + s.t[0] * dir * rCap, s.c[1] + s.t[1] * dir * rCap, s.c[2] + s.t[2] * dir * rCap]);
    for (let j = 0; j < R; j++) {
      const nj = (j + 1) % R;
      if (dir > 0) idx.push(prev + nj, prev + j, apex);
      else idx.push(prev + j, prev + nj, apex);
    }
  }

  if (closeEnds[1]) cap(1, 1);
  if (closeEnds[0]) cap(0, -1);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geom.setIndex(idx);
  geom.computeVertexNormals();
  ensureOutward(geom);
  return geom;
}

export function loftMirrored(tube, opts = {}) {
  return loftTube(mirroredField(tube), opts);
}

/** Flip the whole index buffer when the majority of faces point inward. */
export function ensureOutward(geom) {
  geom.computeBoundingBox();
  const c = new THREE.Vector3();
  geom.boundingBox.getCenter(c);
  const pos = geom.attributes.position, nor = geom.attributes.normal;
  let agree = 0, disagree = 0;
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).sub(c);
    n.fromBufferAttribute(nor, i);
    if (v.dot(n) >= 0) agree++; else disagree++;
  }
  if (disagree > agree) {
    const idx = geom.getIndex();
    const a = idx.array;
    for (let i = 0; i < a.length; i += 3) {
      const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t;
    }
    idx.needsUpdate = true;
    geom.computeVertexNormals();
  }
  return geom;
}

/** Displace vertices along their normal with deterministic fBm (fiber/gyri detail). */
export function displace(geom, fn) {
  const pos = geom.attributes.position, nor = geom.attributes.normal;
  const arr = pos.array;
  for (let i = 0; i < pos.count; i++) {
    const k = i * 3;
    const d = fn(arr[k], arr[k + 1], arr[k + 2], nor.getX(i), nor.getY(i), nor.getZ(i));
    if (!d) continue;
    arr[k] += nor.getX(i) * d;
    arr[k + 1] += nor.getY(i) * d;
    arr[k + 2] += nor.getZ(i) * d;
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

/** Keep a geometry strictly inside the skin shell (used as a final safety pass). */
export function insideSkin(geom, margin = 0.005, push = 0.0016) {
  const arr = geom.attributes.position.array;
  const count = geom.attributes.position.count;
  for (let i = 0; i < count; i++) {
    const k = i * 3;
    const p = [arr[k], arr[k + 1], arr[k + 2]];
    if (insideShellWithMargin(p, margin)) continue;
    const f = nearestField(p);
    if (!f) continue;
    const out = [0, 0, 0];
    f.field.inward(p, out);
    arr[k] += out[0] * push; arr[k + 1] += out[1] * push; arr[k + 2] += out[2] * push;
  }
  geom.attributes.position.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

/** Enforce the deep-muscle fascia envelope on a lofted belly. */
export function insideFascia(geom, extra = 0) {
  return displace(geom, (x, y, z, nx, ny, nz) => {
    const p = [x, y, z];
    const d = muscleEnvelope(p) + extra;
    if (d >= 0) return 0;
    // d < 0 means outside the envelope -> retreat along inward normal
    const len = Math.hypot(nx, ny, nz) || 1;
    return d / len;
  });
}

/**
 * Push every vertex to at least `margin` inside the skin shell. Guarantees the
 * layer can never be seen outside the silhouette.
 */
export function clampInsideShell(geom, margin = 0.020, passes = 3) {
  const arr = geom.attributes.position.array;
  const count = geom.attributes.position.count;
  const out = [0, 0, 0];
  for (let pass = 0; pass < passes; pass++) {
    let moved = 0;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      const p = [arr[k], arr[k + 1], arr[k + 2]];
      const d = bodyForm(p);
      if (d < -margin) continue;
      moved++;
      bodyInward(p, out);
      const push = Math.min(0.08, (Number.isFinite(d) ? d : 0.08) + margin + 0.0006);
      arr[k] = p[0] + out[0] * push;
      arr[k + 1] = p[1] + out[1] * push;
      arr[k + 2] = p[2] + out[2] * push;
    }
    if (!moved) break;
  }
  for (let i = 0; i < arr.length; i++) {
    if (Number.isFinite(arr[i])) continue;
    throw new Error('clampInsideShell produced a non-finite vertex');
  }
  geom.attributes.position.needsUpdate = true;
  geom.computeBoundingSphere();
  return geom;
}

/** Flatten anything that falls through the floor plane (soles, toes). */
export function clampFloor(geom, y = 0.0035) {
  const arr = geom.attributes.position.array;
  for (let i = 0; i < geom.attributes.position.count; i++) {
    const k = i * 3 + 1;
    if (arr[k] < y) arr[k] = y;
  }
  geom.attributes.position.needsUpdate = true;
  return geom;
}

/**
 * Final safety net, applied to the MERGED region mesh: retreat every vertex that
 * sticks out of the skin silhouette to `margin` metres inside it. Per-part
 * clamping uses conservative envelopes and can miss a belly that reaches past a
 * neighbouring segment, so this guarantees no generated layer is ever visible
 * outside the shell.
 */
export function clampOutsideSkin(geom, margin = 0.005, passes = 3) {
  const arr = geom.attributes.position.array;
  const count = geom.attributes.position.count;
  const dir = [0, 0, 0];
  for (let pass = 0; pass < passes; pass++) {
    let moved = 0;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      const p = [arr[k], arr[k + 1], arr[k + 2]];
      const d = skinSurfaceDistance(p);
      if (Number.isFinite(d) && d <= -margin) continue;
      moved++;
      if (Number.isFinite(d)) {
        skinInward(p, dir);
        const push = Math.min(0.12, d + margin + 0.0008);
        arr[k] = p[0] + dir[0] * push;
        arr[k + 1] = p[1] + dir[1] * push;
        arr[k + 2] = p[2] + dir[2] * push;
      } else {
        // Beyond the search pad from every segment box: pull toward that segment.
        const f = nearestField(p);
        if (!f) continue;
        const b = f.field.box;
        const cx = (b.min.x + b.max.x) * 0.5, cy = (b.min.y + b.max.y) * 0.5, cz = (b.min.z + b.max.z) * 0.5;
        const l = Math.hypot(cx - p[0], cy - p[1], cz - p[2]) || 1;
        const push = Math.min(l, SKIN_SEARCH_PAD + margin);
        arr[k] = p[0] + (cx - p[0]) / l * push;
        arr[k + 1] = p[1] + (cy - p[1]) / l * push;
        arr[k + 2] = p[2] + (cz - p[2]) / l * push;
      }
    }
    if (!moved) break;
  }
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i])) throw new Error('clampOutsideSkin produced a non-finite vertex');
  }
  geom.attributes.position.needsUpdate = true;
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return geom;
}

/**
 * Keep a marrow shell strictly inside the bone it fills: every vertex is pulled
 * to at least `margin` inside the nearest allowed volume (long-bone capsule,
 * vertebra, or the bbox of a flat/cancellous bone region). Without this the
 * inward offset of an analytic capsule can still poke out of the shipped bone
 * where the two disagree.
 */
export function clampInsideBone(geom, { margin = 0.002, bones = [], boxes = [], passes = 2 } = {}) {
  const arr = geom.attributes.position.array;
  const count = geom.attributes.position.count;
  const inset = boxes.map((b) => ({
    min: [b.min[0] + margin, b.min[1] + margin, b.min[2] + margin],
    max: [b.max[0] - margin, b.max[1] - margin, b.max[2] - margin],
  }));
  for (let pass = 0; pass < passes; pass++) {
    let moved = 0;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      const p = [arr[k], arr[k + 1], arr[k + 2]];
      let bestD = Infinity, bestKind = null, bestRef = null;
      for (const b of bones) {
        const d = sdBone(p, b) + margin;
        if (d < bestD) { bestD = d; bestKind = 'cap'; bestRef = b; }
      }
      for (const b of inset) {
        const dx = Math.max(b.min[0] - p[0], p[0] - b.max[0]);
        const dy = Math.max(b.min[1] - p[1], p[1] - b.max[1]);
        const dz = Math.max(b.min[2] - p[2], p[2] - b.max[2]);
        const d = Math.max(dx, dy, dz); // < 0 when inside the inset box
        if (d < bestD) { bestD = d; bestKind = 'box'; bestRef = b; }
      }
      if (bestKind === null || bestD <= 0) continue;
      moved++;
      if (bestKind === 'cap') {
        const b = bestRef;
        const ax = b.a[0], ay = b.a[1], az = b.a[2];
        const bx = b.b[0] - ax, by = b.b[1] - ay, bz = b.b[2] - az;
        const lenSq = bx * bx + by * by + bz * bz || 1e-8;
        const h = Math.max(0, Math.min(1, ((p[0] - ax) * bx + (p[1] - ay) * by + (p[2] - az) * bz) / lenSq));
        const cx = ax + bx * h, cy = ay + by * h, cz = az + bz * h;
        let dx = p[0] - cx, dy = p[1] - cy, dz = p[2] - cz;
        let l = Math.hypot(dx, dy, dz);
        if (l < 1e-7) { dx = 0; dy = 0; dz = 1; l = 1; }
        const r = Math.max(0.0005, b.ra + (b.rb - b.ra) * h - margin);
        arr[k] = cx + (dx / l) * r;
        arr[k + 1] = cy + (dy / l) * r;
        arr[k + 2] = cz + (dz / l) * r;
      } else {
        const b = bestRef;
        arr[k] = Math.min(Math.max(p[0], b.min[0]), b.max[0]);
        arr[k + 1] = Math.min(Math.max(p[1], b.min[1]), b.max[1]);
        arr[k + 2] = Math.min(Math.max(p[2], b.min[2]), b.max[2]);
      }
    }
    if (!moved) break;
  }
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i])) throw new Error('clampInsideBone produced a non-finite vertex');
  }
  geom.attributes.position.needsUpdate = true;
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return geom;
}

/**
 * Drop zero-area faces and the needles that become zero-area later.
 *
 * `minEdge` matters because export quantizes positions to a grid of a few tens of
 * microns: a face with one edge shorter than that grid collapses to nothing no
 * matter how large its area looks here, and survives every other cull.
 */
export function stripDegenerate(geom, minArea = 1e-10, minEdge = 0) {
  const idx = geom.getIndex();
  if (!idx) return geom;
  const pos = geom.attributes.position.array;
  const out = [];
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2);
    const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2];
    const vx = pos[c * 3] - pos[a * 3], vy = pos[c * 3 + 1] - pos[a * 3 + 1], vz = pos[c * 3 + 2] - pos[a * 3 + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    if (0.5 * Math.hypot(cx, cy, cz) < minArea) continue;
    if (minEdge > 0) {
      const wx = vx - ux, wy = vy - uy, wz = vz - uz;
      if (Math.hypot(ux, uy, uz) < minEdge || Math.hypot(vx, vy, vz) < minEdge
        || Math.hypot(wx, wy, wz) < minEdge) continue;
    }
    out.push(a, b, c);
  }
  geom.setIndex(out);
  geom.computeBoundingSphere();
  return geom;
}

/** Merge indexed geometries into one geometry (positions + normals concatenated). */
export function mergeGeoms(geoms) {
  const P = [], N = [], I = [];
  let offset = 0;
  for (const g of geoms) {
    const p = g.attributes.position;
    if (!g.attributes.normal) g.computeVertexNormals();
    const n = g.attributes.normal;
    if (!g.index) {
      const c = p.count;
      for (let i = 0; i < c; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); }
      for (let i = 0; i + 2 < c; i += 3) I.push(i + offset, i + 1 + offset, i + 2 + offset);
    } else {
      for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); }
      const ind = g.index.array;
      for (let i = 0; i < ind.length; i++) I.push(ind[i] + offset);
    }
    offset += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  out.setIndex(I);
  out.computeBoundingBox();
  out.computeBoundingSphere();
  return out;
}

export function triCount(geom) {
  return geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
}

/** Uniform scale about an anchor point, in place. */
export function scaleAbout(geom, s, anchor) {
  geom.translate(-anchor[0], -anchor[1], -anchor[2]);
  geom.scale(s, s, s);
  geom.translate(anchor[0], anchor[1], anchor[2]);
  return geom;
}

/** Rigid place in place: rotate (Euler XYZ, radians) then translate. */
export function place(geom, { rotate = [0, 0, 0], translate = [0, 0, 0] } = {}) {
  if (rotate[0]) geom.rotateX(rotate[0]);
  if (rotate[1]) geom.rotateY(rotate[1]);
  if (rotate[2]) geom.rotateZ(rotate[2]);
  if (translate[0] || translate[1] || translate[2]) geom.translate(...translate);
  return geom;
}

/** Ellipsoid-ish organ form from an elliptic tube along a short axis. */
export function organTube(path, sections, opts = {}) {
  return new TubeField(path, sections, { samples: opts.samples || 18, refW: [1, 0, 0], refD: [0, 0, 1] });
}

export function boxOf(geom) {
  geom.computeBoundingBox();
  const b = geom.boundingBox;
  return {
    min: [b.min.x, b.min.y, b.min.z],
    max: [b.max.x, b.max.y, b.max.z],
  };
}

/** A named part: the single unit every generator returns. */
export function part(name, layer, region, geometry, extra = {}) {
  if (!geometry || !geometry.attributes.position || geometry.attributes.position.count === 0) {
    throw new Error(`Empty geometry for part "${name}"`);
  }
  const arr = geometry.attributes.position.array;
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i])) throw new Error(`NaN in part "${name}" at ${i}`);
  }
  return { name, layer, region, geometry, ...extra };
}

export { AX_X, AX_Y, AX_Z, TubeField, clamp, fbm };
