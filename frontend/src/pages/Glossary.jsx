import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { glossaryApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { BookOpen, Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function Glossary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGlossary = () => {
    setLoading(true);
    setError(null);
    const params = {
      page,
      limit: 12,
      ...(searchTerm ? { search: searchTerm } : {}),
    };

    glossaryApi
      .getAll(params)
      .then((res) => {
        setTerms(res.data || []);
        setPagination(res.pagination || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching glossary:', err);
        setError(err.message || 'Failed to retrieve glossary terms.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGlossary();
  }, [page, searchTerm]);

  useEffect(() => {
    const s = searchParams.get('search') || '';
    if (s !== searchTerm) {
      setSearchTerm(s);
      setPage(1);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(searchTerm ? { search: searchTerm } : {});
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
            संस्कृत पारिभाषिक शब्दावली
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading">
          Sanskrit Ayurvedic Glossary
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Comprehensive dictionary of classical terminology, root derivations (Vyutpatti), transliterations, and physiological definitions.
        </p>

        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-md relative flex items-center">
          <input
            type="text"
            placeholder="Search Sanskrit term or English meaning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-900 text-sm text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
          >
            Search
          </button>
        </form>
      </div>

      {loading && <LoadingState message="Searching Sanskrit glossary records..." />}
      {error && <ErrorState message={error} onRetry={fetchGlossary} />}

      {!loading && !error && terms.length === 0 && (
        <EmptyState
          title="No Glossary Terms Found"
          message={`No terms matched your query "${searchTerm}". Try searching by transliteration or English keyword.`}
        />
      )}

      {/* Grid of Glossary Cards */}
      {!loading && !error && terms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terms.map((item, idx) => (
            <div
              key={item._id || idx}
              className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-100 font-heading">
                    {item.term || item.name}
                  </h3>
                  {(item.devanagari || item.sanskritName?.devanagari) && (
                    <span className="text-base font-classical text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {item.devanagari || item.sanskritName?.devanagari}
                    </span>
                  )}
                </div>

                {(item.transliteration || item.sanskritName?.iast) && (
                  <p className="text-xs font-mono text-cyan-300 mb-3">
                    [{item.transliteration || item.sanskritName?.iast}]
                  </p>
                )}

                {item.englishMeaning && (
                  <p className="text-xs font-semibold text-slate-200 mb-2">
                    {item.englishMeaning}
                  </p>
                )}

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                  {item.definition || item.simpleExplanation || item.description || 'Classical Sanskrit Ayurvedic term.'}
                </p>
              </div>

              {item.category && (
                <div className="pt-3 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="uppercase tracking-wider">{item.category}</span>
                  {item.relatedConcept && (
                    <span className="text-amber-400/80 truncate max-w-[120px]">
                      {item.relatedConcept}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400">
            Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-200">{pagination.totalPages}</span>
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
