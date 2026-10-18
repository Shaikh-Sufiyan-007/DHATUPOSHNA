import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  ArrowRight,
  Award,
  Flame,
} from 'lucide-react';
import HumanBodyViewer from '../components/3d/HumanBodyViewer.jsx';
import DhatuSelector from '../components/dhatu/DhatuSelector.jsx';
import DhatuInfoPanel from '../components/dhatu/DhatuInfoPanel.jsx';
import SearchBar from '../components/search/SearchBar.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';


export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDhatu = searchParams.get('dhatu') || 'rasa';
  const [selectedDhatu, setSelectedDhatu] = useState(initialDhatu);

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

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 animate-spatial-in">
      <section className="relative pt-6 sm:pt-10 pb-4 text-center w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full spatial-pill text-amber-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 shadow-lg shadow-amber-500/10">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Sapta Dhatu Spatial Epistemology</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 font-heading leading-tight mb-5">
          Interactive{' '}
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-300 bg-clip-text text-transparent glow-amber">
            3D Human Body
          </span>{' '}
          & Ayurvedic Dhatu Knowledge
        </h1>

        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
          Explore the seven structural tissues (<span className="text-amber-300 font-semibold font-classical">सप्त धातु</span>), metabolic transformation by Dhatvagni, and classic nourishment theories (Nyayas) through a real-time spatial anatomical 3D viewport verified by classical Samhitas.
        </p>

        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/explore"
            className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:opacity-95 shadow-xl shadow-amber-500/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Dedicated 3D Explorer</span>
          </Link>

          <Link
            to="/dhatus"
            className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold spatial-pill text-slate-200 hover:text-white hover:-translate-y-0.5 shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <span>Browse All 7 Dhatus</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </section>

      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-heading">
                Interactive Human Body & Dhatu Nexus
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Click any highlighted anatomical locus on the 3D model or choose a Dhatu from the spatial dock below.
            </p>
          </div>
        </div>

        <div className="mb-6">
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
              height="650px"
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

      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 font-heading mb-3">
            Pillars of Dhatu Epistemology
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ayurveda conceptualizes tissue creation as a continuous, ordered metabolic cascade governed by Agni and distinct physiological dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/35 flex items-center justify-center text-orange-400 mb-5 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-amber-300 transition-colors mb-2.5">
                Dhatvagni Dynamics
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Each of the seven Dhatus possesses its own subtle bio-fire (Dhatvagni) responsible for selectively assimilating nutrients (Poshaka) into tissue structure (Poshya) and synthesizing Upadhatus and Malas.
              </p>
            </div>
            <Link
              to="/dhatvagni"
              className="text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 transition-all flex items-center gap-2 pt-4 border-t border-slate-800 group-hover:border-amber-500/30"
            >
              <span>Explore 7 Dhatvagnis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-cyan-300 transition-colors mb-2.5">
                The Three Nyayas
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                The classic models of Dhatuposhana: Ksheera-Dadhi (Direct Transformation), Kedari-Kulya (Irrigation & Distribution), and Khale-Kapota (Selective Avian Nourishment).
              </p>
            </div>
            <Link
              to="/nyayas"
              className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-2 pt-4 border-t border-slate-800 group-hover:border-cyan-500/30"
            >
              <span>Compare Three Nyayas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/35 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-heading group-hover:text-purple-300 transition-colors mb-2.5">
                Samhita Citations
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Direct Sanskrit references from Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya, preserving verse citations, chapter locations, and academic translations.
              </p>
            </div>
            <Link
              to="/references"
              className="text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 transition-all flex items-center gap-2 pt-4 border-t border-slate-800 group-hover:border-purple-500/30"
            >
              <span>View Classical Sources</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-4">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
