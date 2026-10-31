// Mamsa Dhatu — skeletal musculature. Built as fusiform lofts along real
// origin -> insertion paths that hug the bones catalogued in frame.js, then
// clipped to the deep fascia envelope so a belly can never punch through skin
// and is pushed clear of the bone it wraps.

import { meshSDF, smax, ssub, sdEllipsoid, sdCapsule } from '../sdf-mesh.js';
import {
  muscleEnvelope, bonesBothSides, pushOutOfBones, insideShellWithMargin, bodyInward,
} from './frame.js';
import {
  muscleTube, loftTube, part, mergeGeoms, ensureOutward,
} from './mesh-utils.js';

const BONES = bonesBothSides();

/** Mirror an anatomical LEFT-side definition to the right. */
function mirrorPts(pts) { return pts.map(([x, y, z]) => [-x, y, z]); }

/**
 * One muscle. `path` is origin->insertion in the LEFT-side frame.
 * w/d = belly half-dimensions, flat = depth/width ratio, peak = belly position.
 */
function muscle(def, quality, mirror) {
  const radial = quality === 'high' ? (def.big ? 16 : 12) : (def.big ? 9 : 7);
  const pts = mirror ? mirrorPts(def.path) : def.path;
  const boneFilter = mirror ? BONES.filter((b) => b.id.endsWith('_R')) : BONES.filter((b) => b.id.endsWith('_L'));
  const tube = muscleTube(pts, {
    w: def.w, d: def.d, flat: def.flat, peak: def.peak, r0: def.r0, r1: def.r1,
    sections: def.sections, inflate: -0.0012,
  });
  const g = loftTube(tube, {
    radial,
    rings: quality === 'high' ? def.rings || 0 : Math.max(8, (def.rings || 14) * 0.6),
    capRings: 2,
    inset: 0,
    noise: def.striped ? { amp: 0.0016, freq: 60, octaves: 2 } : { amp: 0.0009, freq: 30, octaves: 2 },
    seed: def.name.length * 5.31 + (mirror ? 17 : 3),
  });

  // 1. retreat from the envelope, 2. wrap (never penetrate) the bone it crosses
  const arr = g.attributes.position.array;
  const nrmAttr = g.attributes.normal;
  for (let i = 0; i < g.attributes.position.count; i++) {
    const k = i * 3;
    const p = [arr[k], arr[k + 1], arr[k + 2]];
    const env = muscleEnvelope(p);
    if (env < 0) {
      const out = [0, 0, 0];
      bodyInward(p, out);
      const push = Math.min(0.02, -env + 0.0012);
      p[0] += out[0] * push; p[1] += out[1] * push; p[2] += out[2] * push;
    }
    pushOutOfBones(p, boneFilter, 0.0006);
    if (!insideShellWithMargin(p, 0.004)) {
      const out = [0, 0, 0];
      bodyInward(p, out);
      p[0] += out[0] * 0.002; p[1] += out[1] * 0.002; p[2] += out[2] * 0.002;
    }
    arr[k] = p[0]; arr[k + 1] = p[1]; arr[k + 2] = p[2];
  }
  g.attributes.position.needsUpdate = true;
  void nrmAttr;
  g.computeVertexNormals();
  ensureOutward(g);
  return { geometry: g, name: def.name + (mirror ? '_R' : '_L'), region: def.region, tendon: def.tendon };
}

/** A pale tendon / aponeurosis band lofted between two anchors. */
function tendon(def, quality, mirror) {
  const pts = mirror ? mirrorPts(def.path) : def.path;
  const tube = muscleTube(pts, { w: def.w, d: def.d || def.w * 0.75, flat: def.flat || 1, sections: def.sections, r0: 0.9, r1: 1, peak: 0.5 });
  const g = loftTube(tube, {
    radial: quality === 'high' ? 8 : 5, rings: quality === 'high' ? 14 : 8, capRings: 2, inset: 0,
    seed: def.name.length * 2.3 + (mirror ? 11 : 5),
  });
  return { geometry: g, name: def.name + (mirror ? '_R' : '_L'), region: 'tendon' };
}

// ---------------------------------------------------------------------------
// Catalogue. Anatomical LEFT = +X, so every path is written for the left side.
// Heights are the real skeleton anchors from frame.js / PROGRESS-explore.md.
// ---------------------------------------------------------------------------
export const MUSCLES = [
  // ---- head & neck ----
  { name: 'temporalis', region: 'muscle_head_neck', big: 0, w: 0.030, d: 0.012, flat: 0.55, peak: 0.55,
    path: [[0.062, 1.612, 0.052], [0.078, 1.566, 0.048], [0.084, 1.522, 0.042], [0.072, 1.492, 0.052]] },
  { name: 'masseter', region: 'muscle_head_neck', big: 0, w: 0.020, d: 0.014, flat: 0.85, peak: 0.5,
    path: [[0.062, 1.552, 0.062], [0.070, 1.522, 0.058], [0.072, 1.500, 0.050], [0.066, 1.488, 0.044]] },
  { name: 'sternocleidomastoid', region: 'muscle_head_neck', big: 0, w: 0.0135, d: 0.0105, flat: 0.8, peak: 0.45,
    path: [[0.014, 1.396, 0.116], [0.048, 1.440, 0.086], [0.062, 1.482, 0.050], [0.060, 1.510, 0.032]] },
  { name: 'trapezius_upper', region: 'muscle_head_neck', big: 1, w: 0.030, d: 0.011, flat: 0.4, peak: 0.4,
    sections: [[0, [0.013, 0.007, 0]], [0.35, [0.030, 0.013, 0]], [0.7, [0.026, 0.011, 0]], [1, [0.010, 0.006, 0]]],
    path: [[0.010, 1.500, -0.055], [0.060, 1.472, -0.062], [0.118, 1.440, -0.052], [0.160, 1.412, -0.038]] },
  { name: 'splenius_capitis', region: 'muscle_head_neck', big: 0, w: 0.013, d: 0.011, flat: 0.85, peak: 0.5,
    path: [[0.020, 1.400, -0.048], [0.036, 1.452, -0.050], [0.052, 1.496, -0.042]] },
  { name: 'scalene_anterior', region: 'muscle_head_neck', big: 0, w: 0.0085, d: 0.0075, peak: 0.5,
    path: [[0.028, 1.424, 0.030], [0.034, 1.400, 0.048], [0.038, 1.382, 0.062]] },
  { name: 'digastric', region: 'muscle_head_neck', big: 0, w: 0.0075, d: 0.0065, peak: 0.5,
    path: [[0.052, 1.500, 0.052], [0.044, 1.478, 0.050], [0.024, 1.466, 0.058], [0.012, 1.476, 0.062]] },
  { name: 'mylohyoid', region: 'muscle_head_neck', big: 0, w: 0.008, d: 0.020, flat: 0.4, peak: 0.5,
    path: [[0.006, 1.478, 0.066], [0.030, 1.474, 0.062], [0.052, 1.486, 0.050]] },

  // ---- shoulder girdle / arm ----
  { name: 'deltoid_anterior', region: 'muscle_upper_arm', big: 1, w: 0.028, d: 0.017, flat: 0.7, peak: 0.42,
    path: [[0.062, 1.402, 0.098], [0.118, 1.412, 0.086], [0.164, 1.392, 0.062], [0.196, 1.318, 0.048]] },
  { name: 'deltoid_middle', region: 'muscle_upper_arm', big: 1, w: 0.030, d: 0.020, flat: 0.75, peak: 0.4,
    path: [[0.086, 1.408, 0.048], [0.142, 1.414, 0.030], [0.186, 1.392, 0.028], [0.214, 1.316, 0.030]] },
  { name: 'deltoid_posterior', region: 'muscle_upper_arm', big: 1, w: 0.026, d: 0.016, flat: 0.7, peak: 0.42,
    path: [[0.096, 1.400, -0.036], [0.150, 1.396, -0.038], [0.192, 1.368, -0.014], [0.212, 1.312, 0.008]] },
  { name: 'supraspinatus', region: 'muscle_upper_arm', big: 0, w: 0.020, d: 0.012, flat: 0.65, peak: 0.5,
    path: [[0.072, 1.418, -0.070], [0.124, 1.420, -0.058], [0.166, 1.404, -0.024], [0.184, 1.380, 0.004]] },
  { name: 'infraspinatus', region: 'muscle_upper_arm', big: 0, w: 0.021, d: 0.013, flat: 0.7, peak: 0.5,
    path: [[0.062, 1.388, -0.086], [0.118, 1.382, -0.078], [0.168, 1.364, -0.038], [0.190, 1.340, -0.010]] },
  { name: 'teres_minor', region: 'muscle_upper_arm', big: 0, w: 0.013, d: 0.010, peak: 0.5,
    path: [[0.094, 1.344, -0.082], [0.146, 1.338, -0.060], [0.184, 1.322, -0.026]] },
  { name: 'subscapularis', region: 'muscle_upper_arm', big: 0, w: 0.024, d: 0.014, flat: 0.62, peak: 0.5,
    path: [[0.058, 1.398, -0.024], [0.112, 1.376, -0.030], [0.168, 1.348, -0.010], [0.192, 1.322, 0.014]] },
  { name: 'teres_major', region: 'muscle_upper_arm', big: 0, w: 0.015, d: 0.012, peak: 0.5,
    path: [[0.088, 1.312, -0.072], [0.140, 1.290, -0.050], [0.184, 1.250, -0.010]] },
  { name: 'pectoralis_major_clavicular', region: 'muscle_pectorial', big: 1, w: 0.022, d: 0.011, flat: 0.5, peak: 0.4,
    sections: [[0, [0.016, 0.008, 0]], [0.45, [0.026, 0.013, 0]], [1, [0.009, 0.007, 0]]],
    path: [[0.020, 1.392, 0.118], [0.078, 1.384, 0.112], [0.140, 1.364, 0.092], [0.188, 1.330, 0.056]] },
  { name: 'pectoralis_major_sternal', region: 'muscle_pectorial', big: 1, w: 0.030, d: 0.013, flat: 0.45, peak: 0.45,
    sections: [[0, [0.030, 0.010, 0]], [0.5, [0.034, 0.015, 0]], [1, [0.010, 0.008, 0]]],
    path: [[0.018, 1.300, 0.128], [0.080, 1.288, 0.124], [0.150, 1.272, 0.096], [0.196, 1.300, 0.052]] },
  { name: 'subclavius', region: 'muscle_pectorial', big: 0, w: 0.010, d: 0.006, peak: 0.5,
    path: [[0.034, 1.378, 0.106], [0.090, 1.384, 0.100], [0.148, 1.392, 0.086]] },
  { name: 'serratus_anterior', region: 'muscle_pectorial', big: 0, w: 0.016, d: 0.012, flat: 0.8, peak: 0.5,
    path: [[0.108, 1.352, 0.090], [0.138, 1.288, 0.098], [0.150, 1.216, 0.094], [0.146, 1.158, 0.082]] },
  { name: 'biceps_short', region: 'muscle_upper_arm', big: 0, w: 0.019, d: 0.018, peak: 0.42,
    path: [[0.180, 1.352, 0.052], [0.204, 1.288, 0.048], [0.220, 1.200, 0.040], [0.226, 1.120, 0.034]] },
  { name: 'biceps_long', region: 'muscle_upper_arm', big: 0, w: 0.018, d: 0.017, peak: 0.45,
    path: [[0.196, 1.358, 0.016], [0.214, 1.290, 0.026], [0.226, 1.206, 0.028], [0.232, 1.116, 0.026]] },
  { name: 'brachialis', region: 'muscle_upper_arm', big: 0, w: 0.020, d: 0.014, flat: 0.75, peak: 0.5,
    path: [[0.206, 1.300, 0.024], [0.222, 1.240, 0.018], [0.232, 1.160, 0.016], [0.238, 1.100, 0.018]] },
  { name: 'triceps_long', region: 'muscle_upper_arm', big: 0, w: 0.021, d: 0.019, peak: 0.42,
    path: [[0.186, 1.352, -0.018], [0.212, 1.280, -0.022], [0.228, 1.190, -0.014], [0.238, 1.112, 0.002]] },
  { name: 'triceps_lateral', region: 'muscle_upper_arm', big: 0, w: 0.016, d: 0.015, peak: 0.45,
    path: [[0.214, 1.310, 0.006], [0.230, 1.240, 0.004], [0.240, 1.170, 0.006], [0.244, 1.110, 0.008]] },
  { name: 'triceps_medial', region: 'muscle_upper_arm', big: 0, w: 0.015, d: 0.013, peak: 0.5,
    path: [[0.210, 1.280, -0.012], [0.226, 1.210, -0.010], [0.238, 1.150, -0.004], [0.242, 1.108, 0.004]] },
  { name: 'anconeus', region: 'muscle_upper_arm', big: 0, w: 0.009, d: 0.008, peak: 0.5,
    path: [[0.246, 1.102, -0.008], [0.250, 1.072, -0.004], [0.254, 1.044, 0.000]] },

  // ---- forearm ----
  { name: 'brachioradialis', region: 'muscle_forearm', big: 0, w: 0.016, d: 0.014, peak: 0.36,
    path: [[0.226, 1.102, 0.028], [0.238, 1.030, 0.030], [0.248, 0.950, 0.028], [0.254, 0.872, 0.024]] },
  { name: 'pronator_teres', region: 'muscle_forearm', big: 0, w: 0.013, d: 0.010, flat: 0.8, peak: 0.4,
    path: [[0.230, 1.094, 0.020], [0.238, 1.040, 0.024], [0.246, 0.988, 0.026]] },
  { name: 'pronator_quadratus', region: 'muscle_forearm', big: 0, w: 0.012, d: 0.008, flat: 0.7, peak: 0.5,
    path: [[0.240, 0.950, 0.020], [0.246, 0.916, 0.020], [0.252, 0.878, 0.020]] },
  { name: 'flexor_carpi_radialis', region: 'muscle_forearm', big: 0, w: 0.011, d: 0.010, peak: 0.4,
    path: [[0.232, 1.090, 0.026], [0.240, 1.010, 0.030], [0.248, 0.930, 0.030], [0.252, 0.860, 0.028]] },
  { name: 'flexor_digorum_superficialis', region: 'muscle_forearm', big: 0, w: 0.013, d: 0.011, peak: 0.42,
    path: [[0.236, 1.086, 0.020], [0.244, 1.000, 0.022], [0.250, 0.920, 0.020], [0.254, 0.856, 0.018]] },
  { name: 'flexor_carpi_ulnaris', region: 'muscle_forearm', big: 0, w: 0.011, d: 0.010, peak: 0.4,
    path: [[0.244, 1.088, 0.004], [0.252, 1.006, 0.004], [0.258, 0.926, 0.004], [0.262, 0.858, 0.006]] },
  { name: 'palmaris_longus', region: 'muscle_forearm', big: 0, w: 0.0075, d: 0.007, peak: 0.45,
    path: [[0.238, 1.084, 0.016], [0.246, 1.000, 0.018], [0.252, 0.920, 0.018], [0.256, 0.852, 0.018]] },
  { name: 'extensor_carpi_radialis_longus', region: 'muscle_forearm', big: 0, w: 0.010, d: 0.009, peak: 0.38,
    path: [[0.232, 1.098, 0.014], [0.244, 1.020, 0.020], [0.252, 0.942, 0.022], [0.258, 0.870, 0.022]] },
  { name: 'extensor_carpi_radialis_brevis', region: 'muscle_forearm', big: 0, w: 0.009, d: 0.008, peak: 0.42,
    path: [[0.238, 1.080, 0.012], [0.248, 1.006, 0.018], [0.254, 0.930, 0.020], [0.258, 0.866, 0.020]] },
  { name: 'extensor_digorum', region: 'muscle_forearm', big: 0, w: 0.011, d: 0.009, flat: 0.85, peak: 0.4,
    path: [[0.242, 1.090, 0.006], [0.252, 1.010, 0.008], [0.258, 0.930, 0.008], [0.262, 0.860, 0.008]] },
  { name: 'extensor_carpi_ulnaris', region: 'muscle_forearm', big: 0, w: 0.009, d: 0.008, peak: 0.42,
    path: [[0.248, 1.086, -0.002], [0.256, 1.006, -0.002], [0.262, 0.928, 0.000], [0.266, 0.860, 0.002]] },
  { name: 'abductor_pollicis_longus', region: 'muscle_forearm', big: 0, w: 0.0075, d: 0.007, peak: 0.45,
    path: [[0.246, 1.060, 0.002], [0.254, 0.980, 0.008], [0.262, 0.900, 0.014], [0.268, 0.850, 0.018]] },
  { name: 'supinator', region: 'muscle_forearm', big: 0, w: 0.014, d: 0.011, flat: 0.85, peak: 0.5,
    path: [[0.240, 1.088, 0.006], [0.246, 1.052, 0.014], [0.250, 1.016, 0.018]] },

  // ---- hand intrinsics (thenar + hypothenar + a lumbrical fan) ----
  { name: 'thenar', region: 'muscle_forearm', big: 0, w: 0.014, d: 0.010, flat: 0.72, peak: 0.5,
    path: [[0.252, 0.848, 0.022], [0.264, 0.812, 0.028], [0.278, 0.782, 0.030]] },
  { name: 'hypothenar', region: 'muscle_forearm', big: 0, w: 0.011, d: 0.009, flat: 0.8, peak: 0.5,
    path: [[0.262, 0.846, 0.008], [0.266, 0.814, 0.012], [0.268, 0.786, 0.016]] },
  { name: 'adductor_pollicis', region: 'muscle_forearm', big: 0, w: 0.010, d: 0.008, flat: 0.8, peak: 0.5,
    path: [[0.256, 0.836, 0.010], [0.264, 0.808, 0.016], [0.272, 0.788, 0.022]] },
  { name: 'interossei_dorsal', region: 'muscle_forearm', big: 0, w: 0.016, d: 0.007, flat: 0.45, peak: 0.5,
    path: [[0.252, 0.836, 0.014], [0.256, 0.808, 0.016], [0.258, 0.780, 0.018]] },

  // ---- axial / trunk ----
  { name: 'latissimus_dorsi', region: 'muscle_back', big: 1, w: 0.048, d: 0.012, flat: 0.34, peak: 0.42,
    sections: [[0, [0.026, 0.008, 0]], [0.35, [0.052, 0.014, 0]], [0.72, [0.040, 0.012, 0]], [1, [0.010, 0.007, 0]]],
    path: [[0.036, 1.060, -0.078], [0.092, 1.150, -0.088], [0.140, 1.250, -0.070], [0.180, 1.320, -0.026]] },
  { name: 'erector_spinae_iliocostalis', region: 'muscle_back', big: 1, w: 0.019, d: 0.021, peak: 0.5, striped: 1,
    rings: 26,
    path: [[0.070, 0.920, -0.064], [0.074, 1.060, -0.074], [0.070, 1.200, -0.078], [0.062, 1.330, -0.074], [0.048, 1.420, -0.062]] },
  { name: 'erector_spinae_longissimus', region: 'muscle_back', big: 1, w: 0.017, d: 0.019, peak: 0.5, striped: 1,
    rings: 26,
    path: [[0.044, 0.930, -0.062], [0.046, 1.070, -0.068], [0.044, 1.210, -0.066], [0.038, 1.340, -0.058], [0.028, 1.430, -0.048]] },
  { name: 'erector_spinae_spinalis', region: 'muscle_back', big: 0, w: 0.012, d: 0.014, peak: 0.5, striped: 1,
    rings: 20,
    path: [[0.020, 0.960, -0.056], [0.020, 1.100, -0.058], [0.018, 1.240, -0.052], [0.016, 1.370, -0.046]] },
  { name: 'semispinalis_thoracis', region: 'muscle_back', big: 0, w: 0.017, d: 0.013, flat: 0.78, peak: 0.5, striped: 1,
    rings: 18,
    path: [[0.030, 1.100, -0.072], [0.044, 1.220, -0.078], [0.052, 1.330, -0.072], [0.046, 1.420, -0.056]] },
  { name: 'multifidus', region: 'muscle_back', big: 0, w: 0.013, d: 0.012, peak: 0.5, striped: 1, rings: 20,
    path: [[0.026, 0.950, -0.050], [0.028, 1.080, -0.056], [0.028, 1.220, -0.052], [0.026, 1.350, -0.044]] },
  { name: 'rhomboid_major', region: 'muscle_back', big: 0, w: 0.020, d: 0.009, flat: 0.5, peak: 0.5,
    path: [[0.016, 1.420, -0.050], [0.060, 1.402, -0.068], [0.108, 1.380, -0.076]] },
  { name: 'levator_scapulae', region: 'muscle_back', big: 0, w: 0.012, d: 0.011, peak: 0.5,
    path: [[0.022, 1.470, -0.044], [0.058, 1.438, -0.052], [0.100, 1.416, -0.062]] },
  { name: 'serratus_posterior_superior', region: 'muscle_back', big: 0, w: 0.017, d: 0.008, flat: 0.55, peak: 0.5,
    path: [[0.016, 1.368, -0.052], [0.062, 1.352, -0.068], [0.110, 1.336, -0.074]] },
  { name: 'iliocostalis_lumborum', region: 'muscle_back', big: 0, w: 0.018, d: 0.016, peak: 0.5,
    path: [[0.062, 0.880, -0.060], [0.074, 0.960, -0.068], [0.080, 1.040, -0.072]] },

  // ---- abdominal wall ----
  { name: 'rectus_abdominis', region: 'muscle_abdominal', big: 1, w: 0.034, d: 0.014, flat: 0.42, peak: 0.5, striped: 1,
    sections: [[0, [0.020, 0.009, 0]], [0.12, [0.034, 0.015, 0]], [0.5, [0.036, 0.016, 0]], [0.88, [0.030, 0.013, 0]], [1, [0.016, 0.008, 0]]],
    rings: 22,
    path: [[0.036, 0.876, 0.112], [0.040, 0.980, 0.122], [0.040, 1.100, 0.126], [0.036, 1.220, 0.128], [0.028, 1.320, 0.126], [0.020, 1.376, 0.118]] },
  { name: 'external_oblique', region: 'muscle_abdominal', big: 1, w: 0.030, d: 0.013, flat: 0.45, peak: 0.45,
    sections: [[0, [0.018, 0.008, 0]], [0.4, [0.034, 0.014, 0]], [1, [0.014, 0.008, 0]]],
    rings: 20,
    path: [[0.108, 1.244, 0.070], [0.138, 1.130, 0.078], [0.148, 1.010, 0.076], [0.138, 0.912, 0.066], [0.108, 0.862, 0.058]] },
  { name: 'internal_oblique', region: 'muscle_abdominal', big: 0, w: 0.020, d: 0.010, flat: 0.5, peak: 0.5, rings: 16,
    path: [[0.102, 1.220, 0.056], [0.128, 1.110, 0.062], [0.134, 1.000, 0.060], [0.124, 0.912, 0.052], [0.098, 0.872, 0.046]] },
  { name: 'transversus_abdominis', region: 'muscle_abdominal', big: 0, w: 0.016, d: 0.009, flat: 0.6, peak: 0.5, rings: 16,
    path: [[0.094, 1.200, 0.040], [0.118, 1.096, 0.046], [0.124, 0.992, 0.046], [0.114, 0.906, 0.040], [0.090, 0.874, 0.036]] },
  { name: 'pyramidalis', region: 'muscle_abdominal', big: 0, w: 0.008, d: 0.006, peak: 0.5,
    path: [[0.012, 0.878, 0.112], [0.014, 0.918, 0.116], [0.016, 0.956, 0.118]] },
  { name: 'obliquus_externus_abdominis_aponeurosis', region: 'tendon', big: 0, w: 0.024, d: 0.005, flat: 0.3,
    path: [[0.136, 0.980, 0.084], [0.100, 0.900, 0.112], [0.040, 0.872, 0.118]] },

  // ---- diaphragmatic crura (the dome itself is built as a clipped shell) ----
  // sections are ABSOLUTE half-radii in metres (0.34/0.52/0.40 x w, x d), never factors.
  { name: 'diaphragmatic_crus', region: 'muscle_axial', big: 0, w: 0.012, d: 0.009, flat: 0.9, peak: 0.5, rings: 14,
    sections: [[0, [0.0041, 0.0027, 0]], [0.5, [0.0062, 0.0040, 0]], [1, [0.0048, 0.0031, 0]]],
    path: [[0.020, 1.058, -0.014], [0.024, 1.118, -0.006], [0.028, 1.178, 0.014], [0.026, 1.222, 0.030]] },
  { name: 'transversus_thoracis', region: 'muscle_pectorial', big: 0, w: 0.010, d: 0.006, peak: 0.5,
    path: [[0.026, 1.210, 0.122], [0.050, 1.250, 0.120], [0.078, 1.288, 0.116]] },
  { name: 'intercostalis_externi', region: 'muscle_pectorial', big: 0, w: 0.014, d: 0.008, flat: 0.6, peak: 0.5, rings: 16,
    path: [[0.048, 1.330, 0.112], [0.098, 1.284, 0.118], [0.138, 1.214, 0.100], [0.150, 1.140, 0.072]] },
  { name: 'intercostales_intimi', region: 'muscle_pectorial', big: 0, w: 0.012, d: 0.007, flat: 0.6, peak: 0.5, rings: 14,
    path: [[0.044, 1.316, 0.100], [0.090, 1.272, 0.106], [0.128, 1.206, 0.088], [0.140, 1.140, 0.062]] },

  // ---- pelvic floor / hip ----
  { name: 'gluteus_maximus', region: 'muscle_hip_thigh', big: 1, w: 0.062, d: 0.044, flat: 0.82, peak: 0.42,
    rings: 20,
    path: [[0.032, 1.004, -0.052], [0.092, 0.972, -0.078], [0.126, 0.908, -0.062], [0.142, 0.858, -0.032], [0.146, 0.826, -0.004]] },
  { name: 'gluteus_medius', region: 'muscle_hip_thigh', big: 1, w: 0.038, d: 0.020, flat: 0.62, peak: 0.45,
    path: [[0.058, 1.016, -0.014], [0.112, 1.004, -0.026], [0.146, 0.956, -0.020], [0.156, 0.910, 0.004]] },
  { name: 'gluteus_minimus', region: 'muscle_hip_thigh', big: 0, w: 0.026, d: 0.014, flat: 0.6, peak: 0.5,
    path: [[0.062, 0.992, 0.008], [0.112, 0.976, -0.002], [0.140, 0.930, 0.004]] },
  { name: 'piriformis', region: 'muscle_hip_thigh', big: 0, w: 0.013, d: 0.011, peak: 0.5,
    path: [[0.026, 0.934, -0.058], [0.062, 0.928, -0.046], [0.098, 0.914, -0.026]] },
  { name: 'obturator_internus', region: 'muscle_hip_thigh', big: 0, w: 0.012, d: 0.010, peak: 0.5,
    path: [[0.046, 0.902, -0.020], [0.074, 0.898, -0.014], [0.098, 0.892, -0.004]] },
  { name: 'gemellus_obturator', region: 'muscle_hip_thigh', big: 0, w: 0.010, d: 0.009, peak: 0.5,
    path: [[0.076, 0.908, -0.024], [0.094, 0.902, -0.014], [0.110, 0.892, -0.002]] },
  { name: 'quadratus_lumborum', region: 'muscle_axial', big: 0, w: 0.024, d: 0.013, flat: 0.62, peak: 0.5, rings: 14,
    path: [[0.058, 0.930, -0.050], [0.066, 1.000, -0.056], [0.072, 1.078, -0.058], [0.074, 1.140, -0.056]] },
  { name: 'psoas_major', region: 'muscle_hip_thigh', big: 1, w: 0.020, d: 0.019, peak: 0.42, rings: 20,
    path: [[0.034, 1.160, -0.016], [0.044, 1.070, -0.004], [0.058, 0.980, 0.014], [0.074, 0.920, 0.028], [0.090, 0.888, 0.034]] },
  { name: 'iliacus', region: 'muscle_hip_thigh', big: 0, w: 0.030, d: 0.014, flat: 0.55, peak: 0.5,
    path: [[0.098, 1.000, 0.010], [0.098, 0.950, 0.024], [0.092, 0.912, 0.034]] },
  { name: 'iliopsoas_distal', region: 'muscle_hip_thigh', big: 0, w: 0.014, d: 0.012, peak: 0.5,
    path: [[0.090, 0.892, 0.034], [0.100, 0.856, 0.032], [0.108, 0.822, 0.028]] },

  // ---- thigh ----
  { name: 'sartorius', region: 'muscle_hip_thigh', big: 1, w: 0.014, d: 0.010, flat: 0.8, peak: 0.5, rings: 26,
    path: [[0.104, 0.978, 0.048], [0.116, 0.880, 0.050], [0.110, 0.760, 0.044], [0.096, 0.640, 0.036], [0.082, 0.540, 0.028], [0.070, 0.492, 0.018]] },
  { name: 'rectus_femoris', region: 'muscle_hip_thigh', big: 1, w: 0.028, d: 0.026, peak: 0.42, rings: 22,
    path: [[0.110, 0.902, 0.038], [0.124, 0.820, 0.044], [0.126, 0.720, 0.046], [0.120, 0.620, 0.044], [0.110, 0.548, 0.038], [0.100, 0.506, 0.034]] },
  { name: 'vastus_lateralis', region: 'muscle_hip_thigh', big: 1, w: 0.034, d: 0.026, peak: 0.4, rings: 22,
    path: [[0.130, 0.876, 0.026], [0.150, 0.790, 0.028], [0.152, 0.700, 0.030], [0.140, 0.610, 0.030], [0.124, 0.548, 0.028], [0.110, 0.508, 0.026]] },
  { name: 'vastus_medialis', region: 'muscle_hip_thigh', big: 1, w: 0.032, d: 0.028, peak: 0.55, rings: 22,
    path: [[0.104, 0.882, 0.022], [0.104, 0.792, 0.030], [0.096, 0.700, 0.036], [0.088, 0.620, 0.038], [0.084, 0.556, 0.034], [0.086, 0.510, 0.028]] },
  { name: 'vastus_intermedius', region: 'muscle_hip_thigh', big: 0, w: 0.026, d: 0.020, peak: 0.5, rings: 18,
    path: [[0.118, 0.870, 0.010], [0.124, 0.780, 0.012], [0.122, 0.690, 0.014], [0.116, 0.610, 0.014]] },
  { name: 'biceps_femoris_long', region: 'muscle_hip_thigh', big: 1, w: 0.024, d: 0.022, peak: 0.42, rings: 22,
    path: [[0.058, 0.926, -0.050], [0.088, 0.850, -0.058], [0.108, 0.750, -0.056], [0.116, 0.650, -0.048], [0.124, 0.560, -0.036], [0.128, 0.508, -0.024]] },
  { name: 'biceps_femoris_short', region: 'muscle_hip_thigh', big: 0, w: 0.018, d: 0.016, peak: 0.45, rings: 16,
    path: [[0.118, 0.790, -0.046], [0.124, 0.700, -0.046], [0.130, 0.610, -0.040], [0.134, 0.548, -0.030]] },
  { name: 'semitendinosus', region: 'muscle_hip_thigh', big: 0, w: 0.019, d: 0.017, peak: 0.45, rings: 22,
    path: [[0.048, 0.924, -0.048], [0.074, 0.848, -0.056], [0.090, 0.750, -0.056], [0.096, 0.650, -0.050], [0.098, 0.560, -0.040], [0.094, 0.500, -0.026]] },
  { name: 'semimembranosus', region: 'muscle_hip_thigh', big: 0, w: 0.022, d: 0.018, flat: 0.85, peak: 0.45, rings: 20,
    path: [[0.038, 0.922, -0.040], [0.062, 0.848, -0.050], [0.080, 0.752, -0.052], [0.086, 0.656, -0.046], [0.086, 0.566, -0.036], [0.082, 0.508, -0.024]] },
  { name: 'gracilis', region: 'muscle_hip_thigh', big: 0, w: 0.013, d: 0.011, peak: 0.5, rings: 24,
    path: [[0.048, 0.906, 0.028], [0.070, 0.820, 0.028], [0.080, 0.720, 0.026], [0.082, 0.620, 0.024], [0.080, 0.540, 0.022], [0.070, 0.486, 0.016]] },
  { name: 'adductor_longus', region: 'muscle_hip_thigh', big: 0, w: 0.024, d: 0.018, flat: 0.8, peak: 0.45, rings: 18,
    path: [[0.032, 0.904, 0.036], [0.060, 0.840, 0.028], [0.078, 0.760, 0.018], [0.088, 0.660, 0.010], [0.090, 0.566, 0.004]] },
  { name: 'adductor_brevis', region: 'muscle_hip_thigh', big: 0, w: 0.018, d: 0.014, peak: 0.5,
    path: [[0.036, 0.902, 0.030], [0.066, 0.852, 0.024], [0.084, 0.792, 0.016]] },
  { name: 'adductor_magnus', region: 'muscle_hip_thigh', big: 1, w: 0.032, d: 0.026, peak: 0.45, rings: 20,
    path: [[0.038, 0.906, 0.018], [0.066, 0.842, 0.006], [0.084, 0.760, -0.010], [0.094, 0.672, -0.020], [0.098, 0.586, -0.024]] },
  { name: 'pectineus', region: 'muscle_hip_thigh', big: 0, w: 0.020, d: 0.014, flat: 0.75, peak: 0.5,
    path: [[0.022, 0.912, 0.046], [0.050, 0.882, 0.042], [0.078, 0.848, 0.036]] },

  // ---- leg ----
  { name: 'gastrocnemius_medial', region: 'muscle_leg', big: 1, w: 0.026, d: 0.022, peak: 0.38, rings: 18,
    path: [[0.078, 0.520, -0.032], [0.082, 0.452, -0.044], [0.086, 0.372, -0.042], [0.086, 0.290, -0.034], [0.084, 0.214, -0.026]] },
  { name: 'gastrocnemius_lateral', region: 'muscle_leg', big: 1, w: 0.024, d: 0.021, peak: 0.38, rings: 18,
    path: [[0.110, 0.518, -0.028], [0.116, 0.450, -0.040], [0.116, 0.372, -0.038], [0.110, 0.292, -0.030], [0.100, 0.216, -0.022]] },
  { name: 'soleus', region: 'muscle_leg', big: 1, w: 0.028, d: 0.022, flat: 0.85, peak: 0.42, rings: 20,
    path: [[0.098, 0.492, -0.036], [0.104, 0.420, -0.040], [0.102, 0.330, -0.036], [0.096, 0.250, -0.030], [0.090, 0.180, -0.024], [0.088, 0.120, -0.018]] },
  { name: 'plantaris', region: 'muscle_leg', big: 0, w: 0.006, d: 0.006, peak: 0.45, rings: 14,
    path: [[0.094, 0.506, -0.038], [0.096, 0.420, -0.042], [0.094, 0.330, -0.038], [0.092, 0.240, -0.030]] },
  { name: 'tibialis_anterior', region: 'muscle_leg', big: 0, w: 0.016, d: 0.014, peak: 0.4, rings: 18,
    path: [[0.092, 0.486, 0.020], [0.094, 0.412, 0.028], [0.090, 0.326, 0.030], [0.086, 0.240, 0.028], [0.082, 0.150, 0.024], [0.076, 0.096, 0.022]] },
  { name: 'extensor_digorum_longus', region: 'muscle_leg', big: 0, w: 0.013, d: 0.012, peak: 0.42, rings: 18,
    path: [[0.104, 0.484, 0.020], [0.106, 0.404, 0.026], [0.102, 0.318, 0.026], [0.096, 0.232, 0.022], [0.088, 0.150, 0.016], [0.080, 0.086, 0.014]] },
  { name: 'extensor_hallucis_longus', region: 'muscle_leg', big: 0, w: 0.011, d: 0.010, peak: 0.45, rings: 16,
    path: [[0.112, 0.478, 0.014], [0.114, 0.396, 0.020], [0.108, 0.308, 0.020], [0.100, 0.222, 0.016], [0.090, 0.140, 0.012]] },
  { name: 'peroneus_longus', region: 'muscle_leg', big: 0, w: 0.014, d: 0.012, peak: 0.4, rings: 18,
    path: [[0.126, 0.486, 0.002], [0.132, 0.406, 0.000], [0.128, 0.318, -0.002], [0.120, 0.232, -0.006], [0.112, 0.150, -0.010], [0.104, 0.096, -0.012]] },
  { name: 'peroneus_brevis', region: 'muscle_leg', big: 0, w: 0.011, d: 0.010, peak: 0.45, rings: 16,
    path: [[0.128, 0.452, -0.008], [0.126, 0.372, -0.012], [0.120, 0.290, -0.014], [0.112, 0.208, -0.014]] },
  { name: 'tibialis_posterior', region: 'muscle_leg', big: 0, w: 0.013, d: 0.012, peak: 0.45, rings: 16,
    path: [[0.110, 0.470, -0.022], [0.104, 0.392, -0.028], [0.096, 0.308, -0.030], [0.088, 0.226, -0.028], [0.082, 0.148, -0.022]] },
  { name: 'flexor_digorum_longus', region: 'muscle_leg', big: 0, w: 0.012, d: 0.011, peak: 0.45, rings: 16,
    path: [[0.118, 0.468, -0.026], [0.110, 0.388, -0.034], [0.100, 0.304, -0.036], [0.090, 0.222, -0.032], [0.082, 0.142, -0.026]] },
  { name: 'flexor_hallucis_longus', region: 'muscle_leg', big: 0, w: 0.010, d: 0.010, peak: 0.45, rings: 14,
    path: [[0.122, 0.462, -0.032], [0.114, 0.382, -0.040], [0.104, 0.300, -0.042], [0.094, 0.220, -0.038]] },
  { name: 'popliteus', region: 'muscle_leg', big: 0, w: 0.013, d: 0.011, flat: 0.9, peak: 0.5,
    path: [[0.112, 0.528, -0.020], [0.108, 0.502, -0.030], [0.100, 0.478, -0.036]] },
  { name: 'tensor_fascia_latae', region: 'muscle_hip_thigh', big: 0, w: 0.020, d: 0.016, flat: 0.85, peak: 0.45, rings: 14,
    path: [[0.140, 0.976, 0.012], [0.156, 0.912, 0.018], [0.160, 0.852, 0.022]] },
  { name: 'iliotibial_tract', region: 'tendon', big: 0, w: 0.016, d: 0.004, flat: 0.28, rings: 20,
    path: [[0.158, 0.900, 0.014], [0.160, 0.790, 0.018], [0.150, 0.660, 0.022], [0.132, 0.548, 0.024]] },

  // ---- tendons / aponeuroses ----
  { name: 'calcaneal_tendon', region: 'tendon', big: 0, w: 0.011, d: 0.006, flat: 0.6, rings: 14,
    path: [[0.090, 0.220, -0.030], [0.088, 0.150, -0.034], [0.086, 0.096, -0.038], [0.085, 0.056, -0.034]] },
  { name: 'patellar_ligament', region: 'tendon', big: 0, w: 0.012, d: 0.008, flat: 0.7, rings: 10,
    path: [[0.095, 0.502, 0.044], [0.094, 0.470, 0.040], [0.092, 0.440, 0.032]] },
  { name: 'quadriceps_tendon', region: 'tendon', big: 0, w: 0.024, d: 0.008, flat: 0.4, rings: 12,
    path: [[0.108, 0.548, 0.040], [0.100, 0.522, 0.046], [0.094, 0.506, 0.046]] },
  { name: 'common_flexor_tendon', region: 'tendon', big: 0, w: 0.010, d: 0.006, rings: 8,
    path: [[0.236, 1.096, 0.020], [0.242, 1.064, 0.024], [0.246, 1.036, 0.026]] },
  { name: 'common_extensor_tendon', region: 'tendon', big: 0, w: 0.010, d: 0.006, rings: 8,
    path: [[0.242, 1.098, 0.006], [0.248, 1.066, 0.010], [0.252, 1.038, 0.012]] },
  { name: 'distal_biceps_tendon', region: 'tendon', big: 0, w: 0.009, d: 0.006, rings: 8,
    path: [[0.222, 1.106, 0.030], [0.228, 1.078, 0.030], [0.234, 1.052, 0.028]] },
  { name: 'achilles_expansion', region: 'tendon', big: 0, w: 0.014, d: 0.006, flat: 0.5, rings: 10,
    path: [[0.086, 0.130, -0.040], [0.085, 0.086, -0.044], [0.085, 0.052, -0.040]] },
];

/**
 * Diaphragm — a real dome, not an arch: peripheral muscular slips attach low at
 * the costal rim, the sheet rises to a central tendon near T8, and the vena cava
 * and oesophageal foramina are punched through it. Hard-clipped to the deep
 * fascia envelope so it can never reach the skin.
 */
function diaphragm(quality) {
  const c = [0, 1.052, 0.004];
  const Ro = [0.1285, 0.1865, 0.1305];
  const Ri = [0.1240, 0.1820, 0.1260];
  const high = quality !== 'lite';
  const sdf = (p) => {
    const ly = p[1] - c[1];
    let d = smax(sdEllipsoid([p[0], ly, p[2]], Ro), -sdEllipsoid([p[0], ly - 0.0035, p[2]], Ri), 0.0015);
    d = Math.max(d, 1.096 - p[1]);              // the sheet ends at the costal rim
    d = Math.max(d, muscleEnvelope(p));          // and never outside the fascia
    const ivc = sdCapsule(p, [0.010, 1.212, 0.026], [0.022, 1.246, 0.040], 0.0092);
    const oes = sdCapsule(p, [0.000, 1.128, -0.010], [0.008, 1.166, -0.002], 0.0062);
    d = ssub(ivc, d, 0.002);
    d = ssub(oes, d, 0.002);
    return d;
  };
  const geom = meshSDF(sdf, [-0.142, 1.094, -0.140], [0.142, 1.252, 0.148],
    high ? [58, 26, 58] : [38, 18, 38]);
  geom.computeVertexNormals();
  ensureOutward(geom);

  // Central tendon: the pale aponeurotic lens at the apex of the dome.
  const ct = meshSDF((p) => {
    let d = sdEllipsoid([p[0], p[1] - 1.2325, p[2] - 0.034], [0.0540, 0.0110, 0.0480]);
    return Math.max(d, muscleEnvelope(p));
  }, [-0.062, 1.216, -0.026], [0.062, 1.248, 0.094], high ? [30, 12, 30] : [20, 10, 20]);
  ct.computeVertexNormals();
  ensureOutward(ct);
  return [{ geometry: geom, name: 'diaphragm', region: 'muscle_axial' },
    { geometry: ct, name: 'central_tendon', region: 'tendon' }];
}

/** Per-side muscle groups that get merged into one region mesh. */
export function buildMamsa(quality = 'high') {
  const byRegion = new Map();
  const push = (region, m) => {
    if (!byRegion.has(region)) byRegion.set(region, { geoms: [], names: [] });
    byRegion.get(region).geoms.push(m.geometry);
    byRegion.get(region).names.push(m.name);
  };

  for (const def of MUSCLES) {
    for (const side of [false, true]) {
      const m = muscle(def, quality, side);
      push(def.region, m);
    }
  }
  for (const m of diaphragm(quality)) push(m.region, m);

  for (const def of MUSCLES.filter((d) => d.region === 'tendon')) {
    for (const side of [false, true]) push('tendon', tendon(def, quality, side));
  }

  // Forearm/hand flexor & extensor groups already exist as individual bellies;
  // add the deep finger extensor fan so the dorsum is not bare.
  const fanDefs = [];
  for (let f = 0; f < 4; f++) {
    const x = 0.262 - f * 0.005;
    fanDefs.push({
      name: `extensor_digitorum_fan_${f + 1}`, region: 'muscle_forearm', w: 0.005, d: 0.004, peak: 0.5,
      path: [[x, 0.872, 0.014], [x + 0.002, 0.826, 0.016], [x + 0.004, 0.786, 0.018]],
    });
  }
  for (const def of fanDefs) for (const side of [false, true]) push(def.region, muscle(def, quality, side));

  const parts = [];
  for (const [region, v] of byRegion) {
    parts.push(part(`mamsa_${region}`, 'mamsa', region, mergeGeoms(v.geoms), { parts: v.names }));
  }
  return parts;
}

