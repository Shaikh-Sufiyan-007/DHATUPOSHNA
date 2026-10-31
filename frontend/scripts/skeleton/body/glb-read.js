// Read a built GLB back into world-space triangles, indexed for point queries.
// Used by the generators that must sit inside real bone (marrow) and by
// verify-explore-body.mjs for geometric containment assertions.

import * as THREE from 'three';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';

const CELL = 0.02;

/** Triangle set accelerated for "is this point inside this closed shell?" tests. */
export class TriSet {
  constructor(name, region) {
    this.name = name;
    this.region = region;
    this.t = []; // flat world-space triangle vertices
    this.min = [Infinity, Infinity, Infinity];
    this.max = [-Infinity, -Infinity, -Infinity];
    this.grid = null;
  }

  pushTri(a, b, c) {
    this.t.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    for (const p of [a, b, c]) {
      for (let i = 0; i < 3; i++) {
        if (p[i] < this.min[i]) this.min[i] = p[i];
        if (p[i] > this.max[i]) this.max[i] = p[i];
      }
    }
  }

  /** Bucket triangles by the (y,z) cells their footprint covers: a +X ray only
     meets triangles whose bbox spans the ray's (y,z). */
  build() {
    this.grid = new Map();
    const n = this.t.length / 9;
    for (let i = 0; i < n; i++) {
      const o = i * 9;
      const y0 = Math.min(this.t[o + 1], this.t[o + 4], this.t[o + 7]);
      const y1 = Math.max(this.t[o + 1], this.t[o + 4], this.t[o + 7]);
      const z0 = Math.min(this.t[o + 2], this.t[o + 5], this.t[o + 8]);
      const z1 = Math.max(this.t[o + 2], this.t[o + 5], this.t[o + 8]);
      const cy0 = Math.floor(y0 / CELL), cy1 = Math.floor(y1 / CELL);
      const cz0 = Math.floor(z0 / CELL), cz1 = Math.floor(z1 / CELL);
      for (let cy = cy0; cy <= cy1; cy++) {
        for (let cz = cz0; cz <= cz1; cz++) {
          const key = `${cy}|${cz}`;
          let list = this.grid.get(key);
          if (!list) { list = []; this.grid.set(key, list); }
          list.push(i);
        }
      }
    }
    return this;
  }

  candidates(p) {
    if (!this.grid) this.build();
    return this.grid.get(`${Math.floor(p[1] / CELL)}|${Math.floor(p[2] / CELL)}`) || [];
  }

  /** Ray parity along +X: true when p lies inside the closed surface. */
  contains(p) {
    if (p[1] < this.min[1] || p[1] > this.max[1] || p[2] < this.min[2] || p[2] > this.max[2]
      || p[0] > this.max[0]) return false;
    let hits = 0;
    for (const i of this.candidates(p)) {
      const o = i * 9;
      const ax = this.t[o], ay = this.t[o + 1], az = this.t[o + 2];
      const bx = this.t[o + 3], by = this.t[o + 4], bz = this.t[o + 5];
      const cx = this.t[o + 6], cy = this.t[o + 7], cz = this.t[o + 8];
      if (Math.min(ay, by, cy) > p[1] || Math.max(ay, by, cy) < p[1]) continue;
      if (Math.min(az, bz, cz) > p[2] || Math.max(az, bz, cz) < p[2]) continue;
      if (rayCrossesX(ax, ay, az, bx, by, bz, cx, cy, cz, p[0], p[1], p[2])) hits++;
    }
    return (hits & 1) === 1;
  }

  /** How many triangles of this set a +X ray from p meets (cage-enclosure test). */
  crossings(p) {
    let hits = 0;
    for (const i of this.candidates(p)) {
      const o = i * 9;
      if (rayCrossesX(this.t[o], this.t[o + 1], this.t[o + 2], this.t[o + 3], this.t[o + 4], this.t[o + 5],
        this.t[o + 6], this.t[o + 7], this.t[o + 8], p[0], p[1], p[2])) hits++;
    }
    return hits;
  }
}

function rayCrossesX(ax, ay, az, bx, by, bz, cx, cy, cz, px, py, pz) {
  // Solve p = a + s(b-a) + t(c-a) with the ray direction +X: the two
  // perpendicular equations fix s and t, then the hit must be ahead of px.
  const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
  const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
  const qy = py - ay, qz = pz - az;
  const det = e1y * e2z - e2y * e1z;
  if (Math.abs(det) < 1e-14) return false;
  const s = (qy * e2z - e2y * qz) / det;
  const t = (e1y * qz - qy * e1z) / det;
  if (s < 0 || t < 0 || s + t > 1) return false;
  return ax + s * e1x + t * e2x >= px;
}

/** All triangles of a GLB, grouped per mesh and per region, in world space. */
export async function readGlb(file) {
  const sets = [];
  const byRegion = new Map();
  for (const p of await readParts(file)) {
    const set = new TriSet(p.name, p.region);
    for (let i = 0; i < p.tris * 3; i++) {
      const a = (p.index ? p.index[i * 3] : i * 3) * 3;
      const b = (p.index ? p.index[i * 3 + 1] : i * 3 + 1) * 3;
      const c = (p.index ? p.index[i * 3 + 2] : i * 3 + 2) * 3;
      set.pushTri([p.position[a], p.position[a + 1], p.position[a + 2]],
        [p.position[b], p.position[b + 1], p.position[b + 2]],
        [p.position[c], p.position[c + 1], p.position[c + 2]]);
    }
    set.build();
    sets.push(set);
    const key = p.region || '-';
    let list = byRegion.get(key);
    if (!list) { list = []; byRegion.set(key, list); }
    list.push(set);
  }
  return { sets, byRegion };
}

/**
 * Every renderable part of a GLB, decoded to world space with float attributes
 * (KHR_mesh_quantization is undone first, so the verifier reads real metres).
 */
export async function readParts(file) {
  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
  const doc = await io.read(file);
  await doc.transform(dequantize());
  const out = [];
  const v = new THREE.Vector3();
  const nm = new THREE.Matrix3();
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const ex = { ...(mesh.getExtras() || {}), ...(node.getExtras() || {}) };
    const world = new THREE.Matrix4().fromArray(node.getWorldMatrix());
    const normalMat = nm.getNormalMatrix(world);
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const posArr = pos.getArray();
      const nrm = prim.getAttribute('NORMAL');
      const nrmArr = nrm ? nrm.getArray() : null;
      const idxAcc = prim.getIndices();
      const count = pos.getCount();
      const position = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        v.fromArray(posArr, i * 3).applyMatrix4(world);
        position[i * 3] = v.x; position[i * 3 + 1] = v.y; position[i * 3 + 2] = v.z;
      }
      const normal = new Float32Array(count * 3);
      if (nrmArr) {
        for (let i = 0; i < count; i++) {
          v.fromArray(nrmArr, i * 3).applyMatrix3(normalMat).normalize();
          normal[i * 3] = v.x; normal[i * 3 + 1] = v.y; normal[i * 3 + 2] = v.z;
        }
      }
      const index = idxAcc ? Uint32Array.from(idxAcc.getArray()) : null;
      const min = [Infinity, Infinity, Infinity];
      const max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < count; i++) {
        for (let k = 0; k < 3; k++) {
          const val = position[i * 3 + k];
          if (val < min[k]) min[k] = val;
          if (val > max[k]) max[k] = val;
        }
      }
      out.push({
        name: node.getName() || mesh.getName(),
        region: ex.region || null,
        layer: ex.layer || null,
        part: ex.part || null,
        parts: ex.parts || null,
        dhatus: ex.dhatus || null,
        hasColor: !!prim.getAttribute('COLOR_0'),
        position, normal, index,
        vertices: count,
        tris: (idxAcc ? idxAcc.getCount() : count) / 3,
        bbox: { min, max },
      });
    }
  }
  return out;
}

/** One TriSet per anatomical region, built from a skeleton GLB. */
export async function regionSets(file) {
  const { sets } = await readGlb(file);
  const map = new Map();
  for (const s of sets) {
    if (!s.region) continue;
    let list = map.get(s.region);
    if (!list) { list = []; map.set(s.region, list); }
    list.push(s);
  }
  for (const [k, v] of map) map.set(k, merge(v));
  return map;
}

function merge(list) {
  const out = new TriSet(list.map((l) => l.name).join('+'), list[0].region);
  for (const s of list) {
    for (let i = 0; i < s.t.length; i += 9) {
      out.pushTri([s.t[i], s.t[i + 1], s.t[i + 2]], [s.t[i + 3], s.t[i + 4], s.t[i + 5]], [s.t[i + 6], s.t[i + 7], s.t[i + 8]]);
    }
  }
  return out.build();
}
