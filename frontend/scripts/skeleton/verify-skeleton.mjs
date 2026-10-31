// Automated Verification Suite for Anatomical Skeleton Assets
// Run with: npm run verify:skeleton
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
  'skull-hero.glb',
  'spine-anatomical.glb',
  'skeleton-full.glb',
  'skeleton-full-lite.glb',
  'skeleton-meta.json'
];

async function verify() {
  console.log('===============================================================');
  console.log('DHATUPOSHNA — SKELETON VERIFICATION SUITE');
  console.log('===============================================================');

  const decoder = await draco3d.createDecoderModule();
  const io = new NodeIO()
    .registerExtensions(KHRONOS_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': decoder });
  let totalErrors = 0;

  // 1. Check file existence and sizes
  console.log('\n[Check 1] Verifying asset files and sizes:');
  for (const file of EXPECTED_FILES) {
    const fullPath = path.resolve(MODELS_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.error(`  FAIL: Missing required file ${file}`);
      totalErrors++;
    } else {
      const stats = fs.statSync(fullPath);
      console.log(`  PASS: ${file} exists (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  }

  // 2. Load and inspect skeleton-full.glb
  console.log('\n[Check 2] Inspecting skeleton-full.glb bone inventory:');
  const fullDoc = await io.read(path.resolve(MODELS_DIR, 'skeleton-full.glb'));
  const root = fullDoc.getRoot();
  const allNodes = root.listNodes();
  const allMeshes = root.listMeshes();

  // In glTF, node names correspond to the Object3D/Mesh instances
  const nodeNames = new Set(allNodes.map(n => n.getName()));
  const meshNames = new Set(allMeshes.map(m => m.getName() || '').filter(Boolean));
  // Combine both sets to ensure complete coverage
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

  // Assert bone groups
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

  let totalBonesCounted = 0;
  for (const cat of requiredCategories) {
    const found = [...allIdentifiedNames].filter(name => cat.regex.test(name));
    if (found.length === cat.expected) {
      console.log(`  PASS: ${cat.name} -> Found ${found.length} / ${cat.expected}`);
    } else {
      console.error(`  FAIL: ${cat.name} -> Found ${found.length} / Expected ${cat.expected}`);
      totalErrors++;
    }
    if (!cat.name.includes('Disc') && !cat.name.includes('Cartilage')) {
      totalBonesCounted += found.length;
    }
  }

  console.log(`  Total Adult Skeletal Bones Counted (excluding discs/cartilage): ${totalBonesCounted}`);

  // 3. Check Left/Right Symmetry
  console.log('\n[Check 3] Verifying Bilateral Symmetry & Node Names:');
  const leftBones = [...allIdentifiedNames].filter(n => n.endsWith('_L'));
  const rightBones = [...allIdentifiedNames].filter(n => n.endsWith('_R'));
  console.log(`  Left-side meshes: ${leftBones.length}, Right-side meshes: ${rightBones.length}`);
  if (leftBones.length === rightBones.length) {
    console.log(`  PASS: Perfect bilateral pairing (${leftBones.length} pairs).`);
  } else {
    console.error(`  FAIL: Mismatch in bilateral pairing!`);
    totalErrors++;
  }

  // 4. Check Anchors
  console.log('\n[Check 4] Verifying Spine Anchors on Rotation Axis:');
  const expectedAnchors = [
    'anchor_C1', 'anchor_C2', 'anchor_C3', 'anchor_C4', 'anchor_C5', 'anchor_C6', 'anchor_C7',
    'anchor_T1', 'anchor_T2', 'anchor_T3', 'anchor_T4', 'anchor_T5', 'anchor_T6', 'anchor_T7',
    'anchor_T8', 'anchor_T9', 'anchor_T10', 'anchor_T11', 'anchor_T12',
    'anchor_L1', 'anchor_L2', 'anchor_L3', 'anchor_L4', 'anchor_L5',
    'anchor_S', 'anchor_Co'
  ];

  let anchorPassCount = 0;
  for (const aName of expectedAnchors) {
    if (nodeNames.has(aName)) {
      anchorPassCount++;
    } else {
      console.error(`  FAIL: Missing anchor node ${aName}`);
      totalErrors++;
    }
  }
  if (anchorPassCount === expectedAnchors.length) {
    console.log(`  PASS: All 26 spine anchors present and verified.`);
  }

  // 5. Check Overall Bounding Box & Total Height
  console.log('\n[Check 5] Verifying Overall Stature and Origin Alignment:');
  let minY = Infinity, maxY = -Infinity;
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const m of allMeshes) {
    for (const prim of m.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const arr = pos.getArray();
      for (let i = 0; i < arr.length; i += 3) {
        const x = arr[i];
        const y = arr[i + 1];
        const z = arr[i + 2];
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

  // Final summary
  console.log('\n===============================================================');
  if (totalErrors === 0) {
    console.log('ALL 5 SKELETON VERIFICATION CHECKS PASSED WITH 0 ERRORS!');
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
