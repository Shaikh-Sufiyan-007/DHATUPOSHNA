import React from 'react';
import { Html, useProgress } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

export default function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="glass-panel-elevated p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xl min-w-[220px]">
        <div className="relative mb-3">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <Loader2 className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-100 font-semibold text-sm tracking-wide">
          Loading 3D Human Body...
        </p>
        <div className="w-36 bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-700">
          <div
            className="bg-gradient-to-r from-amber-400 to-cyan-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <span className="text-sm text-slate-400 mt-1 font-mono">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}
