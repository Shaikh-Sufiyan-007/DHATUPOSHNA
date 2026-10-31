import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  GitBranch,
  BookMarked,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { dhatuApi } from '../../api/index.js';
import { getMappingBySlug } from '../../utils/dhatuMapping.js';
import LoadingState from '../common/LoadingState.jsx';
import ErrorState from '../common/ErrorState.jsx';

export default function DhatuInfoPanel({ selectedDhatu, onSelectDhatu }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapping = getMappingBySlug(selectedDhatu);

  useEffect(() => {
    if (!selectedDhatu) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    dhatuApi
      .getBySlugOrId(selectedDhatu)
      .then((res) => {
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch Dhatu information:', err);
          setError(err.message || 'Could not load Dhatu details from server.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDhatu]);

  if (!selectedDhatu) {
    return (
      <div className="spatial-dock rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center h-full min-h-[440px] border border-slate-700/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-cyan-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-5 shadow-lg shadow-amber-500/10">
          <Sparkles className="w-8 h-8 animate-pulse-subtle" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 font-heading mb-2">
          Select an Anatomical Locus or Dhatu
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm max-w-sm leading-relaxed mb-6 font-body">
          Click any highlighted region on the 3D human body model, or select one of the seven Sapta Dhatus to access authentic classical knowledge, Dhatvagni metabolic dynamics, and classical references.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['rasa', 'rakta', 'mamsa', 'meda', 'asthi', 'majja', 'shukra'].map((slug) => {
            const m = getMappingBySlug(slug);
            return (
              <button
                key={slug}
                onClick={() => onSelectDhatu(slug)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 hover:border-amber-400/50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 shadow-sm cursor-pointer min-h-[44px] touch-target font-heading"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m?.uiColor }} />
                <span>{m?.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="spatial-dock rounded-3xl p-8 flex items-center justify-center h-full min-h-[440px] border border-slate-700/60 shadow-2xl">
        <LoadingState
          message={`Loading ${mapping?.name || ''} Dhatu information...`}
          subtext="Fetching classical definition, karma, and metabolic relationships from MongoDB"
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="spatial-dock rounded-3xl p-8 flex items-center justify-center h-full min-h-[440px] border border-slate-700/60 shadow-2xl">
        <ErrorState
          title="Dhatu Information Unavailable"
          message={error || 'Could not load Dhatu details.'}
          onRetry={() => {
            setLoading(true);
            setError(null);
            dhatuApi
              .getBySlugOrId(selectedDhatu)
              .then((res) => {
                setData(res.data);
                setLoading(false);
              })
              .catch((err) => {
                setError(err.message || 'Retry failed.');
                setLoading(false);
              });
          }}
        />
      </div>
    );
  }

  return (
    <div className="spatial-dock rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-700/60 flex flex-col justify-between h-full overflow-y-auto max-h-[720px] shadow-2xl animate-spatial-in font-body">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-3 h-3 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: mapping?.uiColor }}
              />
              <span className="text-[11px] font-heading uppercase tracking-wider font-semibold text-slate-400">
                Sequence Order #{data.order || mapping?.sequence || '1'} of Sapta Dhatus
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-heading tracking-tight flex flex-wrap items-baseline gap-2">
              <span>{data.name}</span>
              {data.sanskritName && (
                <span className="text-lg sm:text-xl font-heading text-amber-300">
                  ({typeof data.sanskritName === 'object'
                    ? data.sanskritName.devanagari || data.sanskritName.iast
                    : data.sanskritName})
                </span>
              )}
            </h2>
          </div>

          <span
            className="px-3 py-1 rounded-full text-xs font-heading font-semibold uppercase tracking-wider border shrink-0"
            style={{
              borderColor: `${mapping?.uiColor}55`,
              color: mapping?.uiColor,
              backgroundColor: `${mapping?.uiColor}15`,
            }}
          >
            {data.classification?.category || 'Sapta Dhatu'}
          </span>
        </div>

        {mapping?.educationalFocus && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-amber-400 font-heading font-bold shrink-0">Focus:</span>
            <span className="text-slate-300 truncate">{mapping.educationalFocus}</span>
          </div>
        )}

        <div className="mb-5">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-body">
            {data.generalDescription ||
              data.definition ||
              (Array.isArray(data.dhatuLakshana)
                ? data.dhatuLakshana[0]?.explanation || data.dhatuLakshana[0]?.characteristic
                : data.dhatuLakshana) ||
              data.function ||
              'Classical Ayurvedic tissue principle.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-2 font-heading">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Primary Karma (Function)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.primaryFunctions && data.primaryFunctions.length > 0
                ? (typeof data.primaryFunctions[0] === 'string'
                  ? data.primaryFunctions.join(', ')
                  : data.primaryFunctions.map((f) => f.functionName || f.karma).join(', '))
                : data.karma || 'Sustenance and structural nourishment of the bodily tissues.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 mb-2 font-heading">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Mahabhuta Dominance</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.panchamahabhutaPredominance && data.panchamahabhutaPredominance.length > 0 ? (
                data.panchamahabhutaPredominance.map((bhuta, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] text-slate-200 font-medium"
                  >
                    {typeof bhuta === 'string' ? bhuta : bhuta.element || bhuta.mahabhuta}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Panchamahabhuta equilibrium</span>
              )}
            </div>
          </div>
        </div>

        {data.location && (
          <div className="mb-5 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
            <span className="text-xs uppercase font-semibold text-slate-400 block mb-0.5 font-heading">
              Anatomical Location (Sthana)
            </span>
            <p className="text-slate-200">
              {typeof data.location === 'string'
                ? data.location
                : (typeof data.location === 'object'
                  ? data.location.primaryLocation || data.location.description || ''
                  : data.location)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5 text-sm">
          {data.upadhatus && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs uppercase font-bold text-cyan-400 block mb-1 font-heading">
                Upadhatu (Secondary)
              </span>
              <p className="text-slate-200 font-medium text-xs">
                {Array.isArray(data.upadhatus)
                  ? data.upadhatus.map((u) => (typeof u === 'object' ? u.name : u)).join(', ')
                  : String(data.upadhatus)}
              </p>
            </div>
          )}

          {data.malas && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs uppercase font-bold text-amber-400 block mb-1 font-heading">
                Mala (Metabolic Waste)
              </span>
              <p className="text-slate-200 font-medium text-xs">
                {Array.isArray(data.malas)
                  ? data.malas.map((m) => (typeof m === 'object' ? m.name : m)).join(', ')
                  : String(data.malas)}
              </p>
            </div>
          )}

          {data.srotas && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs uppercase font-bold text-purple-400 block mb-1 font-heading">
                Srotas (Channel System)
              </span>
              <p className="text-slate-200 font-medium text-xs">
                {typeof data.srotas === 'object'
                  ? data.srotas.name || (Array.isArray(data.srotas.moolasthana) ? data.srotas.moolasthana.join(', ') : data.srotas.mula) || 'Associated Srotas'
                  : String(data.srotas)}
              </p>
            </div>
          )}
        </div>

        {data.westernCorrelation && (
          <div className="mb-5 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
            <span className="text-xs uppercase font-semibold text-slate-400 block mb-0.5 font-heading">
              Modern Physiological Correlation (Comparative Epistemology)
            </span>
            <p className="text-slate-300">
              {typeof data.westernCorrelation === 'object'
                ? data.westernCorrelation.description || data.westernCorrelation.tissueType || JSON.stringify(data.westernCorrelation)
                : data.westernCorrelation}
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-700/60 mt-4 font-heading">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link
            to={`/dhatus/${data.slug || selectedDhatu}`}
            className="px-2.5 sm:px-3 py-2.5 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20 min-h-[44px] touch-target active:scale-95"
          >
            <span>Full Details</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </Link>

          <Link
            to={`/dhatvagni?dhatuId=${data._id}`}
            className="px-2.5 sm:px-3 py-2.5 rounded-xl text-center text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/35 hover:border-amber-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1 shadow-sm min-h-[44px] touch-target active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Dhatvagni</span>
          </Link>

          <Link
            to={`/dhatuposhana?dhatuId=${data._id}`}
            className="px-2.5 sm:px-3 py-2.5 rounded-xl text-center text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/35 hover:border-cyan-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1 shadow-sm min-h-[44px] touch-target active:scale-95"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Poshana</span>
          </Link>

          <Link
            to={`/references?search=${encodeURIComponent(data.name)}`}
            className="px-2.5 sm:px-3 py-2.5 rounded-xl text-center text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1 shadow-sm min-h-[44px] touch-target active:scale-95"
          >
            <BookMarked className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>References</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
