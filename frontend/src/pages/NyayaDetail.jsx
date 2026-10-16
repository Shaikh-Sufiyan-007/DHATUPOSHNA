import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { nyayaApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';
import { ArrowLeft, Activity, BookMarked, Layers, CheckCircle2 } from 'lucide-react';

export default function NyayaDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    nyayaApi
      .getByIdOrSlug(id)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Nyaya detail:', err);
        setError(err.message || 'Nyaya record could not be loaded.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading Classical Nyaya theory..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Nyaya Record Not Found"
          message={error || 'Could not find the requested Nyaya record.'}
          onRetry={() => window.location.reload()}
        />
        <div className="text-center mt-6">
          <Link to="/nyayas" className="text-xs text-amber-400 hover:underline">
            ← Return to the Three Nyayas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link
          to="/nyayas"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Three Nyayas</span>
        </Link>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            Dhatuposhana Classical Analogy
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading mb-1">
          {data.name}
        </h1>
        {data.sanskritName && (
          <p className="text-xl font-classical text-amber-300 mb-4">
            {typeof data.sanskritName === 'object'
              ? `${data.sanskritName.devanagari || ''}${data.sanskritName.iast ? ` (${data.sanskritName.iast})` : ''}`
              : data.sanskritName}
          </p>
        )}

        {(data.literalMeaning || data.meaning) && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200 mb-6">
            <span className="font-bold text-xs uppercase block text-emerald-400 mb-1">
              Literal Analogy & Meaning:
            </span>
            <p>{data.literalMeaning || data.meaning}</p>
          </div>
        )}

        {(data.physiologicalMechanism || data.analogy?.classicalDescription || data.explanation) && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Philosophical & Physiological Explanation
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              {data.physiologicalMechanism || data.analogy?.classicalDescription || data.explanation}
            </p>
          </div>
        )}

        {(data.scopeAndApplicability || data.dhatuRelationship) && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
              Relationship with Dhatu Nourishment
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.scopeAndApplicability || data.dhatuRelationship}
            </p>
          </div>
        )}

        {(data.learnerSummary?.simplifiedExplanation || data.analogy?.modernAnalogy || data.simplifiedExplanation) && (
          <div className="mb-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
              Simplified & Modern Biological Parallels
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.learnerSummary?.simplifiedExplanation || data.analogy?.modernAnalogy || data.simplifiedExplanation}
            </p>
          </div>
        )}

        {((data.classicalReferences && data.classicalReferences.length > 0) ||
          (data.references && data.references.length > 0)) && (
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-amber-400" />
                <span>Classical Citations</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                {(data.classicalReferences || data.references).map((ref, i) => {
                  const refObj = ref.reference || ref;
                  return (
                    <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="font-semibold text-amber-300">
                        {refObj.classicalDetails?.samhita || refObj.title || ref.text || ref.samhita || ref.source || 'Classical Citation'}
                      </span>
                      {(refObj.classicalDetails?.shlokaNumber || ref.chapter || ref.verse) && (
                        <span className="ml-2 text-slate-500 font-mono">
                          {refObj.classicalDetails?.shlokaNumber || (ref.chapter ? `Ch. ${ref.chapter}` : '')} {ref.verse ? `v. ${ref.verse}` : ''}
                        </span>
                      )}
                      {(refObj.content?.originalSanskrit || ref.shloka) && (
                        <p className="italic my-1 text-slate-200">"{refObj.content?.originalSanskrit || ref.shloka}"</p>
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
