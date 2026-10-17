import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Layers } from 'lucide-react';
import { getMappingBySlug } from '../../utils/dhatuMapping.js';

export default function DhatuCard({ dhatu }) {
  const mapping = getMappingBySlug(dhatu.slug);

  return (
    <div
      className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between border border-slate-700/60 transition-all duration-300 relative overflow-hidden group hover:border-amber-400/40"
      style={{
        boxShadow: '0 12px 32px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: mapping?.uiColor || '#f59e0b' }}
      />

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-extrabold text-slate-950 shadow-md group-hover:scale-105 transition-transform"
            style={{ backgroundColor: mapping?.uiColor || '#f59e0b' }}
          >
            #{dhatu.order || mapping?.sequence || '1'}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/70">
            {typeof dhatu.classification === 'object'
              ? dhatu.classification.category || 'Sapta Dhatu'
              : (dhatu.classification || 'Sapta Dhatu')}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading group-hover:text-amber-300 transition-colors flex items-baseline gap-2 mb-2">
          <span>{dhatu.name}</span>
          {dhatu.sanskritName && (
            <span className="text-sm font-classical text-amber-300/80">
              ({typeof dhatu.sanskritName === 'object'
                ? dhatu.sanskritName.devanagari || dhatu.sanskritName.iast
                : dhatu.sanskritName})
            </span>
          )}
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-5">
          {dhatu.generalDescription ||
            (Array.isArray(dhatu.dhatuLakshana)
              ? dhatu.dhatuLakshana[0]?.explanation || dhatu.dhatuLakshana[0]?.characteristic
              : (typeof dhatu.dhatuLakshana === 'object'
                ? dhatu.dhatuLakshana?.characteristic
                : dhatu.dhatuLakshana)) ||
            'Classical Ayurvedic tissue principle.'}
        </p>

        <div className="space-y-2 text-xs mb-5">
          {dhatu.location && (
            <div className="flex items-center gap-2 text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Sthana:</span>
              <span className="truncate text-slate-200">
                {Array.isArray(dhatu.location)
                  ? dhatu.location.join(', ')
                  : (typeof dhatu.location === 'object'
                    ? dhatu.location.primaryLocation || dhatu.location.description
                    : dhatu.location)}
              </span>
            </div>
          )}
          {dhatu.upadhatus && (
            <div className="flex items-center gap-2 text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
              <span className="text-cyan-400 font-semibold text-[11px] uppercase tracking-wider">Upadhatu:</span>
              <span className="truncate text-slate-200">
                {Array.isArray(dhatu.upadhatus)
                  ? dhatu.upadhatus.map((u) => (typeof u === 'object' ? u.name : u)).join(', ')
                  : String(dhatu.upadhatus)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <Link
          to={`/explore?dhatu=${dhatu.slug}`}
          className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>3D Viewport</span>
        </Link>

        <Link
          to={`/dhatus/${dhatu.slug || dhatu._id}`}
          className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1 shadow-sm"
        >
          <span>Explore Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
