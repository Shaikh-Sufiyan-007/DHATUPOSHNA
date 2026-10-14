import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Layers } from 'lucide-react';
import { getMappingBySlug } from '../../utils/dhatuMapping.js';

export default function DhatuCard({ dhatu }) {
  const mapping = getMappingBySlug(dhatu.slug);

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-800/80 hover:border-amber-500/40 transition group">
      <div>
        {/* Header order & badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-mono font-bold text-slate-950 shadow"
            style={{ backgroundColor: mapping?.uiColor || '#f59e0b' }}
          >
            {dhatu.order || mapping?.sequence || '1'}
          </span>
          <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {typeof dhatu.classification === 'object'
              ? dhatu.classification.category || 'Sapta Dhatu'
              : (dhatu.classification || 'Sapta Dhatu')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-amber-300 transition flex items-baseline gap-2 mb-1">
          <span>{dhatu.name}</span>
          {dhatu.sanskritName && (
            <span className="text-sm font-classical text-amber-300/80">
              ({typeof dhatu.sanskritName === 'object'
                ? dhatu.sanskritName.devanagari || dhatu.sanskritName.iast
                : dhatu.sanskritName})
            </span>
          )}
        </h3>

        {/* Brief description */}
        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4">
          {dhatu.generalDescription ||
            (Array.isArray(dhatu.dhatuLakshana)
              ? dhatu.dhatuLakshana[0]?.explanation || dhatu.dhatuLakshana[0]?.characteristic
              : (typeof dhatu.dhatuLakshana === 'object'
                ? dhatu.dhatuLakshana?.characteristic
                : dhatu.dhatuLakshana)) ||
            'Classical Ayurvedic tissue principle.'}
        </p>

        {/* Key characteristics tags */}
        <div className="space-y-1.5 text-[11px] mb-4">
          {dhatu.location && (
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="text-slate-500 font-medium">Sthana:</span>
              <span className="truncate">
                {Array.isArray(dhatu.location)
                  ? dhatu.location.join(', ')
                  : (typeof dhatu.location === 'object'
                    ? dhatu.location.primaryLocation || dhatu.location.description
                    : dhatu.location)}
              </span>
            </div>
          )}
          {dhatu.upadhatus && (
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="text-cyan-400 font-medium">Upadhatu:</span>
              <span className="truncate">
                {Array.isArray(dhatu.upadhatus)
                  ? dhatu.upadhatus.map((u) => (typeof u === 'object' ? u.name : u)).join(', ')
                  : String(dhatu.upadhatus)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action links */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/explore?dhatu=${dhatu.slug}`}
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore in 3D</span>
        </Link>

        <Link
          to={`/dhatus/${dhatu.slug || dhatu._id}`}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition flex items-center gap-1"
        >
          <span>Details</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
