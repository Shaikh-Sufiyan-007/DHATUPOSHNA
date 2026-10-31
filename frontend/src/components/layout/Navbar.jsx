import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Layers,
  Flame,
  GitBranch,
  BookOpen,
  Award,
  HelpCircle,
  Activity,
  LogIn,
  LogOut,
  UserPlus,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const drawerRef = useRef(null);

  // Scroll detection for navbar styling change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileMenuOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target) &&
        !e.target.closest('button[aria-controls="mobile-nav-drawer"]')
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: '3D Explorer', path: '/explore', icon: Sparkles, highlight: true },
    { name: '7 Dhatus', path: '/dhatus', icon: Layers },
    { name: 'Dhatvagni', path: '/dhatvagni', icon: Flame },
    { name: 'Dhatuposhana', path: '/dhatuposhana', icon: GitBranch },
    { name: 'Three Nyayas', path: '/nyayas', icon: Activity },
    { name: 'Concepts', path: '/concepts', icon: BookOpen },
    { name: 'Glossary', path: '/glossary', icon: BookOpen },
    { name: 'Quizzes', path: '/quizzes', icon: HelpCircle },
    { name: 'References', path: '/references', icon: Award },
  ];

  const drawerVariants = {
    closed: {
      x: '100%',
      transition: { type: 'spring', damping: 28, stiffness: 260 },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        damping: 26,
        stiffness: 240,
        staggerChildren: 0.04,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${scrolled
            ? 'bg-slate-950/92 backdrop-blur-xl border-slate-800 shadow-2xl shadow-slate-950/80 py-2 sm:py-2.5'
            : 'bg-slate-950/78 backdrop-blur-md border-slate-800/60 py-2.5 sm:py-3.5'
          }`}
      >
        <div className="w-full max-w-[1880px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 lg:gap-3 h-12 sm:h-14">
            {/* Brand / Logo */}
            <Link
              to="/home"
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
            </Link>

            {/* Desktop Search Bar (>=1024px) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center relative w-40 xl:w-56 2xl:w-72 group shrink-0"
            >
              <input
                type="text"
                placeholder="Search Dhatu, Agni, Nyaya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 xl:pl-9 pr-7 py-1.5 xl:py-2 text-xs rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-400 border border-slate-700/70 focus:outline-none focus:border-ice focus:ring-1 focus:ring-ice/40 shadow-inner transition duration-200 font-body"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-ice absolute left-2.5 xl:left-3 pointer-events-none transition" />
              <span className="absolute right-2 px-1 py-0.5 rounded text-[9px] font-heading text-slate-400 bg-slate-800 border border-slate-700/60 pointer-events-none">
                /
              </span>
            </form>

            {/* Desktop Navigation Links (>=1024px) */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink min-w-0" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isSelected = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `relative px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs font-semibold transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap font-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice ${isActive || isSelected
                        ? 'text-ice-soft'
                        : link.highlight
                          ? 'text-slate-300 hover:text-ice-soft hover:bg-slate-800/70'
                          : 'text-slate-300/80 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => {
                      const active = isActive || isSelected;
                      return (
                        <>
                          {active && (
                            <motion.span
                              layoutId="navbar-active-indicator"
                              className="absolute inset-0 rounded-xl bg-ice/18 border border-ice/40 shadow-[0_0_12px_rgba(111,179,224,0.25)] -z-10"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-ice' : 'text-slate-400'}`} />
                          <span>{link.name}</span>
                          {active && (
                            <motion.span
                              layoutId="navbar-active-underline"
                              className="absolute bottom-0 inset-x-2 h-[2px] bg-ice rounded-full"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                        </>
                      );
                    }}
                  </NavLink>
                );
              })}
            </nav>

            {/* Desktop Auth Controls (>=1024px) */}
            <div className="hidden lg:flex items-center gap-2 pl-2 xl:pl-3 border-l border-slate-800 shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-xs shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-ice-bright to-silver-deep text-slate-950 font-bold text-[10px] flex items-center justify-center shadow font-heading">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[85px] xl:max-w-[120px] truncate text-slate-100 font-medium font-body">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-ice-soft hover:bg-ice/10 border border-transparent hover:border-ice/30 transition flex items-center gap-1.5 cursor-pointer min-h-[36px] font-heading"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 xl:gap-2">
                  <Link
                    to="/login"
                    className="px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 border border-slate-700/70 transition flex items-center gap-1.5 min-h-[36px] font-heading"
                  >
                    <LogIn className="w-3.5 h-3.5 text-ice" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 xl:px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-ice-bright via-silver to-silver-deep text-slate-950 hover:opacity-95 shadow-lg shadow-ice/20 transition flex items-center gap-1.5 min-h-[36px] font-heading"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Tablet & Mobile Header Right Controls (<1024px) */}
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <Link
                to="/explore"
                className="px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-ice-bright to-silver-deep text-slate-950 shadow-md flex items-center gap-1.5 min-h-[44px] touch-target font-heading"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">3D Body</span>
              </Link>

              {/* Hamburger Toggle with morphing bars */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-11 h-11 rounded-xl text-slate-300 hover:text-white bg-slate-900/90 border border-slate-700/70 transition flex flex-col items-center justify-center gap-1 shrink-0 cursor-pointer touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                <motion.span
                  className="w-5 h-0.5 bg-current rounded-full"
                  animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-current rounded-full"
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-current rounded-full"
                  animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-in Mobile & Tablet Navigation Drawer (<1024px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-45 lg:hidden"
              aria-hidden="true"
            />

            {/* Slide-in Drawer */}
            <motion.div
              ref={drawerRef}
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] max-w-[90vw] bg-slate-950/98 backdrop-blur-2xl border-l border-slate-800 z-50 p-4 sm:p-6 flex flex-col shadow-2xl overflow-y-auto no-scrollbar lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ice to-cyan-400 p-[1px]">
                    <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                      <span className="font-heading text-sm font-bold text-ice-soft">धा</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-100 font-heading">DHATUPOSHANA</span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-700/70 flex items-center justify-center cursor-pointer touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Search */}
              <form onSubmit={handleSearchSubmit} className="relative mb-5">
                <input
                  type="text"
                  placeholder="Search concepts, Dhatus, Nyayas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-400 border border-slate-700/70 focus:outline-none focus:border-ice focus:ring-1 focus:ring-ice min-h-[44px] font-body"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </form>

              {/* Drawer Links Stagger */}
              <div className="space-y-1.5 flex-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isSelected = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));

                  return (
                    <motion.div key={link.path} variants={itemVariants}>
                      <NavLink
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 transition duration-200 min-h-[44px] touch-target font-heading ${isSelected
                            ? 'bg-ice/20 text-ice-soft border border-ice/40 shadow-sm'
                            : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                          }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-ice' : 'text-slate-400'}`} />
                        <span className="truncate flex-1">{link.name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-ice shrink-0" />
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>

              {/* Drawer Footer / Auth */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-ice-bright to-silver-deep text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow font-heading">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate font-heading">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate font-body">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-ice-soft hover:bg-ice/15 border border-ice/30 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer min-h-[44px] touch-target font-heading"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-center bg-slate-900 border border-slate-700 text-slate-100 hover:bg-slate-800 transition flex items-center justify-center gap-2 min-h-[44px] touch-target font-heading"
                    >
                      <LogIn className="w-4 h-4 text-ice" />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-center bg-gradient-to-r from-ice-bright to-silver-deep text-slate-950 hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-ice/20 min-h-[44px] touch-target font-heading"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}