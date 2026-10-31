// Explore3D Body Frame — one source of truth for the outer body form, per segment.
//
// Every segment carries a centerline + elliptic section table. The SAME table drives
//   (a) an analytic distance field  -> used to clip and to test containment, and
//   (b) a lofted surface            -> the shell / fat / muscle-envelope geometry.
// Deeper layers are inward offsets of the table, so "every internal layer sits inside
// the skin shell with >= 5 mm margin" holds by construction and is re-tested
// numerically against the real skeleton meshes by verify-explore-body.mjs.
//
// Frame: metres, Y up, anterior +Z, anatomical LEFT +X. Skeleton stature 1.72 m
// (cranium top 1.720, soles 0.0078). Skin apex 1.7335, sole surface 0.0035.
//
// Section rows are [t, [rx, rz, o]]:
//   rx = half-width along the segment's refW axis (usually anatomical X)
//   rz = half-depth along the segment's refD axis (usually anatomical Z, or Y for feet)
//   o  = section centre offset along refD (positive = anterior for the trunk/limbs)
// Tables were fitted to the measured per-band silhouette of the existing skeleton
// (see PROGRESS-explore.md), so the shell provably contains every bone.

import * as THREE from 'three';
import { SPINE_VERTEBRA_CONFIG as SPINE_CFG } from '../constants.js';
import { sdRoundedBox, sdEllipsoid } from '../sdf-mesh.js';

export const SKIN_TOP_Y = 1.7335;
export const SKIN_BOTTOM_Y = 0.0035;

// ---------------------------------------------------------------------------
// Landmarks harvested from the existing skeleton generators (not re-derived).
// ---------------------------------------------------------------------------
export const LM = {
  chin: [0, 1.496, 0.082],
  sternalNotch: [0, 1.393, 0.118],
  acromionL: [0.168, 1.408, 0.078],
  shoulderL: [0.180, 1.376, 0.042],
  elbowL: [0.238, 1.088, 0.014],
  wristL: [0.256, 0.833, 0.013],
  mcpL: [0.262, 0.792, 0.013],
  fingertipL: [0.262, 0.654, 0.020],
  iliacCrestL: [0.130, 1.005, -0.005],
  asisL: [0.112, 0.985, 0.062],
  hipL: [0.092, 0.895, 0.028],
  kneeL: [0.095, 0.495, 0.015],
  ankleL: [0.082, 0.070, 0.012],
  heelL: [0.085, 0.036, -0.040],
  toeTipL: [0.085, 0.016, 0.192],
  pubicSymphysis: [0, 0.869, 0.052],
  xiphoid: [0, 1.218, 0.128],
  umbilicus: [0, 1.010, 0.128],
};

const AX_X = [1, 0, 0];
const AX_Y = [0, 1, 0];
const AX_Z = [0, 0, 1];

// ---------------------------------------------------------------------------
// Small math helpers
// ---------------------------------------------------------------------------
export function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a || 1e-6)));
  return t * t * (3 - 2 * t);
}

export function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

export function lerpPairs(table, key) {
  if (key <= table[0][0]) return table[0][1].slice();
  const last = table[table.length - 1];
  if (key >= last[0]) return last[1].slice();
  for (let i = 0; i < table.length - 1; i++) {
    const [k0, v0] = table[i];
    const [k1, v1] = table[i + 1];
    if (key <= k1) {
      const e = smoothstep(0, 1, (key - k0) / (k1 - k0 || 1e-6));
      return v0.map((v, j) => v + (v1[j] - v) * e);
    }
  }
  return last[1].slice();
}

export function mirrorPoint(p) {
  return [-p[0], p[1], p[2]];
}

function hash3(i, j, k) {
  let n = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1103515245);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return ((n >>> 0) / 4294967295) * 2 - 1;
}

export function valueNoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smoothstep(0, 1, x - xi), yf = smoothstep(0, 1, y - yi), zf = smoothstep(0, 1, z - zi);
  let acc = 0;
  for (let dz = 0; dz <= 1; dz++) {
    for (let dy = 0; dy <= 1; dy++) {
      for (let dx = 0; dx <= 1; dx++) {
        const w = (dx ? xf : 1 - xf) * (dy ? yf : 1 - yf) * (dz ? zf : 1 - zf);
        acc += w * hash3(xi + dx, yi + dy, zi + dz);
      }
    }
  }
  return acc;
}

export function fbm(x, y, z, octaves = 3) {
  let sum = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.17;
  }
  return sum / norm;
}

const V = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Section tables — fitted to the measured skeleton silhouette (+5 mm margin).
// ---------------------------------------------------------------------------

const TRUNK_PATH = [
  [0, 0.726, -0.012], [0, 0.790, -0.008], [0, 0.845, -0.006], [0, 0.900, -0.002],
  [0, 0.965, 0.000], [0, 1.030, 0.002], [0, 1.090, 0.004], [0, 1.160, 0.006],
  [0, 1.220, 0.010], [0, 1.270, 0.012], [0, 1.320, 0.010], [0, 1.372, 0.004],
  [0, 1.408, -0.002], [0, 1.436, -0.006],
];
const TRUNK_SECTIONS = [
  [0.000, [0.104, 0.098, -0.006]], // buttock / perineal root
  [0.085, [0.128, 0.106, -0.004]],
  [0.170, [0.152, 0.114, 0.002]],
  [0.255, [0.158, 0.118, 0.006]],
  [0.340, [0.152, 0.114, 0.008]],
  [0.425, [0.140, 0.108, 0.010]],
  [0.510, [0.132, 0.104, 0.012]],
  [0.595, [0.146, 0.112, 0.018]],
  [0.680, [0.152, 0.116, 0.024]],
  [0.765, [0.158, 0.118, 0.028]],
  [0.840, [0.152, 0.116, 0.030]],
  [0.910, [0.146, 0.112, 0.030]],
  [0.955, [0.190, 0.130, 0.026]], // shoulder plateau
  [0.980, [0.182, 0.124, 0.022]],
  [1.000, [0.070, 0.066, 0.004]], // into the neck
];

const NECK_PATH = [[0, 1.418, -0.006], [0, 1.452, 0.000], [0, 1.482, 0.004]];
const NECK_SECTIONS = [
  [0, [0.072, 0.064, 0.004]],
  [0.5, [0.052, 0.050, 0.006]],
  [1, [0.048, 0.048, 0.006]],
];

const HEAD_PATH = [
  [0, 1.486, 0.014], [0, 1.530, 0.010], [0, 1.590, 0.002], [0, 1.650, -0.010], [0, 1.712, -0.014],
];
const HEAD_SECTIONS = [
  [0.00, [0.064, 0.093, 0.010]],
  [0.17, [0.091, 0.150, 0.013]],
  [0.42, [0.095, 0.141, -0.008]],
  [0.65, [0.086, 0.129, -0.013]],
  [0.85, [0.076, 0.097, -0.017]],
  [1.00, [0.053, 0.070, -0.010]],
];

const SHOULDER_PATH_L = [[0.138, 1.350, -0.012], [0.168, 1.392, -0.032], [0.180, 1.424, -0.058]];
const SHOULDER_SECTIONS = [
  [0, [0.054, 0.060, 0]],
  [0.5, [0.050, 0.056, 0]],
  [1, [0.038, 0.045, 0]],
];

const ARM_PATH = [LM.shoulderL, [0.206, 1.290, 0.030], [0.216, 1.210, 0.022], LM.elbowL];
const ARM_SECTIONS = [
  [0, [0.0530, 0.0510, 0]],
  [0.20, [0.0465, 0.0450, 0]],
  [0.62, [0.0380, 0.0365, 0]],
  [0.90, [0.0310, 0.0300, 0]],
  [1, [0.0300, 0.0290, 0]],
];

const FOREARM_PATH = [LM.elbowL, [0.246, 1.030, 0.014], [0.250, 0.940, 0.014], LM.wristL];
const FOREARM_SECTIONS = [
  [0, [0.0330, 0.0330, 0]],
  [0.18, [0.0370, 0.0350, 0]],
  [0.70, [0.0285, 0.0255, 0]],
  [1, [0.0225, 0.0220, 0]],
];

const PALM_PATH_L = [[0.254, 0.833, 0.017], [0.257, 0.790, 0.018], [0.259, 0.748, 0.017]];
const PALM_SECTIONS = [
  [0, [0.0285, 0.0205, 0]],
  [0.5, [0.0300, 0.0225, 0]],
  [1, [0.0300, 0.0215, 0]],
];

const THIGH_PATH = [LM.hipL, [0.101, 0.830, 0.022], [0.104, 0.720, 0.018], [0.098, 0.590, 0.016], LM.kneeL];
const THIGH_SECTIONS = [
  [0, [0.0640, 0.0680, 0]],
  [0.18, [0.0680, 0.0715, 0]],
  [0.45, [0.0610, 0.0650, 0]],
  [0.75, [0.0520, 0.0550, 0]],
  [1, [0.0440, 0.0460, 0]],
];

const LEG_PATH = [LM.kneeL, [0.091, 0.440, 0.013], [0.088, 0.360, 0.010], [0.085, 0.240, 0.012], LM.ankleL];
const LEG_SECTIONS = [
  [0, [0.0460, 0.0450, 0]],
  [0.20, [0.0455, 0.0500, 0]],
  [0.45, [0.0405, 0.0475, 0]],
  [0.72, [0.0330, 0.0340, 0]],
  [1, [0.0285, 0.0305, 0]],
];

const FOOT_PATH_L = [[0.085, 0.033, -0.048], [0.085, 0.030, 0.020], [0.085, 0.026, 0.100], [0.085, 0.024, 0.160]];
const FOOT_SECTIONS = [
  [0, [0.0300, 0.0330, 0]],        // heel (rz is vertical here)
  [0.30, [0.0320, 0.0400, 0]],
  [0.62, [0.0360, 0.0330, 0]],
  [1, [0.0360, 0.0320, 0]],
];

// ---------------------------------------------------------------------------
// Digit chains. Bone coordinates are transcribed from the existing skeleton
// generators, and the soft-tissue path follows the bone axis so the shell
// provably wraps carpals, metacarpals, phalanges, tarsals, metatarsals and toes.
// ---------------------------------------------------------------------------
export const FINGERS = [
  {
    name: '1', side: 'thumb',
    bone: [[0.274, 0.806, 0.015], [0.292, 0.772, 0.026], [0.300, 0.754, 0.030], [0.308, 0.736, 0.034]],
    path: [[0.274, 0.806, 0.016], [0.292, 0.772, 0.026], [0.301, 0.752, 0.031], [0.311, 0.731, 0.036]],
    sections: [[0, [0.0140, 0.0135, 0]], [0.45, [0.0130, 0.0125, 0]], [1, [0.0115, 0.0112, 0]]],
  },
  {
    name: '2',
    bone: [[0.262, 0.7405, 0.012], [0.262, 0.7165, 0.014], [0.262, 0.6985, 0.018], [0.262, 0.6865, 0.024]],
    path: [[0.262, 0.7445, 0.0125], [0.262, 0.7160, 0.0140], [0.262, 0.6970, 0.0185], [0.262, 0.6810, 0.0235]],
    sections: [[0, [0.0098, 0.0140, 0]], [0.45, [0.0092, 0.0135, 0]], [1, [0.0076, 0.0115, 0]]],
  },
  {
    name: '3',
    bone: [[0.257, 0.7376, 0.012], [0.257, 0.7136, 0.014], [0.257, 0.6956, 0.018], [0.257, 0.6836, 0.024]],
    path: [[0.257, 0.7415, 0.0125], [0.257, 0.7130, 0.0140], [0.257, 0.6940, 0.0185], [0.257, 0.6775, 0.0235]],
    sections: [[0, [0.0098, 0.0140, 0]], [0.45, [0.0092, 0.0135, 0]], [1, [0.0076, 0.0115, 0]]],
  },
  {
    name: '4',
    bone: [[0.252, 0.7372, 0.012], [0.252, 0.7132, 0.014], [0.252, 0.6952, 0.018], [0.252, 0.6832, 0.024]],
    path: [[0.252, 0.7410, 0.0125], [0.252, 0.7125, 0.0140], [0.252, 0.6935, 0.0185], [0.252, 0.6795, 0.0235]],
    sections: [[0, [0.0095, 0.0135, 0]], [0.45, [0.0090, 0.0132, 0]], [1, [0.0074, 0.0112, 0]]],
  },
  {
    name: '5',
    bone: [[0.247, 0.7396, 0.012], [0.247, 0.7186, 0.014], [0.247, 0.7046, 0.018], [0.247, 0.6956, 0.024]],
    path: [[0.247, 0.7430, 0.0125], [0.247, 0.7180, 0.0140], [0.247, 0.7030, 0.0185], [0.247, 0.6905, 0.0235]],
    sections: [[0, [0.0090, 0.0130, 0]], [0.45, [0.0085, 0.0126, 0]], [1, [0.0070, 0.0106, 0]]],
  },
];

export const TOES = [
  {
    name: '1',
    bone: [[0.058, 0.016, 0.1384], [0.058, 0.015, 0.1550], [0.058, 0.014, 0.1745]],
    path: [[0.058, 0.019, 0.130], [0.058, 0.0155, 0.155], [0.058, 0.0145, 0.176]],
    sections: [[0, [0.0110, 0.0125, 0]], [0.5, [0.0100, 0.0118, 0]], [1, [0.0080, 0.0098, 0]]],
  },
  {
    name: '2',
    bone: [[0.071, 0.0145, 0.1445], [0.071, 0.014, 0.1590], [0.071, 0.013, 0.1700], [0.071, 0.012, 0.1845]],
    path: [[0.071, 0.018, 0.138], [0.071, 0.0145, 0.162], [0.071, 0.0135, 0.181]],
    sections: [[0, [0.0090, 0.0115, 0]], [0.5, [0.0082, 0.0108, 0]], [1, [0.0062, 0.0082, 0]]],
  },
  {
    name: '3',
    bone: [[0.084, 0.0145, 0.1385], [0.084, 0.014, 0.1510], [0.084, 0.013, 0.1600], [0.084, 0.012, 0.1785]],
    path: [[0.084, 0.018, 0.132], [0.084, 0.0145, 0.156], [0.084, 0.0135, 0.175]],
    sections: [[0, [0.0088, 0.0112, 0]], [0.5, [0.0080, 0.0105, 0]], [1, [0.0060, 0.0080, 0]]],
  },
  {
    name: '4',
    bone: [[0.097, 0.0145, 0.1325], [0.097, 0.014, 0.1420], [0.097, 0.013, 0.1490], [0.097, 0.012, 0.1725]],
    path: [[0.097, 0.018, 0.126], [0.097, 0.0145, 0.150], [0.097, 0.0135, 0.167]],
    sections: [[0, [0.0082, 0.0106, 0]], [0.5, [0.0075, 0.0100, 0]], [1, [0.0056, 0.0076, 0]]],
  },
  {
    name: '5',
    bone: [[0.110, 0.0145, 0.1265], [0.110, 0.014, 0.1340], [0.110, 0.013, 0.1400], [0.110, 0.012, 0.1665]],
    path: [[0.110, 0.018, 0.120], [0.110, 0.0145, 0.142], [0.110, 0.0135, 0.159]],
    sections: [[0, [0.0078, 0.0100, 0]], [0.5, [0.0071, 0.0095, 0]], [1, [0.0053, 0.0072, 0]]],
  },
];

// ---------------------------------------------------------------------------
// TubeField: elliptic tube along a centerline, with an anatomically fixed
// cross-section frame (refW / refD) and ellipsoidal rounded ends.
// ---------------------------------------------------------------------------
export class TubeField {
  constructor(path, sections, opts = {}) {
    const { samples = 22, inflate = 0, refW = AX_X, refD = AX_Z, capScale = [1, 1] } = opts;
    this.curve = new THREE.CatmullRomCurve3(path.map((q) => new THREE.Vector3(...q)), false, 'catmullrom', 0.5);
    const total = this.curve.getLength();
    const n = Math.max(4, samples);
    this.samples = [];
    this.box = new THREE.Box3();
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const c = this.curve.getPointAt(t);
      const tg = this.curve.getTangentAt(t).normalize();
      const ta = [tg.x, tg.y, tg.z];
      const u = ortho(refW, ta, AX_X);
      let v = ortho(refD, ta, AX_Z);
      // make v exactly perpendicular to u (t is already perpendicular to both)
      v = [v[0] - u[0] * dot(u, v), v[1] - u[1] * dot(u, v), v[2] - u[2] * dot(u, v)];
      let vl = Math.hypot(v[0], v[1], v[2]);
      if (vl < 1e-9) { v = cross(ta, u); vl = Math.hypot(v[0], v[1], v[2]) || 1; }
      v = [v[0] / vl, v[1] / vl, v[2] / vl];
      if (dot(v, refD) < 0) v = [-v[0], -v[1], -v[2]];
      const [rx, rz, o] = lerpPairs(sections, t);
      const s = {
        c: [c.x, c.y, c.z],
        t: ta,
        u, v,
        rx: rx + inflate, rz: rz + inflate, o: (o || 0) + inflate,
        half: (total / n) * 0.80,
      };
      const cs = i === 0 ? capScale[0] : i === n ? capScale[1] : 1;
      s.rCap = Math.max(s.rx, s.rz) * cs;
      this.samples.push(s);
      const rmax = Math.max(s.rx, s.rz, s.rCap) + Math.abs(s.o);
      this.box.expandByPoint(V.set(s.c[0] + rmax, s.c[1] + rmax, s.c[2] + rmax));
      this.box.expandByPoint(V.set(s.c[0] - rmax, s.c[1] - rmax, s.c[2] - rmax));
    }
    this.path = path;
    this.sections = sections;
    this.refW = refW;
    this.refD = refD;
  }

  frameAt(t) {
    const f = clamp(t, 0, 1) * (this.samples.length - 1);
    const i0 = Math.floor(f);
    const i1 = Math.min(this.samples.length - 1, i0 + 1);
    const e = f - i0;
    const a = this.samples[i0], b = this.samples[i1];
    const mix = (k) => [
      a[k][0] + (b[k][0] - a[k][0]) * e,
      a[k][1] + (b[k][1] - a[k][1]) * e,
      a[k][2] + (b[k][2] - a[k][2]) * e,
    ];
    const u = norm3(mix('u')), v = norm3(mix('v')), c = mix('c'), tg = norm3(mix('t'));
    const [rx, rz, o] = lerpPairs(this.sections, t);
    return {
      c, u, v, t: tg,
      rx: rx + (i0 === 0 ? 0 : 0), rz, o: o || 0,
      rCap: a.rCap + (b.rCap - a.rCap) * e,
      half: a.half + (b.half - a.half) * e,
    };
  }

  distance(p) {
    let best = Infinity;
    const N = this.samples.length;
    for (let i = 0; i < N; i++) {
      const s = this.samples[i];
      const qx = p[0] - s.c[0], qy = p[1] - s.c[1], qz = p[2] - s.c[2];
      const a = qx * s.t[0] + qy * s.t[1] + qz * s.t[2];
      const bu = qx * s.u[0] + qy * s.u[1] + qz * s.u[2];
      const bv = qx * s.v[0] + qy * s.v[1] + qz * s.v[2] - s.o;
      const rx = Math.max(0.0004, s.rx), rz = Math.max(0.0004, s.rz);
      const rCap = Math.max(0.0004, s.rCap);
      const scale = Math.min(rx, rz);
      let d;
      if (i === 0 || i === N - 1) {
        // ellipsoidal dome past the tube ends
        const over = i === 0 ? Math.max(0, -a) : Math.max(0, a);
        const along = i === 0 ? Math.min(0, a) : Math.min(a, s.half);
        const kr = Math.hypot(bu / rx, bv / rz, over / rCap);
        const dome = (kr - 1) * scale;
        const radial = (Math.hypot(bu / rx, bv / rz) - 1) * scale;
        const axial = Math.abs(along) - s.half;
        const tube = axial <= 0 ? radial : Math.max(radial, axial);
        d = over > 0 ? Math.min(tube, dome) : tube;
      } else {
        const radial = (Math.hypot(bu / rx, bv / rz) - 1) * scale;
        const axial = Math.abs(a) - s.half;
        d = axial <= 0 ? radial : Math.max(radial, axial);
      }
      if (d < best) best = d;
    }
    return best;
  }

  inward(p, out) {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < this.samples.length; i++) {
      const s = this.samples[i];
      const qx = p[0] - s.c[0], qy = p[1] - s.c[1], qz = p[2] - s.c[2];
      const d2 = qx * qx + qy * qy + qz * qz;
      if (d2 < bd) { bd = d2; bi = i; }
    }
    const s = this.samples[bi];
    const N = this.samples.length;
    const qx = p[0] - s.c[0], qy = p[1] - s.c[1], qz = p[2] - s.c[2];
    const a = qx * s.t[0] + qy * s.t[1] + qz * s.t[2];
    const bu = qx * s.u[0] + qy * s.u[1] + qz * s.u[2];
    const bv = qx * s.v[0] + qy * s.v[1] + qz * s.v[2] - s.o;
    // Tapered end sections can reach radius 0; surfacePoint floors them to 0.0004,
    // so inward() must use the same floor or the gradient becomes 0/0 -> NaN.
    const rx = Math.max(0.0004, s.rx), rz = Math.max(0.0004, s.rz);
    const rCap = Math.max(0.0004, s.rCap);
    const scale = Math.min(rx, rz);
    const k = Math.hypot(bu / rx, bv / rz) || 1e-9;
    let gu = (bu / (rx * rx)) / k * scale;
    let gv = (bv / (rz * rz)) / k * scale;
    let at = 0;
    if (bi === 0 || bi === N - 1) {
      const over = bi === 0 ? Math.max(0, -a) : Math.max(0, a);
      if (over > 0) {
        const kd = Math.hypot(bu / rx, bv / rz, over / rCap) || 1e-9;
        gu = (bu / (rx * rx)) / kd * scale;
        gv = (bv / (rz * rz)) / kd * scale;
        at = ((over / (rCap * rCap)) / kd) * scale * (bi === 0 ? -1 : 1);
      }
    }
    const wx = -(gu * s.u[0] + gv * s.v[0] + at * s.t[0]);
    const wy = -(gu * s.u[1] + gv * s.v[1] + at * s.t[1]);
    const wz = -(gu * s.u[2] + gv * s.v[2] + at * s.t[2]);
    const len = Math.hypot(wx, wy, wz);
    if (len < 1e-9) {
      out[0] = s.c[0] - p[0]; out[1] = s.c[1] - p[1]; out[2] = s.c[2] - p[2];
      const l2 = Math.hypot(out[0], out[1], out[2]);
      if (l2 < 1e-9) { out[0] = 0; out[1] = -1; out[2] = 0; } else { out[0] /= l2; out[1] /= l2; out[2] /= l2; }
      return out;
    }
    out[0] = wx / len; out[1] = wy / len; out[2] = wz / len;
    return out;
  }

  /** Surface point at (t, angle); `inset` shrinks every semi-axis (nested ellipsoids). */
  surfacePoint(t, angle, inset = 0) {
    const s = this.frameAt(t);
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const rx = Math.max(0.0004, s.rx - inset), rz = Math.max(0.0004, s.rz - inset);
    const off = Math.max(-s.rz + 0.0004, s.o - inset * Math.sign(s.o || 1));
    return [
      s.c[0] + s.u[0] * ca * rx + s.v[0] * (sa * rz + off),
      s.c[1] + s.u[1] * ca * rx + s.v[1] * (sa * rz + off),
      s.c[2] + s.u[2] * ca * rx + s.v[2] * (sa * rz + off),
    ];
  }
}

function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function norm3(a) {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
function ortho(ref, t, fallback) {
  let v = [ref[0] - t[0] * dot(ref, t), ref[1] - t[1] * dot(ref, t), ref[2] - t[2] * dot(ref, t)];
  if (Math.hypot(v[0], v[1], v[2]) < 1e-6) {
    v = [fallback[0] - t[0] * dot(fallback, t), fallback[1] - t[1] * dot(fallback, t), fallback[2] - t[2] * dot(fallback, t)];
  }
  return norm3(v);
}

class MirroredField {
  constructor(base) {
    this.base = base;
    this.refW = [-base.refW[0], base.refW[1], base.refW[2]];
    this.refD = [-base.refD[0], base.refD[1], base.refD[2]];
    this.box = new THREE.Box3(
      new THREE.Vector3(-base.box.max.x, base.box.min.y, base.box.min.z),
      new THREE.Vector3(-base.box.min.x, base.box.max.y, base.box.max.z),
    );
  }
  get samples() { return this.base.samples; }
  get path() { return this.base.path.map(mirrorPoint); }
  get sections() { return this.base.sections; }
  distance(p) { return this.base.distance([-p[0], p[1], p[2]]); }
  frameAt(t) {
    const s = this.base.frameAt(t);
    const mg = (v) => [-v[0], v[1], v[2]];
    return {
      c: mg(s.c), u: mg(s.u), v: mg(s.v), t: mg(s.t),
      rx: s.rx, rz: s.rz, o: s.o, rCap: s.rCap, half: s.half,
    };
  }
  inward(p, out) {
    this.base.inward([-p[0], p[1], p[2]], out);
    out[0] = -out[0];
    return out;
  }
  surfacePoint(t, angle, inset = 0) {
    const q = this.base.surfacePoint(t, angle, inset);
    return [-q[0], q[1], q[2]];
  }
}

const mirroredCache = new Map();
export function mirroredField(base) {
  if (!mirroredCache.has(base)) mirroredCache.set(base, new MirroredField(base));
  return mirroredCache.get(base);
}

// ---------------------------------------------------------------------------
// Segment catalogue. `side: 'L'` segments are mirrored to build the right side.
// ---------------------------------------------------------------------------
export const SEGMENTS = [
  { id: 'trunk', field: new TubeField(TRUNK_PATH, TRUNK_SECTIONS, { samples: 40 }), cap: 1 },
  { id: 'neck', field: new TubeField(NECK_PATH, NECK_SECTIONS, { samples: 12 }), cap: 1 },
  { id: 'head', field: new TubeField(HEAD_PATH, HEAD_SECTIONS, { samples: 24, capScale: [1.0, 0.32] }) },
  { id: 'shoulder', side: 'L', field: new TubeField(SHOULDER_PATH_L, SHOULDER_SECTIONS, { samples: 14 }) },
  { id: 'arm', side: 'L', field: new TubeField(ARM_PATH, ARM_SECTIONS, { samples: 20 }) },
  { id: 'forearm', side: 'L', field: new TubeField(FOREARM_PATH, FOREARM_SECTIONS, { samples: 18 }) },
  { id: 'palm', side: 'L', field: new TubeField(PALM_PATH_L, PALM_SECTIONS, { samples: 10 }) },
  { id: 'thigh', side: 'L', field: new TubeField(THIGH_PATH, THIGH_SECTIONS, { samples: 24 }) },
  { id: 'leg', side: 'L', field: new TubeField(LEG_PATH, LEG_SECTIONS, { samples: 20 }) },
  { id: 'foot', side: 'L', field: new TubeField(FOOT_PATH_L, FOOT_SECTIONS, { samples: 16, refD: AX_Y }) },
];

for (const f of FINGERS) {
  SEGMENTS.push({
    id: `finger_${f.name}`, side: 'L',
    field: new TubeField(f.path, f.sections, { samples: 14 }),
  });
}
for (const t of TOES) {
  SEGMENTS.push({
    id: `toe_${t.name}`, side: 'L',
    field: new TubeField(t.path, t.sections, { samples: 10, refD: AX_Y }),
  });
}

export function segmentKey(seg) {
  return seg.side ? `${seg.id}_${seg.side}` : seg.id;
}

let FIELDS = null;
function buildFields() {
  const out = [];
  for (const seg of SEGMENTS) {
    out.push({ key: segmentKey(seg), seg, field: seg.field });
    if (seg.side === 'L') out.push({ key: `${seg.id}_R`, seg, field: mirroredField(seg.field) });
  }
  return out;
}
export function fields() {
  if (!FIELDS) FIELDS = buildFields();
  return FIELDS;
}

/** Master outer body surface: < 0 inside the body. */
export function bodyForm(p) {
  let d = Infinity;
  const fs = fields();
  for (let i = 0; i < fs.length; i++) {
    const b = fs[i].field.box;
    if (p[0] < b.min.x || p[0] > b.max.x || p[1] < b.min.y || p[1] > b.max.y || p[2] < b.min.z || p[2] > b.max.z) continue;
    const q = fs[i].field.distance(p);
    if (q < d) d = q;
  }
  return d;
}

/** Is the point at least `margin` metres inside the shell (any segment)? */
export function insideShellWithMargin(p, margin = 0.005) {
  const fs = fields();
  for (let i = 0; i < fs.length; i++) {
    const f = fs[i].field;
    const b = f.box;
    if (p[0] < b.min.x - margin || p[0] > b.max.x + margin || p[1] < b.min.y - margin || p[1] > b.max.y + margin
      || p[2] < b.min.z - margin || p[2] > b.max.z + margin) continue;
    if (f.distance(p) < -margin) return true;
  }
  return false;
}

/** Nearest body-form field to p (used as the clipping direction). */
export function nearestField(p) {
  let best = null, bd = Infinity;
  const fs = fields();
  for (let i = 0; i < fs.length; i++) {
    const b = fs[i].field.box;
    const dx = p[0] - clamp(p[0], b.min.x, b.max.x);
    const dy = p[1] - clamp(p[1], b.min.y, b.max.y);
    const dz = p[2] - clamp(p[2], b.min.z, b.max.z);
    const dd = dx * dx + dy * dy + dz * dz;
    if (dd < bd) { bd = dd; best = fs[i]; }
  }
  return best;
}

/**
 * Unit inward direction of the shell at p, taken from the gradient of bodyForm.
 * Prefer this over TubeField.inward when clipping geometry: the analytic version
 * divides by the loft radius, which reaches zero at the end caps and returns NaN.
 */
export function bodyInward(p, out) {
  const h = 0.0012;
  const gx = bodyForm([p[0] + h, p[1], p[2]]) - bodyForm([p[0] - h, p[1], p[2]]);
  const gy = bodyForm([p[0], p[1] + h, p[2]]) - bodyForm([p[0], p[1] - h, p[2]]);
  const gz = bodyForm([p[0], p[1], p[2] + h]) - bodyForm([p[0], p[1], p[2] - h]);
  const l = Math.hypot(gx, gy, gz);
  if (Number.isFinite(l) && l > 1e-9) {
    out[0] = -gx / l; out[1] = -gy / l; out[2] = -gz / l;
    return out;
  }
  const f = nearestField(p);
  if (!f) { out[0] = 0; out[1] = 0; out[2] = -1; return out; }
  const b = f.field.box;
  out[0] = (b.min.x + b.max.x) * 0.5 - p[0];
  out[1] = (b.min.y + b.max.y) * 0.5 - p[1];
  out[2] = (b.min.z + b.max.z) * 0.5 - p[2];
  const l2 = Math.hypot(out[0], out[1], out[2]) || 1;
  out[0] /= l2; out[1] /= l2; out[2] /= l2;
  return out;
}

// ---------------------------------------------------------------------------
// Adipose thickness map — thin distally, thick at abdomen, hips, thighs, nape.
// ---------------------------------------------------------------------------
export function fatThicknessAt(p) {
  const y = p[1], x = p[0], z = p[2];
  const ax = Math.abs(x);
  let base;
  if (y > 1.50) base = 0.0060;            // head / face
  else if (y > 1.44) base = 0.0072;       // neck
  else if (y > 1.34) base = 0.0105;       // shoulder girdle
  else if (y > 1.10) base = 0.0135;       // chest
  else if (y > 0.80) base = 0.0195;       // abdomen + hips
  else if (y > 0.52) base = 0.0180;       // thigh
  else if (y > 0.20) base = 0.0115;       // calf
  else base = 0.0064;                     // foot / ankle

  if (y > 1.40 && y < 1.49 && z < -0.010) base = Math.max(base, 0.0175);        // nape pad
  if (y > 0.76 && y < 0.96 && z < -0.045 && ax > 0.020) base = Math.max(base, 0.0265); // gluteal pad
  if (y > 0.84 && y < 1.16 && z > 0.055) base = Math.max(base, 0.0215);         // anterior abdomen
  if (y > 0.56 && y < 0.86 && ax > 0.045 && z < -0.028) base = Math.max(base, 0.0195); // posteriomedial thigh
  if (y < 1.06 && ax > 0.170) base = Math.min(base, 0.0090);                    // lean forearm
  if (y < 0.80 && ax > 0.230) base = Math.min(base, 0.0054);                    // hand
  if (y < 0.22) base = Math.min(base, 0.0060);                                  // foot
  return base;
}

export const FASCIA_GAP = 0.0038;

/** Envelope the muscle bellies must stay inside (value < 0 means inside). */
export function muscleEnvelope(p) {
  return bodyForm(p) + fatThicknessAt(p) + FASCIA_GAP;
}

/** Envelope the deep viscera must stay inside (fat + muscle cover). */
export function visceraEnvelope(p) {
  return bodyForm(p) + fatThicknessAt(p) + 0.028;
}

/**
 * Signed distance to the skin silhouette, in metres. The shell is lofted on the
 * zero level set of bodyForm, so that surface IS the skin: subcutaneous fat lies
 * BENEATH it, not outside it.
 *
 * Unlike bodyForm() this searches segment boxes padded by SKIN_SEARCH_PAD, so a
 * vertex that happens to fall between two boxes gets a real number instead of
 * Infinity — the containment assertions need a comparable value for every vertex.
 */
export const SKIN_SEARCH_PAD = 0.06;

export function skinSurfaceDistance(p) {
  let d = Infinity;
  const fs = fields();
  for (let i = 0; i < fs.length; i++) {
    const b = fs[i].field.box;
    if (p[0] < b.min.x - SKIN_SEARCH_PAD || p[0] > b.max.x + SKIN_SEARCH_PAD
      || p[1] < b.min.y - SKIN_SEARCH_PAD || p[1] > b.max.y + SKIN_SEARCH_PAD
      || p[2] < b.min.z - SKIN_SEARCH_PAD || p[2] > b.max.z + SKIN_SEARCH_PAD) continue;
    const q = fs[i].field.distance(p);
    if (q < d) d = q;
  }
  return d; // Infinity = further than the pad from every segment: outside the body
}

/** Unit inward direction of the skin at p. */
export function skinInward(p, out) {
  return bodyInward(p, out);
}

// ---------------------------------------------------------------------------
// Bone approximations. Long bones are transcribed from the existing skeleton
// generators as tapered capsules; the muscle layer is pushed OUT of them (so it
// wraps bone without penetrating it) and the marrow layer is generated as an
// inward offset of the same capsules (so it is provably inside the cortex).
// ---------------------------------------------------------------------------
export const BONES = [
  { id: 'humerus_L', a: [0.188, 1.365, 0.040], b: [0.235, 1.100, 0.015], ra: 0.0205, rb: 0.0125 },
  { id: 'radius_L', a: [0.228, 1.072, 0.020], b: [0.250, 0.845, 0.020], ra: 0.0125, rb: 0.0085 },
  { id: 'ulna_L', a: [0.244, 1.088, 0.004], b: [0.262, 0.842, 0.006], ra: 0.0135, rb: 0.0080 },
  { id: 'femur_L', a: [0.120, 0.845, 0.015], b: [0.095, 0.530, 0.015], ra: 0.0225, rb: 0.0205 },
  { id: 'tibia_L', a: [0.092, 0.482, 0.012], b: [0.080, 0.090, 0.012], ra: 0.0190, rb: 0.0130 },
  { id: 'fibula_L', a: [0.128, 0.470, 0.006], b: [0.108, 0.085, 0.006], ra: 0.0075, rb: 0.0050 },
];

/** Every long bone, mirrored into both sides. */
export function bonesBothSides() {
  const out = [];
  for (const b of BONES) {
    out.push(b);
    out.push({
      id: b.id.replace('_L', '_R'),
      a: mirrorPoint(b.a), b: mirrorPoint(b.b), ra: b.ra, rb: b.rb,
    });
  }
  return out;
}

/** Signed distance to the outside of a tapered capsule (< 0 inside). */
export function sdBone(p, bone) {
  const ax = bone.a[0], ay = bone.a[1], az = bone.a[2];
  const bx = bone.b[0] - ax, by = bone.b[1] - ay, bz = bone.b[2] - az;
  const lenSq = bx * bx + by * by + bz * bz || 1e-8;
  const h = Math.max(0, Math.min(1, ((p[0] - ax) * bx + (p[1] - ay) * by + (p[2] - az) * bz) / lenSq));
  const dx = p[0] - (ax + bx * h), dy = p[1] - (ay + by * h), dz = p[2] - (az + bz * h);
  const r = bone.ra + (bone.rb - bone.ra) * h;
  return Math.hypot(dx, dy, dz) - r;
}

/**
 * Push a vertex out of every bone capsule it penetrates, so muscles wrap bone
 * instead of intersecting it. Returns the corrected point in place.
 */
export function pushOutOfBones(p, bones, clearance = 0.0) {
  for (let pass = 0; pass < 2; pass++) {
    let hit = false;
    for (const b of bones) {
      const d = sdBone(p, b);
      if (d >= -clearance) continue;
      hit = true;
      const ax = b.a[0], ay = b.a[1], az = b.a[2];
      const bx = b.b[0] - ax, by = b.b[1] - ay, bz = b.b[2] - az;
      const lenSq = bx * bx + by * by + bz * bz || 1e-8;
      const h = Math.max(0, Math.min(1, ((p[0] - ax) * bx + (p[1] - ay) * by + (p[2] - az) * bz) / lenSq));
      const cx = ax + bx * h, cy = ay + by * h, cz = az + bz * h;
      let dx = p[0] - cx, dy = p[1] - cy, dz = p[2] - cz;
      let l = Math.hypot(dx, dy, dz);
      if (l < 1e-6) { dx = 0; dy = 0; dz = 1; l = 1; }
      const r = b.ra + (b.rb - b.ra) * h + clearance + 0.0004;
      p[0] = cx + (dx / l) * r;
      p[1] = cy + (dy / l) * r;
      p[2] = cz + (dz / l) * r;
    }
    if (!hit) break;
  }
  return p;
}

// ---------------------------------------------------------------------------
// Vertebral canal axis — same formula the skeleton generator uses for the
// foramen, so the spinal cord is centred in the canal by construction.
// ---------------------------------------------------------------------------
export function canalAxis() {
  const pts = [];
  for (const cfg of SPINE_CFG) {
    if (cfg.tag === 'Co') continue;
    pts.push([0, cfg.y, cfg.z - cfg.bodyD * 0.48]);
  }
  return pts;
}

/** [y, anterior surface z] of every vertebral body, crown to sacrum. */
const VERTEBRAL_ANTERIOR = SPINE_CFG
  .filter((c) => c.tag !== 'Co')
  .map((c) => [c.y, c.z + c.bodyD * 0.5])
  .sort((a, b) => b[0] - a[0]);

/**
 * Signed distance, in metres, to the BONE of the lumbar-type vertebral bodies
 * (C2..L5): negative is inside bone. This is the same rounded box gen-spine.js
 * carves for each level, minus the vertebral foramen it subtracts from it — the
 * volume nothing but bone and marrow may occupy.
 *
 * C1 has no body, and the sacrum is a fused mass whose canal and posterior foramina
 * are not a "vertebral body", so both are outside this predicate; the sacral nerves
 * are held to the canal ellipse instead.
 *
 * `out` optionally receives { tag, d } of the nearest level, for diagnostics.
 */
export function vertebralBodyBoneDistance(p, out) {
  let best = Infinity;
  let bestTag = '';
  for (const c of SPINE_CFG) {
    if (c.tag === 'C1' || c.tag === 'S' || c.tag === 'Co') continue;
    const axis = c.tag === 'C2' ? 0.4 : 0.45;
    const ly = p[1] - c.y;
    if (Math.abs(ly) > c.bodyH * axis + 0.004) continue;
    const waist = c.tag === 'C2' ? 0 : Math.cos(ly * 150) * 0.0015;
    const lz = p[2] - c.z;
    let d = sdRoundedBox([p[0], ly, lz],
      [c.bodyW * (c.tag === 'C2' ? 0.45 : 0.5) - waist, c.bodyH * axis, c.bodyD * (c.tag === 'C2' ? 0.45 : 0.5) - waist],
      c.tag === 'C2' ? 0.003 : 0.004);
    const f = c.tag === 'C2'
      ? sdEllipsoid([p[0], ly, lz + 0.007], [0.007, 0.015, 0.007])
      : sdEllipsoid([p[0], ly, lz + c.bodyD * 0.48],
        [c.region === 'thoracic' ? 0.008 : 0.010, 0.025, c.region === 'thoracic' ? 0.008 : 0.0085]);
    d = Math.max(d, -f); // the hard form of gen-spine's ssub(foramen, body)
    if (d < best) { best = d; bestTag = c.tag; }
  }
  if (out) { out.tag = bestTag; out.d = best; }
  return best;
}

/** Whole vertebra (body + canal + processes): the volume marrow may occupy. */
export function vertebralMassBoxes() {
  return SPINE_CFG
    .filter((c) => c.tag !== 'Co')
    .map((c) => ({
      tag: c.tag,
      min: [-c.bodyW * 0.5, c.y - c.bodyH * 0.45, c.z - c.bodyD * 0.5 - 0.012],
      max: [c.bodyW * 0.5, c.y + c.bodyH * 0.45, c.z + c.bodyD * 0.5],
    }));
}

// Descending by height: C1 first, sacrum last. canalEllipseAt() interpolates on
// this order, so the sort is part of the contract, not a nicety.
const CANAL_LEVELS = SPINE_CFG
  .filter((c) => c.tag !== 'Co')
  .slice()
  .sort((a, b) => b.y - a.y);

/**
 * The canal ellipse the bone generator actually subtracts, at a height. Both the
 * cord generator and the verifier use this, so containment is asserted against
 * the same function that built the geometry.
 */
export function canalEllipseAt(y) {
  const a = CANAL_LEVELS[0];
  if (y >= a.y) return { z: a.z - a.bodyD * 0.48, rx: 0.0068, rz: 0.0064 };
  const last = CANAL_LEVELS[CANAL_LEVELS.length - 1];
  if (y <= last.y) return { z: last.z - last.bodyD * 0.48, rx: 0.0064, rz: 0.0060 };
  for (let i = 0; i < CANAL_LEVELS.length - 1; i++) {
    const c0 = CANAL_LEVELS[i];
    const c1 = CANAL_LEVELS[i + 1];
    if (y < c1.y) continue; // bracket is c1.y <= y <= c0.y
    const e = (y - c0.y) / (c1.y - c0.y || 1e-6);
    const thor = (t) => (t === 'thoracic' ? 0.0060 : 0.0070);
    const thorZ = (t) => (t === 'thoracic' ? 0.0060 : 0.0066);
    return {
      z: (c0.z - c0.bodyD * 0.48) + ((c1.z - c1.bodyD * 0.48) - (c0.z - c0.bodyD * 0.48)) * e,
      rx: thor(c0.region) + (thor(c1.region) - thor(c0.region)) * e,
      rz: thorZ(c0.region) + (thorZ(c1.region) - thorZ(c0.region)) * e,
    };
  }
  return { z: 0, rx: 0.006, rz: 0.006 };
}

/**
 * Anterior surface of the vertebral column at a given height. Pre-vertebral
 * vessels (aorta, IVC) are routed from this so they rest ON the column and can
 * never be buried inside a body — the verifier asserts the same function.
 */
export function vertebralAnteriorZ(y) {
  const t = VERTEBRAL_ANTERIOR; // [y, z] pairs in DESCENDING height order
  if (y >= t[0][0]) return t[0][1];
  if (y <= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 0; i < t.length - 1; i++) {
    if (y < t[i + 1][0]) continue; // bracket is t[i+1][0] <= y <= t[i][0]
    const f = (y - t[i][0]) / (t[i + 1][0] - t[i][0]);
    return t[i][1] + f * (t[i + 1][1] - t[i][1]);
  }
  return t[t.length - 1][1];
}

/** Inner table of the cranial cavity, derived from the cranium loft sections. */
export const CRANIAL_CAVITY = {
  centre: [0, 1.612, 0.004],
  radii: [0.0755, 0.0845, 0.1155],
  // posterior fossa / tentorium notch
  brainstemTop: [0, 1.556, 0.006],
};

