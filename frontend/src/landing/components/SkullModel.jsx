import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { createDiamondMaterial } from './DiamondMaterial.js';
import {
  SKULL_BASE_ANCHOR,
  SPINE_TOP_ANCHOR,
  SKULL_ATTACHMENT_OFFSET,
} from '../constants/landingTheme.js';

export default function SkullModel({ sceneStateRef, tier, visible = true }) {
  const { scene } = useGLTF('/models/skull-hero.glb');
  const groupRef = useRef();
  const innerRef = useRef();
  const idleTimeRef = useRef(0);
  const neckMeshesRef = useRef([]);

  // Independent instances so skull opacity changes never leak into the spine rig
  const materials = useMemo(
    () => ({
      bone: createDiamondMaterial(tier),
      tooth: createDiamondMaterial(tier, { isTooth: true }),
      disc: createDiamondMaterial(tier, { isDisc: true }),
    }),
    [tier]
  );
  // Per-frame opacity writes go through a ref so the render loop is not mutating a hook value
  const materialsRef = useRef(materials);
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  // Apply materials per mesh and index neck vertebrae (C1-C3)
  useEffect(() => {
    neckMeshesRef.current = [];
    scene.traverse((obj) => {
      if (obj.isMesh) {
        const lower = obj.name.toLowerCase();
        if (
          lower.startsWith('c1') ||
          lower.startsWith('c2') ||
          lower.startsWith('c3') ||
          lower.includes('atlas') ||
          lower.includes('axis') ||
          lower.includes('disc')
        ) {
          neckMeshesRef.current.push(obj);
        }

        if (lower.startsWith('tooth_')) {
          obj.material = materials.tooth;
        } else if (lower.includes('disc')) {
          obj.material = materials.disc;
        } else {
          obj.material = materials.bone;
        }
        obj.castShadow = tier !== 'low';
        obj.receiveShadow = tier !== 'low';
      }
    });
  }, [scene, tier, materials]);

  // Per-frame update reading directly from mutable sceneStateRef
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const state = sceneStateRef.current;
    if (!state) return;

    const skullRotY = state.skullRotY || 0;
    const skullOffsetX = state.skullOffsetX !== undefined ? state.skullOffsetX : 0;
    const skullTilt = state.skullTilt !== undefined ? state.skullTilt : 0;
    const skullScale = state.skullScale !== undefined ? state.skullScale : 1.0;
    const skullOpacity = state.skullOpacity !== undefined ? state.skullOpacity : 1.0;
    const spineOpacity = state.spineOpacity !== undefined ? state.spineOpacity : 0;

    // Fix 1: When spine-anatomical.glb is active/visible, hide C1-C3 in skull-hero.glb
    // so spine-anatomical.glb provides all vertebrae starting from C1 with zero duplication
    const showNeckInSkull = spineOpacity < 0.05;
    neckMeshesRef.current.forEach((mesh) => {
      mesh.visible = showNeckInSkull;
    });

    // Update material opacities smoothly
    const skullMaterials = materialsRef.current;
    skullMaterials.bone.opacity = 0.95 * skullOpacity;
    skullMaterials.tooth.opacity = 0.95 * skullOpacity;
    skullMaterials.disc.opacity = 0.95 * skullOpacity;

    // Subtle idle motion at top of hero
    let idleAngle = 0;
    if (state.scrollProgress < 0.03 && !state.prefersReducedMotion) {
      idleTimeRef.current += delta * 0.8;
      idleAngle = Math.sin(idleTimeRef.current) * 0.025;
    }

    // Alignment: Occipital condyles / skull base rest exactly on top of C1 atlas
    const attachX = (SPINE_TOP_ANCHOR.x - SKULL_BASE_ANCHOR.x) + SKULL_ATTACHMENT_OFFSET.x;
    const attachY = (SPINE_TOP_ANCHOR.y - SKULL_BASE_ANCHOR.y) + SKULL_ATTACHMENT_OFFSET.y;
    const attachZ = (SPINE_TOP_ANCHOR.z - SKULL_BASE_ANCHOR.z) + SKULL_ATTACHMENT_OFFSET.z;

    groupRef.current.position.set(attachX + skullOffsetX, attachY, attachZ);
    // Skull vertical Y-axis stays aligned with spine axis
    groupRef.current.rotation.set(skullTilt, skullRotY + idleAngle, 0);
    groupRef.current.scale.setScalar(skullScale);
    groupRef.current.visible = visible && skullOpacity > 0.005;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Model natural coordinates: Occipital condyles touch C1 at [0, 1.498, 0.008] */}
      <primitive ref={innerRef} object={scene} position={[0, 0, 0]} />
    </group>
  );
}

useGLTF.preload('/models/skull-hero.glb');
