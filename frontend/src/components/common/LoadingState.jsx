import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading knowledge...', subtext, is3D = false }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[160px] animate-fadeIn">
      <div className="relative mb-4">
        <div
          className={`w-12 h-12 rounded-full border-2 border-t-ice border-r-transparent border-b-cyan-500 border-l-transparent animate-spin ${
            is3D ? 'border-t-ice border-b-cyan-400 w-14 h-14' : ''
          }`}
        />
        <Loader2 className="w-5 h-5 text-ice absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="text-slate-200 font-medium tracking-wide text-sm md:text-base font-heading">{message}</p>
      {subtext && <p className="text-slate-400 text-xs mt-1 max-w-sm font-body">{subtext}</p>}
    </div>
  );
}