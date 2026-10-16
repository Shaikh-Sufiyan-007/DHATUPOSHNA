import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { conceptApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';
import { ArrowLeft, BookOpen, BookMarked } from 'lucide-react';

export default function ConceptDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    conceptApi
      .getByIdOrSlug(id)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching concept detail:', err);
        setError(err.message || 'Concept record could not be loaded.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading Ayurvedic concept..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Concept Not Found"
          message={error || 'Could not locate the requested concept.'}
          onRetry={() => window.location.reload()}
        />
        <div className="text-center mt-6">
          <Link to="/concepts" className="text-xs text-amber-400 hover:underline">
            ← Return to all concepts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link
          to="/concepts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Concepts</span>
        </Link>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
            {data.category || 'Ayurvedic Doctrine'}
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

        {(data.definition || data.description) && (
          <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            {data.definition || data.description}
          </p>
        )}

        {(data.learnerSummary?.simplifiedExplanation || data.modernPhysiologicalPerspective || data.details) && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
              Philosophical & Physiological Dimensions
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.learnerSummary?.simplifiedExplanation ||
                data.modernPhysiologicalPerspective ||
                (typeof data.details === 'object' ? JSON.stringify(data.details) : data.details)}
            </p>
          </div>
        )}

        {(data.relationshipToDhatus || data.dhatuRelevance) && (
          <div className="mb-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
              Significance to Sapta Dhatu Nourishment
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.relationshipToDhatus || data.dhatuRelevance}
            </p>
          </div>
        )}

        {((data.classicalReferences && data.classicalReferences.length > 0) ||
          (data.references && data.references.length > 0)) && (
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-amber-400" />
                <span>Classical References</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                {(data.classicalReferences || data.references).map((ref, i) => {
                  const refObj = ref.reference || ref;
                  return (
                    <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="font-semibold text-amber-300">
                        {refObj.classicalDetails?.samhita || refObj.title || ref.text || ref.source || 'Classical Source'}
                      </span>
                      {(refObj.classicalDetails?.shlokaNumber || ref.specificVerse || ref.chapter) && (
                        <span className="ml-2 text-slate-500 font-mono">
                          {refObj.classicalDetails?.shlokaNumber || ref.specificVerse || (ref.chapter ? `Ch. ${ref.chapter}` : '')}
                        </span>
                      )}
                      {(refObj.content?.originalSanskrit || ref.excerpt || ref.shloka) && (
                        <p className="italic my-1 text-slate-200">"{refObj.content?.originalSanskrit || ref.excerpt || ref.shloka}"</p>
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
