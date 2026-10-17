import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';
import {
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  BookMarked,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export default function QuizDetail() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setSubmitted(false);

    quizApi
      .getByIdOrSlug(id)
      .then((res) => {
        setQuiz(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading quiz detail:', err);
        setError(err.message || 'Quiz could not be retrieved.');
        setLoading(false);
      });
  }, [id]);

  const handleSubmitAnswer = () => {
    if (!selectedOption || submitted) return;
    setSubmitted(true);

    const isCorrect = selectedOption === quiz.correctOptionId;

    try {
      const saved = sessionStorage.getItem('ayur_quiz_score');
      const current = saved ? JSON.parse(saved) : { correct: 0, total: 0 };
      const updated = {
        correct: current.correct + (isCorrect ? 1 : 0),
        total: current.total + 1,
      };
      sessionStorage.setItem('ayur_quiz_score', JSON.stringify(updated));
    } catch (e) {
      console.log('Session storage error:', e);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading Ayurvedic quiz question..." />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Quiz Question Not Found"
          message={error || 'Could not locate the requested quiz.'}
          onRetry={() => window.location.reload()}
        />
        <div className="text-center mt-6">
          <Link to="/quizzes" className="text-xs text-amber-400 hover:underline">
            ← Return to all quizzes
          </Link>
        </div>
      </div>
    );
  }

  const isCorrect = submitted && selectedOption === quiz.correctOptionId;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/quizzes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Quizzes</span>
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {quiz.category || 'Dhatu Epistemology'}
        </span>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-pink-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-400">
            Knowledge Check • {quiz.difficulty || 'Standard'}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading leading-relaxed mb-6">
          {quiz.question}
        </h1>

        <div className="space-y-3 mb-6">
          {quiz.options?.map((opt) => {
            const optId = opt.optionId || opt.id || opt._id;
            const isSelected = selectedOption === optId;
            const isThisCorrect = optId === quiz.correctOptionId;

            let optionStyle = 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-200';

            if (submitted) {
              if (isThisCorrect) {
                optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-200';
              } else if (isSelected && !isThisCorrect) {
                optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-200';
              } else {
                optionStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
              }
            } else if (isSelected) {
              optionStyle = 'bg-amber-500/15 border-amber-500/80 text-amber-200 shadow-lg';
            }

            return (
              <button
                key={optId}
                disabled={submitted}
                onClick={() => setSelectedOption(optId)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 ${optionStyle}`}
              >
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 ${submitted && isThisCorrect
                    ? 'bg-emerald-500 text-slate-950'
                    : submitted && isSelected && !isThisCorrect
                      ? 'bg-rose-500 text-slate-950'
                      : isSelected
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                >
                  {optId}
                </span>

                <span className="text-xs sm:text-sm leading-relaxed flex-1">
                  {opt.text}
                </span>

                {submitted && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {submitted && isSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOption}
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-amber-500/10"
          >
            Submit Answer
          </button>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 ${isCorrect
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-200'
                }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Correct Answer!</h4>
                    <p className="text-xs text-emerald-300/80">Excellent comprehension of Ayurvedic principles.</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Incorrect</h4>
                    <p className="text-xs text-rose-300/80">
                      Option <span className="font-bold font-mono text-emerald-300">{quiz.correctOptionId}</span> is the classically verified answer.
                    </p>
                  </div>
                </>
              )}
            </div>

            {quiz.explanation && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="font-bold text-xs uppercase block text-amber-300 mb-1">
                  Classical Explanation:
                </span>
                <p>{quiz.explanation}</p>
              </div>
            )}

            {quiz.classicalReference && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                <BookMarked className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">
                    Source Citation:{' '}
                  </span>
                  <span>
                    {quiz.classicalReference.classicalDetails?.samhita || 'Classical Samhita'} •{' '}
                    {quiz.classicalReference.classicalDetails?.adhyayaName || ''}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Question</span>
              </button>

              <Link
                to="/quizzes"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition flex items-center gap-1.5 shadow"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <DisclaimerBanner compact={true} />
    </div>
  );
}
