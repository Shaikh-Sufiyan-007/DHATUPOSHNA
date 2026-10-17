import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { referenceApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';
import { ArrowLeft, Award, BookMarked, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ReferenceDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    referenceApi
      .getByIdOrSlug(id)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching reference detail:', err);
        setError(err.message || 'Reference could not be loaded.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading citation metadata..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Reference Not Found"
          message={error || 'Could not locate the requested citation.'}
          onRetry={() => window.location.reload()}
        />
        <div className="text-center mt-6">
          <Link to="/references" className="text-xs text-amber-400 hover:underline">
            ← Return to all references
          </Link>
        </div>
      </div>
    );
  }

  const isClassical = data.sourceType === 'classical_text';
  const classical = data.classicalDetails || {};
  const academic = data.academicDetails || {};

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link
          to="/references"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All References</span>
        </Link>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            {data.sourceType?.replace(/_/g, ' ') || 'Citation Record'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-heading mb-4">
          {data.title}
        </h1>

        {data.content?.shloka && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-100 mb-6 font-classical text-base leading-relaxed text-center">
            "{data.content.shloka}"
          </div>
        )}

        {data.content?.englishTranslation && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              English Translation & Synthesis
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {data.content.englishTranslation}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {isClassical ? (
            <>
              {classical.samhita && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 block mb-0.5">Samhita:</span>
                  <span className="font-semibold text-slate-200">{classical.samhita}</span>
                </div>
              )}
              {classical.sthana && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 block mb-0.5">Sthana (Section):</span>
                  <span className="font-semibold text-slate-200">{classical.sthana}</span>
                </div>
              )}
              {classical.adhyayaNumber && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 block mb-0.5">Adhyaya (Chapter):</span>
                  <span className="font-semibold text-slate-200">{classical.adhyayaNumber} {classical.adhyayaName ? `(${classical.adhyayaName})` : ''}</span>
                </div>
              )}
              {classical.shlokaNumber && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 block mb-0.5">Shloka (Verse):</span>
                  <span className="font-semibold text-slate-200">{classical.shlokaNumber}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {academic.authors && academic.authors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 block mb-0.5">Authors:</span>
                  <span className="font-semibold text-slate-200">{academic.authors.join(', ')}</span>
                </div>
              )}
              {academic.publisher && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 block mb-0.5">Publisher / Organization:</span>
                  <span className="font-semibold text-slate-200">{academic.publisher}</span>
                </div>
              )}
              {academic.publicationYear && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 block mb-0.5">Year:</span>
                  <span className="font-semibold text-slate-200">{academic.publicationYear}</span>
                </div>
              )}
              {academic.doi && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="text-slate-500 block mb-0.5">DOI:</span>
                  <span className="font-semibold font-mono text-cyan-300">{academic.doi}</span>
                </div>
              )}
            </>
          )}
        </div>

        {data.url && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Direct Online Repository:</span>
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition inline-flex items-center gap-1.5 shadow"
            >
              <span>Visit External Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
}
