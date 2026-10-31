// Rasa Dhatu — the lymphatic conduit: cisterna chyli, thoracic duct with its
// intestinal and lumbar trunks, the right lymphatic duct, named node chains
// (cervical, supraclavicular, axillary, parasternal, tracheobronchial,
// para-aortic, mesenteric, iliac, inguinal, popliteal) and the thymus.
// The heart is shared with Rakta (the original Rasa copy names Hridaya next to
// the thoracic duct), so it is not duplicated here — it lives in the Rakta layer
// and the registry tags that region with both Dhatus.

import * as THREE from 'three';
import { meshSDF, smin, ssub, sdEllipsoid, mirrorGeometryX } from '../sdf-mesh.js';
import { fbm, SKIN_BOTTOM_Y } from './frame.js';
import {
  vesselTube, loftTube, part, mergeGeoms, place, displace, clampInsideShell, clampFloor, beanTube,
} from './mesh-utils.js';

const AX_X = [1, 0, 0];
const AX_Z = [0, 0, 1];

function lenOf(path) {
  return new THREE.CatmullRomCurve3(path.map((q) => new THREE.Vector3(...q))).getLength();
}
function off(p, c) { return [p[0] - c[0], p[1] - c[1], p[2] - c[2]]; }

/** A lymph vessel: thinner and softer-edged than a blood vessel. */
function duct(path, radii, q, opts = {}) {
  const tube = vesselTube(path, radii, { refW: AX_X, refD: AX_Z, roundness: 0.9 });
  const len = lenOf(path);
  return loftTube(tube, {
    radial: opts.radial || (q === 'high' ? 7 : 5),
    rings: Math.max(6, Math.min(q === 'high' ? 34 : 18, Math.round(len * (q === 'high' ? 110 : 60)))),
    capRings: 2,
    noise: { amp: 0.00028, freq: 38, octaves: 2 },
    seed: path.length * 5.7 + 2,
  });
}

/** One bean-shaped node with a hilum notch. */
function node(centre, size, rot, q, i) {
  return loftTube(beanTube(centre, size, rot, i), {
    radial: q === 'high' ? 7 : 5,
    rings: q === 'high' ? 9 : 6,
    capRings: 2,
    noise: { amp: 0.0004, freq: 130, octaves: 2 },
    seed: i * 3.77,
  });
}

/** Chain of nodes marching along a route, each turned to follow it. */
function chain(name, route, count, size, q, seedBase) {
  const curve = new THREE.CatmullRomCurve3(route.map((p) => new THREE.Vector3(...p)));
  const geoms = [];
  const names = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const p = curve.getPointAt(t);
    const tg = curve.getTangentAt(t);
    const s = 0.84 + ((i * 7919) % 11) / 26;
    const rot = [Math.atan2(tg.y, tg.z) * 0.4, Math.atan2(tg.x, tg.z) * 0.4, 0];
    geoms.push(node([p.x, p.y, p.z], [size[0] * s, size[1] * s, size[2] * s], rot, q, seedBase + i));
    names.push(`${name}_${String(i + 1).padStart(2, '0')}`);
  }
  return { geom: mergeGeoms(geoms), names };
}

// ---------------------------------------------------------------------------
// Ducts
// ---------------------------------------------------------------------------
function buildDucts(q) {
  const geoms = [];
  const names = [];
  const add = (name, geom) => { geoms.push(geom); names.push(name); };
  const pair = (name, geom) => {
    geoms.push(geom);
    names.push(`${name}_L`);
    names.push(`${name}_R`);
    geoms.push(mirrorGeometryX(geom));
  };

  add('cisterna_chyli', duct([[0.004, 1.036, -0.044], [0.000, 1.024, -0.040]], [0.0072, 0.0060], q, { radial: 9 }));
  add('thoracic_duct', duct(
    [[0.002, 1.028, -0.042], [-0.004, 1.110, -0.044], [-0.006, 1.190, -0.042],
     [0.000, 1.260, -0.036], [0.010, 1.320, -0.024], [0.020, 1.360, -0.004], [0.026, 1.382, 0.010]],
    [0.0046, 0.0030], q, { radial: 9 },
  ));
  add('right_lymphatic_duct', duct(
    [[-0.014, 1.336, -0.010], [-0.024, 1.364, 0.000], [-0.034, 1.382, 0.010]], [0.0034, 0.0026], q, { radial: 8 },
  ));
  add('intestinal_trunk', duct(
    [[0.008, 1.006, 0.008], [0.006, 1.018, -0.018], [0.002, 1.028, -0.040]], [0.0034, 0.0026], q, { radial: 8 },
  ));
  pair('lumbar_trunk', duct(
    [[0.034, 0.998, -0.028], [0.018, 1.014, -0.036], [0.004, 1.026, -0.040]], [0.0032, 0.0026], q, { radial: 8 },
  ));

  const collectors = [];
  for (let i = 0; i < 7; i++) {
    const y = 1.318 - i * 0.042;
    collectors.push(duct([[0.030, y - 0.010, -0.030], [0.018, y, -0.040], [0.000, y + 0.012, -0.042]], [0.0020, 0.0016], q, { radial: 6 }));
  }
  pair('mediastinal_collector', mergeGeoms(collectors));

  pair('saphenous_lymphatic', mergeGeoms([
    duct([[0.070, 0.140, 0.008], [0.068, 0.300, 0.012], [0.070, 0.470, 0.018], [0.076, 0.640, 0.034], [0.086, 0.820, 0.044], [0.090, 0.882, 0.038]], [0.0018, 0.0022], q, { radial: 6 }),
    duct([[0.098, 0.150, -0.030], [0.100, 0.320, -0.036], [0.098, 0.470, -0.030], [0.094, 0.560, -0.016]], [0.0017, 0.0020], q, { radial: 6 }),
  ]));

  pair('brachial_lymphatic', mergeGeoms([
    duct([[0.252, 0.870, 0.020], [0.238, 1.010, 0.030], [0.214, 1.180, 0.032], [0.186, 1.300, 0.022], [0.152, 1.352, 0.008]], [0.0018, 0.0022], q, { radial: 6 }),
    duct([[0.244, 0.880, 0.004], [0.232, 1.030, 0.010], [0.208, 1.200, 0.014], [0.176, 1.320, 0.006]], [0.0016, 0.0020], q, { radial: 6 }),
  ]));

  const merged = mergeGeoms(geoms);
  clampInsideShell(merged, 0.024);
  merged.computeVertexNormals();
  return [part('rasa_lymph_duct', 'rasa', 'lymph_duct', merged, { parts: names })];
}

// ---------------------------------------------------------------------------
// Node chains
// ---------------------------------------------------------------------------
const CHAINS = [
  ['deep_cervical', [[0.030, 1.500, 0.000], [0.030, 1.462, 0.006], [0.028, 1.424, 0.010], [0.026, 1.398, 0.012]], 6, [0.0050, 0.0080, 0.0050]],
  ['jugulodigastric', [[0.032, 1.470, 0.014], [0.036, 1.452, 0.018]], 2, [0.0060, 0.0088, 0.0060]],
  ['supraclavicular', [[0.044, 1.392, 0.004], [0.032, 1.386, 0.014], [0.020, 1.382, 0.020]], 4, [0.0050, 0.0076, 0.0050]],
  ['axillary', [[0.136, 1.352, 0.004], [0.152, 1.330, 0.012], [0.162, 1.312, 0.020], [0.148, 1.304, 0.002]], 6, [0.0056, 0.0084, 0.0056]],
  ['parasternal', [[0.028, 1.360, 0.098], [0.030, 1.320, 0.100], [0.032, 1.280, 0.098], [0.032, 1.240, 0.092]], 4, [0.0044, 0.0070, 0.0044]],
  ['tracheobronchial', [[0.024, 1.330, 0.004], [0.030, 1.300, -0.004], [0.026, 1.272, -0.010], [0.016, 1.252, -0.016]], 5, [0.0048, 0.0074, 0.0048]],
  ['paraaortic', [[0.024, 1.140, -0.034], [0.026, 1.090, -0.032], [0.024, 1.040, -0.030], [0.022, 0.990, -0.028], [0.020, 0.940, -0.026]], 6, [0.0050, 0.0076, 0.0050]],
  ['mesenteric', [[0.014, 1.030, -0.004], [0.016, 0.996, 0.006], [0.014, 0.960, 0.012], [0.010, 0.928, 0.010]], 5, [0.0046, 0.0070, 0.0046]],
  ['iliac', [[0.056, 0.842, -0.006], [0.046, 0.826, -0.018], [0.034, 0.816, -0.016]], 4, [0.0048, 0.0074, 0.0048]],
  ['inguinal', [[0.098, 0.920, 0.028], [0.092, 0.896, 0.034], [0.086, 0.872, 0.038], [0.080, 0.850, 0.034], [0.104, 0.900, 0.020]], 6, [0.0052, 0.0080, 0.0052]],
  ['popliteal', [[0.098, 0.512, -0.030], [0.092, 0.488, -0.034]], 2, [0.0046, 0.0070, 0.0046]],
];

function buildNodes(q) {
  const geoms = [];
  const names = [];
  let seed = 11;
  for (const [name, route, count, size] of CHAINS) {
    const c = chain(name, route, count, size, q, seed);
    seed += count * 3 + 5;
    geoms.push(c.geom, mirrorGeometryX(c.geom));
    names.push(...c.names.map((n) => `${n}_L`), ...c.names.map((n) => `${n}_R`));
  }
  const merged = mergeGeoms(geoms);
  clampInsideShell(merged, 0.016);
  merged.computeVertexNormals();
  return [part('rasa_lymph_node', 'rasa', 'lymph_node', merged, { parts: names })];
}

// ---------------------------------------------------------------------------
// Thymus — bilobed flat leaf behind the manubrium
// ---------------------------------------------------------------------------
function buildThymus(q) {
  const gland = (p) => {
    let d = smin(
      sdEllipsoid(off(p, [-0.016, 0.010, 0.0]), [0.016, 0.036, 0.008]),
      sdEllipsoid(off(p, [0.016, 0.006, 0.004]), [0.015, 0.032, 0.008]),
      0.010,
    );
    // ssub(cutter, keeper, k) — the repo-wide convention (see gen-spine, gen-thorax).
    d = ssub(sdEllipsoid(off(p, [0.0, 0.052, 0.016]), [0.030, 0.020, 0.014]), d, 0.010);
    d = ssub(sdEllipsoid(off(p, [0.0, -0.030, -0.012]), [0.024, 0.018, 0.012]), d, 0.010);
    return d;
  };
  const k = q === 'high' ? 1 : 0.6;
  const geom = meshSDF(gland, [-0.040, -0.055, -0.020], [0.040, 0.055, 0.024],
    [44, 56, 34].map((v) => Math.max(12, Math.round(v * k))));
  geom.computeVertexNormals();
  place(geom, { rotate: [0.10, 0, 0], translate: [0.002, 1.322, 0.080] });
  displace(geom, (x, y, z) => fbm(x * 70, y * 70, z * 70, 2) * 0.0008);
  clampInsideShell(geom, 0.038);
  geom.computeVertexNormals();
  return [part('thymus', 'rasa', 'thymus', geom, { parts: ['thymus_lobus_dexter', 'thymus_lobus_sinister'] })];
}

export function buildRasa(quality = 'high') {
  const q = quality === 'lite' ? 'lite' : 'high';
  const parts = [...buildDucts(q), ...buildNodes(q), ...buildThymus(q)];
  for (const p of parts) clampFloor(p.geometry, SKIN_BOTTOM_Y + 0.004);
  return parts;
}
