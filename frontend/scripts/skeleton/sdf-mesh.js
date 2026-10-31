// Signed Distance Field (SDF) Primitives, Combinators, and Dual Contouring / Surface Nets Mesher
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// SDF COMBINATORS
// ---------------------------------------------------------------------------
export function smin(a, b, k = 0.005) {
  const h = Math.max(k - Math.abs(a - b), 0.0) / k;
  return Math.min(a, b) - h * h * k * (1.0 / 4.0);
}

export function smax(a, b, k = 0.005) {
  const h = Math.max(k - Math.abs(a - b), 0.0) / k;
  return Math.max(a, b) + h * h * k * (1.0 / 4.0);
}

export function ssub(d1, d2, k = 0.005) {
  return smax(-d1, d2, k);
}

// ---------------------------------------------------------------------------
// SDF PRIMITIVES
// ---------------------------------------------------------------------------
export function sdSphere(p, r) {
  return Math.hypot(p[0], p[1], p[2]) - r;
}

export function sdEllipsoid(p, r) {
  const k0 = Math.hypot(p[0] / r[0], p[1] / r[1], p[2] / r[2]);
  const k1 = Math.hypot(p[0] / (r[0] * r[0]), p[1] / (r[1] * r[1]), p[2] / (r[2] * r[2]));
  // At the exact centre k0 and k1 are both 0; the estimate degenerates to 0/0.
  if (k1 < 1e-12) return -Math.min(r[0], r[1], r[2]);
  return k0 * (k0 - 1.0) / k1;
}

export function sdBox(p, b) {
  const qx = Math.abs(p[0]) - b[0];
  const qy = Math.abs(p[1]) - b[1];
  const qz = Math.abs(p[2]) - b[2];
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const oz = Math.max(qz, 0);
  return Math.hypot(ox, oy, oz) + Math.min(Math.max(qx, Math.max(qy, qz)), 0);
}

export function sdRoundedBox(p, b, r) {
  const qx = Math.abs(p[0]) - b[0] + r;
  const qy = Math.abs(p[1]) - b[1] + r;
  const qz = Math.abs(p[2]) - b[2] + r;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const oz = Math.max(qz, 0);
  return Math.hypot(ox, oy, oz) + Math.min(Math.max(qx, Math.max(qy, qz)), 0) - r;
}

export function sdCapsule(p, a, b, r) {
  const paX = p[0] - a[0], paY = p[1] - a[1], paZ = p[2] - a[2];
  const baX = b[0] - a[0], baY = b[1] - a[1], baZ = b[2] - a[2];
  const h = Math.max(0, Math.min(1, (paX * baX + paY * baY + paZ * baZ) / (baX * baX + baY * baY + baZ * baZ || 1e-8)));
  const dx = paX - baX * h;
  const dy = paY - baY * h;
  const dz = paZ - baZ * h;
  return Math.hypot(dx, dy, dz) - r;
}

export function sdTaperedCapsule(p, a, b, ra, rb) {
  const paX = p[0] - a[0], paY = p[1] - a[1], paZ = p[2] - a[2];
  const baX = b[0] - a[0], baY = b[1] - a[1], baZ = b[2] - a[2];
  const lenSq = baX * baX + baY * baY + baZ * baZ || 1e-8;
  const h = Math.max(0, Math.min(1, (paX * baX + paY * baY + paZ * baZ) / lenSq));
  const dx = paX - baX * h;
  const dy = paY - baY * h;
  const dz = paZ - baZ * h;
  const r = ra + (rb - ra) * h;
  return Math.hypot(dx, dy, dz) - r;
}

export function sdTorus(p, rMajor, rMinor) {
  const qx = Math.hypot(p[0], p[2]) - rMajor;
  return Math.hypot(qx, p[1]) - rMinor;
}

// ---------------------------------------------------------------------------
// SURFACE NETS MESHING (Fast, Watertight, Manifold)
// ---------------------------------------------------------------------------
export function meshSDF(sdfFunc, minB, maxB, res = [40, 40, 40]) {
  const [nx, ny, nz] = res;
  const dx = (maxB[0] - minB[0]) / (nx - 1);
  const dy = (maxB[1] - minB[1]) / (ny - 1);
  const dz = (maxB[2] - minB[2]) / (nz - 1);

  // 1. Evaluate field grid
  const totalVoxels = nx * ny * nz;
  const field = new Float32Array(totalVoxels);
  const p = [0, 0, 0];

  let idx = 0;
  for (let k = 0; k < nz; k++) {
    p[2] = minB[2] + k * dz;
    for (let j = 0; j < ny; j++) {
      p[1] = minB[1] + j * dy;
      for (let i = 0; i < nx; i++) {
        p[0] = minB[0] + i * dx;
        field[idx++] = sdfFunc(p);
      }
    }
  }

  // 2. Dual contouring / Surface nets: identify cells crossing 0 and compute dual vertex
  const gridIndex = (x, y, z) => x + nx * (y + ny * z);
  const cellVertices = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const vertices = [];
  const normals = [];
  const indices = [];

  const cellIdx = (x, y, z) => x + (nx - 1) * (y + (ny - 1) * z);

  // Corner offsets
  const corners = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
    [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]
  ];

  for (let k = 0; k < nz - 1; k++) {
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          const v = field[gridIndex(i + corners[c][0], j + corners[c][1], k + corners[c][2])];
          if (v < 0) mask |= (1 << c);
        }

        if (mask === 0 || mask === 255) continue; // no boundary crossing

        // Vertex position estimated from edge crossings
        let vx = 0, vy = 0, vz = 0, edgeCount = 0;

        // Check 12 edges of the cell
        const edges = [
          [0, 1], [1, 3], [3, 2], [2, 0], // z=0 plane
          [4, 5], [5, 7], [7, 6], [6, 4], // z=1 plane
          [0, 4], [1, 5], [2, 6], [3, 7]  // vertical edges
        ];

        for (const [c0, c1] of edges) {
          const v0 = field[gridIndex(i + corners[c0][0], j + corners[c0][1], k + corners[c0][2])];
          const v1 = field[gridIndex(i + corners[c1][0], j + corners[c1][1], k + corners[c1][2])];
          if ((v0 < 0) !== (v1 < 0)) {
            const t = -v0 / (v1 - v0 || 1e-8);
            const x0 = minB[0] + (i + corners[c0][0]) * dx;
            const y0 = minB[1] + (j + corners[c0][1]) * dy;
            const z0 = minB[2] + (k + corners[c0][2]) * dz;
            const x1 = minB[0] + (i + corners[c1][0]) * dx;
            const y1 = minB[1] + (j + corners[c1][1]) * dy;
            const z1 = minB[2] + (k + corners[c1][2]) * dz;
            vx += x0 + t * (x1 - x0);
            vy += y0 + t * (y1 - y0);
            vz += z0 + t * (z1 - z0);
            edgeCount++;
          }
        }

        if (edgeCount > 0) {
          vx /= edgeCount;
          vy /= edgeCount;
          vz /= edgeCount;
        } else {
          vx = minB[0] + (i + 0.5) * dx;
          vy = minB[1] + (j + 0.5) * dy;
          vz = minB[2] + (k + 0.5) * dz;
        }

        const vIdx = vertices.length / 3;
        vertices.push(vx, vy, vz);
        normals.push(0, 0, 1); // computeVertexNormals() below writes the real ones

        cellVertices[cellIdx(i, j, k)] = vIdx;
      }
    }
  }

  // Standard Surface Nets quad generation on internal grid edges
  for (let k = 0; k < nz - 1; k++) {
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        // Edge along X
        if (i > 0 && j > 0 && k > 0) {
          // X-edge
          const vX = field[gridIndex(i, j, k)];
          const vX_prev = field[gridIndex(i - 1, j, k)];
          if ((vX < 0) !== (vX_prev < 0)) {
            const c0 = cellVertices[cellIdx(i - 1, j - 1, k - 1)];
            const c1 = cellVertices[cellIdx(i - 1, j, k - 1)];
            const c2 = cellVertices[cellIdx(i - 1, j, k)];
            const c3 = cellVertices[cellIdx(i - 1, j - 1, k)];
            if (c0 >= 0 && c1 >= 0 && c2 >= 0 && c3 >= 0) {
              if (vX < 0) {
                indices.push(c0, c1, c2, c0, c2, c3);
              } else {
                indices.push(c0, c2, c1, c0, c3, c2);
              }
            }
          }

          // Y-edge
          const vY = field[gridIndex(i, j, k)];
          const vY_prev = field[gridIndex(i, j - 1, k)];
          if ((vY < 0) !== (vY_prev < 0)) {
            const c0 = cellVertices[cellIdx(i - 1, j - 1, k - 1)];
            const c1 = cellVertices[cellIdx(i, j - 1, k - 1)];
            const c2 = cellVertices[cellIdx(i, j - 1, k)];
            const c3 = cellVertices[cellIdx(i - 1, j - 1, k)];
            if (c0 >= 0 && c1 >= 0 && c2 >= 0 && c3 >= 0) {
              if (vY < 0) {
                indices.push(c0, c2, c1, c0, c3, c2);
              } else {
                indices.push(c0, c1, c2, c0, c2, c3);
              }
            }
          }

          // Z-edge
          const vZ = field[gridIndex(i, j, k)];
          const vZ_prev = field[gridIndex(i, j, k - 1)];
          if ((vZ < 0) !== (vZ_prev < 0)) {
            const c0 = cellVertices[cellIdx(i - 1, j - 1, k - 1)];
            const c1 = cellVertices[cellIdx(i, j - 1, k - 1)];
            const c2 = cellVertices[cellIdx(i, j, k - 1)];
            const c3 = cellVertices[cellIdx(i - 1, j, k - 1)];
            if (c0 >= 0 && c1 >= 0 && c2 >= 0 && c3 >= 0) {
              if (vZ < 0) {
                indices.push(c0, c1, c2, c0, c2, c3);
              } else {
                indices.push(c0, c2, c1, c0, c3, c2);
              }
            }
          }
        }
      }
    }
  }

  // Surface Nets quads built from this corner order come out inside-out: every
  // triangle's winding normal opposed the analytic outward gradient (measured on
  // a sphere and an ellipsoid: 100% disagreement, volume = -4/3 pi a b c).
  // Reversing the last two indices of each face fixes winding once, globally, so
  // computeVertexNormals() below yields outward normals.
  for (let i = 0; i < indices.length; i += 3) {
    const t = indices[i + 1];
    indices[i + 1] = indices[i + 2];
    indices[i + 2] = t;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// Mirror geometry across X=0 for bilateral symmetry
export function mirrorGeometryX(geom) {
  const cloned = geom.clone();
  const pos = cloned.attributes.position;
  const count = pos.count;
  for (let i = 0; i < count; i++) {
    pos.setX(i, -pos.getX(i));
  }
  pos.needsUpdate = true;

  // Flip winding order of triangle indices to keep outward normals
  const index = cloned.getIndex();
  if (index) {
    const arr = index.array;
    for (let i = 0; i < arr.length; i += 3) {
      const temp = arr[i + 1];
      arr[i + 1] = arr[i + 2];
      arr[i + 2] = temp;
    }
    index.needsUpdate = true;
  }
  cloned.computeVertexNormals();
  return cloned;
}
