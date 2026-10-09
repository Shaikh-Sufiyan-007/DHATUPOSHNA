export const DHATU_MAPPINGS = [
  {
    modelRegion: 'region_rasa',
    dhatuSlug: 'rasa',
    sequence: 1,
    name: 'Rasa',
    sanskritName: 'रस',
    uiColor: '#38bdf8', // Luminous Aqua / Fluid
    glowColor: 'rgba(56, 189, 248, 0.4)',
    educationalFocus: 'Cardiovascular Plasma & Lymphatic Nexus (Hridaya & Thoracic Duct)',
    cameraTarget: [0, 1.25, 0.04],
    cameraPosition: [0, 1.3, 1.8],
  },
  {
    modelRegion: 'region_rakta',
    dhatuSlug: 'rakta',
    sequence: 2,
    name: 'Rakta',
    sanskritName: 'रक्त',
    uiColor: '#ef4444', // Crimson Blood Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    educationalFocus: 'Vascular Network & Hemoglobin Conduits (Yakrit, Pleeha & Arterial Tree)',
    cameraTarget: [0, 1.15, 0.02],
    cameraPosition: [0, 1.2, 1.9],
  },
  {
    modelRegion: 'region_mamsa',
    dhatuSlug: 'mamsa',
    sequence: 3,
    name: 'Mamsa',
    sanskritName: 'मांस',
    uiColor: '#f97316', // Amber / Ochre Muscle Tone
    glowColor: 'rgba(249, 115, 22, 0.4)',
    educationalFocus: 'Musculoskeletal Mantle & Structural Form (Pectorals, Core & Limbs)',
    cameraTarget: [0, 1.1, 0.05],
    cameraPosition: [0, 1.1, 2.1],
  },
  {
    modelRegion: 'region_meda',
    dhatuSlug: 'meda',
    sequence: 4,
    name: 'Meda',
    sanskritName: 'मेद',
    uiColor: '#eab308', // Golden Lipid
    glowColor: 'rgba(234, 179, 8, 0.4)',
    educationalFocus: 'Adipose & Lipid Depots (Greater Omentum & Lumbar Snehana Layers)',
    cameraTarget: [0, 0.98, 0.02],
    cameraPosition: [0, 1.0, 1.8],
  },
  {
    modelRegion: 'region_asthi',
    dhatuSlug: 'asthi',
    sequence: 5,
    name: 'Asthi',
    sanskritName: 'अस्थि',
    uiColor: '#f1f5f9', // Bone Ivory White
    glowColor: 'rgba(241, 245, 249, 0.4)',
    educationalFocus: 'Skeletal Framework & Articulations (Cranium, Spine, Ribcage & Long Bones)',
    cameraTarget: [0, 0.95, 0.0],
    cameraPosition: [0, 1.0, 2.2],
  },
  {
    modelRegion: 'region_majja',
    dhatuSlug: 'majja',
    sequence: 6,
    name: 'Majja',
    sanskritName: 'मज्जा',
    uiColor: '#a855f7', // Royal Violet Neural Glow
    glowColor: 'rgba(168, 85, 247, 0.4)',
    educationalFocus: 'Neural Axis & Medullary Marrow (Sushumna, Brainstem & Medullary Cavities)',
    cameraTarget: [0, 1.35, -0.02],
    cameraPosition: [0, 1.3, 1.9],
  },
  {
    modelRegion: 'region_shukra',
    dhatuSlug: 'shukra',
    sequence: 7,
    name: 'Shukra',
    sanskritName: 'शुक्र',
    uiColor: '#10b981', // Emerald Vitality Green
    glowColor: 'rgba(16, 185, 129, 0.4)',
    educationalFocus: 'Reproductive Locus & Systemic Vitality Essence (Pelvic Core & Ojas Conduits)',
    cameraTarget: [0, 0.73, 0.03],
    cameraPosition: [0, 0.8, 1.7],
  },
];

// Helper to look up mapping by 3D object name
export function getMappingByMeshName(meshName) {
  if (!meshName) return null;
  return DHATU_MAPPINGS.find(
    (m) =>
      meshName === m.modelRegion ||
      meshName.startsWith(m.dhatuSlug) ||
      meshName.includes(m.modelRegion)
  ) || null;
}

// Helper to look up mapping by slug
export function getMappingBySlug(slug) {
  if (!slug) return null;
  return DHATU_MAPPINGS.find((m) => m.dhatuSlug.toLowerCase() === slug.toLowerCase()) || null;
}
