import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BookOpen,
  Scroll,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { dhatuApi } from '../../api/index.js';
import { LEARNING_AREAS } from '../constants/landingTheme.js';
import DisclaimerBanner from '../../components/common/DisclaimerBanner.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export default function LearningAreasSection() {
  const [featuredDhatus, setFeaturedDhatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    dhatuApi
      .getAll()
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data || res.data || [];
        setFeaturedDhatus(Array.isArray(list) ? list.slice(0, 3) : []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching featured Dhatus on landing page:', err);
        setError('Could not load live repository preview. Classical references remain verified.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="section-learn"
      className="relative z-10 py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      aria-label="Ayurvedic Learning Disciplines"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151C26]/90 border border-[#BFC8D6]/30 text-[#BFC8D6] text-xs font-semibold uppercase tracking-wider mb-4 shadow-md">
          <BookOpen className="w-3.5 h-3.5 text-[#6FB3E0]" />
          <span>Verified Epistemology • Two Knowledge Layers</span>
        </div>

        <h2 className="dp-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#E4EAF2] leading-tight mb-4">
          Authentic Classical Doctrines, Rigorously Preserved.
        </h2>

        <p className="text-sm sm:text-base text-[#E4EAF2]/80 leading-relaxed font-body">
          Every concept within DHATUPOSHNA is presented with clear epistemological duality: verbatim classical Sanskrit commentary alongside contemporary pedagogical explanations.
        </p>
      </div>

      {/* Grid of the 6 core Learning Disciplines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
        {LEARNING_AREAS.map((area, i) => (
          <motion.div
            key={area.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            className="dp-card p-6 sm:p-7 flex flex-col justify-between group hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#6FB3E0] px-2.5 py-0.5 rounded-full bg-[#0A0F16] border border-[#BFC8D6]/25">
                  {area.badge}
                </span>
                <span className="text-sm font-semibold text-[#BFC8D6] dp-serif">
                  {area.sanskrit}
                </span>
              </div>

              <h3 className="dp-serif text-xl font-bold text-[#E4EAF2] group-hover:text-[#F2F6FB] transition-colors mb-4">
                {area.title}
              </h3>

              {/* Layer 1: Scholarly / Classical Context */}
              <div className="mb-4 p-3 rounded-xl bg-[#0A0F16]/85 border border-[#BFC8D6]/15 text-xs text-[#9AA7B8] leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-[#BFC8D6] mb-1">
                  <Scroll className="w-3.5 h-3.5 text-[#6FB3E0]" />
                  <span>Layer I • Classical Samhita Source</span>
                </div>
                <p className="italic">{area.scholarly}</p>
              </div>

              {/* Layer 2: Simplified Educational Explanation */}
              <div className="mb-6 p-3 rounded-xl bg-[#151C26]/50 border border-[#BFC8D6]/15 text-xs text-[#E4EAF2] leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-[#F2F6FB] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#BFC8D6]" />
                  <span>Layer II • Modern Educational Lens</span>
                </div>
                <p>{area.simplified}</p>
              </div>
            </div>

            <Link
              to={area.link}
              className="text-xs font-semibold text-[#BFC8D6] hover:text-[#F2F6FB] transition-colors inline-flex items-center gap-1.5 pt-3 border-t border-[#BFC8D6]/15 min-h-[44px] touch-target"
            >
              <span>Explore {area.title}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Live API-Driven Knowledge Repository Preview */}
      <div className="dp-card p-6 sm:p-10 relative overflow-hidden mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#BFC8D6]/15 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#6FB3E0]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#BFC8D6]">
                Live Scientific Repository Preview
              </span>
            </div>
            <h3 className="dp-serif text-2xl font-bold text-[#E4EAF2]">
              Sample Verified Anatomical Dhatus
            </h3>
          </div>
          <Link
            to="/dhatus"
            className="dp-btn-ghost text-xs !py-2 !px-4"
          >
            <span>View All 7 Tissues</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading && (
          <div className="py-12">
            <LoadingState message="Connecting to Ayurvedic knowledge repository..." />
          </div>
        )}

        {error && (
          <div className="py-6">
            <ErrorState message={error} />
          </div>
        )}

        {!loading && !error && featuredDhatus.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDhatus.map((item) => (
              <div
                key={item._id || item.slug}
                className="p-5 rounded-2xl bg-[#0A0F16]/90 border border-[#BFC8D6]/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#6FB3E0] uppercase tracking-wider">
                      Dhatu #{item.order || '1'}
                    </span>
                    <span className="dp-serif text-sm font-semibold text-[#BFC8D6]">
                      {typeof item.sanskritName === 'object'
                        ? item.sanskritName.devanagari
                        : item.sanskritName || ''}
                    </span>
                  </div>

                  <h4 className="dp-serif text-lg font-bold text-[#E4EAF2] mb-2">
                    {item.name}
                  </h4>

                  <p className="text-xs text-[#E4EAF2]/80 leading-relaxed mb-4 line-clamp-3">
                    {item.userFriendlyLayer?.summary ||
                      item.description ||
                      item.sourceAcademicLayer?.scholarlyExplanation ||
                      'Authentic physiological structural tissue.'}
                  </p>
                </div>

                <Link
                  to={`/dhatus/${item.slug || item._id}`}
                  className="text-xs font-semibold text-[#BFC8D6] hover:text-[#F2F6FB] inline-flex items-center gap-1 mt-2 min-h-[36px]"
                >
                  <span>Read Full Anatomical Treatise</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Clear epistemological distinction note */}
        <div className="mt-8 pt-5 border-t border-[#BFC8D6]/15 flex items-start gap-3 text-xs text-[#9AA7B8]">
          <Info className="w-4 h-4 text-[#BFC8D6] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#E4EAF2]">Comparative Epistemology Note:</strong> Classical Ayurvedic concepts (Dhatus, Dhatvagnis, Srotamsi) represent functional metabolic frameworks from classical Samhitas. Modern physiological correlations are provided for academic study and comparative reference only.
          </p>
        </div>
      </div>

      {/* Standard Disclaimer Banner */}
      <DisclaimerBanner />
    </section>
  );
}
