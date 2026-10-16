import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dhatuposhanaApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';
import {
  GitBranch,
  ArrowRight,
  Sparkles,
  Activity,
  Layers,
  Compass,
} from 'lucide-react';
import { getMappingBySlug } from '../utils/dhatuMapping.js';

export default function Dhatuposhana() {
  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRefreshIndex((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    dhatuposhanaApi
      .getAll()
      .then((theoriesRes) => {
        if (!isMounted) return;

        const rawData = theoriesRes?.data?.dhatuposhana || theoriesRes?.data || theoriesRes;
        const list = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.results)
            ? rawData.results
            : [];

        const sorted = [...list].filter(Boolean).sort((a, b) => {
          const orderA = a?.dhatu?.order ?? a?.order ?? 0;
          const orderB = b?.dhatu?.order ?? b?.order ?? 0;
          return orderA - orderB;
        });

        setTheories(sorted);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching Dhatuposhana:', err);
        setError(err.message || 'Failed to retrieve Dhatuposhana nourishment data.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshIndex]);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-spatial-in">
      <div className="spatial-dock p-6 sm:p-8 rounded-3xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <span className="text-xs uppercase tracking-wider font-semibold font-mono text-cyan-300">
            धातुपोषण सिद्धान्त • Sequential Parinama Mechanics
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-heading">
          Dhatuposhana (Tissue Nourishment & Transformation)
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          The continuous biological cascade wherein ingested dietary essence (Ahara Rasa) circulates through micro-channels (Srotamsi) and progressively feeds each Dhatu. Classical Acharyas formulated the Three Nyayas (Ksheera-Dadhi, Kedari-Kulya, Khale-Kapota) to explain direct transmutation, irrigation, and selective affinity.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/nyayas"
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <Activity className="w-4 h-4" />
            <span>Study The Three Classical Nyayas</span>
          </Link>
          <Link
            to="/dhatvagni"
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Explore 7 Dhatvagnis</span>
          </Link>
        </div>
      </div>

      {loading && <LoadingState message="Loading Dhatuposhana theories and sequential stages..." />}
      {error && <ErrorState message={error} onRetry={handleRefresh} />}

      {!loading && !error && theories.length === 0 && (
        <EmptyState
          title="No Dhatuposhana Records Available"
          message="No sequential nourishment records were returned from the Ayurvedic database. Please try reloading."
          icon={GitBranch}
          action={
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
            >
              Refresh Records
            </button>
          }
        />
      )}

      {!loading && !error && theories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {theories.map((item, idx) => {
            if (!item) return null;

            const dhatuSlug =
              item.dhatu?.slug ||
              item.dhatu?.name?.toLowerCase() ||
              item.dhatuSlug ||
              (typeof item.dhatu === 'string' ? item.dhatu.toLowerCase() : '') ||
              '';

            const mapping = getMappingBySlug(dhatuSlug);

            const sanskritText =
              typeof item.sanskritName === 'object' && item.sanskritName !== null
                ? `${item.sanskritName.devanagari || ''}${item.sanskritName.iast ? ` (${item.sanskritName.iast})` : ''
                }`
                : typeof item.sanskritName === 'string'
                  ? item.sanskritName
                  : item.dhatu?.sanskritName?.devanagari || '';

            const precursorText =
              (typeof item.precursorSubstance === 'string'
                ? item.precursorSubstance
                : item.precursorSubstance?.name) ||
              item.previousDhatu?.name ||
              (typeof item.precursorDhatu === 'object' && item.precursorDhatu !== null
                ? item.precursorDhatu.name
                : typeof item.precursorDhatu === 'string'
                  ? item.precursorDhatu
                  : idx === 0
                    ? 'Ahara Rasa (Chyle / Nutrient Essence)'
                    : 'Poshaka Dhatu Matrix');

            const analogyText =
              (typeof item.classicalAnalogy === 'object' && item.classicalAnalogy !== null
                ? item.classicalAnalogy.metaphor
                : typeof item.classicalAnalogy === 'string'
                  ? item.classicalAnalogy
                  : '') ||
              (typeof item.channelDynamics === 'string'
                ? item.channelDynamics
                : item.channelDynamics?.description) ||
              (typeof item.theoryCategory === 'string'
                ? item.theoryCategory
                : 'Sequential Parinama');

            return (
              <div
                key={item._id || item.slug || `stage-${idx}`}
                className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-700/60 flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden shadow-lg"
              >
                <div
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500 pointer-events-none"
                  style={{ backgroundColor: mapping?.color || '#06b6d4' }}
                />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shadow-md">
                      <GitBranch className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/90 text-cyan-300 border border-slate-700/70">
                      Stage #{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-cyan-300 transition-colors mb-1">
                    {item.name || (item.dhatu?.name ? `${item.dhatu.name} Nourishment` : 'Tissue Nourishment')}
                  </h3>

                  {sanskritText && (
                    <p className="text-xs font-classical text-amber-300/90 mb-3">
                      {sanskritText}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 mb-4">
                    {item.userFriendlyLayer?.summary ||
                      item.sourceAcademicLayer?.scholarlyExplanation ||
                      item.description ||
                      'Sequential nourishment mechanics governed by Dhatvagni and classical Nyayas.'}
                  </p>

                  <div className="space-y-2 text-xs bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 mb-4">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0">
                        Nutritive Precursor:
                      </span>
                      <span className="text-slate-200 font-medium truncate max-w-[170px]" title={precursorText}>
                        {precursorText}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-cyan-400 font-semibold text-[11px] uppercase tracking-wider shrink-0">
                        Analogy / Pathway:
                      </span>
                      <span className="text-slate-200 truncate max-w-[170px]" title={analogyText}>
                        {analogyText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                  {dhatuSlug ? (
                    <Link
                      to={`/explore?dhatu=${dhatuSlug}`}
                      className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-cyan-500/10 transition"
                      title={`View ${item.dhatu?.name || dhatuSlug} in 3D Anatomy`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>3D Model</span>
                    </Link>
                  ) : (
                    <span />
                  )}

                  <Link
                    to={`/dhatuposhana/${item.slug || item._id || item.id || dhatuSlug || ''}`}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1 ml-auto shadow-sm"
                  >
                    <span>Mechanics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="spatial-dock p-6 sm:p-8 rounded-3xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-heading">
            Classical Samhita Synthesis (Three Nyayas & Dhatuposhana)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl mb-4">
          Ayurvedic physiology does not rely on a single rigid mechanism for all tissues. Instead, the Brihat Trayi integrates three complementary models:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="font-bold text-amber-300 mb-1">1. Ksheera-Dadhi Nyaya</h3>
            <p className="text-slate-400 leading-relaxed">
              Law of Total Transmutation — explains sequential direct transformation akin to milk souring into curd.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="font-bold text-cyan-300 mb-1">2. Kedari-Kulya Nyaya</h3>
            <p className="text-slate-400 leading-relaxed">
              Law of Irrigation & Distribution — explains canal-like circulatory delivery through Srotamsi (micro-vascular beds).
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="font-bold text-emerald-300 mb-1">3. Khale-Kapota Nyaya</h3>
            <p className="text-slate-400 leading-relaxed">
              Law of Selective Attraction — explains selective uptake where tissues draw distinct nutritive precursors by cellular affinity.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
