// Shukra Dhatu — the male reproductive organs, drawn in a neutral medical-atlas
// register: internal structures only. Every form is composite anatomy — the
// testis is a rotated ovoid with an epididymal groove subtracted and a lobulated
// tunica, the epididymis is a comma loft hugging the posterolateral surface, the
// vas deferens is a single long loft that climbs the inguinal canal and loops
// over the bladder, the seminal vesicle is a coiled tube rather than a sac, and
// the prostate is two lobes with the urethral passage carved out.
//
// Nothing is a bare primitive and the whole layer stays inside the skin shell, so
// the groin silhouette of the shell remains smooth.

import * as THREE from 'three';
import {
  meshSDF, smin, ssub, sdSphere, sdEllipsoid, sdCapsule, mirrorGeometryX,
} from '../sdf-mesh.js';
import { fbm, bonesBothSides, pushOutOfBones, SKIN_BOTTOM_Y } from './frame.js';
import {
  vesselTube, loftTube, part, mergeGeoms, displace, clampInsideShell, clampFloor,
} from './mesh-utils.js';

function off(p, c) { return [p[0] - c[0], p[1] - c[1], p[2] - c[2]]; }
function lenOf(path) {
  return new THREE.CatmullRomCurve3(path.map((q) => new THREE.Vector3(...q))).getLength();
}

const BONES = bonesBothSides();

/** Retreat any vertex that touches a long bone, then keep it under the skin. */
function tidy(geom, margin = 0.014) {
  const arr = geom.attributes.position.array;
  for (let i = 0; i < geom.attributes.position.count; i++) {
    const k = i * 3;
    const p = [arr[k], arr[k + 1], arr[k + 2]];
    pushOutOfBones(p, BONES, 0.0012);
    arr[k] = p[0]; arr[k + 1] = p[1]; arr[k + 2] = p[2];
  }
  geom.attributes.position.needsUpdate = true;
  geom.computeVertexNormals();
  clampInsideShell(geom, margin, 2);
  clampFloor(geom, SKIN_BOTTOM_Y + 0.004);
  return geom;
}

function tube(name, path, radii, q, opts = {}) {
  const t = vesselTube(path, radii, {
    samples: opts.samples || Math.max(9, Math.min(40, Math.round(lenOf(path) * (q === 'high' ? 150 : 85)))),
    roundness: opts.roundness ?? 0.92,
    refW: opts.refW, refD: opts.refD,
  });
  return loftTube(t, {
    radial: opts.radial || (q === 'high' ? 9 : 6),
    rings: opts.rings || Math.max(8, Math.min(q === 'high' ? 40 : 20, Math.round(lenOf(path) * (q === 'high' ? 130 : 70)))),
    capRings: 2,
    noise: opts.noise === false ? null : { amp: 0.00025, freq: 46, octaves: 2 },
    seed: name.length * 5.13,
  });
}

function solid(sdf, minB, maxB, res, q) {
  const k = q === 'high' ? 1 : 0.62;
  const r = res.map((v) => Math.max(10, Math.round(v * k)));
  const g = meshSDF(sdf, minB, maxB, r);
  g.computeVertexNormals();
  return g;
}

function bilateral(name, region, geom, out) {
  out.push(part(`${name}_L`, 'shukra', region, geom, { parts: [`${name}_L`] }));
  out.push(part(`${name}_R`, 'shukra', region, mirrorGeometryX(geom), { parts: [`${name}_R`] }));
}

// ---------------------------------------------------------------------------
// Testis — ovoid body, epididymal groove, lobulated surface
// ---------------------------------------------------------------------------
const TESTIS_C = [0.030, 0.776, 0.062];

function testisField(centre) {
  return (p) => {
    // Long axis tilted: superior pole medially, inferior pole laterally.
    const l = off(p, centre);
    const a = -0.22; // rotation about Z
    const rx = l[0] * Math.cos(a) + l[1] * Math.sin(a);
    const ry = -l[0] * Math.sin(a) + l[1] * Math.cos(a);
    const q3 = [rx, ry, l[2]];

    let d = sdEllipsoid(q3, [0.0118, 0.0172, 0.0130]);
    // Slight bulge at each pole so it is not a clean ellipsoid.
    d = smin(d, sdSphere(off(q3, [0, 0.0150, 0.0015]), 0.0075), 0.006);
    d = smin(d, sdSphere(off(q3, [0.001, -0.0158, -0.0010]), 0.0068), 0.006);
    // Epididymal groove on the posterolateral border.
    const groove = sdCapsule(off(q3, [0, 0, 0]),
      [0.0128, 0.0150, -0.0075], [0.0132, -0.0060, -0.0060], 0.0052);
    d = ssub(groove, d, 0.004);
    return d;
  };
}

function buildTestes(q) {
  const out = [];
  const lo = [TESTIS_C[0] - 0.026, TESTIS_C[1] - 0.030, TESTIS_C[2] - 0.024];
  const hi = [TESTIS_C[0] + 0.026, TESTIS_C[1] + 0.030, TESTIS_C[2] + 0.024];
  const g = solid(testisField(TESTIS_C), lo, hi, [34, 40, 32], q);
  // Lobulated tunica albuginea.
  const gg = displace(g, (x, y, z) => 0.00035 * fbm(x * 220, y * 220, z * 220, 2));
  bilateral('testis', 'testis', tidy(gg, 0.008), out);

  // Epididymis: head over the superior pole, body down the posterolateral
  // border, tail at the inferior pole continuing into the vas.
  const epath = [
    [0.0395, 0.7965, 0.0555], [0.0420, 0.7900, 0.0520], [0.0432, 0.7800, 0.0518],
    [0.0426, 0.7690, 0.0535], [0.0405, 0.7595, 0.0560], [0.0372, 0.7535, 0.0585],
  ];
  const eg = tube('epididymis', epath, [0.0062, 0.0034], q, { radial: q === 'high' ? 10 : 7, roundness: 0.8 });
  // Coiled efferent ducts on the head.
  const coils = [];
  for (let i = 0; i < 3; i++) {
    const pts = [];
    for (let s = 0; s <= 8; s++) {
      const t = s / 8;
      const ang = t * Math.PI * 2 * 1.6 + i * 2.1;
      pts.push([
        0.0402 + 0.0042 * Math.cos(ang),
        0.7952 - 0.0040 * i + 0.0022 * Math.sin(t * Math.PI),
        0.0548 + 0.0040 * Math.sin(ang),
      ]);
    }
    coils.push(tube(`duct_${i}`, pts, [0.0013, 0.0011], q, { radial: 5, rings: 12, noise: false }));
  }
  const epi = mergeGeoms([eg, ...coils]);
  bilateral('epididymis', 'testis', tidy(epi, 0.007), out);
  return out;
}

// ---------------------------------------------------------------------------
// Vas deferens — through the inguinal canal, over the bladder, to the duct
// ---------------------------------------------------------------------------
const VAS_PATH = [
  [0.0368, 0.7528, 0.0592],   // epididymal tail
  [0.0430, 0.7720, 0.0520],   // ascends the cord posterolaterally
  [0.0520, 0.8240, 0.0400],   // anterior superior iliac direction
  [0.0660, 0.8760, 0.0340],   // superficial inguinal ring
  [0.0840, 0.9120, 0.0220],   // inguinal canal
  [0.0930, 0.9400, 0.0040],   // deep ring, at the bladder lateral surface
  [0.0800, 0.9340, -0.0180],  // crosses the pelvic brim
  [0.0540, 0.9060, -0.0340],  // runs medially behind the bladder
  [0.0300, 0.8760, -0.0240],
  [0.0160, 0.8580, -0.0060],  // converges with the vesicle duct
  [0.0092, 0.8485, 0.0140],   // ejaculatory duct entry into the prostate
];

function buildVasa(q) {
  const out = [];
  const g = tube('vas_deferens', VAS_PATH, [0.0026, 0.0022], q, {
    radial: q === 'high' ? 8 : 6, roundness: 0.95,
  });
  // Muscular cuff along the canal segment (the vas is a thick-walled duct).
  const cuffPath = VAS_PATH.slice(2, 7);
  const cuff = tube('vas_cuff', cuffPath, [0.0042, 0.0032], q, { radial: 8, rings: 16, noise: false });
  bilateral('vas_deferens', 'vas_deferens', tidy(mergeGeoms([g, cuff]), 0.010), out);
  return out;
}

// ---------------------------------------------------------------------------
// Seminal vesicle — a coiled tube, not a sac
// ---------------------------------------------------------------------------
function coilPath(centre, radii, turns, droop) {
  const pts = [];
  const n = 54;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ang = t * turns * Math.PI * 2;
    const taper = 1 - 0.30 * Math.abs(1 - 2 * t);
    const y = centre[1] + radii[1] * (1 - 2 * t);
    pts.push([
      centre[0] + taper * radii[0] * Math.cos(ang),
      y + droop * Math.sin(t * Math.PI),
      centre[2] + taper * radii[2] * Math.sin(ang + 0.4),
    ]);
  }
  return pts;
}

function buildVesicles(q) {
  const out = [];
  const c = [0.0196, 0.8680, -0.0060];
  const path = coilPath(c, [0.0088, 0.0150, 0.0072], 3.4, -0.004);
  const g = tube('seminal_vesicle', path, [0.0034, 0.0026], q, {
    radial: q === 'high' ? 8 : 6, rings: q === 'high' ? 54 : 30, samples: q === 'high' ? 60 : 34,
  });
  // Diverticula: two short buds off the upper coil.
  const buds = [];
  for (let i = 0; i < 2; i++) {
    const b = [
      [c[0] + 0.006, c[1] + 0.008 - i * 0.006, c[2] + 0.004 + i * 0.004],
      [c[0] + 0.013, c[1] + 0.012 - i * 0.007, c[2] + 0.001 + i * 0.005],
      [c[0] + 0.017, c[1] + 0.006 - i * 0.008, c[2] - 0.004 + i * 0.005],
    ];
    buds.push(tube(`vesicle_diverticulum_${i}`, b, [0.0026, 0.0019], q, { radial: 6, rings: 10, noise: false }));
  }
  // Ejaculatory duct: the short common stalk to the prostate.
  const stalk = tube('ejaculatory_duct', [
    [c[0] - 0.002, c[1] - 0.0160, c[2] + 0.004],
    [0.0120, 0.8560, 0.0040],
    [0.0092, 0.8485, 0.0140],
  ], [0.0020, 0.0016], q, { radial: 6, rings: 10, noise: false });
  bilateral('seminal_vesicle', 'seminal_vesicle', tidy(mergeGeoms([g, ...buds, stalk]), 0.012), out);
  return out;
}

// ---------------------------------------------------------------------------
// Prostate — two lobes with the urethra carved through them
// ---------------------------------------------------------------------------
function prostateField() {
  const c = [0, 0.8455, 0.0285];
  return (p) => {
    const l = off(p, c);
    const lx = Math.abs(l[0]);
    // Right / left lobes, wider across than tall, apex pointing down-forward.
    let d = sdEllipsoid([lx - 0.0095, l[1], l[2]], [0.0120, 0.0112, 0.0122]);
    d = smin(d, sdEllipsoid([lx - 0.0020, l[1] - 0.002, l[2] + 0.001], [0.0130, 0.0120, 0.0130]), 0.006);
    // Base above, apex infero-anteriorly.
    d = smin(d, sdCapsule(l, [0, 0.0080, 0.0010], [0, -0.0128, 0.0060], 0.0072), 0.006);
    d = Math.min(d, sdEllipsoid([lx - 0.0060, l[1] + 0.0090, l[2] - 0.0030], [0.0100, 0.0050, 0.0100]));
    // Flatten the posterior (bladder-facing) surface.
    d = Math.max(d, -0.0100 - l[2]);
    // Carve the prostatic urethra running through it.
    const urethra = sdCapsule(l, [0, 0.0170, 0.0005], [0, -0.0160, 0.0075], 0.0042);
    d = ssub(urethra, d, 0.003);
    return d;
  };
}

function buildProstate(q) {
  const out = [];
  const lo = [-0.030, 0.822, 0.006];
  const hi = [0.030, 0.872, 0.052];
  let g = solid(prostateField(), lo, hi, [40, 34, 36], q);
  g = displace(g, (x, y, z) => 0.0004 * fbm(x * 130, y * 130, z * 130, 2));
  out.push(part('prostate', 'shukra', 'prostate', tidy(g, 0.012), { parts: ['prostate'] }));

  // Bulbourethral (Cowper) glands: two pea-sized bodies at the membranous urethra.
  const bg = solid((p) => {
    const lx = Math.abs(p[0]);
    return Math.min(
      sdEllipsoid([lx - 0.0058, p[1] - 0.8270, p[2] - 0.0325], [0.0042, 0.0040, 0.0044]),
      sdCapsule([lx - 0.0058, p[1] - 0.8270, p[2] - 0.0325], [0, 0, 0], [0.0040, -0.0010, 0.0035], 0.0026),
    );
  }, [-0.020, 0.815, 0.020], [0.020, 0.842, 0.048], [22, 20, 20], q);
  bilateral('bulbourethral_gland', 'prostate', tidy(bg, 0.012), out);
  return out;
}

// ---------------------------------------------------------------------------
export function buildShukra(quality) {
  const q = quality === 'lite' ? 'lite' : 'high';
  return [
    ...buildTestes(q),
    ...buildVasa(q),
    ...buildVesicles(q),
    ...buildProstate(q),
  ];
}
