import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { DHATU_MAPPINGS, getMappingByMeshName } from '../../utils/dhatuMapping.js';

export default function HumanBodyModel({ selectedDhatu, onSelectDhatu }) {
  const { scene } = useGLTF('/models/human-body.glb');
  const groupRef = useRef();
  const [hoveredDhatu, setHoveredDhatu] = useState(null);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const dhatuMeshMap = useMemo(() => {
    const map = new Map();
    DHATU_MAPPINGS.forEach((m) => map.set(m.dhatuSlug, []));

    clonedScene.traverse((obj) => {
      if (obj.isMesh) {
        let current = obj;
        let foundSlug = null;

        while (current && current !== clonedScene) {
          const mapping = getMappingByMeshName(current.name);
          if (mapping) {
            foundSlug = mapping.dhatuSlug;
            break;
          }
          current = current.parent;
        }

        if (foundSlug) {
          const arr = map.get(foundSlug) || [];
          arr.push(obj);
          map.set(foundSlug, arr);
          obj.userData.dhatuSlug = foundSlug;
        }
      }
    });

    return map;
  }, [clonedScene]);

  useEffect(() => {
    DHATU_MAPPINGS.forEach((mapping) => {
      const meshes = dhatuMeshMap.get(mapping.dhatuSlug) || [];
      const isSelected = selectedDhatu && selectedDhatu.toLowerCase() === mapping.dhatuSlug.toLowerCase();
      const isHovered = hoveredDhatu && hoveredDhatu.toLowerCase() === mapping.dhatuSlug.toLowerCase();
      const isAnySelected = Boolean(selectedDhatu);

      meshes.forEach((mesh) => {
        if (!mesh.material) return;

        if (!mesh.userData.originalMaterialCloned) {
          mesh.material = mesh.material.clone();
          mesh.userData.baseColor = mesh.material.color.clone();
          mesh.userData.baseOpacity = mesh.material.opacity ?? 1.0;
          mesh.userData.baseTransparent = mesh.material.transparent ?? false;
          mesh.userData.originalMaterialCloned = true;
        }

        const mat = mesh.material;

        if (isSelected) {
          mat.color.set(mapping.uiColor);
          mat.emissive.set(mapping.uiColor);
          mat.emissiveIntensity = 0.85;
          mat.opacity = 1.0;
          mat.transparent = false;
          mat.roughness = 0.22;
        } else if (isHovered) {
          mat.color.set(mapping.uiColor);
          mat.emissive.set(mapping.uiColor);
          mat.emissiveIntensity = 0.45;
          mat.opacity = 0.95;
          mat.transparent = mesh.userData.baseTransparent;
        } else if (isAnySelected) {
          mat.color.set(mesh.userData.baseColor || mapping.uiColor);
          mat.emissive.set(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.opacity = 0.18;
          mat.transparent = true;
        } else {
          mat.color.set(mesh.userData.baseColor || mapping.uiColor);
          mat.emissive.set(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.opacity = mesh.userData.baseOpacity;
          mat.transparent = mesh.userData.baseTransparent;
        }
      });
    });
  }, [selectedDhatu, hoveredDhatu, dhatuMeshMap]);

  useFrame(({ clock }) => {
    if (selectedDhatu) {
      const pulse = (Math.sin(clock.getElapsedTime() * 4) + 1) * 0.5; // 0 to 1
      const meshes = dhatuMeshMap.get(selectedDhatu.toLowerCase()) || [];
      meshes.forEach((mesh) => {
        if (mesh.material && mesh.material.emissiveIntensity !== undefined) {
          mesh.material.emissiveIntensity = 0.65 + pulse * 0.45;
        }
      });
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    let current = e.object;
    while (current && current !== clonedScene) {
      const slug = current.userData?.dhatuSlug;
      if (slug) {
        onSelectDhatu(slug);
        return;
      }
      const mapping = getMappingByMeshName(current.name);
      if (mapping) {
        onSelectDhatu(mapping.dhatuSlug);
        return;
      }
      current = current.parent;
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    let current = e.object;
    while (current && current !== clonedScene) {
      const slug = current.userData?.dhatuSlug;
      if (slug) {
        setHoveredDhatu(slug);
        document.body.style.cursor = 'pointer';
        return;
      }
      const mapping = getMappingByMeshName(current.name);
      if (mapping) {
        setHoveredDhatu(mapping.dhatuSlug);
        document.body.style.cursor = 'pointer';
        return;
      }
      current = current.parent;
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHoveredDhatu(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <primitive
      ref={groupRef}
      object={clonedScene}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

// Preload the GLB model for instant responsiveness
useGLTF.preload('/models/human-body.glb');
