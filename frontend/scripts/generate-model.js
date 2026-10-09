import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Node.js FileReader polyfill for GLTFExporter
class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = 'data:application/octet-stream;base64,' + Buffer.from(buf).toString('base64');
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = NodeFileReader;

// Helper: assign realistic anatomical vertex colors with subtle ambient occlusion and surface variation
function applyVertexColors(geometry, baseColorHex, variation = 0.08, aoFactor = 0.15) {
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const base = new THREE.Color(baseColorHex);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  // Compute bounding box for vertical gradient
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const height = Math.max(0.001, bb.max.y - bb.min.y);

  for (let i = 0; i < count; i++) {
    v.fromBufferAttribute(pos, i);
    // Subtle procedural noise variation based on position
    const noise = (Math.sin(v.x * 45) * Math.cos(v.y * 45) * Math.sin(v.z * 45)) * variation;
    // Ambient occlusion factor: deeper in recesses or lower height has subtle shading
    const normY = (v.y - bb.min.y) / height;
    const depthShade = 1.0 - (1.0 - normY) * aoFactor * 0.5;

    const r = THREE.MathUtils.clamp((base.r + noise) * depthShade, 0, 1);
    const g = THREE.MathUtils.clamp((base.g + noise * 0.9) * depthShade, 0, 1);
    const b = THREE.MathUtils.clamp((base.b + noise * 0.8) * depthShade, 0, 1);

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

// Helper: build tube along 3D points
function createTubeMesh(points, radius, radialSegments, name, material) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const geo = new THREE.TubeGeometry(curve, Math.max(16, points.length * 6), radius, radialSegments, false);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = name;
  return mesh;
}

// -------------------------------------------------------------
// MAIN ANATOMICAL MODEL BUILDER
// -------------------------------------------------------------
function createRealisticHumanBodyModel() {
  const rootScene = new THREE.Scene();
  rootScene.name = 'HumanBodyRoot';

  const humanGroup = new THREE.Group();
  humanGroup.name = 'HumanBody';
  rootScene.add(humanGroup);

  // Anatomical specimen PBR materials
  const matBone = new THREE.MeshStandardMaterial({
    color: 0xede8dc,
    roughness: 0.38,
    metalness: 0.05,
    vertexColors: true,
  });

  const matCartilage = new THREE.MeshStandardMaterial({
    color: 0xd4e2e8,
    roughness: 0.25,
    metalness: 0.08,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
  });

  const matMuscle = new THREE.MeshStandardMaterial({
    color: 0xbf382c,
    roughness: 0.52,
    metalness: 0.12,
    vertexColors: true,
  });

  const matHeart = new THREE.MeshStandardMaterial({
    color: 0xa82024,
    roughness: 0.28,
    metalness: 0.18,
    vertexColors: true,
  });

  const matArtery = new THREE.MeshStandardMaterial({
    color: 0xcc1f26,
    roughness: 0.22,
    metalness: 0.2,
    vertexColors: true,
  });

  const matVein = new THREE.MeshStandardMaterial({
    color: 0x1e56a0,
    roughness: 0.25,
    metalness: 0.18,
    vertexColors: true,
  });

  const matLiver = new THREE.MeshStandardMaterial({
    color: 0x6e261f,
    roughness: 0.32,
    metalness: 0.15,
    vertexColors: true,
  });

  const matSpleen = new THREE.MeshStandardMaterial({
    color: 0x5a1836,
    roughness: 0.35,
    metalness: 0.15,
    vertexColors: true,
  });

  const matLymph = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.25,
    transparent: true,
    opacity: 0.92,
    vertexColors: true,
  });

  const matAdipose = new THREE.MeshStandardMaterial({
    color: 0xe6b800,
    roughness: 0.55,
    metalness: 0.05,
    transparent: true,
    opacity: 0.88,
    vertexColors: true,
  });

  const matNeural = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    roughness: 0.28,
    metalness: 0.2,
    vertexColors: true,
  });

  const matMarrow = new THREE.MeshStandardMaterial({
    color: 0x882d46,
    roughness: 0.45,
    metalness: 0.1,
    vertexColors: true,
  });

  const matVitality = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.22,
    metalness: 0.28,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
  });

  const matSilhouette = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    vertexColors: true,
  });

  // =========================================================
  // 1. ASTHI DHATU: REALISTIC ANATOMICAL SKELETAL SYSTEM
  // =========================================================
  const asthiGroup = new THREE.Group();
  asthiGroup.name = 'region_asthi';
  asthiGroup.userData = {
    dhatuSlug: 'asthi',
    dhatuName: 'Asthi',
    displayName: 'Asthi Dhatu (Skeletal Framework & Articulations)',
  };

  // --- 1.1 CRANIUM & FACIAL BONES (Detailed Anatomical Skull) ---
  // A. Neurocranium (Braincase)
  const skullVaultGeo = new THREE.SphereGeometry(0.1, 40, 36);
  const vPos = skullVaultGeo.attributes.position;
  const tempV = new THREE.Vector3();
  for (let i = 0; i < vPos.count; i++) {
    tempV.fromBufferAttribute(vPos, i);
    // Forehead frontal bone expansion
    if (tempV.y > 0.01 && tempV.z > 0.02) {
      tempV.z += 0.018;
      tempV.y += 0.005;
    }
    // Parietal lateral vault
    if (tempV.y > 0.03) {
      tempV.x *= 1.08;
      tempV.z *= 1.12;
    }
    // Occipital protuberance at back of skull
    if (tempV.z < -0.04 && tempV.y < 0.02 && tempV.y > -0.05) {
      tempV.z -= 0.022;
    }
    // Temporal fossa lateral depression
    if (Math.abs(tempV.x) > 0.065 && tempV.z > -0.02 && tempV.z < 0.05 && tempV.y < 0.04) {
      tempV.x *= 0.88;
    }
    // Orbital cavity indentations (left & right eye sockets)
    const isOrbitY = tempV.y > -0.03 && tempV.y < 0.025;
    const isOrbitZ = tempV.z > 0.055;
    if (isOrbitY && isOrbitZ) {
      const distOrbitR = Math.hypot(tempV.x - 0.038, tempV.y - 0.002);
      const distOrbitL = Math.hypot(tempV.x + 0.038, tempV.y - 0.002);
      if (distOrbitR < 0.028) {
        tempV.z -= (0.028 - distOrbitR) * 0.95;
      }
      if (distOrbitL < 0.028) {
        tempV.z -= (0.028 - distOrbitL) * 0.95;
      }
    }
    // Nasal bridge projection
    if (Math.abs(tempV.x) < 0.015 && tempV.y > -0.025 && tempV.y < 0.02 && tempV.z > 0.055) {
      tempV.z += 0.025;
    }
    // Piriform aperture (nasal cavity recess)
    if (Math.abs(tempV.x) < 0.018 && tempV.y > -0.045 && tempV.y < -0.015 && tempV.z > 0.06) {
      tempV.z -= 0.02;
    }
    // Maxilla & alveolar arch
    if (tempV.y < -0.035 && tempV.y > -0.065 && tempV.z > 0.03) {
      tempV.z += 0.015;
    }
    // Skull base & foramen magnum
    if (tempV.y < -0.06 && tempV.z < 0.0) {
      tempV.y += 0.015;
    }
    vPos.setXYZ(i, tempV.x, tempV.y, tempV.z);
  }
  skullVaultGeo.computeVertexNormals();
  applyVertexColors(skullVaultGeo, 0xede8dc, 0.06, 0.2);
  const skullMesh = new THREE.Mesh(skullVaultGeo, matBone);
  skullMesh.name = 'asthi_cranium_skull';
  skullMesh.position.set(0, 1.63, 0);
  asthiGroup.add(skullMesh);

  // B. Zygomatic Arches (Cheekbones left & right)
  [-1, 1].forEach((side) => {
    const archPts = [
      [side * 0.025, 1.615, 0.07],
      [side * 0.068, 1.61, 0.05],
      [side * 0.075, 1.62, 0.01],
      [side * 0.068, 1.625, -0.03],
    ];
    const archMesh = createTubeMesh(archPts, 0.007, 8, `asthi_zygomatic_${side > 0 ? 'r' : 'l'}`, matBone);
    applyVertexColors(archMesh.geometry, 0xede8dc, 0.05);
    asthiGroup.add(archMesh);
  });

  // C. Mandible (Realistic Lower Jaw with Chin, Angle & Condyles)
  const mandibleCurveL = [
    [0.0, 1.54, 0.078], // Mental protuberance (chin)
    [-0.028, 1.542, 0.065],
    [-0.055, 1.55, 0.025], // Body of mandible
    [-0.068, 1.56, -0.01], // Angle of mandible (gonion)
    [-0.068, 1.605, -0.018], // Ascending ramus to TMJ condyle
  ];
  const mandibleCurveR = [
    [0.0, 1.54, 0.078],
    [0.028, 1.542, 0.065],
    [0.055, 1.55, 0.025],
    [0.068, 1.56, -0.01],
    [0.068, 1.605, -0.018],
  ];
  const mandibleMeshL = createTubeMesh(mandibleCurveL, 0.009, 10, 'asthi_mandible_l', matBone);
  const mandibleMeshR = createTubeMesh(mandibleCurveR, 0.009, 10, 'asthi_mandible_r', matBone);
  applyVertexColors(mandibleMeshL.geometry, 0xede8dc, 0.05);
  applyVertexColors(mandibleMeshR.geometry, 0xede8dc, 0.05);
  asthiGroup.add(mandibleMeshL);
  asthiGroup.add(mandibleMeshR);

  // D. Dental Arches (Realistic Teeth Rows)
  [-1, 1].forEach((side) => {
    // Upper teeth arch
    const upperTeethPts = [
      [side * 0.004, 1.575, 0.072],
      [side * 0.015, 1.575, 0.068],
      [side * 0.026, 1.576, 0.055],
      [side * 0.034, 1.577, 0.038],
    ];
    const upperTeethMesh = createTubeMesh(upperTeethPts, 0.0045, 6, `asthi_teeth_upper_${side > 0 ? 'r' : 'l'}`, matBone);
    applyVertexColors(upperTeethMesh.geometry, 0xf8f9fa, 0.02);
    asthiGroup.add(upperTeethMesh);

    // Lower teeth arch
    const lowerTeethPts = [
      [side * 0.004, 1.565, 0.069],
      [side * 0.014, 1.565, 0.065],
      [side * 0.024, 1.566, 0.052],
      [side * 0.032, 1.567, 0.036],
    ];
    const lowerTeethMesh = createTubeMesh(lowerTeethPts, 0.004, 6, `asthi_teeth_lower_${side > 0 ? 'r' : 'l'}`, matBone);
    applyVertexColors(lowerTeethMesh.geometry, 0xf8f9fa, 0.02);
    asthiGroup.add(lowerTeethMesh);
  });

  // --- 1.2 VERTEBRAL COLUMN & SPINAL COLUMN (Articulated S-Curve Spine) ---
  const vertebraeConfigs = [
    // Cervical (C1 - C7): Lordosis (anterior curve)
    { y: 1.54, z: -0.005, rad: 0.014, tag: 'c1' },
    { y: 1.51, z: 0.002, rad: 0.015, tag: 'c2' },
    { y: 1.48, z: 0.008, rad: 0.016, tag: 'c3' },
    { y: 1.45, z: 0.006, rad: 0.017, tag: 'c5' },
    { y: 1.42, z: -0.004, rad: 0.018, tag: 'c7' },
    // Thoracic (T1 - T12): Kyphosis (posterior curve)
    { y: 1.39, z: -0.016, rad: 0.019, tag: 't1' },
    { y: 1.35, z: -0.028, rad: 0.020, tag: 't3' },
    { y: 1.30, z: -0.038, rad: 0.021, tag: 't5' },
    { y: 1.25, z: -0.045, rad: 0.022, tag: 't7' },
    { y: 1.20, z: -0.046, rad: 0.023, tag: 't9' },
    { y: 1.15, z: -0.040, rad: 0.024, tag: 't11' },
    { y: 1.10, z: -0.028, rad: 0.025, tag: 't12' },
    // Lumbar (L1 - L5): Lordosis (anterior curve, thick weight-bearing bodies)
    { y: 1.05, z: -0.016, rad: 0.026, tag: 'l1' },
    { y: 1.00, z: -0.006, rad: 0.028, tag: 'l2' },
    { y: 0.95, z: -0.002, rad: 0.029, tag: 'l3' },
    { y: 0.90, z: -0.008, rad: 0.030, tag: 'l4' },
    { y: 0.85, z: -0.020, rad: 0.031, tag: 'l5' },
  ];

  vertebraeConfigs.forEach((vert, idx) => {
    // Vertebral body (cylinder with anatomical oval cross-section)
    const vertGeo = new THREE.CylinderGeometry(vert.rad, vert.rad * 1.05, 0.022, 16);
    vertGeo.scale(1.2, 1, 0.9);
    applyVertexColors(vertGeo, 0xede8dc, 0.05);
    const vertMesh = new THREE.Mesh(vertGeo, matBone);
    vertMesh.name = `asthi_vertebra_${vert.tag}`;
    vertMesh.position.set(0, vert.y, vert.z);
    asthiGroup.add(vertMesh);

    // Spinous process (posterior spine projecting backwards)
    const spineProcessGeo = new THREE.ConeGeometry(0.007, 0.025, 8);
    spineProcessGeo.rotateX(Math.PI * 0.45);
    applyVertexColors(spineProcessGeo, 0xede8dc, 0.05);
    const spinousMesh = new THREE.Mesh(spineProcessGeo, matBone);
    spinousMesh.name = `asthi_spinous_${vert.tag}`;
    spinousMesh.position.set(0, vert.y - 0.004, vert.z - vert.rad - 0.01);
    asthiGroup.add(spinousMesh);

    // Bilateral transverse processes
    [-1, 1].forEach((side) => {
      const transGeo = new THREE.CylinderGeometry(0.004, 0.006, 0.024, 6);
      transGeo.rotateZ(Math.PI * 0.5);
      applyVertexColors(transGeo, 0xede8dc, 0.04);
      const transMesh = new THREE.Mesh(transGeo, matBone);
      transMesh.position.set(side * (vert.rad + 0.01), vert.y, vert.z - 0.005);
      asthiGroup.add(transMesh);
    });

    // Intervertebral disc (between stacked vertebrae)
    if (idx < vertebraeConfigs.length - 1) {
      const nextVert = vertebraeConfigs[idx + 1];
      const discY = (vert.y + nextVert.y) * 0.5;
      const discZ = (vert.z + nextVert.z) * 0.5;
      const discGeo = new THREE.CylinderGeometry(vert.rad * 0.95, vert.rad * 0.95, 0.008, 14);
      discGeo.scale(1.2, 1, 0.9);
      applyVertexColors(discGeo, 0xd4e2e8, 0.04);
      const discMesh = new THREE.Mesh(discGeo, matCartilage);
      discMesh.name = `asthi_disc_${idx}`;
      discMesh.position.set(0, discY, discZ);
      asthiGroup.add(discMesh);
    }
  });

  // Sacrum & Coccyx (Curved triangular fused base)
  const sacrumCurve = [
    [0, 0.84, -0.022],
    [0, 0.80, -0.042],
    [0, 0.76, -0.052],
    [0, 0.72, -0.048], // Coccyx tip
  ];
  const sacrumMesh = createTubeMesh(sacrumCurve, 0.028, 12, 'asthi_sacrum_coccyx', matBone);
  sacrumMesh.scale.set(1.5, 1, 0.65);
  applyVertexColors(sacrumMesh.geometry, 0xede8dc, 0.06);
  asthiGroup.add(sacrumMesh);

  // --- 1.3 STERNUM & 12 PAIRS OF RIBS (Anatomical Thoracic Cage) ---
  // A. Manubrium Sterni
  const manubriumGeo = new THREE.BoxGeometry(0.062, 0.042, 0.015);
  applyVertexColors(manubriumGeo, 0xede8dc, 0.05);
  const manubriumMesh = new THREE.Mesh(manubriumGeo, matBone);
  manubriumMesh.name = 'asthi_sternum_manubrium';
  manubriumMesh.position.set(0, 1.365, 0.075);
  asthiGroup.add(manubriumMesh);

  // B. Sternal Body (Gladiolus)
  const sternalBodyGeo = new THREE.BoxGeometry(0.038, 0.16, 0.012);
  applyVertexColors(sternalBodyGeo, 0xede8dc, 0.05);
  const sternalBodyMesh = new THREE.Mesh(sternalBodyGeo, matBone);
  sternalBodyMesh.name = 'asthi_sternum_body';
  sternalBodyMesh.position.set(0, 1.26, 0.082);
  asthiGroup.add(sternalBodyMesh);

  // C. Xiphoid Process
  const xiphoidGeo = new THREE.ConeGeometry(0.012, 0.032, 6);
  xiphoidGeo.rotateX(Math.PI);
  applyVertexColors(xiphoidGeo, 0xd4e2e8, 0.04);
  const xiphoidMesh = new THREE.Mesh(xiphoidGeo, matCartilage);
  xiphoidMesh.name = 'asthi_sternum_xiphoid';
  xiphoidMesh.position.set(0, 1.16, 0.078);
  asthiGroup.add(xiphoidMesh);

  // D. 12 Pairs of Anatomically Curved Ribs
  const ribLevels = [
    { yStart: 1.38, yEnd: 1.35, spanX: 0.10, depthZ: 0.075, trueRib: true }, // Rib 1
    { yStart: 1.35, yEnd: 1.32, spanX: 0.125, depthZ: 0.08, trueRib: true }, // Rib 2
    { yStart: 1.31, yEnd: 1.28, spanX: 0.145, depthZ: 0.085, trueRib: true }, // Rib 3
    { yStart: 1.27, yEnd: 1.24, spanX: 0.158, depthZ: 0.088, trueRib: true }, // Rib 4
    { yStart: 1.23, yEnd: 1.20, spanX: 0.162, depthZ: 0.088, trueRib: true }, // Rib 5
    { yStart: 1.19, yEnd: 1.16, spanX: 0.160, depthZ: 0.085, trueRib: true }, // Rib 6
    { yStart: 1.15, yEnd: 1.12, spanX: 0.154, depthZ: 0.082, trueRib: true }, // Rib 7
    { yStart: 1.11, yEnd: 1.09, spanX: 0.145, depthZ: 0.078, trueRib: false }, // Rib 8 (False)
    { yStart: 1.07, yEnd: 1.06, spanX: 0.134, depthZ: 0.072, trueRib: false }, // Rib 9 (False)
    { yStart: 1.04, yEnd: 1.04, spanX: 0.120, depthZ: 0.065, trueRib: false }, // Rib 10 (False)
    { yStart: 1.01, yEnd: 1.00, spanX: 0.105, depthZ: 0.035, floating: true }, // Rib 11 (Floating)
    { yStart: 0.98, yEnd: 0.97, spanX: 0.085, depthZ: 0.015, floating: true }, // Rib 12 (Floating)
  ];

  ribLevels.forEach((rib, i) => {
    [-1, 1].forEach((side) => {
      // Find posterior thoracic spine coordinate at this Y level
      const zSpine = -0.02 - (1.38 - rib.yStart) * 0.12;

      let ribPts = [];
      if (rib.floating) {
        // Floating ribs do not articulate anteriorly
        ribPts = [
          [side * 0.025, rib.yStart, zSpine],
          [side * (rib.spanX * 0.6), rib.yStart - 0.01, zSpine - 0.01],
          [side * rib.spanX, rib.yStart - 0.02, zSpine + rib.depthZ],
        ];
      } else {
        // Sweeping 3D curvature from spine, around flank, sloping down to anterior costal margin
        const anteriorTargetX = rib.trueRib ? side * 0.024 : side * 0.032;
        const anteriorTargetY = rib.yEnd;
        const anteriorTargetZ = 0.075;

        ribPts = [
          [side * 0.025, rib.yStart, zSpine],
          [side * (rib.spanX * 0.7), rib.yStart - 0.012, zSpine - 0.015],
          [side * rib.spanX, rib.yStart - 0.03, zSpine + (rib.depthZ * 0.5)],
          [side * (rib.spanX * 0.8), rib.yEnd - 0.01, anteriorTargetZ - 0.015],
          [anteriorTargetX, anteriorTargetY, anteriorTargetZ],
        ];
      }

      const ribMesh = createTubeMesh(ribPts, 0.0055, 8, `asthi_rib_${i}_${side > 0 ? 'r' : 'l'}`, matBone);
      applyVertexColors(ribMesh.geometry, 0xede8dc, 0.05);
      asthiGroup.add(ribMesh);

      // Costal cartilage segment connecting rib to sternum
      if (rib.trueRib) {
        const cartPts = [
          [side * 0.024, rib.yEnd, 0.075],
          [side * 0.018, rib.yEnd + 0.005, 0.078],
          [0, rib.yEnd + 0.008, 0.082],
        ];
        const cartMesh = createTubeMesh(cartPts, 0.0048, 6, `asthi_cartilage_${i}_${side > 0 ? 'r' : 'l'}`, matCartilage);
        applyVertexColors(cartMesh.geometry, 0xd4e2e8, 0.04);
        asthiGroup.add(cartMesh);
      }
    });
  });

  // --- 1.4 SHOULDER GIRDLE & UPPER LIMBS ---
  [-1, 1].forEach((side) => {
    // A. Clavicle (S-shaped Collarbone)
    const claviclePts = [
      [side * 0.028, 1.37, 0.072], // Sternal end
      [side * 0.085, 1.378, 0.055], // Anterior convexity
      [side * 0.150, 1.365, 0.015], // Posterior curve
      [side * 0.185, 1.355, 0.005], // Acromial articulation
    ];
    const clavicleMesh = createTubeMesh(claviclePts, 0.0085, 8, `asthi_clavicle_${side > 0 ? 'r' : 'l'}`, matBone);
    applyVertexColors(clavicleMesh.geometry, 0xede8dc, 0.05);
    asthiGroup.add(clavicleMesh);

    // B. Scapula (Triangular Shoulder Blade with Spine & Acromion)
    const scapulaGeo = new THREE.BufferGeometry();
    const scapVerts = new Float32Array([
      // Superior angle, Inferior angle, Glenoid/Acromion lateral corner
      side * 0.065, 1.36, -0.055,
      side * 0.075, 1.18, -0.065,
      side * 0.185, 1.34, -0.025,
      // Double sided triangle
      side * 0.065, 1.36, -0.055,
      side * 0.185, 1.34, -0.025,
      side * 0.075, 1.18, -0.065,
    ]);
    scapulaGeo.setAttribute('position', new THREE.BufferAttribute(scapVerts, 3));
    scapulaGeo.computeVertexNormals();
    applyVertexColors(scapulaGeo, 0xede8dc, 0.04);
    const scapulaMesh = new THREE.Mesh(scapulaGeo, matBone);
    scapulaMesh.name = `asthi_scapula_${side > 0 ? 'r' : 'l'}`;
    asthiGroup.add(scapulaMesh);

    // C. Humerus (Upper Arm Bone with Anatomical Head & Epicondyles)
    // Humeral head (sphere in glenoid cavity)
    const humHeadGeo = new THREE.SphereGeometry(0.024, 16, 16);
    applyVertexColors(humHeadGeo, 0xede8dc, 0.04);
    const humHeadMesh = new THREE.Mesh(humHeadGeo, matBone);
    humHeadMesh.position.set(side * 0.195, 1.33, -0.01);
    asthiGroup.add(humHeadMesh);

    // Humeral shaft
    const humShaftGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.26, 12);
    applyVertexColors(humShaftGeo, 0xede8dc, 0.05);
    const humShaftMesh = new THREE.Mesh(humShaftGeo, matBone);
    humShaftMesh.name = `asthi_humerus_${side > 0 ? 'r' : 'l'}`;
    humShaftMesh.position.set(side * 0.22, 1.19, 0.0);
    humShaftMesh.rotation.z = side * -0.12;
    asthiGroup.add(humShaftMesh);

    // Distal epicondyles of humerus
    const humEpiGeo = new THREE.BoxGeometry(0.038, 0.022, 0.026);
    applyVertexColors(humEpiGeo, 0xede8dc, 0.04);
    const humEpiMesh = new THREE.Mesh(humEpiGeo, matBone);
    humEpiMesh.position.set(side * 0.24, 1.055, 0.0);
    asthiGroup.add(humEpiMesh);

    // D. Forearm (Radius lateral, Ulna medial with Olecranon elbow)
    // Olecranon hooked process
    const olecranonGeo = new THREE.BoxGeometry(0.018, 0.028, 0.022);
    applyVertexColors(olecranonGeo, 0xede8dc, 0.04);
    const olecranonMesh = new THREE.Mesh(olecranonGeo, matBone);
    olecranonMesh.position.set(side * 0.23, 1.05, -0.018);
    asthiGroup.add(olecranonMesh);

    // Radius (lateral bone with styloid process)
    const radiusGeo = new THREE.CylinderGeometry(0.010, 0.012, 0.24, 10);
    applyVertexColors(radiusGeo, 0xede8dc, 0.05);
    const radiusMesh = new THREE.Mesh(radiusGeo, matBone);
    radiusMesh.name = `asthi_radius_${side > 0 ? 'r' : 'l'}`;
    radiusMesh.position.set(side * 0.27, 0.92, 0.015);
    radiusMesh.rotation.z = side * -0.10;
    asthiGroup.add(radiusMesh);

    // Ulna (medial bone)
    const ulnaGeo = new THREE.CylinderGeometry(0.011, 0.009, 0.24, 10);
    applyVertexColors(ulnaGeo, 0xede8dc, 0.05);
    const ulnaMesh = new THREE.Mesh(ulnaGeo, matBone);
    ulnaMesh.name = `asthi_ulna_${side > 0 ? 'r' : 'l'}`;
    ulnaMesh.position.set(side * 0.24, 0.92, -0.005);
    ulnaMesh.rotation.z = side * -0.10;
    asthiGroup.add(ulnaMesh);

    // E. Anatomical Hand (Carpals, Metacarpals & 5 Articulated Fingers)
    const carpalGeo = new THREE.BoxGeometry(0.028, 0.025, 0.016);
    applyVertexColors(carpalGeo, 0xede8dc, 0.04);
    const carpalMesh = new THREE.Mesh(carpalGeo, matBone);
    carpalMesh.name = `asthi_hand_carpal_${side > 0 ? 'r' : 'l'}`;
    carpalMesh.position.set(side * 0.29, 0.785, 0.01);
    asthiGroup.add(carpalMesh);

    // 5 Finger rays
    [-0.012, -0.006, 0.0, 0.006, 0.012].forEach((offset, fIdx) => {
      const fingerLen = fIdx === 2 ? 0.085 : fIdx === 0 ? 0.055 : 0.075;
      const fingerGeo = new THREE.CylinderGeometry(0.0035, 0.0045, fingerLen, 6);
      applyVertexColors(fingerGeo, 0xede8dc, 0.04);
      const fingerMesh = new THREE.Mesh(fingerGeo, matBone);
      fingerMesh.position.set(side * (0.29 + offset), 0.785 - fingerLen * 0.6, 0.01 + offset * 0.3);
      fingerMesh.rotation.x = 0.15; // Natural relaxed curve
      asthiGroup.add(fingerMesh);
    });
  });

  // --- 1.5 PELVIC GIRDLE (Anatomical Pelvis, Iliac Crests & Pubis) ---
  // A. Iliac Wings (Flared Ilium left & right)
  [-1, 1].forEach((side) => {
    const iliacPts = [
      [side * 0.04, 0.84, -0.02],
      [side * 0.12, 0.86, -0.01], // Peak of iliac crest
      [side * 0.14, 0.83, 0.04], // ASIS (Anterior Superior Iliac Spine)
      [side * 0.11, 0.76, 0.06],
      [side * 0.05, 0.73, 0.075], // Pubic tubercle
      [0.0, 0.73, 0.075], // Pubic symphysis
    ];
    const iliacMesh = createTubeMesh(iliacPts, 0.014, 10, `asthi_ilium_${side > 0 ? 'r' : 'l'}`, matBone);
    applyVertexColors(iliacMesh.geometry, 0xede8dc, 0.06);
    asthiGroup.add(iliacMesh);

    // Ischial tuberosities (posterior sit bones)
    const ischiumGeo = new THREE.TorusGeometry(0.028, 0.011, 8, 14, Math.PI * 1.2);
    applyVertexColors(ischiumGeo, 0xede8dc, 0.05);
    const ischiumMesh = new THREE.Mesh(ischiumGeo, matBone);
    ischiumMesh.position.set(side * 0.07, 0.71, -0.015);
    ischiumMesh.rotation.x = Math.PI * 0.45;
    asthiGroup.add(ischiumMesh);

    // Acetabulum (deep spherical hip socket)
    const acetabulumGeo = new THREE.SphereGeometry(0.022, 14, 14, 0, Math.PI);
    applyVertexColors(acetabulumGeo, 0xede8dc, 0.05);
    const acetabulumMesh = new THREE.Mesh(acetabulumGeo, matBone);
    acetabulumMesh.position.set(side * 0.105, 0.74, 0.01);
    acetabulumMesh.rotation.y = side * Math.PI * 0.5;
    asthiGroup.add(acetabulumMesh);
  });

  // Pubic symphysis fibrocartilage disc
  const pubicDiscGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.018, 10);
  pubicDiscGeo.rotateZ(Math.PI * 0.5);
  applyVertexColors(pubicDiscGeo, 0xd4e2e8, 0.04);
  const pubicDiscMesh = new THREE.Mesh(pubicDiscGeo, matCartilage);
  pubicDiscMesh.position.set(0, 0.73, 0.075);
  asthiGroup.add(pubicDiscMesh);

  // --- 1.6 LOWER LIMBS (Femur, Patella, Tibia, Fibula & Arched Feet) ---
  [-1, 1].forEach((side) => {
    // A. Femur (Thigh Bone with Ball Head, Greater Trochanter & Condyles)
    // Femoral ball head (articulates in acetabulum)
    const femHeadGeo = new THREE.SphereGeometry(0.025, 16, 16);
    applyVertexColors(femHeadGeo, 0xede8dc, 0.04);
    const femHeadMesh = new THREE.Mesh(femHeadGeo, matBone);
    femHeadMesh.position.set(side * 0.10, 0.74, 0.01);
    asthiGroup.add(femHeadMesh);

    // Greater trochanter (lateral upper prominence)
    const trochanterGeo = new THREE.BoxGeometry(0.028, 0.038, 0.032);
    applyVertexColors(trochanterGeo, 0xede8dc, 0.05);
    const trochanterMesh = new THREE.Mesh(trochanterGeo, matBone);
    trochanterMesh.position.set(side * 0.145, 0.735, 0.005);
    asthiGroup.add(trochanterMesh);

    // Femoral shaft (sturdy cylindrical bone with anterior bow)
    const femShaftPts = [
      [side * 0.13, 0.72, 0.01],
      [side * 0.125, 0.58, 0.022], // Anterior curvature
      [side * 0.11, 0.44, 0.018],
      [side * 0.105, 0.38, 0.008],
    ];
    const femShaftMesh = createTubeMesh(femShaftPts, 0.018, 12, `asthi_femur_${side > 0 ? 'r' : 'l'}`, matBone);
    applyVertexColors(femShaftMesh.geometry, 0xede8dc, 0.05);
    asthiGroup.add(femShaftMesh);

    // Femoral distal condyles (bicondylar knee articulation)
    const femCondylesGeo = new THREE.BoxGeometry(0.048, 0.032, 0.042);
    applyVertexColors(femCondylesGeo, 0xede8dc, 0.04);
    const femCondylesMesh = new THREE.Mesh(femCondylesGeo, matBone);
    femCondylesMesh.position.set(side * 0.105, 0.365, 0.005);
    asthiGroup.add(femCondylesMesh);

    // B. Patella (Sesamoid Kneecap)
    const patellaGeo = new THREE.SphereGeometry(0.016, 12, 12);
    patellaGeo.scale(1.1, 1.25, 0.55);
    applyVertexColors(patellaGeo, 0xede8dc, 0.04);
    const patellaMesh = new THREE.Mesh(patellaGeo, matBone);
    patellaMesh.name = `asthi_patella_${side > 0 ? 'r' : 'l'}`;
    patellaMesh.position.set(side * 0.105, 0.365, 0.036);
    asthiGroup.add(patellaMesh);

    // C. Tibia (Shin bone with broad plateau, anterior crest & medial malleolus)
    // Tibial plateau
    const tibPlateauGeo = new THREE.CylinderGeometry(0.026, 0.024, 0.022, 14);
    tibPlateauGeo.scale(1.2, 1, 0.9);
    applyVertexColors(tibPlateauGeo, 0xede8dc, 0.04);
    const tibPlateauMesh = new THREE.Mesh(tibPlateauGeo, matBone);
    tibPlateauMesh.position.set(side * 0.105, 0.34, 0.005);
    asthiGroup.add(tibPlateauMesh);

    // Tibia shaft
    const tibShaftGeo = new THREE.CylinderGeometry(0.016, 0.013, 0.30, 12);
    applyVertexColors(tibShaftGeo, 0xede8dc, 0.05);
    const tibShaftMesh = new THREE.Mesh(tibShaftGeo, matBone);
    tibShaftMesh.name = `asthi_tibia_${side > 0 ? 'r' : 'l'}`;
    tibShaftMesh.position.set(side * 0.102, 0.18, 0.008);
    asthiGroup.add(tibShaftMesh);

    // Medial malleolus (inner ankle bone)
    const medMallGeo = new THREE.SphereGeometry(0.012, 10, 10);
    applyVertexColors(medMallGeo, 0xede8dc, 0.04);
    const medMallMesh = new THREE.Mesh(medMallGeo, matBone);
    medMallMesh.position.set(side * 0.088, 0.045, 0.008);
    asthiGroup.add(medMallMesh);

    // D. Fibula (Slender lateral stabilizer bone & lateral malleolus)
    const fibShaftGeo = new THREE.CylinderGeometry(0.007, 0.008, 0.31, 8);
    applyVertexColors(fibShaftGeo, 0xede8dc, 0.04);
    const fibShaftMesh = new THREE.Mesh(fibShaftGeo, matBone);
    fibShaftMesh.name = `asthi_fibula_${side > 0 ? 'r' : 'l'}`;
    fibShaftMesh.position.set(side * 0.128, 0.18, -0.005);
    asthiGroup.add(fibShaftMesh);

    // Lateral malleolus (outer ankle bone)
    const latMallGeo = new THREE.SphereGeometry(0.012, 10, 10);
    applyVertexColors(latMallGeo, 0xede8dc, 0.04);
    const latMallMesh = new THREE.Mesh(latMallGeo, matBone);
    latMallMesh.position.set(side * 0.134, 0.038, -0.005);
    asthiGroup.add(latMallMesh);

    // E. Anatomical Foot (Calcaneus heel, Talus ankle, Arched Metatarsals & Toes)
    // Calcaneus (prominent heel projecting backwards)
    const calcaneusGeo = new THREE.BoxGeometry(0.032, 0.035, 0.068);
    applyVertexColors(calcaneusGeo, 0xede8dc, 0.05);
    const calcaneusMesh = new THREE.Mesh(calcaneusGeo, matBone);
    calcaneusMesh.name = `asthi_calcaneus_${side > 0 ? 'r' : 'l'}`;
    calcaneusMesh.position.set(side * 0.105, 0.025, -0.045);
    asthiGroup.add(calcaneusMesh);

    // Talus (articulates with tibia)
    const talusGeo = new THREE.BoxGeometry(0.032, 0.024, 0.038);
    applyVertexColors(talusGeo, 0xede8dc, 0.04);
    const talusMesh = new THREE.Mesh(talusGeo, matBone);
    talusMesh.position.set(side * 0.105, 0.045, -0.005);
    asthiGroup.add(talusMesh);

    // 5 Metatarsals forming longitudinal arch of foot
    [-0.014, -0.007, 0.0, 0.007, 0.014].forEach((tOff, tIdx) => {
      const metaLen = tIdx === 0 ? 0.075 : 0.070;
      const metaGeo = new THREE.CylinderGeometry(0.004, 0.005, metaLen, 6);
      metaGeo.rotateX(Math.PI * 0.42);
      applyVertexColors(metaGeo, 0xede8dc, 0.04);
      const metaMesh = new THREE.Mesh(metaGeo, matBone);
      metaMesh.position.set(side * (0.105 + tOff), 0.018, 0.035);
      asthiGroup.add(metaMesh);

      // Toe phalanges
      const toeGeo = new THREE.CylinderGeometry(0.0035, 0.004, 0.028, 6);
      toeGeo.rotateX(Math.PI * 0.5);
      applyVertexColors(toeGeo, 0xede8dc, 0.04);
      const toeMesh = new THREE.Mesh(toeGeo, matBone);
      toeMesh.position.set(side * (0.105 + tOff), 0.012, 0.082);
      asthiGroup.add(toeMesh);
    });
  });

  humanGroup.add(asthiGroup);

  // =========================================================
  // 2. RAKTA DHATU: CARDIOVASCULAR & BLOOD SYSTEM
  // =========================================================
  const raktaGroup = new THREE.Group();
  raktaGroup.name = 'region_rakta';
  raktaGroup.userData = {
    dhatuSlug: 'rakta',
    dhatuName: 'Rakta',
    displayName: 'Rakta Dhatu (Vascular Network & Blood Organs)',
  };

  // --- 2.1 REALISTIC HEART (Muscular Apex, Atria & Coronary Vessels) ---
  // A. Cardiac Myocardium (anatomical heart tilted obliquely to left)
  const heartGeo = new THREE.SphereGeometry(0.042, 28, 24);
  const hPos = heartGeo.attributes.position;
  for (let i = 0; i < hPos.count; i++) {
    tempV.fromBufferAttribute(hPos, i);
    // Tapering towards cardiac apex
    if (tempV.y < 0) {
      const factor = 1.0 + tempV.y * 12.0;
      tempV.x *= Math.max(0.3, factor);
      tempV.z *= Math.max(0.4, factor);
      tempV.x -= 0.015; // Apex tilted to the left
    }
    // Right ventricle anterior bulge
    if (tempV.z > 0 && tempV.x > -0.01) {
      tempV.z += 0.012;
    }
    hPos.setXYZ(i, tempV.x, tempV.y, tempV.z);
  }
  heartGeo.computeVertexNormals();
  applyVertexColors(heartGeo, 0xa82024, 0.08);
  const heartMesh = new THREE.Mesh(heartGeo, matHeart);
  heartMesh.name = 'rakta_heart_organ';
  heartMesh.position.set(-0.015, 1.25, 0.042);
  raktaGroup.add(heartMesh);

  // B. Left and Right Atria / Auricles
  [-1, 1].forEach((side) => {
    const atriumGeo = new THREE.SphereGeometry(0.022, 14, 14);
    atriumGeo.scale(1.2, 0.9, 1.0);
    applyVertexColors(atriumGeo, 0x8a181c, 0.06);
    const atriumMesh = new THREE.Mesh(atriumGeo, matHeart);
    atriumMesh.name = `rakta_atrium_${side > 0 ? 'r' : 'l'}`;
    atriumMesh.position.set(-0.015 + side * 0.028, 1.285, 0.025);
    raktaGroup.add(atriumMesh);
  });

  // C. Ascending Aorta & Grand Aortic Arch with 3 Supra-Aortic Branches
  const aortaArchPts = [
    [-0.015, 1.27, 0.042], // Left ventricle root
    [-0.008, 1.31, 0.038], // Ascending aorta
    [-0.005, 1.34, 0.025], // Peak of arch
    [-0.012, 1.33, 0.005], // Curving left and back
    [-0.012, 1.25, -0.012], // Descending thoracic aorta
    [-0.008, 1.10, -0.016],
    [-0.005, 0.95, -0.012], // Abdominal aorta
    [0.0, 0.82, -0.010], // Aortic bifurcation at L4
  ];
  const aortaMesh = createTubeMesh(aortaArchPts, 0.013, 14, 'rakta_aorta_trunk', matArtery);
  applyVertexColors(aortaMesh.geometry, 0xcc1f26, 0.05);
  raktaGroup.add(aortaMesh);

  // 3 Supra-aortic great vessels from arch
  // 1. Brachiocephalic trunk
  const brachioPts = [
    [-0.005, 1.338, 0.030],
    [0.015, 1.365, 0.026],
    [0.028, 1.395, 0.022],
  ];
  const brachioMesh = createTubeMesh(brachioPts, 0.007, 8, 'rakta_brachiocephalic', matArtery);
  applyVertexColors(brachioMesh.geometry, 0xcc1f26, 0.04);
  raktaGroup.add(brachioMesh);

  // 2. Left common carotid
  const leftCarotidPts = [
    [-0.008, 1.339, 0.022],
    [-0.018, 1.375, 0.020],
    [-0.024, 1.42, 0.018],
  ];
  const leftCarotidMesh = createTubeMesh(leftCarotidPts, 0.006, 8, 'rakta_left_carotid', matArtery);
  applyVertexColors(leftCarotidMesh.geometry, 0xcc1f26, 0.04);
  raktaGroup.add(leftCarotidMesh);

  // 3. Left subclavian artery
  const leftSubclavianPts = [
    [-0.011, 1.335, 0.014],
    [-0.035, 1.365, 0.008],
    [-0.075, 1.360, 0.005],
  ];
  const leftSubMesh = createTubeMesh(leftSubclavianPts, 0.006, 8, 'rakta_left_subclavian', matArtery);
  applyVertexColors(leftSubMesh.geometry, 0xcc1f26, 0.04);
  raktaGroup.add(leftSubMesh);

  // D. Pulmonary Trunk & Arteries
  const pulmTrunkPts = [
    [-0.012, 1.275, 0.052], // Emerging from RV
    [-0.002, 1.305, 0.045],
    [0.005, 1.32, 0.025], // Bifurcation under aortic arch
  ];
  const pulmTrunkMesh = createTubeMesh(pulmTrunkPts, 0.010, 10, 'rakta_pulmonary_trunk', matVein);
  applyVertexColors(pulmTrunkMesh.geometry, 0x1e56a0, 0.05);
  raktaGroup.add(pulmTrunkMesh);

  [-1, 1].forEach((side) => {
    const pulmBranchPts = [
      [0.005, 1.32, 0.025],
      [side * 0.045, 1.31, 0.015],
      [side * 0.08, 1.28, 0.01],
    ];
    const pulmBranchMesh = createTubeMesh(pulmBranchPts, 0.0065, 8, `rakta_pulmonary_art_${side > 0 ? 'r' : 'l'}`, matVein);
    applyVertexColors(pulmBranchMesh.geometry, 0x1e56a0, 0.05);
    raktaGroup.add(pulmBranchMesh);
  });

  // E. Superior & Inferior Vena Cava
  const svcPts = [
    [0.018, 1.41, 0.018],
    [0.016, 1.35, 0.022],
    [0.012, 1.28, 0.028], // Entering right atrium
  ];
  const svcMesh = createTubeMesh(svcPts, 0.011, 10, 'rakta_vena_cava_superior', matVein);
  applyVertexColors(svcMesh.geometry, 0x1e56a0, 0.05);
  raktaGroup.add(svcMesh);

  const ivcPts = [
    [0.008, 0.82, -0.005],
    [0.012, 0.98, -0.008],
    [0.014, 1.12, 0.005],
    [0.012, 1.24, 0.025], // Entering right atrium
  ];
  const ivcMesh = createTubeMesh(ivcPts, 0.012, 10, 'rakta_vena_cava_inferior', matVein);
  applyVertexColors(ivcMesh.geometry, 0x1e56a0, 0.05);
  raktaGroup.add(ivcMesh);

  // --- 2.2 SYSTEMIC VASCULAR TREE (Carotids, Peripheral Arteries & Deep Veins) ---
  [-1, 1].forEach((side) => {
    // Carotid arteries to head & brain
    const carotidPts = [
      [side * 0.025, 1.38, 0.020],
      [side * 0.035, 1.46, 0.018],
      [side * 0.042, 1.54, 0.015],
      [side * 0.038, 1.62, 0.012], // Internal carotid entering skull base
    ];
    const carotidMesh = createTubeMesh(carotidPts, 0.0055, 8, `rakta_carotid_${side > 0 ? 'r' : 'l'}`, matArtery);
    applyVertexColors(carotidMesh.geometry, 0xcc1f26, 0.04);
    raktaGroup.add(carotidMesh);

    // Jugular veins draining cranium
    const jugularPts = [
      [side * 0.048, 1.60, 0.008],
      [side * 0.045, 1.52, 0.014],
      [side * 0.038, 1.44, 0.016],
      [side * 0.024, 1.38, 0.018],
    ];
    const jugularMesh = createTubeMesh(jugularPts, 0.006, 8, `rakta_jugular_${side > 0 ? 'r' : 'l'}`, matVein);
    applyVertexColors(jugularMesh.geometry, 0x1e56a0, 0.04);
    raktaGroup.add(jugularMesh);

    // Brachial arteries down upper arms
    const brachialPts = [
      [side * 0.075, 1.36, 0.005],
      [side * 0.16, 1.32, 0.002],
      [side * 0.20, 1.20, 0.012],
      [side * 0.22, 1.06, 0.015], // Cubital fossa
      [side * 0.24, 0.92, 0.022], // Radial artery
      [side * 0.27, 0.78, 0.020], // Palmar arch
    ];
    const brachialMesh = createTubeMesh(brachialPts, 0.005, 8, `rakta_brachial_${side > 0 ? 'r' : 'l'}`, matArtery);
    applyVertexColors(brachialMesh.geometry, 0xcc1f26, 0.04);
    raktaGroup.add(brachialMesh);

    // Iliac & Femoral arteries down legs
    const femoralPts = [
      [side * 0.012, 0.81, -0.01],
      [side * 0.045, 0.74, 0.02], // External iliac through femoral canal
      [side * 0.082, 0.65, 0.035], // Femoral triangle
      [side * 0.095, 0.48, 0.028], // Hunter's canal
      [side * 0.098, 0.36, -0.005], // Popliteal artery behind knee
      [side * 0.095, 0.22, 0.012], // Tibial artery down shin
      [side * 0.088, 0.06, 0.018],
      [side * 0.095, 0.02, 0.055], // Plantar arterial arch
    ];
    const femoralMesh = createTubeMesh(femoralPts, 0.0065, 8, `rakta_femoral_${side > 0 ? 'r' : 'l'}`, matArtery);
    applyVertexColors(femoralMesh.geometry, 0xcc1f26, 0.04);
    raktaGroup.add(femoralMesh);

    // Femoral & Great Saphenous deep veins
    const saphenousPts = [
      [side * 0.092, 0.02, 0.052],
      [side * 0.078, 0.15, 0.018],
      [side * 0.082, 0.35, 0.008],
      [side * 0.075, 0.55, 0.032],
      [side * 0.052, 0.72, 0.025],
      [side * 0.018, 0.80, -0.005],
    ];
    const saphenousMesh = createTubeMesh(saphenousPts, 0.006, 8, `rakta_saphenous_${side > 0 ? 'r' : 'l'}`, matVein);
    applyVertexColors(saphenousMesh.geometry, 0x1e56a0, 0.04);
    raktaGroup.add(saphenousMesh);
  });

  // --- 2.3 RAKTA ORGANS: LIVER (YAKRIT) & SPLEEN (PLEEHA) ---
  // A. Yakrit (Liver): Anatomical right & left lobes with falciform demarcation
  const liverGeo = new THREE.SphereGeometry(0.072, 28, 24);
  const livPos = liverGeo.attributes.position;
  for (let i = 0; i < livPos.count; i++) {
    tempV.fromBufferAttribute(livPos, i);
    // Asymmetric wedge: Right lobe large and thick, left lobe tapering thin
    if (tempV.x > 0) {
      tempV.x *= 1.45;
      tempV.y *= 1.05;
    } else {
      tempV.x *= 0.85;
      tempV.z *= 0.75;
      tempV.y *= 0.85;
    }
    // Superior diaphragmatic convexity
    if (tempV.y > 0) tempV.y *= 0.85;
    // Flat visceral inferior surface
    if (tempV.y < -0.01) tempV.y *= 0.65;
    livPos.setXYZ(i, tempV.x, tempV.y, tempV.z);
  }
  liverGeo.computeVertexNormals();
  applyVertexColors(liverGeo, 0x6e261f, 0.08);
  const liverMesh = new THREE.Mesh(liverGeo, matLiver);
  liverMesh.name = 'rakta_liver_yakrit';
  liverMesh.position.set(0.065, 1.12, 0.038);
  raktaGroup.add(liverMesh);

  // B. Pleeha (Spleen): Crescentic purple lymphoid organ in left hypochondrium
  const spleenGeo = new THREE.SphereGeometry(0.038, 20, 18);
  spleenGeo.scale(1.3, 0.8, 0.65);
  spleenGeo.rotateZ(0.35);
  applyVertexColors(spleenGeo, 0x5a1836, 0.06);
  const spleenMesh = new THREE.Mesh(spleenGeo, matSpleen);
  spleenMesh.name = 'rakta_spleen_pleeha';
  spleenMesh.position.set(-0.115, 1.14, 0.012);
  raktaGroup.add(spleenMesh);

  humanGroup.add(raktaGroup);

  // =========================================================
  // 3. RASA DHATU: PLASMA & LYMPHATIC NETWORK
  // =========================================================
  const rasaGroup = new THREE.Group();
  rasaGroup.name = 'region_rasa';
  rasaGroup.userData = {
    dhatuSlug: 'rasa',
    dhatuName: 'Rasa',
    displayName: 'Rasa Dhatu (Cardiovascular Plasma & Lymphatic Nexus)',
  };

  // Central Thoracic Lymph Duct ascending through mediastinum
  const lymphDuctPts = [
    [0.008, 0.98, -0.005], // Cisterna chyli
    [0.010, 1.12, -0.008],
    [0.008, 1.25, 0.010],
    [-0.012, 1.34, 0.015],
    [-0.032, 1.38, 0.012], // Left venous angle junction
  ];
  const lymphDuctMesh = createTubeMesh(lymphDuctPts, 0.006, 8, 'rasa_thoracic_lymph', matLymph);
  applyVertexColors(lymphDuctMesh.geometry, 0x38bdf8, 0.05);
  rasaGroup.add(lymphDuctMesh);

  // Central Hridaya Rasa Core (Fluid exchange surrounding heart)
  const rasaCoreGeo = new THREE.SphereGeometry(0.052, 20, 20);
  rasaCoreGeo.scale(1.1, 0.9, 1.0);
  applyVertexColors(rasaCoreGeo, 0x38bdf8, 0.05);
  const rasaCoreMesh = new THREE.Mesh(rasaCoreGeo, matLymph);
  rasaCoreMesh.name = 'rasa_core_hridaya';
  rasaCoreMesh.position.set(0.015, 1.26, 0.035);
  rasaGroup.add(rasaCoreMesh);

  // Lymphatic node clusters across major regional basins
  const lymphNodeBasins = [
    // Cervical chain
    [0.035, 1.45, 0.018],
    [-0.035, 1.45, 0.018],
    [0.040, 1.40, 0.020],
    [-0.040, 1.40, 0.020],
    // Axillary clusters
    [0.135, 1.33, 0.008],
    [-0.135, 1.33, 0.008],
    [0.145, 1.30, 0.012],
    [-0.145, 1.30, 0.012],
    // Mediastinal & Mesenteric clusters
    [0.025, 1.18, 0.015],
    [-0.025, 1.18, 0.015],
    [0.018, 1.05, 0.022],
    [-0.018, 1.05, 0.022],
    // Inguinal groin clusters
    [0.055, 0.74, 0.048],
    [-0.055, 0.74, 0.048],
    [0.068, 0.72, 0.042],
    [-0.068, 0.72, 0.042],
  ];

  lymphNodeBasins.forEach(([x, y, z], nIdx) => {
    const nodeGeo = new THREE.SphereGeometry(0.012, 10, 10);
    applyVertexColors(nodeGeo, 0x38bdf8, 0.04);
    const nodeMesh = new THREE.Mesh(nodeGeo, matLymph);
    nodeMesh.name = `rasa_node_${nIdx}`;
    nodeMesh.position.set(x, y, z);
    rasaGroup.add(nodeMesh);
  });

  humanGroup.add(rasaGroup);

  // =========================================================
  // 4. MAMSA DHATU: REALISTIC ANATOMICAL MUSCULAR SYSTEM
  // =========================================================
  const mamsaGroup = new THREE.Group();
  mamsaGroup.name = 'region_mamsa';
  mamsaGroup.userData = {
    dhatuSlug: 'mamsa',
    dhatuName: 'Mamsa',
    displayName: 'Mamsa Dhatu (Musculoskeletal Mantle & Structural Form)',
  };

  // --- 4.1 HEAD & NECK MUSCULATURE ---
  [-1, 1].forEach((side) => {
    // Masseter (strong jaw muscle)
    const masseterGeo = new THREE.BoxGeometry(0.018, 0.038, 0.028);
    applyVertexColors(masseterGeo, 0xbf382c, 0.06);
    const masseterMesh = new THREE.Mesh(masseterGeo, matMuscle);
    masseterMesh.name = `mamsa_masseter_${side > 0 ? 'r' : 'l'}`;
    masseterMesh.position.set(side * 0.062, 1.575, 0.028);
    mamsaGroup.add(masseterMesh);

    // Sternocleidomastoid (diagonal neck strap muscle)
    const scmPts = [
      [side * 0.025, 1.38, 0.065], // Sternal head
      [side * 0.045, 1.46, 0.035],
      [side * 0.068, 1.55, -0.012], // Mastoid insertion
    ];
    const scmMesh = createTubeMesh(scmPts, 0.011, 8, `mamsa_scm_${side > 0 ? 'r' : 'l'}`, matMuscle);
    applyVertexColors(scmMesh.geometry, 0xbf382c, 0.06);
    mamsaGroup.add(scmMesh);
  });

  // --- 4.2 TORSO & SHOULDER MUSCULATURE ---
  [-1, 1].forEach((side) => {
    // Pectoralis Major (broad chest muscle with clavicular & sternal heads)
    const pecGeo = new THREE.BoxGeometry(0.11, 0.088, 0.032);
    pecGeo.scale(1, 1, 0.7);
    applyVertexColors(pecGeo, 0xbf382c, 0.08);
    const pecMesh = new THREE.Mesh(pecGeo, matMuscle);
    pecMesh.name = `mamsa_pec_${side > 0 ? 'r' : 'l'}`;
    pecMesh.position.set(side * 0.085, 1.285, 0.086);
    pecMesh.rotation.z = side * -0.16;
    pecMesh.rotation.y = side * 0.12;
    mamsaGroup.add(pecMesh);

    // Deltoid (tripartite shoulder muscle capping the shoulder)
    const deltGeo = new THREE.SphereGeometry(0.052, 18, 16);
    deltGeo.scale(1.1, 1.4, 0.95);
    applyVertexColors(deltGeo, 0xbf382c, 0.07);
    const deltMesh = new THREE.Mesh(deltGeo, matMuscle);
    deltMesh.name = `mamsa_deltoid_${side > 0 ? 'r' : 'l'}`;
    deltMesh.position.set(side * 0.23, 1.32, 0.005);
    mamsaGroup.add(deltMesh);

    // Serratus Anterior (saw-tooth muscle over lateral ribs)
    [1.24, 1.20, 1.16, 1.12].forEach((sY, sIdx) => {
      const serrGeo = new THREE.BoxGeometry(0.042, 0.018, 0.022);
      applyVertexColors(serrGeo, 0xbf382c, 0.06);
      const serrMesh = new THREE.Mesh(serrGeo, matMuscle);
      serrMesh.name = `mamsa_serratus_${sIdx}_${side > 0 ? 'r' : 'l'}`;
      serrMesh.position.set(side * 0.155, sY, 0.028);
      serrMesh.rotation.z = side * -0.22;
      mamsaGroup.add(serrMesh);
    });

    // External Oblique (flank muscle)
    const obliqueGeo = new THREE.BoxGeometry(0.045, 0.14, 0.032);
    applyVertexColors(obliqueGeo, 0xbf382c, 0.06);
    const obliqueMesh = new THREE.Mesh(obliqueGeo, matMuscle);
    obliqueMesh.name = `mamsa_oblique_${side > 0 ? 'r' : 'l'}`;
    obliqueMesh.position.set(side * 0.128, 1.02, 0.035);
    obliqueMesh.rotation.z = side * -0.15;
    mamsaGroup.add(obliqueMesh);
  });

  // Rectus Abdominis (Anatomical 6-pack with Linea Alba & Tendinous Inscriptions)
  [1.15, 1.07, 0.99, 0.91].forEach((yAbs, aIdx) => {
    [-1, 1].forEach((side) => {
      const absGeo = new THREE.BoxGeometry(0.044, 0.062, 0.022);
      applyVertexColors(absGeo, 0xbf382c, 0.07);
      const absMesh = new THREE.Mesh(absGeo, matMuscle);
      absMesh.name = `mamsa_abs_${aIdx}_${side > 0 ? 'r' : 'l'}`;
      absMesh.position.set(side * 0.034, yAbs, 0.082);
      mamsaGroup.add(absMesh);
    });
  });

  // --- 4.3 UPPER LIMB MUSCULATURE ---
  [-1, 1].forEach((side) => {
    // Biceps Brachii (two-headed fusiform arm muscle)
    const bicepGeo = new THREE.CapsuleGeometry(0.028, 0.14, 8, 14);
    applyVertexColors(bicepGeo, 0xbf382c, 0.07);
    const bicepMesh = new THREE.Mesh(bicepGeo, matMuscle);
    bicepMesh.name = `mamsa_bicep_${side > 0 ? 'r' : 'l'}`;
    bicepMesh.position.set(side * 0.235, 1.19, 0.024);
    bicepMesh.rotation.z = side * -0.10;
    mamsaGroup.add(bicepMesh);

    // Triceps Brachii (posterior arm extensor)
    const tricepGeo = new THREE.CapsuleGeometry(0.032, 0.16, 8, 14);
    applyVertexColors(tricepGeo, 0xbf382c, 0.07);
    const tricepMesh = new THREE.Mesh(tricepGeo, matMuscle);
    tricepMesh.name = `mamsa_tricep_${side > 0 ? 'r' : 'l'}`;
    tricepMesh.position.set(side * 0.23, 1.18, -0.022);
    tricepMesh.rotation.z = side * -0.10;
    mamsaGroup.add(tricepMesh);

    // Forearm flexor & extensor bellies
    const forearmMuscGeo = new THREE.CapsuleGeometry(0.032, 0.18, 8, 14);
    applyVertexColors(forearmMuscGeo, 0xbf382c, 0.06);
    const forearmMuscMesh = new THREE.Mesh(forearmMuscGeo, matMuscle);
    forearmMuscMesh.name = `mamsa_forearm_${side > 0 ? 'r' : 'l'}`;
    forearmMuscMesh.position.set(side * 0.265, 0.93, 0.012);
    forearmMuscMesh.rotation.z = side * -0.09;
    mamsaGroup.add(forearmMuscMesh);
  });

  // --- 4.4 LOWER LIMB MUSCULATURE ---
  [-1, 1].forEach((side) => {
    // Gluteus Maximus (powerful buttocks musculature)
    const gluteGeo = new THREE.SphereGeometry(0.072, 18, 16);
    gluteGeo.scale(1.1, 1.3, 0.9);
    applyVertexColors(gluteGeo, 0xbf382c, 0.07);
    const gluteMesh = new THREE.Mesh(gluteGeo, matMuscle);
    gluteMesh.name = `mamsa_gluteus_${side > 0 ? 'r' : 'l'}`;
    gluteMesh.position.set(side * 0.10, 0.72, -0.042);
    mamsaGroup.add(gluteMesh);

    // Quadriceps: Rectus femoris, Vastus lateralis, Vastus medialis teardrop
    // Rectus femoris (anterior central)
    const quadGeo = new THREE.CapsuleGeometry(0.045, 0.22, 8, 14);
    applyVertexColors(quadGeo, 0xbf382c, 0.07);
    const quadMesh = new THREE.Mesh(quadGeo, matMuscle);
    quadMesh.name = `mamsa_quad_${side > 0 ? 'r' : 'l'}`;
    quadMesh.position.set(side * 0.115, 0.54, 0.038);
    mamsaGroup.add(quadMesh);

    // Vastus medialis (anatomical teardrop bulging above medial knee)
    const vastusMedGeo = new THREE.SphereGeometry(0.038, 14, 14);
    vastusMedGeo.scale(0.85, 1.4, 0.9);
    applyVertexColors(vastusMedGeo, 0xbf382c, 0.06);
    const vastusMedMesh = new THREE.Mesh(vastusMedGeo, matMuscle);
    vastusMedMesh.name = `mamsa_vastus_med_${side > 0 ? 'r' : 'l'}`;
    vastusMedMesh.position.set(side * 0.082, 0.43, 0.032);
    mamsaGroup.add(vastusMedMesh);

    // Gastrocnemius (medial & lateral calf muscle bellies)
    const calfGeo = new THREE.SphereGeometry(0.046, 16, 16);
    calfGeo.scale(0.95, 1.8, 1.05);
    applyVertexColors(calfGeo, 0xbf382c, 0.07);
    const calfMesh = new THREE.Mesh(calfGeo, matMuscle);
    calfMesh.name = `mamsa_calf_${side > 0 ? 'r' : 'l'}`;
    calfMesh.position.set(side * 0.105, 0.22, -0.024);
    mamsaGroup.add(calfMesh);

    // Tibialis Anterior (anterior shin muscle)
    const tibMuscGeo = new THREE.CapsuleGeometry(0.022, 0.20, 6, 12);
    applyVertexColors(tibMuscGeo, 0xbf382c, 0.06);
    const tibMuscMesh = new THREE.Mesh(tibMuscGeo, matMuscle);
    tibMuscMesh.name = `mamsa_tibialis_${side > 0 ? 'r' : 'l'}`;
    tibMuscMesh.position.set(side * 0.118, 0.20, 0.028);
    mamsaGroup.add(tibMuscMesh);
  });

  humanGroup.add(mamsaGroup);

  // =========================================================
  // 5. MEDA DHATU: ADIPOSE TISSUE & LIPID DEPOTS
  // =========================================================
  const medaGroup = new THREE.Group();
  medaGroup.name = 'region_meda';
  medaGroup.userData = {
    dhatuSlug: 'meda',
    dhatuName: 'Meda',
    displayName: 'Meda Dhatu (Adipose & Lipid Depots)',
  };

  // Greater Omentum / Vapavahana (Lobulated fatty apron covering intestines)
  const omentumGeo = new THREE.CylinderGeometry(0.125, 0.145, 0.20, 24, 4, false, 0, Math.PI * 1.1);
  omentumGeo.scale(1.15, 1, 0.75);
  const oPos = omentumGeo.attributes.position;
  for (let i = 0; i < oPos.count; i++) {
    tempV.fromBufferAttribute(oPos, i);
    // Natural fatty lobulation ripples
    const ripple = Math.sin(tempV.x * 28) * Math.cos(tempV.y * 22) * 0.008;
    tempV.z += ripple;
    oPos.setXYZ(i, tempV.x, tempV.y, tempV.z);
  }
  omentumGeo.computeVertexNormals();
  applyVertexColors(omentumGeo, 0xe6b800, 0.07);
  const omentumMesh = new THREE.Mesh(omentumGeo, matAdipose);
  omentumMesh.name = 'meda_omentum_vapa';
  omentumMesh.position.set(0, 0.98, 0.032);
  medaGroup.add(omentumMesh);

  // Flank & Lumbar lipid cushions (Kati region adipose pads)
  [-1, 1].forEach((side) => {
    const flankFatGeo = new THREE.SphereGeometry(0.055, 16, 16);
    flankFatGeo.scale(0.85, 1.5, 0.95);
    applyVertexColors(flankFatGeo, 0xe6b800, 0.06);
    const flankFatMesh = new THREE.Mesh(flankFatGeo, matAdipose);
    flankFatMesh.name = `meda_lumbar_${side > 0 ? 'r' : 'l'}`;
    flankFatMesh.position.set(side * 0.142, 0.97, -0.01);
    medaGroup.add(flankFatMesh);

    // Perirenal adipose capsule (protecting posterior kidneys)
    const renalFatGeo = new THREE.SphereGeometry(0.042, 14, 14);
    renalFatGeo.scale(0.9, 1.2, 0.9);
    applyVertexColors(renalFatGeo, 0xe6b800, 0.05);
    const renalFatMesh = new THREE.Mesh(renalFatGeo, matAdipose);
    renalFatMesh.name = `meda_perirenal_${side > 0 ? 'r' : 'l'}`;
    renalFatMesh.position.set(side * 0.065, 1.05, -0.028);
    medaGroup.add(renalFatMesh);
  });

  humanGroup.add(medaGroup);

  // =========================================================
  // 6. MAJJA DHATU: NEURAL AXIS & BONE MARROW
  // =========================================================
  const majjaGroup = new THREE.Group();
  majjaGroup.name = 'region_majja';
  majjaGroup.userData = {
    dhatuSlug: 'majja',
    dhatuName: 'Majja',
    displayName: 'Majja Dhatu (Neural Axis & Bone Marrow)',
  };

  // --- 6.1 MASTISHKA (BRAIN: Cerebral Hemispheres, Gyri/Sulci & Cerebellum) ---
  // Left and Right Cerebral Hemispheres
  [-1, 1].forEach((side) => {
    const hemiGeo = new THREE.SphereGeometry(0.068, 28, 24);
    hemiGeo.scale(0.85, 0.95, 1.25);
    const bPos = hemiGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      tempV.fromBufferAttribute(bPos, i);
      // Anatomical gyri & sulci cerebral convolutions
      const sulcus = (Math.sin(tempV.x * 55) * Math.cos(tempV.y * 55) * Math.sin(tempV.z * 55)) * 0.005;
      tempV.x += sulcus;
      tempV.y += sulcus;
      tempV.z += sulcus;
      // Flatten medial longitudinal fissure
      if ((side > 0 && tempV.x < 0) || (side < 0 && tempV.x > 0)) {
        tempV.x *= 0.3;
      }
      bPos.setXYZ(i, tempV.x, tempV.y, tempV.z);
    }
    hemiGeo.computeVertexNormals();
    applyVertexColors(hemiGeo, 0xa855f7, 0.08);
    const hemiMesh = new THREE.Mesh(hemiGeo, matNeural);
    hemiMesh.name = `majja_cerebrum_${side > 0 ? 'r' : 'l'}`;
    hemiMesh.position.set(side * 0.024, 1.66, 0.012);
    majjaGroup.add(hemiMesh);
  });

  // Cerebellum (fine horizontal folia fissures beneath occipital lobes)
  const cerebGeo = new THREE.SphereGeometry(0.042, 20, 18);
  cerebGeo.scale(1.4, 0.8, 1.0);
  applyVertexColors(cerebGeo, 0x9333ea, 0.06);
  const cerebMesh = new THREE.Mesh(cerebGeo, matNeural);
  cerebMesh.name = 'majja_cerebellum';
  cerebMesh.position.set(0, 1.595, -0.038);
  majjaGroup.add(cerebMesh);

  // Brainstem (Midbrain, Pons & Medulla Oblongata exiting through foramen magnum)
  const bstemPts = [
    [0, 1.61, -0.008],
    [0, 1.57, -0.012],
    [0, 1.53, -0.010],
  ];
  const bstemMesh = createTubeMesh(bstemPts, 0.012, 10, 'majja_brainstem', matNeural);
  applyVertexColors(bstemMesh.geometry, 0xa855f7, 0.05);
  majjaGroup.add(bstemMesh);

  // --- 6.2 SPINAL CORD (Sushumna / Medulla Spinalis & Cauda Equina) ---
  const spinalCordPts = [
    [0, 1.53, -0.010],
    [0, 1.48, 0.005], // Cervical enlargement
    [0, 1.38, -0.018],
    [0, 1.25, -0.040],
    [0, 1.10, -0.025],
    [0, 0.98, -0.005], // Lumbar enlargement
    [0, 0.88, -0.010], // Conus medullaris
    [0, 0.78, -0.035], // Cauda equina descending to sacrum
  ];
  const spinalCordMesh = createTubeMesh(spinalCordPts, 0.0085, 10, 'majja_spinal_cord', matNeural);
  applyVertexColors(spinalCordMesh.geometry, 0xa855f7, 0.06);
  majjaGroup.add(spinalCordMesh);

  // Bilateral segmental spinal nerve roots radiating between vertebrae
  [1.44, 1.36, 1.28, 1.20, 1.12, 1.04, 0.96].forEach((yNerve, nIdx) => {
    [-1, 1].forEach((side) => {
      const nervePts = [
        [0, yNerve, -0.02],
        [side * 0.028, yNerve - 0.005, -0.022],
        [side * 0.065, yNerve - 0.012, -0.015],
      ];
      const nerveMesh = createTubeMesh(nervePts, 0.0028, 6, `majja_nerve_${nIdx}_${side > 0 ? 'r' : 'l'}`, matNeural);
      applyVertexColors(nerveMesh.geometry, 0xa855f7, 0.04);
      majjaGroup.add(nerveMesh);
    });
  });

  // --- 6.3 BONE MARROW MEDULLARY CAVITIES ---
  [-1, 1].forEach((side) => {
    // Femoral active red/yellow bone marrow core
    const femMarrowPts = [
      [side * 0.125, 0.70, 0.01],
      [side * 0.12, 0.56, 0.02],
      [side * 0.11, 0.42, 0.015],
    ];
    const femMarrowMesh = createTubeMesh(femMarrowPts, 0.0085, 8, `majja_femur_core_${side > 0 ? 'r' : 'l'}`, matMarrow);
    applyVertexColors(femMarrowMesh.geometry, 0x882d46, 0.05);
    majjaGroup.add(femMarrowMesh);

    // Tibial marrow core
    const tibMarrowPts = [
      [side * 0.102, 0.30, 0.008],
      [side * 0.102, 0.18, 0.008],
      [side * 0.100, 0.08, 0.008],
    ];
    const tibMarrowMesh = createTubeMesh(tibMarrowPts, 0.0065, 8, `majja_tibia_core_${side > 0 ? 'r' : 'l'}`, matMarrow);
    applyVertexColors(tibMarrowMesh.geometry, 0x882d46, 0.05);
    majjaGroup.add(tibMarrowMesh);
  });

  humanGroup.add(majjaGroup);

  // =========================================================
  // 7. SHUKRA DHATU: REPRODUCTIVE ESSENCE & SYSTEMIC OJAS
  // =========================================================
  const shukraGroup = new THREE.Group();
  shukraGroup.name = 'region_shukra';
  shukraGroup.userData = {
    dhatuSlug: 'shukra',
    dhatuName: 'Shukra',
    displayName: 'Shukra Dhatu (Reproductive Essence & Vitality)',
  };

  // Pelvic reproductive center (vitality focus)
  const pelvicCoreGeo = new THREE.SphereGeometry(0.046, 20, 20);
  pelvicCoreGeo.scale(1.15, 0.95, 1.05);
  applyVertexColors(pelvicCoreGeo, 0x10b981, 0.06);
  const pelvicCoreMesh = new THREE.Mesh(pelvicCoreGeo, matVitality);
  pelvicCoreMesh.name = 'shukra_pelvic_focus';
  pelvicCoreMesh.position.set(0, 0.73, 0.042);
  shukraGroup.add(pelvicCoreMesh);

  // Bilateral radiant vitality conduits (Ojas ascending retroperitoneally)
  [-1, 1].forEach((side) => {
    const ojasPts = [
      [side * 0.022, 0.73, 0.045],
      [side * 0.065, 0.82, 0.035],
      [side * 0.052, 1.05, 0.025],
      [side * 0.035, 1.20, 0.030],
      [0.0, 1.25, 0.042], // Joining cardiac Ojas reservoir at Hridaya
    ];
    const ojasMesh = createTubeMesh(ojasPts, 0.006, 8, `shukra_conduit_${side > 0 ? 'r' : 'l'}`, matVitality);
    applyVertexColors(ojasMesh.geometry, 0x10b981, 0.05);
    shukraGroup.add(ojasMesh);

    // Inguinal vitality nodes
    const vitNodeGeo = new THREE.SphereGeometry(0.020, 12, 12);
    applyVertexColors(vitNodeGeo, 0x10b981, 0.04);
    const vitNodeMesh = new THREE.Mesh(vitNodeGeo, matVitality);
    vitNodeMesh.name = `shukra_vitality_node_${side > 0 ? 'r' : 'l'}`;
    vitNodeMesh.position.set(side * 0.062, 0.71, 0.048);
    shukraGroup.add(vitNodeMesh);
  });

  humanGroup.add(shukraGroup);

  // =========================================================
  // 8. HIGH-QUALITY SPECIMEN SILHOUETTE (Superficial Fascia / Skin)
  // Translucent medical specimen silhouette with refined human surface anatomy
  // =========================================================
  const silhouetteGroup = new THREE.Group();
  silhouetteGroup.name = 'human_silhouette';

  // Head & Facial Profile
  const headSilGeo = new THREE.SphereGeometry(0.118, 32, 28);
  const hsPos = headSilGeo.attributes.position;
  for (let i = 0; i < hsPos.count; i++) {
    tempV.fromBufferAttribute(hsPos, i);
    // Facial profile: nose, lips & chin
    if (tempV.z > 0.06 && Math.abs(tempV.x) < 0.04) {
      if (tempV.y > -0.01 && tempV.y < 0.025) tempV.z += 0.025; // Nose
      if (tempV.y > -0.045 && tempV.y < -0.02) tempV.z += 0.012; // Lips
      if (tempV.y > -0.08 && tempV.y < -0.05) tempV.z += 0.018; // Chin
    }
    // Crown & cranial vault
    if (tempV.y > 0.02) {
      tempV.y *= 1.15;
      tempV.z *= 1.08;
    }
    hsPos.setXYZ(i, tempV.x, tempV.y, tempV.z);
  }
  headSilGeo.computeVertexNormals();
  applyVertexColors(headSilGeo, 0x64748b, 0.05);
  const headSilMesh = new THREE.Mesh(headSilGeo, matSilhouette);
  headSilMesh.position.set(0, 1.63, 0);
  silhouetteGroup.add(headSilMesh);

  // Neck with thyroid cartilage contour
  const neckSilGeo = new THREE.CylinderGeometry(0.060, 0.072, 0.12, 20);
  applyVertexColors(neckSilGeo, 0x64748b, 0.04);
  const neckSilMesh = new THREE.Mesh(neckSilGeo, matSilhouette);
  neckSilMesh.position.set(0, 1.46, 0.005);
  silhouetteGroup.add(neckSilMesh);

  // Torso / Thorax with sternal notch & pectoral contour
  const chestSilGeo = new THREE.CylinderGeometry(0.185, 0.155, 0.32, 24);
  chestSilGeo.scale(1.30, 1.0, 0.88);
  applyVertexColors(chestSilGeo, 0x64748b, 0.05);
  const chestSilMesh = new THREE.Mesh(chestSilGeo, matSilhouette);
  chestSilMesh.position.set(0, 1.26, 0.015);
  silhouetteGroup.add(chestSilMesh);

  // Abdomen & Waist
  const abdomenSilGeo = new THREE.CylinderGeometry(0.148, 0.165, 0.26, 24);
  abdomenSilGeo.scale(1.22, 1.0, 0.85);
  applyVertexColors(abdomenSilGeo, 0x64748b, 0.05);
  const abdomenSilMesh = new THREE.Mesh(abdomenSilGeo, matSilhouette);
  abdomenSilMesh.position.set(0, 0.99, 0.012);
  silhouetteGroup.add(abdomenSilMesh);

  // Pelvis / Hips
  const pelvisSilGeo = new THREE.CylinderGeometry(0.168, 0.150, 0.22, 24);
  pelvisSilGeo.scale(1.28, 1.0, 0.90);
  applyVertexColors(pelvisSilGeo, 0x64748b, 0.05);
  const pelvisSilMesh = new THREE.Mesh(pelvisSilGeo, matSilhouette);
  pelvisSilMesh.position.set(0, 0.77, 0.008);
  silhouetteGroup.add(pelvisSilMesh);

  // Limbs Silhouette (Bilateral)
  [-1, 1].forEach((side) => {
    // Upper arm
    const uArmGeo = new THREE.CapsuleGeometry(0.052, 0.26, 8, 16);
    applyVertexColors(uArmGeo, 0x64748b, 0.04);
    const uArmMesh = new THREE.Mesh(uArmGeo, matSilhouette);
    uArmMesh.position.set(side * 0.25, 1.20, 0.005);
    uArmMesh.rotation.z = side * -0.12;
    silhouetteGroup.add(uArmMesh);

    // Forearm
    const fArmGeo = new THREE.CapsuleGeometry(0.045, 0.24, 8, 16);
    applyVertexColors(fArmGeo, 0x64748b, 0.04);
    const fArmMesh = new THREE.Mesh(fArmGeo, matSilhouette);
    fArmMesh.position.set(side * 0.29, 0.93, 0.018);
    fArmMesh.rotation.z = side * -0.10;
    silhouetteGroup.add(fArmMesh);

    // Hand
    const handGeo = new THREE.BoxGeometry(0.048, 0.11, 0.075);
    applyVertexColors(handGeo, 0x64748b, 0.03);
    const handMesh = new THREE.Mesh(handGeo, matSilhouette);
    handMesh.position.set(side * 0.32, 0.74, 0.018);
    silhouetteGroup.add(handMesh);

    // Thigh with natural quadriceps contour
    const thighGeo = new THREE.CapsuleGeometry(0.078, 0.36, 8, 16);
    applyVertexColors(thighGeo, 0x64748b, 0.04);
    const thighMesh = new THREE.Mesh(thighGeo, matSilhouette);
    thighMesh.position.set(side * 0.112, 0.54, 0.015);
    silhouetteGroup.add(thighMesh);

    // Knee & Calf
    const calfGeo = new THREE.CapsuleGeometry(0.062, 0.34, 8, 16);
    applyVertexColors(calfGeo, 0x64748b, 0.04);
    const calfMesh = new THREE.Mesh(calfGeo, matSilhouette);
    calfMesh.position.set(side * 0.108, 0.20, 0.005);
    silhouetteGroup.add(calfMesh);

    // Foot with arched sole
    const footGeo = new THREE.BoxGeometry(0.078, 0.068, 0.17);
    applyVertexColors(footGeo, 0x64748b, 0.03);
    const footMesh = new THREE.Mesh(footGeo, matSilhouette);
    footMesh.position.set(side * 0.108, 0.035, 0.045);
    silhouetteGroup.add(footMesh);
  });

  humanGroup.add(silhouetteGroup);

  return rootScene;
}

async function exportModel() {
  const modelsDir = path.resolve(__dirname, '../public/models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  console.log('Building high-quality, realistic anatomical human body specimen...');
  const scene = createRealisticHumanBodyModel();
  const exporter = new GLTFExporter();

  console.log('Exporting GLTF/GLB with full anatomical structures and 7 Dhatu systems...');
  await new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        const outputPath = path.join(modelsDir, 'human-body.glb');
        fs.writeFileSync(outputPath, Buffer.from(gltf));
        const stats = fs.statSync(outputPath);
        console.log(`Successfully generated high-detail GLB model at: ${outputPath}`);
        console.log(`Model file size: ${(stats.size / 1024).toFixed(2)} KB`);
        resolve();
      },
      (error) => {
        console.error('Error generating GLB model:', error);
        reject(error);
      },
      { binary: true }
    );
  });
}

exportModel().catch((err) => {
  console.error(err);
  process.exit(1);
});
