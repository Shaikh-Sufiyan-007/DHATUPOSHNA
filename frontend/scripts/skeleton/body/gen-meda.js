// Meda Dhatu layer — subcutaneous adipose, greater omentum, perirenal adipose,
// and renal tissue. Subcutaneous fat is the inward offset of the skin shell by
// the regional adipose map, so it can never poke through the shell.

import {
  SEGMENTS, segmentKey, mirroredField, fatThicknessAt, FASCIA_GAP, TubeField, SKIN_BOTTOM_Y
} from './frame.js';
import { loftTube, displace, part, mergeGeoms, scaleAbout, clampFloor } from './mesh-utils.js';

// The sole's subcutaneous pad is ~7 mm, so fat must never dip below the skin floor.
const FAT_FLOOR_Y = SKIN_BOTTOM_Y + 0.0075;

const FAT_INSET = (p) => fatThicknessAt(p) - FASCIA_GAP * 0.5;

/**
 * Renal form: a lofted bean whose long axis runs vertically in local space,
 * with a genuinely concave medial border and a hilum depression, then tilted
 * (upper pole toward the midline) and rotated (hilum anteromedial).
 */
function kidney(side, quality) {
  const s = side === 'L' ? 1 : -1;
  const centre = [s * 0.0645, side === 'L' ? 1.052 : 1.028, -0.010];
  const tube = new TubeField(
    [[0, -0.047, 0], [0, -0.018, 0.002], [0, 0.015, 0.001], [0, 0.045, -0.002]],
    [
      [0, [0.0116, 0.0190, 0]],
      [0.24, [0.0154, 0.0256, 0]],
      [0.54, [0.0164, 0.0272, 0]],
      [0.82, [0.0144, 0.0238, 0]],
      [1, [0.0100, 0.0160, 0]],
    ],
    { samples: 20, refW: [1, 0, 0], refD: [0, 0, 1] }
  );
  const radial = quality === 'high' ? 18 : 10;
  const g = loftTube(tube, { radial, inset: 0 });
  displace(g, (x, y, z, nx, ny, nz) => {
    void x; void z;
    const medial = Math.max(0, -nx * s);        // 1 on a purely medial-facing surface
    if (medial < 0.25) return 0;
    const m = (medial - 0.25) / 0.75;
    const band = 1 - Math.min(1, Math.abs(y) / 0.052);
    const hilum = Math.exp(-(((y - 0.001) / 0.013) ** 2));
    void ny; void nz;
    return -(0.0052 * Math.pow(m, 1.4) * band + 0.0044 * Math.pow(m, 2) * hilum);
  });
  g.rotateZ(s * 0.26);
  g.rotateY(s * 0.38);
  g.translate(centre[0], centre[1], centre[2]);
  return { g, centre };
}

/** Perirenal adipose capsule: the renal form enlarged, hilum gap closed over. */
function perirenal(side, quality) {
  const k = kidney(side, quality);
  const g = k.g.clone();
  scaleAbout(g, 1.42, k.centre);
  displace(g, (x, y, z, nx, ny, nz) => {
    void nx; void ny; void nz;
    // posterior pararenal pad: extra bulk behind the kidney
    return z < -0.030 ? (Math.abs(z + 0.030) * 0.55) * (1 - Math.min(1, Math.abs(y - k.centre[1]) / 0.075)) : 0;
  });
  return g;
}

/** Greater omentum: flattened lobulated apron from the greater curvature. */
function omentum(quality) {
  const path = [
    [0.086, 1.136, 0.046], [0.060, 1.106, 0.074], [0.016, 1.068, 0.092],
    [-0.022, 1.016, 0.096], [-0.054, 0.952, 0.088], [-0.062, 0.888, 0.070],
    [-0.048, 0.844, 0.050],
  ];
  const tube = new TubeField(path, [
    [0.00, [0.024, 0.011, 0]],
    [0.18, [0.058, 0.019, 0.004]],
    [0.46, [0.094, 0.025, 0.010]],
    [0.72, [0.108, 0.021, 0.012]],
    [0.90, [0.092, 0.013, 0.010]],
    [1.00, [0.058, 0.006, 0.004]],
  ], { samples: 28, refW: [1, 0, 0], refD: [0, 0, 1] });
  return loftTube(tube, {
    radial: quality === 'high' ? 20 : 10,
    inset: 0,
    noise: { amp: 0.0055, freq: 32, octaves: 3 },
    seed: 41.7,
  });
}

export function buildMeda(quality = 'high') {
  const radial = quality === 'high' ? 18 : 10;
  const subGeoms = [];
  const subNames = [];

  for (const seg of SEGMENTS) {
    const opts = {
      radial, inset: FAT_INSET, capRings: 2,
      noise: { amp: 0.0014, freq: 21, octaves: 2 },
      seed: segmentKey(seg).length * 3.7,
    };
    subGeoms.push(loftTube(seg.field, opts));
    subNames.push(`fat_subcut_${segmentKey(seg)}`);
    if (seg.side === 'L') {
      subGeoms.push(loftTube(mirroredField(seg.field), { ...opts, seed: 91.3 }));
      subNames.push(`fat_subcut_${seg.id}_R`);
    }
  }

  const parts = [
    part('fat_subcutaneous', 'meda', 'fat_subcutaneous', mergeGeoms(subGeoms), { parts: subNames }),
    part('greater_omentum', 'meda', 'fat_omentum', omentum(quality)),
  ];

  const per = ['L', 'R'].map((side) => perirenal(side, quality));
  parts.push(part('fat_perirenal', 'meda', 'fat_perirenal', mergeGeoms(per), {
    parts: ['perirenal_fat_L', 'perirenal_fat_R'],
  }));

  const rens = ['L', 'R'].map((side) => kidney(side, quality).g);
  parts.push(part('kidneys', 'meda', 'kidney', mergeGeoms(rens), {
    parts: ['kidney_L', 'kidney_R'],
  }));

  for (const p of parts) clampFloor(p.geometry, FAT_FLOOR_Y);
  return parts;
}
