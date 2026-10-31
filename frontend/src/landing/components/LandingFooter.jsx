import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookMarked } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function LandingFooter() {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8 text-[#9AA7B8] text-xs font-body relative z-10">
      <div className="dp-card rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
        <div className="dp-silver-rule absolute top-0 left-1/4 right-1/4" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/dhatuposhna_icon.png"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-xl shrink-0"
              />
              <span className="dp-serif text-[#F2F6FB] font-bold tracking-tight text-sm">
                DHATUPOSHNA
              </span>
            </div>
            <p className="text-xs text-[#9AA7B8] leading-relaxed mb-4">
              Comprehensive Ayurvedic knowledge platform integrating classical Samhita doctrines with interactive 3D human body visualization, Dhatvagni metabolism, and Dhatuposhana theories.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0A0F16]/80 border border-[#BFC8D6]/25 text-[11px] text-[#BFC8D6]">
              <Sparkles className="w-3.5 h-3.5 text-[#6FB3E0]" />
              <span>Interactive Diamond 3D Specimen</span>
            </div>
          </div>

          {/* Sapta Dhatus Column */}
          <div>
            <h4 className="dp-serif text-[#F2F6FB] font-semibold uppercase tracking-wider text-xs mb-3">
              Sapta Dhatus
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/dhatus/rasa" className="hover:text-[#F2F6FB] transition">Rasa (Plasma & Chyle)</Link></li>
              <li><Link to="/dhatus/rakta" className="hover:text-[#F2F6FB] transition">Rakta (Formed Blood)</Link></li>
              <li><Link to="/dhatus/mamsa" className="hover:text-[#F2F6FB] transition">Mamsa (Muscle Tissue)</Link></li>
              <li><Link to="/dhatus/meda" className="hover:text-[#F2F6FB] transition">Meda (Adipose Tissue)</Link></li>
              <li><Link to="/dhatus/asthi" className="hover:text-[#F2F6FB] transition">Asthi (Bone Framework)</Link></li>
              <li><Link to="/dhatus/majja" className="hover:text-[#F2F6FB] transition">Majja (Marrow & Nerve)</Link></li>
              <li><Link to="/dhatus/shukra" className="hover:text-[#F2F6FB] transition">Shukra (Vital Reproductive)</Link></li>
            </ul>
          </div>

          {/* Theories & Knowledge Column */}
          <div>
            <h4 className="dp-serif text-[#F2F6FB] font-semibold uppercase tracking-wider text-xs mb-3">
              Theories & Knowledge
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/dhatvagni" className="hover:text-[#F2F6FB] transition">Dhatvagni (Metabolic Fires)</Link></li>
              <li><Link to="/dhatuposhana" className="hover:text-[#F2F6FB] transition">Dhatuposhana (Nourishment)</Link></li>
              <li><Link to="/nyayas" className="hover:text-[#F2F6FB] transition">Three Classical Nyayas</Link></li>
              <li><Link to="/concepts" className="hover:text-[#F2F6FB] transition">Core Concepts</Link></li>
              <li><Link to="/glossary" className="hover:text-[#F2F6FB] transition">Sanskrit Glossary</Link></li>
              <li><Link to="/quizzes" className="hover:text-[#F2F6FB] transition">Knowledge Assessments</Link></li>
              <li><Link to="/explore" className="hover:text-[#F2F6FB] transition">Full 3D Human Anatomy</Link></li>
            </ul>
          </div>

          {/* Sources & Citations Column */}
          <div>
            <h4 className="dp-serif text-[#F2F6FB] font-semibold uppercase tracking-wider text-xs mb-3">
              Sources & Validation
            </h4>
            <p className="text-xs text-[#9AA7B8] mb-3 leading-relaxed">
              Rooted in the Brihat-Trayi: Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/references" className="text-[#BFC8D6] hover:text-[#F2F6FB] transition font-medium flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>View All Classical References</span>
                </Link>
              </li>
              <li><Link to="/search" className="hover:text-[#F2F6FB] transition">Global Classical Search</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#BFC8D6]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-[#9AA7B8]">
          <div>
            © {CURRENT_YEAR} DHATUPOSHNA Engine. Open educational resource for Ayurvedic medicine & spatial human anatomy.
            <span className="block text-[10px] text-[#9AA7B8]/80 mt-0.5">
              3D Anatomy Assets: Cranium by Vladimir Petkovic (CC0-1.0 Public Domain); 206-bone anatomical framework (MIT / Open Resource).
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/explore" className="hover:text-[#F2F6FB] transition">3D Anatomy</Link>
            <span>•</span>
            <Link to="/glossary" className="hover:text-[#F2F6FB] transition">Glossary</Link>
            <span>•</span>
            <Link to="/references" className="hover:text-[#F2F6FB] transition">Samhita References</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
