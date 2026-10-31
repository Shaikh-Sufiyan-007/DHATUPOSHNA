import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import SkullModel from './SkullModel.jsx';
import SpineModel from './SpineModel.jsx';
import SkeletonModel from './SkeletonModel.jsx';
import SkeletonParticles from './SkeletonParticles.jsx';
import { LANDING_COLORS, QUALITY_TIERS } from '../constants/landingTheme.js';

// Fraction of the viewport used for the transmission refraction buffer.
// The skeleton is 517k triangles, so this is the main lever on frame time.
const TRANSMISSION_SCALE = {
  [QUALITY_TIERS.HIGH]: 0.5,
  [QUALITY_TIERS.MEDIUM]: 0.3,
};

// Camera Rig tracking mutable sceneState directly per-frame without React lag
function CameraRig({ sceneStateRef }) {
  useFrame(({ camera }) => {
    const state = sceneStateRef.current;
    if (!state) return;

    const camX = state.cameraX !== undefined ? state.cameraX : 0;
    const camY = state.cameraY !== undefined ? state.cameraY : 1.61;
    const camZ = state.cameraZ !== undefined ? state.cameraZ : 0.85;

    const targetX = state.targetX !== undefined ? state.targetX : 0;
    const targetY = state.targetY !== undefined ? state.targetY : 1.61;
    const targetZ = state.targetZ !== undefined ? state.targetZ : 0;

    camera.position.set(camX, camY, camZ);
    camera.lookAt(targetX, targetY, targetZ);
  });

  return null;
}

// Shared Spine + Skull Rigid Assembly (Fix 1)
// Skull rests directly on C1 atlas; rotating group rotates both rigidly around vertical axis
function SpineRig({ sceneStateRef, tier, activeCardIndex, stage }) {
  const rigRef = useRef();

  useFrame(() => {
    if (!rigRef.current) return;
    const state = sceneStateRef.current;
    if (!state) return;

    // Strict requirement: Rotation is purely around vertical Y axis
    // Clockwise from above: rotation.y decreases (front sweeps to viewer's left)
    const spineRotY = state.spineRotY || 0;
    rigRef.current.rotation.set(0, spineRotY, 0);
    rigRef.current.position.set(0, 0, 0);
  });

  return (
    <group ref={rigRef} position={[0, 0, 0]}>
      <SkullModel
        sceneStateRef={sceneStateRef}
        tier={tier}
        visible={stage <= 4}
      />
      <SpineModel
        sceneStateRef={sceneStateRef}
        tier={tier}
        activeCardIndex={activeCardIndex}
        visible={stage <= 4}
      />
    </group>
  );
}

// 4-point cool rig: white key, ice-blue rim, silver fill, cool back light
function CoolLightingRig({ tier }) {
  return (
    <group>
      <ambientLight color={LANDING_COLORS.surfaceHex} intensity={0.35} />

      {/* Key: neutral white, drives the facet definition */}
      <directionalLight
        color={0xffffff}
        intensity={1.5}
        position={[2.5, 3.5, 2.5]}
        castShadow={tier === QUALITY_TIERS.HIGH}
      />

      {/* Rim: ice blue outlining the silhouette from behind */}
      <directionalLight
        color={LANDING_COLORS.glowHex}
        intensity={1.8}
        position={[-2.5, 1.8, -2.5]}
      />

      {/* Fill: cool silver from the low right */}
      <directionalLight
        color={LANDING_COLORS.silverHex}
        intensity={0.75}
        position={[2.0, -1.0, -2.0]}
      />

      {/* Back light: lifts the head and shoulders off the background */}
      <directionalLight
        color={0xd8e8f8}
        intensity={1.0}
        position={[0, 2.4, -3.2]}
      />

      {/* Cool inner glow so the crystal is never dead black inside */}
      <pointLight
        color={LANDING_COLORS.glowHex}
        intensity={0.75}
        distance={4.2}
        position={[0, 1.35, 1.2]}
      />
    </group>
  );
}

// Soft studio built from emissive planes: narrow dim strips so only a few edges catch
// a highlight, plus ice-blue and silver panels for the internal reflections.
function DiamondEnvironment({ tier }) {
  const resolution = tier === QUALITY_TIERS.HIGH ? 256 : 128;

  return (
    <Environment resolution={resolution} frames={1}>
      {/* Overhead strip lights - kept small and dim so highlights stay local */}
      <Lightformer
        form="rect"
        color="#ffffff"
        intensity={1.7}
        scale={[6, 0.26, 1]}
        position={[0, 4.2, 1.6]}
        target={[0, 0.86, 0]}
      />
      <Lightformer
        form="rect"
        color="#ffffff"
        intensity={1.1}
        scale={[4.5, 0.18, 1]}
        position={[-1.5, 3.0, -2.4]}
        target={[0, 0.86, 0]}
      />

      {/* Ice-blue side panel */}
      <Lightformer
        form="circle"
        color={LANDING_COLORS.glowAccent}
        intensity={0.9}
        scale={[3.4, 3.4, 1]}
        position={[-4.2, 1.2, -1.4]}
        target={[0, 0.86, 0]}
      />

      {/* Silver opposing panel */}
      <Lightformer
        form="rect"
        color={LANDING_COLORS.silver}
        intensity={0.7}
        scale={[4, 4, 1]}
        position={[4.2, 0.6, 1.2]}
        target={[0, 0.86, 0]}
      />

      {/* Soft floor bounce */}
      <Lightformer
        form="rect"
        color="#cfe2f4"
        intensity={0.4}
        scale={[6, 6, 1]}
        position={[0, -3.2, 0]}
        target={[0, 0.86, 0]}
      />
    </Environment>
  );
}

// Very restrained bloom: the high threshold keeps the skeleton body out of the pass
// entirely, so only the smallest specular peaks glow.
// Runs at render priority 1, which hands rendering over from react-three-fiber.
function BloomComposer() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const instance = new EffectComposer(gl);
    instance.addPass(new RenderPass(scene, camera));
    instance.addPass(
      new UnrealBloomPass(new THREE.Vector2(1, 1), 0.14, 0.4, 0.985)
    );
    instance.addPass(new OutputPass());
    return instance;
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}

export default function AnatomyCanvas({
  sceneStateRef,
  tier = QUALITY_TIERS.HIGH,
  activeCardIndex = 0,
  stage = 1,
}) {
  const dpr =
    tier === QUALITY_TIERS.LOW
      ? Math.min(window.devicePixelRatio, 1.25)
      : Math.min(window.devicePixelRatio, 1.75);

  const bloomEnabled = tier !== QUALITY_TIERS.LOW;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 1.61, 0.85], fov: 38, near: 0.1, far: 50 }}
        dpr={dpr}
        gl={{
          antialias: tier !== QUALITY_TIERS.LOW,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.transmissionResolutionScale = TRANSMISSION_SCALE[tier] ?? 1;
          gl.toneMappingExposure = 0.9;
        }}
      >
        {/* Matches .dp-landing background so the canvas and page read as one surface */}
        <color attach="background" args={[LANDING_COLORS.background]} />

        <Suspense fallback={null}>
          <CameraRig sceneStateRef={sceneStateRef} />
          <CoolLightingRig tier={tier} />
          <DiamondEnvironment tier={tier} />

          {/* Tiny scroll-driven vortex around the skeleton */}
          <SkeletonParticles sceneStateRef={sceneStateRef} tier={tier} />

          {/* Stages 1 to 4: Skull + Straight Spine Shared Rigid Assembly */}
          <SpineRig
            sceneStateRef={sceneStateRef}
            tier={tier}
            activeCardIndex={activeCardIndex}
            stage={stage}
          />

          {/* Stage 5: Full Articulated Skeleton */}
          <SkeletonModel
            sceneStateRef={sceneStateRef}
            tier={tier}
            visible={stage >= 4}
          />

          {bloomEnabled && <BloomComposer />}
        </Suspense>
      </Canvas>
    </div>
  );
}
