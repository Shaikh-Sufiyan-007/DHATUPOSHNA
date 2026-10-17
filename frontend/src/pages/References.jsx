import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { referenceApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { Award, BookMarked, Search, ExternalLink, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function References() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [references, setReferences] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReferences = () => {
    setLoading(true);
    setError(null);
    const params = {
      page,
      limit: 12,
      ...(search ? { search } : {}),
      ...(typeFilter ? { sourceType: typeFilter } : {}),
    };

    referenceApi
      .getAll(params)
      .then((res) => {
        setReferences(res.data || []);
        setPagination(res.pagination || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching references:', err);
        setError(err.message || 'Failed to retrieve references.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReferences();
  }, [page, search, typeFilter]);

  useEffect(() => {
    const s = searchParams.get('search') || '';
    if (s !== search) {
      setSearch(s);
      setPage(1);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(search ? { search } : {});
  };

  const types = ['All', 'classical_text', 'peer_reviewed_journal', 'institutional_publication'];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
            आर्ष प्रमाण एवं सन्दर्भ
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading">
          Classical Citations & Academic References
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          The verified epistemological foundation of the DHATUPOSHANA platform — including Brihat Trayi Samhitas, medieval commentaries, institutional monographs, and peer-reviewed journals.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by Samhita, author, title, verse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-900 text-sm text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {types.map((t) => {
              const isSelected = (t === 'All' && !typeFilter) || typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t === 'All' ? '' : t);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading && <LoadingState message="Loading verified reference citations..." />}
      {error && <ErrorState message={error} onRetry={fetchReferences} />}

      {!loading && !error && references.length === 0 && (
        <EmptyState
          title="No References Found"
          message={`No citations matched your query "${search}".`}
        />
      )}

      {!loading && !error && references.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {references.map((item, idx) => {
            const isClassical = item.sourceType === 'classical_text';
            const classical = item.classicalDetails || {};
            const academic = item.academicDetails || {};

            return (
              <div
                key={item._id || idx}
                className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 uppercase tracking-wider">
                      {item.sourceType?.replace(/_/g, ' ') || 'Citation'}
                    </span>
                    {academic.publicationYear && (
                      <span className="text-xs font-mono text-slate-400">
                        {academic.publicationYear}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition mb-2">
                    {item.title}
                  </h3>

                  {isClassical && (
                    <div className="space-y-1 text-xs text-slate-300 mb-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      {classical.samhita && (
                        <div className="font-semibold text-amber-300">
                          {classical.samhita} • {classical.sthana || ''}
                        </div>
                      )}
                      {(classical.adhyayaNumber || classical.shlokaNumber) && (
                        <div className="text-slate-400 font-mono text-[11px]">
                          {classical.adhyayaNumber ? `Adhyaya: ${classical.adhyayaNumber}` : ''}{' '}
                          {classical.shlokaNumber ? `Shloka: ${classical.shlokaNumber}` : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {!isClassical && academic.authors && academic.authors.length > 0 && (
                    <p className="text-xs text-slate-400 mb-3">
                      <span className="font-medium text-slate-300">Authors:</span> {academic.authors.join(', ')}
                    </p>
                  )}

                  {item.content?.englishTranslation && (
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4 italic">
                      "{item.content.englishTranslation}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                    >
                      <span>Direct Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500">Verified Citation</span>
                  )}

                  <Link
                    to={`/references/${item.slug || item._id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition"
                  >
                    View Citation
                  </Link>
                </div>
              </div>
            );
          })}
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
