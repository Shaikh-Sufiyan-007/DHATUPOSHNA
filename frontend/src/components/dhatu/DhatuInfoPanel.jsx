import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Flame,
  GitBranch,
  BookMarked,
  Shield,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
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
        <p className="text-slate-300 text-xs sm:text-sm max-w-sm leading-relaxed mb-6">
          Click any highlighted region on the 3D human body model, or select one of the seven Sapta Dhatus to access authentic classical knowledge, Dhatvagni metabolic dynamics, and classical references.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['rasa', 'rakta', 'mamsa', 'meda', 'asthi', 'majja', 'shukra'].map((slug) => {
            const m = getMappingBySlug(slug);
            return (
              <button
                key={slug}
                onClick={() => onSelectDhatu(slug)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 hover:border-amber-400/50 hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-sm cursor-pointer min-h-[44px] touch-target"
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

  if (error) {
    return (
      <div className="spatial-dock rounded-3xl p-8 flex items-center justify-center h-full min-h-[440px] border border-slate-700/60 shadow-2xl">
        <ErrorState
          title="Dhatu Information Unavailable"
          message={error}
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

  if (!data) return null;

  return (
    <div className="spatial-dock rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-700/60 flex flex-col justify-between h-full overflow-y-auto max-h-[720px] shadow-2xl animate-spatial-in">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: mapping?.uiColor }}
              />
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-400">
                Dhatu #{data.order || mapping?.sequence} • {typeof data.classification === 'object' ? data.classification.category || 'Sapta Dhatu' : (data.classification || 'Sapta Dhatu')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 font-heading flex flex-wrap items-baseline gap-2">
              <span>{data.name}</span>
              {data.sanskritName && (
                <span className="text-base sm:text-lg font-classical text-amber-300">
                  ({typeof data.sanskritName === 'object' ? data.sanskritName.devanagari || data.sanskritName.iast : data.sanskritName})
                </span>
              )}
            </h2>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] sm:text-[12px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              3D Educational Locus
            </span>
            <p className="text-[11px] sm:text-[12px] text-slate-500 mt-1 max-w-[200px] sm:max-w-[140px] truncate">
              {mapping?.educationalFocus}
            </p>
          </div>
        </div>

        {data.generalDescription && (
          <div className="mb-4 text-sm sm:text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60">
            {data.generalDescription}
          </div>
        )}

        {data.dhatuLakshana && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Classical Lakshana (Essential Definition)</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "{Array.isArray(data.dhatuLakshana)
                ? data.dhatuLakshana.map(l => typeof l === 'object' ? `${l.characteristic}${l.explanation ? `: ${l.explanation}` : ''}` : l).join(' • ')
                : (typeof data.dhatuLakshana === 'object' ? data.dhatuLakshana.characteristic || '' : data.dhatuLakshana)}"
            </p>
          </div>
        )}

        {data.functions && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Dhatu Karma (Functions & Physiological Roles)</span>
            </h4>
            {Array.isArray(data.functions) ? (
              <ul className="grid grid-cols-1 gap-1.5 text-sm text-slate-200">
                {data.functions.map((fn, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/30 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{typeof fn === 'object' ? fn.description || fn.name : fn}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-300 bg-slate-900/30 p-2 rounded-lg">
                {typeof data.functions === 'object'
                  ? data.functions.primaryFunction || JSON.stringify(data.functions)
                  : data.functions}
              </p>
            )}
          </div>
        )}

        {data.location && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Dhatu Sthana (Anatomical & Physiological Seats)</span>
            </h4>
            <p className="text-sm text-slate-300 bg-slate-900/30 p-2 rounded-lg">
              {Array.isArray(data.location)
                ? data.location.join(', ')
                : (typeof data.location === 'object'
                  ? data.location.primaryLocation || data.location.description || ''
                  : data.location)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5 text-sm">
          {data.upadhatus && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-sm uppercase font-bold text-cyan-400 block mb-1">
                Upadhatu (Secondary)
              </span>
              <p className="text-slate-200 font-medium">
                {Array.isArray(data.upadhatus)
                  ? data.upadhatus.map((u) => (typeof u === 'object' ? u.name : u)).join(', ')
                  : String(data.upadhatus)}
              </p>
            </div>
          )}

          {data.malas && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-sm uppercase font-bold text-amber-400 block mb-1">
                Mala (Metabolic Waste)
              </span>
              <p className="text-slate-200 font-medium">
                {Array.isArray(data.malas)
                  ? data.malas.map((m) => (typeof m === 'object' ? m.name : m)).join(', ')
                  : String(data.malas)}
              </p>
            </div>
          )}

          {data.srotas && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-sm uppercase font-bold text-purple-400 block mb-1">
                Srotas (Channel System)
              </span>
              <p className="text-slate-200 font-medium">
                {typeof data.srotas === 'object'
                  ? data.srotas.name || (Array.isArray(data.srotas.moolasthana) ? data.srotas.moolasthana.join(', ') : data.srotas.mula) || 'Associated Srotas'
                  : String(data.srotas)}
              </p>
            </div>
          )}
        </div>

        {data.westernCorrelation && (
          <div className="mb-5 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-sm">
            <span className="text-sm uppercase font-semibold text-slate-400 block mb-0.5">
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

      <div className="pt-4 border-t border-slate-700/60 mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link
            to={`/dhatus/${data.slug || selectedDhatu}`}
            className="px-2.5 sm:px-3 py-2.5 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20 min-h-[44px] touch-target"
          >
            <span>Full Details</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </Link>

          <Link
            to={`/dhatvagni?dhatuId=${data._id}`}
            className="px-2.5 sm:px-3 py-2.5 rounded-xl text-center text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/35 hover:border-amber-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1 shadow-sm min-h-[44px] touch-target"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Dhatvagni</span>
          </Link>

          <Link
            to={`/dhatuposhana?dhatuId=${data._id}`}
            className="px-2.5 sm:px-3 py-2.5 rounded-xl text-center text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/35 hover:border-cyan-500/60 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1 shadow-sm min-h-[44px] touch-target"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Poshana</span>
          </Link>

          <Link
            to={`/references?search=${encodeURIComponent(data.name)}`}
            className="px-2.5 sm:px-3 py-2.5 rounded-xl text-center text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-1 shadow-sm min-h-[44px] touch-target"
          >
            <BookMarked className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>References</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
