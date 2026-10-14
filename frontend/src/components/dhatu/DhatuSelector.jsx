import React from 'react';
import { DHATU_MAPPINGS } from '../../utils/dhatuMapping.js';
import { Layers } from 'lucide-react';

export default function DhatuSelector({ selectedDhatu, onSelectDhatu, orientation = 'horizontal' }) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      role="tablist"
      aria-label="Ayurvedic Sapta Dhatus Selection"
      className={`glass-panel p-2 rounded-2xl border border-slate-800/80 ${isVertical ? 'flex flex-col gap-1.5' : 'flex flex-wrap items-center justify-center gap-2'
        }`}
    >
      <div className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-400 ${isVertical ? 'mb-1 border-b border-slate-800 pb-2' : 'hidden md:flex'}`}>
        <Layers className="w-3.5 h-3.5 text-amber-400" />
        <span className="uppercase tracking-wider text-[11px]">Sapta Dhatus:</span>
      </div>

      {DHATU_MAPPINGS.map((dhatu) => {
        const isSelected = selectedDhatu && selectedDhatu.toLowerCase() === dhatu.dhatuSlug.toLowerCase();

        return (
          <button
            key={dhatu.dhatuSlug}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectDhatu(isSelected ? null : dhatu.dhatuSlug)}
            className={`group relative px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-between gap-2.5 ${isSelected
              ? 'bg-slate-800 text-white shadow-lg border border-amber-500/50'
              : 'bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800/60'
              } ${isVertical ? 'w-full text-left' : ''}`}
            style={{
              borderColor: isSelected ? dhatu.uiColor : undefined,
            }}
          >
            <div className="flex items-center gap-2.5 truncate">
              {/* Order number badge */}
              <span
                className={`w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center font-mono ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
              >
                {dhatu.sequence}
              </span>

              {/* Dhatu Names */}
              <span className="font-semibold text-sm">{dhatu.name}</span>
              <span className="text-sm font-classical text-amber-300/80 hidden sm:inline">
                ({dhatu.sanskritName})
              </span>
            </div>

            {/* Glowing Accent Indicator */}
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${isSelected ? 'scale-125 shadow-lg' : 'opacity-60 group-hover:opacity-100'
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
