import React from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Compass, Info, X } from 'lucide-react';
import { getMappingBySlug } from '../../utils/dhatuMapping.js';

export default function BodyControls({
  onResetView,
  onZoomIn,
  onZoomOut,
  selectedDhatu,
  onClearSelection,
  autoRotate,
  onToggleAutoRotate,
}) {
  const selectedMapping = getMappingBySlug(selectedDhatu);

  return (
    <div className="absolute inset-x-0 bottom-3 sm:bottom-4 px-2.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 pointer-events-none z-10">
      <div className="hidden xs:flex spatial-floating-hud px-3 py-1.5 rounded-full pointer-events-auto text-[11px] sm:text-xs text-slate-300 items-center gap-1.5 sm:gap-2 border border-slate-700/70 shadow-xl transition-all">
        <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
        <span className="hidden sm:inline">
          Drag to rotate • Scroll to zoom • Tap body locus to inspect Dhatu
        </span>
        <span className="sm:hidden">
          Drag to rotate • Pinch to zoom • Tap to inspect
        </span>
      </div>

      {selectedMapping && (
        <div className="spatial-floating-hud px-3 py-1.5 rounded-full pointer-events-auto flex items-center gap-2 border border-amber-500/40 shadow-xl animate-spatial-in">
          <span
            className="w-2.5 h-2.5 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: selectedMapping.uiColor }}
          />
          <span className="text-xs font-bold text-slate-100 truncate max-w-[160px] sm:max-w-none">
            {selectedMapping.name} ({selectedMapping.sanskritName})
          </span>
          <button
            onClick={onClearSelection}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
            title="Clear selection"
            aria-label="Clear selected Dhatu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 spatial-floating-hud p-1 sm:p-1.5 rounded-2xl pointer-events-auto border border-slate-700/70 shadow-2xl">
        <button
          onClick={onToggleAutoRotate}
          className={`p-2 sm:p-2.5 rounded-xl text-xs font-medium transition duration-200 flex items-center justify-center cursor-pointer min-h-[38px] min-w-[38px] ${autoRotate
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          title={autoRotate ? 'Stop auto-rotation' : 'Start auto-rotation'}
          aria-label="Toggle auto rotation"
        >
          <Compass className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        </button>

        <button
          onClick={onZoomIn}
          className="p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Zoom In"
          aria-label="Zoom in on 3D body"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          className="p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition duration-200 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Zoom Out"
          aria-label="Zoom out of 3D body"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5" />

        <button
          onClick={onResetView}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800/80 transition duration-200 flex items-center gap-1.5 cursor-pointer text-xs font-semibold min-h-[38px]"
          title="Reset Camera View"
          aria-label="Reset 3D camera"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Reset View</span>
        </button>
      </div>
    </div>
  );
}
