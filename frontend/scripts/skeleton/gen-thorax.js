// Thorax Generator: Sternum (3 parts), 24 Ribs, 20 Costal Cartilages
import * as THREE from 'three';
import { SPINE_VERTEBRA_CONFIG } from './constants.js';
import {
  smin,
  ssub,
  sdSphere,
  sdRoundedBox,
  sdCapsule,
  meshSDF,
  mirrorGeometryX
} from './sdf-mesh.js';
import { loftAlongCurve } from './loft.js';

// ---------------------------------------------------------------------------
// STERNUM (Manubrium, Body, Xiphoid Process)
// ---------------------------------------------------------------------------
export function generateSternumManubrium() {
  const y = 1.365;
  const z = 0.125;

  const manubriumSDF = (p) => {
    const lx = p[0];
    const ly = p[1] - y;
    const lz = p[2] - z;

    // Inverted trapezoid / shield shape
    const t = (ly + 0.025) / 0.050; // 0 bottom, 1 top
    const w = THREE.MathUtils.lerp(0.016, 0.030, THREE.MathUtils.clamp(t, 0, 1));
    const shield = sdRoundedBox([lx, ly, lz], [w, 0.024, 0.005], 0.003);

    // Clavicular notches at superior lateral corners
    const notchL = sdCapsule([lx, ly, lz], [0.022, 0.022, 0], [0.032, 0.028, 0], 0.004);
    const notchR = sdCapsule([lx, ly, lz], [-0.022, 0.022, 0], [-0.032, 0.028, 0], 0.004);
    // Jugular notch at top midline
    const jugular = sdSphere([lx, ly - 0.026, lz], 0.009);

    let d = smin(shield, notchL, 0.003);
    d = smin(d, notchR, 0.003);
    d = ssub(jugular, d, 0.003);
    return d;
  };

  const minB = [-0.036, y - 0.030, z - 0.012];
  const maxB = [0.036, y + 0.030, z + 0.012];
  const geom = meshSDF(manubriumSDF, minB, maxB, [30, 28, 20]);
  const mesh = new THREE.Mesh(geom);
  mesh.name = 'sternum_manubrium';
  return mesh;
}

export function generateSternumBody() {
  const y = 1.285;
  const z = 0.132;

  const bodySDF = (p) => {
    const lx = p[0];
    const ly = p[1] - y;
    const lz = p[2] - z;

    // Elongated flat blade, slightly wider at 4th/5th rib level
    const t = (ly + 0.050) / 0.100;
    const w = 0.014 + Math.sin(t * Math.PI) * 0.005;
    const blade = sdRoundedBox([lx, ly, lz], [w, 0.050, 0.004], 0.0025);

    // Costal notches on lateral edges (ribs 2-7)
    return blade;
  };

  const minB = [-0.025, y - 0.055, z - 0.010];
  const maxB = [0.025, y + 0.055, z + 0.010];
  const geom = meshSDF(bodySDF, minB, maxB, [24, 40, 18]);
  const mesh = new THREE.Mesh(geom);
  mesh.name = 'sternum_body';
  return mesh;
}

export function generateSternumXiphoid() {
  const y = 1.218;
  const z = 0.128;

  const xiphoidSDF = (p) => {
    const lx = p[0];
    const ly = p[1] - y;
    const lz = p[2] - z;

    // Small tapering sword-like process
    const t = (ly + 0.015) / 0.030;
    const w = THREE.MathUtils.lerp(0.002, 0.008, THREE.MathUtils.clamp(t, 0, 1));
    return sdRoundedBox([lx, ly, lz], [w, 0.014, 0.003], 0.002);
  };

  const minB = [-0.012, y - 0.018, z - 0.008];
  const maxB = [0.012, y + 0.018, z + 0.008];
  const geom = meshSDF(xiphoidSDF, minB, maxB, [18, 24, 16]);
  const mesh = new THREE.Mesh(geom);
  mesh.name = 'sternum_xiphoid';
  return mesh;
}

// ---------------------------------------------------------------------------
// 12 PAIRS OF RIBS + COSTAL CARTILAGES
// ---------------------------------------------------------------------------
export function generateRibPair(ribIndex) { // ribIndex: 1 to 12
  // Corresponding thoracic vertebra T1 - T12
  const tCfg = SPINE_VERTEBRA_CONFIG[6 + ribIndex]; // index 7 is T1
  const vertY = tCfg.y;
  const vertZ = tCfg.z;

  // Barrel dimensions at this rib level
  // Maximum chest width around rib 7-8 (~0.28m diameter = 0.14m radius)
  const normLevel = (ribIndex - 1) / 11;
  const chestHalfWidth = 0.075 + Math.sin(normLevel * Math.PI * 0.85) * 0.065;
  const chestDepth = 0.080 + Math.sin(normLevel * Math.PI * 0.85) * 0.055;

  // Anatomical Left (+X): from T-facet -> posterolateral -> lateral -> anterolateral -> anterior
  const headPoint = [0.016, vertY + 0.002, vertZ - 0.004];
  const tuberclePoint = [0.032, vertY - 0.002, vertZ - 0.022];
  const anglePoint = [chestHalfWidth * 0.75, vertY - 0.008, vertZ - 0.035];
  const lateralPoint = [chestHalfWidth, vertY - 0.022, vertZ + chestDepth * 0.4];
  const anterolateralPoint = [chestHalfWidth * 0.85, vertY - 0.038, vertZ + chestDepth * 0.85];

  // Anterior rib end (costochondral junction)
  let anteriorPoint;
  if (ribIndex <= 7) {
    // True ribs terminate near lateral margin of sternum
    const sternumY = 1.370 - (ribIndex - 1) * 0.022;
    anteriorPoint = [0.025 + ribIndex * 0.002, sternumY - 0.005, 0.125];
  } else if (ribIndex <= 10) {
    // False ribs curve upwards towards cartilage above
    const marginY = 1.230 - (ribIndex - 7) * 0.015;
    anteriorPoint = [0.045 + (ribIndex - 7) * 0.012, marginY, 0.105 - (ribIndex - 7) * 0.010];
  } else {
    // Floating ribs 11 & 12 end freely in the abdominal wall
    anteriorPoint = [chestHalfWidth * 0.65, vertY - 0.045, vertZ + chestDepth * 0.45];
  }

  const ribPoints = [headPoint, tuberclePoint, anglePoint, lateralPoint, anterolateralPoint, anteriorPoint];

  // Rib cross-section profile: flattened blade with inner costal groove
  const ribProfile = (t, _angle) => {
    // Rib 1 is broader and flatter
    let rx = 0.0022; // thickness
    let ry = 0.0060; // height/width of rib blade
    if (ribIndex === 1) {
      rx = 0.0050; // flat horizontal
      ry = 0.0030;
    } else if (ribIndex >= 11) {
      rx = 0.0025;
      ry = 0.0035;
    }
    // Taper at head (t=0) and costochondral end (t=1)
    const taper = 0.8 + 0.4 * Math.sin(t * Math.PI);
    return [rx * taper, ry * taper];
  };

  const ribGeomL = loftAlongCurve(ribPoints, ribProfile, 16, true);
  const ribMeshL = new THREE.Mesh(ribGeomL);
  const numStr = String(ribIndex).padStart(2, '0');
  ribMeshL.name = `rib_L_${numStr}`;

  // Mirrored Right rib (-X)
  const ribGeomR = mirrorGeometryX(ribGeomL);
  const ribMeshR = new THREE.Mesh(ribGeomR);
  ribMeshR.name = `rib_R_${numStr}`;

  // Costal Cartilage for ribs 1-10
  let cartMeshL = null;
  let cartMeshR = null;

  if (ribIndex <= 10) {
    let sternumAttachPoint;
    if (ribIndex === 1) {
      sternumAttachPoint = [0.014, 1.372, 0.126];
    } else if (ribIndex <= 7) {
      sternumAttachPoint = [0.012, 1.365 - (ribIndex - 1) * 0.022, 0.130];
    } else {
      // Merging into cartilage above
      sternumAttachPoint = [0.025 + (ribIndex - 8) * 0.008, 1.235 - (ribIndex - 7) * 0.010, 0.118];
    }

    const midCartPoint = [
      (anteriorPoint[0] + sternumAttachPoint[0]) * 0.5,
      (anteriorPoint[1] + sternumAttachPoint[1]) * 0.5 - 0.003,
      (anteriorPoint[2] + sternumAttachPoint[2]) * 0.5
    ];

    const cartPoints = [anteriorPoint, midCartPoint, sternumAttachPoint];
    const cartProfile = () => [0.0030, 0.0045];
    const cartGeomL = loftAlongCurve(cartPoints, cartProfile, 12, true);

    cartMeshL = new THREE.Mesh(cartGeomL);
    cartMeshL.name = `costal_cartilage_L_${numStr}`;

    const cartGeomR = mirrorGeometryX(cartGeomL);
    cartMeshR = new THREE.Mesh(cartGeomR);
    cartMeshR.name = `costal_cartilage_R_${numStr}`;
  }

  return { ribMeshL, ribMeshR, cartMeshL, cartMeshR };
}
