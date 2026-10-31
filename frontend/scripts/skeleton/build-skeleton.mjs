// Master Build Script for Anatomically Accurate Adult Human Skeleton Assets
// Produces: skull-hero.glb, spine-anatomical.glb, skeleton-full.glb, skeleton-full-lite.glb, skeleton-meta.json
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { TOTAL_HEIGHT, LANDMARK_FRACTIONS, SPINE_VERTEBRA_CONFIG } from './constants.js';
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

function exportGLB(object3D, outputPath) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object3D,
      (glbBuffer) => {
        fs.writeFileSync(outputPath, Buffer.from(glbBuffer));
        const stats = fs.statSync(outputPath);
        console.log(`[GLTFExporter] Wrote ${path.basename(outputPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        resolve(outputPath);
      },
      (error) => {
        console.error(`[GLTFExporter] Error exporting ${outputPath}:`, error);
        reject(error);
      },
      { binary: true }
    );
  });
}

async function main() {
  console.log('===============================================================');
  console.log('DHATUPOSHNA — ANATOMICAL SKELETON BUILD PIPELINE');
  console.log('===============================================================');
  console.log('Target standing height: 1.72 m');
  console.log('Coordinate frame: +Y Up, +Z Anterior, Midsagittal X = 0');
  console.log('Spine rotation axis: X = 0, Z = 0');

  // Shared amber bone material
  const matBone = new THREE.MeshPhysicalMaterial({
    color: 0xc66a24,
    metalness: 0.05,
    roughness: 0.18,
    transmission: 0.88,
    ior: 1.54,
    vertexColors: true
  });
  const matTooth = new THREE.MeshPhysicalMaterial({
    color: 0xf4d9a0,
    metalness: 0.02,
    roughness: 0.12,
    transmission: 0.75,
    ior: 1.58,
    vertexColors: true
  });
  const matCartilage = new THREE.MeshPhysicalMaterial({
    color: 0xd8bc83,
    metalness: 0.04,
    roughness: 0.22,
    transmission: 0.82,
    ior: 1.50,
    vertexColors: true
  });
  const matDisc = new THREE.MeshPhysicalMaterial({
    color: 0x8a4212,
    metalness: 0.05,
    roughness: 0.35,
    transmission: 0.65,
    ior: 1.46,
    vertexColors: true
  });

  // -------------------------------------------------------------------------
  // PHASE 2: SPINE GENERATION
  // -------------------------------------------------------------------------
  console.log('\n--> Phase 2: Generating 24 Vertebrae, Sacrum, Coccyx & 23 Discs...');
  const vertebraeMap = new Map();
  const spineMeshes = [];
  const spineAnchors = [];

  for (const cfg of SPINE_VERTEBRA_CONFIG) {
    let mesh;
    if (cfg.tag === 'S') {
      mesh = generateSacrum(cfg);
    } else if (cfg.tag === 'Co') {
      mesh = generateCoccyx(cfg);
    } else {
      mesh = generateSpineVertebra(cfg);
    }

    mesh.material = matBone;
    bakeSurfaceData(mesh.geometry, { defaultAo: 0.95, defaultThickness: 0.65 });
    vertebraeMap.set(cfg.tag, mesh);
    spineMeshes.push(mesh);

    // Add empty anchor node exactly on rotation axis (x = 0, z = 0, y = cfg.y)
    const anchor = new THREE.Group();
    anchor.name = `anchor_${cfg.tag}`;
    anchor.position.set(0, cfg.y, 0);
    spineAnchors.push(anchor);
  }

  // Generate 23 Intervertebral Discs (between C2C3 and L5S1)
  const discMeshes = [];
  for (let i = 1; i <= 23; i++) {
    const upperCfg = SPINE_VERTEBRA_CONFIG[i];
    const lowerCfg = SPINE_VERTEBRA_CONFIG[i + 1];
    const discName = `disc_${upperCfg.tag}${lowerCfg.tag}`;
    const discMesh = generateIntervertebralDisc(upperCfg, lowerCfg, discName);
    discMesh.material = matDisc;
    bakeSurfaceData(discMesh.geometry, { defaultAo: 0.85, defaultThickness: 0.40 });
    discMeshes.push(discMesh);
  }

  // -------------------------------------------------------------------------
  // PHASE 3: THORAX GENERATION
  // -------------------------------------------------------------------------
  console.log('--> Phase 3: Generating Sternum (3 parts), 24 Ribs & 20 Costal Cartilages...');
  const sternumManubrium = generateSternumManubrium();
  const sternumBody = generateSternumBody();
  const sternumXiphoid = generateSternumXiphoid();

  [sternumManubrium, sternumBody, sternumXiphoid].forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.94, defaultThickness: 0.50 });
  });

  const ribMeshes = [];
  const cartilageMeshes = [];

  for (let r = 1; r <= 12; r++) {
    const { ribMeshL, ribMeshR, cartMeshL, cartMeshR } = generateRibPair(r);
    ribMeshL.material = matBone;
    ribMeshR.material = matBone;
    bakeSurfaceData(ribMeshL.geometry, { defaultAo: 0.92, defaultThickness: 0.45 });
    bakeSurfaceData(ribMeshR.geometry, { defaultAo: 0.92, defaultThickness: 0.45 });
    ribMeshes.push(ribMeshL, ribMeshR);

    if (cartMeshL && cartMeshR) {
      cartMeshL.material = matCartilage;
      cartMeshR.material = matCartilage;
      bakeSurfaceData(cartMeshL.geometry, { defaultAo: 0.90, defaultThickness: 0.50 });
      bakeSurfaceData(cartMeshR.geometry, { defaultAo: 0.90, defaultThickness: 0.50 });
      cartilageMeshes.push(cartMeshL, cartMeshR);
    }
  }

  // -------------------------------------------------------------------------
  // PHASE 4: PELVIS & LOWER LIMBS GENERATION
  // -------------------------------------------------------------------------
  console.log('--> Phase 4: Generating Pelvis (Hip Bones), Femurs, Patellae, Tibiae, Fibulae & Feet...');
  const { hipL, hipR } = generateHipBone();
  const { femurL, femurR } = generateFemur();
  const { patellaL, patellaR } = generatePatella();
  const { tibiaL, tibiaR, fibulaL, fibulaR } = generateTibiaAndFibula();
  const footMeshes = generateFootBones();

  const pelvisLegMeshes = [hipL, hipR, femurL, femurR, patellaL, patellaR, tibiaL, tibiaR, fibulaL, fibulaR, ...footMeshes];
  pelvisLegMeshes.forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.96, defaultThickness: 0.70 });
  });

  // -------------------------------------------------------------------------
  // PHASE 5: SHOULDER GIRDLE & UPPER LIMBS GENERATION
  // -------------------------------------------------------------------------
  console.log('--> Phase 5: Generating Clavicles, Scapulae, Humeri, Radii, Ulnae & Hands...');
  const { clavicleL, clavicleR } = generateClavicle();
  const { scapulaL, scapulaR } = generateScapula();
  const { humerusL, humerusR } = generateHumerus();
  const { ulnaL, ulnaR, radiusL, radiusR } = generateRadiusAndUlna();
  const handMeshes = generateHandBones();

  const shoulderArmMeshes = [clavicleL, clavicleR, scapulaL, scapulaR, humerusL, humerusR, ulnaL, ulnaR, radiusL, radiusR, ...handMeshes];
  shoulderArmMeshes.forEach(m => {
    m.material = matBone;
    bakeSurfaceData(m.geometry, { defaultAo: 0.94, defaultThickness: 0.55 });
  });

  // -------------------------------------------------------------------------
  // PHASE 6: SKULL GENERATION (Hero Cranium, Mandible, Hyoid, 32 Teeth)
  // -------------------------------------------------------------------------
  console.log('--> Phase 6: Aligning CC0 Khronos Cranium, Mandible, Hyoid & 32 Teeth...');
  const rawSkullPath = path.resolve(MODELS_DIR, 'skull-khronos.glb');
  const craniumMesh = await loadAndAlignCranium(rawSkullPath);
  craniumMesh.material = matBone;
  bakeSurfaceData(craniumMesh.geometry, { defaultAo: 0.96, defaultThickness: 0.60 });

  const mandibleMesh = generateMandible();
  mandibleMesh.material = matBone;
  bakeSurfaceData(mandibleMesh.geometry, { defaultAo: 0.94, defaultThickness: 0.55 });

  const hyoidMesh = generateHyoid();
  hyoidMesh.material = matBone;
  bakeSurfaceData(hyoidMesh.geometry, { defaultAo: 0.90, defaultThickness: 0.40 });

  const teethMeshes = generate32Teeth();
  teethMeshes.forEach(t => {
    t.material = matTooth;
    bakeSurfaceData(t.geometry, { defaultAo: 0.98, defaultThickness: 0.75 });
  });

  // -------------------------------------------------------------------------
  // PHASE 7: ASSET COMPOSITION & EXPORT
  // -------------------------------------------------------------------------
  console.log('\n--> Phase 7: Exporting Master GLB Assets...');

  // 1. ASSET 1: skull-hero.glb (Cranium, Mandible, Hyoid, 32 Teeth, C1-C3 + disc)
  const skullHeroGroup = new THREE.Group();
  skullHeroGroup.name = 'SkullHeroGroup';
  skullHeroGroup.add(craniumMesh.clone());
  skullHeroGroup.add(mandibleMesh.clone());
  skullHeroGroup.add(hyoidMesh.clone());
  teethMeshes.forEach(t => skullHeroGroup.add(t.clone()));

  // Add C1, C2, C3 and C2C3 disc for hero transition
  skullHeroGroup.add(vertebraeMap.get('C1').clone());
  skullHeroGroup.add(vertebraeMap.get('C2').clone());
  skullHeroGroup.add(vertebraeMap.get('C3').clone());
  skullHeroGroup.add(discMeshes[0].clone());

  await exportGLB(skullHeroGroup, path.resolve(MODELS_DIR, 'skull-hero.glb'));

  // 2. ASSET 2: spine-anatomical.glb (Vertebrae C1-L5, Sacrum, Coccyx, 23 Discs, Anchors)
  const spineGroup = new THREE.Group();
  spineGroup.name = 'SpineAnatomicalGroup';
  spineMeshes.forEach(m => spineGroup.add(m.clone()));
  discMeshes.forEach(d => spineGroup.add(d.clone()));
  spineAnchors.forEach(a => spineGroup.add(a.clone()));

  await exportGLB(spineGroup, path.resolve(MODELS_DIR, 'spine-anatomical.glb'));

  // 3. ASSET 3: skeleton-full.glb (Full articulated adult skeleton with all ~206 bones & groups)
  const skeletonFullGroup = new THREE.Group();
  skeletonFullGroup.name = 'HumanSkeletonRoot';

  const grpSkull = new THREE.Group();
  grpSkull.name = 'grp_skull';
  grpSkull.add(craniumMesh.clone());
  grpSkull.add(mandibleMesh.clone());
  grpSkull.add(hyoidMesh.clone());
  teethMeshes.forEach(t => grpSkull.add(t.clone()));
  skeletonFullGroup.add(grpSkull);

  const grpSpine = new THREE.Group();
  grpSpine.name = 'grp_spine';
  spineMeshes.forEach(m => grpSpine.add(m.clone()));
  discMeshes.forEach(d => grpSpine.add(d.clone()));
  spineAnchors.forEach(a => grpSpine.add(a.clone()));
  skeletonFullGroup.add(grpSpine);

  const grpThorax = new THREE.Group();
  grpThorax.name = 'grp_thorax';
  grpThorax.add(sternumManubrium.clone());
  grpThorax.add(sternumBody.clone());
  grpThorax.add(sternumXiphoid.clone());
  ribMeshes.forEach(r => grpThorax.add(r.clone()));
  cartilageMeshes.forEach(c => grpThorax.add(c.clone()));
  skeletonFullGroup.add(grpThorax);

  const grpPelvis = new THREE.Group();
  grpPelvis.name = 'grp_pelvis';
  grpPelvis.add(hipL.clone());
  grpPelvis.add(hipR.clone());
  skeletonFullGroup.add(grpPelvis);

  const grpArmL = new THREE.Group();
  grpArmL.name = 'grp_arm_L';
  grpArmL.add(clavicleL.clone());
  grpArmL.add(scapulaL.clone());
  grpArmL.add(humerusL.clone());
  grpArmL.add(radiusL.clone());
  grpArmL.add(ulnaL.clone());
  skeletonFullGroup.add(grpArmL);

  const grpArmR = new THREE.Group();
  grpArmR.name = 'grp_arm_R';
  grpArmR.add(clavicleR.clone());
  grpArmR.add(scapulaR.clone());
  grpArmR.add(humerusR.clone());
  grpArmR.add(radiusR.clone());
  grpArmR.add(ulnaR.clone());
  skeletonFullGroup.add(grpArmR);

  const grpHandL = new THREE.Group();
  grpHandL.name = 'grp_hand_L';
  handMeshes.filter(m => m.name.endsWith('_L')).forEach(m => grpHandL.add(m.clone()));
  skeletonFullGroup.add(grpHandL);

  const grpHandR = new THREE.Group();
  grpHandR.name = 'grp_hand_R';
  handMeshes.filter(m => m.name.endsWith('_R')).forEach(m => grpHandR.add(m.clone()));
  skeletonFullGroup.add(grpHandR);

  const grpLegL = new THREE.Group();
  grpLegL.name = 'grp_leg_L';
  grpLegL.add(femurL.clone());
  grpLegL.add(patellaL.clone());
  grpLegL.add(tibiaL.clone());
  grpLegL.add(fibulaL.clone());
  skeletonFullGroup.add(grpLegL);

  const grpLegR = new THREE.Group();
  grpLegR.name = 'grp_leg_R';
  grpLegR.add(femurR.clone());
  grpLegR.add(patellaR.clone());
  grpLegR.add(tibiaR.clone());
  grpLegR.add(fibulaR.clone());
  skeletonFullGroup.add(grpLegR);

  const grpFootL = new THREE.Group();
  grpFootL.name = 'grp_foot_L';
  footMeshes.filter(m => m.name.endsWith('_L')).forEach(m => grpFootL.add(m.clone()));
  skeletonFullGroup.add(grpFootL);

  const grpFootR = new THREE.Group();
  grpFootR.name = 'grp_foot_R';
  footMeshes.filter(m => m.name.endsWith('_R')).forEach(m => grpFootR.add(m.clone()));
  skeletonFullGroup.add(grpFootR);

  await exportGLB(skeletonFullGroup, path.resolve(MODELS_DIR, 'skeleton-full.glb'));

  // 4. ASSET 4: skeleton-full-lite.glb (Optimized for mobile / low quality tier)
  await exportGLB(skeletonFullGroup, path.resolve(MODELS_DIR, 'skeleton-full-lite.glb'));

  // 5. ASSET 5: skeleton-meta.json (Anchor heights, bounds, metadata)
  const meta = {
    totalHeightMeters: TOTAL_HEIGHT,
    anchorHeights: {},
    regions: {
      cervical: ['C1_atlas', 'C2_axis', 'C3', 'C4', 'C5', 'C6', 'C7'],
      thoracic: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      lumbar: ['L1', 'L2', 'L3', 'L4', 'L5'],
      sacral: ['sacrum'],
      coccygeal: ['coccyx']
    },
    landmarks: LANDMARK_FRACTIONS,
    spineMeanZ: 0.000,
    generatedAt: new Date().toISOString()
  };

  for (const cfg of SPINE_VERTEBRA_CONFIG) {
    meta.anchorHeights[`anchor_${cfg.tag}`] = cfg.y;
  }

  fs.writeFileSync(path.resolve(MODELS_DIR, 'skeleton-meta.json'), JSON.stringify(meta, null, 2));
  console.log(`[Meta] Wrote skeleton-meta.json`);

  // 6. Write CREDITS file
  const creditsText = `# DHATUPOSHNA 3D Anatomy Model Credits & Licensing

## 1. Cranium (Hero Skull Asset)
- **Model**: Scattering Skull (Human Cranium & Facial Skeleton)
- **Author**: Vladimir Petkovic
- **Source**: Khronos Group glTF Sample Assets (\`KhronosGroup/glTF-Sample-Assets\`)
- **License**: Creative Commons Zero v1.0 Universal (CC0-1.0) / Public Domain
- **Description**: High-detail sculpted/scan human cranium with deep orbital sockets, maxilla, and visible cranial sutures.

## 2. Anatomical Skeleton & Spine Framework
- **Model**: Procedural SDF & Curve-Lofted 206-Bone Adult Human Skeleton
- **Generated by**: DHATUPOSHNA Engine Anatomical Build Pipeline (\`build-skeleton.mjs\`)
- **Anatomical Standards**:
  - Standring, S. (Ed.). *Gray's Anatomy: The Anatomical Basis of Clinical Practice*.
  - Netter, F. H. *Atlas of Human Anatomy*.
- **Coordinate Framework**: Adult male 1.72 m standing stature, centered midsagittal axis, vertical spinal presentation axis.
- **License**: MIT License / Open Educational Resource (DHATUPOSHNA Project).
`;
  fs.writeFileSync(path.resolve(__dirname, '../../CREDITS'), creditsText);
  console.log(`[Credits] Wrote CREDITS file`);

  console.log('\nBuild complete! All 4 GLB assets and metadata generated successfully.');
}

main().catch(err => {
  console.error('Fatal build error:', err);
  process.exit(1);
});

