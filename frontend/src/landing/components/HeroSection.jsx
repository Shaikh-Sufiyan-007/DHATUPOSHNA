import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ onScrollToSpine }) {
  return (
    <section
      id="section-hero"
      className="relative min-h-screen flex flex-col justify-between px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto pt-32 pb-10 z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
        {/* Left Column: Editorial Headline & Actions (occupies left ~50%) */}
        <motion.div
          className="lg:col-span-7 xl:col-span-6 flex flex-col items-start z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', staggerChildren: 0.15 }}
        >
          {/* Eyebrow: wide-tracked silver typography */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.24em] text-[#BFC8D6] mb-5 sm:mb-6"
          >
            INTERACTIVE 3D AYURVEDIC LEARNING
          </motion.div>

          {/* Heading: serif line breaks with a silver-to-ice accent line */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="dp-serif text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-[#E4EAF2] leading-[1.12] mb-6"
          >
            Explore the Human Body.<br />
            Understand the{' '}
            <span className="dp-gradient-accent italic font-normal">
              Science of Life.
            </span>
          </motion.h1>

          {/* Lead Paragraph matching reference */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm sm:text-base md:text-[17px] text-[#E4EAF2]/80 max-w-xl leading-relaxed mb-9 font-normal"
          >
            Discover the fascinating relationship between human anatomy and classical Ayurvedic knowledge through an immersive, interactive learning experience.
          </motion.p>

          {/* Action Buttons: Pill shapes matching reference */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={onScrollToSpine}
              className="dp-btn-primary group cursor-pointer text-sm font-semibold !py-3.5 !px-7 shadow-lg shadow-[#6FB3E0]/35"
            >
              <span>Explore the Human Body</span>
              <ArrowRight className="w-4 h-4 text-[#0A0F16] group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              to="/dhatus"
              className="dp-btn-ghost group text-sm font-medium !py-3.5 !px-7"
            >
              <span>Discover Sapta Dhatu</span>
              <ArrowRight className="w-4 h-4 text-[#BFC8D6] group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right column: reserved for the 3D diamond skeleton (right ~50%) */}
        <div className="lg:col-span-5 xl:col-span-6 pointer-events-none min-h-[380px] lg:min-h-[560px]" />
      </div>

      {/* Centered Scroll Down Indicator matching reference image */}
      <motion.button
        type="button"
        onClick={onScrollToSpine}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mx-auto flex flex-col items-center gap-2 cursor-pointer group focus-visible:outline-none"
        aria-label="Scroll down to explore anatomy"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9AA7B8] group-hover:text-[#BFC8D6] transition-colors">
          Scroll Down
        </span>
        <div className="w-5 h-8 rounded-full border border-[#BFC8D6]/45 flex items-start justify-center p-1 group-hover:border-[#BFC8D6] transition-colors">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-[#6FB3E0] shadow-[0_0_6px_#6FB3E0]"
          />
        </div>
      </motion.button>
    </section>
  );
}
