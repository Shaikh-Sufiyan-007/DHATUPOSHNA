import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import HumanBodyViewer from '../components/3d/HumanBodyViewer.jsx';
import DhatuSelector from '../components/dhatu/DhatuSelector.jsx';
import DhatuInfoPanel from '../components/dhatu/DhatuInfoPanel.jsx';
import { getMappingBySlug } from '../utils/dhatuMapping.js';

export default function Explore3D() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get('dhatu');
  const validMapping = getMappingBySlug(rawParam);

  const [selectedDhatu, setSelectedDhatu] = useState(validMapping ? validMapping.dhatuSlug : 'rasa');
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const currentParam = searchParams.get('dhatu');
    const mapping = getMappingBySlug(currentParam);
    if (mapping && mapping.dhatuSlug !== selectedDhatu) {
      setSelectedDhatu(mapping.dhatuSlug);
    }
  }, [searchParams]);

  const handleSelectDhatu = (slug) => {
    setSelectedDhatu(slug);
    if (slug) {
      setSearchParams({ dhatu: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className={`space-y-4 animate-spatial-in ${fullscreen ? 'fixed inset-0 z-50 bg-[#030712] p-3 sm:p-6 overflow-y-auto' : 'w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 py-4'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 spatial-dock p-3.5 sm:p-5 rounded-3xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-11 h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition shadow-sm cursor-pointer hover:-translate-y-0.5 flex items-center justify-center shrink-0 touch-target"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-slate-100 font-heading truncate">
                Sapta Dhatu 3D Body Explorer
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Direct anatomical interaction linked with authentic Ayurvedic knowledge bases.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all duration-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:-translate-y-0.5 min-h-[44px] touch-target"
          >
            {fullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Immersive Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      <DhatuSelector
        selectedDhatu={selectedDhatu}
        onSelectDhatu={handleSelectDhatu}
        orientation="horizontal"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <HumanBodyViewer
            selectedDhatu={selectedDhatu}
            onSelectDhatu={handleSelectDhatu}
            height={fullscreen ? 'calc(100vh - 220px)' : 'clamp(420px, 62vh, 680px)'}
            interactive={true}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <DhatuInfoPanel
            selectedDhatu={selectedDhatu}
            onSelectDhatu={handleSelectDhatu}
          />
        </div>
      </div>
    </div>
  );
}
