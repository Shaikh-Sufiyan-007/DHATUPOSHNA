import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { createDiamondMaterial } from './DiamondMaterial.js';

export default function SkeletonModel({ sceneStateRef, tier, visible = false }) {
  const modelPath = tier === 'low' ? '/models/skeleton-full-lite.glb' : '/models/skeleton-full.glb';
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();

  // Independent instances so each tissue can fade on its own opacity channel
  const materials = useMemo(
    () => ({
      bone: createDiamondMaterial(tier),
      tooth: createDiamondMaterial(tier, { isTooth: true }),
      cartilage: createDiamondMaterial(tier, { isCartilage: true }),
      disc: createDiamondMaterial(tier, { isDisc: true }),
    }),
    [tier]
  );
  // Per-frame opacity writes go through a ref so the render loop is not mutating a hook value
  const materialsRef = useRef(materials);
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.name.startsWith('tooth_')) {
          obj.material = materials.tooth;
        } else if (obj.name.startsWith('costal_cartilage_')) {
          obj.material = materials.cartilage;
        } else if (obj.name.includes('disc')) {
          obj.material = materials.disc;
        } else {
          obj.material = materials.bone;
        }
        obj.castShadow = tier !== 'low';
        obj.receiveShadow = tier !== 'low';
      }
    });
  }, [scene, tier, materials]);

  useFrame(() => {
    if (!groupRef.current) return;
    const state = sceneStateRef.current;
    if (!state) return;

    const skeletonRotY = state.skeletonRotY || 0;
    const skeletonScale = state.skeletonScale !== undefined ? state.skeletonScale : 1.0;
    const skeletonOpacity = state.skeletonOpacity !== undefined ? state.skeletonOpacity : 0;

    // Modulate material opacities
    const skeletonMaterials = materialsRef.current;
    skeletonMaterials.bone.opacity = 0.95 * skeletonOpacity;
    skeletonMaterials.tooth.opacity = 0.95 * skeletonOpacity;
    skeletonMaterials.cartilage.opacity = 0.95 * skeletonOpacity;
    skeletonMaterials.disc.opacity = 0.95 * skeletonOpacity;

    // Fix 4: Sits upright and vertical at natural anatomical origin (0, 0, 0)
    // Feet soles at Y = 0.008m, Cranium top at Y = 1.720m, Center at Y = 0.864m
    groupRef.current.position.set(0, 0, 0);
    // Spine stays strictly vertical, Y-rotation eases back front-facing (0)
    groupRef.current.rotation.set(0, skeletonRotY, 0);
    groupRef.current.scale.setScalar(skeletonScale);
    groupRef.current.visible = visible && skeletonOpacity > 0.005;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Skeleton sits at natural anatomical coordinates (0, 0, 0) matching spine and skull */}
      <primitive object={scene} position={[0, 0, 0]} />
    </group>
  );
}

useGLTF.preload('/models/skeleton-full.glb');
