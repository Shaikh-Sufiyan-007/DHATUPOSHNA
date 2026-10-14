import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Flame,
  GitBranch,
  BookOpen,
  HelpCircle,
  Award,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function SearchResults({ results = [] }) {
  if (!results || results.length === 0) {
    return null;
  }

  const getTypeMeta = (type) => {
    switch (type?.toLowerCase()) {
      case 'dhatu':
        return { label: 'Sapta Dhatu', icon: Layers, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'dhatvagni':
        return { label: 'Dhatvagni', icon: Flame, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
      case 'dhatuposhana':
        return { label: 'Dhatuposhana', icon: GitBranch, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'concept':
        return { label: 'Core Concept', icon: BookOpen, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'nyaya':
        return { label: 'Nyaya Theory', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'glossary':
        return { label: 'Sanskrit Term', icon: BookOpen, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'quiz':
        return { label: 'Knowledge Quiz', icon: HelpCircle, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' };
      case 'reference':
        return { label: 'Classical Source', icon: Award, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
      default:
        return { label: type || 'Knowledge Record', icon: BookOpen, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const getTargetUrl = (item) => {
    const slugOrId = item.slug || item.id || item._id;
    const type = item.type?.toLowerCase();

    switch (type) {
      case 'dhatu':
        return `/dhatus/${slugOrId}`;
      case 'dhatvagni':
        return `/dhatvagni/${slugOrId}`;
      case 'dhatuposhana':
        return `/dhatuposhana/${slugOrId}`;
      case 'nyaya':
        return `/nyayas/${slugOrId}`;
      case 'concept':
        return `/concepts/${slugOrId}`;
      case 'glossary':
        return `/glossary?search=${encodeURIComponent(item.title || '')}`;
      case 'quiz':
        return `/quizzes/${slugOrId}`;
      case 'reference':
        return `/references/${slugOrId}`;
      default:
        return `/search?q=${encodeURIComponent(item.title || '')}`;
    }
  };

  return (
    <div className="space-y-3 w-full">
      {results.map((item, idx) => {
        const typeMeta = getTypeMeta(item.type);
        const Icon = typeMeta.icon;
        const targetUrl = getTargetUrl(item);
        const isDhatu = item.type?.toLowerCase() === 'dhatu';

        return (
          <div
            key={item._id || item.id || idx}
            className="glass-card rounded-xl p-4 sm:p-5 border border-slate-800/80 hover:border-amber-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-semibold border ${typeMeta.color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{typeMeta.label}</span>
                </span>
                {item.sanskritName && (
                  <span className="text-sm font-classical text-amber-300">
                    {item.sanskritName}
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition">
                {item.title || item.name || item.term}
              </h4>

              {item.snippet && (
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {item.snippet}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              {isDhatu && (
                <Link
                  to={`/explore?dhatu=${item.slug || item.id}`}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>3D View</span>
                </Link>
              )}

              <Link
                to={targetUrl}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1"
              >
                <span>Read Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
