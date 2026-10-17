import React from 'react';
import { DHATU_MAPPINGS } from '../../utils/dhatuMapping.js';
import { Layers } from 'lucide-react';

export default function DhatuSelector({ selectedDhatu, onSelectDhatu, orientation = 'horizontal' }) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      role="tablist"
      aria-label="Ayurvedic Sapta Dhatus Selection"
      className={`spatial-dock p-2 sm:p-2.5 rounded-2xl border border-slate-700/60 shadow-xl transition-all ${isVertical ? 'flex flex-col gap-2' : 'flex flex-wrap items-center justify-center gap-2'
        }`}
    >
      <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 ${isVertical ? 'mb-1 border-b border-slate-800 pb-2' : 'hidden md:flex'}`}>
        <Layers className="w-4 h-4 text-amber-400" />
        <span className="uppercase tracking-wider font-mono text-[11px] text-amber-300">Sapta Dhatus:</span>
      </div>

      {DHATU_MAPPINGS.map((dhatu) => {
        const isSelected = selectedDhatu && selectedDhatu.toLowerCase() === dhatu.dhatuSlug.toLowerCase();

        return (
          <button
            key={dhatu.dhatuSlug}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectDhatu(isSelected ? null : dhatu.dhatuSlug)}
            className={`group relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer ${isSelected
                ? 'bg-slate-800/95 text-white shadow-lg shadow-black/40 -translate-y-0.5'
                : 'bg-slate-900/50 text-slate-300 hover:text-white hover:bg-slate-800/70 hover:-translate-y-0.5 border border-slate-800/80'
              } ${isVertical ? 'w-full text-left' : ''}`}
            style={{
              borderColor: isSelected ? dhatu.uiColor : undefined,
              boxShadow: isSelected ? `0 4px 18px -4px ${dhatu.uiColor}33` : undefined,
            }}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center font-mono transition-transform duration-200 ${isSelected ? 'bg-amber-400 text-slate-950 font-extrabold scale-110' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
              >
                {dhatu.sequence}
              </span>

              <span className="font-semibold text-xs tracking-tight">{dhatu.name}</span>
              <span className="text-xs font-classical text-amber-300/90 hidden sm:inline">
                ({dhatu.sanskritName})
              </span>
            </div>

            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${isSelected ? 'scale-125' : 'opacity-50 group-hover:opacity-90'
                }`}
              style={{
                backgroundColor: dhatu.uiColor,
                boxShadow: isSelected ? `0 0 10px ${dhatu.uiColor}` : 'none',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
