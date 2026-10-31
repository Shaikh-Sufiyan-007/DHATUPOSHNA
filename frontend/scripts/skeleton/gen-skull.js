// Skull Module: Cranium alignment from CC0 Khronos Skull, Mandible, 32 Teeth, Hyoid Bone
import * as THREE from 'three';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import {
  smin,
  sdRoundedBox,
  sdCapsule,
  sdTaperedCapsule,
  sdEllipsoid,
  meshSDF
} from './sdf-mesh.js';

// ---------------------------------------------------------------------------
// 1. INGEST & TRANSFORM CRANIUM (skull_cranium)
// ---------------------------------------------------------------------------
export async function loadAndAlignCranium(skullGlbPath) {
  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
  const doc = await io.read(skullGlbPath);
  const mesh = doc.getRoot().listMeshes()[0];
  const prim = mesh.listPrimitives()[0];

  const posArray = prim.getAttribute('POSITION').getArray();
  const normalArray = prim.getAttribute('NORMAL')?.getArray();
  const indicesArray = prim.getIndices().getArray();
  const tr = doc.getRoot().listNodes()[0].getTranslation();

  // Target alignment:
  // Top of skull at Y = 1.720 m
  // Base at C1 contact (occipital condyles) at Y = 1.498 m
  // Height = 0.222 m
  // Original Y span in GLB is 0.2528 m -> Scale factor = 0.222 / 0.2528 = 0.878
  const scale = 0.880;
  const targetTopY = 1.720;
  const origMaxY = 0.2528;
  const offsetY = targetTopY - origMaxY * scale; // 1.720 - 0.2224 = 1.4976
  const offsetZ = 0.006; // Align occipital condyles over C1 at z = 0.008

  const newPos = new Float32Array(posArray.length);
  for (let i = 0; i < posArray.length; i += 3) {
    const wx = (posArray[i] + tr[0]) * scale;
    const wy = (posArray[i + 1] + tr[1]) * scale + offsetY;
    const wz = (posArray[i + 2] + tr[2]) * scale + offsetZ;
    newPos[i] = wx;
    newPos[i + 1] = wy;
    newPos[i + 2] = wz;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
  if (normalArray) {
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normalArray), 3));
  } else {
    geometry.computeVertexNormals();
  }
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indicesArray), 1));
  geometry.computeVertexNormals();

  const craniumMesh = new THREE.Mesh(geometry);
  craniumMesh.name = 'skull_cranium';
  return craniumMesh;
}

// ---------------------------------------------------------------------------
// 2. MANDIBLE (U-shaped body, mental protuberance, angle/gonion, ramus, condyle, coronoid)
// ---------------------------------------------------------------------------
export function generateMandible() {
  const mandibleSDF = (p) => {
    const lx = p[0];
    const ly = p[1];
    const lz = p[2];

    // Condyle position articulating at TMJ (~ [±0.052, 1.558, 0.005])
    // Angle / Gonion at ~ [±0.048, 1.505, -0.005]
    // Mental protuberance / Chin at [0, 1.496, 0.082]

    // 1. U-shaped horizontal body
    // Left body arch
    const bodyL = sdCapsule([lx, ly, lz], [0, 1.496, 0.082], [0.048, 1.505, -0.005], 0.009);
    const bodyR = sdCapsule([lx, ly, lz], [0, 1.496, 0.082], [-0.048, 1.505, -0.005], 0.009);
    // Chin prominence (mental protuberance)
    const chin = sdEllipsoid([lx, ly - 1.495, lz - 0.085], [0.014, 0.012, 0.010]);

    // 2. Ascending Ramus on each side
    const ramusL = sdTaperedCapsule([lx, ly, lz], [0.048, 1.505, -0.005], [0.052, 1.554, 0.004], 0.010, 0.007);
    const ramusR = sdTaperedCapsule([lx, ly, lz], [-0.048, 1.505, -0.005], [-0.052, 1.554, 0.004], 0.010, 0.007);

    // 3. Condylar process (articular head in mandibular fossa)
    const condyleL = sdEllipsoid([lx - 0.052, ly - 1.558, lz - 0.005], [0.008, 0.005, 0.005]);
    const condyleR = sdEllipsoid([lx + 0.052, ly - 1.558, lz - 0.005], [0.008, 0.005, 0.005]);

    // 4. Coronoid process (anterior muscular process of ramus)
    const coronoidL = sdCapsule([lx, ly, lz], [0.048, 1.542, 0.012], [0.048, 1.560, 0.024], 0.0045);
    const coronoidR = sdCapsule([lx, ly, lz], [-0.048, 1.542, 0.012], [-0.048, 1.560, 0.024], 0.0045);

    let d = smin(bodyL, bodyR, 0.006);
    d = smin(d, chin, 0.005);
    d = smin(d, ramusL, 0.006);
    d = smin(d, ramusR, 0.006);
    d = smin(d, condyleL, 0.004);
    d = smin(d, condyleR, 0.004);
    d = smin(d, coronoidL, 0.004);
    d = smin(d, coronoidR, 0.004);

    return d;
  };

  const minB = [-0.065, 1.485, -0.018];
  const maxB = [0.065, 1.568, 0.098];

  const geom = meshSDF(mandibleSDF, minB, maxB, [38, 38, 38]);
  const mesh = new THREE.Mesh(geom);
  mesh.name = 'mandible';
  return mesh;
}

// ---------------------------------------------------------------------------
// 3. HYOID BONE (U-shaped bone in anterior neck, below mandible, anterior to C3)
// ---------------------------------------------------------------------------
export function generateHyoid() {
  const hyoidSDF = (p) => {
    const lx = p[0];
    const ly = p[1];
    const lz = p[2];

    // Hyoid body at [0, 1.468, 0.042]
    const body = sdRoundedBox([lx, ly - 1.468, lz - 0.042], [0.014, 0.004, 0.003], 0.002);
    // Greater cornua (horns) extending posterolaterally
    const hornL = sdTaperedCapsule([lx, ly, lz], [0.012, 1.468, 0.040], [0.022, 1.472, 0.018], 0.0028, 0.0016);
    const hornR = sdTaperedCapsule([lx, ly, lz], [-0.012, 1.468, 0.040], [-0.022, 1.472, 0.018], 0.0028, 0.0016);

    let d = smin(body, hornL, 0.003);
    d = smin(d, hornR, 0.003);
    return d;
  };

  const minB = [-0.028, 1.460, 0.012];
  const maxB = [0.028, 1.478, 0.048];

  const geom = meshSDF(hyoidSDF, minB, maxB, [24, 20, 24]);
  const mesh = new THREE.Mesh(geom);
  mesh.name = 'hyoid';
  return mesh;
}

// ---------------------------------------------------------------------------
// 4. 32 INDIVIDUAL TEETH (FDI Numbering: 11-18, 21-28, 31-38, 41-48)
// ---------------------------------------------------------------------------
export function generate32Teeth() {
  const teethMeshes = [];

  // FDI Quadrants:
  // Q1: Upper Right (11 to 18) -> -X
  // Q2: Upper Left (21 to 28) -> +X
  // Q3: Lower Left (31 to 38) -> +X
  // Q4: Lower Right (41 to 48) -> -X

  // Parabolic dental arch parameters
  // Upper arch: Y ≈ 1.516 m, apex Z ≈ 0.076 m
  // Lower arch: Y ≈ 1.508 m, apex Z ≈ 0.074 m (slight normal overbite)

  for (let q = 1; q <= 4; q++) {
    const isUpper = q === 1 || q === 2;
    const isLeft = q === 2 || q === 3; // +X is Left

    const archY = isUpper ? 1.516 : 1.508;
    const archApexZ = isUpper ? 0.075 : 0.072;
    const archWidth = isUpper ? 0.030 : 0.027;

    for (let tNum = 1; tNum <= 8; tNum++) {
      const toothFDI = `${q}${tNum}`;
      // Normalized angle around arch: 1 (incisor, 0 deg) to 8 (3rd molar, ~75 deg)
      const tFrac = (tNum - 0.5) / 8;
      const angle = tFrac * (Math.PI * 0.42);

      const posX = Math.sin(angle) * archWidth * (isLeft ? 1 : -1);
      const posZ = archApexZ - (1 - Math.cos(angle)) * 0.042;
      const posY = archY + (isUpper ? -0.002 : 0.002);

      // Tooth shape dimensions
      let rx, ry, rz;
      if (tNum <= 2) {
        // Incisors (chisel blade)
        rx = tNum === 1 ? 0.0042 : 0.0034;
        ry = 0.0050;
        rz = 0.0028;
      } else if (tNum === 3) {
        // Canine (single conical cusp)
        rx = 0.0038;
        ry = 0.0055;
        rz = 0.0036;
      } else if (tNum <= 5) {
        // Premolars (bicuspid)
        rx = 0.0036;
        ry = 0.0045;
        rz = 0.0042;
      } else {
        // Molars (multicuspid crown)
        rx = 0.0052;
        ry = 0.0042;
        rz = 0.0054;
      }

      const toothSDF = (p) => {
        const lx = p[0] - posX;
        const ly = p[1] - posY;
        const lz = p[2] - posZ;
        return sdRoundedBox([lx, ly, lz], [rx * 0.9, ry * 0.9, rz * 0.9], 0.001);
      };

      const minB = [posX - rx * 1.5, posY - ry * 1.5, posZ - rz * 1.5];
      const maxB = [posX + rx * 1.5, posY + ry * 1.5, posZ + rz * 1.5];

      const geom = meshSDF(toothSDF, minB, maxB, [12, 14, 12]);
      const toothMesh = new THREE.Mesh(geom);
      toothMesh.name = `tooth_${toothFDI}`;
      teethMeshes.push(toothMesh);
    }
  }

  return teethMeshes;
}
