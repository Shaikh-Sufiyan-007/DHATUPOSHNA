import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-xl shadow-amber-500/5 animate-pulse">
        <Compass className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-2">
        Error 404 • Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading mb-3">
        Knowledge Pathway Undefined
      </h1>

      <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
        The requested URL path does not exist in the Ayurvedic Knowledge Platform. You can explore the 3D human body viewer or return to the Sapta Dhatus catalog.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Home Page</span>
        </Link>

        <Link
          to="/explore"
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-95 shadow transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch 3D Explorer</span>
        </Link>
      </div>
    </div>
  );
}
