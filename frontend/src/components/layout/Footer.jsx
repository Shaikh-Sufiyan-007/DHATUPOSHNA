import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, BookMarked, Globe } from 'lucide-react';
import DisclaimerBanner from '../common/DisclaimerBanner';

export default function Footer() {
  return (
    <footer className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-20 mb-8 text-slate-400 text-xs">
      <div className="spatial-dock rounded-3xl p-6 sm:p-10 border border-slate-700/50 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-300 font-classical font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                धा
              </div>
              <span className="font-heading text-slate-100 font-bold tracking-tight text-sm">
                DHATUPOSHANA
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Comprehensive Ayurvedic knowledge platform integrating classical Samhita doctrines with interactive 3D human body visualization, Dhatvagni metabolism, and Dhatuposhana theories.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[12px] text-cyan-300 font-medium shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive 3D Architecture</span>
            </div>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-sm mb-3">
              Sapta Dhatus
            </h4>
            <ul className="space-y-1.5">
              {[
                { name: 'Rasa (रस) • Plasma / Chyle', slug: 'rasa' },
                { name: 'Rakta (रक्त) • Blood / Vascular', slug: 'rakta' },
                { name: 'Mamsa (मांस) • Muscle Mantle', slug: 'mamsa' },
                { name: 'Meda (मेद) • Adipose Tissue', slug: 'meda' },
                { name: 'Asthi (अस्थि) • Bone Structure', slug: 'asthi' },
                { name: 'Majja (मज्जा) • Marrow & Neural', slug: 'majja' },
                { name: 'Shukra (शुक्र) • Reproductive Vitality', slug: 'shukra' },
              ].map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/explore?dhatu=${item.slug}`}
                    className="text-slate-400 hover:text-amber-300 hover:translate-x-0.5 transition-all block truncate text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-sm mb-3">
              Theories & Knowledge
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/nyayas" className="text-slate-400 hover:text-amber-300 hover:translate-x-0.5 transition-all block text-sm">
                  Three Nyayas (Ksheera-Dadhi, Kedari-Kulya, Khale-Kapota)
                </Link>
              </li>
              <li>
                <Link to="/dhatvagni" className="text-slate-400 hover:text-amber-300 hover:translate-x-0.5 transition-all block text-sm">
                  Dhatvagni & Metabolic Transformation
                </Link>
              </li>
              <li>
                <Link to="/dhatuposhana" className="text-slate-400 hover:text-amber-300 hover:translate-x-0.5 transition-all block text-sm">
                  Dhatuposhana (Tissue Nourishment)
                </Link>
              </li>
              <li>
                <Link to="/concepts" className="text-slate-400 hover:text-amber-300 hover:translate-x-0.5 transition-all block text-sm">
                  Fundamental Concepts (Tridosha, Agni, Ojas, Srotas)
                </Link>
              </li>
              <li>
                <Link to="/glossary" className="text-slate-400 hover:text-amber-300 hover:translate-x-0.5 transition-all block text-sm">
                  Sanskrit Glossary & Etymology
                </Link>
              </li>
              <li>
                <Link to="/quizzes" className="text-slate-400 hover:text-amber-300 hover:translate-x-0.5 transition-all block text-sm">
                  Knowledge Evaluation Quizzes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-sm mb-3">
              Sources & Validation
            </h4>
            <p className="text-slate-400 text-sm mb-3 leading-relaxed">
              Curated directly from Brihat Trayi (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya) and peer-reviewed modern correlations.
            </p>
            <ul className="space-y-1.5">
              <li>
                <Link to="/references" className="text-amber-400 hover:text-amber-300 transition font-medium flex items-center gap-1.5 text-sm">
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>View All Classical References</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <DisclaimerBanner />

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} DHATUPOSHANA Project. Open Ayurvedic Educational Initiative.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Classical Epistemology
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Spatial 3D Experience
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
