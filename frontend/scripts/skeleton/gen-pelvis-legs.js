// Pelvis and Lower Limbs Generator (Hip Bone, Femur, Patella, Tibia, Fibula, Tarsals, Metatarsals, Phalanges)
import * as THREE from 'three';
import {
  smin,
  ssub,
  sdSphere,
  sdBox,
  sdEllipsoid,
  sdRoundedBox,
  sdCapsule,
  sdTaperedCapsule,
  meshSDF,
  mirrorGeometryX
} from './sdf-mesh.js';
import { loftAlongCurve } from './loft.js';

// ---------------------------------------------------------------------------
// HIP BONE (Ilium, Ischium, Pubis fused, Acetabulum, Obturator Foramen)
// ---------------------------------------------------------------------------
export function generateHipBone() {
  const hipSDF = (p) => {
    // Local coords relative to left hip center (~ [0.080, 0.880, 0.010])
    const lx = p[0] - 0.080;
    const ly = p[1] - 0.880;
    const lz = p[2] - 0.010;

    // 1. Ilium wing: curved fan-like blade with thickened iliac crest
    // Curvature: concave anteriorly (iliac fossa), convex externally
    const iliacCurve = Math.sin((lx + 0.02) * 15) * 0.008;
    const iliumBlade = sdRoundedBox([lx, ly - 0.070, lz - iliacCurve], [0.045, 0.055, 0.0045], 0.0035);
    // Thickened iliac crest along the top
    const crest = sdCapsule([lx, ly, lz], [-0.038, 0.110, -0.015], [0.042, 0.125, 0.012], 0.006);

    // 2. Ischium: body + ischial tuberosity (posteroinferior weight-bearing)
    const ischium = sdTaperedCapsule([lx, ly, lz], [0.010, -0.020, -0.015], [0.005, -0.095, -0.025], 0.012, 0.016);

    // 3. Pubis: body + superior and inferior pubic rami reaching anterior midline
    const pubicRamusSup = sdTaperedCapsule([lx, ly, lz], [0.005, -0.020, 0.010], [-0.065, -0.060, 0.042], 0.008, 0.0065);
    const pubicRamusInf = sdTaperedCapsule([lx, ly, lz], [0.005, -0.090, -0.020], [-0.065, -0.065, 0.040], 0.007, 0.0065);
    const pubicBody = sdRoundedBox([lx + 0.068, ly + 0.062, lz - 0.042], [0.008, 0.018, 0.007], 0.003);

    // 4. Acetabulum: hemispherical outer mass at hip joint center
    const acetabulumOuter = sdSphere([lx - 0.012, ly + 0.018, lz + 0.012], 0.028);

    let d = smin(iliumBlade, crest, 0.006);
    d = smin(d, ischium, 0.008);
    d = smin(d, pubicRamusSup, 0.006);
    d = smin(d, pubicRamusInf, 0.006);
    d = smin(d, pubicBody, 0.005);
    d = smin(d, acetabulumOuter, 0.008);

    // Subtract Acetabular cup (socket facing laterally, anteriorly, inferiorly)
    const socket = sdSphere([lx - 0.022, ly + 0.015, lz + 0.018], 0.022);
    d = ssub(socket, d, 0.003);

    // Subtract Obturator Foramen (large opening between ischium and pubis)
    const obturator = sdCapsule([lx, ly, lz], [-0.030, -0.055, 0.008], [-0.020, -0.075, -0.005], 0.014);
    d = ssub(obturator, d, 0.004);

    // Subtract Greater Sciatic Notch (deep posterior notch below ilium)
    const sciaticNotch = sdCapsule([lx, ly, lz], [-0.005, 0.010, -0.040], [-0.005, -0.035, -0.045], 0.016);
    d = ssub(sciaticNotch, d, 0.004);

    return d;
  };

  const minB = [0.005, 0.770, -0.070];
  const maxB = [0.155, 1.015, 0.075];

  const geomL = meshSDF(hipSDF, minB, maxB, [38, 48, 36]);
  const meshL = new THREE.Mesh(geomL);
  meshL.name = 'hip_bone_L';

  const geomR = mirrorGeometryX(geomL);
  const meshR = new THREE.Mesh(geomR);
  meshR.name = 'hip_bone_R';

  return { hipL: meshL, hipR: meshR };
}

// ---------------------------------------------------------------------------
// FEMUR (Spherical head, angled neck, trochanters, bowed shaft, condyles)
// ---------------------------------------------------------------------------
export function generateFemur() {
  const femurSDF = (p) => {
    // Left femur: head center at [0.092, 0.895, 0.028] -> condyles at [0.088, 0.490, 0.015]
    const lx = p[0];
    const ly = p[1];
    const lz = p[2];

    // 1. Head (spherical ~47mm diameter) articulating in acetabulum
    const head = sdSphere([lx - 0.092, ly - 0.895, lz - 0.028], 0.0235);

    // 2. Neck (~125° angle connecting head to greater trochanter)
    const neck = sdTaperedCapsule([lx, ly, lz], [0.092, 0.895, 0.028], [0.125, 0.875, 0.015], 0.016, 0.018);

    // 3. Greater Trochanter (prominent lateral mass)
    const gt = sdRoundedBox([lx - 0.134, ly - 0.865, lz - 0.012], [0.014, 0.022, 0.016], 0.006);

    // 4. Lesser Trochanter (posteromedial projection)
    const lt = sdEllipsoid([lx - 0.108, ly - 0.840, lz - 0.002], [0.009, 0.010, 0.008]);

    // 5. Bowed shaft (anterior convexity) with posterior ridge (linea aspera)
    const shaft = sdCapsule([lx, ly, lz], [0.120, 0.845, 0.015], [0.095, 0.530, 0.015], 0.0145);

    // 6. Distal Condyles (Medial & Lateral condyles + Intercondylar Notch)
    const condyleMed = sdEllipsoid([lx - 0.078, ly - 0.505, lz - 0.008], [0.016, 0.018, 0.022]);
    const condyleLat = sdEllipsoid([lx - 0.112, ly - 0.505, lz - 0.008], [0.015, 0.018, 0.022]);
    const condyles = smin(condyleMed, condyleLat, 0.006);

    // Intercondylar fossa notch (subtracted posterior space)
    const notch = sdBox([lx - 0.095, ly - 0.495, lz + 0.018], [0.008, 0.020, 0.012]);

    let d = smin(head, neck, 0.006);
    d = smin(d, gt, 0.008);
    d = smin(d, lt, 0.006);
    d = smin(d, shaft, 0.008);
    d = smin(d, condyles, 0.008);
    d = ssub(notch, d, 0.004);

    return d;
  };

  const minB = [0.055, 0.475, -0.035];
  const maxB = [0.160, 0.925, 0.065];

  const geomL = meshSDF(femurSDF, minB, maxB, [36, 68, 36]);
  const meshL = new THREE.Mesh(geomL);
  meshL.name = 'femur_L';

  const geomR = mirrorGeometryX(geomL);
  const meshR = new THREE.Mesh(geomR);
  meshR.name = 'femur_R';

  return { femurL: meshL, femurR: meshR };
}

// ---------------------------------------------------------------------------
// PATELLA (Triangular sesamoid bone with rounded apex pointing downward)
// ---------------------------------------------------------------------------
export function generatePatella() {
  const y = 0.510;
  const z = 0.042;
  const x = 0.095;

  const patellaSDF = (p) => {
    const lx = p[0] - x;
    const ly = p[1] - y;
    const lz = p[2] - z;

    const t = (ly + 0.020) / 0.040;
    const w = THREE.MathUtils.lerp(0.008, 0.022, THREE.MathUtils.clamp(t, 0, 1));
    return sdRoundedBox([lx, ly, lz], [w, 0.020, 0.009], 0.004);
  };

  const minB = [x - 0.030, y - 0.025, z - 0.015];
  const maxB = [x + 0.030, y + 0.025, z + 0.015];

  const geomL = meshSDF(patellaSDF, minB, maxB, [24, 28, 20]);
  const meshL = new THREE.Mesh(geomL);
  meshL.name = 'patella_L';

  const geomR = mirrorGeometryX(geomL);
  const meshR = new THREE.Mesh(geomR);
  meshR.name = 'patella_R';

  return { patellaL: meshL, patellaR: meshR };
}

// ---------------------------------------------------------------------------
// TIBIA & FIBULA
// ---------------------------------------------------------------------------
export function generateTibiaAndFibula() {
  // Tibia: plateaus at ~0.490 -> medial malleolus at ~0.075
  const tibiaSDF = (p) => {
    const lx = p[0];
    const ly = p[1];
    const lz = p[2];

    // Condylar plateaus
    const plateaus = sdRoundedBox([lx - 0.092, ly - 0.482, lz - 0.012], [0.032, 0.014, 0.024], 0.005);
    // Tibial tuberosity (anterior projection below plateaus)
    const tuberosity = sdEllipsoid([lx - 0.092, ly - 0.455, lz - 0.030], [0.012, 0.014, 0.009]);

    // Triangular shaft with sharp anterior border/crest
    const shaft = sdTaperedCapsule([lx, ly, lz], [0.092, 0.465, 0.012], [0.080, 0.090, 0.012], 0.016, 0.013);

    // Medial Malleolus at ankle
    const malleolus = sdRoundedBox([lx - 0.068, ly - 0.070, lz - 0.010], [0.009, 0.018, 0.014], 0.004);

    let d = smin(plateaus, tuberosity, 0.006);
    d = smin(d, shaft, 0.008);
    d = smin(d, malleolus, 0.006);
    return d;
  };

  const minB_t = [0.050, 0.055, -0.045];
  const maxB_t = [0.135, 0.505, 0.045];
  const geomTibiaL = meshSDF(tibiaSDF, minB_t, maxB_t, [34, 66, 32]);
  const meshTibiaL = new THREE.Mesh(geomTibiaL);
  meshTibiaL.name = 'tibia_L';

  const geomTibiaR = mirrorGeometryX(geomTibiaL);
  const meshTibiaR = new THREE.Mesh(geomTibiaR);
  meshTibiaR.name = 'tibia_R';

  // Fibula: slender lateral bone
  const fibulaSDF = (p) => {
    const lx = p[0];
    const ly = p[1];
    const lz = p[2];

    // Head articulates with lateral tibial condyle
    const head = sdEllipsoid([lx - 0.128, ly - 0.470, lz - 0.008], [0.010, 0.012, 0.011]);
    // Slender shaft
    const shaft = sdCapsule([lx, ly, lz], [0.128, 0.460, 0.008], [0.108, 0.085, 0.010], 0.0065);
    // Lateral Malleolus (extends lower than medial malleolus)
    const malleolus = sdRoundedBox([lx - 0.106, ly - 0.062, lz - 0.010], [0.008, 0.016, 0.012], 0.0035);

    let d = smin(head, shaft, 0.005);
    d = smin(d, malleolus, 0.005);
    return d;
  };

  const minB_f = [0.090, 0.050, -0.025];
  const maxB_f = [0.145, 0.490, 0.025];
  const geomFibulaL = meshSDF(fibulaSDF, minB_f, maxB_f, [26, 62, 24]);
  const meshFibulaL = new THREE.Mesh(geomFibulaL);
  meshFibulaL.name = 'fibula_L';

  const geomFibulaR = mirrorGeometryX(geomFibulaL);
  const meshFibulaR = new THREE.Mesh(geomFibulaR);
  meshFibulaR.name = 'fibula_R';

  return { tibiaL: meshTibiaL, tibiaR: meshTibiaR, fibulaL: meshFibulaL, fibulaR: meshFibulaR };
}

// ---------------------------------------------------------------------------
// FOOT BONES (7 Tarsals, 5 Metatarsals, 14 Phalanges per foot)
// ---------------------------------------------------------------------------
export function generateFootBones() {
  const footMeshes = [];

  // Tarsals data: [name, [x, y, z], [rx, ry, rz]]
  const tarsalDefs = [
    { name: 'talus', pos: [0.085, 0.065, 0.015], radii: [0.018, 0.014, 0.022] }, // trochlear dome
    { name: 'calcaneus', pos: [0.085, 0.038, -0.032], radii: [0.018, 0.024, 0.040] }, // heel bone
    { name: 'navicular', pos: [0.075, 0.050, 0.042], radii: [0.016, 0.012, 0.012] },
    { name: 'cuboid', pos: [0.104, 0.042, 0.028], radii: [0.014, 0.012, 0.016] },
    { name: 'cuneiform_1', pos: [0.065, 0.044, 0.062], radii: [0.010, 0.011, 0.012] }, // medial
    { name: 'cuneiform_2', pos: [0.078, 0.044, 0.060], radii: [0.009, 0.010, 0.011] }, // intermediate
    { name: 'cuneiform_3', pos: [0.090, 0.044, 0.058], radii: [0.009, 0.010, 0.012] }  // lateral
  ];

  for (const def of tarsalDefs) {
    const sdf = (p) => sdEllipsoid([p[0] - def.pos[0], p[1] - def.pos[1], p[2] - def.pos[2]], def.radii);
    const minB = [def.pos[0] - def.radii[0] * 1.3, def.pos[1] - def.radii[1] * 1.3, def.pos[2] - def.radii[2] * 1.3];
    const maxB = [def.pos[0] + def.radii[0] * 1.3, def.pos[1] + def.radii[1] * 1.3, def.pos[2] + def.radii[2] * 1.3];

    const geomL = meshSDF(sdf, minB, maxB, [18, 18, 18]);
    const meshL = new THREE.Mesh(geomL);
    meshL.name = `${def.name}_L`;
    footMeshes.push(meshL);

    const geomR = mirrorGeometryX(geomL);
    const meshR = new THREE.Mesh(geomR);
    meshR.name = `${def.name}_R`;
    footMeshes.push(meshR);
  }

  // 5 Metatarsals (loft along anteriorly extending rays with longitudinal arch)
  for (let m = 1; m <= 5; m++) {
    const tFrac = (m - 1) / 4;
    const startX = 0.065 + tFrac * 0.038;
    const endX = 0.058 + tFrac * 0.052;
    const startZ = 0.072;
    const endZ = 0.145 - Math.abs(m - 2) * 0.006;
    const archY = 0.038 - Math.sin(tFrac * Math.PI) * 0.008;

    const points = [
      [startX, 0.042, startZ],
      [(startX + endX) * 0.5, archY, (startZ + endZ) * 0.5],
      [endX, 0.022, endZ]
    ];

    const radius = m === 1 ? 0.0075 : 0.0050; // Metatarsal 1 is thickest
    const profile = (t) => [radius * (1.1 - 0.2 * Math.sin(t * Math.PI)), radius];

    const geomL = loftAlongCurve(points, profile, 14, true);
    const meshL = new THREE.Mesh(geomL);
    meshL.name = `metatarsal_${m}_L`;
    footMeshes.push(meshL);

    const geomR = mirrorGeometryX(geomL);
    const meshR = new THREE.Mesh(geomR);
    meshR.name = `metatarsal_${m}_R`;
    footMeshes.push(meshR);

    // Toe Phalanges (Hallux has 2: prox, dist; Toes 2-5 have 3: prox, mid, dist)
    const phTypes = m === 1 ? ['prox', 'dist'] : ['prox', 'mid', 'dist'];
    let curZ = endZ;
    let curX = endX;

    for (let pIdx = 0; pIdx < phTypes.length; pIdx++) {
      const pType = phTypes[pIdx];
      const pLen = m === 1 ? 0.016 : (0.014 - pIdx * 0.003);
      const nextZ = curZ + pLen;
      const phPoints = [
        [curX, 0.018 - pIdx * 0.003, curZ],
        [curX, 0.016 - pIdx * 0.003, nextZ]
      ];
      const phRadius = (m === 1 ? 0.0055 : 0.0038) * (1.0 - pIdx * 0.15);
      const phProfile = () => [phRadius, phRadius * 0.85];

      const phGeomL = loftAlongCurve(phPoints, phProfile, 12, true);
      const phMeshL = new THREE.Mesh(phGeomL);
      phMeshL.name = `toe_${m}_${pType}_L`;
      footMeshes.push(phMeshL);

      const phGeomR = mirrorGeometryX(phGeomL);
      const phMeshR = new THREE.Mesh(phGeomR);
      phMeshR.name = `toe_${m}_${pType}_R`;
      footMeshes.push(phMeshR);

      curZ = nextZ + 0.003;
    }
  }

  return footMeshes;
}
