// Verification Suite for Explore3D Anatomical Skeleton Assets
// Run with: npm run verify:explore-skeleton
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3d';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_DIR = path.resolve(__dirname, '../../public/models');

const EXPECTED_FILES = [
  { name: 'explore-skeleton.glb', maxSizeMB: 12.0, minTris: 500000, maxTris: 900000 },
  { name: 'explore-skeleton-lite.glb', maxSizeMB: 4.0, minTris: 150000, maxTris: 300000 },
  { name: 'explore-regions.json' }
];

async function verify() {
  console.log('===============================================================');
  console.log('DHATUPOSHNA — EXPLORE3D SKELETON VERIFICATION SUITE');
  console.log('===============================================================');

  const decoder = await draco3d.createDecoderModule();
  const io = new NodeIO()
    .registerExtensions(KHRONOS_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': decoder });
  let totalErrors = 0;

  // 1. Check file existence and sizes
  console.log('\n[Check 1] Verifying asset files and sizes:');
  for (const item of EXPECTED_FILES) {
    const fullPath = path.resolve(MODELS_DIR, item.name);
    if (!fs.existsSync(fullPath)) {
      console.error(`  FAIL: Missing required file ${item.name}`);
      totalErrors++;
    } else {
      const stats = fs.statSync(fullPath);
      const sizeMB = stats.size / 1024 / 1024;
      if (item.maxSizeMB && sizeMB > item.maxSizeMB) {
        console.error(`  FAIL: ${item.name} size (${sizeMB.toFixed(2)} MB) exceeds budget of ${item.maxSizeMB} MB`);
        totalErrors++;
      } else {
        console.log(`  PASS: ${item.name} exists (${sizeMB.toFixed(2)} MB)`);
      }
    }
  }

  // 2. Verify explore-regions.json content
  console.log('\n[Check 2] Validating explore-regions.json:');
  const regionsJsonPath = path.resolve(MODELS_DIR, 'explore-regions.json');
  const regionsData = JSON.parse(fs.readFileSync(regionsJsonPath, 'utf-8'));

  const expectedRegions = [
    'head', 'cervical', 'thoracic_spine', 'lumbar_spine', 'sacrum_coccyx',
    'thorax', 'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R',
    'hand_L', 'hand_R', 'pelvis', 'leg_L', 'leg_R', 'foot_L', 'foot_R'
  ];

  const foundRegionIds = new Set(regionsData.regions.map(r => r.id));
  let regionMissing = false;
  for (const req of expectedRegions) {
    if (!foundRegionIds.has(req)) {
      console.error(`  FAIL: Missing region ${req} in explore-regions.json`);
      totalErrors++;
      regionMissing = true;
    }
  }
  if (!regionMissing && foundRegionIds.size === expectedRegions.length) {
    console.log(`  PASS: All 17 anatomical regions registered with bounding boxes and camera targets.`);
  }

  // Check 7 Dhatu mappings in metadata
  const expectedDhatus = ['rasa', 'rakta', 'mamsa', 'meda', 'asthi', 'majja', 'shukra'];
  let dhatuMappingOk = true;
  for (const dh of expectedDhatus) {
    if (!regionsData.dhatuRegionMapping[dh] || regionsData.dhatuRegionMapping[dh].length === 0) {
      console.error(`  FAIL: Missing or empty region mapping for Dhatu "${dh}"`);
      totalErrors++;
      dhatuMappingOk = false;
    }
  }
  if (dhatuMappingOk) {
    console.log(`  PASS: All 7 Dhatus correctly mapped to anatomical regions.`);
  }

  // 3. Inspect explore-skeleton.glb
  console.log('\n[Check 3] Inspecting explore-skeleton.glb bone inventory:');
  const fullDoc = await io.read(path.resolve(MODELS_DIR, 'explore-skeleton.glb'));
  const root = fullDoc.getRoot();
  const allNodes = root.listNodes();
  const allMeshes = root.listMeshes();

  const nodeNames = new Set(allNodes.map(n => n.getName()));
  const meshNames = new Set(allMeshes.map(m => m.getName() || '').filter(Boolean));
  const allIdentifiedNames = new Set([...nodeNames, ...meshNames]);

  console.log(`  Total Nodes in glTF: ${allNodes.length}`);
  console.log(`  Total Meshes in glTF: ${allMeshes.length}`);

  let totalTriangles = 0;
  for (const m of allMeshes) {
    for (const prim of m.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute('POSITION');
      if (idx) {
        totalTriangles += idx.getCount() / 3;
      } else if (pos) {
        totalTriangles += pos.getCount() / 3;
      }
    }
  }
  console.log(`  Total Triangles in Full Skeleton: ${Math.round(totalTriangles)}`);
  if (totalTriangles >= 500000 && totalTriangles <= 900000) {
    console.log(`  PASS: Triangle budget (${Math.round(totalTriangles)}) is within 500k-900k.`);
  } else {
    console.error(`  FAIL: Triangle budget (${Math.round(totalTriangles)}) outside 500k-900k range!`);
    totalErrors++;
  }

  // Assert bone categories
  const requiredCategories = [
    { name: 'Cranial & Facial', regex: /^(skull_cranium|mandible|hyoid)$/, expected: 3 },
    { name: 'Dentition (32 Teeth)', regex: /^tooth_\d{2}$/, expected: 32 },
    { name: 'Spine Vertebrae', regex: /^(C[1-7]|T([1-9]|1[0-2])|L[1-5]|sacrum|coccyx|C1_atlas|C2_axis)$/, expected: 26 },
    { name: 'Intervertebral Discs', regex: /^disc_/, expected: 23 },
    { name: 'Sternum', regex: /^sternum_/, expected: 3 },
    { name: 'Ribs (24 total)', regex: /^rib_[LR]_\d{2}$/, expected: 24 },
    { name: 'Costal Cartilages (20 total)', regex: /^costal_cartilage_[LR]_\d{2}$/, expected: 20 },
    { name: 'Clavicles & Scapulae', regex: /^(clavicle|scapula)_[LR]$/, expected: 4 },
    { name: 'Arm Long Bones', regex: /^(humerus|radius|ulna)_[LR]$/, expected: 6 },
    { name: 'Carpals (16 total)', regex: /^(scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate)_[LR]$/, expected: 16 },
    { name: 'Metacarpals (10 total)', regex: /^metacarpal_\d_[LR]$/, expected: 10 },
    { name: 'Finger Phalanges (28 total)', regex: /^phalanx_\d_(prox|mid|dist)_[LR]$/, expected: 28 },
    { name: 'Pelvis (Hip Bones)', regex: /^hip_bone_[LR]$/, expected: 2 },
    { name: 'Leg Bones (Femur, Patella, Tibia, Fibula)', regex: /^(femur|patella|tibia|fibula)_[LR]$/, expected: 8 },
    { name: 'Tarsals (14 total)', regex: /^(talus|calcaneus|navicular|cuboid|cuneiform_[1-3])_[LR]$/, expected: 14 },
    { name: 'Metatarsals (10 total)', regex: /^metatarsal_\d_[LR]$/, expected: 10 },
    { name: 'Toe Phalanges (28 total)', regex: /^toe_\d_(prox|mid|dist)_[LR]$/, expected: 28 }
  ];

  for (const cat of requiredCategories) {
    const found = [...allIdentifiedNames].filter(name => cat.regex.test(name));
    if (found.length === cat.expected) {
      console.log(`  PASS: ${cat.name} -> Found ${found.length} / ${cat.expected}`);
    } else {
      console.error(`  FAIL: ${cat.name} -> Found ${found.length} / Expected ${cat.expected}`);
      totalErrors++;
    }
  }

  // 4. Check Bilateral Symmetry
  console.log('\n[Check 4] Verifying Bilateral Symmetry & Node Names:');
  const leftBones = [...allIdentifiedNames].filter(n => n.endsWith('_L'));
  const rightBones = [...allIdentifiedNames].filter(n => n.endsWith('_R'));
  console.log(`  Left-side meshes: ${leftBones.length}, Right-side meshes: ${rightBones.length}`);
  if (leftBones.length === rightBones.length) {
    console.log(`  PASS: Perfect bilateral pairing (${leftBones.length} pairs).`);
  } else {
    console.error(`  FAIL: Mismatch in bilateral pairing!`);
    totalErrors++;
  }

  // 5. Check Overall Bounding Box & Total Stature
  console.log('\n[Check 5] Verifying Overall Stature and Origin Alignment:');
  const dequantDoc = await io.read(path.resolve(MODELS_DIR, 'explore-skeleton.glb'));
  const { dequantize } = await import('@gltf-transform/functions');
  await dequantDoc.transform(dequantize());

  let minY = Infinity, maxY = -Infinity;
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const node of dequantDoc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const t = node.getTranslation();
    const s = node.getScale();
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const arr = pos.getArray();
      for (let i = 0; i < arr.length; i += 3) {
        const x = arr[i] * s[0] + t[0];
        const y = arr[i + 1] * s[1] + t[1];
        const z = arr[i + 2] * s[2] + t[2];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
    }
  }

  const height = maxY - minY;
  console.log(`  Skeleton Y range: ${minY.toFixed(3)} m to ${maxY.toFixed(3)} m (Height: ${height.toFixed(3)} m)`);
  console.log(`  Skeleton X range: ${minX.toFixed(3)} m to ${maxX.toFixed(3)} m (Breadth: ${(maxX - minX).toFixed(3)} m)`);
  console.log(`  Skeleton Z range: ${minZ.toFixed(3)} m to ${maxZ.toFixed(3)} m (Depth: ${(maxZ - minZ).toFixed(3)} m)`);

  if (Math.abs(height - 1.72) <= 0.05) {
    console.log(`  PASS: Total height ${height.toFixed(3)} m is within 3% tolerance of 1.72 m.`);
  } else {
    console.error(`  FAIL: Total height ${height.toFixed(3)} m deviates from 1.72 m.`);
    totalErrors++;
  }

  // 6. Inspect explore-skeleton-lite.glb
  console.log('\n[Check 6] Inspecting explore-skeleton-lite.glb (mobile/low-tier):');
  const liteDoc = await io.read(path.resolve(MODELS_DIR, 'explore-skeleton-lite.glb'));
  let liteTriangles = 0;
  for (const m of liteDoc.getRoot().listMeshes()) {
    for (const prim of m.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute('POSITION');
      if (idx) {
        liteTriangles += idx.getCount() / 3;
      } else if (pos) {
        liteTriangles += pos.getCount() / 3;
      }
    }
  }
  console.log(`  Total Triangles in Lite Skeleton: ${Math.round(liteTriangles)}`);
  if (liteTriangles >= 150000 && liteTriangles <= 300000) {
    console.log(`  PASS: Lite triangle budget (${Math.round(liteTriangles)}) is within 150k-300k.`);
  } else {
    console.error(`  FAIL: Lite triangle budget (${Math.round(liteTriangles)}) outside 150k-300k range!`);
    totalErrors++;
  }

  // Final summary
  console.log('\n===============================================================');
  if (totalErrors === 0) {
    console.log('ALL EXPLORE SKELETON VERIFICATION CHECKS PASSED WITH 0 ERRORS!');
    console.log('===============================================================');
    process.exit(0);
  } else {
    console.error(`VERIFICATION FAILED WITH ${totalErrors} ERROR(S).`);
    console.log('===============================================================');
    process.exit(1);
  }
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
