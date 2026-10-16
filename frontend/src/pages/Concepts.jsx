import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { conceptApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { BookOpen, ArrowRight, Filter } from 'lucide-react';

export default function Concepts() {
  const [concepts, setConcepts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConcepts = () => {
    setLoading(true);
    setError(null);
    const params = category ? { category } : {};
    conceptApi
      .getAll(params)
      .then((res) => {
        setConcepts(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching concepts:', err);
        setError(err.message || 'Failed to retrieve concepts.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConcepts();
  }, [category]);

  const categories = ['All', 'Dosha', 'Agni', 'Mala', 'Srotas', 'Vitality', 'Physiology'];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">
            मौलिक सिद्धान्त
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading">
          Fundamental Ayurvedic Concepts
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Master the core theoretical doctrines underpinning Dhatu physiology — from Tridosha and Agni to Srotamsi, Ojas, Ama, and Ahara Rasa. Sourced authentically from classical texts.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          {categories.map((cat) => {
            const isSelected = (cat === 'All' && !category) || category.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isSelected
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <LoadingState message="Loading Ayurvedic fundamental concepts..." />}
      {error && <ErrorState message={error} onRetry={fetchConcepts} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concepts.map((item, idx) => (
            <div
              key={item._id || idx}
              className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    {item.category || item.type || 'Doctrine'}
                  </span>
                  {item.importance && (
                    <span className="text-[10px] text-slate-500">Core Principle</span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-purple-300 transition mb-1">
                  {item.name}
                </h3>
                {item.sanskritName && (
                  <p className="text-xs font-classical text-amber-300/80 mb-3">
                    {typeof item.sanskritName === 'object'
                      ? `${item.sanskritName.devanagari || ''}${item.sanskritName.iast ? ` (${item.sanskritName.iast})` : ''}`
                      : item.sanskritName}
                  </p>
                )}

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {item.definition || item.description || 'Foundational Ayurvedic concept.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                  {item.relatedDhatus?.length ? `Linked to ${item.relatedDhatus.length} Dhatus` : 'Universal Concept'}
                </span>

                <Link
                  to={`/concepts/${item.slug || item._id}`}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/20 hover:border-purple-500/40 transition flex items-center gap-1"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
