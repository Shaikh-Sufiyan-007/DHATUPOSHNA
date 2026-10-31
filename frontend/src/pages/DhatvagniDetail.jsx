import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dhatvagniApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';
import { ArrowLeft, Flame, Activity, Layers, BookMarked } from 'lucide-react';

export default function DhatvagniDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    dhatvagniApi
      .getByIdOrSlug(id)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Dhatvagni detail:', err);
        setError(err.message || 'Dhatvagni record could not be loaded.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading Dhatvagni metabolic details..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Dhatvagni Record Not Found"
          message={error || 'Could not locate the requested Dhatvagni record.'}
          onRetry={() => window.location.reload()}
        />
        <div className="text-center mt-6">
          <Link to="/dhatvagni" className="text-xs text-ice hover:underline font-heading">
            ← Return to all Dhatvagnis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-spatial-in">
      <div className="flex items-center justify-between font-heading">
        <Link
          to="/dhatvagni"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-ice-soft transition min-h-[44px] touch-target py-2.5 px-2 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-ice shrink-0" />
          <span>All Dhatvagnis</span>
        </Link>
      </div>

      <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-2 font-heading">
          <Flame className="w-5 h-5 text-ice shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-ice">
            Metabolic Transformation Bio-Fire
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 font-heading mb-1">
          {data.name}
        </h1>
        {data.sanskritName && (
          <p className="text-base sm:text-lg font-heading text-ice-soft mb-4">
            {typeof data.sanskritName === 'object'
              ? `${data.sanskritName.devanagari || ''}${data.sanskritName.iast ? ` (${data.sanskritName.iast})` : ''}`
              : data.sanskritName}
          </p>
        )}

        {(data.userFriendlyLayer?.summary || data.sourceAcademicLayer?.scholarlyExplanation || data.description) && (
          <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-900/40 p-4 rounded-xl border border-slate-800 font-body">
            {data.userFriendlyLayer?.summary || data.sourceAcademicLayer?.scholarlyExplanation || data.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {(data.userFriendlyLayer?.simplifiedExplanation || data.metabolicRole) && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ice-soft mb-2 flex items-center gap-1.5 font-heading">
                <Activity className="w-4 h-4 text-ice" />
                <span>Metabolic Role & Synthesis</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                {data.userFriendlyLayer?.simplifiedExplanation ||
                  (typeof data.metabolicRole === 'object' ? JSON.stringify(data.metabolicRole) : data.metabolicRole)}
              </p>
            </div>
          )}

          {(data.metabolicFractions || data.divisionMechanisms) && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5 font-heading">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Sara-Kitta Vibhajana (Metabolic Fractions)</span>
              </h3>
              {data.metabolicFractions ? (
                <div className="space-y-2 text-xs sm:text-sm text-slate-300 font-body">
                  {data.metabolicFractions.prasadaBhaga && (
                    <div>
                      <span className="text-cyan-400 font-semibold block text-[11px] uppercase font-heading">Prasada Bhaga (Nutrient Essence):</span>
                      <p className="text-slate-200">{data.metabolicFractions.prasadaBhaga.nourishesSelf}</p>
                      {data.metabolicFractions.prasadaBhaga.seedsNextDhatu && (
                        <p className="text-slate-400 text-xs mt-0.5">{data.metabolicFractions.prasadaBhaga.seedsNextDhatu}</p>
                      )}
                      {data.metabolicFractions.prasadaBhaga.upadhatusFormed?.length > 0 && (
                        <p className="text-cyan-300 text-xs mt-0.5">
                          Upadhatus: {data.metabolicFractions.prasadaBhaga.upadhatusFormed.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                  {data.metabolicFractions.kittaBhaga && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-ice font-semibold block text-[11px] uppercase font-heading">Kitta Bhaga (Byproduct):</span>
                      <p className="text-slate-200">{data.metabolicFractions.kittaBhaga.wasteProduced}</p>
                      {data.metabolicFractions.kittaBhaga.description && (
                        <p className="text-slate-400 text-xs mt-0.5">{data.metabolicFractions.kittaBhaga.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                  {typeof data.divisionMechanisms === 'object'
                    ? JSON.stringify(data.divisionMechanisms)
                    : data.divisionMechanisms}
                </p>
              )}
            </div>
          )}
        </div>

        {(data.clinicalRelevance || data.clinicalStates) && (
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 mb-6 font-body">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-300 mb-2 font-heading">
              Clinical Variations (Mandagni & Tikshnagni States)
            </h3>
            {data.clinicalRelevance ? (
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                {data.clinicalRelevance.mandagniEffects && (
                  <p><span className="text-rose-400 font-semibold font-heading">Mandagni (Hypo-functioning): </span>{data.clinicalRelevance.mandagniEffects}</p>
                )}
                {data.clinicalRelevance.tikshnagniEffects && (
                  <p><span className="text-ice font-semibold font-heading">Tikshnagni (Hyper-functioning): </span>{data.clinicalRelevance.tikshnagniEffects}</p>
                )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {typeof data.clinicalStates === 'object'
                  ? JSON.stringify(data.clinicalStates)
                  : data.clinicalStates}
              </p>
            )}
          </div>
        )}

        {((data.sourceAcademicLayer?.classicalReferences && data.sourceAcademicLayer.classicalReferences.length > 0) ||
          (data.classicalReferences && data.classicalReferences.length > 0)) && (
            <div className="pt-4 border-t border-slate-800 font-body">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-heading">
                <BookMarked className="w-4 h-4 text-ice" />
                <span>Classical Citations</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                {(data.sourceAcademicLayer?.classicalReferences || data.classicalReferences).map((ref, i) => {
                  const refObj = ref.reference || ref;
                  return (
                    <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="font-semibold text-ice-soft font-heading">
                        {refObj.classicalDetails?.samhita || refObj.title || ref.context || 'Classical Source'}
                      </span>
                      {(refObj.classicalDetails?.shlokaNumber || ref.specificVerse) && (
                        <span className="ml-2 text-slate-500 font-heading">
                          {refObj.classicalDetails?.shlokaNumber || ref.specificVerse}
                        </span>
                      )}
                      {(refObj.content?.originalSanskrit || ref.excerpt) && (
                        <p className="italic my-1 text-slate-200">"{refObj.content?.originalSanskrit || ref.excerpt}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      <DisclaimerBanner />
    </div>
  );
}