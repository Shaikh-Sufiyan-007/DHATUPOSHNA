import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FinalCtaSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section
      id="section-final-cta"
      className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center"
      aria-label="Call to Action"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="dp-card p-8 sm:p-14 lg:p-16 backdrop-blur-2xl relative overflow-hidden shadow-2xl"
      >
        {/* Subtle background glow matching reference */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 bg-[#6FB3E0]/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#BFC8D6]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A0F16]/85 border border-[#BFC8D6]/35 text-[#BFC8D6] text-xs font-semibold uppercase tracking-wider mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#6FB3E0]" />
          <span>Interactive Anatomical Gateway</span>
        </div>

        <h2 className="dp-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#E4EAF2] leading-tight mb-5">
          Go Beyond Memorization.{' '}
          <span className="dp-gradient-accent block">
            Experience the Knowledge.
          </span>
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-[#E4EAF2]/80 max-w-2xl mx-auto leading-relaxed mb-8 font-body">
          Explore anatomy and classical Ayurvedic concepts through a more visual, interactive approach to learning. Join researchers, students, and practitioners in unraveling the subtle physiological architecture of Sapta Dhatus.
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/home' : '/signup'}
            className="dp-btn-primary !text-sm !py-3.5 !px-8 shadow-xl shadow-[#6FB3E0]/25"
          >
            <span>{isAuthenticated ? 'Enter Application Dashboard' : 'Begin Exploring'}</span>
            <ArrowRight className="w-4 h-4 text-[#0A0F16]" />
          </Link>

          {!isAuthenticated && (
            <p className="text-xs sm:text-sm text-[#9AA7B8] mt-2">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#BFC8D6] hover:text-[#F2F6FB] underline underline-offset-4 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
