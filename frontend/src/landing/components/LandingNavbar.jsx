import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LandingNavbar({ currentStage = 1 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Explore', id: 'section-hero', active: currentStage <= 2 },
    { label: 'Features', id: 'section-spine', active: currentStage === 4 },
    { label: 'Skeleton', id: 'section-skeleton', active: currentStage === 5 },
    { label: 'Learn', id: 'section-learn', active: currentStage >= 6 },
  ];

  return (
    <>
      <a href="#main-content" className="dp-skip-link">
        Skip to main content
      </a>

      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#0A0F16]/92 backdrop-blur-md border-b border-[#BFC8D6]/20 py-3 shadow-2xl shadow-[#0A0F16]'
          : 'bg-transparent py-5 sm:py-6 border-b border-transparent'
          }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          {/* Left: Site icon + Brand Wordmark */}
          <a
            href="#section-hero"
            onClick={(e) => scrollToSection(e, 'section-hero')}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFC8D6] rounded-lg p-1"
          >
            <div
              className="flex items-center gap-2 sm:gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice rounded-xl"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-ice via-ice-soft to-cyan-400 p-[1px] shadow-lg shadow-ice/20 group-hover:shadow-ice/35 transition-all duration-300 group-hover:scale-105 shrink-0">
                <div className="w-full h-full bg-slate-950/90 rounded-[11px] flex items-center justify-center">
                  <span className="font-heading text-base sm:text-lg font-bold bg-gradient-to-r from-ice-soft via-ice-bright to-cyan-200 bg-clip-text text-transparent">
                    धा
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-slate-100 font-heading truncate">
                    DHATUPOSHANA
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-ice/15 text-ice-soft border border-ice/30 shadow-sm hidden xs:inline-block shrink-0 font-heading">
                    Spatial 3D
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden md:block tracking-wide truncate font-body">
                  Sapta Dhatu Knowledge Platform
                </p>
              </div>
            </div>
          </a>

          {/* Center (Desktop): In-page Links matching reference */}
          <nav
            className="hidden md:flex items-center gap-7 lg:gap-9 text-sm"
            aria-label="Landing Page Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`relative py-1 text-sm font-medium transition-colors ${link.active
                  ? 'text-[#F2F6FB]'
                  : 'text-[#E4EAF2]/75 hover:text-[#F2F6FB]'
                  }`}
              >
                <span>{link.label}</span>
                {link.active && (
                  <motion.div
                    layoutId="activeNavUnderline"
                    className="dp-nav-underline absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Right: Sign In & Sign Up Action Buttons matching reference */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/home"
                className="dp-btn-ghost !py-1.5 !px-5 text-xs inline-flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-[#BFC8D6]" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full border border-[#BFC8D6]/40 bg-[#151C26]/50 text-[#E4EAF2] text-xs font-medium transition-all hover:border-[#6FB3E0] hover:text-[#F2F6FB] hover:shadow-[0_0_20px_-6px_rgba(111,179,224,0.6)]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#EEF2F8] to-[#A9B2BF] hover:from-[#F7FAFE] hover:to-[#BFC8D6] text-[#0A0F16] text-xs font-semibold shadow-md shadow-[#6FB3E0]/35 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full border border-[#BFC8D6]/30 bg-[#151C26]/60 text-[#BFC8D6] hover:text-[#F2F6FB]"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#0A0F16]/96 border-b border-[#BFC8D6]/25 backdrop-blur-xl p-6 md:hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-4 mb-6">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`text-base font-medium py-1 ${link.active ? 'text-[#BFC8D6] font-semibold' : 'text-[#E4EAF2]/80'
                    }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3 pt-4 border-t border-[#BFC8D6]/15">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center rounded-full border border-[#BFC8D6]/45 bg-[#151C26]/50 text-[#E4EAF2] text-xs font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center rounded-full bg-gradient-to-r from-[#EEF2F8] to-[#A9B2BF] text-[#0A0F16] text-xs font-semibold shadow-md shadow-[#6FB3E0]/35"
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
