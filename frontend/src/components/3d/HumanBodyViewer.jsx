import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import HumanBodyModel from './HumanBodyModel.jsx';
import ModelLoader from './ModelLoader.jsx';
import BodyControls from './BodyControls.jsx';
import { getMappingBySlug } from '../../utils/dhatuMapping.js';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Error Boundary for Canvas to catch WebGL or GLTF loading exceptions
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

// Camera controller helper to smoothly update position/target on selection
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

export default function HumanBodyViewer({
  selectedDhatu,
  onSelectDhatu,
  height = '620px',
  interactive = true,
}) {
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL availability upfront
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
        className="w-full flex flex-col items-center justify-center p-6 text-center glass-panel rounded-2xl border-slate-800"
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
      className="relative w-full rounded-2xl overflow-hidden glass-panel border border-slate-800/80 shadow-2xl bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950"
      style={{ height }}
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.85, 2.7], fov: 40 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Professional Medical Studio Lighting */}
          <ambientLight intensity={0.95} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 4, -2]} intensity={0.8} color="#93c5fd" />
          <directionalLight position={[0, 4, -4]} intensity={1.0} color="#e0f2fe" />
          <pointLight position={[0, 0.3, 2.0]} intensity={0.45} color="#fef08a" />
          <pointLight position={[0, 1.7, -1.8]} intensity={0.55} color="#38bdf8" />

          {/* Model with Drei Suspense loader */}
          <Suspense fallback={<ModelLoader />}>
            <HumanBodyModel
              selectedDhatu={selectedDhatu}
              onSelectDhatu={onSelectDhatu}
            />

            {/* Grounding contact shadow under soles of feet */}
            <ContactShadows
              position={[0, 0.0, 0]}
              opacity={0.45}
              scale={2.2}
              blur={2.0}
              far={2.5}
            />

            <CameraRig selectedDhatu={selectedDhatu} controlsRef={controlsRef} />
          </Suspense>

          {/* Camera Controls with Damping and Reasonable Zoom Limits */}
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

      {/* Visible Floating Control Bar */}
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
