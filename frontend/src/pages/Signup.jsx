import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromLocation = location.state?.from;
  const rawPath =
    typeof fromLocation === 'string'
      ? fromLocation
      : fromLocation?.pathname
        ? `${fromLocation.pathname}${fromLocation.search || ''}`
        : '/';
  const redirectPath = (!rawPath || rawPath === '/login' || rawPath === '/signup') ? '/' : rawPath;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (name.trim().length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password
      });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const serverMessage = err.message || 'Registration failed. Please try again.';
      setErrorMessage(serverMessage);

      if (err.errors && Array.isArray(err.errors)) {
        const mappedErrors = {};
        err.errors.forEach((e) => {
          if (e.field) mappedErrors[e.field] = e.message;
        });
        setFieldErrors(mappedErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden animate-spatial-in">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="spatial-dock border border-slate-700/70 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top subtle rim highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/25">
              <div className="w-full h-full bg-slate-950/90 rounded-[15px] flex items-center justify-center text-amber-400">
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Join the Ayurvedic Dhatuposhana platform
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-spatial-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholder="Vaidya Charaka"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm border transition focus:outline-none focus:ring-1 ${fieldErrors.name
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-slate-700 focus:border-amber-400/80 focus:ring-amber-400/40'
                    }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="vaidya@ayurveda.org"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm border transition focus:outline-none focus:ring-1 ${fieldErrors.email
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-slate-700 focus:border-amber-400/80 focus:ring-amber-400/40'
                    }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  placeholder="At least 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm border transition focus:outline-none focus:ring-1 ${fieldErrors.password
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-slate-700 focus:border-amber-400/80 focus:ring-amber-400/40'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm border transition focus:outline-none focus:ring-1 ${fieldErrors.confirmPassword
                      ? 'border-red-500/70 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-slate-700 focus:border-amber-400/80 focus:ring-amber-400/40'
                    }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 hover:opacity-95 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-amber-400 hover:text-amber-300 transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
