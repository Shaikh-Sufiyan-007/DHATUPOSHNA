import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dhatvagniApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { Flame, ArrowRight, Sparkles, Layers, Activity } from 'lucide-react';
import { getMappingBySlug } from '../utils/dhatuMapping.js';

export default function Dhatvagni() {
  const [agnis, setAgnis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgnis = () => {
    setLoading(true);
    setError(null);
    dhatvagniApi
      .getAll()
      .then((res) => {
        setAgnis(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Dhatvagnis:', err);
        setError(err.message || 'Failed to retrieve Dhatvagni records.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAgnis();
  }, []);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-spatial-in">
      <div className="spatial-dock p-6 sm:p-8 rounded-3xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-xs uppercase tracking-wider font-semibold font-mono text-orange-300">
            धात्वाग्नि सिद्धान्त • Cellular Bio-Transformation
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-heading">
          The Seven Dhatvagnis (Metabolic Bio-Fires)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Every Dhatu possesses its own specific Agni (cellular/tissue metabolic fire) that performs <span className="text-amber-300 font-semibold font-classical">Sara-Kitta Vibhajana</span> — dividing incoming precursor nutrition (Ahara Rasa / Poshaka Dhatu) into superior tissue substance (Poshya Dhatu), secondary tissues (Upadhatu), subsequent tissue precursor, and metabolic byproducts (Mala).
        </p>
      </div>

      {loading && <LoadingState message="Loading Dhatvagni knowledge base..." />}
      {error && <ErrorState message={error} onRetry={fetchAgnis} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {agnis.map((item, idx) => {
            const dhatuSlug = item.dhatuSlug || item.slug?.replace('agni', '')?.replace('rasa', 'rasa');
            const mapping = getMappingBySlug(dhatuSlug);

            return (
              <div
                key={item._id || idx}
                className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-700/60 flex flex-col justify-between group hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-500 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/35 flex items-center justify-center text-orange-400 shadow-md">
                      <Flame className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/70">
                      Agni #{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-amber-300 transition-colors mb-1">
                    {item.name}
                  </h3>
                  {item.sanskritName && (
                    <p className="text-xs font-classical text-amber-300/80 mb-3">
                      {typeof item.sanskritName === 'object'
                        ? `${item.sanskritName.devanagari || ''}${item.sanskritName.iast ? ` (${item.sanskritName.iast})` : ''}`
                        : item.sanskritName}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 mb-4">
                    {item.userFriendlyLayer?.summary || item.description || item.metabolicRole || 'Tissue-specific metabolic fire.'}
                  </p>

                  <div className="space-y-2 text-xs bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Poshya:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[170px]">{item.poshyaDhatu || item.metabolicFractions?.prasadaBhaga?.nourishesSelf || item.dhatu?.name || 'Target Tissue'}</span>
                    </div>
                    {(item.upadhatu || item.metabolicFractions?.prasadaBhaga?.upadhatusFormed) && (
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-400 font-semibold text-[11px] uppercase tracking-wider">Upadhatu:</span>
                        <span className="text-slate-200 truncate max-w-[170px]">
                          {item.upadhatu || (Array.isArray(item.metabolicFractions?.prasadaBhaga?.upadhatusFormed) ? item.metabolicFractions.prasadaBhaga.upadhatusFormed.join(', ') : String(item.metabolicFractions?.prasadaBhaga?.upadhatusFormed))}
                        </span>
                      </div>
                    )}
                    {(item.mala || item.metabolicFractions?.kittaBhaga?.wasteProduced) && (
                      <div className="flex justify-between items-center">
                        <span className="text-amber-400 font-semibold text-[11px] uppercase tracking-wider">Mala:</span>
                        <span className="text-slate-200 truncate max-w-[170px]">
                          {item.mala || item.metabolicFractions?.kittaBhaga?.wasteProduced}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                  {dhatuSlug && (
                    <Link
                      to={`/explore?dhatu=${dhatuSlug}`}
                      className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-cyan-500/10 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>3D Nexus</span>
                    </Link>
                  )}
                  <Link
                    to={`/dhatvagni/${item.slug || item._id}`}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1 ml-auto shadow-sm"
                  >
                    <span>Full Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
