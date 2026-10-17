import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchApi } from '../api/index.js';
import SearchBar from '../components/search/SearchBar.jsx';
import SearchResults from '../components/search/SearchResults.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { Search as SearchIcon, Sparkles, Filter } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || '';

  const [results, setResults] = useState([]);
  const [selectedType, setSelectedType] = useState(typeParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const executeSearch = (searchQuery, filterType) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    const params = {
      limit: 30,
      ...(filterType ? { type: filterType } : {}),
    };

    searchApi
      .search(searchQuery.trim(), params)
      .then((res) => {
        setResults(res.data || []);
        setTotalCount(res.pagination?.total || (res.data ? res.data.length : 0));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Search failed:', err);
        setError(err.message || 'Search execution failed.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (query) {
      executeSearch(query, selectedType);
    }
  }, [query, selectedType]);

  const handleSearchSubmit = (newQuery) => {
    setSearchParams(newQuery ? { q: newQuery, ...(selectedType ? { type: selectedType } : {}) } : {});
  };

  const types = [
    { label: 'All Results', value: '' },
    { label: 'Dhatus', value: 'dhatu' },
    { label: 'Dhatvagni', value: 'dhatvagni' },
    { label: 'Dhatuposhana', value: 'dhatuposhana' },
    { label: 'Nyayas', value: 'nyaya' },
    { label: 'Concepts', value: 'concept' },
    { label: 'Glossary', value: 'glossary' },
    { label: 'Quizzes', value: 'quiz' },
    { label: 'References', value: 'reference' },
  ];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
          <SearchIcon className="w-4 h-4 text-amber-400" />
          <span>Global Ayurvedic Search Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading mb-4">
          Search the Knowledge Platform
        </h1>

        <div className="mb-6">
          <SearchBar initialValue={query} onSearch={handleSearchSubmit} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {types.map((t) => {
            const isSelected = selectedType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => {
                  setSelectedType(t.value);
                  setSearchParams(query ? { q: query, ...(t.value ? { type: t.value } : {}) } : {});
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {!query && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center max-w-xl mx-auto">
          <span className="text-xs text-slate-400 block mb-3 font-medium">
            Suggested Search Queries:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              'Rasa',
              'Rakta',
              'Mamsa',
              'Meda',
              'Asthi',
              'Majja',
              'Shukra',
              'Dhatvagni',
              'Dhatuposhana',
              'Ksheera Dadhi',
              'Kedari Kulya',
              'Khale Kapota',
              'Ojas',
              'Srotas',
              'Agni',
            ].map((term) => (
              <button
                key={term}
                onClick={() => handleSearchSubmit(term)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <LoadingState message={`Searching knowledge base for "${query}"...`} />}
      {error && <ErrorState message={error} onRetry={() => executeSearch(query, selectedType)} />}

      {!loading && !error && query && results.length === 0 && (
        <EmptyState
          title="No Matching Ayurvedic Records"
          message={`No results found for "${query}". Please verify Sanskrit spelling or try a broader term like "Rasa" or "Agni".`}
        />
      )}

      {!loading && !error && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Found <strong className="text-amber-300">{results.length}</strong> matching records for "{query}"
            </span>
            {selectedType && (
              <span className="uppercase tracking-wider font-semibold text-slate-500">
                Filtered: {selectedType}
              </span>
            )}
          </div>

          <SearchResults results={results} />
        </div>
      )}
    </div>
  );
}
