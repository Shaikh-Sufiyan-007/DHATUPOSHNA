// Build the layered Explore3D anatomical body.
//
//   npm run build:explore-body              all seven tissue layers, both tiers
//   npm run build:explore-body -- shell     only the named layers (dev iteration)
//
// Produces, in frontend/public/models/:
//   explore-body-<layer>.glb  and  explore-body-<layer>-lite.glb   (layer != asthi)
//   explore-regions.json      extended with every new region (the 17 skeleton
//                             regions are preserved exactly as emitted by
//                             build-explore-skeleton.mjs)
// Deterministic: seeded generators, no wall-clock in geometry, no Math.random.

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, dedup, quantize, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer/simplifier';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { REGION_INDEX, DHATU_LAYER_STATES, DHATU_CAMERA_DIRECTION, GLB_LAYER_FILES, TRIANGLE_BUDGET_HIGH, TRIANGLE_BUDGET_TOTAL_HIGH, SIZE_BUDGET_TOTAL_HIGH_MB, TRIANGLE_BUDGET_TOTAL_LITE, SIZE_BUDGET_TOTAL_LITE_MB, LAYER_DEPTH_RANK, OVERVIEW_OPACITY, GHOST_OPACITY, CONTEXT_DIM, CONTEXT_DESATURATE, TARGET_EMISSIVE_INTENSITY, HOVER_EMISSIVE_INTENSITY, regionTint } from './body/registry.js';
import { bakeSurfaceData } from './surface-data.js';
import { mergeGeoms, triCount, boxOf, stripDegenerate, clampOutsideSkin, clampInsideBone } from './body/mesh-utils.js';
import { bonesBothSides, vertebralMassBoxes } from './body/frame.js';
import { readParts } from './body/glb-read.js';
import { buildShell } from './body/gen-shell.js';
import { buildMeda } from './body/gen-meda.js';
import { buildMamsa } from './body/gen-mamsa.js';
import { buildRakta } from './body/gen-rakta.js';
import { buildRasa } from './body/gen-rasa.js';
import { buildMajja } from './body/gen-majja.js';
import { buildShukra } from './body/gen-shukra.js';

// Polyfill FileReader for GLTFExporter under Node
class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => { this.result = buf; if (this.onloadend) this.onloadend(); });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = 'data:application/octet-stream;base64,' + Buffer.from(buf).toString('base64');
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = NodeFileReader;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.resolve(__dirname, '../../public/models');

const GENERATORS = {
  shell: buildShell,
  meda: buildMeda,
  mamsa: buildMamsa,
  rakta: buildRakta,
  rasa: buildRasa,
  majja: buildMajja,
  shukra: buildShukra,
};

// Per-vertex surface-data tuning so every layer shares one material path.
const SURFACE_DEFAULTS = {
  shell: { defaultAo: 0.97, defaultThickness: 0.34 },
  meda: { defaultAo: 0.93, defaultThickness: 0.72 },
  mamsa: { defaultAo: 0.86, defaultThickness: 0.58 },
  rakta: { defaultAo: 0.88, defaultThickness: 0.62 },
  rasa: { defaultAo: 0.94, defaultThickness: 0.40 },
  majja: { defaultAo: 0.90, defaultThickness: 0.66 },
  shukra: { defaultAo: 0.92, defaultThickness: 0.55 },
};

// Lite tier decimation per layer (meshopt), on top of the low-radial generator.
const LITE_SIMPLIFY = {
  shell: 0.55, meda: 0.50, mamsa: 0.42, rakta: 0.45, rasa: 0.55, majja: 0.45, shukra: 0.60,
};

// How far inside the skin surface each generated layer is clamped (metres). The
// shell IS the silhouette, so it is not clamped; subcutaneous fat reaches the
// skin by definition and only keeps 2 mm; every other layer keeps the 5 mm
// margin the brief asks for.
const SKIN_CLAMP = {
  meda: 0.002, mamsa: 0.005, rakta: 0.005, rasa: 0.005, majja: 0.005, shukra: 0.005,
};

// Faces smaller than this are storage-precision slivers: they collapse to zero
// area once positions are quantized, so they are dropped before export.
const SLIVER_AREA = 1e-8;
// Long thin "needle" faces keep an area above SLIVER_AREA but have an edge shorter
// than the ~10-20 µm quantization step, so they vanish in the exported file and the
// verifier counts them as degenerate. 0.12 mm is ~10x that step and ~0.015% of the
// 800 px-tall figure: no visible feature depends on an edge this short.
const SLIVER_EDGE = 0.00012;

// Filled in main() from explore-skeleton.glb: the volumes marrow must stay inside.
let BONE_VOLUMES = null;
// explore-skeleton.glb is measured once per build and reused for the metadata.
let SKELETON_REGIONS = null;

function exportRawGLB(object3D) {
  return new Promise((resolve, reject) => {
    new GLTFExporter().parse(
      object3D,
      (buf) => resolve(Buffer.from(buf)),
      (err) => reject(err),
      { binary: true }
    );
  });
}

/** Merge one part-list into a region-grouped THREE.Group ready for export. */
function assembleLayer(layer, parts) {
  const byRegion = new Map();
  for (const p of parts) {
    const def = REGION_INDEX.get(p.region);
    if (!def) throw new Error(`Region "${p.region}" is not registered (layer ${layer})`);
    if (def.layer !== layer) throw new Error(`Region "${p.region}" belongs to layer "${def.layer}", got "${layer}"`);
    if (!byRegion.has(p.region)) byRegion.set(p.region, []);
    byRegion.get(p.region).push(p);
  }

  const group = new THREE.Group();
  group.name = `body_${layer}`;
  const summary = [];

  for (const [regionId, list] of byRegion) {
    const def = REGION_INDEX.get(regionId);
    const geom = list.length === 1 ? list[0].geometry : mergeGeoms(list.map((p) => p.geometry));
    if (SKIN_CLAMP[layer]) clampOutsideSkin(geom, SKIN_CLAMP[layer]);
    // Marrow is an inward offset of an analytic bone model; where that model and
    // the shipped skeleton disagree the offset can reach past the cortex.
    if (layer === 'majja' && regionId === 'marrow' && BONE_VOLUMES) {
      clampInsideBone(geom, { margin: 0.0022, bones: BONE_VOLUMES.bones, boxes: BONE_VOLUMES.boxes });
    }
    stripDegenerate(geom, SLIVER_AREA, SLIVER_EDGE);
    bakeSurfaceData(geom, SURFACE_DEFAULTS[layer]);
    const mesh = new THREE.Mesh(geom);
    mesh.name = `region_${regionId}`;
    const names = list.flatMap((p) => p.parts || [p.name]);
    mesh.userData = {
      region: regionId,
      layer,
      part: names[0] || regionId,
      parts: names,
      dhatus: def.dhatus,
      label: def.label,
    };
    group.add(mesh);
    summary.push({
      region: regionId,
      meshes: names.length,
      tris: triCount(geom),
      box: boxOf(geom),
      center: centerOf(boxOf(geom)),
    });
  }
  return { group, summary };
}

function centerOf(box) {
  return [
    (box.min[0] + box.max[0]) / 2,
    (box.min[1] + box.max[1]) / 2,
    (box.min[2] + box.max[2]) / 2,
  ];
}

const tintHex = (regionId, layer) => `#${regionTint(regionId, layer).toString(16).padStart(6, '0')}`;

async function writeGLB(group, file, { lite, layer }) {
  const raw = await exportRawGLB(group);
  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
  const doc = await io.readBinary(raw);
  const ops = [weld()];
  if (lite) {
    ops.push(simplify({ simplifier: MeshoptSimplifier, ratio: LITE_SIMPLIFY[layer], error: 0.0018 }));
  }
  ops.push(dedup(), quantize());
  await doc.transform(...ops);
  const buf = await io.writeBinary(doc);
  fs.writeFileSync(path.resolve(MODELS_DIR, file), Buffer.from(buf));
  return buf.byteLength;
}

function countTris(group) {
  let t = 0;
  group.traverse((o) => { if (o.isMesh) t += triCount(o.geometry); });
  return t;
}

function readExistingRegions() {
  const p = path.resolve(MODELS_DIR, 'explore-regions.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

/**
 * Measure the shipped skeleton (never rebuilt here) into region records, so the
 * asthi entries of explore-regions.json always match explore-skeleton.glb.
 */
async function skeletonRegionRecords() {
  if (SKELETON_REGIONS) return SKELETON_REGIONS;
  const file = path.resolve(MODELS_DIR, 'explore-skeleton.glb');
  const parts = await readParts(file);
  const agg = new Map();
  for (const p of parts) {
    if (!p.region || !REGION_INDEX.has(p.region)) continue;
    let a = agg.get(p.region);
    if (!a) { a = { tris: 0, meshes: 0, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }; agg.set(p.region, a); }
    a.tris += p.tris;
    a.meshes += 1;
    for (let i = 0; i < 3; i++) {
      a.min[i] = Math.min(a.min[i], p.bbox.min[i]);
      a.max[i] = Math.max(a.max[i], p.bbox.max[i]);
    }
  }
  const out = [];
  for (const def of REGION_INDEX.values()) {
    if (def.layer !== 'asthi') continue;
    const a = agg.get(def.id);
    if (!a) { console.warn(`[warn] skeleton region "${def.id}" has no geometry in explore-skeleton.glb`); continue; }
    const center = a.min.map((v, i) => (v + a.max[i]) / 2);
    out.push({
      id: def.id,
      name: def.label,
      layer: 'asthi',
      dhatus: def.dhatus,
      tint: tintHex(def.id, 'asthi'),
      meshCount: a.meshes,
      triangles: Math.round(a.tris),
      bbox: { min: a.min.map((v) => +v.toFixed(4)), max: a.max.map((v) => +v.toFixed(4)) },
      center: center.map((v) => +v.toFixed(4)),
      cameraTarget: center.map((v) => +v.toFixed(4)),
      suggestedDistance: +(Math.max(0.28, Math.max(
        a.max[0] - a.min[0], a.max[1] - a.min[1], a.max[2] - a.min[2]) * 2.3)).toFixed(3),
    });
  }
  return (SKELETON_REGIONS = out);
}

function glbTris(file) {
  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
  return io.read(path.resolve(MODELS_DIR, file)).then((doc) => {
    let t = 0;
    for (const mesh of doc.getRoot().listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const idx = prim.getIndices();
        t += idx ? idx.getCount() / 3 : (prim.getAttribute('POSITION')?.getCount() ?? 0) / 3;
      }
    }
    return t;
  });
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const layers = only.length ? only : Object.keys(GENERATORS);
  console.log('===============================================================');
  console.log('DHATUPOSHNA - EXPLORE3D LAYERED BODY BUILD');
  console.log(`layers: ${layers.join(', ')}`);
  console.log('===============================================================');
  await MeshoptSimplifier.ready;

  // The skeleton is the ground truth for marrow containment, so it is measured
  // before any layer is generated (read-only; it is never rebuilt here).
  const skeletonRegions = await skeletonRegionRecords();
  const cancellous = ['head', 'thorax', 'pelvis']
    .map((id) => skeletonRegions.find((r) => r.id === id))
    .filter(Boolean)
    .map((r) => r.bbox);
  BONE_VOLUMES = { bones: bonesBothSides(), boxes: [...vertebralMassBoxes(), ...cancellous] };

  const partSanity = [];
  const regionIndex = [];

  for (const layer of layers) {
    const gen = GENERATORS[layer];
    if (!gen) throw new Error(`No generator for layer "${layer}"`);

    const t0 = Date.now();
    const partsHigh = gen('high');
    const partsLite = gen('lite');
    const { group, summary } = assembleLayer(layer, partsHigh);
    const { group: liteGroup } = assembleLayer(layer, partsLite);

    const highFile = `${GLB_LAYER_FILES[layer]}.glb`;
    const liteFile = `${GLB_LAYER_FILES[layer]}-lite.glb`;
    const sizeHigh = await writeGLB(group, highFile, { lite: false, layer });
    const sizeLite = await writeGLB(liteGroup, liteFile, { lite: true, layer });

    const trisHigh = countTris(group);
    const trisLite = await glbTris(liteFile);

    const budget = TRIANGLE_BUDGET_HIGH[layer];
    const over = trisHigh > budget;
    console.log(`--> ${layer.padEnd(6)} ${String(trisHigh).padStart(7)} tris high / ${String(trisLite).padStart(6)} lite`
      + ` | ${(sizeHigh / 1024 / 1024).toFixed(2)} MB high / ${(sizeLite / 1024 / 1024).toFixed(2)} MB lite`
      + ` | ${summary.length} region mesh(es) | ${((Date.now() - t0) / 1000).toFixed(1)}s`
      + (over ? `  [OVER BUDGET ${budget}]` : ''));

    for (const s of summary) {
      const def = REGION_INDEX.get(s.region);
      regionIndex.push({
        id: s.region,
        name: def.label,
        layer,
        dhatus: def.dhatus,
        tint: tintHex(s.region, layer),
        meshCount: s.meshes,
        triangles: s.tris,
        bbox: { min: s.box.min.map((v) => +v.toFixed(4)), max: s.box.max.map((v) => +v.toFixed(4)) },
        center: s.center.map((v) => +v.toFixed(4)),
        cameraTarget: s.center.map((v) => +v.toFixed(4)),
        suggestedDistance: +(Math.max(0.28, Math.max(
          s.box.max[0] - s.box.min[0], s.box.max[1] - s.box.min[1], s.box.max[2] - s.box.min[2]) * 2.3)).toFixed(3),
      });
    }
    partSanity.push({ layer, parts: partsHigh.length, regions: summary.length });
  }

  // --- extend explore-regions.json -----------------------------------------
  // The 17 skeleton regions are re-measured from explore-skeleton.glb itself
  // (read-only), so a partial `-- <layer>` rebuild can never corrupt them.
  const existing = readExistingRegions();
  const prev = existing && existing.regions ? existing.regions : [];

  const rebuilt = new Set(layers);
  const preserved = prev.filter((r) => r.layer && r.layer !== 'asthi' && !rebuilt.has(r.layer));

  const all = [...skeletonRegions, ...preserved, ...regionIndex];

  const meta_files = {
    ...Object.fromEntries(Object.entries(GLB_LAYER_FILES).map(([k, v]) => [k, { high: `${v}.glb`, lite: `${v}-lite.glb` }])),
    asthi: { high: 'explore-skeleton.glb', lite: 'explore-skeleton-lite.glb' },
  };

  // Per-Dhatu composite camera preset, computed from the region boxes.
  const dhatuCameras = {};
  for (const slug of Object.keys(DHATU_LAYER_STATES)) {
    const ids = new Set();
    for (const r of all) if (r.dhatus.includes(slug)) ids.add(r.id);
    const regs = all.filter((r) => ids.has(r.id));
    if (!regs.length) continue;
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const r of regs) {
      lo = lo.map((v, i) => Math.min(v, r.bbox.min[i]));
      hi = hi.map((v, i) => Math.max(v, r.bbox.max[i]));
    }
    const c = lo.map((v, i) => +((v + hi[i]) / 2).toFixed(4));
    const span = Math.max(...hi.map((v, i) => v - lo[i]));
    const dir = DHATU_CAMERA_DIRECTION[slug] || [0, 0.05, 1];
    const dl = Math.hypot(...dir);
    const dist = +Math.max(0.42, span * 1.35).toFixed(3);
    dhatuCameras[slug] = {
      cameraTarget: c,
      cameraPosition: c.map((v, i) => +(v + (dir[i] / dl) * dist).toFixed(4)),
      distance: dist,
      direction: dir.map((v) => +(v / dl).toFixed(4)),
      bbox: { min: lo.map((v) => +v.toFixed(4)), max: hi.map((v) => +v.toFixed(4)) },
      regions: regs.map((r) => r.id),
    };
  }

  // Whole-body measures are recomputed from the shipped assets, so partial
  // rebuilds report the same totals a full rebuild would.
  const layerList = Object.keys(GLB_LAYER_FILES).concat(['asthi']);
  const fileFor = (layer, tier) => meta_files[layer][tier];
  const trianglesHigh = all.reduce((n, r) => n + r.triangles, 0);
  let trianglesLite = 0;
  let sizeHigh = 0;
  let sizeLite = 0;
  for (const layer of layerList) {
    trianglesLite += await glbTris(fileFor(layer, 'lite'));
    for (const tier of ['high', 'lite']) {
      const f = path.resolve(MODELS_DIR, fileFor(layer, tier));
      const bytes = fs.existsSync(f) ? fs.statSync(f).size : 0;
      if (tier === 'high') sizeHigh += bytes; else sizeLite += bytes;
    }
  }
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (const r of all) {
    for (let i = 0; i < 3; i++) {
      lo[i] = Math.min(lo[i], r.bbox.min[i]);
      hi[i] = Math.max(hi[i], r.bbox.max[i]);
    }
  }
  const overallCenter = lo.map((v, i) => +((v + hi[i]) / 2).toFixed(4));

  const meta = {
    schema: 'explore-body/2',
    frame: {
      units: 'meters', up: '+Y', anterior: '+Z', anatomicalLeft: '+X',
      statureNominal: 1.72, skinTopY: 1.7335, soleY: 0.0035,
      generatedBy: 'build-explore-body.mjs (deterministic, seeded)',
    },
    bodyCenter: overallCenter,
    bbox: { min: lo.map((v) => +v.toFixed(4)), max: hi.map((v) => +v.toFixed(4)) },
    // Runtime render config, generated from body/registry.js so the viewer never
    // duplicates the table: one entry per layer, outermost first.
    layers: Object.fromEntries(layerList.map((l) => [l, {
      name: l,
      depthRank: LAYER_DEPTH_RANK[l],
      overviewOpacity: OVERVIEW_OPACITY[l],
      ghost: OVERVIEW_OPACITY[l] < 1,
    }])),
    stateConstants: {
      ghostOpacity: GHOST_OPACITY,
      contextDim: CONTEXT_DIM,
      contextDesaturate: CONTEXT_DESATURATE,
      targetEmissive: TARGET_EMISSIVE_INTENSITY,
      hoverEmissive: HOVER_EMISSIVE_INTENSITY,
    },
    dhatuLayerStates: DHATU_LAYER_STATES,
    files: meta_files,
    totals: {
      trianglesHigh,
      trianglesLite,
      sizeHighMB: +(sizeHigh / 1024 / 1024).toFixed(2),
      sizeLiteMB: +(sizeLite / 1024 / 1024).toFixed(2),
      budgetHigh: TRIANGLE_BUDGET_TOTAL_HIGH,
      budgetLite: TRIANGLE_BUDGET_TOTAL_LITE,
      sizeBudgetHighMB: SIZE_BUDGET_TOTAL_HIGH_MB,
      sizeBudgetLiteMB: SIZE_BUDGET_TOTAL_LITE_MB,
    },
    dhatuCameras,
    regions: all,
    // Dhatu -> every region tagged with it, across all layers. This is the
    // shipped form of the site's Dhatu-to-part mapping; asthi-only subsets stay
    // available to the legacy viewer through DHATU_TO_SKELETON_REGIONS.
    dhatuRegionMapping: Object.fromEntries(Object.keys(DHATU_LAYER_STATES).map((slug) => [
      slug, [...new Set(all.filter((r) => r.dhatus.includes(slug)).map((r) => r.id))],
    ])),
  };

  fs.writeFileSync(path.resolve(MODELS_DIR, 'explore-regions.json'), JSON.stringify(meta, null, 2));
  console.log(`\n[meta] explore-regions.json: ${all.length} regions (${skeletonRegions.length} skeleton)`);
  console.log(`[totals] ${trianglesHigh} tris high / ${trianglesLite} lite | `
    + `${(sizeHigh / 1024 / 1024).toFixed(2)} MB high / ${(sizeLite / 1024 / 1024).toFixed(2)} MB lite `
    + `(budget ${TRIANGLE_BUDGET_TOTAL_HIGH}/${TRIANGLE_BUDGET_TOTAL_LITE} tris, `
    + `${SIZE_BUDGET_TOTAL_HIGH_MB}/${SIZE_BUDGET_TOTAL_LITE_MB} MB)`);
  console.log(`[frame] bbox ${JSON.stringify(meta.bbox.min)} .. ${JSON.stringify(meta.bbox.max)} height ${(hi[1] - lo[1]).toFixed(4)} m`);
  for (const s of partSanity) console.log(`  ${s.layer}: ${s.parts} parts -> ${s.regions} region meshes`);
  console.log('\nEXPLORE BODY BUILD COMPLETE');
}

main().catch((e) => { console.error('Fatal build error:', e); process.exit(1); });
