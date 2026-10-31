// Detailed Anatomical Spine Generator (C1-L5, Sacrum, Coccyx, Discs, Anchors)
import * as THREE from 'three';
import {
  smin,
  ssub,
  sdEllipsoid,
  sdRoundedBox,
  sdCapsule,
  sdTorus,
  sdTaperedCapsule,
  meshSDF
} from './sdf-mesh.js';
import { loftAlongCurve } from './loft.js';

export function generateSpineVertebra(cfg) {
  const { tag, name, region, y, z, bodyW, bodyD, bodyH } = cfg;

  // Build high-detail SDF function for the vertebra
  const vertebraSDF = (p) => {
    // Local coords relative to vertebra center [0, y, z]
    const lx = p[0];
    const ly = p[1] - y;
    const lz = p[2] - z;

    // 1. Special Case: C1 Atlas (Ring with lateral masses, anterior/posterior arch, NO body)
    if (tag === 'C1') {
      const ring = sdTorus([lx, lz + 0.005, ly], 0.015, 0.0045);
      // Lateral masses
      const latL = sdEllipsoid([lx - 0.014, ly, lz + 0.004], [0.006, 0.005, 0.007]);
      const latR = sdEllipsoid([lx + 0.014, ly, lz + 0.004], [0.006, 0.005, 0.007]);
      // Transverse processes
      const tpL = sdCapsule([lx, ly, lz], [0.012, 0, 0.002], [0.024, 0, 0], 0.0035);
      const tpR = sdCapsule([lx, ly, lz], [-0.012, 0, 0.002], [-0.024, 0, 0], 0.0035);
      // Posterior tubercle
      const postTub = sdEllipsoid([lx, ly, lz - 0.014], [0.004, 0.0035, 0.004]);

      let d = smin(ring, latL, 0.003);
      d = smin(d, latR, 0.003);
      d = smin(d, tpL, 0.003);
      d = smin(d, tpR, 0.003);
      d = smin(d, postTub, 0.003);
      return d;
    }

    // 2. Special Case: C2 Axis (Vertebral body + vertical Odontoid Process / Dens)
    if (tag === 'C2') {
      const body = sdRoundedBox([lx, ly, lz], [bodyW * 0.45, bodyH * 0.4, bodyD * 0.45], 0.003);
      // Odontoid process (Dens) projecting superiorly into C1
      const dens = sdCapsule([lx, ly, lz], [0, 0, 0.004], [0, 0.014, 0.005], 0.0042);
      // Bifid spinous process pointing posteroinferiorly
      const spL = sdCapsule([lx, ly, lz], [0.002, 0, -0.006], [0.005, -0.006, -0.022], 0.0035);
      const spR = sdCapsule([lx, ly, lz], [-0.002, 0, -0.006], [-0.005, -0.006, -0.022], 0.0035);
      // Transverse processes
      const tpL = sdCapsule([lx, ly, lz], [0.008, -0.002, -0.002], [0.018, -0.004, -0.004], 0.003);
      const tpR = sdCapsule([lx, ly, lz], [-0.008, -0.002, -0.002], [-0.018, -0.004, -0.004], 0.003);

      let d = smin(body, dens, 0.003);
      d = smin(d, spL, 0.003);
      d = smin(d, spR, 0.003);
      d = smin(d, tpL, 0.003);
      d = smin(d, tpR, 0.003);
      // Subtract vertebral foramen
      const foramen = sdEllipsoid([lx, ly, lz - 0.007], [0.007, 0.015, 0.007]);
      return ssub(foramen, d, 0.003);
    }

    // 3. General Vertebrae (C3-C7, T1-T12, L1-L5)
    // Kidney / heart shaped body
    const waist = Math.cos(ly * 150) * 0.0015;
    const bodyRadiusX = bodyW * 0.5 - waist;
    const bodyRadiusZ = bodyD * 0.5 - waist;
    const body = sdRoundedBox([lx, ly, lz], [bodyRadiusX, bodyH * 0.45, bodyRadiusZ], 0.004);

    // Pedicles connecting body to posterior arch
    const pedL = sdCapsule([lx, ly, lz], [bodyW * 0.32, 0, -bodyD * 0.1], [bodyW * 0.35, 0, -bodyD * 0.55], 0.004);
    const pedR = sdCapsule([lx, ly, lz], [-bodyW * 0.32, 0, -bodyD * 0.1], [-bodyW * 0.35, 0, -bodyD * 0.55], 0.004);

    // Laminae joining at midline
    const lamL = sdCapsule([lx, ly, lz], [bodyW * 0.35, 0, -bodyD * 0.55], [0, 0, -bodyD * 0.9], 0.0042);
    const lamR = sdCapsule([lx, ly, lz], [-bodyW * 0.35, 0, -bodyD * 0.55], [0, 0, -bodyD * 0.9], 0.0042);

    let d = smin(body, pedL, 0.003);
    d = smin(d, pedR, 0.003);
    d = smin(d, lamL, 0.003);
    d = smin(d, lamR, 0.003);

    // Spinous process geometry per region
    let sp;
    if (region === 'cervical') {
      if (tag === 'C7') {
        // Long, non-bifid vertebra prominens
        sp = sdTaperedCapsule([lx, ly, lz], [0, 0, -bodyD * 0.8], [0, -0.010, -bodyD * 0.8 - 0.024], 0.004, 0.003);
      } else {
        // Bifid cervical spinous
        const spA = sdCapsule([lx, ly, lz], [0.002, 0, -bodyD * 0.8], [0.004, -0.005, -bodyD * 0.8 - 0.016], 0.003);
        const spB = sdCapsule([lx, ly, lz], [-0.002, 0, -bodyD * 0.8], [-0.004, -0.005, -bodyD * 0.8 - 0.016], 0.003);
        sp = smin(spA, spB, 0.002);
      }
    } else if (region === 'thoracic') {
      // Long, steeply downward-sloping spine
      const slopeY = -0.018 - (parseInt(tag.slice(1)) || 5) * 0.001;
      const lengthZ = 0.026 + (parseInt(tag.slice(1)) || 5) * 0.0012;
      sp = sdTaperedCapsule([lx, ly, lz], [0, 0.002, -bodyD * 0.8], [0, slopeY, -bodyD * 0.8 - lengthZ], 0.0045, 0.003);
    } else {
      // Lumbar: broad, quadrangular, blunt, nearly horizontal
      sp = sdRoundedBox([lx, ly + 0.002, lz - (-bodyD * 0.8 - 0.016)], [0.0035, bodyH * 0.42, 0.014], 0.0025);
    }
    d = smin(d, sp, 0.003);

    // Transverse processes
    let tpL, tpR;
    if (region === 'cervical') {
      tpL = sdCapsule([lx, ly, lz], [bodyW * 0.3, 0, 0], [bodyW * 0.55, -0.002, -0.003], 0.003);
      tpR = sdCapsule([lx, ly, lz], [-bodyW * 0.3, 0, 0], [-bodyW * 0.55, -0.002, -0.003], 0.003);
    } else if (region === 'thoracic') {
      tpL = sdTaperedCapsule([lx, ly, lz], [bodyW * 0.25, 0.002, -bodyD * 0.4], [bodyW * 0.65, 0.006, -bodyD * 0.65], 0.0045, 0.0035);
      tpR = sdTaperedCapsule([lx, ly, lz], [-bodyW * 0.25, 0.002, -bodyD * 0.4], [-bodyW * 0.65, 0.006, -bodyD * 0.65], 0.0045, 0.0035);
    } else {
      // Lumbar: slender, horizontal/slightly upward
      tpL = sdTaperedCapsule([lx, ly, lz], [bodyW * 0.25, 0, -bodyD * 0.4], [bodyW * 0.72, 0.004, -bodyD * 0.55], 0.004, 0.0025);
      tpR = sdTaperedCapsule([lx, ly, lz], [-bodyW * 0.25, 0, -bodyD * 0.4], [-bodyW * 0.72, 0.004, -bodyD * 0.55], 0.004, 0.0025);
    }
    d = smin(d, tpL, 0.003);
    d = smin(d, tpR, 0.003);

    // Subtract vertebral foramen (triangular in cervical/lumbar, round in thoracic)
    const foramenRadiusX = region === 'thoracic' ? 0.008 : 0.010;
    const foramenRadiusZ = region === 'thoracic' ? 0.008 : 0.0085;
    const foramen = sdEllipsoid([lx, ly, lz - (-bodyD * 0.48)], [foramenRadiusX, 0.025, foramenRadiusZ]);

    return ssub(foramen, d, 0.003);
  };

  // Mesh on local bounding box
  const boundX = bodyW * 0.85 + 0.01;
  const boundY = bodyH * 0.75 + 0.012;
  const boundZ = bodyD * 1.5 + 0.025;

  const minB = [-boundX, y - boundY, z - boundZ];
  const maxB = [boundX, y + boundY, z + bodyD * 0.6 + 0.008];

  const geom = meshSDF(vertebraSDF, minB, maxB, [34, 30, 36]);
  const mesh = new THREE.Mesh(geom);
  mesh.name = name;
  return mesh;
}

// Generate Sacrum (5 fused segments, triangular wedge, foramina, ala, sacral canal)
export function generateSacrum(cfg) {
  const { name, y, z } = cfg;

  const sacrumSDF = (p) => {
    const lx = p[0];
    const ly = p[1] - y;
    const lz = p[2] - z;

    // Curved triangular wedge
    const wedgeT = (ly + 0.06) / 0.12; // 0 at bottom, 1 at promontory
    const wx = THREE.MathUtils.lerp(0.015, 0.052, THREE.MathUtils.clamp(wedgeT, 0, 1));
    const wz = THREE.MathUtils.lerp(0.012, 0.032, THREE.MathUtils.clamp(wedgeT, 0, 1));
    // Curvature: concave anteriorly
    const curveZ = -Math.sin(wedgeT * Math.PI) * 0.012;

    const body = sdRoundedBox([lx, ly, lz - curveZ], [wx, 0.058, wz], 0.006);

    // Sacral ala (wings) at superior lateral aspect
    const alaL = sdEllipsoid([lx - 0.040, ly - 0.035, lz + 0.005], [0.016, 0.018, 0.014]);
    const alaR = sdEllipsoid([lx + 0.040, ly - 0.035, lz + 0.005], [0.016, 0.018, 0.014]);

    // Median sacral crest (posterior ridge)
    const crest = sdCapsule([lx, ly, lz], [0, 0.045, -0.018], [0, -0.050, -0.010], 0.004);

    let d = smin(body, alaL, 0.005);
    d = smin(d, alaR, 0.005);
    d = smin(d, crest, 0.004);

    // 4 pairs of sacral foramina subtracted
    for (let i = 0; i < 4; i++) {
      const foramenY = 0.030 - i * 0.022;
      const foramenL = sdCapsule([lx, ly, lz], [0.016, foramenY, -0.03], [0.016, foramenY, 0.03], 0.0035);
      const foramenR = sdCapsule([lx, ly, lz], [-0.016, foramenY, -0.03], [-0.016, foramenY, 0.03], 0.0035);
      d = ssub(foramenL, d, 0.002);
      d = ssub(foramenR, d, 0.002);
    }

    return d;
  };

  const minB = [-0.065, y - 0.070, z - 0.035];
  const maxB = [0.065, y + 0.065, z + 0.035];

  const geom = meshSDF(sacrumSDF, minB, maxB, [38, 42, 32]);
  const mesh = new THREE.Mesh(geom);
  mesh.name = name;
  return mesh;
}

// Generate Coccyx (4 fused tapering segments)
export function generateCoccyx(cfg) {
  const { name, y, z } = cfg;

  const coccyxSDF = (p) => {
    const lx = p[0];
    const ly = p[1] - y;
    const lz = p[2] - z;

    // Small curved tapering triangular tail
    const c1 = sdEllipsoid([lx, ly - 0.010, lz + 0.002], [0.011, 0.006, 0.008]);
    const c2 = sdEllipsoid([lx, ly - 0.001, lz], [0.009, 0.005, 0.007]);
    const c3 = sdEllipsoid([lx, ly + 0.007, lz - 0.002], [0.007, 0.004, 0.006]);
    const c4 = sdEllipsoid([lx, ly + 0.013, lz - 0.003], [0.005, 0.004, 0.005]);

    let d = smin(c1, c2, 0.003);
    d = smin(d, c3, 0.003);
    d = smin(d, c4, 0.003);
    return d;
  };

  const minB = [-0.020, y - 0.022, z - 0.015];
  const maxB = [0.020, y + 0.022, z + 0.015];

  const geom = meshSDF(coccyxSDF, minB, maxB, [24, 28, 22]);
  const mesh = new THREE.Mesh(geom);
  mesh.name = name;
  return mesh;
}

// Generate Intervertebral Disc
export function generateIntervertebralDisc(upperVertebra, lowerVertebra, discName) {
  const midY = (upperVertebra.y + lowerVertebra.y) * 0.5;
  const midZ = (upperVertebra.z + lowerVertebra.z) * 0.5;
  const discH = Math.max(0.003, Math.abs(upperVertebra.y - lowerVertebra.y) - upperVertebra.bodyH * 0.45 - lowerVertebra.bodyH * 0.45);
  const rx = (upperVertebra.bodyW + lowerVertebra.bodyW) * 0.25;
  const rz = (upperVertebra.bodyD + lowerVertebra.bodyD) * 0.25;

  // Loft disc as curved cylinder along short segment
  const points = [
    [0, midY - discH * 0.5, midZ],
    [0, midY, midZ],
    [0, midY + discH * 0.5, midZ]
  ];

  const profile = (t, angle) => {
    // Slight bulge at middle t=0.5
    const bulge = 1.0 + Math.sin(t * Math.PI) * 0.15;
    // Slight kidney indent on posterior side (angle near PI)
    const kidneyIndent = 1.0 - Math.max(0, -Math.cos(angle)) * 0.12;
    return [rx * bulge, rz * bulge * kidneyIndent];
  };

  const geom = loftAlongCurve(points, profile, 20, true);
  const mesh = new THREE.Mesh(geom);
  mesh.name = discName;
  return mesh;
}
