// Cross-sectional 3D Curve Lofting for Bones (Ribs, Clavicle, Shafts, Phalanges, Discs)
import * as THREE from 'three';

/**
 * Loft a cross-section shape along a 3D spline curve.
 * @param {Array<[number, number, number]>} points Centerline 3D points
 * @param {Function} profileFunc (t, angle) => [radiusX, radiusY]
 * @param {number} radialSegments Number of points around circumference
 * @param {boolean} closedCaps Whether to close both ends with triangle fans
 */
export function loftAlongCurve(points, profileFunc, radialSegments = 16, closedCaps = true) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const numSteps = Math.max(16, points.length * 4);
  const frames = curve.computeFrenetFrames(numSteps, false);

  const vertices = [];
  const normals = [];
  const indices = [];

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const center = curve.getPointAt(t);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    for (let j = 0; j < radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const [rx, ry] = profileFunc(t, angle);

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Radial displacement in the normal/binormal cross section
      const offsetX = normal.x * (cosA * rx) + binormal.x * (sinA * ry);
      const offsetY = normal.y * (cosA * rx) + binormal.y * (sinA * ry);
      const offsetZ = normal.z * (cosA * rx) + binormal.z * (sinA * ry);

      const vx = center.x + offsetX;
      const vy = center.y + offsetY;
      const vz = center.z + offsetZ;

      vertices.push(vx, vy, vz);

      // Initial outward normal approximation
      const nlen = Math.hypot(offsetX, offsetY, offsetZ) || 1;
      normals.push(offsetX / nlen, offsetY / nlen, offsetZ / nlen);
    }
  }

  // Quads connecting adjacent rings
  for (let i = 0; i < numSteps; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const nextJ = (j + 1) % radialSegments;
      const v00 = i * radialSegments + j;
      const v10 = (i + 1) * radialSegments + j;
      const v01 = i * radialSegments + nextJ;
      const v11 = (i + 1) * radialSegments + nextJ;

      indices.push(v00, v10, v01);
      indices.push(v01, v10, v11);
    }
  }

  // End caps
  if (closedCaps) {
    const startCenter = curve.getPointAt(0);
    const endCenter = curve.getPointAt(1);

    const startCapIdx = vertices.length / 3;
    vertices.push(startCenter.x, startCenter.y, startCenter.z);
    const tan0 = frames.tangents[0];
    normals.push(-tan0.x, -tan0.y, -tan0.z);

    const endCapIdx = vertices.length / 3;
    vertices.push(endCenter.x, endCenter.y, endCenter.z);
    const tan1 = frames.tangents[numSteps];
    normals.push(tan1.x, tan1.y, tan1.z);

    // Start ring cap
    for (let j = 0; j < radialSegments; j++) {
      const nextJ = (j + 1) % radialSegments;
      indices.push(startCapIdx, nextJ, j);
    }

    // End ring cap
    const baseEnd = numSteps * radialSegments;
    for (let j = 0; j < radialSegments; j++) {
      const nextJ = (j + 1) % radialSegments;
      indices.push(endCapIdx, baseEnd + j, baseEnd + nextJ);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

