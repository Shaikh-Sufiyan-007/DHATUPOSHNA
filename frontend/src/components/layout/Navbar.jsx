import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-cyan-400 p-[1px] shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/25 transition">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <span className="font-classical text-lg font-bold bg-gradient-to-r from-amber-300 via-amber-100 to-cyan-200 bg-clip-text text-transparent">
                  धा
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-100 font-heading">
                  DHATUPOSHANA
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Ayur3D
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Sapta Dhatu Knowledge Platform
              </p>
            </div>
          </Link>

          {/* Search bar (desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-64 lg:w-72"
          >
            <input
              type="text"
              placeholder="Search Dhatu, Agni, Nyaya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-900/90 text-slate-200 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden ml-2 lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : link.highlight
                        ? 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800/80">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/70 text-xs">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[110px] truncate text-slate-200 font-medium">
                    {user?.name || 'User'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition flex items-center gap-1.5 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-95 shadow-sm shadow-amber-500/10 transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/explore"
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm"
            >
              3D Body
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search concepts, Dhatus, Nyayas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-900 text-slate-200 border border-slate-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Mobile Drawer Auth Controls */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
                    <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition flex items-center gap-1 ml-2 flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-center bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-center bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-95 transition flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
