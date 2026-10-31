// Majja Dhatu — the neural axis and the medullary cavities inside bone.
//
// Containment is structural, not cosmetic:
//   * the cerebrum and cerebellum are hard-intersected with the inner table of
//     the cranium (CRANIAL_CAVITY), so no gyral ridge can ever breach the skull;
//   * the cord and the cauda equina are projected onto the vertebral-canal
//     ellipse the skeleton generator actually subtracts, per vertex;
//   * marrow is an inward offset of the exact bone primitives the skeleton
//     generator uses (capsules, rounded boxes, wedges), never a free blob.
// Nothing here is a lone sphere or cylinder: hemispheres are unions of named
// lobes with a folded field, the brainstem is a multi-section loft along the
// clivus, the nerves are lofted along catalogued routes.

import * as THREE from 'three';
import {
  meshSDF, smin, smax, ssub, sdSphere, sdEllipsoid, sdCapsule, sdTaperedCapsule, mirrorGeometryX,
} from '../sdf-mesh.js';
import { SPINE_VERTEBRA_CONFIG as SPINE } from '../constants.js';
import {
  TubeField, fbm, clamp, canalAxis, canalEllipseAt, CRANIAL_CAVITY, bonesBothSides, pushOutOfBones, SKIN_BOTTOM_Y,
} from './frame.js';
import {
  vesselTube, loftTube, part, mergeGeoms, displace, clampInsideShell, clampFloor, boxOf,
} from './mesh-utils.js';

const AX_X = [1, 0, 0];
const AX_Z = [0, 0, 1];
const CC = CRANIAL_CAVITY;

function off(p, c) { return [p[0] - c[0], p[1] - c[1], p[2] - c[2]]; }
function lenOf(path) {
  return new THREE.CatmullRomCurve3(path.map((q) => new THREE.Vector3(...q))).getLength();
}
function curve(path) {
  return new THREE.CatmullRomCurve3(path.map((q) => new THREE.Vector3(...q)));
}

/** Mesh an SDF and give it smooth shading. */
function solid(sdf, minB, maxB, res, q) {
  const k = q === 'high' ? 1 : 0.6;
  const r = res.map((v) => Math.max(10, Math.round(v * k)));
  const geom = meshSDF(sdf, minB, maxB, r);
  geom.computeVertexNormals();
  return geom;
}

/** A nerve: near-cylindrical loft, deliberately thin and pale. */
function nerveTube(name, path, radii, q, opts = {}) {
  const tube = vesselTube(path, radii, {
    samples: opts.samples || Math.max(8, Math.min(34, Math.round(lenOf(path) * (q === 'high' ? 120 : 70)))),
    roundness: 0.9,
  });
  return loftTube(tube, {
    radial: q === 'high' ? 6 : 5,
    rings: Math.max(6, Math.min(q === 'high' ? 30 : 16, Math.round(lenOf(path) * (q === 'high' ? 110 : 60)))),
    capRings: 2,
    noise: null,
    seed: name.length * 2.7,
  });
}

// ---------------------------------------------------------------------------
// Vertebral canal — the ellipse the bone generator actually subtracts.
// canalEllipseAt() lives in frame.js so the verifier asserts containment
// against the same function that positions the cord.
// ---------------------------------------------------------------------------
const canalAt = canalEllipseAt;

/** Hard-project every vertex into the elliptic canal (0.5 mm off the cortex). */
function clampToCanal(geom, shrink = 0.0005) {
  const arr = geom.attributes.position.array;
  for (let i = 0; i < geom.attributes.position.count; i++) {
    const k = i * 3;
    const y = arr[k + 1];
    const c = canalAt(y);
    const ex = arr[k] / (c.rx - shrink);
    const ez = (arr[k + 2] - c.z) / (c.rz - shrink);
    const r = Math.hypot(ex, ez);
    if (r <= 1) continue;
    const s = 0.995 / r;
    arr[k] = ex * s * (c.rx - shrink);
    arr[k + 2] = c.z + ez * s * (c.rz - shrink);
  }
  geom.attributes.position.needsUpdate = true;
  geom.computeBoundingSphere();
  return geom;
}

// ---------------------------------------------------------------------------
// Cerebrum — named lobes, folded, clipped to the inner table
// ---------------------------------------------------------------------------
const BRAIN_MASK = [0.0675, 0.0755, 0.1030];

function cerebrumField() {
  const [cx, cy, cz] = CC.centre;
  return (p) => {
    const lx = Math.abs(p[0]);
    const ly = p[1] - cy;
    const lz = p[2] - cz;

    // Frontal, parietal, occipital and temporal masses, blended.
    let d = sdEllipsoid([lx, ly + 0.014, lz + 0.048], [0.056, 0.058, 0.050]);
    d = smin(d, sdEllipsoid([lx, ly + 0.020, lz - 0.012], [0.056, 0.050, 0.054]), 0.018);
    d = smin(d, sdEllipsoid([lx, ly - 0.006, lz - 0.058], [0.046, 0.046, 0.040]), 0.018);
    d = smin(d, sdEllipsoid([lx - 0.004, ly - 0.044, lz + 0.010], [0.046, 0.028, 0.054]), 0.016);
    // Insular bulge where the temporal and frontal masses meet.
    d = smin(d, sdEllipsoid([lx - 0.010, ly - 0.010, lz + 0.016], [0.030, 0.030, 0.034]), 0.016);

    // Gyri: a meandering fold field, amplitude well under the mask clearance.
    const warp = 2.4 * fbm(lx * 8.5, ly * 8.5, lz * 8.5, 2);
    const fold = Math.sin(lx * 74 + lz * 52 + warp) * 0.5 + 0.5 * Math.sin(ly * 66 + lz * 30 - warp * 0.7);
    d += 0.0021 * fold;

    // Tentorial shelf flattens the underside of the occipital and temporal lobes.
    const base = sdEllipsoid([lx, ly - 0.130, lz - 0.010], [0.092, 0.062, 0.132]);
    d = Math.max(d, -base);

    // Cerebellar notch: the occipital lobe lifts clear of the cerebellum.
    const notch = sdEllipsoid(off(p, [0, 1.556, -0.052]), [0.056, 0.030, 0.044]);
    d = ssub(notch, d, 0.004);
    // Midbrain passage through the centre of the mass.
    const bridge = sdCapsule(off(p, [0, 0, 0]), [0, cy - 0.058, cz + 0.004], [0, cy + 0.010, cz + 0.008], 0.0125);
    d = ssub(bridge, d, 0.005);

    // Hard clip to the inner table of the cranium.
    d = Math.max(d, sdEllipsoid([lx, ly, lz], BRAIN_MASK));

    // Longitudinal fissure — deep superiorly, closing over the diencephalon.
    const gap = 0.0021 * clamp((ly + 0.026) / 0.028, 0, 1);
    d = Math.max(d, gap - lx);
    // Lateral sulcus (Sylvian fissure) between temporal and frontal masses.
    const sylvian = sdCapsule(off(p, [0, 0, 0]),
      [0.018, cy - 0.030, cz + 0.048], [0.056, cy - 0.014, cz - 0.006], 0.0042);
    d = ssub(sylvian, d, 0.003);
    return d;
  };
}

function buildCerebrum(q) {
  const out = [];
  const y0 = CC.centre[1] - 0.086;
  const y1 = CC.centre[1] + 0.086;
  // Left hemisphere (+X), then mirrored — gives the verifier a real mirror pair.
  const hemi = (p) => Math.max(cerebrumField()(p), -p[0] + 0.0008);
  const minB = [0.0008, y0, CC.centre[2] - 0.122];
  const maxB = [0.086, y1, CC.centre[2] + 0.122];
  const gL = solid(hemi, minB, maxB, [34, 46, 58], q);
  out.push(part('cerebrum_L', 'majja', 'brain', gL));
  out.push(part('cerebrum_R', 'majja', 'brain', mirrorGeometryX(gL)));
  return out;
}

// ---------------------------------------------------------------------------
// Cerebellum — posterior fossa, foliated hemispheres plus vermis
// ---------------------------------------------------------------------------
const CEREBELLEM_CENTRE = [0, 1.551, -0.052];

function cerebellumField(hemiSign) {
  return (p) => {
    const lx = Math.abs(p[0]);
    const ly = p[1] - CEREBELLEM_CENTRE[1];
    const lz = p[2] - CEREBELLEM_CENTRE[2];

    // Hemispheric mass, wider behind than in front.
    let d = sdEllipsoid([lx - 0.022, ly, lz], [0.030, 0.022, 0.036]);
    d = smin(d, sdEllipsoid([lx - 0.006, ly - 0.006, lz - 0.014], [0.024, 0.018, 0.024]), 0.010);
    // Flocculus / tonsil lobe tucked anteroinferiorly beside the brainstem.
    d = smin(d, sdEllipsoid([lx - 0.030, ly - 0.014, lz + 0.026], [0.010, 0.009, 0.012]), 0.006);

    // Folia: thin, horizontal, parallel plates — the cerebellar signature.
    const fold = Math.sin(ly * 260 + 1.6 * fbm(lx * 11, ly * 6, lz * 11, 2));
    d += 0.0013 * fold;

    // Midline vermis ridge (only kept on the midline part).
    if (hemiSign === 0) {
      const vermis = sdEllipsoid([lx, ly + 0.004, lz - 0.002], [0.011, 0.020, 0.032]);
      d = Math.min(d, vermis);
      d = Math.max(d, 0.0092 - lx);
    } else {
      d = Math.max(d, 0.0092 - lx);
    }

    // Brainstem impression.
    const stem = sdCapsule(off(p, [0, 0, 0]), [0, 1.520, 0.004], [0, 1.570, 0.010], 0.0165);
    d = ssub(stem, d, 0.004);

    // Clip into the posterior fossa of the inner table.
    const mask = sdEllipsoid(off(p, CC.centre), [0.0700, 0.0780, 0.1090]);
    d = Math.max(d, mask);
    // Keep clear of the foramen magnum rim.
    d = Math.max(d, 1.5235 - p[1]);
    return d;
  };
}

function buildCerebellum(q) {
  const out = [];
  const y0 = CEREBELLEM_CENTRE[1] - 0.034;
  const y1 = CEREBELLEM_CENTRE[1] + 0.034;
  const minB = [0.0090, y0, CEREBELLEM_CENTRE[2] - 0.062];
  const maxB = [0.060, y1, CEREBELLEM_CENTRE[2] + 0.052];
  const gL = solid(cerebellumField(1), minB, maxB, [22, 34, 44], q);
  out.push(part('cerebellar_hemisphere_L', 'majja', 'cerebellum', gL));
  out.push(part('cerebellar_hemisphere_R', 'majja', 'cerebellum', mirrorGeometryX(gL)));
  const vmin = [-0.012, y0, CEREBELLEM_CENTRE[2] - 0.050];
  const vmax = [0.012, y1, CEREBELLEM_CENTRE[2] + 0.040];
  const gv = solid(cerebellumField(0), vmin, vmax, [12, 30, 40], q);
  out.push(part('cerebellar_vermis', 'majja', 'cerebellum', gv));
  return out;
}

// ---------------------------------------------------------------------------
// Brainstem — midbrain, pons and medulla along the clivus
// ---------------------------------------------------------------------------
function buildBrainstem(q) {
  const path = [
    [0, 1.601, 0.014], [0, 1.584, 0.016], [0, 1.566, 0.012],
    [0, 1.550, 0.006], [0, 1.534, -0.002], [0, 1.520, -0.004], [0, 1.504, -0.002],
  ];
  const sections = [
    [0, [0.0095, 0.0085, 0]],
    [0.18, [0.0115, 0.0100, 0.001]],
    [0.42, [0.0150, 0.0115, 0.003]], // ventral pons
    [0.62, [0.0130, 0.0105, 0.002]],
    [0.82, [0.0095, 0.0085, 0]],
    [1, [0.0068, 0.0068, 0]],
  ];
  const tube = new TubeField(path, sections, {
    samples: q === 'high' ? 26 : 15, refW: AX_X, refD: AX_Z, capScale: [0.9, 0.7],
  });
  let g = loftTube(tube, {
    radial: q === 'high' ? 12 : 8, rings: q === 'high' ? 26 : 15, capRings: 3,
    noise: { amp: 0.0004, freq: 40, octaves: 2 }, seed: 3.1,
  });
  // Basilar groove down the ventral surface of the pons.
  g = displace(g, (x, y, z, nx, ny, nz) => {
    if (nz < 0.35) return 0;
    return -0.0013 * Math.exp(-(((y - 1.552) / 0.016) ** 2)) * Math.exp(-((x / 0.005) ** 2));
  });
  g.computeVertexNormals();
  clampToCanal(g, 0.0);
  // The upper stem is intracranial, so only the shell matters below the canal.
  clampInsideShell(g, 0.012, 2);
  return [part('brainstem', 'majja', 'brainstem', g, { parts: ['midbrain', 'pons', 'medulla_oblongata'] })];
}

// ---------------------------------------------------------------------------
// Spinal cord + conus medullaris + cauda equina
// ---------------------------------------------------------------------------
function cordPath() {
  const axis = canalAxis().filter((c) => c[1] >= 1.004);
  const tail = axis[axis.length - 1];
  return [...axis, [0, 0.985, tail[2] + 0.004]];
}

function buildCord(q) {
  const path = cordPath();
  const sections = [
    [0, [0.0048, 0.0044, 0]],
    [0.08, [0.0053, 0.0048, 0]], // cervical enlargement
    [0.20, [0.0049, 0.0045, 0]],
    [0.34, [0.0040, 0.0040, 0]],
    [0.55, [0.0038, 0.0038, 0]], // mid-thoracic
    [0.72, [0.0043, 0.0042, 0]],
    [0.86, [0.0050, 0.0046, 0]], // lumbar enlargement (L1)
    [0.96, [0.0036, 0.0034, 0]],
    [1, [0.0012, 0.0011, 0]],    // conus tip
  ];
  const len = lenOf(path);
  const tube = new TubeField(path, sections, {
    samples: Math.max(24, Math.min(70, Math.round(len * (q === 'high' ? 150 : 90)))),
    refW: AX_X, refD: AX_Z, capScale: [1, 0.55],
  });
  const g = loftTube(tube, {
    radial: q === 'high' ? 10 : 7,
    rings: q === 'high' ? 60 : 32,
    capRings: 2,
    noise: { amp: 0.0002, freq: 60, octaves: 2 },
    seed: 9.7,
  });
  clampToCanal(g);
  return [part('spinal_cord', 'majja', 'spinal_cord', g)];
}

function buildCauda(q) {
  const geoms = [];
  const names = [];
  const axis = canalAxis();
  const top = [0, 0.992, canalAt(0.992).z];
  // Twelve root filaments: six per side, each leaving at its own sacral level.
  for (let i = 0; i < 6; i++) {
    const yEnd = 0.826 - i * 0.014;
    const spread = 0.0016 + i * 0.0008;
    for (const side of [1, -1]) {
      const zEnd = canalAt(yEnd).z;
      const path = [
        [side * 0.0016, top[1] + 0.004, top[2]],
        [side * (0.0026 + spread * 0.4), 0.950 - i * 0.004, canalAt(0.950 - i * 0.004).z],
        [side * (0.0034 + spread), 0.900 - i * 0.006, canalAt(0.900 - i * 0.006).z],
        [side * (0.0030 + spread * 0.7), yEnd + 0.020, canalAt(yEnd + 0.020).z],
        [side * spread * 0.5, yEnd, zEnd],
      ];
      const g = nerveTube(`cauda_${i}_${side}`, path, [0.0011, 0.0007], q, { samples: 14 });
      clampToCanal(g, 0.0008);
      geoms.push(g);
      names.push(`cauda_equina_root_${i + 1}${side > 0 ? 'L' : 'R'}`);
    }
  }
  // Filum terminale: a single midline thread down to the coccyx.
  const filum = [
    [0, 0.985, canalAt(0.985).z], [0, 0.920, canalAt(0.920).z],
    [0, 0.858, canalAt(0.858).z], [0, 0.800, canalAt(0.800).z], [0, 0.760, canalAt(0.760).z],
  ];
  const fg = nerveTube('filum_terminale', filum, [0.0009, 0.0006], q, { samples: 20 });
  clampToCanal(fg, 0.0008);
  geoms.push(fg);
  names.push('filum_terminale');
  void axis;
  return [part('cauda_equina', 'majja', 'cauda_equina', mergeGeoms(geoms), { parts: names })];
}

// ---------------------------------------------------------------------------
// Named peripheral nerves
// ---------------------------------------------------------------------------
/** Rib route, transcribed from the skeleton generator so intercostals track bone. */
function ribRoute(ribIndex) {
  const t = SPINE[6 + ribIndex];
  const vertY = t.y;
  const vertZ = t.z;
  const norm = (ribIndex - 1) / 11;
  const hw = 0.075 + Math.sin(norm * Math.PI * 0.85) * 0.065;
  const cd = 0.080 + Math.sin(norm * Math.PI * 0.85) * 0.055;
  const head = [0.016, vertY + 0.002, vertZ - 0.004];
  const tub = [0.032, vertY - 0.002, vertZ - 0.022];
  const ang = [hw * 0.75, vertY - 0.008, vertZ - 0.035];
  const lat = [hw, vertY - 0.022, vertZ + cd * 0.4];
  const ant = [hw * 0.85, vertY - 0.038, vertZ + cd * 0.85];
  let end;
  if (ribIndex <= 7) end = [0.025 + ribIndex * 0.002, 1.370 - (ribIndex - 1) * 0.022 - 0.005, 0.125];
  else if (ribIndex <= 10) end = [0.045 + (ribIndex - 7) * 0.012, 1.230 - (ribIndex - 7) * 0.015, 0.105 - (ribIndex - 7) * 0.010];
  else end = [hw * 0.65, vertY - 0.045, vertZ + cd * 0.45];
  return { pts: [head, tub, ang, lat, ant, end], curve: curve([head, tub, ang, lat, ant, end]) };
}

const ARM_NERVES = [
  { name: 'vagus', r: [0.0026, 0.0020], path: [[0.013, 1.502, -0.008], [0.019, 1.452, 0.004], [0.022, 1.396, 0.016], [0.026, 1.340, 0.020], [0.024, 1.268, 0.004], [0.018, 1.196, -0.014], [0.014, 1.130, -0.020]] },
  { name: 'phrenic', r: [0.0022, 0.0018], path: [[0.020, 1.452, -0.002], [0.026, 1.392, 0.006], [0.030, 1.320, 0.020], [0.034, 1.244, 0.034], [0.040, 1.180, 0.030], [0.048, 1.136, 0.020]] },
  { name: 'brachial_plexus_trunks', r: [0.0042, 0.0034], path: [[0.016, 1.444, -0.010], [0.026, 1.418, -0.008], [0.038, 1.392, -0.006], [0.056, 1.372, 0.004], [0.096, 1.356, 0.014], [0.140, 1.340, 0.020], [0.186, 1.312, 0.026]] },
  { name: 'musculocutaneous', r: [0.0024, 0.0017], path: [[0.198, 1.296, 0.034], [0.208, 1.240, 0.038], [0.216, 1.156, 0.036], [0.224, 1.088, 0.032], [0.232, 1.010, 0.030], [0.240, 0.934, 0.026]] },
  { name: 'median', r: [0.0030, 0.0020], path: [[0.196, 1.290, 0.026], [0.208, 1.222, 0.030], [0.220, 1.140, 0.030], [0.230, 1.068, 0.028], [0.240, 0.980, 0.028], [0.250, 0.900, 0.026], [0.256, 0.838, 0.024], [0.260, 0.776, 0.028], [0.262, 0.712, 0.030]] },
  { name: 'ulnar', r: [0.0027, 0.0018], path: [[0.194, 1.284, 0.014], [0.206, 1.214, 0.012], [0.220, 1.136, 0.008], [0.234, 1.076, 0.004], [0.244, 1.006, 0.006], [0.252, 0.924, 0.010], [0.258, 0.846, 0.014], [0.266, 0.790, 0.016]] },
  { name: 'radial', r: [0.0030, 0.0019], path: [[0.192, 1.292, 0.008], [0.204, 1.246, 0.002], [0.218, 1.188, -0.006], [0.232, 1.116, -0.008], [0.240, 1.048, -0.002], [0.246, 0.968, 0.012], [0.254, 0.892, 0.018], [0.262, 0.826, 0.020], [0.268, 0.772, 0.018]] },
  { name: 'axillary', r: [0.0026, 0.0018], path: [[0.190, 1.300, 0.012], [0.194, 1.276, 0.002], [0.190, 1.258, -0.012], [0.180, 1.268, -0.026], [0.168, 1.298, -0.030]] },
  { name: 'femoral', r: [0.0034, 0.0022], path: [[0.062, 0.986, -0.014], [0.074, 0.952, -0.006], [0.088, 0.920, 0.018], [0.096, 0.888, 0.034], [0.100, 0.838, 0.034], [0.104, 0.762, 0.030], [0.104, 0.690, 0.026]] },
  { name: 'obturator', r: [0.0024, 0.0017], path: [[0.058, 0.980, -0.018], [0.066, 0.942, -0.010], [0.072, 0.906, 0.004], [0.074, 0.868, 0.014], [0.072, 0.834, 0.010]] },
  { name: 'lateral_femoral_cutaneous', r: [0.0020, 0.0015], path: [[0.060, 0.984, -0.010], [0.078, 0.956, 0.006], [0.096, 0.930, 0.024], [0.116, 0.898, 0.030], [0.132, 0.858, 0.026], [0.144, 0.812, 0.020]] },
  { name: 'sciatic', r: [0.0052, 0.0040], path: [[0.048, 0.902, -0.030], [0.062, 0.880, -0.034], [0.078, 0.858, -0.032], [0.090, 0.818, -0.030], [0.096, 0.744, -0.028], [0.098, 0.662, -0.030], [0.098, 0.580, -0.032], [0.096, 0.528, -0.034]] },
  { name: 'tibial', r: [0.0030, 0.0020], path: [[0.096, 0.526, -0.034], [0.092, 0.470, -0.040], [0.086, 0.392, -0.046], [0.080, 0.300, -0.046], [0.074, 0.208, -0.044], [0.070, 0.128, -0.038], [0.068, 0.078, -0.030]] },
  { name: 'common_fibular', r: [0.0027, 0.0019], path: [[0.096, 0.528, -0.034], [0.108, 0.504, -0.030], [0.120, 0.482, -0.018], [0.128, 0.460, -0.004], [0.126, 0.404, 0.004], [0.120, 0.330, 0.008], [0.112, 0.252, 0.012], [0.104, 0.170, 0.016]] },
  { name: 'deep_fibular', r: [0.0018, 0.0013], path: [[0.126, 0.402, 0.006], [0.118, 0.336, 0.016], [0.108, 0.256, 0.022], [0.098, 0.176, 0.024], [0.090, 0.112, 0.026]] },
  { name: 'superficial_fibular', r: [0.0018, 0.0013], path: [[0.128, 0.400, -0.002], [0.126, 0.332, -0.002], [0.120, 0.254, 0.002], [0.112, 0.176, 0.006], [0.104, 0.116, 0.010]] },
  { name: 'tibial_calcaneal_branch', r: [0.0016, 0.0012], path: [[0.070, 0.130, -0.038], [0.068, 0.096, -0.040], [0.066, 0.062, -0.036], [0.064, 0.038, -0.028]] },
  { name: 'pudendal', r: [0.0024, 0.0017], path: [[0.030, 0.826, -0.036], [0.046, 0.812, -0.020], [0.052, 0.800, 0.004], [0.044, 0.788, 0.026], [0.030, 0.792, 0.040]] },
  { name: 'greater_splanchnic', r: [0.0016, 0.0013], path: [[0.016, 1.244, -0.048], [0.022, 1.196, -0.044], [0.028, 1.144, -0.036], [0.032, 1.096, -0.026]] },
];

function buildNerves(q) {
  const bones = bonesBothSides();
  const geoms = [];
  const names = [];
  const push = (name, path, radii) => {
    const finite = (geom, stage) => {
      const a = geom.attributes.position.array;
      for (let i = 0; i < a.length; i++) {
        if (Number.isFinite(a[i])) continue;
        throw new Error(`NaN in nerve "${name}" after ${stage} at vertex ${Math.floor(i / 3)} (${path.length} pts)`);
      }
    };
    const g = nerveTube(name, path, radii, q);
    finite(g, 'loft');
    const arr = g.attributes.position.array;
    for (let i = 0; i < g.attributes.position.count; i++) {
      const k = i * 3;
      const p = [arr[k], arr[k + 1], arr[k + 2]];
      pushOutOfBones(p, bones, 0.0006);
      arr[k] = p[0]; arr[k + 1] = p[1]; arr[k + 2] = p[2];
    }
    g.attributes.position.needsUpdate = true;
    finite(g, 'bone-clearance');
    clampInsideShell(g, 0.014, 2);
    finite(g, 'shell-clamp');
    geoms.push(g);
    names.push(name);
  };

  for (const n of ARM_NERVES) {
    for (const side of [1, -1]) {
      const path = n.path.map((p) => [side * p[0], p[1], p[2]]);
      push(side > 0 ? `${n.name}_L` : `${n.name}_R`, path, n.r);
    }
  }

  // Intercostal nerves: run in the costal groove on the inferior border.
  for (let i = 1; i <= 11; i++) {
    const rb = ribRoute(i);
    for (const side of [1, -1]) {
      const path = [];
      for (let s = 0; s <= 6; s++) {
        const t = 0.14 + (s / 6) * 0.62;
        const q3 = rb.curve.getPoint(t);
        path.push([side * q3.x, q3.y - 0.0072, q3.z - 0.0018]);
      }
      push(`intercostal_${String(i).padStart(2, '0')}${side > 0 ? 'L' : 'R'}`, path, [0.0017, 0.0014]);
    }
  }

  // Lumbar and sacral spinal rami filling the canal exit region.
  for (let i = 0; i < 5; i++) {
    const c = SPINE[19 + i];
    if (!c) break;
    const zc = c.z - c.bodyD * 0.48;
    for (const side of [1, -1]) {
      push(`lumbar_ramus_${String(i + 1).padStart(2, '0')}${side > 0 ? 'L' : 'R'}`,
        [[side * 0.012, c.y, zc], [side * 0.032, c.y - 0.008, zc - 0.004], [side * 0.052, c.y - 0.020, zc + 0.006]],
        [0.0020, 0.0016]);
    }
  }

  return [part('peripheral_nerves', 'majja', 'nerve', mergeGeoms(geoms), { parts: names })];
}

// ---------------------------------------------------------------------------
// Marrow — inward offsets of the exact bone primitives
// ---------------------------------------------------------------------------
const BONES_SIDE = bonesBothSides();

function lerpP(a, b, t) { return a.map((v, i) => v + (b[i] - v) * t); }

function longBoneMarrow(b, q) {
  const s = lerpP(b.a, b.b, 0.16);
  const e = lerpP(b.a, b.b, 0.84);
  const r0 = (b.ra + (b.rb - b.ra) * 0.16) * 0.86;
  const r1 = (b.ra + (b.rb - b.ra) * 0.84) * 0.86;
  const sdf = (p) => {
    // Medullary cavity: the same tapered capsule at 86 % of 55 % radius,
    // shortened at both ends, plus spongy epiphyseal masses inside the heads.
    let d = sdTaperedCapsule(p, s, e, r0, r1);
    d = smin(d, sdSphere(off(p, lerpP(b.a, b.b, 0.06)), b.ra * 0.60), 0.008);
    d = smin(d, sdSphere(off(p, lerpP(b.a, b.b, 0.94)), b.rb * 0.72), 0.008);
    return d;
  };
  const lo = b.a.map((v, i) => Math.min(v, b.b[i]) - b.ra - 0.004);
  const hi = b.a.map((v, i) => Math.max(v, b.b[i]) + b.rb + 0.004);
  const res = [20, 20, 20].map((_, i) => {
    const span = hi[i] - lo[i];
    const cell = (q === 'high' ? 0.0028 : 0.0042);
    return clamp(Math.round(span / cell) + 1, 12, 40);
  });
  return solid(sdf, lo, hi, res, q);
}

function spineMarrow(q) {
  const sdf = (p) => {
    let d = Infinity;
    for (const c of SPINE) {
      if (c.tag === 'C1' || c.tag === 'S' || c.tag === 'Co') continue;
      const e = sdEllipsoid([p[0], p[1] - c.y, p[2] - (c.z + c.bodyD * 0.10)],
        [c.bodyW * 0.30, c.bodyH * 0.32, c.bodyD * 0.20]);
      if (e < d) d = e;
    }
    // Sacral wedge: midline column, clear of the four sacral foramina.
    const sac = SPINE[25];
    const s = sdEllipsoid([p[0], p[1] - (sac.y + 0.006), p[2] - (sac.z - 0.018)], [0.0090, 0.0340, 0.0064]);
    return Math.min(d, s);
  };
  const minB = [-0.030, 0.740, -0.062];
  const maxB = [0.030, 1.400, 0.060];
  const res = [22, q === 'high' ? 150 : 92, 26];
  return solid(sdf, minB, maxB, res, q);
}

function sternalMarrow(q) {
  const sdf = (p) => {
    const man = sdEllipsoid(off(p, [0, 1.365, 0.125]), [0.0105, 0.0155, 0.0019]);
    const body = sdEllipsoid(off(p, [0, 1.285, 0.132]), [0.0058, 0.0375, 0.0015]);
    return Math.min(man, body);
  };
  return solid(sdf, [-0.020, 1.222, 0.112], [0.020, 1.400, 0.146], [16, q === 'high' ? 64 : 40, 14], q);
}

function ribEndMarrow(q) {
  const geoms = [];
  const names = [];
  for (let i = 1; i <= 12; i++) {
    const rb = ribRoute(i);
    const pts = [];
    for (let s = 0; s <= 5; s++) {
      const t = 0.80 + (s / 5) * 0.14;
      const p = rb.curve.getPoint(t);
      pts.push([p.x, p.y, p.z]);
    }
    const g = nerveTube(`rib_end_${i}`, pts, [0.0011, 0.0010], q, { samples: 10 });
    geoms.push(g);
    geoms.push(mirrorGeometryX(g));
    names.push(`marrow_rib_${String(i).padStart(2, '0')}_L`, `marrow_rib_${String(i).padStart(2, '0')}_R`);
  }
  return { geom: mergeGeoms(geoms), names };
}

function pelvicMarrow(q) {
  const geoms = [];
  const names = [];
  // Iliac blade (cancellous core of the wing), crest and ischial body.
  const blade = solid((p) => sdEllipsoid(off(p, [0.080, 0.950, 0.012]), [0.0235, 0.0345, 0.0022]),
    [0.030, 0.900, -0.020], [0.132, 1.002, 0.044], [26, 30, 14], q);
  const crest = nerveTube('iliac_crest_marrow', [[0.044, 0.988, -0.004], [0.078, 0.998, 0.004], [0.114, 1.002, 0.018]],
    [0.0022, 0.0020], q, { samples: 14 });
  const ischium = nerveTube('ischial_marrow', [[0.090, 0.858, -0.006], [0.086, 0.806, -0.014], [0.084, 0.782, -0.016]],
    [0.0048, 0.0056], q, { samples: 12 });
  for (const g of [blade, crest, ischium]) {
    geoms.push(g);
    geoms.push(mirrorGeometryX(g));
  }
  names.push('marrow_ilium_L', 'marrow_ilium_R', 'marrow_iliac_crest_L', 'marrow_iliac_crest_R',
    'marrow_ischium_L', 'marrow_ischium_R');
  return { geom: mergeGeoms(geoms), names };
}

function buildMarrow(q) {
  const geoms = [];
  const names = [];
  for (const b of BONES_SIDE) {
    geoms.push(longBoneMarrow(b, q));
    names.push(`marrow_${b.id}`);
  }
  geoms.push(spineMarrow(q));
  names.push('marrow_vertebral_column');
  geoms.push(sternalMarrow(q));
  names.push('marrow_sternum');
  const ribs = ribEndMarrow(q);
  geoms.push(ribs.geom);
  names.push(...ribs.names);
  const pelvis = pelvicMarrow(q);
  geoms.push(pelvis.geom);
  names.push(...pelvis.names);
  const merged = mergeGeoms(geoms);
  clampFloor(merged, SKIN_BOTTOM_Y + 0.004);
  return [part('marrow', 'majja', 'marrow', merged, { parts: names })];
}

// ---------------------------------------------------------------------------
export function buildMajja(quality) {
  const q = quality === 'lite' ? 'lite' : 'high';
  const out = [
    ...buildCerebrum(q),
    ...buildCerebellum(q),
    ...buildBrainstem(q),
    ...buildCord(q),
    ...buildCauda(q),
    ...buildNerves(q),
    ...buildMarrow(q),
  ];
  for (const p of out) {
    if (p.region === 'brain' || p.region === 'cerebellum') continue;
    clampFloor(p.geometry, SKIN_BOTTOM_Y + 0.004);
  }
  return out;
}
