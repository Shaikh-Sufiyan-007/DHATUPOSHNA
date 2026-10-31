import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  ArrowRight,
  Award,
  Flame,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import HumanBodyViewer from '../components/3d/HumanBodyViewer.jsx';
import DhatuSelector from '../components/dhatu/DhatuSelector.jsx';
import DhatuInfoPanel from '../components/dhatu/DhatuInfoPanel.jsx';
import SearchBar from '../components/search/SearchBar.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDhatu = searchParams.get('dhatu') || 'rasa';
  const [selectedDhatu, setSelectedDhatu] = useState(initialDhatu);
  const homeRef = useRef(null);

  const handleSelectDhatu = (dhatuSlug) => {
    setSelectedDhatu(dhatuSlug);
    if (dhatuSlug) {
      setSearchParams({ dhatu: dhatuSlug });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const paramDhatu = searchParams.get('dhatu');
    if (paramDhatu && paramDhatu !== selectedDhatu) {
      setSelectedDhatu(paramDhatu);
    }
  }, [searchParams]);

  // GSAP Animations (sequenced hero timeline, ScrollTrigger reveals, subtle parallax glow)
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      // 1. Home hero intro timeline (fromTo prevents React StrictMode stuck opacity)
      const heroTl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.6 },
      });

      heroTl
        .fromTo('.hero-badge', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'opacity,transform' })
        .fromTo('.hero-title', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65, clearProps: 'opacity,transform' }, '-=0.25')
        .fromTo('.hero-subtext', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, clearProps: 'opacity,transform' }, '-=0.3')
        .fromTo('.hero-search', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'opacity,transform' }, '-=0.3')
        .fromTo('.hero-cta-btn', { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, clearProps: 'opacity,transform' }, '-=0.25');

      // 2. Subtle background glow parallax movement on Home only
      gsap.to('.home-glow-parallax-1', {
        y: 50,
        ease: 'none',
        scrollTrigger: {
          trigger: homeRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.8,
        },
      });

      gsap.to('.home-glow-parallax-2', {
        y: -35,
        ease: 'none',
        scrollTrigger: {
          trigger: homeRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.8,
        },
      });

      // 3. ScrollTrigger reveals for sections (once on scroll, fromTo with clearProps)
      gsap.fromTo(
        '.home-section-viewport',
        { opacity: 0, y: 24 },
        {
          scrollTrigger: {
            trigger: '.home-section-viewport',
            start: 'top 85%',
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        }
      );

      // 4. ScrollTrigger stagger for card grid (stagger 0.08–0.12s, fromTo with clearProps)
      gsap.fromTo(
        '.home-pillars-card',
        { opacity: 0, y: 20 },
        {
          scrollTrigger: {
            trigger: '.home-pillars-grid',
            start: 'top 92%',
            once: true,
          },
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        }
      );

      // Re-calculate trigger offsets after 3D canvas and dynamic panel data render
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);

      return () => clearTimeout(refreshTimer);
    },
    { scope: homeRef }
  );

  return (
    <div ref={homeRef} className="relative space-y-12 sm:space-y-16 pb-12 overflow-x-clip">
      {/* Subtle parallax glow elements on Home */}
      <div
        className="home-glow-parallax-1 absolute -top-10 -left-20 w-96 h-96 bg-ice/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="home-glow-parallax-2 absolute top-1/2 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-8 pb-4 text-center w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="hero-badge inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full spatial-pill text-ice-soft text-xs sm:text-sm font-semibold uppercase tracking-wider mb-4 sm:mb-6 shadow-lg shadow-ice/10 font-heading">
          <Sparkles className="w-4 h-4 text-ice shrink-0" />
          <span>Sapta Dhatu Spatial Epistemology</span>
        </div>

        <h1 className="hero-title text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 font-heading leading-tight mb-4 sm:mb-5">
          Interactive{' '}
          <span className="bg-gradient-to-r from-ice via-ice-bright to-cyan-400 bg-clip-text text-transparent glow-ice">
            3D Human Body
          </span>{' '}
          & Ayurvedic Dhatu Knowledge
        </h1>

        <p className="hero-subtext text-slate-300 text-xs sm:base md:text-lg max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 font-body">
          Explore the seven structural tissues (<span className="text-ice-soft font-semibold font-heading">सप्त धातु</span>), metabolic transformation by Dhatvagni, and classic nourishment theories (Nyayas) through a real-time spatial anatomical 3D viewport verified by classical Samhitas.
        </p>

        <div className="hero-search mb-6 sm:mb-8">
          <SearchBar />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
          <Link
            to="/explore"
            className="hero-cta-btn w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-ice-bright via-silver to-cyan-500 text-slate-950 hover:opacity-95 shadow-xl shadow-ice/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] touch-target font-heading"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Dedicated 3D Explorer</span>
          </Link>

          <Link
            to="/dhatus"
            className="hero-cta-btn w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold spatial-pill text-slate-200 hover:text-white hover:-translate-y-0.5 active:scale-[0.98] shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] touch-target font-heading"
          >
            <span>Browse All 7 Dhatus</span>
            <ArrowRight className="w-4 h-4 text-ice shrink-0" />
          </Link>
        </div>
      </section>

      {/* 3D Viewport Section */}
      <section className="home-section-viewport w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ice animate-ping shrink-0" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 font-heading">
                Interactive Human Body & Dhatu Nexus
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-body">
              Click any highlighted anatomical locus on the 3D model or choose a Dhatu from the spatial dock below.
            </p>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <DhatuSelector
            selectedDhatu={selectedDhatu}
            onSelectDhatu={handleSelectDhatu}
            orientation="horizontal"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
            <HumanBodyViewer
              selectedDhatu={selectedDhatu}
              onSelectDhatu={handleSelectDhatu}
              height="clamp(420px, 60vh, 650px)"
              interactive={true}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
            <DhatuInfoPanel
              selectedDhatu={selectedDhatu}
              onSelectDhatu={handleSelectDhatu}
            />
          </div>
        </div>
      </section>

      {/* Pillars of Dhatu Epistemology Grid Section */}
      <section className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 pt-6">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 font-heading mb-3">
            Pillars of Dhatu Epistemology
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-body">
            Ayurveda conceptualizes tissue creation as a continuous, ordered metabolic cascade governed by Agni and distinct physiological dynamics.
          </p>
        </div>

        <div className="home-pillars-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          <div className="home-pillars-card glass-card glass-card-ice rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-ice/15 border border-ice/35 flex items-center justify-center text-ice mb-5 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-ice-soft transition-colors mb-2.5">
                Dhatvagni Dynamics
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-body">
                Each of the seven Dhatus possesses its own subtle bio-fire (Dhatvagni) responsible for selectively assimilating nutrients (Poshaka) into tissue structure (Poshya) and synthesizing Upadhatus and Malas.
              </p>
            </div>
            <Link
              to="/dhatvagni"
              className="text-xs sm:text-sm font-semibold text-ice hover:text-ice-soft transition-all flex items-center gap-2 pt-4 border-t border-slate-800 group-hover:border-ice/30 min-h-[44px] touch-target font-heading"
            >
              <span>Explore 7 Dhatvagnis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="home-pillars-card glass-card glass-card-ice rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-cyan-300 transition-colors mb-2.5">
                The Three Nyayas
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-body">
                The classic models of Dhatuposhana: Ksheera-Dadhi (Direct Transformation), Kedari-Kulya (Irrigation & Distribution), and Khale-Kapota (Selective Avian Nourishment).
              </p>
            </div>
            <Link
              to="/nyayas"
              className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-2 pt-4 border-t border-slate-800 group-hover:border-cyan-500/30 min-h-[44px] touch-target font-heading"
            >
              <span>Compare Three Nyayas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="home-pillars-card glass-card glass-card-ice rounded-3xl p-6 sm:p-8 flex flex-col justify-between group md:col-span-2 lg:col-span-1">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/35 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-purple-300 transition-colors mb-2.5">
                Samhita Citations
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-body">
                Direct Sanskrit references from Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya, preserving verse citations, chapter locations, and academic translations.
              </p>
            </div>
            <Link
              to="/references"
              className="text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 transition-all flex items-center gap-2 pt-4 border-t border-slate-800 group-hover:border-purple-500/30 min-h-[44px] touch-target font-heading"
            >
              <span>View Classical Sources</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 pt-4">
        <DisclaimerBanner />
      </div>
    </div>
  );
}