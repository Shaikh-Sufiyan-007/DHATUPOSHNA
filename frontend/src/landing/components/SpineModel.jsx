import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { createDiamondMaterial } from './DiamondMaterial.js';

export default function SpineModel({ sceneStateRef, tier, activeCardIndex = 0, visible = true }) {
  const modelPath = tier === 'low' ? '/models/spine-anatomical-lite.glb' : '/models/spine-anatomical.glb';
  const { scene } = useGLTF(modelPath, '/draco/');
  const groupRef = useRef();

  // Independent instances so highlighting and opacity stay scoped to this rig
  const materials = useMemo(
    () => ({
      bone: createDiamondMaterial(tier, { isHighlighted: false }),
      highlight: createDiamondMaterial(tier, { isHighlighted: true }),
      disc: createDiamondMaterial(tier, { isDisc: true }),
    }),
    [tier]
  );
  // Per-frame opacity writes go through a ref so the render loop is not mutating a hook value
  const materialsRef = useRef(materials);
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  // Map each vertebra tag to its mesh
  const vertebraMeshesRef = useRef(new Map());

  useEffect(() => {
    vertebraMeshesRef.current.clear();
    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.name.includes('disc')) {
          obj.material = materials.disc;
        } else {
          obj.material = materials.bone;
        }
        obj.castShadow = tier !== 'low';
        obj.receiveShadow = tier !== 'low';

        // Index vertebra meshes by tag (e.g. 'c1', 'c2', 't2', 'sacrum')
        const lower = obj.name.toLowerCase();
        if (lower.startsWith('c1') || lower.includes('atlas')) vertebraMeshesRef.current.set('c1', obj);
        if (lower.startsWith('c2') || lower.includes('axis')) vertebraMeshesRef.current.set('c2', obj);
        if (lower.startsWith('c3')) vertebraMeshesRef.current.set('c3', obj);
        if (lower.startsWith('c4')) vertebraMeshesRef.current.set('c4', obj);
        if (lower.startsWith('c5')) vertebraMeshesRef.current.set('c5', obj);
        if (lower.startsWith('c6')) vertebraMeshesRef.current.set('c6', obj);
        if (lower.startsWith('c7')) vertebraMeshesRef.current.set('c7', obj);

        for (let t = 1; t <= 12; t++) {
          if (lower.startsWith(`t${t}`)) vertebraMeshesRef.current.set(`t${t}`, obj);
        }
        for (let l = 1; l <= 5; l++) {
          if (lower.startsWith(`l${l}`)) vertebraMeshesRef.current.set(`l${l}`, obj);
        }
        if (lower.includes('sacrum')) vertebraMeshesRef.current.set('sacrum', obj);
        if (lower.includes('coccyx')) vertebraMeshesRef.current.set('coccyx', obj);
      }
    });
  }, [scene, tier, materials]);

  // Vertebra highlighting based on active feature card index
  useEffect(() => {
    const targetTagMap = {
      0: 'c2',
      1: 'c6',
      2: 't2',
      3: 't6',
      4: 't10',
      5: 'l1',
      6: 'l4',
      7: 'sacrum',
    };
    const targetTag = targetTagMap[activeCardIndex] || 'c2';

    vertebraMeshesRef.current.forEach((mesh, tag) => {
      if (tag === targetTag) {
        mesh.material = materials.highlight;
      } else {
        mesh.material = materials.bone;
      }
    });
  }, [activeCardIndex, materials]);

  // Per-frame update reading directly from sceneStateRef
  useFrame(() => {
    if (!groupRef.current) return;
    const state = sceneStateRef.current;
    if (!state) return;

    const spineOpacity = state.spineOpacity !== undefined ? state.spineOpacity : 1.0;
    const spineScale = state.spineScale !== undefined ? state.spineScale : 1.0;

    // Modulate material opacities
    const spineMaterials = materialsRef.current;
    spineMaterials.bone.opacity = 0.95 * spineOpacity;
    spineMaterials.highlight.opacity = 0.95 * spineOpacity;
    spineMaterials.disc.opacity = 0.95 * spineOpacity;

    // Strict requirement: Fix 2 — The spine itself does NOT slide, tilt, or drift
    // Camera travels along spinal axis. Spine stays fixed at anatomical origin (0, 0, 0).
    // Y-rotation is applied to the shared rig parent group so skull and spine rotate together!
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.scale.setScalar(spineScale);
    groupRef.current.visible = visible && spineOpacity > 0.005;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Spine sits at its natural anatomical coordinates (C1 atlas top at 1.498m, Coccyx at 0.708m) */}
      <primitive object={scene} position={[0, 0, 0]} />
    </group>
  );
}

useGLTF.preload('/models/spine-anatomical.glb', '/draco/');
useGLTF.preload('/models/spine-anatomical-lite.glb', '/draco/');
