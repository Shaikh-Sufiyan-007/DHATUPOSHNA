import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { HelpCircle, Award, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const [sessionScore, setSessionScore] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ayur_quiz_score');
      return saved ? JSON.parse(saved) : { correct: 0, total: 0 };
    } catch {
      return { correct: 0, total: 0 };
    }
  });

  const fetchQuizzes = () => {
    setLoading(true);
    setError(null);
    const params = categoryFilter ? { category: categoryFilter } : {};
    quizApi
      .getAll(params)
      .then((res) => {
        setQuizzes(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching quizzes:', err);
        setError(err.message || 'Failed to load quizzes.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuizzes();
  }, [categoryFilter]);

  const categories = ['All', 'Tridosha & Dhatus', 'Dhatu Physiology', 'Dhatvagni & Metabolism', 'Three Nyayas'];

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'intermediate':
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'advanced':
      case 'hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 space-y-8 animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-pink-400" />
            <span className="text-xs uppercase tracking-wider font-semibold text-pink-300">
              ज्ञान परीक्षा
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading">
            Ayurvedic Knowledge Evaluation Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Test and reinforce your comprehension of Sapta Dhatus, Dhatvagni metabolic states, Srotas physiology, and the Three Nyayas through verified multiple-choice questions.
          </p>
        </div>

        <div className="glass-panel-elevated p-4 sm:p-5 rounded-2xl border border-amber-500/30 min-w-[200px] text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-semibold mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Session Score</span>
          </div>
          <div className="text-3xl font-bold font-mono text-slate-100">
            {sessionScore.correct} / {sessionScore.total}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {sessionScore.total > 0
              ? `${Math.round((sessionScore.correct / sessionScore.total) * 100)}% Accuracy`
              : 'Take a quiz to begin'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isSelected = (cat === 'All' && !categoryFilter) || categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isSelected
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading && <LoadingState message="Loading interactive quizzes from database..." />}
      {error && <ErrorState message={error} onRetry={fetchQuizzes} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((item, idx) => (
            <div
              key={item._id || idx}
              className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getDifficultyBadge(
                      item.difficulty
                    )}`}
                  >
                    {item.difficulty || 'Standard'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.category || 'Dhatu Physiology'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition leading-snug mb-3">
                  {item.question}
                </h3>

                <p className="text-xs text-slate-500 mb-4">
                  {item.options?.length || 4} Multiple Choice Options • Verified Classical Explanation
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {item.relatedDhatu ? `Relates to ${item.relatedDhatu}` : 'Core Concept'}
                </span>

                <Link
                  to={`/quizzes/${item.slug || item._id}`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition flex items-center gap-1.5"
                >
                  <span>Answer Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
