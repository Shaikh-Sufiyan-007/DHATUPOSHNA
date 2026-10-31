import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  LANDING_COLORS,
  QUALITY_TIERS,
  PARTICLE_COUNTS,
  PARTICLE_COUNTS_REDUCED_MOTION,
  PARTICLE_SWIRL_START,
  PARTICLE_SWIRL_END,
  PARTICLE_FADE_START,
  PARTICLE_FADE_END,
  SKELETON_CENTER_Y,
} from '../constants/landingTheme.js';

// Overall alpha per quality tier
const TIER_OPACITY = {
  [QUALITY_TIERS.HIGH]: 1.0,
  [QUALITY_TIERS.MEDIUM]: 0.9,
  [QUALITY_TIERS.LOW]: 0.8,
};

// Deterministic attribute generation — fixed seed, so the cloud is identical on every mount.
function buildParticleAttributes(count) {
  const angle = new Float32Array(count);
  const radius = new Float32Array(count);
  const height = new Float32Array(count);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  const colorMix = new Float32Array(count);

  let prng = 2463534641;
  const nextRnd = () => {
    prng ^= prng << 13;
    prng >>>= 0;
    prng ^= prng >>> 17;
    prng ^= prng << 5;
    prng >>>= 0;
    return prng / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    angle[i] = nextRnd() * Math.PI * 2;
    // Cube root spreads points through the shell volume instead of clustering on the axis
    radius[i] = Math.cbrt(nextRnd());
    const band = nextRnd();
    height[i] = band < 0.72 ? 0.18 + nextRnd() * 1.42 : -0.35 + nextRnd() * 2.9;
    seed[i] = nextRnd();
    // Squared distribution keeps most points at the tiny end of the 0.8-2.5px range
    size[i] = 0.8 + nextRnd() * nextRnd() * 1.7;
    colorMix[i] = nextRnd();
  }

  return { angle, radius, height, seed, size, colorMix };
}

const vertexShader = /* glsl */ `
uniform float uProgress;
uniform float uTime;
uniform float uMotion;
uniform float uOpacity;
uniform float uPixelRatio;
uniform float uFocusDist;
uniform float uSpinSpeed;
uniform float uRiseDistance;
uniform float uCenterY;
uniform float uHalfHeight;
uniform vec2  uColumn;
uniform vec2  uIdleRadius;
uniform vec2  uFunnelRadius;
uniform vec2  uSwirlRange;
uniform vec2  uFadeRange;
uniform vec3  uColorSilver;
uniform vec3  uColorWhite;
uniform vec3  uColorIce;

attribute float aAngle;
attribute float aRadius;
attribute float aHeight;
attribute float aSeed;
attribute float aSize;
attribute float aColorMix;

varying float vAlpha;
varying vec3 vColor;

void main() {
  // Shape and motion are a pure function of uProgress: scrubbing forward, backward or
  // jumping straight to a scroll offset all resolve to the same particle state.
  float swirl = smoothstep(uSwirlRange.x, uSwirlRange.y, uProgress);

  float hf = clamp((aHeight - uCenterY) / uHalfHeight, -1.0, 1.0);
  float ellipsoid = sqrt(max(0.0, 1.0 - hf * hf));
  float idleRadius = mix(uIdleRadius.x, uIdleRadius.y, aRadius) * mix(0.55, 1.0, ellipsoid);

  float rise = swirl * uRiseDistance * (0.7 + 0.6 * aSeed);
  float y = uColumn.x + mod(aHeight + rise - uColumn.x, uColumn.y);
  float heightFactor = (y - uColumn.x) / uColumn.y;

  // Funnel: narrow near the base, flaring out toward the top of the column
  float funnelRadius =
    mix(uFunnelRadius.x, uFunnelRadius.y, pow(heightFactor, 1.3)) + aRadius * 0.42;

  float turbulence = sin(aSeed * 34.0 + swirl * 9.0) * cos(aSeed * 17.0 + heightFactor * 6.2831);
  float radius = mix(idleRadius, funnelRadius, swirl) + turbulence * 0.03 * (0.3 + swirl);
  float angle = aAngle + swirl * uSpinSpeed * (1.0 + heightFactor) + turbulence * 0.05;

  vec3 position = vec3(cos(angle) * radius, y, sin(angle) * radius);

  // Idle drift: bounded oscillation (never accumulates), damped as the vortex takes over
  float idle = uMotion * (1.0 - 0.8 * swirl);
  position.y += idle * 0.035 * sin(uTime * 0.35 + aSeed * 40.0);
  position.x += idle * 0.025 * sin(uTime * 0.27 + aSeed * 71.0);
  position.z += idle * 0.025 * cos(uTime * 0.31 + aSeed * 53.0);

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float attenuation = uFocusDist / max(0.05, -mvPosition.z);
  gl_PointSize = clamp(aSize * attenuation, 0.8, 2.5) * uPixelRatio;

  float fade = 1.0 - smoothstep(uFadeRange.x, uFadeRange.y, uProgress);
  // Mask the wrap-around seam at both ends of the vortex column
  float edge = smoothstep(0.0, 0.05, heightFactor) * smoothstep(1.0, 0.95, heightFactor);
  float twinkle = 0.7 + 0.3 * sin(aSeed * 61.0 + uTime * 1.1 + swirl * 14.0);

  vAlpha = fade * edge * uOpacity * mix(1.0, twinkle, uMotion);

  vColor = mix(uColorSilver, uColorWhite, smoothstep(0.0, 0.62, aColorMix));
  vColor = mix(vColor, uColorIce, smoothstep(0.8, 1.0, aColorMix));
}
`;

const fragmentShader = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  float disc = smoothstep(0.5, 0.08, dist);
  if (disc <= 0.002) discard;
  float core = smoothstep(0.26, 0.0, dist);
  gl_FragColor = vec4(vColor * (0.85 + 0.95 * core), disc * vAlpha);

  // Custom shaders get no automatic output encoding. These adapt to whether the scene
  // is rendering straight to the canvas or into the (linear) bloom render target.
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export default function SkeletonParticles({ sceneStateRef, tier = QUALITY_TIERS.HIGH }) {
  const pointsRef = useRef();
  const { gl } = useThree();

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const count =
    (prefersReducedMotion ? PARTICLE_COUNTS_REDUCED_MOTION : PARTICLE_COUNTS)[tier] ??
    PARTICLE_COUNTS[QUALITY_TIERS.LOW];

  const attributes = useMemo(() => buildParticleAttributes(count), [count]);

  const cloud = useMemo(() => {
    const uniforms = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMotion: { value: prefersReducedMotion ? 0 : 1 },
      uOpacity: { value: TIER_OPACITY[tier] ?? 0.8 },
      uPixelRatio: { value: 1 },
      uFocusDist: { value: 2.2 },
      uSpinSpeed: { value: 7.5 },
      uRiseDistance: { value: 2.4 },
      uCenterY: { value: SKELETON_CENTER_Y },
      uHalfHeight: { value: 1.05 },
      uColumn: { value: new THREE.Vector2(-0.65, 3.35) },
      uIdleRadius: { value: new THREE.Vector2(0.42, 1.02) },
      uFunnelRadius: { value: new THREE.Vector2(0.44, 0.98) },
      uSwirlRange: { value: new THREE.Vector2(PARTICLE_SWIRL_START, PARTICLE_SWIRL_END) },
      uFadeRange: { value: new THREE.Vector2(PARTICLE_FADE_START, PARTICLE_FADE_END) },
      uColorSilver: { value: new THREE.Color(LANDING_COLORS.silverHex) },
      uColorWhite: { value: new THREE.Color(LANDING_COLORS.highlightHex) },
      uColorIce: { value: new THREE.Color(LANDING_COLORS.glowHex) },
    };

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aAngle', new THREE.BufferAttribute(attributes.angle, 1));
    geometry.setAttribute('aRadius', new THREE.BufferAttribute(attributes.radius, 1));
    geometry.setAttribute('aHeight', new THREE.BufferAttribute(attributes.height, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(attributes.seed, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(attributes.size, 1));
    geometry.setAttribute('aColorMix', new THREE.BufferAttribute(attributes.colorMix, 1));

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry, material, uniforms };
  }, [count, attributes, tier, prefersReducedMotion]);

  // Uniform writes happen per frame, so they go through a ref rather than mutating the
  // memoised cloud object directly.
  const cloudRef = useRef(cloud);
  useEffect(() => {
    cloudRef.current = cloud;
  }, [cloud]);

  useEffect(
    () => () => {
      cloud.geometry.dispose();
      cloud.material.dispose();
    },
    [cloud]
  );

  useFrame((_, delta) => {
    const state = sceneStateRef.current;
    if (!state) return;

    const uniforms = cloudRef.current.uniforms;
    // Shell / vortex shape is driven only by raw scroll progress — never by time accumulation.
    uniforms.uProgress.value = state.scrollProgress || 0;
    uniforms.uPixelRatio.value = gl.getPixelRatio();

    // Time feeds only the bounded idle sway and shimmer.
    if (uniforms.uMotion.value > 0) {
      uniforms.uTime.value += Math.min(delta, 0.05);
    }
  });

  return (
    <points ref={pointsRef} geometry={cloud.geometry} material={cloud.material} frustumCulled={false} />
  );
}
