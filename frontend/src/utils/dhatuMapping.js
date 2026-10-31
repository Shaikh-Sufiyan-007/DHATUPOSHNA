// DHATUPOSHNA — Complete Layered Human Anatomy & Dhatu Epistemology Mapping
// Connects the 7 Ayurvedic Dhatus to the 8 Anatomical Body Layers & Regions

export const DHATU_TO_LAYERS = {
  rasa: ['rasa'],
  rakta: ['rakta'],
  mamsa: ['mamsa'],
  meda: ['meda'],
  asthi: ['asthi'],
  majja: ['majja'],
  shukra: ['shukra']
};

export const DHATU_TO_REGIONS = {
  rasa: ['heart', 'lymph_duct', 'lymph_node', 'thymus'],
  rakta: ['heart', 'artery', 'vein', 'liver', 'spleen'],
  mamsa: [
    'muscle_head_neck', 'muscle_upper_arm', 'muscle_pectorial', 'muscle_forearm',
    'muscle_back', 'muscle_abdominal', 'tendon', 'muscle_axial', 'muscle_hip_thigh', 'muscle_leg'
  ],
  meda: ['fat_subcutaneous', 'fat_omentum', 'fat_perirenal', 'kidney'],
  asthi: [
    'head', 'cervical', 'thoracic_spine', 'lumbar_spine', 'sacrum_coccyx',
    'thorax', 'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R',
    'hand_L', 'hand_R', 'pelvis', 'leg_L', 'leg_R', 'foot_L', 'foot_R'
  ],
  majja: ['cervical', 'brain', 'cerebellum', 'brainstem', 'spinal_cord', 'cauda_equina', 'nerve', 'marrow'],
  shukra: ['testis', 'vas_deferens', 'seminal_vesicle', 'prostate']
};

export const DHATU_LAYER_STATES = {
  rasa: {
    targetLayers: ['rasa'],
    ghostLayers: ['shell', 'meda', 'mamsa', 'rakta'],
    ghostRegions: ['thorax', 'lumbar_spine']
  },
  rakta: {
    targetLayers: ['rakta'],
    ghostLayers: ['shell', 'meda', 'mamsa'],
    ghostRegions: ['thorax']
  },
  mamsa: {
    targetLayers: ['mamsa'],
    ghostLayers: ['shell', 'meda'],
    ghostRegions: []
  },
  meda: {
    targetLayers: ['meda'],
    ghostLayers: ['shell', 'mamsa'],
    ghostRegions: []
  },
  asthi: {
    targetLayers: ['asthi'],
    ghostLayers: ['shell', 'meda', 'mamsa', 'rakta', 'rasa', 'shukra', 'majja'],
    ghostRegions: []
  },
  majja: {
    targetLayers: ['majja'],
    ghostLayers: ['shell', 'meda', 'mamsa', 'rakta', 'rasa', 'shukra'],
    ghostRegions: [
      'head', 'cervical', 'thoracic_spine', 'lumbar_spine', 'sacrum_coccyx',
      'thorax', 'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R',
      'hand_L', 'hand_R', 'pelvis', 'leg_L', 'leg_R', 'foot_L', 'foot_R'
    ]
  },
  shukra: {
    targetLayers: ['shukra'],
    ghostLayers: ['shell', 'meda', 'mamsa'],
    ghostRegions: ['pelvis']
  }
};

export const REGION_TO_PRIMARY_DHATU = {
  // Rasa
  lymph_duct: 'rasa',
  lymph_node: 'rasa',
  thymus: 'rasa',

  // Rakta
  heart: 'rakta', // Shared Hridaya anchor with Rasa
  artery: 'rakta',
  vein: 'rakta',
  liver: 'rakta',
  spleen: 'rakta',

  // Mamsa
  muscle_head_neck: 'mamsa',
  muscle_upper_arm: 'mamsa',
  muscle_pectorial: 'mamsa',
  muscle_forearm: 'mamsa',
  muscle_back: 'mamsa',
  muscle_abdominal: 'mamsa',
  tendon: 'mamsa',
  muscle_axial: 'mamsa',
  muscle_hip_thigh: 'mamsa',
  muscle_leg: 'mamsa',

  // Meda
  fat_subcutaneous: 'meda',
  fat_omentum: 'meda',
  fat_perirenal: 'meda',
  kidney: 'meda',

  // Asthi
  head: 'asthi',
  cervical: 'asthi',
  thoracic_spine: 'asthi',
  lumbar_spine: 'asthi',
  sacrum_coccyx: 'asthi',
  thorax: 'asthi',
  shoulder_L: 'asthi',
  shoulder_R: 'asthi',
  arm_L: 'asthi',
  arm_R: 'asthi',
  hand_L: 'asthi',
  hand_R: 'asthi',
  pelvis: 'asthi',
  leg_L: 'asthi',
  leg_R: 'asthi',
  foot_L: 'asthi',
  foot_R: 'asthi',

  // Majja
  brain: 'majja',
  cerebellum: 'majja',
  brainstem: 'majja',
  spinal_cord: 'majja',
  cauda_equina: 'majja',
  nerve: 'majja',
  marrow: 'majja',

  // Shukra
  testis: 'shukra',
  vas_deferens: 'shukra',
  seminal_vesicle: 'shukra',
  prostate: 'shukra'
};

export const DHATU_MAPPINGS = [
  {
    modelRegion: 'region_rasa',
    layer: 'rasa',
    regions: DHATU_TO_REGIONS.rasa,
    dhatuSlug: 'rasa',
    sequence: 1,
    name: 'Rasa',
    sanskritName: 'रस',
    uiColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    educationalFocus: 'Cardiovascular Plasma & Lymphatic Nexus (Hridaya & Thoracic Duct)',
    cameraTarget: [0, 0.8226, 0.0277],
    cameraPosition: [0.278, 1.008, 1.8442],
  },
  {
    modelRegion: 'region_rakta',
    layer: 'rakta',
    regions: DHATU_TO_REGIONS.rakta,
    dhatuSlug: 'rakta',
    sequence: 2,
    name: 'Rakta',
    sanskritName: 'रक्त',
    uiColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    educationalFocus: 'Vascular Network & Hemoglobin Conduits (Yakrit, Pleeha & Arterial Tree)',
    cameraTarget: [0, 0.7816, 0.0165],
    cameraPosition: [0.3954, 0.8805, 1.9541],
  },
  {
    modelRegion: 'region_mamsa',
    layer: 'mamsa',
    regions: DHATU_TO_REGIONS.mamsa,
    dhatuSlug: 'mamsa',
    sequence: 3,
    name: 'Mamsa',
    sanskritName: 'मांस',
    uiColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    educationalFocus: 'Musculoskeletal Mantle & Structural Form (Pectorals, Core & Limbs)',
    cameraTarget: [0.0001, 0.8408, 0.0266],
    cameraPosition: [0.0001, 0.9478, 2.1669],
  },
  {
    modelRegion: 'region_meda',
    layer: 'meda',
    regions: DHATU_TO_REGIONS.meda,
    dhatuSlug: 'meda',
    sequence: 4,
    name: 'Meda',
    sanskritName: 'मेद',
    uiColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    educationalFocus: 'Adipose & Lipid Depots (Greater Omentum & Lumbar Snehana Layers)',
    cameraTarget: [-0.0001, 0.8687, 0.0237],
    cameraPosition: [-0.5774, 0.9842, 2.2636],
  },
  {
    modelRegion: 'region_asthi',
    layer: 'asthi',
    regions: DHATU_TO_REGIONS.asthi,
    dhatuSlug: 'asthi',
    sequence: 5,
    name: 'Asthi',
    sanskritName: 'अस्थि',
    uiColor: '#f1f5f9',
    glowColor: 'rgba(241, 245, 249, 0.4)',
    educationalFocus: 'Skeletal Framework & Articulations (Cranium, Spine, Ribcage & Long Bones)',
    cameraTarget: [0, 0.8639, 0.0206],
    cameraPosition: [0, 1.0482, 2.3242],
  },
  {
    modelRegion: 'region_majja',
    layer: 'majja',
    regions: DHATU_TO_REGIONS.majja,
    dhatuSlug: 'majja',
    sequence: 6,
    name: 'Majja',
    sanskritName: 'मज्जा',
    uiColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    educationalFocus: 'Neural Axis & Medullary Marrow (Sushumna, Brainstem & Medullary Cavities)',
    cameraTarget: [0, 0.8595, 0.0208],
    cameraPosition: [0.6673, 1.4156, 2.0671],
  },
  {
    modelRegion: 'region_shukra',
    layer: 'shukra',
    regions: DHATU_TO_REGIONS.shukra,
    dhatuSlug: 'shukra',
    sequence: 7,
    name: 'Shukra',
    sanskritName: 'शुक्र',
    uiColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    educationalFocus: 'Reproductive Locus & Systemic Vitality Essence (Pelvic Core & Ojas Conduits)',
    cameraTarget: [0, 0.8468, 0.0193],
    cameraPosition: [0.0421, 0.6996, 0.4104],
  },
];

export function getMappingByMeshName(meshName, region) {
  if (!meshName && !region) return null;

  // Direct region match
  const r = region || (meshName && REGION_TO_PRIMARY_DHATU[meshName] ? meshName : null);
  if (r && REGION_TO_PRIMARY_DHATU[r]) {
    return getMappingBySlug(REGION_TO_PRIMARY_DHATU[r]);
  }

  // Fallback to legacy mesh name match
  return DHATU_MAPPINGS.find(
    (m) =>
      meshName === m.modelRegion ||
      meshName?.startsWith(m.dhatuSlug) ||
      meshName?.includes(m.modelRegion)
  ) || null;
}

export function getMappingBySlug(slug) {
  if (!slug) return null;
  return DHATU_MAPPINGS.find((m) => m.dhatuSlug.toLowerCase() === slug.toLowerCase()) || null;
}

export function getAnatomicalPartLabel(meshName) {
  if (!meshName) return '';
  const side = meshName.endsWith('_L') ? ' (Left)' : meshName.endsWith('_R') ? ' (Right)' : '';
  const cleanName = meshName.replace(/_[LR]$/, '').replace(/_/g, ' ');
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + side;
}
