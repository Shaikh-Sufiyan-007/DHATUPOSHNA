import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Home } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 font-body"
    >
      <div className="w-16 h-16 rounded-2xl bg-ice/10 border border-ice/30 flex items-center justify-center text-ice mb-6 shadow-xl shadow-ice/5 animate-pulse">
        <Compass className="w-8 h-8" />
      </div>

      <span className="text-xs font-heading font-bold text-ice uppercase tracking-widest mb-2">
        Error 404 • Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-heading mb-3">
        Knowledge Pathway Undefined
      </h1>

      <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
        The requested URL path does not exist in the Ayurvedic Knowledge Platform. You can explore the 3D human body viewer or return to the Sapta Dhatus catalog.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 font-heading">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/home"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-2"
          >
            <span>Landing Page</span>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/explore"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-ice-bright to-silver-deep text-slate-950 hover:opacity-95 shadow transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch 3D Explorer</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
