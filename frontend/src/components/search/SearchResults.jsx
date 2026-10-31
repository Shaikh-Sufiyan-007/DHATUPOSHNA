import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Flame,
  GitBranch,
  BookOpen,
  Activity,
  HelpCircle,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SearchResults({ results = [] }) {
  if (!results || results.length === 0) {
    return null;
  }

  const getTypeMeta = (type) => {
    switch (type?.toLowerCase()) {
      case 'dhatu':
        return { label: 'Sapta Dhatu', icon: Layers, color: 'text-ice bg-ice/10 border-ice/30' };
      case 'dhatvagni':
        return { label: 'Dhatvagni', icon: Flame, color: 'text-silver bg-silver/10 border-silver/30' };
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
        return { label: 'Classical Source', icon: Award, color: 'text-ice-bright bg-ice-bright/10 border-ice-bright/30' };
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
    <div className="space-y-3 w-full font-body">
      {results.map((item, idx) => {
        const typeMeta = getTypeMeta(item.type);
        const Icon = typeMeta.icon;
        const targetUrl = getTargetUrl(item);
        const isDhatu = item.type?.toLowerCase() === 'dhatu';

        return (
          <motion.div
            key={item._id || item.id || idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.4), ease: 'easeOut' }}
            whileHover={{ y: -2, scale: 1.005 }}
            className="glass-card glass-card-ice rounded-2xl p-4 sm:p-5 border border-slate-800/80 hover:border-ice/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border font-heading ${typeMeta.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{typeMeta.label}</span>
                </span>
                {item.sanskritName && (
                  <span className="text-sm font-heading text-ice-soft">
                    {item.sanskritName}
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-100 group-hover:text-ice-soft transition font-heading">
                {item.title || item.name || item.term}
              </h4>

              {item.snippet && (
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-body">
                  {item.snippet}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 font-heading">
              {isDhatu && (
                <Link
                  to={`/explore?dhatu=${item.slug || item.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition flex items-center gap-1 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D View</span>
                </Link>
              )}

              <Link
                to={targetUrl}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-ice-soft bg-ice/10 hover:bg-ice/20 border border-ice/30 transition flex items-center gap-1 active:scale-95"
              >
                <span>Read Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
