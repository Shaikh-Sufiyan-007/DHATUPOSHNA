import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Droplets,
  Flame,
  GitBranch,
  Scale,
  Box,
  Sparkles,
  BookOpen,
  Scroll,
} from 'lucide-react';
import {
  SPINE_FEATURE_CARDS,
  SPINE_CARD_WINDOWS,
  spineCardStateAt,
  activeSpineCardIndex,
} from '../constants/landingTheme.js';

// Icon resolver per feature category matching visual reference
function FeatureCardIcon({ type }) {
  const iconProps = { className: 'w-6 h-6 text-[#BFC8D6]' };
  switch (type) {
    case 'droplet':
      return <Droplets {...iconProps} />;
    case 'flame':
      return <Flame {...iconProps} />;
    case 'branch':
      return <GitBranch {...iconProps} />;
    case 'scale':
      return <Scale {...iconProps} />;
    case 'box3d':
      return <Box {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'book':
      return <BookOpen {...iconProps} />;
    case 'scroll':
      return <Scroll {...iconProps} />;
    default:
      return <Droplets {...iconProps} />;
  }
}

// Anatomical regions for the right rail matching reference: C, T, L, S, Co
const REGIONS = [
  { tag: 'C', label: 'Cervical' },
  { tag: 'T', label: 'Thoracic' },
  { tag: 'L', label: 'Lumbar' },
  { tag: 'S', label: 'Sacral' },
  { tag: 'Co', label: 'Coccygeal' },
];

// NDC offset -> vertical travel. 1 NDC spans half the viewport.
function travelStyle(translateNdc) {
  return `translateY(calc(-50% + ${(-translateNdc * 50).toFixed(3)}vh))`;
}

export default function SpineFeatureCards({ progress = 0, reducedMotion = false }) {
  // One progress source for the cards, the rail and the step counter
  const activeIndex = reducedMotion ? 0 : activeSpineCardIndex(progress);
  const activeCard = SPINE_FEATURE_CARDS[activeIndex];

  const stateFor = (index) => {
    if (reducedMotion) {
      return { opacity: index === 0 ? 1 : 0, translateNdc: 0, visible: index === 0 };
    }
    return spineCardStateAt(progress, SPINE_CARD_WINDOWS[index]);
  };

  const states = SPINE_FEATURE_CARDS.map((_, index) => stateFor(index));
  const nodeState = states[activeIndex];
  // The focal node belongs to the card phase: it fades out with the last card
  const nodeOpacity = Math.max(0, ...states.map((s) => s.opacity));

  return (
    <section
      id="section-spine"
      className="relative min-h-[400vh] pointer-events-none"
      aria-label="Spinal Column Anatomy and Platform Features"
    >
      {/* Sticky viewport frame holding active card, connector line, and region rail */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between py-24 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Top spacer */}
        <div className="h-6" />

        {/* Center Section: Left Card, Rotating Center Spine Gap, Right Card, and Far Right Rail */}
        <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 items-center my-auto pointer-events-none">
          {/* Left Column (Desktop): every left-side card stacked, driven by progress */}
          <div className="hidden lg:block lg:col-span-5 relative">
            {SPINE_FEATURE_CARDS.map((card, index) => {
              if (card.side !== 'left') return null;
              const st = states[index];
              return (
                <div
                  key={card.id}
                  aria-hidden={!st.visible}
                  className="absolute inset-x-0 top-0 flex items-center justify-end pr-6"
                  style={{
                    opacity: st.opacity,
                    transform: travelStyle(st.translateNdc),
                    pointerEvents: st.visible ? 'auto' : 'none',
                  }}
                >
                  <FeatureCardView card={card} side="left" />
                </div>
              );
            })}
          </div>

          {/* Central Column: Space reserved for 3D Spine & Horizontal Connector Line Anchor */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center relative pointer-events-none">
            {/* Spine focal node: tracks the vertebra the camera is looking at */}
            <div
              className="w-3 h-3 rounded-full bg-[#6FB3E0] shadow-[0_0_12px_#6FB3E0] border border-[#F2F6FB]"
              style={{
                opacity: nodeOpacity,
                transform: `translateY(${(-nodeState.translateNdc * 50).toFixed(3)}vh)`,
              }}
            />
          </div>

          {/* Right Column (Desktop): every right-side card stacked, driven by progress */}
          <div className="hidden lg:block lg:col-span-4 relative">
            {SPINE_FEATURE_CARDS.map((card, index) => {
              if (card.side !== 'right') return null;
              const st = states[index];
              return (
                <div
                  key={card.id}
                  aria-hidden={!st.visible}
                  className="absolute inset-x-0 top-0 flex items-center justify-start pl-6"
                  style={{
                    opacity: st.opacity,
                    transform: travelStyle(st.translateNdc),
                    pointerEvents: st.visible ? 'auto' : 'none',
                  }}
                >
                  <FeatureCardView card={card} side="right" />
                </div>
              );
            })}
          </div>

          {/* Far Right: Vertical Region Rail matching reference image (C, T, L, S, Co) */}
          <div className="hidden lg:flex lg:col-span-1 items-center justify-end pointer-events-auto pr-2">
            <div className="flex items-center gap-3">
              {/* Vertical line with region letters */}
              <div className="relative flex flex-col items-center py-2">
                {/* Thin vertical rule */}
                <div className="absolute top-2 bottom-2 w-[1px] bg-[#BFC8D6]/25" />

                {REGIONS.map((r) => {
                  const isActive = activeCard.regionTag === r.tag;
                  return (
                    <div
                      key={r.tag}
                      className="relative z-10 flex items-center justify-center my-2.5"
                    >
                      {isActive && (
                        /* Glowing active node */
                        <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-[#BFC8D6] shadow-[0_0_10px_#6FB3E0]" />
                      )}
                      <span
                        className={`text-xs font-semibold pl-4 transition-colors ${
                          isActive
                            ? 'text-[#F2F6FB] scale-110'
                            : 'text-[#9AA7B8]/60 hover:text-[#E4EAF2]'
                        }`}
                      >
                        {r.tag}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Step indicator beside the active region tag, same progress source */}
              <div className="text-[11px] font-bold tracking-widest text-[#F2F6FB] pl-1">
                {activeCard.step}
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Docked Card (bottom centre, clear of the focal node) */}
          <div className="lg:hidden col-span-1 relative h-0 mt-auto">
            {SPINE_FEATURE_CARDS.map((card, index) => {
              const st = states[index];
              return (
                <div
                  key={card.id}
                  aria-hidden={!st.visible}
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center px-2 pb-4"
                  style={{
                    opacity: st.opacity,
                    transform: `translateY(${(st.translateNdc * -25).toFixed(3)}vh)`,
                    pointerEvents: st.visible ? 'auto' : 'none',
                  }}
                >
                  <FeatureCardView card={card} isMobile />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>
    </section>
  );
}

// Single Card View with circular icon and connector line matching reference image
function FeatureCardView({ card, side = 'left', isMobile = false }) {
  return (
    <div
      className={`dp-card dp-card-active p-6 sm:p-7 pointer-events-auto relative flex items-start gap-5 ${
        isMobile ? 'w-full max-w-md mx-auto shadow-2xl' : 'max-w-md w-full'
      }`}
    >
      {/* Horizontal connector line from card to spine (desktop) */}
      {!isMobile && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
            side === 'left' ? '-right-16' : '-left-16'
          }`}
          aria-hidden="true"
        >
          <div className="flex items-center">
            {side === 'left' ? (
              <>
                <div className="w-16 h-[1.5px] bg-[#BFC8D6]/80 shadow-[0_0_6px_#6FB3E0]" />
                <div className="w-2 h-2 rounded-full bg-[#BFC8D6] -ml-1" />
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-[#BFC8D6] -mr-1" />
                <div className="w-16 h-[1.5px] bg-[#BFC8D6]/80 shadow-[0_0_6px_#6FB3E0]" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Left: Circular Icon Badge matching reference image */}
      <div className="flex-shrink-0 w-14 h-14 rounded-full border border-[#BFC8D6]/40 bg-[#0A0F16]/90 flex items-center justify-center shadow-inner shadow-[#6FB3E0]/15">
        <FeatureCardIcon type={card.iconType} />
      </div>

      {/* Right: Card Content matching reference image */}
      <div className="flex-1 min-w-0">
        {/* Step & Category tag */}
        <div className="text-[11px] font-medium text-[#9AA7B8] tracking-wider mb-1.5">
          {card.step} · {card.category}
        </div>

        {/* Title */}
        <h3 className="dp-serif text-xl sm:text-2xl font-bold text-[#E4EAF2] tracking-tight mb-2">
          {card.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-[13px] text-[#E4EAF2]/80 leading-relaxed mb-4">
          {card.description}
        </p>

        {/* Action link: 'Explore →' */}
        <Link
          to={card.link}
          className="text-xs font-semibold text-[#BFC8D6] hover:text-[#F2F6FB] transition-colors inline-flex items-center gap-1.5 group"
        >
          <span>{card.linkLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
