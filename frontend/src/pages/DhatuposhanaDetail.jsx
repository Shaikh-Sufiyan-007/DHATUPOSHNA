import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dhatuposhanaApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';
import SamhitaReferences from '../components/common/SamhitaReferences.jsx';
import {
  ArrowLeft,
  GitBranch,
  Sparkles,
  Activity,
  Layers,
  CheckCircle2,
  BookOpen,
  Award,
} from 'lucide-react';

export default function DhatuposhanaDetail() {
  const params = useParams();
  const id = params.id || params.slug || params.idOrSlug;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryIndex, setRetryIndex] = useState(0);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryIndex((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setError('No Dhatuposhana identifier was specified.');
        setLoading(false);
      });
      return () => {
        isMounted = false;
      };
    }

    dhatuposhanaApi
      .getByIdOrSlug(id)
      .then((res) => {
        if (!isMounted) return;
        const record = res?.data?.dhatuposhana || res?.data || res;
        if (record && typeof record === 'object' && (record._id || record.name || record.dhatu)) {
          setData(record);
        } else {
          setData(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching Dhatuposhana detail:', err);
        setError(err.message || 'Dhatuposhana record could not be loaded.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, retryIndex]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading Dhatuposhana nourishment mechanics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Dhatuposhana Record Not Found"
          message={error || 'Could not locate the requested nourishment record.'}
          onRetry={handleRetry}
        />
        <div className="text-center mt-6">
          <Link
            to="/dhatuposhana"
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-semibold font-heading"
          >
            ← Return to all Dhatuposhana pathways
          </Link>
        </div>
      </div>
    );
  }

  const targetDhatuSlug =
    data.dhatu?.slug ||
    data.dhatu?.name?.toLowerCase() ||
    data.dhatuSlug ||
    '';

  const sanskritText =
    typeof data.sanskritName === 'object' && data.sanskritName !== null
      ? `${data.sanskritName.devanagari || ''}${data.sanskritName.iast ? ` (${data.sanskritName.iast})` : ''
      }`
      : typeof data.sanskritName === 'string'
        ? data.sanskritName
        : data.dhatu?.sanskritName?.devanagari || '';

  const precursorText =
    (typeof data.precursorSubstance === 'string'
      ? data.precursorSubstance
      : data.precursorSubstance?.name) ||
    data.previousDhatu?.name ||
    (typeof data.precursorDhatu === 'object' && data.precursorDhatu !== null
      ? data.precursorDhatu.name
      : typeof data.precursorDhatu === 'string'
        ? data.precursorDhatu
        : 'Nutrient Essence (Ahara Rasa)');

  const referencesList =
    data.sourceAcademicLayer?.classicalReferences ||
    data.classicalReferences ||
    data.references ||
    [];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-spatial-in font-body">
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 spatial-dock p-3 sm:p-4 rounded-2xl border border-slate-700/60 shadow-lg font-heading">
        <Link
          to="/dhatuposhana"
          className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer min-h-[44px] touch-target active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>All Nourishment Pathways</span>
        </Link>

        {targetDhatuSlug && (
          <div className="flex flex-wrap items-center justify-center xs:justify-end gap-2">
            <Link
              to={`/explore?dhatu=${targetDhatuSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 transition cursor-pointer min-h-[44px] touch-target active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Body Anatomy</span>
            </Link>
            <Link
              to={`/dhatus/${targetDhatuSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer min-h-[44px] touch-target active:scale-95"
            >
              <Layers className="w-3.5 h-3.5 text-ice" />
              <span>{data.dhatu?.name || 'Dhatu'} Overview</span>
            </Link>
          </div>
        )}
      </div>

      <div className="spatial-dock p-4 sm:p-6 lg:p-10 rounded-3xl border border-slate-700/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3 font-heading">
          <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dhatuposhana Pathway</span>
          </span>
          {data.theoryCategory && (
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-ice-soft text-xs font-semibold uppercase tracking-wider">
              {data.theoryCategory}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading mb-2">
          {data.name || (data.dhatu?.name ? `${data.dhatu.name} Nourishment` : 'Dhatuposhana Mechanism')}
        </h1>

        {sanskritText && (
          <p className="text-base sm:text-lg font-heading text-ice-soft mb-6">
            {sanskritText}
          </p>
        )}

        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8 font-body">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-heading">
            Comprehensive Physiological Synthesis
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
            {data.description ||
              data.userFriendlyLayer?.summary ||
              data.sourceAcademicLayer?.scholarlyExplanation ||
              'Sequential tissue nourishment proceeds as nutrient essence circulates and transforms under the influence of tissue-specific Dhatvagni.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 font-heading">
              Nutritive Precursor
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-100 font-heading">
              {precursorText}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Source substrate circulating via Srotamsi
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ice block mb-1 font-heading">
              Governing Transformation
            </span>
            <p className="text-sm sm:text-base font-bold text-ice-soft font-heading">
              {data.transformingAgni?.name || (targetDhatuSlug ? `${targetDhatuSlug} Dhatvagni` : 'Dhatvagni')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Performs Sara-Kitta Vibhajana (metabolic division)
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1 font-heading">
              Target Substrate Formed
            </span>
            <p className="text-sm sm:text-base font-bold text-cyan-300 font-heading">
              {data.resultingTissue || data.dhatu?.name || 'Poshya Dhatu'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Assimilated into mature bodily tissue
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-body">
          <div className="glass-panel p-6 rounded-2xl border border-ice/20">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ice-soft mb-3 flex items-center gap-2 font-heading">
              <Activity className="w-4 h-4 text-ice" />
              <span>Classical Analogy & Nyaya Application</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
              <p className="italic text-slate-200">
                "{data.classicalAnalogy?.metaphor ||
                  data.classicalAnalogy?.analogy ||
                  data.classicalAnalogy ||
                  'Sequential nourishment analogous to classical metabolic paradigms (Ksheera-Dadhi, Kedari-Kulya, or Khale-Kapota).'}"
              </p>
              {data.classicalAnalogy?.explanation && (
                <p className="text-slate-400 pt-2 border-t border-slate-800">
                  {data.classicalAnalogy.explanation}
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-2 font-heading">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Biological Explanation & Circulation</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                {data.userFriendlyLayer?.simplifiedExplanation ||
                  data.sourceAcademicLayer?.scholarlyExplanation ||
                  'The absorbed nutrients are channeled into the respective micro-channels (Srotamsi), where selective cellular assimilation occurs.'}
              </p>
            </div>
          </div>
        </div>

        {data.userFriendlyLayer?.keyTakeaways && data.userFriendlyLayer.keyTakeaways.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 font-body">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2 font-heading">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Key Physiological Takeaways</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.userFriendlyLayer.keyTakeaways.map((takeaway, idx) => (
                <div
                  key={takeaway?.id || takeaway?._id || `takeaway-${idx}`}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-heading text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>
                    {typeof takeaway === 'object' && takeaway !== null
                      ? takeaway.text || takeaway.point || takeaway.description || JSON.stringify(takeaway)
                      : String(takeaway || '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.scholarlyInterpretations && data.scholarlyInterpretations.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 font-body">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2 font-heading">
              <BookOpen className="w-4 h-4 text-ice" />
              <span>Scholarly Acharya Interpretations & Kinetics</span>
            </h2>
            <div className="space-y-3">
              {data.scholarlyInterpretations.map((interp, idx) => {
                if (!interp) return null;
                return (
                  <div
                    key={interp._id || interp.id || `interp-${idx}`}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 font-heading">
                      <span className="font-bold text-ice-soft text-sm">
                        {interp.authorOrSchool || 'Classical Acharya'}
                      </span>
                      {interp.timeframeOrDuration && (
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-heading font-medium text-[11px]">
                          Timeline: {interp.timeframeOrDuration}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {interp.interpretation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data.modernPhysiologicalParallel && (
          <div className="mb-8 p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/20 font-body">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-2 font-heading">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Modern Physiological Parallel</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.modernPhysiologicalParallel}
            </p>
          </div>
        )}

        <div className="mt-8">
          <SamhitaReferences
            references={referencesList}
            title="Classical Samhita Citations & Authoritative References"
          />
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
