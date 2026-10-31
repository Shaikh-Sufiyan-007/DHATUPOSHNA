// Anatomical Constants and Reference Landmarks for Adult Human Skeleton (1.72 m)
export const TOTAL_HEIGHT = 1.72; // meters

// Landmark heights as fraction of H = 1.72 (m)
export const LANDMARK_FRACTIONS = {
  SKULL_TOP: 1.00,       // 1.720 m
  FRANKFURT_PLANE: 0.93, // 1.600 m
  CHIN_MENTON: 0.87,     // 1.496 m
  C1_ATLAS: 0.865,       // 1.488 m
  C7_SPINOUS: 0.820,     // 1.410 m
  ACROMION: 0.820,       // 1.410 m
  STERNAL_NOTCH: 0.810,  // 1.393 m
  ELBOW_JOINT: 0.630,    // 1.084 m
  L1_VERTEBRA: 0.630,    // 1.084 m
  ILIAC_CREST: 0.600,    // 1.032 m
  WRIST_JOINT: 0.485,    // 0.834 m
  FINGER_TIPS: 0.380,    // 0.654 m
  HIP_JOINT: 0.530,      // 0.912 m (center of femoral head)
  PUBIC_SYMPHYSIS: 0.505,// 0.869 m
  KNEE_JOINT: 0.285,     // 0.490 m (tibiofemoral joint line)
  ANKLE_JOINT: 0.040,    // 0.069 m (talocrural joint)
  FOOT_SOLE: 0.000,      // 0.000 m
};

// Spine vertebra target heights (center of vertebral body in meters from soles)
// Total 24 articulating vertebrae: C1-C7, T1-T12, L1-L5 + Sacrum + Coccyx
// Natural curves: Cervical lordosis (Z forward), Thoracic kyphosis (Z back), Lumbar lordosis (Z forward)
// Overall axis: mean Z of C1-L5 vertebral bodies is strictly 0.000
export const SPINE_VERTEBRA_CONFIG = [
  // Cervical (C1-C7)
  { tag: 'C1', name: 'C1_atlas', region: 'cervical', y: 1.485, z: 0.008, bodyW: 0.024, bodyD: 0.020, bodyH: 0.012 },
  { tag: 'C2', name: 'C2_axis', region: 'cervical', y: 1.470, z: 0.012, bodyW: 0.021, bodyD: 0.018, bodyH: 0.014 },
  { tag: 'C3', name: 'C3', region: 'cervical', y: 1.454, z: 0.015, bodyW: 0.022, bodyD: 0.017, bodyH: 0.013 },
  { tag: 'C4', name: 'C4', region: 'cervical', y: 1.439, z: 0.016, bodyW: 0.023, bodyD: 0.018, bodyH: 0.013 },
  { tag: 'C5', name: 'C5', region: 'cervical', y: 1.424, z: 0.015, bodyW: 0.024, bodyD: 0.019, bodyH: 0.013 },
  { tag: 'C6', name: 'C6', region: 'cervical', y: 1.408, z: 0.012, bodyW: 0.025, bodyD: 0.020, bodyH: 0.014 },
  { tag: 'C7', name: 'C7', region: 'cervical', y: 1.391, z: 0.008, bodyW: 0.026, bodyD: 0.021, bodyH: 0.015 },

  // Thoracic (T1-T12)
  { tag: 'T1', name: 'T1', region: 'thoracic', y: 1.371, z: 0.002, bodyW: 0.027, bodyD: 0.022, bodyH: 0.016 },
  { tag: 'T2', name: 'T2', region: 'thoracic', y: 1.349, z: -0.006, bodyW: 0.028, bodyD: 0.023, bodyH: 0.017 },
  { tag: 'T3', name: 'T3', region: 'thoracic', y: 1.326, z: -0.014, bodyW: 0.029, bodyD: 0.024, bodyH: 0.018 },
  { tag: 'T4', name: 'T4', region: 'thoracic', y: 1.302, z: -0.020, bodyW: 0.030, bodyD: 0.025, bodyH: 0.019 },
  { tag: 'T5', name: 'T5', region: 'thoracic', y: 1.277, z: -0.024, bodyW: 0.031, bodyD: 0.026, bodyH: 0.020 },
  { tag: 'T6', name: 'T6', region: 'thoracic', y: 1.251, z: -0.026, bodyW: 0.032, bodyD: 0.027, bodyH: 0.021 },
  { tag: 'T7', name: 'T7', region: 'thoracic', y: 1.224, z: -0.026, bodyW: 0.033, bodyD: 0.028, bodyH: 0.022 },
  { tag: 'T8', name: 'T8', region: 'thoracic', y: 1.196, z: -0.023, bodyW: 0.034, bodyD: 0.029, bodyH: 0.023 },
  { tag: 'T9', name: 'T9', region: 'thoracic', y: 1.167, z: -0.018, bodyW: 0.035, bodyD: 0.030, bodyH: 0.023 },
  { tag: 'T10', name: 'T10', region: 'thoracic', y: 1.137, z: -0.011, bodyW: 0.036, bodyD: 0.031, bodyH: 0.024 },
  { tag: 'T11', name: 'T11', region: 'thoracic', y: 1.106, z: -0.003, bodyW: 0.038, bodyD: 0.032, bodyH: 0.024 },
  { tag: 'T12', name: 'T12', region: 'thoracic', y: 1.074, z: 0.006, bodyW: 0.040, bodyD: 0.033, bodyH: 0.025 },

  // Lumbar (L1-L5)
  { tag: 'L1', name: 'L1', region: 'lumbar', y: 1.040, z: 0.015, bodyW: 0.042, bodyD: 0.034, bodyH: 0.026 },
  { tag: 'L2', name: 'L2', region: 'lumbar', y: 1.004, z: 0.022, bodyW: 0.044, bodyD: 0.035, bodyH: 0.027 },
  { tag: 'L3', name: 'L3', region: 'lumbar', y: 0.966, z: 0.026, bodyW: 0.046, bodyD: 0.036, bodyH: 0.028 },
  { tag: 'L4', name: 'L4', region: 'lumbar', y: 0.926, z: 0.024, bodyW: 0.048, bodyD: 0.037, bodyH: 0.029 },
  { tag: 'L5', name: 'L5', region: 'lumbar', y: 0.884, z: 0.016, bodyW: 0.050, bodyD: 0.038, bodyH: 0.029 },

  // Sacrum & Coccyx
  { tag: 'S', name: 'sacrum', region: 'sacral', y: 0.800, z: -0.012, bodyW: 0.105, bodyD: 0.065, bodyH: 0.115 },
  { tag: 'Co', name: 'coccyx', region: 'coccygeal', y: 0.725, z: -0.040, bodyW: 0.025, bodyD: 0.015, bodyH: 0.032 },
];

