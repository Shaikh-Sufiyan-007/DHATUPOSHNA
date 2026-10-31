// Build Script for Explore3D Anatomically Accurate Adult Human Skeleton Assets
// Produces:
// 1. frontend/public/models/explore-skeleton.glb (257 meshes, PBR bone materials, ~8.4 MB, ~518k tris)
// 2. frontend/public/models/explore-skeleton-lite.glb (mobile/low tier, ~3.8 MB, ~233k tris)
// 3. frontend/public/models/explore-regions.json (17 anatomical regions, bounding boxes, camera presets)

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, dedup, quantize, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer/simplifier';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { TOTAL_HEIGHT, SPINE_VERTEBRA_CONFIG } from './constants.js';
import {
  generateSpineVertebra,
  generateSacrum,
  generateCoccyx,
  generateIntervertebralDisc
} from './gen-spine.js';
import {
  generateSternumManubrium,
  generateSternumBody,
  generateSternumXiphoid,
  generateRibPair
} from './gen-thorax.js';
import {
  generateHipBone,
  generateFemur,
  generatePatella,
  generateTibiaAndFibula,
  generateFootBones
} from './gen-pelvis-legs.js';
import {
  generateClavicle,
  generateScapula,
  generateHumerus,
  generateRadiusAndUlna,
  generateHandBones
} from './gen-shoulders-arms.js';
import {
  loadAndAlignCranium,
  generateMandible,
  generateHyoid,
  generate32Teeth
} from './gen-skull.js';
import { bakeSurfaceData } from './surface-data.js';

// Polyfill FileReader for GLTFExporter in Node
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_DIR = path.resolve(__dirname, '../../public/models');

function exportRawGLB(object3D) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object3D,
      (glbBuffer) => {
        resolve(Buffer.from(glbBuffer));
      },
      (error) => {
        console.error('[GLTFExporter] Error:', error);
        reject(error);
      },
      { binary: true }
    );
  });
}

// 17 Explore Regions Definition
const REGION_DEFINITIONS = [
  { id: 'head', name: 'Cranial & Facial Skeleton' },
  { id: 'cervical', name: 'Cervical Spine (Neck)' },
  { id: 'thoracic_spine', name: 'Thoracic Spine (Mid-Back)' },
  { id: 'lumbar_spine', name: 'Lumbar Spine (Lower Back)' },
  { id: 'sacrum_coccyx', name: 'Sacrum & Coccyx' },
  { id: 'thorax', name: 'Thoracic Cage (Ribs & Sternum)' },
  { id: 'shoulder_L', name: 'Left Shoulder Girdle' },
  { id: 'shoulder_R', name: 'Right Shoulder Girdle' },
  { id: 'arm_L', name: 'Left Arm & Forearm' },
  { id: 'arm_R', name: 'Right Arm & Forearm' },
  { id: 'hand_L', name: 'Left Hand & Wrist' },
  { id: 'hand_R', name: 'Right Hand & Wrist' },
  { id: 'pelvis', name: 'Pelvic Girdle' },
  { id: 'leg_L', name: 'Left Thigh & Leg' },
  { id: 'leg_R', name: 'Right Thigh & Leg' },
  { id: 'foot_L', name: 'Left Foot & Ankle' },
  { id: 'foot_R', name: 'Right Foot & Ankle' }
];

async function main() {
  console.log('===============================================================');
  console.log('DHATUPOSHNA — EXPLORE3D SKELETON BUILD PIPELINE');
  console.log('===============================================================');

  if (MeshoptSimplifier.ready) await MeshoptSimplifier.ready;

  // Realistic PBR Anatomical Materials for Explore View
  const matBone = new THREE.MeshStandardMaterial({
    color: 0xEDE8DC,
    roughness: 0.62,
    metalness: 0.05,
    vertexColors: true
  });
  const matTooth = new THREE.MeshStandardMaterial({
    color: 0xF5F0E1,
    roughness: 0.28,
    metalness: 0.02,
    vertexColors: true
  });
  const matCartilage = new THREE.MeshStandardMaterial({
    color: 0xDFD2B5,
    roughness: 0.45,
    metalness: 0.04,
    vertexColors: true
  });
  const matDisc = new THREE.MeshStandardMaterial({
    color: 0x8C6B4E,
    roughness: 0.70,
    metalness: 0.05,
    opacity: 0.85,
    transparent: true,
    vertexColors: true
  });

  // Map to collect meshes per region
  const regionMeshesMap = new Map();
  REGION_DEFINITIONS.forEach(r => regionMeshesMap.set(r.id, []));

  function registerMesh(mesh, regionId) {
    mesh.userData = mesh.userData || {};
    mesh.userData.region = regionId;
    mesh.userData.part = mesh.name;
    const list = regionMeshesMap.get(regionId);
    if (!list) throw new Error(`Unknown region ${regionId}`);
    list.push(mesh);
  }

  // 1. GENERATE SKULL (Hero Cranium, Mandible, Hyoid, 32 Teeth)
  console.log('--> Step 1: Generating Skull & Dentition...');
  const rawSkullPath = path.resolve(MODELS_DIR, 'skull-khronos.glb');
  const craniumMesh = await loadAndAlignCranium(rawSkullPath);
  craniumMesh.material = matBone;
  bakeSurfaceData(craniumMesh.geometry, { defaultAo: 0.96, defaultThickness: 0.60 });
  registerMesh(craniumMesh, 'head');

  const mandibleMesh = generateMandible();
  mandibleMesh.material = matBone;
  bakeSurfaceData(mandibleMesh.geometry, { defaultAo: 0.94, defaultThickness: 0.55 });
  registerMesh(mandibleMesh, 'head');

  const hyoidMesh = generateHyoid();
  hyoidMesh.material = matBone;
  bakeSurfaceData(hyoidMesh.geometry, { defaultAo: 0.90, defaultThickness: 0.40 });
  registerMesh(hyoidMesh, 'head');

  const teethMeshes = generate32Teeth();
  teethMeshes.forEach(t => {
    t.material = matTooth;
    bakeSurfaceData(t.geometry, { defaultAo: 0.98, defaultThickness: 0.75 });
    registerMesh(t, 'head');
  });

  // 2. GENERATE SPINE (C1-C7, T1-T12, L1-L5, Sacrum, Coccyx & Discs)
  console.log('--> Step 2: Generating Spine (Vertebrae, Sacrum, Coccyx, Discs)...');
  for (const cfg of SPINE_VERTEBRA_CONFIG) {
    let mesh;
    let regionId;
    if (cfg.tag === 'S') {
      mesh = generateSacrum(cfg);
      regionId = 'sacrum_coccyx';
    } else if (cfg.tag === 'Co') {
      mesh = generateCoccyx(cfg);
      regionId = 'sacrum_coccyx';
    } else if (cfg.tag.startsWith('C')) {
      mesh = generateSpineVertebra(cfg);
      regionId = 'cervical';
    } else if (cfg.tag.startsWith('T')) {
      mesh = generateSpineVertebra(cfg);
      regionId = 'thoracic_spine';
    } else if (cfg.tag.startsWith('L')) {
      mesh = generateSpineVertebra(cfg);
      regionId = 'lumbar_spine';
    } else {
      mesh = generateSpineVertebra(cfg);
      regionId = 'thoracic_spine';
    }
    mesh.material = matBone;
    bakeSurfaceData(mesh.geometry, { defaultAo: 0.95, defaultThickness: 0.65 });
    registerMesh(mesh, regionId);
  }

  // 23 Intervertebral Discs
  for (let i = 1; i <= 23; i++) {
    const upperCfg = SPINE_VERTEBRA_CONFIG[i];
    const lowerCfg = SPINE_VERTEBRA_CONFIG[i + 1];
    const discName = `disc_${upperCfg.tag}${lowerCfg.tag}`;
    const discMesh = generateIntervertebralDisc(upperCfg, lowerCfg, discName);
    discMesh.material = matDisc;
    bakeSurfaceData(discMesh.geometry, { defaultAo: 0.85, defaultThickness: 0.40 });

    let discRegion = 'thoracic_spine';
    if (upperCfg.tag.startsWith('C')) {
      discRegion = 'cervical';
    } else if (upperCfg.tag.startsWith('T')) {
      discRegion = 'thoracic_spine';
    } else if (upperCfg.tag.startsWith('L')) {
      discRegion = 'lumbar_spine';
    }
    registerMesh(discMesh, discRegion);
  }

  // 3. GENERATE THORAX (Sternum 3 parts, 24 Ribs, 20 Costal Cartilages)
  console.log('--> Step 3: Generating Thorax (Sternum, Ribs, Costal Cartilages)...');
  const sternumManubrium = generateSternumManubrium();
  const sternumBody = generateSternumBody();
  const sternumXiphoid = generateSternumXiphoid();
  [sternumManubrium, sternumBody, sternumXiphoid].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.94, defaultThickness: 0.50 });
    registerMesh(m, 'thorax');
  });

  for (let r = 1; r <= 12; r++) {
    const { ribMeshL, ribMeshR, cartMeshL, cartMeshR } = generateRibPair(r);
    ribMeshL.material = matBone;
    ribMeshR.material = matBone;
    bakeSurfaceData(ribMeshL.geometry, { defaultAo: 0.92, defaultThickness: 0.45 });
    bakeSurfaceData(ribMeshR.geometry, { defaultAo: 0.92, defaultThickness: 0.45 });
    registerMesh(ribMeshL, 'thorax');
    registerMesh(ribMeshR, 'thorax');

    if (cartMeshL && cartMeshR) {
      cartMeshL.material = matCartilage;
      cartMeshR.material = matCartilage;
      bakeSurfaceData(cartMeshL.geometry, { defaultAo: 0.90, defaultThickness: 0.50 });
      bakeSurfaceData(cartMeshR.geometry, { defaultAo: 0.90, defaultThickness: 0.50 });
      registerMesh(cartMeshL, 'thorax');
      registerMesh(cartMeshR, 'thorax');
    }
  }

  // 4. GENERATE PELVIS & LOWER LIMBS
  console.log('--> Step 4: Generating Pelvis, Legs & Feet...');
  const { hipL, hipR } = generateHipBone();
  [hipL, hipR].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.96, defaultThickness: 0.70 });
    registerMesh(m, 'pelvis');
  });

  const { femurL, femurR } = generateFemur();
  const { patellaL, patellaR } = generatePatella();
  const { tibiaL, tibiaR, fibulaL, fibulaR } = generateTibiaAndFibula();
  [femurL, patellaL, tibiaL, fibulaL].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.96, defaultThickness: 0.70 });
    registerMesh(m, 'leg_L');
  });
  [femurR, patellaR, tibiaR, fibulaR].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.96, defaultThickness: 0.70 });
    registerMesh(m, 'leg_R');
  });

  const footMeshes = generateFootBones();
  footMeshes.forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.95, defaultThickness: 0.65 });
    if (m.name.endsWith('_L')) {
      registerMesh(m, 'foot_L');
    } else {
      registerMesh(m, 'foot_R');
    }
  });

  // 5. GENERATE SHOULDER GIRDLE & UPPER LIMBS
  console.log('--> Step 5: Generating Shoulders, Arms & Hands...');
  const { clavicleL, clavicleR } = generateClavicle();
  const { scapulaL, scapulaR } = generateScapula();
  [clavicleL, scapulaL].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.94, defaultThickness: 0.55 });
    registerMesh(m, 'shoulder_L');
  });
  [clavicleR, scapulaR].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.94, defaultThickness: 0.55 });
    registerMesh(m, 'shoulder_R');
  });

  const { humerusL, humerusR } = generateHumerus();
  const { ulnaL, ulnaR, radiusL, radiusR } = generateRadiusAndUlna();
  [humerusL, radiusL, ulnaL].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.94, defaultThickness: 0.55 });
    registerMesh(m, 'arm_L');
  });
  [humerusR, radiusR, ulnaR].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.94, defaultThickness: 0.55 });
    registerMesh(m, 'arm_R');
  });

  const handMeshes = generateHandBones();
  handMeshes.forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.94, defaultThickness: 0.55 });
    if (m.name.endsWith('_L')) {
      registerMesh(m, 'hand_L');
    } else {
      registerMesh(m, 'hand_R');
    }
  });

  // Build Scene Hierarchy with Region Groups
  const exploreRoot = new THREE.Group();
  exploreRoot.name = 'ExploreSkeletonRoot';

  const regionsData = [];
  let totalMeshCount = 0;

  for (const def of REGION_DEFINITIONS) {
    const meshes = regionMeshesMap.get(def.id) || [];
    totalMeshCount += meshes.length;

    const grp = new THREE.Group();
    grp.name = `grp_${def.id}`;
    grp.userData = { region: def.id, name: def.name };

    // Calculate region bounding box
    const regionBox = new THREE.Box3();
    meshes.forEach(m => {
      m.geometry.computeBoundingBox();
      regionBox.union(m.geometry.boundingBox);
      grp.add(m.clone());
    });

    exploreRoot.add(grp);

    const center = new THREE.Vector3();
    regionBox.getCenter(center);
    const size = new THREE.Vector3();
    regionBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Direction and distance presets
    let suggestedDistance = Math.max(maxDim * 2.2, 0.45);
    let suggestedDirection = [0, 0, 1];
    if (def.id === 'head') {
      suggestedDirection = [0, 0.15, 0.98];
      suggestedDistance = 0.65;
    } else if (def.id.includes('spine')) {
      suggestedDirection = [0.25, 0.1, 0.96];
      suggestedDistance = 0.85;
    } else if (def.id === 'sacrum_coccyx') {
      suggestedDirection = [0, 0.2, 0.98];
      suggestedDistance = 0.55;
    } else if (def.id === 'thorax') {
      suggestedDirection = [0, 0.05, 1.0];
      suggestedDistance = 0.95;
    } else if (def.id.endsWith('_L')) {
      suggestedDirection = [0.35, 0, 0.93];
    } else if (def.id.endsWith('_R')) {
      suggestedDirection = [-0.35, 0, 0.93];
    }

    regionsData.push({
      id: def.id,
      name: def.name,
      meshCount: meshes.length,
      bones: meshes.map(m => m.name),
      bbox: {
        min: [Number(regionBox.min.x.toFixed(4)), Number(regionBox.min.y.toFixed(4)), Number(regionBox.min.z.toFixed(4))],
        max: [Number(regionBox.max.x.toFixed(4)), Number(regionBox.max.y.toFixed(4)), Number(regionBox.max.z.toFixed(4))]
      },
      center: [Number(center.x.toFixed(4)), Number(center.y.toFixed(4)), Number(center.z.toFixed(4))],
      cameraTarget: [Number(center.x.toFixed(4)), Number(center.y.toFixed(4)), Number(center.z.toFixed(4))],
      suggestedDistance: Number(suggestedDistance.toFixed(3)),
      suggestedDirection
    });
  }

  console.log(`\n--> Total Meshes Registered Across 17 Regions: ${totalMeshCount}`);
  if (totalMeshCount !== 257) {
    throw new Error(`Expected exactly 257 meshes, got ${totalMeshCount}`);
  }

  // Calculate Overall Skeleton Bounding Box
  const overallBox = new THREE.Box3();
  exploreRoot.traverse(obj => {
    if (obj.isMesh) {
      overallBox.union(obj.geometry.boundingBox);
    }
  });
  const overallCenter = new THREE.Vector3();
  overallBox.getCenter(overallCenter);
  const overallHeight = overallBox.max.y - overallBox.min.y;

  console.log(`Overall Height: ${overallHeight.toFixed(3)} m (Y: ${overallBox.min.y.toFixed(3)} to ${overallBox.max.y.toFixed(3)})`);
  console.log(`Center: (${overallCenter.x.toFixed(3)}, ${overallCenter.y.toFixed(3)}, ${overallCenter.z.toFixed(3)})`);

  // Write explore-regions.json
  const exploreRegionsMeta = {
    totalHeightMeters: Number(overallHeight.toFixed(4)),
    statureNominal: TOTAL_HEIGHT,
    center: [Number(overallCenter.x.toFixed(4)), Number(overallCenter.y.toFixed(4)), Number(overallCenter.z.toFixed(4))],
    boundingBox: {
      min: [Number(overallBox.min.x.toFixed(4)), Number(overallBox.min.y.toFixed(4)), Number(overallBox.min.z.toFixed(4))],
      max: [Number(overallBox.max.x.toFixed(4)), Number(overallBox.max.y.toFixed(4)), Number(overallBox.max.z.toFixed(4))]
    },
    totalRenderableMeshes: totalMeshCount,
    regions: regionsData,
    dhatuRegionMapping: {
      rasa: ['thorax', 'thoracic_spine'],
      rakta: ['thorax', 'thoracic_spine'],
      mamsa: ['shoulder_L', 'shoulder_R', 'arm_L', 'arm_R', 'pelvis', 'leg_L', 'leg_R'],
      meda: ['lumbar_spine', 'pelvis'],
      asthi: [
        'head', 'cervical', 'thoracic_spine', 'lumbar_spine', 'sacrum_coccyx',
        'thorax', 'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R',
        'hand_L', 'hand_R', 'pelvis', 'leg_L', 'leg_R', 'foot_L', 'foot_R'
      ],
      majja: ['head', 'cervical', 'thoracic_spine', 'lumbar_spine', 'sacrum_coccyx'],
      shukra: ['pelvis', 'sacrum_coccyx']
    },
    generatedAt: new Date().toISOString()
  };

  const regionsJsonPath = path.resolve(MODELS_DIR, 'explore-regions.json');
  fs.writeFileSync(regionsJsonPath, JSON.stringify(exploreRegionsMeta, null, 2));
  console.log(`[Meta] Wrote explore-regions.json`);

  // Export Raw Full GLB
  console.log('\n--> Step 6: Exporting & Optimizing explore-skeleton.glb...');
  const rawGlbBuffer = await exportRawGLB(exploreRoot);

  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
  const fullDoc = await io.readBinary(rawGlbBuffer);

  // Set extras on nodes and meshes so userData is fully populated on load
  const boneRegionLookup = new Map();
  regionsData.forEach(r => {
    r.bones.forEach(b => boneRegionLookup.set(b, r.id));
  });

  for (const node of fullDoc.getRoot().listNodes()) {
    const nodeName = node.getName();
    const region = boneRegionLookup.get(nodeName);
    if (region) {
      node.setExtras({ region, part: nodeName });
    }
  }

  // Transform full doc: weld, dedup, quantize
  await fullDoc.transform(
    weld(),
    dedup(),
    quantize()
  );

  const fullGlbPath = path.resolve(MODELS_DIR, 'explore-skeleton.glb');
  const fullGlbBuffer = await io.writeBinary(fullDoc);
  fs.writeFileSync(fullGlbPath, Buffer.from(fullGlbBuffer));
  console.log(`[GLTFExporter] Wrote explore-skeleton.glb (${(fullGlbBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);

  // Export Lite Model (Simplified for mobile / low-tier devices)
  console.log('\n--> Step 7: Exporting & Optimizing explore-skeleton-lite.glb...');
  const liteDoc = await io.readBinary(rawGlbBuffer);

  for (const node of liteDoc.getRoot().listNodes()) {
    const nodeName = node.getName();
    const region = boneRegionLookup.get(nodeName);
    if (region) {
      node.setExtras({ region, part: nodeName });
    }
  }

  await liteDoc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.45, error: 0.005 }),
    dedup(),
    quantize()
  );

  const liteGlbPath = path.resolve(MODELS_DIR, 'explore-skeleton-lite.glb');
  const liteGlbBuffer = await io.writeBinary(liteDoc);
  fs.writeFileSync(liteGlbPath, Buffer.from(liteGlbBuffer));
  console.log(`[GLTFExporter] Wrote explore-skeleton-lite.glb (${(liteGlbBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);

  console.log('\n===============================================================');
  console.log('EXPLORE SKELETON BUILD COMPLETE!');
  console.log('===============================================================');
}

main().catch(err => {
  console.error('Fatal build error:', err);
  process.exit(1);
});
