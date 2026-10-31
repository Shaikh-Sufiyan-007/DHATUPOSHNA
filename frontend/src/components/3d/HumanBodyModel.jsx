import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  DHATU_LAYER_STATES,
  REGION_TO_PRIMARY_DHATU,
  getMappingBySlug,
} from '../../utils/dhatuMapping.js';
import { useQualityTier } from '../../landing/hooks/useQualityTier.js';

// ─── Static Configuration ────────────────────────────────────────────────────

const LAYER_FILES = {
  shell: { high: 'explore-body-shell.glb', lite: 'explore-body-shell-lite.glb' },
  meda: { high: 'explore-body-meda.glb', lite: 'explore-body-meda-lite.glb' },
  mamsa: { high: 'explore-body-mamsa.glb', lite: 'explore-body-mamsa-lite.glb' },
  rakta: { high: 'explore-body-rakta.glb', lite: 'explore-body-rakta-lite.glb' },
  rasa: { high: 'explore-body-rasa.glb', lite: 'explore-body-rasa-lite.glb' },
  majja: { high: 'explore-body-majja.glb', lite: 'explore-body-majja-lite.glb' },
  shukra: { high: 'explore-body-shukra.glb', lite: 'explore-body-shukra-lite.glb' },
  asthi: { high: 'explore-skeleton.glb', lite: 'explore-skeleton-lite.glb' },
};

const LAYER_CONFIG = {
  shell: { depthRank: 0, overviewOpacity: 0.055 },
  meda: { depthRank: 1, overviewOpacity: 0.26 },
  mamsa: { depthRank: 2, overviewOpacity: 0.20 },
  rakta: { depthRank: 3, overviewOpacity: 1.0 },
  rasa: { depthRank: 3, overviewOpacity: 1.0 },
  majja: { depthRank: 3, overviewOpacity: 1.0 },
  shukra: { depthRank: 3, overviewOpacity: 1.0 },
  asthi: { depthRank: 4, overviewOpacity: 1.0 },
};

const STATE_CONSTS = {
  ghostOpacity: 0.06,
  contextDim: 0.3,
  contextDesaturate: 0.55,
  targetEmissive: 0.22,
  hoverEmissive: 0.14,
};

const LAYER_BASE_COLORS = {
  shell: '#D4A882',
  meda: '#F5E6C8',
  mamsa: '#8B2635',
  rakta: '#CC2020',
  rasa: '#A8D8B0',
  majja: '#E8C8B8',
  shukra: '#C0A050',
  asthi: '#EDE8DC',
};

const LAYER_ORDER = ['shell', 'meda', 'mamsa', 'rakta', 'rasa', 'majja', 'shukra', 'asthi'];

// ─── Material Factory ─────────────────────────────────────────────────────────

function makeBaseMat(layerName) {
  const cfg = LAYER_CONFIG[layerName];
  const col = LAYER_BASE_COLORS[layerName];
  const op = cfg.overviewOpacity;
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(col),
    roughness: layerName === 'shell' ? 0.4 : 0.65,
    metalness: layerName === 'asthi' ? 0.05 : 0.01,
    transparent: op < 1,
    opacity: op,
    depthWrite: op >= 0.5,
    side: THREE.FrontSide,
  });
}

function makeGhostMat(layerName) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(LAYER_BASE_COLORS[layerName]),
    transparent: true,
    opacity: STATE_CONSTS.ghostOpacity,
    depthWrite: false,
    roughness: 0.8,
    metalness: 0,
  });
}

function makeContextMat(layerName) {
  const c = new THREE.Color(LAYER_BASE_COLORS[layerName]);
  // dim + desaturate
  const h = { h: 0, s: 0, l: 0 };
  c.getHSL(h);
  c.setHSL(h.h, h.s * (1 - STATE_CONSTS.contextDesaturate), h.l * STATE_CONSTS.contextDim);
  return new THREE.MeshStandardMaterial({
    color: c,
    roughness: 0.85,
    metalness: 0,
    transparent: false,
    opacity: 1,
    depthWrite: true,
  });
}

function makeTargetMat(uiColor) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(uiColor),
    emissive: new THREE.Color(uiColor),
    emissiveIntensity: STATE_CONSTS.targetEmissive,
    roughness: 0.28,
    metalness: 0.06,
    transparent: false,
    depthWrite: true,
  });
}

function makeHoverMat(uiColor) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(uiColor),
    emissive: new THREE.Color(uiColor),
    emissiveIntensity: STATE_CONSTS.hoverEmissive,
    roughness: 0.38,
    metalness: 0.04,
    transparent: false,
    depthWrite: true,
  });
}

// ─── Shared Material Cache (recreate only when selectedDhatu changes) ─────────

function useMaterialSets(selectedDhatu, hoveredRegion) {
  const selectedMapping = useMemo(() => getMappingBySlug(selectedDhatu), [selectedDhatu]);

  const baseMats = useMemo(() => {
    const m = {};
    LAYER_ORDER.forEach((l) => { m[l] = makeBaseMat(l); });
    return m;
  }, []);

  const ghostMats = useMemo(() => {
    const m = {};
    LAYER_ORDER.forEach((l) => { m[l] = makeGhostMat(l); });
    return m;
  }, []);

  const contextMats = useMemo(() => {
    const m = {};
    LAYER_ORDER.forEach((l) => { m[l] = makeContextMat(l); });
    return m;
  }, []);

  const targetMat = useMemo(() => {
    if (!selectedMapping) return null;
    return makeTargetMat(selectedMapping.uiColor);
  }, [selectedMapping]);

  const hoverMat = useMemo(() => {
    const hovMapping = hoveredRegion ? getMappingBySlug(REGION_TO_PRIMARY_DHATU[hoveredRegion]) : null;
    if (!hovMapping) return null;
    return makeHoverMat(hovMapping.uiColor);
  }, [hoveredRegion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(baseMats).forEach((m) => m.dispose());
      Object.values(ghostMats).forEach((m) => m.dispose());
      Object.values(contextMats).forEach((m) => m.dispose());
    };
  }, [baseMats, ghostMats, contextMats]);

  useEffect(() => {
    return () => { if (targetMat) targetMat.dispose(); };
  }, [targetMat]);

  useEffect(() => {
    return () => { if (hoverMat) hoverMat.dispose(); };
  }, [hoverMat]);

  return { baseMats, ghostMats, contextMats, targetMat, hoverMat, selectedMapping };
}

// ─── Mesh State Resolver ──────────────────────────────────────────────────────

function resolveMeshState(mesh, layerName, selectedDhatu, hoveredRegion) {
  const region = mesh.userData.region;
  if (!selectedDhatu) return 'base';
  const layerState = DHATU_LAYER_STATES[selectedDhatu];
  if (!layerState) return 'base';

  const { targetLayers, ghostLayers, ghostRegions } = layerState;
  const isGhostLayer = ghostLayers.includes(layerName);
  const isGhostRegion = ghostRegions && ghostRegions.includes(region);
  const isTargetLayer = targetLayers.includes(layerName);

  if (isGhostLayer || isGhostRegion) return 'ghost';
  if (isTargetLayer) {
    if (region && region === hoveredRegion) return 'hover';
    return 'target';
  }
  return 'context';
}

// ─── Single Layer Mesh Group ──────────────────────────────────────────────────

function LayerGroup({
  scene,
  layerName,
  selectedDhatu,
  hoveredRegion,
  onHoverRegion,
  onClickRegion,
  mats,
}) {
  const groupRef = useRef();
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Tag all meshes with layer name
  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (obj.isMesh) {
        obj.userData.layer = layerName;
        // region may already be set from GLB extras; fall back to legacy name match
        if (!obj.userData.region) {
          const n = obj.name || '';
          // Try to infer region from mesh name prefix
          const candidate = Object.keys(REGION_TO_PRIMARY_DHATU).find(
            (r) => n === r || n.startsWith(r + '_') || n.includes(r)
          );
          if (candidate) obj.userData.region = candidate;
        }
        obj.userData.part = obj.name;
      }
    });
  }, [clonedScene, layerName]);

  // Apply materials
  useEffect(() => {
    const { baseMats, ghostMats, contextMats, targetMat, hoverMat } = mats;
    clonedScene.traverse((obj) => {
      if (!obj.isMesh) return;
      const state = resolveMeshState(obj, layerName, selectedDhatu, hoveredRegion);
      switch (state) {
        case 'ghost':
          obj.material = ghostMats[layerName];
          obj.renderOrder = -1;
          break;
        case 'target':
          obj.material = targetMat || baseMats[layerName];
          obj.renderOrder = 1;
          break;
        case 'hover':
          obj.material = hoverMat || targetMat || baseMats[layerName];
          obj.renderOrder = 2;
          break;
        case 'context':
          obj.material = contextMats[layerName];
          obj.renderOrder = 0;
          break;
        default:
          obj.material = baseMats[layerName];
          obj.renderOrder = 0;
      }
    });
  }, [clonedScene, layerName, selectedDhatu, hoveredRegion, mats]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    // Skip ghost layers entirely for picking
    if (selectedDhatu) {
      const layerState = DHATU_LAYER_STATES[selectedDhatu];
      if (layerState && layerState.ghostLayers.includes(layerName)) return;
    }
    let cur = e.object;
    while (cur && cur !== clonedScene) {
      const region = cur.userData?.region;
      if (region && REGION_TO_PRIMARY_DHATU[region]) {
        onClickRegion(REGION_TO_PRIMARY_DHATU[region]);
        return;
      }
      if (region) {
        // region is itself a dhatu slug (legacy skeleton region = dhatu slug)
        onClickRegion(region);
        return;
      }
      cur = cur.parent;
    }
  }, [clonedScene, layerName, selectedDhatu, onClickRegion]);

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    if (selectedDhatu) {
      const layerState = DHATU_LAYER_STATES[selectedDhatu];
      if (layerState && layerState.ghostLayers.includes(layerName)) return;
    }
    let cur = e.object;
    while (cur && cur !== clonedScene) {
      const region = cur.userData?.region;
      if (region) {
        onHoverRegion(region);
        document.body.style.cursor = 'pointer';
        return;
      }
      cur = cur.parent;
    }
  }, [clonedScene, layerName, selectedDhatu, onHoverRegion]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    onHoverRegion(null);
    document.body.style.cursor = 'auto';
  }, [onHoverRegion]);

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

// ─── Per-Layer Loader Components (each calls useGLTF unconditionally) ─────────

function ShellLayer(props) {
  const tier = props.tier;
  const path = `/models/${LAYER_FILES.shell[tier === 'low' ? 'lite' : 'high']}`;
  const { scene } = useGLTF(path);
  return <LayerGroup {...props} scene={scene} layerName="shell" />;
}

function MedaLayer(props) {
  const tier = props.tier;
  const path = `/models/${LAYER_FILES.meda[tier === 'low' ? 'lite' : 'high']}`;
  const { scene } = useGLTF(path);
  return <LayerGroup {...props} scene={scene} layerName="meda" />;
}

function MamsaLayer(props) {
  const tier = props.tier;
  const path = `/models/${LAYER_FILES.mamsa[tier === 'low' ? 'lite' : 'high']}`;
  const { scene } = useGLTF(path);
  return <LayerGroup {...props} scene={scene} layerName="mamsa" />;
}

function RaktaLayer(props) {
  const tier = props.tier;
  const path = `/models/${LAYER_FILES.rakta[tier === 'low' ? 'lite' : 'high']}`;
  const { scene } = useGLTF(path);
  return <LayerGroup {...props} scene={scene} layerName="rakta" />;
}

function RasaLayer(props) {
  const tier = props.tier;
  const path = `/models/${LAYER_FILES.rasa[tier === 'low' ? 'lite' : 'high']}`;
  const { scene } = useGLTF(path);
  return <LayerGroup {...props} scene={scene} layerName="rasa" />;
}

function MajjaLayer(props) {
  const tier = props.tier;
  const path = `/models/${LAYER_FILES.majja[tier === 'low' ? 'lite' : 'high']}`;
  const { scene } = useGLTF(path);
  return <LayerGroup {...props} scene={scene} layerName="majja" />;
}

function ShukraLayer(props) {
  const tier = props.tier;
  const path = `/models/${LAYER_FILES.shukra[tier === 'low' ? 'lite' : 'high']}`;
  const { scene } = useGLTF(path);
  return <LayerGroup {...props} scene={scene} layerName="shukra" />;
}

function AsthiLayer(props) {
  const tier = props.tier;
  const path = `/models/${LAYER_FILES.asthi[tier === 'low' ? 'lite' : 'high']}`;
  const { scene } = useGLTF(path);
  return <LayerGroup {...props} scene={scene} layerName="asthi" />;
}

function FallbackAsthiLayer(props) {
  const { scene } = useGLTF('/models/human-body.glb');
  return <LayerGroup {...props} scene={scene} layerName="asthi" />;
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

class LayerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn(`[Explore3D] Layer "${this.props.layerName}" failed to load:`, error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// ─── Glow Pulse (useFrame in a dedicated component) ──────────────────────────

function GlowPulse({ targetMat }) {
  useFrame(({ clock }) => {
    if (targetMat) {
      const t = clock.getElapsedTime();
      targetMat.emissiveIntensity = STATE_CONSTS.targetEmissive + (Math.sin(t * 3.5) + 1) * 0.5 * 0.18;
    }
  });
  return null;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function HumanBodyModel({ selectedDhatu, onSelectDhatu }) {
  const tier = useQualityTier();
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const mats = useMaterialSets(selectedDhatu, hoveredRegion);

  const handleClickRegion = useCallback((slug) => {
    onSelectDhatu(slug);
  }, [onSelectDhatu]);

  const handleHoverRegion = useCallback((region) => {
    setHoveredRegion(region);
  }, []);

  const layerProps = {
    tier,
    selectedDhatu,
    hoveredRegion,
    onHoverRegion: handleHoverRegion,
    onClickRegion: handleClickRegion,
    mats,
  };

  return (
    <group>
      <GlowPulse targetMat={mats.targetMat} />

      {/* Shell — always rendered, lowest layer */}
      <LayerErrorBoundary layerName="shell">
        <React.Suspense fallback={null}>
          <ShellLayer {...layerProps} />
        </React.Suspense>
      </LayerErrorBoundary>

      {/* Meda */}
      <LayerErrorBoundary layerName="meda">
        <React.Suspense fallback={null}>
          <MedaLayer {...layerProps} />
        </React.Suspense>
      </LayerErrorBoundary>

      {/* Mamsa */}
      <LayerErrorBoundary layerName="mamsa">
        <React.Suspense fallback={null}>
          <MamsaLayer {...layerProps} />
        </React.Suspense>
      </LayerErrorBoundary>

      {/* Rakta */}
      <LayerErrorBoundary layerName="rakta">
        <React.Suspense fallback={null}>
          <RaktaLayer {...layerProps} />
        </React.Suspense>
      </LayerErrorBoundary>

      {/* Rasa */}
      <LayerErrorBoundary layerName="rasa">
        <React.Suspense fallback={null}>
          <RasaLayer {...layerProps} />
        </React.Suspense>
      </LayerErrorBoundary>

      {/* Majja */}
      <LayerErrorBoundary layerName="majja">
        <React.Suspense fallback={null}>
          <MajjaLayer {...layerProps} />
        </React.Suspense>
      </LayerErrorBoundary>

      {/* Shukra */}
      <LayerErrorBoundary layerName="shukra">
        <React.Suspense fallback={null}>
          <ShukraLayer {...layerProps} />
        </React.Suspense>
      </LayerErrorBoundary>

      {/* Asthi — skeleton, innermost */}
      <LayerErrorBoundary
        layerName="asthi"
        fallback={
          <LayerErrorBoundary layerName="asthi-fallback">
            <React.Suspense fallback={null}>
              <FallbackAsthiLayer {...layerProps} />
            </React.Suspense>
          </LayerErrorBoundary>
        }
      >
        <React.Suspense fallback={null}>
          <AsthiLayer {...layerProps} />
        </React.Suspense>
      </LayerErrorBoundary>
    </group>
  );
}

// Preload priority assets
useGLTF.preload('/models/explore-body-shell.glb');
useGLTF.preload('/models/explore-body-shell-lite.glb');
useGLTF.preload('/models/explore-skeleton.glb');
useGLTF.preload('/models/explore-skeleton-lite.glb');
useGLTF.preload('/models/human-body.glb');
