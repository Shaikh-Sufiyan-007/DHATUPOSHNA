// Explore3D Layered Body Registry — single source of truth for layers, regions,
// Dhatu tagging, per-Dhatu layer states, overview opacities and tissue colours.
//
// Frame: metres, Y up, anterior faces +Z, anatomical LEFT = +X, H = 1.72 m.
// This is the same frame the existing skeleton assets are baked in.

export const LAYERS = ['shell', 'meda', 'mamsa', 'rakta', 'rasa', 'shukra', 'majja', 'asthi'];

// Radial order outside -> inside, used for renderOrder of ghosted (transparent) layers.
export const LAYER_DEPTH_RANK = {
  shell: 0,
  meda: 1,
  mamsa: 2,
  rakta: 3,
  rasa: 3,
  shukra: 3,
  majja: 3,
  asthi: 4,
};

// ---------------------------------------------------------------------------
// Regions. A mesh belongs to exactly ONE region; a Dhatu may own MANY regions,
// and one region may be tagged by more than one Dhatu (the heart: Rasa + Rakta,
// because the original Rasa copy names Hridaya alongside the thoracic duct).
// layer 'asthi' regions are the pre-existing skeleton region ids — unchanged.
// ---------------------------------------------------------------------------
export const REGION_DEFINITIONS = [
  // Shell — silhouette only, deliberately not a Dhatu
  { id: 'skin_shell', layer: 'shell', dhatus: [], label: 'Skin (Silhouette)' },

  // Meda — adipose depots
  { id: 'fat_subcutaneous', layer: 'meda', dhatus: ['meda'], label: 'Subcutaneous Adipose (Medas)' },
  { id: 'fat_omentum', layer: 'meda', dhatus: ['meda'], label: 'Greater Omentum' },
  { id: 'fat_perirenal', layer: 'meda', dhatus: ['meda'], label: 'Perirenal Adipose' },
  { id: 'kidney', layer: 'meda', dhatus: ['meda'], label: 'Renal Tissue (Vrikka)' },

  // Mamsa — skeletal muscle + tendons + diaphragm
  { id: 'muscle_axial', layer: 'mamsa', dhatus: ['mamsa'], label: 'Axial Musculature' },
  { id: 'muscle_pectorial', layer: 'mamsa', dhatus: ['mamsa'], label: 'Pectorial Musculature' },
  { id: 'muscle_back', layer: 'mamsa', dhatus: ['mamsa'], label: 'Dorsal Musculature' },
  { id: 'muscle_abdominal', layer: 'mamsa', dhatus: ['mamsa'], label: 'Abdominal Musculature' },
  { id: 'muscle_upper_arm', layer: 'mamsa', dhatus: ['mamsa'], label: 'Arm Musculature' },
  { id: 'muscle_forearm', layer: 'mamsa', dhatus: ['mamsa'], label: 'Forearm Musculature' },
  { id: 'muscle_hip_thigh', layer: 'mamsa', dhatus: ['mamsa'], label: 'Gluteal & Thigh Musculature' },
  { id: 'muscle_leg', layer: 'mamsa', dhatus: ['mamsa'], label: 'Leg Musculature' },
  { id: 'muscle_head_neck', layer: 'mamsa', dhatus: ['mamsa'], label: 'Head & Neck Musculature' },
  { id: 'tendon', layer: 'mamsa', dhatus: ['mamsa'], label: 'Tendinous Insertions' },

  // Rakta — heart, vessels, liver, spleen
  { id: 'heart', layer: 'rakta', dhatus: ['rasa', 'rakta'], label: 'Heart (Hridaya)' },
  { id: 'artery', layer: 'rakta', dhatus: ['rakta'], label: 'Arterial Tree (Dhamani)' },
  { id: 'vein', layer: 'rakta', dhatus: ['rakta'], label: 'Venous Tree (Sira)' },
  { id: 'liver', layer: 'rakta', dhatus: ['rakta'], label: 'Liver (Yakrit)' },
  { id: 'spleen', layer: 'rakta', dhatus: ['rakta'], label: 'Spleen (Pleeha)' },

  // Rasa — lymphatic conduit and nodes
  { id: 'lymph_duct', layer: 'rasa', dhatus: ['rasa'], label: 'Thoracic & Right Lymphatic Ducts' },
  { id: 'lymph_node', layer: 'rasa', dhatus: ['rasa'], label: 'Lymph Node Chains' },
  { id: 'thymus', layer: 'rasa', dhatus: ['rasa'], label: 'Thymus' },

  // Majja — neural axis + marrow
  { id: 'brain', layer: 'majja', dhatus: ['majja'], label: 'Cerebrum (Majja)' },
  { id: 'cerebellum', layer: 'majja', dhatus: ['majja'], label: 'Cerebellum' },
  { id: 'brainstem', layer: 'majja', dhatus: ['majja'], label: 'Brainstem' },
  { id: 'spinal_cord', layer: 'majja', dhatus: ['majja'], label: 'Spinal Cord (Sushumna)' },
  { id: 'cauda_equina', layer: 'majja', dhatus: ['majja'], label: 'Conus & Cauda Equina' },
  { id: 'nerve', layer: 'majja', dhatus: ['majja'], label: 'Major Peripheral Nerves' },
  { id: 'marrow', layer: 'majja', dhatus: ['majja'], label: 'Medullary Marrow (Majja Dhatu)' },

  // Shukra — male reproductive organs (internal, medical-atlas style)
  { id: 'testis', layer: 'shukra', dhatus: ['shukra'], label: 'Testes & Epididymides (Shukra)' },
  { id: 'vas_deferens', layer: 'shukra', dhatus: ['shukra'], label: 'Vas Deferens (Sira Shukra)' },
  { id: 'seminal_vesicle', layer: 'shukra', dhatus: ['shukra'], label: 'Seminal Vesicles' },
  { id: 'prostate', layer: 'shukra', dhatus: ['shukra'], label: 'Prostate Gland' },

  // Asthi — the existing skeleton's 17 regions, re-declared here for the registry only.
  { id: 'head', layer: 'asthi', dhatus: ['asthi'], label: 'Cranial & Facial Skeleton', preexisting: true },
  { id: 'cervical', layer: 'asthi', dhatus: ['majja', 'asthi'], label: 'Cervical Spine', preexisting: true },
  { id: 'thoracic_spine', layer: 'asthi', dhatus: ['asthi'], label: 'Thoracic Spine', preexisting: true },
  { id: 'lumbar_spine', layer: 'asthi', dhatus: ['asthi'], label: 'Lumbar Spine', preexisting: true },
  { id: 'sacrum_coccyx', layer: 'asthi', dhatus: ['asthi'], label: 'Sacrum & Coccyx', preexisting: true },
  { id: 'thorax', layer: 'asthi', dhatus: ['asthi'], label: 'Thoracic Cage', preexisting: true },
  { id: 'shoulder_L', layer: 'asthi', dhatus: ['asthi'], label: 'Left Shoulder Girdle', preexisting: true },
  { id: 'shoulder_R', layer: 'asthi', dhatus: ['asthi'], label: 'Right Shoulder Girdle', preexisting: true },
  { id: 'arm_L', layer: 'asthi', dhatus: ['asthi'], label: 'Left Arm', preexisting: true },
  { id: 'arm_R', layer: 'asthi', dhatus: ['asthi'], label: 'Right Arm', preexisting: true },
  { id: 'hand_L', layer: 'asthi', dhatus: ['asthi'], label: 'Left Hand', preexisting: true },
  { id: 'hand_R', layer: 'asthi', dhatus: ['asthi'], label: 'Right Hand', preexisting: true },
  { id: 'pelvis', layer: 'asthi', dhatus: ['asthi'], label: 'Pelvic Girdle', preexisting: true },
  { id: 'leg_L', layer: 'asthi', dhatus: ['asthi'], label: 'Left Leg', preexisting: true },
  { id: 'leg_R', layer: 'asthi', dhatus: ['asthi'], label: 'Right Leg', preexisting: true },
  { id: 'foot_L', layer: 'asthi', dhatus: ['asthi'], label: 'Left Foot', preexisting: true },
  { id: 'foot_R', layer: 'asthi', dhatus: ['asthi'], label: 'Right Foot', preexisting: true },
];

export const REGION_INDEX = new Map(REGION_DEFINITIONS.map((r) => [r.id, r]));

// Which pre-existing skeleton region each bone belongs to is already encoded in
// explore-skeleton.glb node extras; asthi layers are read, never rewritten.

// ---------------------------------------------------------------------------
// PER-DHATU LAYER STATE TABLE — the one place to review/tweak what happens when
// a Dhatu is selected.
//   ghost   : layers that lie OUTSIDE the target and would hide it -> opacity <= 0.08
//   ghostRegions: extra region ids (always deeper layers that still physically
//                 wrap the target, e.g. the rib cage over the heart) -> ghost
//   context : everything else -> dimmed, desaturated, opaque
// ---------------------------------------------------------------------------
export const DHATU_LAYER_STATES = {
  rasa: {
    targetLayers: ['rasa'],
    ghostLayers: ['shell', 'meda', 'mamsa', 'rakta'],
    ghostRegions: ['thorax', 'lumbar_spine'],
  },
  rakta: {
    targetLayers: ['rakta'],
    ghostLayers: ['shell', 'meda', 'mamsa'],
    ghostRegions: ['thorax'],
  },
  mamsa: {
    targetLayers: ['mamsa'],
    ghostLayers: ['shell', 'meda'],
    ghostRegions: [],
  },
  meda: {
    targetLayers: ['meda'],
    ghostLayers: ['shell', 'mamsa'],
    ghostRegions: [],
  },
  asthi: {
    targetLayers: ['asthi'],
    ghostLayers: ['shell', 'meda', 'mamsa', 'rakta', 'rasa', 'shukra', 'majja'],
    ghostRegions: [],
  },
  majja: {
    targetLayers: ['majja'],
    ghostLayers: ['shell', 'meda', 'mamsa', 'rakta', 'rasa', 'shukra'],
    ghostRegions: ['head', 'cervical', 'thoracic_spine', 'lumbar_spine', 'sacrum_coccyx', 'thorax',
      'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R', 'hand_L', 'hand_R',
      'pelvis', 'leg_L', 'leg_R', 'foot_L', 'foot_R'],
  },
  shukra: {
    targetLayers: ['shukra'],
    ghostLayers: ['shell', 'meda', 'mamsa'],
    ghostRegions: ['pelvis'],
  },
};

/**
 * Resolve the render state of one mesh for the given selected Dhatu.
 * @returns {'overview'|'target'|'hover'|'ghost'|'context'}
 */
export function resolveState(slug, regionId, layer, meshDhatus, hoveredSlug = null) {
  if (!slug) return 'overview';
  const tags = meshDhatus || [];
  if (tags.includes(slug)) return hoveredSlug === slug ? 'hover' : 'target';
  const conf = DHATU_LAYER_STATES[slug];
  if (!conf) return 'context';
  if (conf.ghostLayers.includes(layer) || conf.ghostRegions.includes(regionId)) return 'ghost';
  return 'context';
}

// ---------------------------------------------------------------------------
// OVERVIEW OPACITY — single constant that must keep all seven Dhatus readable at
// a glance. Values chosen so the shell is a very light ghost, fat reads as a soft
// translucent wrap, muscle stays semi-ghosted, and everything deep is opaque.
// ---------------------------------------------------------------------------
export const OVERVIEW_OPACITY = {
  shell: 0.055, // very light silhouette ghost
  meda: 0.26, // translucent adipose wrap
  mamsa: 0.20, // semi-ghosted so organs/vessels/nerves/bones show through
  rakta: 1.0,
  rasa: 1.0,
  shukra: 1.0,
  majja: 1.0,
  asthi: 1.0,
};

// Ghost state when a Dhatu is selected — must be <= 0.08 per the spec.
export const GHOST_OPACITY = 0.06;

// Context (dimmed) tissue multipliers — darker and desaturated but opaque.
export const CONTEXT_DIM = 0.30;
export const CONTEXT_DESATURATE = 0.55;

// Emissive tint strength of the selected layer, in that Dhatu's existing site colour.
export const TARGET_EMISSIVE_INTENSITY = 0.22;
export const HOVER_EMISSIVE_INTENSITY = 0.14;

// ---------------------------------------------------------------------------
// Realistic tissue base colours (shared per layer, never per mesh).
// ---------------------------------------------------------------------------
export const TISSUE_COLORS = {
  shell: 0xC9A99A, // pale skin-toned ghost (silhouette only)
  meda: 0xE8D28A, // pale yellow adipose
  mamsa: 0x8A3B34, // deep red-brown muscle belly
  mamsa_tendon: 0xE6DCC8, // pale tendon
  rakta_artery: 0xB03A3A, // arterial red
  rakta_vein: 0x3D5B8C, // venous blue
  rakta_heart: 0x93413C, // myocardium
  rakta_liver: 0x6E3B2C, // matte liver
  rakta_spleen: 0x6D2F38, // spleen
  rasa: 0xC7DCC2, // pale green-white lymphatic
  rasa_node: 0xD8E6CE,
  majja_brain: 0xD9B6BE, // pinkish grey
  majja_nerve: 0xE4DCA9, // pale yellow
  majja_marrow_yellow: 0xE0C269,
  majja_marrow_red: 0xA03A46,
  shukra: 0xB99A8C, // neutral atlas tone
};

// Base tone of each layer, used when a region has no more specific tint.
const LAYER_TINT = {
  shell: TISSUE_COLORS.shell,
  meda: TISSUE_COLORS.meda,
  mamsa: TISSUE_COLORS.mamsa,
  rakta: TISSUE_COLORS.rakta_heart,
  rasa: TISSUE_COLORS.rasa,
  majja: TISSUE_COLORS.majja_brain,
  shukra: TISSUE_COLORS.shukra,
  asthi: 0xEDE8DC, // the bone tone the legacy skeleton viewer already uses
};

// Regions whose tissue reads differently from their layer's default tone.
const REGION_TINT_OVERRIDES = {
  tendon: TISSUE_COLORS.mamsa_tendon,
  artery: TISSUE_COLORS.rakta_artery,
  vein: TISSUE_COLORS.rakta_vein,
  heart: TISSUE_COLORS.rakta_heart,
  liver: TISSUE_COLORS.rakta_liver,
  spleen: TISSUE_COLORS.rakta_spleen,
  lymph_node: TISSUE_COLORS.rasa_node,
  brain: TISSUE_COLORS.majja_brain,
  cerebellum: TISSUE_COLORS.majja_brain,
  brainstem: TISSUE_COLORS.majja_brain,
  spinal_cord: TISSUE_COLORS.majja_nerve,
  cauda_equina: TISSUE_COLORS.majja_nerve,
  nerve: TISSUE_COLORS.majja_nerve,
  marrow: TISSUE_COLORS.majja_marrow_red,
};

/**
 * The one tone a region renders with. Written into explore-regions.json at build
 * time, so the runtime colours the body from the shipped config instead of
 * duplicating this table in src/.
 */
export function regionTint(regionId, layer) {
  return REGION_TINT_OVERRIDES[regionId] ?? LAYER_TINT[layer] ?? 0xffffff;
}

// Camera focus presets: which region groups frame each Dhatu.
export const DHATU_CAMERA_REGIONS = {
  rasa: ['lymph_duct', 'lymph_node', 'thymus', 'heart'],
  rakta: ['heart', 'artery', 'vein', 'liver', 'spleen'],
  mamsa: ['muscle_axial', 'muscle_pectorial', 'muscle_back', 'muscle_abdominal',
    'muscle_upper_arm', 'muscle_forearm', 'muscle_hip_thigh', 'muscle_leg', 'muscle_head_neck'],
  meda: ['fat_subcutaneous', 'fat_omentum', 'fat_perirenal', 'kidney'],
  asthi: ['head', 'cervical', 'thoracic_spine', 'lumbar_spine', 'sacrum_coccyx', 'thorax',
    'shoulder_L', 'shoulder_R', 'arm_L', 'arm_R', 'hand_L', 'hand_R', 'pelvis',
    'leg_L', 'leg_R', 'foot_L', 'foot_R'],
  majja: ['brain', 'cerebellum', 'brainstem', 'spinal_cord', 'cauda_equina', 'nerve', 'marrow'],
  shukra: ['testis', 'vas_deferens', 'seminal_vesicle', 'prostate'],
};

// Per-Dhatu preferred viewing direction (unit-ish, normalised at runtime).
export const DHATU_CAMERA_DIRECTION = {
  rasa: [0.15, 0.1, 0.98],
  rakta: [0.2, 0.05, 0.98],
  mamsa: [0, 0.05, 1],
  meda: [-0.25, 0.05, 0.97],
  asthi: [0, 0.08, 1],
  majja: [0.3, 0.25, 0.92],
  shukra: [0.1, -0.35, 0.93],
};

export const GLB_LAYER_FILES = {
  shell: 'explore-body-shell',
  meda: 'explore-body-meda',
  mamsa: 'explore-body-mamsa',
  rakta: 'explore-body-rakta',
  rasa: 'explore-body-rasa',
  majja: 'explore-body-majja',
  shukra: 'explore-body-shukra',
};

export const ASTHI_FILE = 'explore-skeleton';

// Triangle budgets (high tier) — enforced by verify-explore-body.mjs
export const TRIANGLE_BUDGET_HIGH = {
  shell: 90000, meda: 110000, mamsa: 400000, rakta: 200000,
  rasa: 45000, majja: 250000, shukra: 25000, asthi: 520000,
};
export const TRIANGLE_BUDGET_TOTAL_HIGH = 1800000;
export const SIZE_BUDGET_TOTAL_HIGH_MB = 28;
export const TRIANGLE_BUDGET_TOTAL_LITE = 450000;
export const SIZE_BUDGET_TOTAL_LITE_MB = 8;
