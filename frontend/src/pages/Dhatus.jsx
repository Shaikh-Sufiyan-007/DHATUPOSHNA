import React, { useState, useEffect } from 'react';
import { dhatuApi, revisionApi } from '../api/index.js';
import DhatuCard from '../components/dhatu/DhatuCard.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { Layers, Sparkles, Table2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dhatus() {
  const [dhatus, setDhatus] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const fetchDhatus = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      dhatuApi.getAll(),
      revisionApi.getDhatuComparison().catch(() => null),
    ])
      .then(([dhatuRes, compRes]) => {
        setDhatus(dhatuRes.data || []);
        if (compRes?.data) {
          setComparison(compRes.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Dhatus:', err);
        setError(err.message || 'Failed to retrieve Dhatus from server.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDhatus();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 animate-spatial-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 spatial-dock p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-700/60 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs uppercase tracking-wider font-semibold font-mono text-amber-300">
              सप्त धातु विज्ञान • Spatial Anatomy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 font-heading">
            The Sapta Dhatus (Seven Bodily Tissues)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            In Ayurvedic physiology, the physical body is sustained by seven fundamental structural tissues formed in a sequential metabolic continuum (Dhatu Parinama).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 min-h-[44px] touch-target ${showComparison
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
              }`}
          >
            <Table2 className="w-4 h-4 text-amber-400" />
            <span>{showComparison ? 'Hide Matrix' : 'Comparative Matrix'}</span>
          </button>

          <Link
            to="/explore"
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:opacity-95 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[44px] touch-target"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>3D Viewport</span>
          </Link>
        </div>
      </div>

      {loading && <LoadingState message="Loading Sapta Dhatus catalog..." />}
      {error && <ErrorState message={error} onRetry={fetchDhatus} />}

      {showComparison && comparison && (
        <div className="spatial-dock p-4 sm:p-6 rounded-3xl border border-amber-500/30 overflow-x-auto shadow-2xl animate-spatial-in">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading flex items-center gap-2">
              <Table2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Sapta Dhatu Comparative Matrix</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400 md:hidden">
              Swipe horizontally to view full matrix →
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/70 text-slate-300">
                <th className="p-3 sm:p-3.5 font-bold uppercase tracking-wider text-[11px]">Order</th>
                <th className="p-3 sm:p-3.5 font-bold uppercase tracking-wider text-[11px]">Dhatu Name</th>
                <th className="p-3 sm:p-3.5 font-bold uppercase tracking-wider text-[11px]">Sanskrit</th>
                <th className="p-3 sm:p-3.5 font-bold uppercase tracking-wider text-[11px]">Primary Function (Karma)</th>
                <th className="p-3 sm:p-3.5 font-bold uppercase tracking-wider text-[11px]">Upadhatu</th>
                <th className="p-3 sm:p-3.5 font-bold uppercase tracking-wider text-[11px]">Mala</th>
                <th className="p-3 sm:p-3.5 font-bold uppercase tracking-wider text-[11px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {(comparison.matrix || dhatus).map((row, i) => (
                <tr key={row._id || i} className="hover:bg-slate-800/50 transition duration-150">
                  <td className="p-3 sm:p-3.5 font-mono font-extrabold text-amber-400">#{row.order || i + 1}</td>
                  <td className="p-3 sm:p-3.5 font-bold text-slate-100 whitespace-nowrap">{row.name}</td>
                  <td className="p-3 sm:p-3.5 font-classical text-amber-300 whitespace-nowrap">
                    {typeof row.sanskritName === 'object'
                      ? row.sanskritName?.devanagari || row.sanskritName?.iast || '-'
                      : (row.sanskritName || '-')}
                  </td>
                  <td className="p-3 sm:p-3.5 max-w-xs">{row.primaryFunction || row.functions?.[0]?.meaning || row.functions?.[0]?.description || '-'}</td>
                  <td className="p-3 sm:p-3.5 text-cyan-300 font-medium">{Array.isArray(row.upadhatus) ? row.upadhatus.map(u => typeof u === 'object' ? u.name : u).join(', ') : row.upadhatu || '-'}</td>
                  <td className="p-3 sm:p-3.5 text-amber-300/80 font-medium">{Array.isArray(row.malas) ? row.malas.map(m => typeof m === 'object' ? m.name : m).join(', ') : row.mala || '-'}</td>
                  <td className="p-3 sm:p-3.5 whitespace-nowrap">
                    <Link
                      to={`/dhatus/${row.slug || row._id}`}
                      className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 hover:underline min-h-[32px] py-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {dhatus.map((dhatu) => (
            <DhatuCard key={dhatu._id} dhatu={dhatu} />
          ))}
        </div>
      )}
    </div>
  );
}
