import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getMappingBySlug } from '../../utils/dhatuMapping.js';

export default function DhatuCard({ dhatu }) {
  const mapping = getMappingBySlug(dhatu.slug);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="glass-card rounded-3xl p-5 sm:p-7 flex flex-col justify-between border border-slate-700/60 transition-all duration-300 relative overflow-hidden group hover:border-amber-400/40"
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
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-heading font-extrabold text-slate-950 shadow-md group-hover:scale-105 transition-transform shrink-0"
            style={{ backgroundColor: mapping?.uiColor || '#f59e0b' }}
          >
            #{dhatu.order || mapping?.sequence || '1'}
          </span>
          <span className="text-[11px] font-heading uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/70 truncate">
            {typeof dhatu.classification === 'object'
              ? dhatu.classification.category || 'Sapta Dhatu'
              : (dhatu.classification || 'Sapta Dhatu')}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading group-hover:text-amber-300 transition-colors flex flex-wrap items-baseline gap-2 mb-2">
          <span>{dhatu.name}</span>
          {dhatu.sanskritName && (
            <span className="text-sm font-heading text-amber-300/80">
              ({typeof dhatu.sanskritName === 'object'
                ? dhatu.sanskritName.devanagari || dhatu.sanskritName.iast
                : dhatu.sanskritName})
            </span>
          )}
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-5 font-body">
          {dhatu.generalDescription ||
            (Array.isArray(dhatu.dhatuLakshana)
              ? dhatu.dhatuLakshana[0]?.explanation || dhatu.dhatuLakshana[0]?.characteristic
              : dhatu.dhatuLakshana) ||
            dhatu.function ||
            'Classical Ayurvedic tissue principle.'}
        </p>

        <div className="space-y-2 text-xs mb-5 font-body">
          {dhatu.location && (
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5 font-medium">Anatomical Locus:</span>
              <span className="text-slate-200 line-clamp-2">
                {typeof dhatu.location === 'object' ? dhatu.location.primaryLocation || JSON.stringify(dhatu.location) : dhatu.location}
              </span>
            </div>
          )}

          {dhatu.primaryFunctions && dhatu.primaryFunctions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dhatu.primaryFunctions.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium"
                >
                  {typeof f === 'string' ? f : f.functionName || f.karma || 'Karma'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 font-heading">
        <Link
          to={`/explore?dhatu=${dhatu.slug}`}
          className="text-xs font-bold px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 flex-1 min-h-[40px] touch-target active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">View in 3D</span>
        </Link>

        <Link
          to={`/dhatus/${dhatu.slug}`}
          className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1 shadow-sm min-h-[40px] touch-target active:scale-95"
        >
          <span>Analyze</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </motion.div>
  );
}
