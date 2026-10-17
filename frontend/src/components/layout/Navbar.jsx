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
    <header className="sticky top-2 sm:top-3.5 z-50 mx-3 sm:mx-6 lg:mx-8 xl:mx-auto max-w-[1880px] spatial-dock rounded-2xl border border-slate-700/60 transition-all duration-300">
      <div className="w-full px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-400 p-[1px] shadow-lg shadow-amber-500/15 group-hover:shadow-amber-500/35 transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950/90 backdrop-blur-md rounded-[11px] flex items-center justify-center">
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
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-sm">
                  Spatial 3D
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Sapta Dhatu Knowledge Platform
              </p>
            </div>
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-60 lg:w-72 xl:w-80 group"
          >
            <input
              type="text"
              placeholder="Search Dhatu, Agni, Nyaya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-900/75 text-slate-100 placeholder-slate-400 border border-slate-700/70 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 shadow-inner transition duration-200"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-400 absolute left-3 pointer-events-none transition" />
            <span className="absolute right-2.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60 pointer-events-none">
              /
            </span>
          </form>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${isActive
                      ? 'bg-amber-500/18 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : link.highlight
                        ? 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/12 border border-cyan-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800/80">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-xs shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[110px] truncate text-slate-200 font-medium">
                    {user?.name || 'User'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition flex items-center gap-1.5 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-700/60 transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:opacity-95 shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/explore"
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Body</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 border border-slate-700/70 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 shadow-2xl animate-spatial-in">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search concepts, Dhatus, Nyayas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-slate-900/90 text-slate-100 border border-slate-700/80 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
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
                    `px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-200 ${isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-800/80">
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-100 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center gap-1.5 ml-2 shrink-0 cursor-pointer"
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
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-center bg-slate-900 border border-slate-700/80 text-slate-200 hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-center bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
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
