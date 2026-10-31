import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SkeletonRevealSection() {
  return (
    <section
      id="section-skeleton"
      className="relative min-h-[140vh] flex flex-col justify-end lg:justify-center items-center lg:items-start px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto z-10 py-24 pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="dp-card p-6 sm:p-8 lg:p-10 backdrop-blur-xl relative overflow-hidden pointer-events-auto max-w-md lg:max-w-lg text-center lg:text-left mb-8 lg:mb-0 shadow-2xl"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A0F16]/90 border border-[#BFC8D6]/35 text-[#BFC8D6] text-xs font-semibold uppercase tracking-wider mb-5 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#6FB3E0]" />
          <span>Stage V • Whole Skeletal Integration</span>
        </div>

        <h2 className="dp-serif text-2xl sm:text-4xl lg:text-4xl font-bold tracking-tight text-[#E4EAF2] leading-tight mb-4">
          One Structure. A Remarkable System.
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-[#E4EAF2]/80 leading-relaxed mb-6 font-normal">
          Explore the human skeletal framework through an interactive three-dimensional perspective. From the protective cranium through the articulating spinal column to the appendicular limbs, discover how authentic Ayurvedic knowledge contextualizes structural anatomy.
        </p>

        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
          <Link
            to="/explore"
            className="dp-btn-primary group"
          >
            <span>Explore the Skeleton</span>
            <ArrowRight className="w-4 h-4 text-[#0A0F16] group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/dhatus/asthi"
            className="dp-btn-ghost group"
          >
            <span>Asthi Dhatu Treatise</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
