import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { nyayaApi, revisionApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { Activity, ArrowRight, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Nyayas() {
  const [nyayas, setNyayas] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNyayas = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      nyayaApi.getAll(),
      revisionApi.getNyayaComparison().catch(() => null),
    ])
      .then(([nyayaRes, compRes]) => {
        setNyayas(nyayaRes.data || []);
        if (compRes?.data) {
          setComparison(compRes.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Nyayas:', err);
        setError(err.message || 'Failed to retrieve the Three Nyayas.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNyayas();
  }, []);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-spatial-in">
      <div className="spatial-dock p-6 sm:p-8 rounded-3xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span className="text-xs uppercase tracking-wider font-semibold font-mono text-emerald-300">
            धातुपोषण न्याय त्रयी • Classic Epistemology
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-heading">
          The Three Classical Nyayas (Nourishment Theories)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          The foundational philosophical and physiological analogies formulated by Ayurvedic Acharyas to elucidate the complexities of biological nutrition, nutrient transportation, tissue conversion, and cellular assimilation.
        </p>
      </div>

      {loading && <LoadingState message="Loading the Three Nyayas..." />}
      {error && <ErrorState message={error} onRetry={fetchNyayas} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {nyayas.map((item, idx) => (
            <div
              key={item._id || idx}
              className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-700/60 flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 font-mono font-extrabold text-xs shadow-md">
                    #{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/70">
                    Classical Analogy
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-emerald-300 transition-colors mb-1">
                  {item.name}
                </h3>
                {item.sanskritName && (
                  <p className="text-xs font-classical text-amber-300/80 mb-3">
                    {typeof item.sanskritName === 'object'
                      ? `${item.sanskritName.devanagari || ''}${item.sanskritName.iast ? ` (${item.sanskritName.iast})` : ''}`
                      : item.sanskritName}
                  </p>
                )}

                {(item.literalMeaning || item.meaning) && (
                  <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-200">
                    <span className="font-bold text-[10px] uppercase font-mono block text-emerald-400 mb-0.5">Analogy Meaning:</span>
                    {item.literalMeaning || item.meaning}
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 mb-4">
                  {item.physiologicalMechanism || item.analogy?.classicalDescription || item.explanation || item.description || 'Classical theory of tissue nourishment.'}
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                <span className="text-[11px] font-mono text-slate-400">
                  {item.classicalSource || 'Brihat Trayi'}
                </span>

                <Link
                  to={`/nyayas/${item.slug || item._id}`}
                  className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1 shadow-sm"
                >
                  <span>Explore Analogy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {comparison && (
        <div className="spatial-dock p-6 sm:p-8 rounded-3xl border border-slate-700/60 shadow-xl mt-8">
          <h2 className="text-lg font-bold text-slate-100 font-heading mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Harmonized Physiological Synthesis</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
            {comparison.summary ||
              'Rather than mutually exclusive, the Three Nyayas operate in concert: Kedari-Kulya describes the systemic transport of nutrients through vascular channels, Khale-Kapota accounts for the tissue-specific receptor affinity and selective extraction by respective Dhatus, and Ksheera-Dadhi explains the biological transformation where the precursor substance yields the next tissue through Agni.'}
          </p>
        </div>
      )}
    </div>
  );
}
