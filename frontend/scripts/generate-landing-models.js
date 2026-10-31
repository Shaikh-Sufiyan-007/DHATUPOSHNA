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

// Helper: assign realistic anatomical vertex colors with ambient depth and warm honey/amber base
function applyAmberVertexColors(geometry, baseHex = 0xd97724, variation = 0.08, aoFactor = 0.25) {
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const base = new THREE.Color(baseHex);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  geometry.computeBoundingBox();
  const bb = geometry.boundingBox || new THREE.Box3(new THREE.Vector3(-0.1, -0.1, -0.1), new THREE.Vector3(0.1, 0.1, 0.1));
  const height = Math.max(0.001, bb.max.y - bb.min.y);

  for (let i = 0; i < count; i++) {
    v.fromBufferAttribute(pos, i);
    // Subtle organic noise variation
    const noise = Math.sin(v.x * 50) * Math.cos(v.y * 50) * Math.sin(v.z * 50) * variation;
    const normY = (v.y - bb.min.y) / height;
    const depthShade = 1.0 - (1.0 - normY) * aoFactor * 0.4;

    const r = THREE.MathUtils.clamp((base.r + noise) * depthShade, 0, 1);
    const g = THREE.MathUtils.clamp((base.g + noise * 0.8) * depthShade, 0, 1);
    const b = THREE.MathUtils.clamp((base.b + noise * 0.5) * depthShade, 0, 1);

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function createTube(points, radius, radialSegments, name, material) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const geo = new THREE.TubeGeometry(curve, Math.max(16, points.length * 6), radius, radialSegments, false);
  applyAmberVertexColors(geo, 0xd97724, 0.05, 0.2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = name;
  return mesh;
}

// 1. HIGH-DETAIL ANATOMICAL AMBER SKULL MODEL (Centered at 0,0,0)
function buildHighDetailSkull(matAmber) {
  const skullGroup = new THREE.Group();
  skullGroup.name = 'AmberSkullModel';

  // 1.1 Cranium / Neurocranium
  const craniumGeo = new THREE.SphereGeometry(0.11, 72, 60);
  const pos = craniumGeo.attributes.position;
  const tempV = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    tempV.fromBufferAttribute(pos, i);

    // Frontal bone (forehead)
    if (tempV.y > 0.015 && tempV.z > 0.02) {
      tempV.z += 0.022;
      tempV.y += 0.008;
    }
    // Parietal vault (sides/top)
    if (tempV.y > 0.035) {
      tempV.x *= 1.12;
      tempV.z *= 1.14;
    }
    // Occiput (back of skull)
    if (tempV.z < -0.04 && tempV.y < 0.02 && tempV.y > -0.05) {
      tempV.z -= 0.025;
    }
    // Temporal fossa (temple indentations)
    if (Math.abs(tempV.x) > 0.07 && tempV.z > -0.02 && tempV.z < 0.05 && tempV.y < 0.045) {
      tempV.x *= 0.86;
    }
    // Supraorbital ridges (brow ridges)
    if (tempV.y > 0.018 && tempV.y < 0.035 && tempV.z > 0.075) {
      tempV.z += 0.014;
    }
    // Eye Sockets (Deep orbital cavities)
    const isOrbitY = tempV.y > -0.035 && tempV.y < 0.025;
    const isOrbitZ = tempV.z > 0.06;
    if (isOrbitY && isOrbitZ) {
      const distOrbitR = Math.hypot(tempV.x - 0.042, tempV.y - 0.002);
      const distOrbitL = Math.hypot(tempV.x + 0.042, tempV.y - 0.002);
      if (distOrbitR < 0.032) {
        tempV.z -= (0.032 - distOrbitR) * 1.15;
      }
      if (distOrbitL < 0.032) {
        tempV.z -= (0.032 - distOrbitL) * 1.15;
      }
    }
    // Nasal bridge projection
    if (Math.abs(tempV.x) < 0.016 && tempV.y > -0.03 && tempV.y < 0.022 && tempV.z > 0.065) {
      tempV.z += 0.028;
    }
    // Piriform aperture (nasal cavity recess)
    if (Math.abs(tempV.x) < 0.02 && tempV.y > -0.055 && tempV.y < -0.018 && tempV.z > 0.07) {
      tempV.z -= 0.028;
      tempV.x *= 0.75;
    }
    // Maxilla & upper dental arch
    if (tempV.y < -0.04 && tempV.y > -0.075 && tempV.z > 0.035) {
      tempV.z += 0.018;
      tempV.x *= 0.92;
    }
    // Skull base & foramen magnum
    if (tempV.y < -0.07 && tempV.z < 0.02) {
      tempV.y += 0.02;
    }

    pos.setXYZ(i, tempV.x, tempV.y, tempV.z);
  }

  craniumGeo.computeVertexNormals();
  applyAmberVertexColors(craniumGeo, 0xd97724, 0.06, 0.22);
  const craniumMesh = new THREE.Mesh(craniumGeo, matAmber);
  craniumMesh.name = 'asthi_cranium_skull';
  skullGroup.add(craniumMesh);

  // 1.2 Zygomatic Arches (Cheekbones)
  [-1, 1].forEach((side) => {
    const archPts = [
      [side * 0.028, -0.015, 0.076],
      [side * 0.074, -0.02, 0.055],
      [side * 0.082, -0.01, 0.012],
      [side * 0.074, -0.005, -0.032],
    ];
    const archMesh = createTube(archPts, 0.008, 10, `asthi_zygomatic_${side > 0 ? 'r' : 'l'}`, matAmber);
    skullGroup.add(archMesh);
  });

  // 1.3 Articulated Mandible (Jawbone with chin and TMJ condyles)
  const mandibleCurveL = [
    [0.0, -0.096, 0.086],   // Chin
    [-0.032, -0.094, 0.072],
    [-0.062, -0.086, 0.028], // Body of mandible
    [-0.074, -0.076, -0.01], // Angle of jaw (gonion)
    [-0.074, -0.026, -0.018], // Ascending ramus to TMJ
  ];
  const mandibleCurveR = [
    [0.0, -0.096, 0.086],
    [0.032, -0.094, 0.072],
    [0.062, -0.086, 0.028],
    [0.074, -0.076, -0.01],
    [0.074, -0.026, -0.018],
  ];
  const mandibleMeshL = createTube(mandibleCurveL, 0.01, 10, 'asthi_mandible_l', matAmber);
  const mandibleMeshR = createTube(mandibleCurveR, 0.01, 10, 'asthi_mandible_r', matAmber);
  skullGroup.add(mandibleMeshL);
  skullGroup.add(mandibleMeshR);

  // 1.4 Individual Upper and Lower Teeth
  [-1, 1].forEach((side) => {
    const upperTeeth = [
      [side * 0.005, -0.058, 0.080],
      [side * 0.016, -0.058, 0.076],
      [side * 0.027, -0.059, 0.062],
      [side * 0.036, -0.060, 0.044],
    ];
    const upperMesh = createTube(upperTeeth, 0.0048, 8, `asthi_teeth_upper_${side > 0 ? 'r' : 'l'}`, matAmber);
    skullGroup.add(upperMesh);

    const lowerTeeth = [
      [side * 0.005, -0.068, 0.077],
      [side * 0.015, -0.068, 0.073],
      [side * 0.025, -0.069, 0.059],
      [side * 0.034, -0.070, 0.041],
    ];
    const lowerMesh = createTube(lowerTeeth, 0.0044, 8, `asthi_teeth_lower_${side > 0 ? 'r' : 'l'}`, matAmber);
    skullGroup.add(lowerMesh);
  });

  return skullGroup;
}

// 2. VERTICALLY STRAIGHT SPINAL COLUMN MODEL
function buildVerticallyStraightSpine(matAmber, matDisc) {
  const spineGroup = new THREE.Group();
  spineGroup.name = 'AmberSpineModel';

  // 24 presacral vertebrae + sacrum + coccyx
  // Aligned perfectly on vertical axis (X=0, Z=0)
  const spineConfig = [
    // Cervical (C1 - C7) - Top
    { tag: 'c1', name: 'Atlas (C1)', region: 'cervical', y: 0.88, rad: 0.026, height: 0.028 },
    { tag: 'c2', name: 'Axis (C2)', region: 'cervical', y: 0.82, rad: 0.028, height: 0.030 },
    { tag: 'c3', name: 'Cervical C3', region: 'cervical', y: 0.76, rad: 0.030, height: 0.030 },
    { tag: 'c4', name: 'Cervical C4', region: 'cervical', y: 0.70, rad: 0.031, height: 0.031 },
    { tag: 'c5', name: 'Cervical C5', region: 'cervical', y: 0.64, rad: 0.032, height: 0.032 },
    { tag: 'c6', name: 'Cervical C6', region: 'cervical', y: 0.58, rad: 0.033, height: 0.032 },
    { tag: 'c7', name: 'Vertebra Prominens (C7)', region: 'cervical', y: 0.52, rad: 0.034, height: 0.034 },

    // Thoracic (T1 - T12) - Mid-upper
    { tag: 't1', name: 'Thoracic T1', region: 'thoracic', y: 0.45, rad: 0.036, height: 0.035 },
    { tag: 't2', name: 'Thoracic T2', region: 'thoracic', y: 0.38, rad: 0.037, height: 0.036 },
    { tag: 't3', name: 'Thoracic T3', region: 'thoracic', y: 0.31, rad: 0.038, height: 0.037 },
    { tag: 't4', name: 'Thoracic T4', region: 'thoracic', y: 0.24, rad: 0.039, height: 0.038 },
    { tag: 't5', name: 'Thoracic T5', region: 'thoracic', y: 0.17, rad: 0.040, height: 0.038 },
    { tag: 't6', name: 'Thoracic T6', region: 'thoracic', y: 0.10, rad: 0.041, height: 0.039 },
    { tag: 't7', name: 'Thoracic T7', region: 'thoracic', y: 0.03, rad: 0.042, height: 0.040 },
    { tag: 't8', name: 'Thoracic T8', region: 'thoracic', y: -0.04, rad: 0.043, height: 0.040 },
    { tag: 't9', name: 'Thoracic T9', region: 'thoracic', y: -0.11, rad: 0.044, height: 0.041 },
    { tag: 't10', name: 'Thoracic T10', region: 'thoracic', y: -0.18, rad: 0.045, height: 0.042 },
    { tag: 't11', name: 'Thoracic T11', region: 'thoracic', y: -0.25, rad: 0.046, height: 0.043 },
    { tag: 't12', name: 'Thoracic T12', region: 'thoracic', y: -0.32, rad: 0.047, height: 0.044 },

    // Lumbar (L1 - L5) - Lower weight-bearing
    { tag: 'l1', name: 'Lumbar L1', region: 'lumbar', y: -0.40, rad: 0.050, height: 0.047 },
    { tag: 'l2', name: 'Lumbar L2', region: 'lumbar', y: -0.48, rad: 0.052, height: 0.048 },
    { tag: 'l3', name: 'Lumbar L3', region: 'lumbar', y: -0.56, rad: 0.054, height: 0.050 },
    { tag: 'l4', name: 'Lumbar L4', region: 'lumbar', y: -0.64, rad: 0.056, height: 0.052 },
    { tag: 'l5', name: 'Lumbar L5', region: 'lumbar', y: -0.73, rad: 0.058, height: 0.054 },

    // Sacral & Coccygeal base
    { tag: 'sacrum', name: 'Sacrum & Coccyx', region: 'sacral', y: -0.88, rad: 0.062, height: 0.12 },
  ];

  spineConfig.forEach((vert, idx) => {
    // 1. Vertebra Body
    const vertGeo = new THREE.CylinderGeometry(vert.rad, vert.rad * 1.04, vert.height, 24);
    vertGeo.scale(1.25, 1, 0.95);
    applyAmberVertexColors(vertGeo, 0xd97724, 0.05, 0.25);

    const vertMesh = new THREE.Mesh(vertGeo, matAmber);
    vertMesh.name = `asthi_vertebra_${vert.tag}`;
    vertMesh.position.set(0, vert.y, 0);
    vertMesh.userData = {
      tag: vert.tag,
      name: vert.name,
      region: vert.region,
      index: idx,
    };
    spineGroup.add(vertMesh);

    // 2. Spinous Process (Posterior spine protrusion)
    const spinousGeo = new THREE.ConeGeometry(vert.rad * 0.28, vert.rad * 0.9, 10);
    spinousGeo.rotateX(Math.PI * 0.5);
    applyAmberVertexColors(spinousGeo, 0xd97724, 0.05, 0.2);
    const spinousMesh = new THREE.Mesh(spinousGeo, matAmber);
    spinousMesh.name = `asthi_spinous_${vert.tag}`;
    spinousMesh.position.set(0, vert.y - 0.004, -vert.rad * 1.15);
    spineGroup.add(spinousMesh);

    // 3. Bilateral Transverse Processes
    [-1, 1].forEach((side) => {
      const transGeo = new THREE.CylinderGeometry(vert.rad * 0.15, vert.rad * 0.22, vert.rad * 0.75, 8);
      transGeo.rotateZ(Math.PI * 0.5);
      applyAmberVertexColors(transGeo, 0xd97724, 0.04, 0.2);
      const transMesh = new THREE.Mesh(transGeo, matAmber);
      transMesh.name = `asthi_transverse_${vert.tag}_${side > 0 ? 'r' : 'l'}`;
      transMesh.position.set(side * (vert.rad * 1.1), vert.y, -vert.rad * 0.25);
      spineGroup.add(transMesh);
    });

    // 4. Intervertebral Disc
    if (idx < spineConfig.length - 1) {
      const nextVert = spineConfig[idx + 1];
      const discY = (vert.y + nextVert.y) * 0.5;
      const discHeight = Math.max(0.01, (vert.y - nextVert.y) - (vert.height + nextVert.height) * 0.5 + 0.005);
      const discGeo = new THREE.CylinderGeometry(vert.rad * 0.96, vert.rad * 0.98, discHeight, 20);
      discGeo.scale(1.22, 1, 0.92);
      applyAmberVertexColors(discGeo, 0xb85b1a, 0.04, 0.3);
      const discMesh = new THREE.Mesh(discGeo, matDisc);
      discMesh.name = `asthi_disc_${vert.tag}`;
      discMesh.position.set(0, discY, 0);
      spineGroup.add(discMesh);
    }
  });

  return spineGroup;
}

// 3. FULL ARTICULATED SKELETON MODEL
function buildFullAmberSkeleton(matAmber, matDisc) {
  const fullGroup = new THREE.Group();
  fullGroup.name = 'FullAmberSkeleton';

  // Include Skull at cranial height
  const skull = buildHighDetailSkull(matAmber);
  skull.position.set(0, 1.63, 0);
  fullGroup.add(skull);

  // Scaled articulated spine for the full human standing figure
  const fullSpine = buildVerticallyStraightSpine(matAmber, matDisc);
  fullSpine.position.set(0, 1.15, -0.01);
  fullSpine.scale.set(0.65, 0.65, 0.65);
  fullGroup.add(fullSpine);

  // Sternum
  const manubriumGeo = new THREE.BoxGeometry(0.064, 0.044, 0.016);
  applyAmberVertexColors(manubriumGeo, 0xd97724, 0.05);
  const manubrium = new THREE.Mesh(manubriumGeo, matAmber);
  manubrium.name = 'asthi_sternum_manubrium';
  manubrium.position.set(0, 1.365, 0.075);
  fullGroup.add(manubrium);

  const sternalBodyGeo = new THREE.BoxGeometry(0.038, 0.16, 0.014);
  applyAmberVertexColors(sternalBodyGeo, 0xd97724, 0.05);
  const sternalBody = new THREE.Mesh(sternalBodyGeo, matAmber);
  sternalBody.name = 'asthi_sternum_body';
  sternalBody.position.set(0, 1.26, 0.082);
  fullGroup.add(sternalBody);

  const xiphoidGeo = new THREE.ConeGeometry(0.012, 0.034, 6);
  xiphoidGeo.rotateX(Math.PI);
  applyAmberVertexColors(xiphoidGeo, 0xd97724, 0.04);
  const xiphoid = new THREE.Mesh(xiphoidGeo, matAmber);
  xiphoid.name = 'asthi_sternum_xiphoid';
  xiphoid.position.set(0, 1.16, 0.078);
  fullGroup.add(xiphoid);

  // Rib cage (12 pairs of anatomically sweeping ribs)
  const ribLevels = [
    { yStart: 1.38, yEnd: 1.35, spanX: 0.10, depthZ: 0.075, trueRib: true },
    { yStart: 1.35, yEnd: 1.32, spanX: 0.125, depthZ: 0.08, trueRib: true },
    { yStart: 1.31, yEnd: 1.28, spanX: 0.145, depthZ: 0.085, trueRib: true },
    { yStart: 1.27, yEnd: 1.24, spanX: 0.158, depthZ: 0.088, trueRib: true },
    { yStart: 1.23, yEnd: 1.20, spanX: 0.162, depthZ: 0.088, trueRib: true },
    { yStart: 1.19, yEnd: 1.16, spanX: 0.160, depthZ: 0.085, trueRib: true },
    { yStart: 1.15, yEnd: 1.12, spanX: 0.154, depthZ: 0.082, trueRib: true },
    { yStart: 1.11, yEnd: 1.09, spanX: 0.145, depthZ: 0.078, trueRib: false },
    { yStart: 1.07, yEnd: 1.06, spanX: 0.134, depthZ: 0.072, trueRib: false },
    { yStart: 1.04, yEnd: 1.04, spanX: 0.120, depthZ: 0.065, trueRib: false },
    { yStart: 1.01, yEnd: 1.00, spanX: 0.105, depthZ: 0.035, floating: true },
    { yStart: 0.98, yEnd: 0.97, spanX: 0.085, depthZ: 0.015, floating: true },
  ];

  ribLevels.forEach((rib, i) => {
    [-1, 1].forEach((side) => {
      const zSpine = -0.02 - (1.38 - rib.yStart) * 0.12;
      let ribPts = [];
      if (rib.floating) {
        ribPts = [
          [side * 0.025, rib.yStart, zSpine],
          [side * (rib.spanX * 0.6), rib.yStart - 0.01, zSpine - 0.01],
          [side * rib.spanX, rib.yStart - 0.02, zSpine + rib.depthZ],
        ];
      } else {
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
      const ribMesh = createTube(ribPts, 0.0058, 8, `asthi_rib_${i}_${side > 0 ? 'r' : 'l'}`, matAmber);
      fullGroup.add(ribMesh);

      if (rib.trueRib) {
        const cartPts = [
          [side * 0.024, rib.yEnd, 0.075],
          [side * 0.018, rib.yEnd + 0.005, 0.078],
          [0, rib.yEnd + 0.008, 0.082],
        ];
        const cartMesh = createTube(cartPts, 0.005, 6, `asthi_cartilage_${i}_${side > 0 ? 'r' : 'l'}`, matAmber);
        fullGroup.add(cartMesh);
      }
    });
  });

  // Clavicles, Scapulae & Upper Limbs
  [-1, 1].forEach((side) => {
    const claviclePts = [
      [side * 0.028, 1.37, 0.072],
      [side * 0.085, 1.378, 0.055],
      [side * 0.150, 1.365, 0.015],
      [side * 0.185, 1.355, 0.005],
    ];
    fullGroup.add(createTube(claviclePts, 0.009, 8, `asthi_clavicle_${side > 0 ? 'r' : 'l'}`, matAmber));

    // Scapula blade
    const scapulaGeo = new THREE.BufferGeometry();
    const sVerts = new Float32Array([
      side * 0.18, 1.35, -0.01,
      side * 0.10, 1.34, -0.035,
      side * 0.08, 1.20, -0.045,
      side * 0.17, 1.24, -0.030,
    ]);
    const sIndices = [0, 1, 2, 0, 2, 3];
    scapulaGeo.setAttribute('position', new THREE.BufferAttribute(sVerts, 3));
    scapulaGeo.setIndex(sIndices);
    scapulaGeo.computeVertexNormals();
    applyAmberVertexColors(scapulaGeo, 0xd97724, 0.05);
    const scapulaMesh = new THREE.Mesh(scapulaGeo, matAmber);
    scapulaMesh.name = `asthi_scapula_${side > 0 ? 'r' : 'l'}`;
    fullGroup.add(scapulaMesh);

    // Humerus
    const humPts = [
      [side * 0.19, 1.34, -0.005],
      [side * 0.205, 1.21, 0.00],
      [side * 0.21, 1.08, 0.005],
    ];
    fullGroup.add(createTube(humPts, 0.014, 10, `asthi_humerus_${side > 0 ? 'r' : 'l'}`, matAmber));

    // Radius and Ulna
    const radPts = [
      [side * 0.218, 1.06, 0.008],
      [side * 0.230, 0.95, 0.015],
      [side * 0.240, 0.84, 0.022],
    ];
    fullGroup.add(createTube(radPts, 0.009, 8, `asthi_radius_${side > 0 ? 'r' : 'l'}`, matAmber));

    const ulnaPts = [
      [side * 0.202, 1.06, 0.002],
      [side * 0.212, 0.95, 0.006],
      [side * 0.222, 0.84, 0.012],
    ];
    fullGroup.add(createTube(ulnaPts, 0.008, 8, `asthi_ulna_${side > 0 ? 'r' : 'l'}`, matAmber));

    // Hand & Carpals
    const handPts = [
      [side * 0.235, 0.83, 0.018],
      [side * 0.245, 0.77, 0.020],
      [side * 0.252, 0.71, 0.022],
    ];
    fullGroup.add(createTube(handPts, 0.012, 8, `asthi_hand_${side > 0 ? 'r' : 'l'}`, matAmber));

    // Pelvis / Ilium
    const pelvicGeo = new THREE.TorusGeometry(0.082, 0.026, 12, 18, Math.PI * 0.9);
    pelvicGeo.rotateX(Math.PI * 0.35);
    pelvicGeo.rotateZ(side > 0 ? 0.3 : -0.3);
    applyAmberVertexColors(pelvicGeo, 0xd97724, 0.05);
    const pelvicMesh = new THREE.Mesh(pelvicGeo, matAmber);
    pelvicMesh.name = `asthi_pelvis_${side > 0 ? 'r' : 'l'}`;
    pelvicMesh.position.set(side * 0.082, 0.80, 0.01);
    fullGroup.add(pelvicMesh);

    // Femur (Thigh bone)
    const femurPts = [
      [side * 0.098, 0.76, 0.01],
      [side * 0.108, 0.60, 0.012],
      [side * 0.098, 0.44, 0.008],
    ];
    fullGroup.add(createTube(femurPts, 0.021, 12, `asthi_femur_${side > 0 ? 'r' : 'l'}`, matAmber));

    // Patella (Kneecap)
    const patellaGeo = new THREE.SphereGeometry(0.016, 10, 10);
    patellaGeo.scale(1, 1.2, 0.6);
    applyAmberVertexColors(patellaGeo, 0xd97724, 0.05);
    const patella = new THREE.Mesh(patellaGeo, matAmber);
    patella.name = `asthi_patella_${side > 0 ? 'r' : 'l'}`;
    patella.position.set(side * 0.098, 0.435, 0.035);
    fullGroup.add(patella);

    // Tibia (Shin bone)
    const tibiaPts = [
      [side * 0.098, 0.42, 0.008],
      [side * 0.094, 0.24, 0.004],
      [side * 0.090, 0.06, 0.002],
    ];
    fullGroup.add(createTube(tibiaPts, 0.016, 10, `asthi_tibia_${side > 0 ? 'r' : 'l'}`, matAmber));

    // Fibula
    const fibPts = [
      [side * 0.124, 0.41, -0.002],
      [side * 0.120, 0.24, -0.003],
      [side * 0.116, 0.06, -0.002],
    ];
    fullGroup.add(createTube(fibPts, 0.008, 8, `asthi_fibula_${side > 0 ? 'r' : 'l'}`, matAmber));

    // Foot & Calcaneus
    const footPts = [
      [side * 0.090, 0.05, -0.02],
      [side * 0.092, 0.02, 0.04],
      [side * 0.095, 0.01, 0.10],
    ];
    fullGroup.add(createTube(footPts, 0.014, 8, `asthi_foot_${side > 0 ? 'r' : 'l'}`, matAmber));
  });

  return fullGroup;
}

// EXPORT ALL THREE LANDING MODELS AS COMPACT GLB ASSETS
async function exportGlb(scene, outputPath) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        const buffer = Buffer.from(gltf);
        fs.writeFileSync(outputPath, buffer);
        const sizeKb = (buffer.length / 1024).toFixed(2);
        console.log(`✓ Exported ${path.basename(outputPath)} (${sizeKb} KB)`);
        resolve();
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

async function main() {
  console.log('Generating Amber-Glass 3D Landing Models (Skull, Spine, Skeleton)...');

  const matAmber = new THREE.MeshPhysicalMaterial({
    color: 0xc66a24,
    emissive: 0x220c02,
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
    vertexColors: true,
  });

  const matDisc = new THREE.MeshPhysicalMaterial({
    color: 0x8b3e12,
    emissive: 0x180601,
    roughness: 0.32,
    metalness: 0.02,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    vertexColors: true,
  });

  const outputDir = path.resolve(__dirname, '../public/models');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Skull Model
  const skullRoot = new THREE.Scene();
  skullRoot.add(buildHighDetailSkull(matAmber));
  await exportGlb(skullRoot, path.join(outputDir, 'skull.glb'));

  // 2. Spine Model
  const spineRoot = new THREE.Scene();
  spineRoot.add(buildVerticallyStraightSpine(matAmber, matDisc));
  await exportGlb(spineRoot, path.join(outputDir, 'spine.glb'));

  // 3. Full Skeleton Model
  const skeletonRoot = new THREE.Scene();
  skeletonRoot.add(buildFullAmberSkeleton(matAmber, matDisc));
  await exportGlb(skeletonRoot, path.join(outputDir, 'skeleton.glb'));

  console.log('All landing 3D models generated successfully!');
}

main().catch((err) => {
  console.error('Model generation error:', err);
  process.exit(1);
});
