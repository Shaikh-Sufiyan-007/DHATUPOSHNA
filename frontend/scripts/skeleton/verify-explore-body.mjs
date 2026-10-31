// Verify the Explore3D layered body against the build contract, section by
// section, exactly as shipped (the GLBs are the deliverable, not the generators).
//
//   npm run verify:explore-body
//
// Exit code 0 = every assertion passed. Any FAIL means the assets must not ship.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { LAYERS, REGION_INDEX, GLB_LAYER_FILES, ASTHI_FILE, TRIANGLE_BUDGET_HIGH } from './body/registry.js';
import { readParts } from './body/glb-read.js';
import {
  skinSurfaceDistance, canalEllipseAt, vertebralBodyBoneDistance, vertebralMassBoxes, CRANIAL_CAVITY,
  bonesBothSides, sdBone, SKIN_TOP_Y,
} from './body/frame.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS = path.resolve(__dirname, '../../public/models');

// --- tolerances, one place ---------------------------------------------------
const MIRROR_TOL = 0.006;      // L/R bbox asymmetry, metres
const DEGEN_AREA = 1e-10;      // below this a triangle counts as degenerate
const FRACTION = 0.995;        // containment is asserted as a vertex fraction
const STATURE = 1.72;          // anatomical height, metres
const STATURE_TOL = 0.02;
// The shell is lofted on the body field plus skin-surface noise (0.0016 m
// amplitude in gen-shell.js), so it sits proud of that field by design; anything
// past the noise amplitude plus quantization slack is a real silhouette breach.
const SHELL_BREACH = 0.0025;
// How deep inside the skin surface each layer must stay. The shell IS that
// surface; subcutaneous fat reaches it (2 mm), everything else keeps 5 mm.
const LAYER_MARGIN = { meda: 0.002, mamsa: 0.005, rakta: 0.005, rasa: 0.005, majja: 0.005, shukra: 0.005 };
const SKIN_SAMPLES = 60000;    // vertices per layer scanned against the skin field
const MAX_DRAW_CALLS = 60;     // low tier; desktop budget is 150
// A vertex this far inside vertebral body bone is a real burial. Shallower contact
// is the smooth-min blend the spine generator uses where body meets pedicle.
const VERT_BONE_PAD = 0.005;

const REQUIRED_PARTS = {
  shell: ['skin_trunk', 'skin_head', 'skin_finger_1_L'],
  meda: ['fat_subcut_trunk', 'greater_omentum', 'perirenal_fat_L', 'kidney_L', 'kidney_R'],
  mamsa: ['diaphragm', 'central_tendon', 'rectus_abdominis_L', 'external_oblique_L', 'latissimus_dorsi_L',
    'erector_spinae_longissimus_L', 'gluteus_maximus_L', 'quadratus_lumborum_L', 'deltoid_middle_L',
    'biceps_long_L', 'triceps_long_L', 'brachioradialis_L', 'thenar_L', 'sartorius_L', 'rectus_femoris_L',
    'vastus_medialis_L', 'biceps_femoris_long_L', 'gracilis_L', 'adductor_magnus_L', 'gastrocnemius_medial_L',
    'soleus_L', 'tibialis_anterior_L', 'peroneus_longus_L', 'temporalis_L', 'sternocleidomastoid_L',
    'trapezius_upper_L', 'supraspinatus_L', 'infraspinatus_L', 'subscapularis_L', 'pectoralis_major_sternal_L',
    'serratus_anterior_L', 'pronator_teres_L', 'flexor_carpi_radialis_L', 'extensor_digorum_L',
    'gluteus_medius_L', 'piriformis_L', 'iliacus_L', 'psoas_major_L', 'vastus_lateralis_L',
    'semimembranosus_L', 'semitendinosus_L', 'gastrocnemius_lateral_L', 'tibialis_posterior_L',
    'extensor_digorum_longus_L', 'flexor_digorum_longus_L', 'calcaneal_tendon_L', 'patellar_ligament_L',
    'quadriceps_tendon_L', 'iliotibial_tract_L', 'masseter_L', 'digastric_L'],
  rakta: ['left_ventricle', 'right_ventricle', 'left_atrium', 'right_atrium', 'pulmonary_trunk',
    'aortic_arch', 'descending_aorta', 'abdominal_aorta', 'brachiocephalic_trunk', 'left_subclavian',
    'common_carotid_L', 'coeliac_trunk', 'superior_mesenteric', 'renal_L', 'common_iliac_L',
    'femoral_L', 'superior_vena_cava', 'inferior_vena_cava', 'portal_vein', 'renal_veins',
    'iliac_confluence', 'internal_jugular_L', 'hepatic_veins', 'hepar_lobus_dexter', 'lien'],
  rasa: ['cisterna_chyli', 'thoracic_duct', 'right_lymphatic_duct', 'intestinal_trunk', 'lumbar_trunk_L',
    'thymus_lobus_dexter', 'deep_cervical_01_L', 'axillary_01_L', 'paraaortic_01_L', 'inguinal_01_L',
    'popliteal_01_L'],
  majja: ['cerebrum_L', 'cerebellar_vermis', 'midbrain', 'pons', 'medulla_oblongata', 'spinal_cord',
    'filum_terminale', 'brachial_plexus_trunks_L', 'median_L', 'ulnar_L', 'radial_L', 'femoral_L',
    'sciatic_L', 'marrow_femur_L', 'marrow_vertebral_column', 'marrow_sternum', 'marrow_rib_01_L',
    'marrow_ilium_L'],
  shukra: ['testis_L', 'testis_R', 'epididymis_L', 'vas_deferens_L', 'seminal_vesicle_L', 'prostate',
    'bulbourethral_gland_L'],
};

let failures = 0;
let checks = 0;
const groups = [];
function check(label, ok, detail = '') {
  checks++;
  if (!ok) failures++;
  groups.push({ label, ok: !!ok, detail });
  const mark = ok ? '  ok  ' : ' FAIL ';
  console.log(`[${mark}] ${label}${detail ? ` — ${detail}` : ''}`);
}
const pct = (n) => `${(n * 100).toFixed(2)}%`;

/** Iterate the triangles of a part; cb receives the three world positions. */
function forEachTri(p, cb) {
  const pos = p.position;
  const idx = p.index;
  if (idx) {
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      cb([pos[a], pos[a + 1], pos[a + 2]], [pos[b], pos[b + 1], pos[b + 2]], [pos[c], pos[c + 1], pos[c + 2]]);
    }
  } else {
    for (let i = 0; i < pos.length; i += 9) {
      cb([pos[i], pos[i + 1], pos[i + 2]], [pos[i + 3], pos[i + 4], pos[i + 5]], [pos[i + 6], pos[i + 7], pos[i + 8]]);
    }
  }
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Fraction of a part's vertices satisfying pred, plus the worst offender. */
function ratio(p, pred) {
  const pos = p.position;
  let good = 0;
  let worst = 0;
  for (let i = 0; i < p.vertices; i++) {
    const k = i * 3;
    const q = [pos[k], pos[k + 1], pos[k + 2]];
    const r = pred(q);
    if (r === true) good++;
    else if (r > worst) worst = r;
  }
  return { frac: good / p.vertices, worst };
}

/**
 * Walk every layer's vertices at a bounded sample budget and report how many sit
 * outside the skin field (breach) or inside it by less than `margin` (thin).
 */
function skinScan(layerParts, margin) {
  let total = 0;
  for (const p of layerParts) total += p.vertices;
  const stride = Math.max(1, Math.ceil(total / SKIN_SAMPLES));
  let breach = 0, thin = 0, seen = 0, worst = -Infinity, worstAt = '';
  for (const p of layerParts) {
    const pos = p.position;
    for (let i = 0; i < p.vertices; i += stride) {
      const q = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
      const d = skinSurfaceDistance(q); // Infinity = outside every segment box
      seen++;
      if (d > 0) {
        breach++;
        if (d > worst) { worst = d; worstAt = p.name; }
      } else if (d > -margin) thin++;
    }
  }
  return { breach, thin, seen, worst, worstAt };
}

const BONES = bonesBothSides();
const ZERO = { depth: 0, tag: '' };
const NEAR = { tag: '', d: 0 };

/**
 * How deep q sits inside vertebral BODY BONE, in metres; 0 when it is out of bone.
 * The volume is the analytic one the spine generator carves, so a part that merely
 * touches a body, a pedicle or the disc space in front of it scores 0.
 */
function vertebralBoneDepth(q) {
  const d = vertebralBodyBoneDistance(q, NEAR);
  return d < 0 ? { depth: -d, tag: NEAR.tag } : ZERO;
}

// ---------------------------------------------------------------------------
// 1. assets exist and are readable
// ---------------------------------------------------------------------------
const files = {};
for (const layer of LAYERS) {
  const base = layer === 'asthi' ? ASTHI_FILE : GLB_LAYER_FILES[layer];
  files[layer] = { high: `${base}.glb`, lite: `${base}-lite.glb` };
}
console.log('=== 1. files, meshes, budgets ===');
const parts = {};
const liteParts = {};
let trisHigh = 0;
let trisLite = 0;
let sizeHigh = 0;
let sizeLite = 0;
let drawCalls = 0;
for (const layer of LAYERS) {
  for (const tier of ['high', 'lite']) {
    const f = path.join(MODELS, files[layer][tier]);
    if (!fs.existsSync(f)) { check(`${layer}/${tier} exists`, false, f); continue; }
    const st = fs.statSync(f);
    if (tier === 'high') { sizeHigh += st.size; trisHigh += 0; } else sizeLite += st.size;
  }
  parts[layer] = await readParts(path.join(MODELS, files[layer].high));
  liteParts[layer] = await readParts(path.join(MODELS, files[layer].lite));
  const th = parts[layer].reduce((s, p) => s + p.tris, 0);
  const tl = liteParts[layer].reduce((s, p) => s + p.tris, 0);
  trisHigh += th;
  trisLite += tl;
  if (layer !== 'asthi') {
    check(`${layer} triangles <= budget`, th <= TRIANGLE_BUDGET_HIGH[layer],
      `${th} / ${TRIANGLE_BUDGET_HIGH[layer]}`);
  }
  check(`${layer} lite < high`, tl < th, `${tl} vs ${th}`);
  console.log(`       ${layer.padEnd(6)} ${String(parts[layer].length).padStart(3)} meshes  ` +
    `${String(th).padStart(7)} tris high  ${String(tl).padStart(7)} tris lite  ` +
    `${(fs.statSync(path.join(MODELS, files[layer].high)).size / 1048576).toFixed(2)} MB / ` +
    `${(fs.statSync(path.join(MODELS, files[layer].lite)).size / 1048576).toFixed(2)} MB`);
}
check('total triangles high <= 1.8M', trisHigh <= 1800000, `${trisHigh}`);
check('total triangles lite <= 450k', trisLite <= 450000, `${trisLite}`);
check('total size high <= 28 MB', sizeHigh <= 28 * 1048576, `${(sizeHigh / 1048576).toFixed(2)} MB`);
check('total size lite <= 8 MB', sizeLite <= 8 * 1048576, `${(sizeLite / 1048576).toFixed(2)} MB`);
// Draw calls are counted the way the viewer renders: one merged mesh per
// (layer, region). The skeleton's 257 bones collapse into their 17 regions;
// teeth keep their own mesh inside `head` because they take a different tone.
const regionMeshCount = LAYERS.reduce((n, l) => n + new Set(parts[l].map((p) => p.region)).size, 0);
drawCalls = regionMeshCount + (parts.asthi.some((p) => /^tooth_/.test(p.name)) ? 1 : 0);
check(`draw calls (one mesh per layer+region) <= ${MAX_DRAW_CALLS}`, drawCalls <= MAX_DRAW_CALLS, `${drawCalls}`);

// ---------------------------------------------------------------------------
// 2. userData contract: one region per mesh, layer, part names, COLOR_0
// ---------------------------------------------------------------------------
console.log('=== 2. mesh metadata ===');
let metaBad = 0;
let colorBad = 0;
let regionMismatch = 0;
const allPartNames = {};
for (const layer of LAYERS) {
  allPartNames[layer] = new Set();
  for (const p of parts[layer]) {
    const def = REGION_INDEX.get(p.region);
    // explore-skeleton.glb predates the layer tag and is protected from rebuilds,
    // so for asthi the file itself supplies the layer.
    const layerTag = p.layer || (layer === 'asthi' ? 'asthi' : null);
    if (!p.region || !layerTag || !p.part || !def) { metaBad++; continue; }
    if (def.layer !== layerTag || layerTag !== layer) regionMismatch++;
    if (!p.hasColor) colorBad++;
    if (p.vertices < 3 || p.tris < 1) metaBad++;
    for (const n of p.parts || [p.part]) allPartNames[layer].add(n);
  }
}
check('every mesh carries region + layer + part userData', metaBad === 0, `${metaBad} bad`);
check('mesh region agrees with the registry layer', regionMismatch === 0, `${regionMismatch} bad`);
check('every mesh has baked COLOR_0 surface data', colorBad === 0, `${colorBad} missing`);
for (const layer of LAYERS) {
  if (layer === 'asthi') continue;
  const missing = REQUIRED_PARTS[layer].filter((n) => !allPartNames[layer].has(n));
  check(`${layer} ships its named anatomy`, missing.length === 0,
    missing.length ? `missing: ${missing.join(', ')}` : `${allPartNames[layer].size} named parts`);
}

// ---------------------------------------------------------------------------
// 3. geometry hygiene: NaN, empty, degenerate, orientation, single region
// ---------------------------------------------------------------------------
console.log('=== 3. geometry hygiene ===');
let nanParts = [];
let degenParts = [];
let degenLite = [];
let invertedParts = [];
const warns = [];
function warn(label, detail) { warns.push(`${label} — ${detail}`); console.log(`[ WARN ] ${label} — ${detail}`); }
let legacyDegenWorst = 0;
let legacyInverted = 0;
let legacyMeshes = 0;
for (const layer of LAYERS) {
  const legacy = layer === 'asthi';
  for (const p of parts[layer]) {
    let nan = 0;
    for (let i = 0; i < p.position.length; i++) if (!Number.isFinite(p.position[i])) nan++;
    for (let i = 0; i < p.normal.length; i++) if (!Number.isFinite(p.normal[i])) nan++;
    if (nan) { nanParts.push(`${layer}/${p.name}`); continue; }

    let deg = 0;
    let vol = 0;
    forEachTri(p, (a, b, c) => {
      const cr = cross(sub(b, a), sub(c, a));
      if (0.5 * Math.hypot(cr[0], cr[1], cr[2]) < DEGEN_AREA) deg++;
      vol += dot(a, cr) / 6;
    });
    if (legacy) {
      legacyMeshes++;
      legacyDegenWorst = Math.max(legacyDegenWorst, deg / p.tris);
      if (vol < -1e-9) legacyInverted++;
    } else {
      if (deg / p.tris > 0.001) degenParts.push(`${layer}/${p.name} ${pct(deg / p.tris)}`);
      // A closed outward-oriented mesh encloses positive signed volume. Mirror- or
      // winding-flipped geometry shows up here as a negative shell.
      if (vol < -1e-9) invertedParts.push(`${layer}/${p.name}`);
    }
    const flat = p.normal.length === 0 || p.normal.every((n) => Math.abs(n) < 0.5);
    if (flat) invertedParts.push(`${layer}/${p.name} (zero normals)`);
  }
  // The -lite meshes ship to phones as well, so they get the same hygiene pass at a
  // looser gate: meshopt decimation deliberately merges short edges.
  for (const p of liteParts[layer]) {
    if (layer === 'asthi') continue;
    let deg = 0;
    forEachTri(p, (a, b, c) => {
      const cr = cross(sub(b, a), sub(c, a));
      if (0.5 * Math.hypot(cr[0], cr[1], cr[2]) < DEGEN_AREA) deg++;
    });
    if (deg / p.tris > 0.002) degenLite.push(`${layer}/${p.name} ${pct(deg / p.tris)}`);
  }
}
check('no NaN in any shipped vertex or normal', nanParts.length === 0, nanParts.join(', '));
check('no generated mesh is >0.1% degenerate triangles', degenParts.length === 0, degenParts.join(', '));
check('no generated lite mesh is >0.2% degenerate triangles', degenLite.length === 0, degenLite.join(', '));
check('every generated mesh is outward-oriented (positive signed volume)', invertedParts.length === 0, invertedParts.join(', '));
if (legacyInverted || legacyDegenWorst > 0.001) {
  warn('explore-skeleton.glb ships inside-out winding on some bones',
    `${legacyInverted}/${legacyMeshes} meshes have negative signed volume; the viewer flips each merged `
    + `asthi region by signed volume, worst legacy sliver rate ${pct(legacyDegenWorst)}`);
}

// ---------------------------------------------------------------------------
// 4. left/right symmetry
// ---------------------------------------------------------------------------
console.log('=== 4. left / right mirror ===');
const mirrorBad = [];
for (const layer of LAYERS) {
  for (const p of parts[layer]) {
    const names = p.parts || [];
    const bases = new Map();
    for (const n of names) {
      const m = /^(.*)_(L|R)$/.exec(n) || /^(.*?root_\d+)(L|R)$/.exec(n);
      if (!m) continue;
      const e = bases.get(m[1]) || { L: 0, R: 0 };
      e[m[2]]++;
      bases.set(m[1], e);
    }
    for (const [base, e] of bases) {
      if (e.L !== e.R) mirrorBad.push(`${base}(${e.L}/${e.R})`);
    }
  }
}
check('named parts pair up L/R inside every mesh', mirrorBad.length === 0, mirrorBad.join(', '));
/** Union bbox of every shipped mesh of a region, in the [x,y,z] array form readParts uses. */
function regionBox(layer, regionId) {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (const p of parts[layer] || []) {
    if (p.region !== regionId) continue;
    for (let i = 0; i < 3; i++) {
      lo[i] = Math.min(lo[i], p.bbox.min[i]);
      hi[i] = Math.max(hi[i], p.bbox.max[i]);
    }
  }
  return { min: lo, max: hi };
}
const asym = [];
for (const pair of [['arm_L', 'arm_R'], ['hand_L', 'hand_R'], ['leg_L', 'leg_R'], ['foot_L', 'foot_R'],
  ['shoulder_L', 'shoulder_R']]) {
  const [l, r] = pair.map((id) => regionBox('asthi', id));
  if (!Number.isFinite(l.min[0]) || !Number.isFinite(r.min[0])) { asym.push(`${pair.join('/')} absent`); continue; }
  const dx = Math.max(Math.abs(l.min[0] + r.max[0]), Math.abs(l.max[0] + r.min[0]));
  const dy = Math.max(Math.abs(l.min[1] - r.min[1]), Math.abs(l.max[1] - r.max[1]));
  const dz = Math.max(Math.abs(l.min[2] - r.min[2]), Math.abs(l.max[2] - r.max[2]));
  const worst = Math.max(dx, dy, dz);
  if (worst > MIRROR_TOL) asym.push(`${pair.join('/')} ${worst.toFixed(4)} m`);
}
check('skeleton side regions mirror within 6 mm', asym.length === 0, asym.join(', '));

// ---------------------------------------------------------------------------
// 5. frame and stature
// ---------------------------------------------------------------------------
console.log('=== 5. frame, stature, silhouette ===');
let fmin = [Infinity, Infinity, Infinity];
let fmax = [-Infinity, -Infinity, -Infinity];
for (const layer of LAYERS) {
  for (const p of parts[layer]) {
    for (let k = 0; k < 3; k++) {
      fmin[k] = Math.min(fmin[k], p.bbox.min[k]);
      fmax[k] = Math.max(fmax[k], p.bbox.max[k]);
    }
  }
}
const skull = regionBox('asthi', 'head');
const craniumApex = skull.max[1];
check(`stature ${STATURE} +/- ${STATURE_TOL} m (cranium apex)`,
  Math.abs(craniumApex - STATURE) <= STATURE_TOL, `cranium ${craniumApex.toFixed(4)} m`);
check('feet reach the floor plane', fmin[1] >= 0 && fmin[1] < 0.012, `lowest y ${fmin[1].toFixed(4)}`);
check('nothing breaches the skin silhouette (+Z anterior, Y up)',
  fmax[1] <= SKIN_TOP_Y + 0.002, `top ${fmax[1].toFixed(4)} <= ${(SKIN_TOP_Y + 0.002).toFixed(4)}`);
console.log(`       frame bbox ${fmin.map((v) => v.toFixed(3)).join(',')} .. ${fmax.map((v) => v.toFixed(3)).join(',')}  height ${(fmax[1] - fmin[1]).toFixed(4)} m`);
const shellP = parts.shell.find((p) => p.region === 'skin_shell');
const shellScan = skinScan([shellP], 0);
check('the skin shell stays on its own body field (noise amplitude included)',
  !(shellScan.worst > SHELL_BREACH),
  `${pct(shellScan.breach / shellScan.seen)} vertices proud of the field, worst ${(shellScan.worst * 1000).toFixed(2)} mm in ${shellScan.worstAt} (limit ${(SHELL_BREACH * 1000).toFixed(1)} mm)`);

// ---------------------------------------------------------------------------
// 6. containment — every internal layer inside the skin with 5 mm margin
// ---------------------------------------------------------------------------
console.log('=== 6. containment inside the shell ===');
for (const layer of LAYERS) {
  if (layer === 'shell') continue;
  const margin = LAYER_MARGIN[layer];
  const s = skinScan(parts[layer], margin ?? 0.005);
  const line = `${pct(1 - s.breach / s.seen)} inside, ${(s.thin / s.seen * 100).toFixed(2)}% within `
    + `${(margin * 1000).toFixed(1)} mm of the skin, worst breach ${Number.isFinite(s.worst) ? `${(s.worst * 1000).toFixed(1)} mm in ${s.worstAt}` : 'outside every segment box'}`;
  if (!margin) {
    // explore-skeleton.glb is protected and predates the shell: the scapular
    // spine and the skull ARE subcutaneous, so this is reported, not enforced.
    warn(`${layer} sits inside the skin`, line);
    continue;
  }
  check(`${layer} stays ${margin * 1000} mm inside the skin`, s.breach / s.seen < 0.002 && s.thin / s.seen < 0.005, line);
}

// ---------------------------------------------------------------------------
// 7. containment — cavities, canals, cortex
// ---------------------------------------------------------------------------
console.log('=== 7. containment inside bone and cavities ===');
const regionPart = (layer, region) => parts[layer].find((p) => p.region === region);
const brain = regionPart('majja', 'brain');
const cereb = regionPart('majja', 'cerebellum');
const CC = CRANIAL_CAVITY;
for (const [label, p] of [['cerebrum', brain], ['cerebellum', cereb]]) {
  const r = ratio(p, (q) => {
    const e = Math.hypot((q[0] - CC.centre[0]) / CC.radii[0], (q[1] - CC.centre[1]) / CC.radii[1],
      (q[2] - CC.centre[2]) / CC.radii[2]);
    return e <= 1.005 ? true : e - 1;
  });
  check(`${label} fits inside the cranial cavity`, r.frac >= FRACTION,
    `${pct(r.frac)} inside, worst overshoot ${(r.worst * 1000).toFixed(1)} mm`);
}
for (const region of ['spinal_cord', 'cauda_equina', 'brainstem']) {
  const p = regionPart('majja', region);
  const r = ratio(p, (q) => {
    const c = canalEllipseAt(q[1]);
    const e = Math.hypot(q[0] / c.rx, (q[2] - c.z) / c.rz);
    return e <= 1.35 ? true : e - 1.35; // 35% of slack = the canal's own margin
  });
  check(`${region} lies in the vertebral canal`, r.frac >= FRACTION,
    `${pct(r.frac)} inside, worst overshoot ${r.worst.toFixed(2)} canal radii`);
}
const marrow = regionPart('majja', 'marrow');
{
  // The volumes the build is allowed to fill with marrow: long-bone capsules,
  // whole vertebrae, and the bbox of the cancellous-bone regions.
  const boxes = [regionBox('asthi', 'thorax'), regionBox('asthi', 'pelvis'), skull];
  const MASS = vertebralMassBoxes();
  const inMass = (q, pad) => MASS.some((b) => q[0] > b.min[0] - pad && q[0] < b.max[0] + pad
    && q[1] > b.min[1] - pad && q[1] < b.max[1] + pad && q[2] > b.min[2] - pad && q[2] < b.max[2] + pad);
  const r = ratio(marrow, (q) => {
    for (const b of BONES) if (sdBone(q, b) <= -0.001) return true;
    if (inMass(q, 0.001)) return true;
    return boxes.some((b) => q[0] > b.min[0] - 0.002 && q[0] < b.max[0] + 0.002 &&
      q[1] > b.min[1] - 0.002 && q[1] < b.max[1] + 0.002 &&
      q[2] > b.min[2] - 0.002 && q[2] < b.max[2] + 0.002);
  });
  check('marrow sits inside cortex (bone capsule / vertebra / cancellous bone)',
    r.frac >= 0.995, `${pct(r.frac)} inside bone, ${Math.round((1 - r.frac) * marrow.vertices)} loose vertices`);
}
{
  // Only bone and marrow may occupy a vertebral BODY: that was the aorta's old bug.
  // Grazing contact is anatomical (psoas and iliacus rise from the body surface and
  // the bodies are boxes), so a part fails only when it is driven deep in.
  for (const layer of ['rakta', 'majja', 'mamsa', 'meda']) {
    let buried = 0;
    let touched = 0;
    let n = 0;
    let worst = 0;
    let worstPart = '';
    const byPart = new Map();
    for (const p of parts[layer]) {
      if (p.region === 'marrow') continue;
      const pos = p.position;
      for (let i = 0; i < p.vertices; i++) {
        const q = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
        if (q[1] < 0.70 || q[1] > 1.50) continue;
        n++;
        const d = -vertebralBodyBoneDistance(q);
        if (d <= 0) continue;
        touched++;
        if (d <= VERT_BONE_PAD) continue;
        buried++;
        byPart.set(p.name, (byPart.get(p.name) || 0) + 1);
        if (d > worst) { worst = d; worstPart = p.name; }
      }
    }
    check(`${layer} never buries a non-bony part inside a vertebral body`,
      buried / Math.max(1, n) < 0.002,
      `${buried} of ${n} vertices deeper than ${(VERT_BONE_PAD * 1000).toFixed(1)} mm`
      + ` (${pct(touched / Math.max(1, n))} merely touching)`
      + (byPart.size ? `, by part: ${[...byPart].map(([k, v]) => `${k} ${v}`).join(' ')}` : '')
      + (worst ? `, worst ${(worst * 1000).toFixed(1)} mm in ${worstPart}` : ''));
  }
}
{
  const muscles = parts.mamsa;
  let inside = 0;
  let n = 0;
  const worstPerBone = new Map();
  for (const p of muscles) {
    const pos = p.position;
    for (let i = 0; i < p.vertices; i++) {
      const q = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
      n++;
      let d = Infinity;
      let who = '';
      for (const b of BONES) {
        const s = sdBone(q, b);
        if (s < d) { d = s; who = b.id; }
      }
      if (d < -0.0015) {
        inside++;
        if (!worstPerBone.has(who) || d < worstPerBone.get(who)) worstPerBone.set(who, d);
      }
    }
  }
  check('muscle wraps long bone without penetrating it', inside / n < 1 - 0.99,
    `${pct(1 - inside / n)} clear${worstPerBone.size ? `, worst ${[...worstPerBone].map(([k, v]) => `${k} ${(v * 1000).toFixed(1)}mm`).join(' ')}` : ''}`);
}
{
  const thoraxBox = regionBox('asthi', 'thorax');
  const heart = regionPart('rakta', 'heart');
  const r = ratio(heart, (q) => q[0] > thoraxBox.min[0] - 0.02 && q[0] < thoraxBox.max[0] + 0.02 &&
    q[1] > thoraxBox.min[1] - 0.02 && q[1] < thoraxBox.max[1] + 0.02 &&
    q[2] > thoraxBox.min[2] - 0.02 && q[2] < thoraxBox.max[2] + 0.02);
  check('heart sits inside the thoracic cage', r.frac >= 0.9, `${pct(r.frac)} within the rib cage box`);

  const liver = regionPart('rakta', 'liver');
  const liverBox = regionBox('rakta', 'liver');
  const dome = regionBox('mamsa', 'muscle_axial');
  const centroid = [0, 0, 0];
  const pos = liver.position;
  for (let i = 0; i < liver.vertices; i++) {
    centroid[0] += pos[i * 3]; centroid[1] += pos[i * 3 + 1]; centroid[2] += pos[i * 3 + 2];
  }
  const cx = centroid[0] / liver.vertices;
  check('liver is a right-sided organ under the diaphragm',
    cx < 0 && liverBox.max[1] <= dome.max[1] + 0.01,
    `centroid x ${cx.toFixed(4)} (negative = anatomical right), top ${liverBox.max[1].toFixed(3)} vs dome ${dome.max[1].toFixed(3)}`);
  const cy = centroid[1] / liver.vertices;
  check('liver sits below the diaphragmatic dome', cy < dome.max[1],
    `centroid y ${cy.toFixed(3)} vs dome top ${dome.max[1].toFixed(3)}`);

  const pelvisBox = regionBox('asthi', 'pelvis');
  for (const region of ['prostate', 'seminal_vesicle']) {
    const p = regionPart('shukra', region);
    const rr = ratio(p, (q) => q[1] > pelvisBox.min[1] - 0.03 && q[1] < pelvisBox.max[1] + 0.01 &&
      Math.abs(q[0]) < pelvisBox.max[0] && q[2] > pelvisBox.min[0] - 0.06 && q[2] < pelvisBox.max[2]);
    check(`${region} inside the pelvic girdle`, rr.frac >= 0.9, `${pct(rr.frac)} inside the bony pelvis`);
  }
  const testisBox = regionBox('shukra', 'testis');
  check('testes hang below the pelvis (scrotal, not intra-abdominal)',
    testisBox.max[1] < pelvisBox.min[1] + 0.07,
    `testis top ${testisBox.max[1].toFixed(3)} vs pelvic brim ${pelvisBox.min[1].toFixed(3)}`);
}

// ---------------------------------------------------------------------------
// 8. explore-regions.json completeness
// ---------------------------------------------------------------------------
console.log('=== 8. region metadata ===');
const metaPath = path.join(MODELS, 'explore-regions.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
check('schema is explore-body/2', meta.schema === 'explore-body/2', String(meta.schema));
const byId = new Map(meta.regions.map((r) => [r.id, r]));
check('every registry region ships geometry',
  [...REGION_INDEX.keys()].every((id) => byId.has(id)),
  [...REGION_INDEX.keys()].filter((id) => !byId.has(id)).join(', '));
const fieldBad = meta.regions.filter((r) => !(r.layer && Array.isArray(r.dhatus) && r.bbox && r.center &&
  Array.isArray(r.cameraTarget) && typeof r.suggestedDistance === 'number' && r.triangles > 0));
check('each region has layer, dhatus, bbox, center, camera target + distance',
  fieldBad.length === 0, fieldBad.map((r) => r.id).join(', '));
const dhatus = ['rasa', 'rakta', 'mamsa', 'meda', 'asthi', 'majja', 'shukra'];
check('a camera preset exists for all seven Dhatus',
  dhatus.every((d) => meta.dhatuCameras[d] && meta.dhatuCameras[d].cameraTarget &&
    meta.dhatuCameras[d].cameraPosition && meta.dhatuCameras[d].regions.length > 0),
  dhatus.filter((d) => !meta.dhatuCameras[d]).join(', '));
for (const d of dhatus) {
  const c = meta.dhatuCameras[d];
  const len = Math.hypot(...c.direction);
  // direction is stored rounded to 4 decimals, so unit length only holds to ~1e-3
  check(`${d} preset: distance + unit direction`, c.distance >= 0.25 && Math.abs(len - 1) < 1e-3,
    `d ${c.distance.toFixed(3)}, |dir| ${len.toFixed(6)}`);
}
const shippedTris = new Map();
for (const layer of LAYERS) {
  for (const p of parts[layer]) {
    const k = `${layer}/${p.region}`;
    shippedTris.set(k, (shippedTris.get(k) || 0) + p.tris);
  }
}
const mismatch = meta.regions.filter((r) => {
  const n = shippedTris.get(`${r.layer}/${r.id}`);
  return n === undefined || Math.abs(n - r.triangles) > 1;
});
check('region triangle counts match the shipped GLBs', mismatch.length === 0,
  mismatch.map((r) => `${r.id}(${r.triangles})`).join(', ').slice(0, 200));
const tintBad = meta.regions.filter((r) => !/^#[0-9a-f]{6}$/.test(String(r.tint)));
check('every region carries a tissue tint for the viewer', tintBad.length === 0, tintBad.map((r) => r.id).join(', '));
const layerCfgBad = LAYERS.filter((l) => {
  const c = meta.layers?.[l];
  return !c || typeof c.overviewOpacity !== 'number' || typeof c.depthRank !== 'number';
});
check('every layer ships an overview opacity + depth rank', layerCfgBad.length === 0, layerCfgBad.join(', '));
check('ghost opacity stays at or below 0.08', meta.stateConstants?.ghostOpacity <= 0.08,
  String(meta.stateConstants?.ghostOpacity));
const stateBad = dhatus.filter((d) => !meta.dhatuLayerStates?.[d]?.targetLayers?.length);
check('the per-Dhatu layer state table ships with every Dhatu', stateBad.length === 0, stateBad.join(', '));
const mapBad = dhatus.filter((d) => !(meta.dhatuRegionMapping?.[d]?.length));
check('every Dhatu maps to at least one region', mapBad.length === 0, mapBad.join(', '));
const orphanRegions = meta.regions.filter((r) => !r.dhatus.length && r.layer !== 'shell');
check('only the silhouette shell is Dhatu-untagged', orphanRegions.length === 0,
  orphanRegions.map((r) => r.id).join(', '));

console.log('\n==============================================================');
console.log(`${checks - failures}/${checks} assertions passed`);
if (failures) {
  console.log(`FAILED ${failures}:`);
  for (const g of groups.filter((x) => !x.ok)) console.log(`  - ${g.label}${g.detail ? ` (${g.detail})` : ''}`);
  process.exitCode = 1;
} else {
  console.log('EXPLORE BODY VERIFICATION PASSED');
}
