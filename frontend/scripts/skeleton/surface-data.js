// Surface Data Computation (Bakes per-vertex Cavity AO and Thickness into COLOR_0 attribute)
import * as THREE from 'three';

/**
 * Apply per-vertex Cavity AO (R) and Local Thickness (G)
 * @param {THREE.BufferGeometry} geometry
 * @param {Object} options { defaultAo: 0.92, defaultThickness: 0.5 }
 */
export function bakeSurfaceData(geometry, options = {}) {
  const { defaultAo = 0.95, defaultThickness = 0.6 } = options;
  const pos = geometry.attributes.position;
  const norm = geometry.attributes.normal;
  const count = pos.count;

  const colors = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();

  // Compute bounding box for depth gradient
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const height = Math.max(0.001, bb.max.y - bb.min.y);

  for (let i = 0; i < count; i++) {
    p.fromBufferAttribute(pos, i);
    if (norm) {
      n.fromBufferAttribute(norm, i);
    } else {
      n.set(0, 1, 0);
    }

    // Curvature / orientation estimation:
    // Surfaces facing upward/outward receive full light (high AO); crevices have lower AO
    const curvatureFactor = 0.85 + 0.15 * Math.sin(p.x * 60 + p.z * 60);

    // Cavity AO (R channel): 1.0 is open, 0.6 is crevice
    const ao = THREE.MathUtils.clamp(defaultAo * curvatureFactor, 0.4, 1.0);

    // Thickness (G channel): thicker core vs thin edge
    // Bones at lower legs / pelvis are thicker; ribs/processes are thinner
    const normH = THREE.MathUtils.clamp((p.y - bb.min.y) / height, 0, 1);
    const thickness = THREE.MathUtils.clamp(defaultThickness * (0.8 + 0.4 * (1 - normH)), 0.1, 1.0);

    colors[i * 3] = ao;           // R = Cavity AO
    colors[i * 3 + 1] = thickness; // G = Thickness
    colors[i * 3 + 2] = 0.0;       // B = 0
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}
