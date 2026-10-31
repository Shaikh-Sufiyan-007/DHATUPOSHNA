// DHATUPOSHNA — Visual Reference Theme Constants
// Silver + Ice Blue palette as specified in the design brief
export const LANDING_COLORS = {
  background: '#0A0F16',
  surface: '#151C26',
  silver: '#BFC8D6',
  highlight: '#F2F6FB',
  glowAccent: '#6FB3E0',
  primaryText: '#E4EAF2',
  mutedText: '#9AA7B8',
  border: 'rgba(191, 200, 214, 0.30)',

  // Numeric forms for the WebGL rig (same colors as above)
  backgroundHex: 0x0a0f16,
  surfaceHex: 0x151c26,
  silverHex: 0xbfc8d6,
  highlightHex: 0xf2f6fb,
  glowHex: 0x6fb3e0,
};

export const QUALITY_TIERS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Particle cloud budget per quality tier (also reduced under prefers-reduced-motion)
export const PARTICLE_COUNTS = {
  [QUALITY_TIERS.HIGH]: 7000,
  [QUALITY_TIERS.MEDIUM]: 4000,
  [QUALITY_TIERS.LOW]: 2000,
};
export const PARTICLE_COUNTS_REDUCED_MOTION = {
  [QUALITY_TIERS.HIGH]: 1800,
  [QUALITY_TIERS.MEDIUM]: 1200,
  [QUALITY_TIERS.LOW]: 700,
};

// Scroll window that drives the particle vortex, expressed in raw scroll progress.
// Everything downstream is a pure function of progress so scrubbing direction
// (forward / backward / direct jump) always lands on the same visual state.
export const PARTICLE_SWIRL_START = 0.06;
export const PARTICLE_SWIRL_END = 0.50;
export const PARTICLE_FADE_START = 0.80;
export const PARTICLE_FADE_END = 0.96;

// Spine rotation sweep across the spine scroll track
// Clockwise from above: rotation.y decreases in Three.js right-handed coordinate system
export const TOTAL_SPINE_ROTATION_SWEEP = Math.PI * 2; // 360 degrees

// Physical Anchor Points for Skull-to-Spine Rigid Attachment (Fix 1)
// Occipital condyles / foramen magnum base on skull meets superior articular facets of C1 atlas
export const SKULL_BASE_ANCHOR = { x: 0.0, y: 1.498, z: 0.008 };
export const SPINE_TOP_ANCHOR = { x: 0.0, y: 1.498, z: 0.008 };
export const SKULL_ATTACHMENT_OFFSET = { x: 0.0, y: 0.0, z: 0.0 };

// Full Skeleton Dimensions and Bounding Box (Fix 4)
// Real vertex bounds from skeleton-full.glb: min [-0.311, 0.008, -0.143], max [0.311, 1.720, 0.185]
export const SKELETON_BOUNDS = {
  min: [-0.311, 0.008, -0.143],
  max: [0.311, 1.720, 0.185],
  center: [0.0, 0.864, 0.021],
  size: [0.622, 1.712, 0.328],
  height: 1.712,
  width: 0.622,
};
export const SKELETON_CENTER_Y = 0.864;

/**
 * Calculates camera distance required to fit the full skeleton within the frustum
 * based on viewport aspect ratio, camera vertical FOV, and margin factor.
 */
export function getSkeletonFitCameraDistance(aspect, fov = 38, margin = 1.22) {
  const halfFovRad = ((fov * Math.PI) / 360);
  const tanHalfFov = Math.tan(halfFovRad);

  const height = SKELETON_BOUNDS.height;
  const width = SKELETON_BOUNDS.width;

  // Distance required to fit vertical height (top of skull to bottom of feet)
  const distVert = (height * margin) / (2 * tanHalfFov);

  // Distance required to fit horizontal width (left hand fingers to right hand fingers)
  const distHoriz = (width * margin) / (2 * tanHalfFov * Math.max(0.1, aspect));

  return Math.max(distVert, distHoriz);
}

// 8 Feature Cards matching the Visual Reference Design
// Connected sequentially to the 24 vertebrae / sacrum / coccyx
export const SPINE_FEATURE_CARDS = [  {
    id: 'sapta-dhatus',
    step: '01 / 08',
    category: 'Sapta Dhatu',
    regionTag: 'C',
    regionName: 'Cervical (C1 - C3)',
    title: 'Sapta Dhatu',
    description: 'Explore the seven bodily tissues in their classical physiological sequence.',
    link: '/dhatus',
    linkLabel: 'Explore',
    iconType: 'droplet',
    anchorY: 1.470, // C2 axis focal center
    side: 'left',
  },
  {
    id: 'dhatvagni',
    step: '02 / 08',
    category: 'Dhatvagni',
    regionTag: 'C',
    regionName: 'Lower Cervical (C5 - C7)',
    title: 'Dhatvagni',
    description: 'Study the tissue-level metabolic fires governing bio-transformation and nutrient assimilation.',
    link: '/dhatvagni',
    linkLabel: 'Explore',
    iconType: 'flame',
    anchorY: 1.408, // C6 vertebra focal center
    side: 'right',
  },
  {
    id: 'dhatuposhana',
    step: '03 / 08',
    category: 'Dhatuposhana',
    regionTag: 'T',
    regionName: 'Upper Thoracic (T1 - T3)',
    title: 'Dhatuposhana Cascades',
    description: 'Follow how biological tissues are sequentially nourished through complex nutrient channels (Srotamsi).',
    link: '/dhatuposhana',
    linkLabel: 'Explore',
    iconType: 'branch',
    anchorY: 1.349, // T2 vertebra focal center
    side: 'left',
  },
  {
    id: 'nyayas',
    step: '04 / 08',
    category: 'Classical Nyayas',
    regionTag: 'T',
    regionName: 'Mid Thoracic (T5 - T7)',
    title: 'Classical Nyayas',
    description: 'Investigate the three classical Ayurvedic analogies of nourishment: Ksheera-Dadhi, Kedari-Kulya, and Khale-Kapota.',
    link: '/nyayas',
    linkLabel: 'Explore',
    iconType: 'scale',
    anchorY: 1.251, // T6 vertebra focal center
    side: 'right',
  },
  {
    id: 'explore-3d',
    step: '05 / 08',
    category: '3D Body Explorer',
    regionTag: 'T',
    regionName: 'Lower Thoracic (T9 - T11)',
    title: '3D Body Explorer',
    description: 'Explore an interactive spatial 3D human anatomy specimen and visualize how body regions correspond to Dhatus.',
    link: '/explore',
    linkLabel: 'Explore',
    iconType: 'box3d',
    anchorY: 1.137, // T10 vertebra focal center
    side: 'left',
  },
  {
    id: 'concepts',
    step: '06 / 08',
    category: 'Foundational Principles',
    regionTag: 'L',
    regionName: 'Thoracolumbar (T12 - L2)',
    title: 'Foundational Concepts',
    description: 'Deepen your grasp of essential Ayurvedic concepts including Tridosha balance, Agni, Ama pathogenesis, and Ojas.',
    link: '/concepts',
    linkLabel: 'Explore',
    iconType: 'sparkles',
    anchorY: 1.040, // L1 vertebra focal center
    side: 'right',
  },
  {
    id: 'glossary-search',
    step: '07 / 08',
    category: 'Sanskrit Glossary',
    regionTag: 'L',
    regionName: 'Mid Lumbar (L3 - L5)',
    title: 'Sanskrit Glossary',
    description: 'Look up classical terminology in Devanagari, transliterated IAST, and comprehensive Ayurvedic definitions.',
    link: '/glossary',
    linkLabel: 'Explore',
    iconType: 'book',
    anchorY: 0.926, // L4 vertebra focal center
    side: 'left',
  },
  {
    id: 'quizzes-references',
    step: '08 / 08',
    category: 'Verified References',
    regionTag: 'S',
    regionName: 'Sacral & Coccyx Base',
    title: 'Verified References',
    description: 'Test your understanding with conceptual quizzes, and trace definitions to authentic Charaka and Sushruta Samhita verses.',
    link: '/references',
    linkLabel: 'Explore',
    iconType: 'scroll',
    anchorY: 0.760, // Sacrum/Coccyx focal center
    side: 'right',
  },
];
// ===========================================================================
// SPINE CARD PHASE - single source of truth for card timing
// ===========================================================================
// #section-spine renders a `sticky top-0 h-screen` frame that is fully pinned
// while the section scrolls past, i.e. for scroll progress
//   [sectionTop / range, (sectionTop + sectionHeight - viewport) / range]
// which measures out as 0.110 - 0.336. The 3D camera descent is timed to
// exactly this window, so the card on screen is always the card for the
// vertebra the camera is looking at. Nothing here is time-based: every value
// below is a pure function of raw scroll progress, which keeps forward scroll,
// backward scroll and a direct jump identical.
export const SPINE_CARD_PHASE = { start: 0.112, end: 0.332 };

export const CAMERA_HERO_Y = 1.61;      // cranium focal centre for the hero view
export const CAMERA_CERVICAL_Y = 1.5;   // top of the spine phase (C1)
export const CAMERA_COCCYX_Y = 0.74;    // bottom of the spine phase

// The camera sits at focal distance 0.85 with a 38 degree vertical FOV; a world
// offset dy from the focal plane projects to dy / (0.85 * tan(19deg)) in NDC.
const CAMERA_FOCAL_DISTANCE = 0.85;
const CAMERA_FOV_DEG = 38;
const NDC_PER_METRE = 1 / (CAMERA_FOCAL_DISTANCE * Math.tan(((CAMERA_FOV_DEG / 2) * Math.PI) / 180));

const CARD_STEP = (SPINE_CARD_PHASE.end - SPINE_CARD_PHASE.start) / SPINE_FEATURE_CARDS.length;

// A card holds its tile [tileStart, tileEnd] and crossfades with the neighbour
// across CARD_CROSSFADE on each side. Card i fades out over exactly the span the
// next card fades in, so the two opacities sum to 1 through the handoff: no dead
// frame where nothing is readable, and never two cards fully visible at once.
const CARD_CROSSFADE = CARD_STEP * 0.28;

// One window per card: enters at `start`, fully settled between `fadeInEnd` and
// `fadeOutStart` (midpoint `peak`), gone at `end`.
export const SPINE_CARD_WINDOWS = SPINE_FEATURE_CARDS.map((card, index) => {
  const lastIndex = SPINE_FEATURE_CARDS.length - 1;
  const tileStart = SPINE_CARD_PHASE.start + CARD_STEP * index;
  const tileEnd = tileStart + CARD_STEP;
  const fadeInEnd = tileStart + CARD_CROSSFADE;
  const fadeOutStart = index === lastIndex ? tileEnd - CARD_CROSSFADE : tileEnd;
  return {
    index,
    id: card.id,
    regionTag: card.regionTag,
    step: card.step,
    anchorY: card.anchorY,
    start: tileStart,
    peak: (fadeInEnd + fadeOutStart) / 2,
    end: index === lastIndex ? tileEnd : tileEnd + CARD_CROSSFADE,
    fadeInEnd,
    fadeOutStart,
  };
});

function clamp01(value) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

// Smooth 0 -> 1 ramp; the same shape on the way in and, mirrored, on the way out
function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// Analytic copy of the camera descent used by the timeline, so the cards can
// derive their vertical offset from scroll progress alone (no lagged state).
// Piecewise linear to match the `ease: 'none'` segments the timeline builds.
export function spineCameraYAt(progress) {
  const first = SPINE_CARD_WINDOWS[0];
  const last = SPINE_CARD_WINDOWS[SPINE_CARD_WINDOWS.length - 1];

  if (progress <= first.peak) {
    const t = clamp01((progress - SPINE_CARD_PHASE.start) / (first.peak - SPINE_CARD_PHASE.start));
    return CAMERA_CERVICAL_Y + (first.anchorY - CAMERA_CERVICAL_Y) * t;
  }
  if (progress >= last.peak) {
    const t = clamp01((progress - last.peak) / (SPINE_CARD_PHASE.end - last.peak));
    return last.anchorY + (CAMERA_COCCYX_Y - last.anchorY) * t;
  }

  for (let i = 0; i < SPINE_CARD_WINDOWS.length - 1; i += 1) {
    const a = SPINE_CARD_WINDOWS[i];
    const b = SPINE_CARD_WINDOWS[i + 1];
    if (progress <= b.peak) {
      const t = (progress - a.peak) / (b.peak - a.peak);
      return a.anchorY + (b.anchorY - a.anchorY) * t;
    }
  }
  return CAMERA_COCCYX_Y;
}

export function activeSpineCardIndex(progress) {
  if (progress < SPINE_CARD_PHASE.start) return 0;
  if (progress >= SPINE_CARD_PHASE.end) return SPINE_CARD_WINDOWS.length - 1;
  const raw = Math.floor((progress - SPINE_CARD_PHASE.start) / CARD_STEP);
  return Math.min(SPINE_CARD_WINDOWS.length - 1, Math.max(0, raw));
}

// Opacity plus a small vertical travel for one card window, straight from progress.
// `offsetNdc` keeps the card glued to its own vertebra as that vertebra drifts
// through the camera's focal plane.
export function spineCardStateAt(progress, window) {
  if (progress <= window.start || progress >= window.end) {
    return { opacity: 0, translateNdc: 0, visible: false };
  }

  const opacity =
    smoothstep(window.start, window.fadeInEnd, progress) *
    (1 - smoothstep(window.fadeOutStart, window.end, progress));

  const t = (progress - window.start) / (window.end - window.start);
  const travel = (t - 0.5) * 2 * 0.05;
  const drift = (window.anchorY - spineCameraYAt(progress)) * NDC_PER_METRE;
  // A slight slide, not a chase: the card and its focal node move together and stay
  // within +-5vh of the mid line, so the connector keeps reading as one gesture.
  const offsetNdc = Math.max(-0.1, Math.min(0.1, travel + drift));

  return { opacity, translateNdc: offsetNdc, visible: opacity > 0.02 };
}

export const LEARNING_AREAS = [
  {
    slug: 'dhatus',
    title: 'Sapta Dhatus',
    sanskrit: 'सप्त धातु',
    scholarly: 'Seven primary structural and functional tissue systems described in Charaka Samhita Sutrasthana 28.',
    simplified: 'The fundamental building blocks of human physiology, from nutrient plasma to vital reproductive tissue.',
    link: '/dhatus',
    badge: 'Tissue Systems',
  },
  {
    slug: 'dhatvagni',
    title: 'Dhatvagni Metabolism',
    sanskrit: 'धात्वाग्नि',
    scholarly: 'Specific tissue-level bio-transformative enzymes dividing ingested nutrient precursors into Sara and Kitta fractions.',
    simplified: 'Seven internal metabolic fires that convert raw nutrients into specialized living cells and tissues.',
    link: '/dhatvagni',
    badge: 'Bio-Fires',
  },
  {
    slug: 'dhatuposhana',
    title: 'Dhatuposhana Theories',
    sanskrit: 'धातुपोषण न्याय',
    scholarly: 'The physiological paradigms detailing sequential vs selective cellular nourishment pathways.',
    simplified: 'How nutrients travel throughout your body to reach and sustain each organ and tissue in order.',
    link: '/dhatuposhana',
    badge: 'Nourishment',
  },
  {
    slug: 'nyayas',
    title: 'The Three Nyayas',
    sanskrit: 'क्षीरदधि • केदारीकुल्या • खलेकपोत',
    scholarly: 'Hermeneutic allegories of transformation (milk-curd), irrigation distribution (canal), and selective uptake (pigeon).',
    simplified: 'Three intuitive physical analogies ancient scholars used to explain micro-circulation and selective assimilation.',
    link: '/nyayas',
    badge: 'Classical Models',
  },
  {
    slug: 'concepts',
    title: 'Core Epistemology',
    sanskrit: 'दोष • धातु • मल • ओजस्',
    scholarly: 'Tri-dosha dynamics, Srotas transport mechanics, Ama endotoxicity, and sovereign immunity (Ojas).',
    simplified: 'The foundational philosophy connecting daily metabolism, vital immunity, and bodily equilibrium.',
    link: '/concepts',
    badge: 'Foundations',
  },
  {
    slug: 'references',
    title: 'Verified Samhita Sources',
    sanskrit: 'प्रमाण एवं सन्दर्भ',
    scholarly: 'Verbatim Sanskrit shlokas from the Brihat-Trayi with authentic chapter and verse citations.',
    simplified: 'Direct classical citations verifying the scientific provenance of all educational material.',
    link: '/references',
    badge: 'Direct Citations',
  },
];
