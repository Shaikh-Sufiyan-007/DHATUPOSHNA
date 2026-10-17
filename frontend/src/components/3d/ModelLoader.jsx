import React from 'react';
import { Html, useProgress } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

export default function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="spatial-floating-hud p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl min-w-[240px] border border-slate-700/80 animate-spatial-in">
        <div className="relative mb-3.5">
          <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-400 border-r-cyan-400 animate-spin" />
          <Loader2 className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-100 font-bold text-xs tracking-wide uppercase font-mono">
          Loading 3D Anatomy...
        </p>
        <div className="w-40 bg-slate-900/90 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-700/80">
          <div
            className="bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-400 h-1.5 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <span className="text-[11px] text-amber-300/90 mt-1.5 font-mono font-semibold">{Math.round(progress)}% Loaded</span>
      </div>
    </Html>
  );
}
