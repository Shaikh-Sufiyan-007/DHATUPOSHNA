// Shoulder Girdle, Arms, and Hands Generator (Clavicle, Scapula, Humerus, Radius, Ulna, Carpals, Metacarpals, Phalanges)
import * as THREE from 'three';
import {
  smin,
  ssub,
  sdSphere,
  sdEllipsoid,
  sdRoundedBox,
  sdCapsule,
  sdTaperedCapsule,
  meshSDF,
  mirrorGeometryX
} from './sdf-mesh.js';
import { loftAlongCurve } from './loft.js';

// ---------------------------------------------------------------------------
// CLAVICLE (S-shaped curve: medial convex anterior, lateral concave anterior)
// ---------------------------------------------------------------------------
export function generateClavicle() {
  const points = [
    [0.024, 1.380, 0.125], // sternal end
    [0.065, 1.390, 0.138], // anterior convexity
    [0.120, 1.395, 0.108], // posterior concavity
    [0.165, 1.405, 0.082]  // acromial end
  ];

  const profile = (t) => {
    // Sternal and acromial ends are flared
    const flare = 1.0 + 0.35 * Math.cos((t - 0.5) * Math.PI * 2);
    return [0.0075 * flare, 0.0060 * flare];
  };

  const geomL = loftAlongCurve(points, profile, 16, true);
  const meshL = new THREE.Mesh(geomL);
  meshL.name = 'clavicle_L';

  const geomR = mirrorGeometryX(geomL);
  const meshR = new THREE.Mesh(geomR);
  meshR.name = 'clavicle_R';

  return { clavicleL: meshL, clavicleR: meshR };
}

// ---------------------------------------------------------------------------
// SCAPULA (Triangular blade, spine, acromion, coracoid, glenoid cavity)
// ---------------------------------------------------------------------------
export function generateScapula() {
  const scapulaSDF = (p) => {
    // Local coords relative to left scapula center (~ [0.120, 1.330, -0.065])
    const lx = p[0] - 0.120;
    const ly = p[1] - 1.330;
    const lz = p[2] - (-0.065);

    // 1. Thin triangular blade (superior, medial, lateral borders)
    const t = (ly + 0.075) / 0.150; // 0 inferior angle, 1 superior border
    const w = THREE.MathUtils.lerp(0.012, 0.055, THREE.MathUtils.clamp(t, 0, 1));
    const blade = sdRoundedBox([lx, ly, lz], [w, 0.075, 0.004], 0.003);

    // 2. Spine of Scapula: prominent posterior transverse ridge
    const spine = sdTaperedCapsule([lx, ly, lz], [-0.040, 0.035, -0.004], [0.045, 0.065, -0.015], 0.004, 0.008);

    // 3. Acromion: flattened anterior expansion articulating with clavicle
    const acromion = sdRoundedBox([lx - 0.052, ly - 0.072, lz - (-0.005)], [0.012, 0.008, 0.022], 0.004);

    // 4. Coracoid process: hook-like anterior projection
    const coracoid = sdCapsule([lx, ly, lz], [0.035, 0.055, 0.005], [0.030, 0.060, 0.035], 0.005);

    // 5. Glenoid cavity (articular cup for humerus)
    const glenoidMass = sdEllipsoid([lx - 0.055, ly - 0.045, lz - 0.018], [0.014, 0.020, 0.016]);

    let d = smin(blade, spine, 0.006);
    d = smin(d, acromion, 0.006);
    d = smin(d, coracoid, 0.005);
    d = smin(d, glenoidMass, 0.006);

    // Subtle shallow cup for glenoid
    const cup = sdSphere([lx - 0.068, ly - 0.045, lz - 0.018], 0.016);
    d = ssub(cup, d, 0.002);

    return d;
  };

  const minB = [0.050, 1.230, -0.110];
  const maxB = [0.190, 1.425, 0.005];

  const geomL = meshSDF(scapulaSDF, minB, maxB, [36, 46, 32]);
  const meshL = new THREE.Mesh(geomL);
  meshL.name = 'scapula_L';

  const geomR = mirrorGeometryX(geomL);
  const meshR = new THREE.Mesh(geomR);
  meshR.name = 'scapula_R';

  return { scapulaL: meshL, scapulaR: meshR };
}

// ---------------------------------------------------------------------------
// HUMERUS (Head, tubercles, bicipital groove, shaft, epicondyles, trochlea)
// ---------------------------------------------------------------------------
export function generateHumerus() {
  const humerusSDF = (p) => {
    // Left humerus: shoulder at ~[0.185, 1.385, 0.040] -> elbow at ~[0.235, 1.085, 0.015] (abducted ~16°)
    const lx = p[0];
    const ly = p[1];
    const lz = p[2];

    // 1. Head (smooth hemispherical medial surface facing glenoid)
    const head = sdSphere([lx - 0.176, ly - 1.382, lz - 0.042], 0.021);

    // 2. Greater and Lesser Tubercles
    const gt = sdEllipsoid([lx - 0.196, ly - 1.386, lz - 0.035], [0.012, 0.015, 0.014]);
    const lt = sdEllipsoid([lx - 0.182, ly - 1.370, lz - 0.054], [0.008, 0.010, 0.008]);

    // 3. Shaft (cylindrical, transitioning to triangular distally, abducted ~16°)
    const shaft = sdCapsule([lx, ly, lz], [0.188, 1.365, 0.040], [0.235, 1.100, 0.015], 0.0125);

    // 4. Distal Epicondyles & Trochlea/Capitulum
    const medEpicondyle = sdSphere([lx - 0.222, ly - 1.082, lz - 0.012], 0.010);
    const latEpicondyle = sdSphere([lx - 0.248, ly - 1.084, lz - 0.014], 0.009);
    const condyles = sdCapsule([lx, ly, lz], [0.224, 1.080, 0.012], [0.246, 1.080, 0.015], 0.012);

    // Olecranon fossa (posterior depression above trochlea)
    const fossa = sdEllipsoid([lx - 0.235, ly - 1.092, lz + 0.002], [0.008, 0.007, 0.006]);

    let d = smin(head, gt, 0.006);
    d = smin(d, lt, 0.005);
    d = smin(d, shaft, 0.007);
    d = smin(d, medEpicondyle, 0.005);
    d = smin(d, latEpicondyle, 0.005);
    d = smin(d, condyles, 0.006);
    d = ssub(fossa, d, 0.003);

    return d;
  };

  const minB = [0.150, 1.065, -0.015];
  const maxB = [0.265, 1.415, 0.075];

  const geomL = meshSDF(humerusSDF, minB, maxB, [34, 62, 30]);
  const meshL = new THREE.Mesh(geomL);
  meshL.name = 'humerus_L';

  const geomR = mirrorGeometryX(geomL);
  const meshR = new THREE.Mesh(geomR);
  meshR.name = 'humerus_R';

  return { humerusL: meshL, humerusR: meshR };
}

// ---------------------------------------------------------------------------
// RADIUS & ULNA (Forearm, slightly supinated)
// ---------------------------------------------------------------------------
export function generateRadiusAndUlna() {
  // Ulna (Medial forearm bone): olecranon at elbow -> head at wrist
  const ulnaSDF = (p) => {
    const lx = p[0];
    const ly = p[1];
    const lz = p[2];

    // 1. Olecranon process (elbow beak pointing superiorly/posteriorly)
    const olecranon = sdRoundedBox([lx - 0.232, ly - 1.082, lz - 0.002], [0.012, 0.016, 0.015], 0.004);
    // 2. Coronoid process (anterior projection creating trochlear notch)
    const coronoid = sdEllipsoid([lx - 0.232, ly - 1.068, lz - 0.018], [0.009, 0.008, 0.010]);

    // 3. Tapering triangular shaft
    const shaft = sdTaperedCapsule([lx, ly, lz], [0.232, 1.065, 0.010], [0.245, 0.840, 0.012], 0.011, 0.0065);

    // 4. Distal head and styloid process
    const head = sdSphere([lx - 0.245, ly - 0.835, lz - 0.012], 0.0075);

    let d = smin(olecranon, coronoid, 0.004);
    d = smin(d, shaft, 0.006);
    d = smin(d, head, 0.004);
    return d;
  };

  const minB_u = [0.215, 0.825, -0.020];
  const maxB_u = [0.260, 1.100, 0.030];
  const geomUlnaL = meshSDF(ulnaSDF, minB_u, maxB_u, [26, 60, 26]);
  const meshUlnaL = new THREE.Mesh(geomUlnaL);
  meshUlnaL.name = 'ulna_L';

  const geomUlnaR = mirrorGeometryX(geomUlnaL);
  const meshUlnaR = new THREE.Mesh(geomUlnaR);
  meshUlnaR.name = 'ulna_R';

  // Radius (Lateral forearm bone): disc head at elbow -> flared distal end with styloid process
  const radiusSDF = (p) => {
    const lx = p[0];
    const ly = p[1];
    const lz = p[2];

    // 1. Disc-shaped head articulates with capitulum of humerus
    const head = sdEllipsoid([lx - 0.252, ly - 1.074, lz - 0.015], [0.009, 0.006, 0.009]);
    // 2. Radial tuberosity
    const tuberosity = sdEllipsoid([lx - 0.248, ly - 1.055, lz - 0.020], [0.007, 0.008, 0.007]);

    // 3. Bowed shaft
    const shaft = sdTaperedCapsule([lx, ly, lz], [0.252, 1.060, 0.015], [0.268, 0.842, 0.012], 0.0075, 0.012);

    // 4. Flared distal end with styloid process
    const distal = sdRoundedBox([lx - 0.268, ly - 0.835, lz - 0.012], [0.013, 0.009, 0.010], 0.0035);

    let d = smin(head, tuberosity, 0.004);
    d = smin(d, shaft, 0.006);
    d = smin(d, distal, 0.005);
    return d;
  };

  const minB_r = [0.235, 0.825, -0.010];
  const maxB_r = [0.285, 1.090, 0.035];
  const geomRadL = meshSDF(radiusSDF, minB_r, maxB_r, [28, 60, 26]);
  const meshRadL = new THREE.Mesh(geomRadL);
  meshRadL.name = 'radius_L';

  const geomRadR = mirrorGeometryX(geomRadL);
  const meshRadR = new THREE.Mesh(geomRadR);
  meshRadR.name = 'radius_R';

  return { ulnaL: meshUlnaL, ulnaR: meshUlnaR, radiusL: meshRadL, radiusR: meshRadR };
}

// ---------------------------------------------------------------------------
// HAND BONES (8 Carpals, 5 Metacarpals, 14 Phalanges per hand)
// ---------------------------------------------------------------------------
export function generateHandBones() {
  const handMeshes = [];

  // 8 Carpals (Proximal row: scaphoid, lunate, triquetrum, pisiform; Distal row: trapezium, trapezoid, capitate, hamate)
  const carpalDefs = [
    { name: 'scaphoid', pos: [0.266, 0.825, 0.012], radii: [0.007, 0.009, 0.006] },
    { name: 'lunate', pos: [0.254, 0.826, 0.012], radii: [0.006, 0.007, 0.006] },
    { name: 'triquetrum', pos: [0.244, 0.824, 0.012], radii: [0.0055, 0.006, 0.0055] },
    { name: 'pisiform', pos: [0.242, 0.821, 0.019], radii: [0.004, 0.004, 0.004] },
    { name: 'trapezium', pos: [0.272, 0.812, 0.014], radii: [0.006, 0.007, 0.006] },
    { name: 'trapezoid', pos: [0.262, 0.813, 0.012], radii: [0.005, 0.006, 0.0055] },
    { name: 'capitate', pos: [0.253, 0.811, 0.012], radii: [0.0065, 0.008, 0.0065] },
    { name: 'hamate', pos: [0.243, 0.812, 0.012], radii: [0.006, 0.0075, 0.006] }
  ];

  for (const def of carpalDefs) {
    const sdf = (p) => sdEllipsoid([p[0] - def.pos[0], p[1] - def.pos[1], p[2] - def.pos[2]], def.radii);
    const minB = [def.pos[0] - def.radii[0] * 1.3, def.pos[1] - def.radii[1] * 1.3, def.pos[2] - def.radii[2] * 1.3];
    const maxB = [def.pos[0] + def.radii[0] * 1.3, def.pos[1] + def.radii[1] * 1.3, def.pos[2] + def.radii[2] * 1.3];

    const geomL = meshSDF(sdf, minB, maxB, [16, 16, 16]);
    const meshL = new THREE.Mesh(geomL);
    meshL.name = `${def.name}_L`;
    handMeshes.push(meshL);

    const geomR = mirrorGeometryX(geomL);
    const meshR = new THREE.Mesh(geomR);
    meshR.name = `${def.name}_R`;
    handMeshes.push(meshR);
  }

  // 5 Metacarpals & 14 Phalanges per hand
  for (let f = 1; f <= 5; f++) {
    // Metacarpal 1 (thumb) is abducted anterolaterally
    let startPoint, endPoint;
    if (f === 1) {
      startPoint = [0.274, 0.806, 0.015];
      endPoint = [0.292, 0.772, 0.026];
    } else {
      const x = 0.265 - (f - 2) * 0.008;
      startPoint = [x, 0.805, 0.012];
      endPoint = [x + (f - 3) * 0.003, 0.745 - Math.sin((f - 1) * 0.6) * 0.008, 0.012];
    }

    const mPoints = [startPoint, endPoint];
    const mRadius = f === 1 ? 0.0055 : (f === 3 ? 0.0050 : 0.0042);
    const mProfile = (t) => [mRadius * (1.1 - 0.2 * Math.sin(t * Math.PI)), mRadius];

    const mGeomL = loftAlongCurve(mPoints, mProfile, 12, true);
    const mMeshL = new THREE.Mesh(mGeomL);
    mMeshL.name = `metacarpal_${f}_L`;
    handMeshes.push(mMeshL);

    const mGeomR = mirrorGeometryX(mGeomL);
    const mMeshR = new THREE.Mesh(mGeomR);
    mMeshR.name = `metacarpal_${f}_R`;
    handMeshes.push(mMeshR);

    // Phalanges (Thumb has 2: prox, dist; Fingers 2-5 have 3: prox, mid, dist)
    const phTypes = f === 1 ? ['prox', 'dist'] : ['prox', 'mid', 'dist'];
    let curPoint = [...endPoint];

    for (let pIdx = 0; pIdx < phTypes.length; pIdx++) {
      const pType = phTypes[pIdx];
      const pLen = f === 1 ? 0.018 : (0.024 - pIdx * 0.006);
      let nextPoint;
      if (f === 1) {
        nextPoint = [curPoint[0] + 0.008, curPoint[1] - pLen, curPoint[2] + 0.004];
      } else {
        // Relaxed slight palmar curve (toward +Z)
        nextPoint = [curPoint[0], curPoint[1] - pLen, curPoint[2] + 0.002 * (pIdx + 1)];
      }

      const phPoints = [curPoint, nextPoint];
      const phRadius = (f === 1 ? 0.0046 : 0.0036) * (1.0 - pIdx * 0.15);
      const phProfile = () => [phRadius, phRadius * 0.85];

      const phGeomL = loftAlongCurve(phPoints, phProfile, 12, true);
      const phMeshL = new THREE.Mesh(phGeomL);
      phMeshL.name = `phalanx_${f}_${pType}_L`;
      handMeshes.push(phMeshL);

      const phGeomR = mirrorGeometryX(phGeomL);
      const phMeshR = new THREE.Mesh(phGeomR);
      phMeshR.name = `phalanx_${f}_${pType}_R`;
      handMeshes.push(phMeshR);

      curPoint = nextPoint;
    }
  }

  return handMeshes;
}
