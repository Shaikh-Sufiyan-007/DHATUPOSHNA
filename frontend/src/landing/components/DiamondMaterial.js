import * as THREE from 'three';
import { LANDING_COLORS, QUALITY_TIERS } from '../constants/landingTheme.js';

// Crystal look, tuned to a balanced mid-level shine: bones read as solid frosted
// diamond instead of blown-out glass. Vertex colours are deliberately ignored - the
// skeleton's baked bone tint would fight the ice cast, so every facet shares one crystal.
const CRYSTAL_COLOR = 0xdce8f4;
const ATTENUATION_COLOR = 0x9dc8ec;
const RIM_COLOR = new THREE.Color(LANDING_COLORS.glowHex);
const HIGHLIGHT_COLOR = new THREE.Color(LANDING_COLORS.glowHex);
const DEEP_EMISSIVE = new THREE.Color(0x0a1420);

// Shared across every tissue variant so no part of the skeleton shines harder than another
const SHINE = {
  clearcoat: 0.5,
  clearcoatRoughness: 0.12,
  specularIntensity: 0.55,
  iridescence: 0.12,
};

function variantTint(variant) {
  switch (variant) {
    case 'tooth':
      return { color: 0xe6f0fa, roughness: 0.14, thickness: 0.55, transmission: 0.62 };
    case 'cartilage':
      return { color: 0xd6e5f2, roughness: 0.17, thickness: 0.7, transmission: 0.66 };
    case 'disc':
      return { color: 0xc9def0, roughness: 0.16, thickness: 0.45, transmission: 0.6 };
    default:
      return { color: CRYSTAL_COLOR, roughness: 0.15, thickness: 1.0, transmission: 0.68 };
  }
}

// Faint ice-blue fresnel rim. Added before tone mapping / colour space encoding so it
// stays linear and only the tightest edge catches the bloom threshold.
// Material.clone() does not carry onBeforeCompile over, so this must run on every instance.
function applyFresnelRim(mat, strength, exponent) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.dpRimColor = { value: RIM_COLOR };
    shader.uniforms.dpRimStrength = { value: strength };
    shader.uniforms.dpRimExponent = { value: exponent };

    shader.fragmentShader = `
      uniform vec3 dpRimColor;
      uniform float dpRimStrength;
      uniform float dpRimExponent;
    ` + shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      #include <opaque_fragment>
      {
        vec3 rimNormal = normalize( normal );
        vec3 rimView = normalize( vViewPosition );
        float rim = 1.0 - max( dot( rimNormal, rimView ), 0.0 );
        rim = pow( rim, dpRimExponent );
        gl_FragColor.rgb += dpRimColor * rim * dpRimStrength;
      }
      `
    );
  };

  mat.customProgramCacheKey = () => `dpRim${strength.toFixed(2)}x${exponent.toFixed(2)}`;
  return mat;
}

// Returns an independent material instance per call - each model fades its own opacity
// during the skull/spine -> full skeleton crossfade.
export function createDiamondMaterial(tier = QUALITY_TIERS.HIGH, options = {}) {
  const { isHighlighted = false, isDisc = false, isTooth = false, isCartilage = false } = options;
  const variant = isTooth ? 'tooth' : isCartilage ? 'cartilage' : isDisc ? 'disc' : 'bone';
  const tint = variantTint(variant);
  const emissive = isHighlighted ? HIGHLIGHT_COLOR : DEEP_EMISSIVE;
  const emissiveIntensity = isHighlighted ? 0.4 : 0.05;
  const rimExponent = isHighlighted ? 2.4 : 3.0;

  let mat;
  let rimStrength;

  if (tier === QUALITY_TIERS.HIGH) {
    mat = new THREE.MeshPhysicalMaterial({
      color: tint.color,
      emissive,
      emissiveIntensity,
      metalness: 0,
      roughness: tint.roughness,
      transmission: tint.transmission,
      thickness: tint.thickness,
      ior: 2.32,
      dispersion: 0.12,
      ...SHINE,
      iridescenceIOR: 1.5,
      attenuationColor: new THREE.Color(ATTENUATION_COLOR),
      attenuationDistance: 1.2,
      envMapIntensity: 1.1,
      flatShading: true,
      transparent: true,
      opacity: 0.95,
    });
    rimStrength = 0.16;
  } else if (tier === QUALITY_TIERS.MEDIUM) {
    // Half the refraction budget; dispersion dropped to keep the shader cheaper
    mat = new THREE.MeshPhysicalMaterial({
      color: tint.color,
      emissive,
      emissiveIntensity,
      metalness: 0,
      roughness: tint.roughness + 0.02,
      transmission: tint.transmission * 0.85,
      thickness: tint.thickness * 0.7,
      ior: 2.3,
      ...SHINE,
      attenuationColor: new THREE.Color(ATTENUATION_COLOR),
      attenuationDistance: 1.3,
      envMapIntensity: 1.0,
      flatShading: true,
      transparent: true,
      opacity: 0.95,
    });
    rimStrength = 0.18;
  } else {
    // Low tier / mobile: no transmission pass at all. Env reflections plus a controlled
    // specular and a touch of sheen fake the crystal so the 517k-triangle skeleton holds
    // its frame budget.
    mat = new THREE.MeshPhysicalMaterial({
      color: tint.color,
      emissive,
      emissiveIntensity,
      metalness: 0.05,
      roughness: tint.roughness + 0.03,
      ...SHINE,
      specularIntensity: 0.5,
      reflectivity: 0.6,
      sheen: 0.12,
      sheenColor: new THREE.Color(LANDING_COLORS.silverHex),
      envMapIntensity: 1.6,
      flatShading: true,
      transparent: true,
      opacity: 0.95,
    });
    rimStrength = 0.2;
  }

  return applyFresnelRim(mat, rimStrength, rimExponent);
}
