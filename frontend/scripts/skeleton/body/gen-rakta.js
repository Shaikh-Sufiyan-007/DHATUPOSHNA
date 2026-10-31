// Rakta Dhatu — the cardiovascular block: a four-chamber heart with its great
// vessel roots, the arterial tree, the venous tree, liver (Yakrit) and spleen
// (Pleeha). Every form is composed from real anatomy: chambers are tapered
// elliptic lofts along their long axes, vessels are lofted along catalogued
// routes, the solid organs are smooth unions of named lobes minus their
// impressions. Nothing here is a single primitive.

import * as THREE from 'three';
import { meshSDF, smin, ssub, sdEllipsoid, sdCapsule, mirrorGeometryX } from '../sdf-mesh.js';
import {
  TubeField, fbm, visceraEnvelope, insideShellWithMargin, nearestField, SKIN_BOTTOM_Y,
  vertebralAnteriorZ,
} from './frame.js';
import {
  vesselTube, loftTube, part, mergeGeoms, place, displace, clampInsideShell, clampFloor,
} from './mesh-utils.js';

const AX_X = [1, 0, 0];
const AX_Z = [0, 0, 1];

/**
 * Axis height of a pre-vertebral vessel at y: the vessel rests on the front of
 * the column without burying itself in a body. Every aortic / caval waypoint is
 * written through this so the relation is by construction, not by hand.
 */
function preV(y, r) {
  return vertebralAnteriorZ(y) + r * 1.15;
}

function lenOf(path) {
  return new THREE.CatmullRomCurve3(path.map((q) => new THREE.Vector3(...q))).getLength();
}

function off(p, c) { return [p[0] - c[0], p[1] - c[1], p[2] - c[2]]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

/** Mesh a locally-defined solid, then rigidly place it into the body frame. */
function solid(sdf, minB, maxB, res, transform, q) {
  const k = q === 'high' ? 1 : 0.62;
  const r = res.map((v) => Math.max(12, Math.round(v * k)));
  const geom = meshSDF(sdf, minB, maxB, r);
  geom.computeVertexNormals();
  if (transform.rotate || transform.translate) place(geom, transform);
  return geom;
}

/** A named vessel loft. */
function vessel(name, path, radii, q, opts = {}) {
  const tube = vesselTube(path, radii, opts);
  const len = lenOf(path);
  const g = loftTube(tube, {
    radial: opts.radial || (q === 'high' ? 9 : 6),
    rings: Math.max(7, Math.min(q === 'high' ? 46 : 22, Math.round(len * (q === 'high' ? 130 : 70)))),
    capRings: 2,
    noise: opts.smooth ? null : { amp: 0.00035, freq: 42, octaves: 2 },
    seed: name.length * 4.31 + 7,
  });
  return g;
}

/** A cardiac chamber: elliptic loft with independently blunted ends. */
function chamber(path, sections, q, opts = {}) {
  const len = lenOf(path);
  const tube = new TubeField(path, sections, {
    samples: Math.max(9, Math.min(26, Math.round(len * (q === 'high' ? 110 : 60)))),
    refW: opts.refW || AX_X,
    refD: opts.refD || AX_Z,
    capScale: opts.capScale || [1, 1],
    inflate: opts.inflate || 0,
  });
  return loftTube(tube, {
    radial: opts.radial || (q === 'high' ? 14 : 8),
    rings: Math.max(9, Math.min(34, Math.round(len * (q === 'high' ? 150 : 80)))),
    capRings: 3,
    noise: { amp: 0.0007, freq: 34, octaves: 2 },
    seed: path.length * 6.13,
  });
}

/** Pair a symmetric form into left + right parts. */
function bilateral(name, region, geom, out) {
  out.push(part(`${name}_L`, 'rakta', region, geom));
  out.push(part(`${name}_R`, 'rakta', region, mirrorGeometryX(geom)));
}

// ---------------------------------------------------------------------------
// Heart — base posterosuperior, apex anteroinferior and to the anatomical left
// ---------------------------------------------------------------------------
function buildHeart(q) {
  const parts = [];

  // Left ventricle: thick conical belly from the aortic vestibule to the apex.
  const lv = chamber(
    [[0.004, 1.318, 0.026], [0.020, 1.292, 0.040], [0.036, 1.262, 0.050], [0.048, 1.236, 0.056]],
    [[0, [0.0185, 0.0155, 0]], [0.22, [0.0255, 0.0235, 0]], [0.55, [0.0270, 0.0245, 0]],
     [0.82, [0.0215, 0.0195, 0]], [1, [0.0115, 0.0105, 0]]],
    q, { capScale: [0.95, 0.45] },
  );
  parts.push(part('left_ventricle', 'rakta', 'heart', lv));

  // Right ventricle: crescent loft on the anterior-left border, short of the apex.
  const rv = chamber(
    [[0.010, 1.326, 0.048], [0.024, 1.302, 0.062], [0.038, 1.272, 0.064], [0.046, 1.246, 0.058]],
    [[0, [0.0145, 0.0110, 0]], [0.25, [0.0210, 0.0140, 0]], [0.6, [0.0230, 0.0150, 0]],
     [0.85, [0.0170, 0.0115, 0]], [1, [0.0090, 0.0070, 0]]],
    q, { capScale: [0.9, 0.4] },
  );
  parts.push(part('right_ventricle', 'rakta', 'heart', rv));

  // Right atrium: thin-walled ear-backed chamber on the right border.
  const ra = chamber(
    [[-0.010, 1.338, 0.012], [-0.024, 1.322, 0.024], [-0.030, 1.298, 0.030]],
    [[0, [0.0130, 0.0120, 0]], [0.4, [0.0185, 0.0160, 0]], [1, [0.0155, 0.0135, 0]]],
    q, { capScale: [0.8, 0.75] },
  );
  parts.push(part('right_atrium', 'rakta', 'heart', ra));

  // Left atrium: posterior, square-ish, receives the pulmonary veins.
  const la = chamber(
    [[0.002, 1.340, -0.004], [0.020, 1.334, -0.008], [0.034, 1.322, -0.004]],
    [[0, [0.0135, 0.0125, 0]], [0.5, [0.0175, 0.0150, 0]], [1, [0.0145, 0.0130, 0]]],
    q, { capScale: [0.85, 0.8] },
  );
  parts.push(part('left_atrium', 'rakta', 'heart', la));

  // Auricles: two small lobules over the great-vessel roots.
  parts.push(part('right_auricle', 'rakta', 'heart', chamber(
    [[-0.004, 1.340, 0.028], [0.006, 1.352, 0.038]],
    [[0, [0.0075, 0.0060, 0]], [0.5, [0.0115, 0.0085, 0]], [1, [0.0080, 0.0065, 0]]], q,
  )));
  parts.push(part('left_auricle', 'rakta', 'heart', chamber(
    [[0.016, 1.340, 0.040], [0.028, 1.350, 0.046]],
    [[0, [0.0070, 0.0058, 0]], [0.5, [0.0105, 0.0080, 0]], [1, [0.0075, 0.0060, 0]]], q,
  )));

  // Outflow tract: pulmonary trunk with its two branches, wrapped around the
  // aortic root. Kept with the heart so the myocardium tone stays continuous.
  parts.push(part('pulmonary_trunk', 'rakta', 'heart', chamber(
    [[0.012, 1.328, 0.052], [0.008, 1.352, 0.048], [0.002, 1.368, 0.038], [-0.004, 1.374, 0.026]],
    [[0, [0.0125, 0.0120, 0]], [0.45, [0.0135, 0.0128, 0]], [1, [0.0105, 0.0100, 0]]], q,
  )));
  parts.push(part('left_pulmonary_artery', 'rakta', 'heart', chamber(
    [[-0.002, 1.372, 0.030], [0.022, 1.368, 0.014], [0.046, 1.362, 0.006]],
    [[0, [0.0080, 0.0075, 0]], [0.6, [0.0070, 0.0066, 0]], [1, [0.0055, 0.0052, 0]]], q,
  )));
  parts.push(part('right_pulmonary_artery', 'rakta', 'heart', chamber(
    [[-0.004, 1.370, 0.028], [-0.030, 1.366, 0.012], [-0.054, 1.360, 0.004]],
    [[0, [0.0080, 0.0075, 0]], [0.6, [0.0072, 0.0068, 0]], [1, [0.0055, 0.0052, 0]]], q,
  )));
  parts.push(part('pulmonary_veins', 'rakta', 'heart', mergeGeoms([
    chamber([[0.052, 1.318, -0.008], [0.034, 1.324, -0.006], [0.020, 1.328, -0.006]],
      [[0, [0.0052, 0.0050, 0]], [1, [0.0060, 0.0056, 0]]], q),
    chamber([[-0.044, 1.316, -0.004], [-0.028, 1.322, -0.004], [-0.012, 1.326, -0.006]],
      [[0, [0.0052, 0.0050, 0]], [1, [0.0060, 0.0056, 0]]], q),
    chamber([[0.048, 1.300, 0.004], [0.032, 1.308, 0.000], [0.018, 1.314, -0.002]],
      [[0, [0.0048, 0.0046, 0]], [1, [0.0056, 0.0052, 0]]], q),
    chamber([[-0.040, 1.298, 0.006], [-0.026, 1.306, 0.002], [-0.012, 1.312, 0.000]],
      [[0, [0.0048, 0.0046, 0]], [1, [0.0056, 0.0052, 0]]], q),
  ])));

  const merged = mergeGeoms(parts.map((p) => p.geometry));

  // Coronary sulcus (atrio-ventricular groove) + myocardial texture.
  displace(merged, (x, y, z, nx, ny, nz) => {
    const drop = 1.338 - y;
    const groove = Math.exp(-Math.pow((drop - 0.036) / 0.013, 2)) * 0.0038;
    const anterior = Math.max(0, z - 0.020) * 2.2;
    const fib = fbm(x * 78, y * 78, z * 78, 3) * 0.0011 * (1 + anterior * 0.4);
    void nx; void ny; void nz;
    return -groove + fib;
  });
  clampInsideShell(merged, 0.030);
  merged.computeVertexNormals();

  return [part('heart', 'rakta', 'heart', merged, {
    parts: parts.map((p) => p.name),
  })];
}

// ---------------------------------------------------------------------------
// Arterial tree (Dhamani) — red
// ---------------------------------------------------------------------------

// Route table: LEFT-side entries are mirrored; the arch and its branches are
// written once, asymmetric, exactly as they arise.
const LIMB_ARTERIES = [
  ['subclavian', [[0.018, 1.378, -0.008], [0.050, 1.386, -0.014], [0.088, 1.378, -0.012], [0.122, 1.360, -0.004]], 0.0066, 0.0060],
  ['axillary', [[0.122, 1.360, -0.004], [0.152, 1.334, 0.006], [0.178, 1.300, 0.014], [0.198, 1.266, 0.022]], 0.0060, 0.0054],
  ['brachial', [[0.198, 1.266, 0.022], [0.212, 1.198, 0.024], [0.226, 1.128, 0.022], [0.234, 1.080, 0.018]], 0.0054, 0.0044],
  ['profunda_brachii', [[0.228, 1.148, 0.012], [0.242, 1.096, 0.004], [0.250, 1.046, 0.000]], 0.0030, 0.0022],
  ['radial', [[0.234, 1.080, 0.018], [0.242, 1.008, 0.024], [0.248, 0.928, 0.026], [0.254, 0.858, 0.026], [0.260, 0.818, 0.024]], 0.0040, 0.0028],
  ['ulnar', [[0.236, 1.076, 0.006], [0.244, 0.998, 0.008], [0.250, 0.918, 0.010], [0.254, 0.848, 0.012]], 0.0040, 0.0026],
  ['common_interosseous', [[0.240, 1.058, 0.008], [0.246, 0.986, 0.010], [0.250, 0.926, 0.010]], 0.0026, 0.0018],
  ['palmar_arch', [[0.254, 0.828, 0.022], [0.260, 0.806, 0.026], [0.266, 0.788, 0.022]], 0.0028, 0.0022],
  ['common_carotid', [[0.012, 1.378, 0.006], [0.016, 1.406, 0.002], [0.019, 1.434, 0.000]], 0.0050, 0.0044],
  ['internal_carotid', [[0.019, 1.434, 0.000], [0.021, 1.464, -0.002], [0.022, 1.490, -0.004]], 0.0038, 0.0032],
  ['external_carotid', [[0.019, 1.434, 0.004], [0.022, 1.460, 0.010], [0.024, 1.482, 0.016]], 0.0034, 0.0026],
  ['vertebral', [[0.030, 1.388, -0.012], [0.032, 1.418, -0.018], [0.030, 1.454, -0.022], [0.026, 1.490, -0.018], [0.020, 1.512, -0.010]], 0.0032, 0.0028],
  ['renal', [[0.007, 1.056, preV(1.056, 0.0042) + 0.004], [0.030, 1.054, 0.046], [0.048, 1.052, 0.022]], 0.0042, 0.0034],
  ['gonadal', [[0.007, 1.064, preV(1.064, 0.0022) + 0.004], [0.026, 1.012, 0.062], [0.044, 0.934, 0.060], [0.052, 0.876, 0.052]], 0.0022, 0.0016],
  ['common_iliac', [[0.005, 0.880, preV(0.880, 0.0074)], [0.028, 0.856, 0.042], [0.052, 0.828, 0.034]], 0.0054, 0.0046],
  ['internal_iliac', [[0.052, 0.828, 0.034], [0.066, 0.812, 0.014], [0.072, 0.794, -0.012]], 0.0036, 0.0026],
  ['external_iliac', [[0.052, 0.828, 0.034], [0.072, 0.834, 0.040], [0.088, 0.864, 0.040]], 0.0046, 0.0042],
  ['femoral', [[0.088, 0.864, 0.040], [0.094, 0.790, 0.032], [0.098, 0.700, 0.016], [0.098, 0.610, 0.000], [0.096, 0.552, -0.012]], 0.0050, 0.0040],
  ['profunda_femoris', [[0.090, 0.842, 0.032], [0.108, 0.790, 0.008], [0.122, 0.720, -0.010], [0.128, 0.650, -0.024]], 0.0034, 0.0024],
  ['popliteal', [[0.096, 0.540, -0.018], [0.094, 0.504, -0.026], [0.092, 0.462, -0.028]], 0.0042, 0.0036],
  ['anterior_tibial', [[0.092, 0.470, -0.018], [0.098, 0.404, 0.000], [0.102, 0.310, 0.006], [0.100, 0.220, 0.008], [0.096, 0.140, 0.012]], 0.0032, 0.0024],
  ['posterior_tibial', [[0.092, 0.462, -0.028], [0.096, 0.392, -0.030], [0.092, 0.300, -0.032], [0.086, 0.200, -0.028], [0.080, 0.110, -0.020]], 0.0034, 0.0024],
  ['peroneal', [[0.096, 0.452, -0.030], [0.106, 0.372, -0.030], [0.110, 0.280, -0.026], [0.104, 0.190, -0.020]], 0.0026, 0.0018],
  ['dorsalis_pedis', [[0.096, 0.130, 0.014], [0.092, 0.086, 0.028], [0.088, 0.056, 0.052]], 0.0024, 0.0018],
  ['plantar', [[0.080, 0.106, -0.014], [0.076, 0.070, 0.006], [0.074, 0.050, 0.034]], 0.0022, 0.0016],
];

const MID_ARTERIES = [
  ['ascending_aorta', [[-0.002, 1.320, 0.030], [0.000, 1.346, 0.034], [0.004, 1.368, 0.030]], 0.0140, 0.0130],
  ['aortic_arch', [[0.004, 1.368, 0.030], [0.013, 1.385, 0.017], [0.024, 1.383, 0.001], [0.032, 1.370, preV(1.370, 0.0116)]], 0.0126, 0.0116],
  ['descending_aorta', [
    [0.032, 1.370, preV(1.370, 0.0112)],
    [0.030, 1.340, preV(1.340, 0.0110)],
    [0.026, 1.300, preV(1.300, 0.0107)],
    [0.022, 1.250, preV(1.250, 0.0104)],
    [0.018, 1.200, preV(1.200, 0.0100)],
    [0.014, 1.150, preV(1.150, 0.0097)],
    [0.010, 1.100, preV(1.100, 0.0094)],
    [0.007, 1.060, preV(1.060, 0.0092)],
  ], 0.0112, 0.0092],
  ['abdominal_aorta', [
    [0.007, 1.060, preV(1.060, 0.0090)],
    [0.006, 1.010, preV(1.010, 0.0086)],
    [0.006, 0.960, preV(0.960, 0.0082)],
    [0.005, 0.920, preV(0.920, 0.0078)],
    [0.005, 0.880, preV(0.880, 0.0074)],
  ], 0.0090, 0.0074],
  ['brachiocephalic_trunk', [[0.006, 1.379, 0.020], [0.002, 1.394, 0.014], [-0.016, 1.404, 0.008], [-0.038, 1.400, 0.002]], 0.0064, 0.0052],
  ['left_subclavian', [[0.022, 1.378, preV(1.378, 0.0062)], [0.040, 1.388, -0.010], [0.060, 1.390, -0.012]], 0.0062, 0.0056],
  ['coeliac_trunk', [[0.006, 1.080, preV(1.080, 0.0042) + 0.005], [0.000, 1.090, 0.056], [-0.008, 1.098, 0.062]], 0.0042, 0.0034],
  ['hepatic_artery_proper', [[-0.008, 1.098, 0.062], [-0.024, 1.112, 0.056], [-0.040, 1.130, 0.040]], 0.0034, 0.0026],
  ['superior_mesenteric', [[0.006, 1.044, preV(1.044, 0.0038) + 0.005], [0.008, 1.000, 0.062], [0.012, 0.950, 0.070], [0.014, 0.906, 0.072]], 0.0038, 0.0028],
  ['inferior_mesenteric', [[0.006, 0.966, preV(0.966, 0.0030) + 0.005], [0.003, 0.926, 0.068], [0.000, 0.888, 0.058], [-0.002, 0.856, 0.046]], 0.0030, 0.0022],
  ['splenic_artery', [[-0.006, 1.096, 0.058], [0.030, 1.120, 0.040], [0.056, 1.160, 0.010], [0.072, 1.196, -0.002]], 0.0036, 0.0028],
];

function buildArteries(q) {
  const out = [];
  for (const [name, path, r0, r1] of LIMB_ARTERIES) {
    bilateral(name, 'artery', vessel(name, path, [r0, r1], q, { refW: AX_X, refD: AX_Z }), out);
  }
  for (const [name, path, r0, r1] of MID_ARTERIES) {
    out.push(part(name, 'rakta', 'artery', vessel(name, path, [r0, r1], q, { smooth: name.includes('aorta'), radial: name.includes('aorta') ? 12 : 9 })));
  }

  // Coronary arteries arise from the aortic root and run in the grooves.
  out.push(part('left_coronary_artery', 'rakta', 'artery', mergeGeoms([
    vessel('circumflex', [[0.004, 1.332, 0.036], [-0.006, 1.326, 0.052], [-0.022, 1.310, 0.052], [-0.034, 1.290, 0.044]], [0.0026, 0.0020], q),
    vessel('interventricular', [[0.012, 1.330, 0.046], [0.024, 1.300, 0.062], [0.036, 1.262, 0.066], [0.046, 1.236, 0.060]], [0.0026, 0.0018], q),
  ])));
  out.push(part('right_coronary_artery', 'rakta', 'artery', vessel(
    'right_coronary', [[-0.002, 1.332, 0.034], [-0.020, 1.326, 0.040], [-0.034, 1.306, 0.042], [-0.030, 1.282, 0.038], [-0.016, 1.262, 0.040]], [0.0026, 0.0018], q,
  )));

  // Intercostals: paired segmental runs from the aorta, around the lateral
  // border of the column (never through it), then under the costal groove.
  const ics = [];
  for (let i = 0; i < 9; i++) {
    const y = 1.330 - i * 0.031;
    const ax = 0.032 - Math.min(0.025, (1.370 - y) * 0.083);
    const az = preV(y, 0.010);
    ics.push(vessel(`posterior_intercostal_${i}`, [[ax, y, az], [0.050, y - 0.004, az - 0.024], [0.094, y - 0.014, -0.004], [0.122, y - 0.028, 0.034]], [0.0022, 0.0016], q));
  }
  bilateral('intercostal_set', 'artery', mergeGeoms(ics), out);

  // Paired lumbar segmentals: four levels, winding around the bodies.
  const lumb = [];
  for (let i = 0; i < 4; i++) {
    const y = 1.020 - i * 0.040;
    const az = preV(y, 0.0022);
    lumb.push(vessel(`lumbar_artery_${i}`, [[0.006, y, az], [0.028, y - 0.002, az - 0.010], [0.046, y - 0.006, az - 0.034], [0.052, y - 0.012, az - 0.052]], [0.0022, 0.0016], q));
  }
  bilateral('lumbar_set', 'artery', mergeGeoms(lumb), out);
  return out;
}

// ---------------------------------------------------------------------------
// Venous tree (Sira) — blue
// ---------------------------------------------------------------------------
const LIMB_VEINS = [
  ['subclavian_vein', [[0.056, 1.384, 0.008], [0.036, 1.384, 0.012], [0.018, 1.380, 0.018]], 0.0064, 0.0058],
  ['external_jugular', [[0.040, 1.492, 0.012], [0.048, 1.456, 0.004], [0.050, 1.424, -0.002], [0.046, 1.400, 0.002]], 0.0034, 0.0028],
  ['internal_jugular', [[0.026, 1.496, 0.000], [0.028, 1.462, 0.004], [0.028, 1.428, 0.008], [0.024, 1.398, 0.010]], 0.0060, 0.0054],
  ['brachiocephalic_vein', [[0.024, 1.398, 0.010], [0.012, 1.386, 0.020], [0.002, 1.372, 0.026]], 0.0066, 0.0062],
  ['axillary_vein', [[0.122, 1.358, 0.004], [0.150, 1.332, 0.014], [0.176, 1.298, 0.022], [0.196, 1.264, 0.028]], 0.0062, 0.0056],
  ['brachial_vein', [[0.196, 1.264, 0.028], [0.212, 1.196, 0.030], [0.228, 1.126, 0.028], [0.238, 1.080, 0.024]], 0.0046, 0.0038],
  ['basilic_vein', [[0.244, 1.058, 0.018], [0.232, 1.136, 0.028], [0.220, 1.216, 0.026], [0.208, 1.280, 0.020]], 0.0032, 0.0026],
  ['cephalic_vein', [[0.256, 0.860, 0.030], [0.248, 0.960, 0.036], [0.232, 1.060, 0.038], [0.208, 1.180, 0.040], [0.180, 1.290, 0.030], [0.150, 1.356, 0.016]], 0.0030, 0.0026],
  ['common_iliac_vein', [[0.054, 0.830, 0.030], [0.034, 0.852, 0.036], [0.012, 0.876, 0.040]], 0.0060, 0.0054],
  ['internal_iliac_vein', [[0.054, 0.830, 0.030], [0.064, 0.808, 0.006], [0.060, 0.792, -0.018]], 0.0040, 0.0030],
  ['external_iliac_vein', [[0.054, 0.830, 0.030], [0.074, 0.836, 0.042], [0.090, 0.866, 0.038]], 0.0050, 0.0044],
  ['femoral_vein', [[0.090, 0.866, 0.038], [0.096, 0.792, 0.036], [0.102, 0.704, 0.024], [0.102, 0.616, 0.012]], 0.0054, 0.0044],
  ['great_saphenous', [[0.082, 0.900, 0.044], [0.076, 0.800, 0.040], [0.068, 0.680, 0.030], [0.066, 0.540, 0.020], [0.064, 0.400, 0.014], [0.062, 0.240, 0.010], [0.060, 0.120, 0.006]], 0.0030, 0.0022],
  ['small_saphenous', [[0.096, 0.130, -0.032], [0.094, 0.220, -0.040], [0.096, 0.330, -0.042], [0.098, 0.440, -0.036], [0.096, 0.500, -0.030]], 0.0028, 0.0022],
  ['popliteal_vein', [[0.102, 0.600, 0.006], [0.098, 0.548, -0.014], [0.094, 0.506, -0.024], [0.090, 0.462, -0.026]], 0.0044, 0.0038],
  ['tibial_veins', [[0.090, 0.462, -0.026], [0.092, 0.360, -0.032], [0.088, 0.250, -0.030], [0.082, 0.140, -0.024]], 0.0034, 0.0024],
];

const MID_VEINS = [
  ['superior_vena_cava', [[-0.006, 1.366, 0.026], [-0.010, 1.346, 0.024], [-0.014, 1.326, 0.022], [-0.018, 1.312, 0.018]], 0.0096, 0.0088],
  ['inferior_vena_cava', [
    [-0.012, 0.888, preV(0.888, 0.0104)],
    [-0.012, 0.940, preV(0.940, 0.0106)],
    [-0.010, 1.000, preV(1.000, 0.0108)],
    [-0.008, 1.060, preV(1.060, 0.0110)],
    [-0.006, 1.120, preV(1.120, 0.0110) + 0.010],
    [-0.008, 1.190, preV(1.190, 0.0108) + 0.020],
    [-0.014, 1.260, 0.024],
    [-0.018, 1.306, 0.018],
  ], 0.0110, 0.0094],
  ['portal_vein', [[-0.008, 1.024, 0.062], [-0.020, 1.064, 0.056], [-0.030, 1.104, 0.048], [-0.038, 1.136, 0.040]], 0.0058, 0.0048],
  ['iliac_confluence', [[0.012, 0.876, 0.040], [0.000, 0.884, 0.046], [-0.012, 0.888, preV(0.888, 0.0104)]], 0.0070, 0.0064],
];

function buildVeins(q) {
  const out = [];
  for (const [name, path, r0, r1] of LIMB_VEINS) {
    bilateral(name, 'vein', vessel(name, path, [r0, r1], q, { refW: AX_X, refD: AX_Z }), out);
  }
  for (const [name, path, r0, r1] of MID_VEINS) {
    out.push(part(name, 'rakta', 'vein', vessel(name, path, [r0, r1], q, { radial: 11, smooth: true })));
  }

  // Hepatic veins drain up into the IVC just under the diaphragm.
  out.push(part('hepatic_veins', 'rakta', 'vein', mergeGeoms([
    vessel('hepatic_right', [[-0.058, 1.140, -0.006], [-0.038, 1.172, 0.010], [-0.012, 1.198, 0.026]], [0.0044, 0.0034], q),
    vessel('hepatic_middle', [[-0.024, 1.136, 0.008], [-0.018, 1.170, 0.016], [-0.010, 1.198, 0.027]], [0.0044, 0.0034], q),
    vessel('hepatic_left', [[0.014, 1.140, 0.024], [0.004, 1.172, 0.024], [-0.008, 1.200, 0.028]], [0.0040, 0.0032], q),
  ])));

  // Renal veins: deliberately asymmetric — the left crosses in front of the
  // aorta to reach the right-sided caval axis, the right is short and direct.
  out.push(part('renal_veins', 'rakta', 'vein', mergeGeoms([
    vessel('renal_vein_L', [[0.050, 1.050, 0.020], [0.026, 1.052, 0.050], [0.006, 1.054, 0.060], [-0.008, 1.056, 0.045]], [0.0056, 0.0048], q),
    vessel('renal_vein_R', [[-0.048, 1.026, 0.014], [-0.032, 1.030, 0.030], [-0.014, 1.036, 0.042]], [0.0050, 0.0044], q),
  ])));

  // Gonadal veins: the right drains into the cava, the left into the renal vein.
  out.push(part('gonadal_veins', 'rakta', 'vein', mergeGeoms([
    vessel('gonadal_vein_L', [[0.050, 0.880, 0.044], [0.044, 0.944, 0.050], [0.032, 1.010, 0.048], [0.020, 1.048, 0.056]], [0.0026, 0.0020], q),
    vessel('gonadal_vein_R', [[-0.048, 0.856, 0.036], [-0.042, 0.930, 0.042], [-0.030, 1.000, 0.048], [-0.014, 1.020, 0.046]], [0.0024, 0.0020], q),
  ])));

  // Vertebral venous plexuses: segmental nets hugging the laminae, kept lateral
  // of the spinous line so they never invade the canal that holds the cord.
  const pv = [];
  for (let i = 0; i < 11; i++) {
    const y = 1.400 - i * 0.034;
    const z = vertebralAnteriorZ(y) - 0.030;
    pv.push(vessel(`vertebral_venous_${i}`, [[0.024, y, vertebralAnteriorZ(y) - 0.006], [0.032, y - 0.006, z], [0.028, y - 0.012, z - 0.014]], [0.0022, 0.0016], q));
  }
  bilateral('vertebral_plexus', 'vein', mergeGeoms(pv), out);
  return out;
}

// ---------------------------------------------------------------------------
// Liver (Yakrit) — right + left lobes, caudate and quadrate lobes, minus the
// gastric / renal impressions, the gallbladder fossa and the IVC groove.
// ---------------------------------------------------------------------------
function buildLiver(q) {
  const lobes = (p) => {
    let d = smin(
      sdEllipsoid(off(p, [-0.030, 0.004, 0.0]), [0.056, 0.060, 0.048]),
      sdEllipsoid(off(p, [0.046, 0.010, 0.018]), [0.044, 0.032, 0.040]),
      0.022,
    );
    d = smin(d, sdEllipsoid(off(p, [0.004, 0.018, -0.034]), [0.021, 0.026, 0.022]), 0.018); // caudate
    d = smin(d, sdEllipsoid(off(p, [-0.014, -0.026, -0.026]), [0.022, 0.026, 0.024]), 0.018); // quadrate
    // ssub(cutter, keeper, k) — the repo-wide convention (see gen-spine, gen-thorax).
    d = ssub(sdEllipsoid(off(p, [0.014, -0.034, -0.046]), [0.028, 0.038, 0.024]), d, 0.012); // right-renal impression
    d = ssub(sdEllipsoid(off(p, [0.058, 0.026, 0.048]), [0.026, 0.018, 0.018]), d, 0.010); // gastric impression
    d = ssub(sdCapsule(p, [-0.014, -0.056, 0.036], [-0.034, -0.006, 0.052], 0.011), d, 0.012); // gallbladder fossa
    d = ssub(sdCapsule(p, [-0.006, 0.076, -0.048], [-0.004, -0.008, -0.050], 0.015), d, 0.012); // IVC groove
    const n = [0.10, 0.97, 0.22];
    const l = Math.hypot(...n);
    const nhat = n.map((v) => v / l);
    // inferior border: a tilted cut, sharp as the real costal-margin edge
    return Math.max(d, -0.058 - dot3(p, nhat));
  };

  const geom = solid(lobes, [-0.105, -0.085, -0.075], [0.105, 0.095, 0.085], [76, 62, 62],
    { rotate: [-0.08, 0.04, 0.12], translate: [-0.020, 1.150, 0.036] }, q);

  displace(geom, (x, y, z) => fbm(x * 52, y * 52, z * 52, 3) * 0.0009);
  clampInsideShell(geom, 0.045);
  conform(geom);
  geom.computeVertexNormals();
  return [part('liver', 'rakta', 'liver', geom, {
    parts: ['hepar_lobus_dexter', 'hepar_lobus_sinister', 'lobus_caudatus', 'lobus_quadratus', 'fossa_vesicae_felleae', 'sulcus_venae_cavae'],
  })];
}

// ---------------------------------------------------------------------------
// Spleen (Pleeha) — bean with a hilum notch and a splenic-vein groove
// ---------------------------------------------------------------------------
function buildSpleen(q) {
  const bean = (p) => {
    let d = smin(
      sdEllipsoid(off(p, [-0.008, 0.004, 0.0]), [0.019, 0.032, 0.024]),
      sdEllipsoid(off(p, [0.010, -0.006, 0.002]), [0.016, 0.026, 0.021]),
      0.014,
    );
    d = ssub(sdEllipsoid(off(p, [0.020, 0.004, 0.012]), [0.010, 0.016, 0.014]), d, 0.008); // hilum
    d = ssub(sdCapsule(p, [0.014, -0.020, 0.010], [0.016, 0.016, 0.014], 0.005), d, 0.006); // splenic-vein groove
    return d;
  };
  const geom = solid(bean, [-0.035, -0.045, -0.035], [0.035, 0.045, 0.035], [54, 62, 54],
    { rotate: [0.16, 0.30, 0.52], translate: [0.086, 1.206, -0.010] }, q);
  displace(geom, (x, y, z) => fbm(x * 64, y * 64, z * 64, 3) * 0.0008);
  clampInsideShell(geom, 0.045);
  conform(geom);
  geom.computeVertexNormals();
  return [part('spleen', 'rakta', 'spleen', geom, { parts: ['lien', 'hilum_lienis'] })];
}

/** Retreat any vertex that breaches the deep-viscera envelope back into it. */
function conform(geom) {
  const arr = geom.attributes.position.array;
  const nrm = geom.attributes.normal.array;
  for (let i = 0; i < geom.attributes.position.count; i++) {
    const k = i * 3;
    const p = [arr[k], arr[k + 1], arr[k + 2]];
    let guard = 0;
    while (visceraEnvelope(p) >= 0 && guard++ < 3) {
      const f = nearestField(p);
      if (!f) break;
      const out = [0, 0, 0];
      f.field.inward(p, out);
      p[0] += out[0] * 0.006; p[1] += out[1] * 0.006; p[2] += out[2] * 0.006;
    }
    if (!insideShellWithMargin(p, 0.020)) {
      const l = Math.hypot(nrm[k], nrm[k + 1], nrm[k + 2]) || 1;
      p[0] -= (nrm[k] / l) * 0.004; p[1] -= (nrm[k + 1] / l) * 0.004; p[2] -= (nrm[k + 2] / l) * 0.004;
    }
    arr[k] = p[0]; arr[k + 1] = p[1]; arr[k + 2] = p[2];
  }
  geom.attributes.position.needsUpdate = true;
  return geom;
}

export function buildRakta(quality = 'high') {
  const q = quality === 'lite' ? 'lite' : 'high';
  const parts = [
    ...buildHeart(q),
    ...buildArteries(q),
    ...buildVeins(q),
    ...buildLiver(q),
    ...buildSpleen(q),
  ];
  for (const p of parts) clampFloor(p.geometry, SKIN_BOTTOM_Y + 0.004);
  return parts;
}
