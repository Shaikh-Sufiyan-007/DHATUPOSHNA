// Master GLB Optimization Pipeline for DHATUPOSHNA
// Optimizes all production 3D assets with dedup, prune, weld, quantize, and Draco compression.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, draco, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3d';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_DIR = path.resolve(__dirname, '../public/models');
const BACKUP_DIR = path.resolve(__dirname, '../../scratch/original-models-backup');

async function optimizeFile({
  inputPath,
  outputPath,
  simplifyRatio = null,
  encoder,
  io,
}) {
  const relIn = path.relative(MODELS_DIR, inputPath);
  const relOut = path.relative(MODELS_DIR, outputPath);
  const originalSize = fs.statSync(inputPath).size;

  const doc = await io.read(inputPath);

  const transforms = [
    dedup(),
    prune({ keepLeaves: true, keepAttributes: true }),
  ];

  if (simplifyRatio) {
    try {
      await MeshoptSimplifier.ready;
      transforms.push(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: simplifyRatio,
          error: 0.001,
        })
      );
    } catch {
      // Continue if meshopt simplifier isn't applicable
    }
  }

  transforms.push(
    draco({
      encoder,
      quantizationBits: {
        POSITION: 14,
        NORMAL: 10,
        TEX_COORD: 12,
      },
    })
  );

  await doc.transform(...transforms);

  const glb = await io.writeBinary(doc);
  fs.writeFileSync(outputPath, Buffer.from(glb));
  const newSize = glb.byteLength;
  const savingsPct = (((originalSize - newSize) / originalSize) * 100).toFixed(1);

  console.log(
    `[Optimized] ${relIn} -> ${relOut} | ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB (-${savingsPct}%)`
  );

  return { originalSize, newSize };
}

async function main() {
  console.log('===============================================================');
  console.log('DHATUPOSHNA — PRODUCTION 3D MODEL OPTIMIZATION PIPELINE');
  console.log('===============================================================');

  // Verify backup exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const files = fs.readdirSync(MODELS_DIR);
    for (const file of files) {
      if (file.endsWith('.glb') || file.endsWith('.json')) {
        fs.copyFileSync(path.join(MODELS_DIR, file), path.join(BACKUP_DIR, file));
      }
    }
    console.log(`[Backup] Backed up original models to ${BACKUP_DIR}`);
  }

  const encoder = await draco3d.createEncoderModule();
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.encoder': encoder });

  let totalOriginal = 0;
  let totalOptimized = 0;

  // 1. Landing Models
  const landingModels = [
    { in: 'skull-hero.glb', out: 'skull-hero.glb', isLite: false },
    { in: 'skull-hero.glb', out: 'skull-hero-lite.glb', isLite: true, simplifyRatio: 0.45 },
    { in: 'spine-anatomical.glb', out: 'spine-anatomical.glb', isLite: false },
    { in: 'spine-anatomical.glb', out: 'spine-anatomical-lite.glb', isLite: true, simplifyRatio: 0.5 },
    { in: 'skeleton-full.glb', out: 'skeleton-full.glb', isLite: false },
    { in: 'skeleton-full-lite.glb', out: 'skeleton-full-lite.glb', isLite: true, simplifyRatio: 0.4 },
  ];

  console.log('\n--- Optimizing Landing Page Models ---');
  for (const item of landingModels) {
    const inputPath = path.join(BACKUP_DIR, item.in);
    const outputPath = path.join(MODELS_DIR, item.out);
    if (fs.existsSync(inputPath)) {
      const stats = await optimizeFile({
        inputPath,
        outputPath,
        isLite: item.isLite,
        simplifyRatio: item.simplifyRatio,
        encoder,
        io,
      });
      totalOriginal += stats.originalSize;
      totalOptimized += stats.newSize;
    }
  }

  // 2. Explore3D Models
  const exploreModels = [
    { in: 'explore-skeleton.glb', out: 'explore-skeleton.glb' },
    { in: 'explore-skeleton-lite.glb', out: 'explore-skeleton-lite.glb' },
    { in: 'explore-body-shell.glb', out: 'explore-body-shell.glb' },
    { in: 'explore-body-shell-lite.glb', out: 'explore-body-shell-lite.glb' },
    { in: 'explore-body-meda.glb', out: 'explore-body-meda.glb' },
    { in: 'explore-body-meda-lite.glb', out: 'explore-body-meda-lite.glb' },
    { in: 'explore-body-mamsa.glb', out: 'explore-body-mamsa.glb' },
    { in: 'explore-body-mamsa-lite.glb', out: 'explore-body-mamsa-lite.glb' },
    { in: 'explore-body-rakta.glb', out: 'explore-body-rakta.glb' },
    { in: 'explore-body-rakta-lite.glb', out: 'explore-body-rakta-lite.glb' },
    { in: 'explore-body-rasa.glb', out: 'explore-body-rasa.glb' },
    { in: 'explore-body-rasa-lite.glb', out: 'explore-body-rasa-lite.glb' },
    { in: 'explore-body-majja.glb', out: 'explore-body-majja.glb' },
    { in: 'explore-body-majja-lite.glb', out: 'explore-body-majja-lite.glb' },
    { in: 'explore-body-shukra.glb', out: 'explore-body-shukra.glb' },
    { in: 'explore-body-shukra-lite.glb', out: 'explore-body-shukra-lite.glb' },
    { in: 'human-body.glb', out: 'human-body.glb' },
  ];

  console.log('\n--- Optimizing Explore3D Body Models ---');
  for (const item of exploreModels) {
    const inputPath = path.join(BACKUP_DIR, item.in);
    const outputPath = path.join(MODELS_DIR, item.out);
    if (fs.existsSync(inputPath)) {
      const stats = await optimizeFile({
        inputPath,
        outputPath,
        isLite: item.isLite,
        simplifyRatio: item.simplifyRatio,
        encoder,
        io,
      });
      totalOriginal += stats.originalSize;
      totalOptimized += stats.newSize;
    }
  }

  const grandSavingsPct = (((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1);
  console.log('\n===============================================================');
  console.log(`TOTAL PAYLOAD BEFORE: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`TOTAL PAYLOAD AFTER:  ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`TOTAL BANDWIDTH SAVED: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB (-${grandSavingsPct}%)`);
  console.log('===============================================================');
}

main().catch((err) => {
  console.error('[Error optimizing models]:', err);
  process.exit(1);
});

