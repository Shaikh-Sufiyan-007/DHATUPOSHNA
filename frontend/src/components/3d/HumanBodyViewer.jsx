import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import HumanBodyModel from './HumanBodyModel.jsx';
import ModelLoader from './ModelLoader.jsx';
import BodyControls from './BodyControls.jsx';
import { getMappingBySlug } from '../../utils/dhatuMapping.js';
import { AlertCircle, RefreshCw } from 'lucide-react';

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Human Body Canvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900/80 rounded-2xl border border-rose-500/20">
          <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
          <h3 className="text-base text-xl font-semibold text-slate-100 mb-1">
            Interactive 3D visualization is unavailable on this device.
          </h3>
          <p className="text-slate-400 text-sm max-w-md mb-4 leading-relaxed">
            Your browser or device encountered an issue rendering WebGL. You can still explore all seven Ayurvedic Dhatus and their classical attributes using the accessible selector below.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Try Reloading 3D Scene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CameraRig({ selectedDhatu, controlsRef }) {
  useEffect(() => {
    if (!controlsRef.current) return;
    const mapping = getMappingBySlug(selectedDhatu);
    if (mapping && mapping.cameraTarget) {
      controlsRef.current.target.set(...mapping.cameraTarget);
      controlsRef.current.update();
    } else {
      controlsRef.current.target.set(0, 0.85, 0);
      controlsRef.current.update();
    }
  }, [selectedDhatu, controlsRef]);

  return null;
}

function SpatialPedestal({ selectedColor = '#38bdf8' }) {
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <group position={[0, -0.01, 0]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 48]} />
        <meshBasicMaterial
          color={selectedColor}
          transparent
          opacity={0.35}
          wireframe={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 36]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export default function HumanBodyViewer({
  selectedDhatu,
  onSelectDhatu,
  height = '620px',
  interactive = true,
}) {
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  const selectedMapping = getMappingBySlug(selectedDhatu);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0.85, 0);
      controlsRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
      controlsRef.current.update();
    }
  };

  if (!webGLSupported) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center p-6 text-center glass-panel rounded-3xl border-slate-800"
        style={{ height }}
      >
        <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
        <h3 className="text-base font-semibold text-slate-100 mb-1">
          Interactive 3D visualization is unavailable on this device.
        </h3>
        <p className="text-slate-400 text-xs max-w-md">
          WebGL hardware acceleration is not supported in this environment. Please utilize the Dhatu selection tabs to explore complete Ayurvedic knowledge.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl bg-gradient-to-b from-[#060c1c] via-[#091124] to-[#040813] transition-all duration-300 min-h-[380px] sm:min-h-[500px]"
      style={{ height }}
    >
      {/* Top Spatial HUD Header */}
      <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-4 flex items-center justify-between gap-2 pointer-events-none z-10">
        <div className="spatial-floating-hud px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full pointer-events-auto flex items-center gap-1.5 sm:gap-2 border border-slate-700/70 shadow-lg">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-300 uppercase font-semibold">
            <span className="hidden xs:inline">Spatial Viewport • </span>3D Anatomy
          </span>
        </div>

        {selectedMapping && (
          <div className="spatial-floating-hud px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full pointer-events-auto flex items-center gap-1.5 sm:gap-2 border border-amber-500/30 shadow-xl animate-spatial-in">
            <span
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-sm shrink-0"
              style={{ backgroundColor: selectedMapping.uiColor }}
            />
            <span className="text-[11px] sm:text-xs font-bold text-slate-100">
              {selectedMapping.name}
            </span>
            <span className="text-[11px] sm:text-xs font-classical text-amber-300 hidden sm:inline">
              ({selectedMapping.sanskritName})
            </span>
          </div>
        )}
      </div>

      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.85, 2.7], fov: 40 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={0.95} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 4, -2]} intensity={0.8} color="#93c5fd" />
          <directionalLight position={[0, 4, -4]} intensity={1.1} color="#e0f2fe" />

          <pointLight
            position={[0, 1.1, 1.8]}
            intensity={0.65}
            color={selectedMapping?.uiColor || '#38bdf8'}
          />
          <pointLight position={[0, 0.2, 1.5]} intensity={0.4} color="#fef08a" />
          <pointLight position={[0, 1.7, -1.8]} intensity={0.55} color="#38bdf8" />

          <Suspense fallback={<ModelLoader />}>
            <HumanBodyModel
              selectedDhatu={selectedDhatu}
              onSelectDhatu={onSelectDhatu}
            />

            <SpatialPedestal selectedColor={selectedMapping?.uiColor || '#38bdf8'} />

            <ContactShadows
              position={[0, 0.0, 0]}
              opacity={0.55}
              scale={2.4}
              blur={2.2}
              far={2.5}
            />

            <CameraRig selectedDhatu={selectedDhatu} controlsRef={controlsRef} />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            target={[0, 0.85, 0]}
            enableDamping
            dampingFactor={0.06}
            minDistance={0.8}
            maxDistance={4.2}
            maxPolarAngle={Math.PI / 1.75}
            minPolarAngle={Math.PI / 6}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            enabled={interactive}
          />
        </Canvas>
      </CanvasErrorBoundary>

      <BodyControls
        onResetView={handleResetView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        selectedDhatu={selectedDhatu}
        onClearSelection={() => onSelectDhatu(null)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
      />
    </div>
  );
}
