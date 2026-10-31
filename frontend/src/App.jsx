import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import LoadingState from './components/common/LoadingState.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import PublicRoute from './components/common/PublicRoute.jsx';

// Lazy-loaded pages for optimal bundle splitting and performance
const LandingPage = lazy(() => import('./landing/LandingPage.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Explore3D = lazy(() => import('./pages/Explore3D.jsx'));
const Dhatus = lazy(() => import('./pages/Dhatus.jsx'));
const DhatuDetail = lazy(() => import('./pages/DhatuDetail.jsx'));
const Dhatvagni = lazy(() => import('./pages/Dhatvagni.jsx'));
const DhatvagniDetail = lazy(() => import('./pages/DhatvagniDetail.jsx'));
const Dhatuposhana = lazy(() => import('./pages/Dhatuposhana.jsx'));
const DhatuposhanaDetail = lazy(() => import('./pages/DhatuposhanaDetail.jsx'));
const Nyayas = lazy(() => import('./pages/Nyayas.jsx'));
const NyayaDetail = lazy(() => import('./pages/NyayaDetail.jsx'));
const Concepts = lazy(() => import('./pages/Concepts.jsx'));
const ConceptDetail = lazy(() => import('./pages/ConceptDetail.jsx'));
const Glossary = lazy(() => import('./pages/Glossary.jsx'));
const Quizzes = lazy(() => import('./pages/Quizzes.jsx'));
const QuizDetail = lazy(() => import('./pages/QuizDetail.jsx'));
const References = lazy(() => import('./pages/References.jsx'));
const ReferenceDetail = lazy(() => import('./pages/ReferenceDetail.jsx'));
const Search = lazy(() => import('./pages/Search.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith('/explore')) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
}

// An authenticated visitor never sees the landing page. The gate resolves before
// LandingPage is rendered, so the lazy landing chunk is not even fetched while the
// session is still being verified - no landing flash on refresh or reopen.
function LandingGate({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F16] flex items-center justify-center">
        <LoadingState message="Verifying session..." subtext="Checking authentication status" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full"
      >
        <Routes location={location}>
          {/* Public Landing Page Gateway at / (authenticated sessions skip straight to /home) */}
          <Route
            path="/"
            element={
              <LandingGate>
                <LandingPage />
              </LandingGate>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          <Route element={<ProtectedRoute />}>
            {/* Existing Home Page moved to /home intact */}
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore3D />} />

            <Route path="/dhatus" element={<Dhatus />} />
            <Route path="/dhatus/:id" element={<DhatuDetail />} />

            <Route path="/dhatvagni" element={<Dhatvagni />} />
            <Route path="/dhatvagni/:id" element={<DhatvagniDetail />} />

            <Route path="/dhatuposhana" element={<Dhatuposhana />} />
            <Route path="/dhatuposhana/:id" element={<DhatuposhanaDetail />} />

            <Route path="/nyayas" element={<Nyayas />} />
            <Route path="/nyayas/:id" element={<NyayaDetail />} />

            <Route path="/concepts" element={<Concepts />} />
            <Route path="/concepts/:id" element={<ConceptDetail />} />

            <Route path="/glossary" element={<Glossary />} />

            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/quizzes/:id" element={<QuizDetail />} />

            <Route path="/references" element={<References />} />
            <Route path="/references/:id" element={<ReferenceDetail />} />

            <Route path="/search" element={<Search />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <>
      <ScrollToTop />
      {isLanding ? (
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#0A0F16] flex items-center justify-center">
                <LoadingState message="Entering Ice Crystal Anatomy..." />
              </div>
            }
          >
            <AnimatedRoutes />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <div className="relative min-h-screen flex flex-col bg-[#030712] text-slate-100 selection:bg-ice/30 selection:text-ice-bright overflow-x-hidden">
          {/* Subtle Ambient Background Atmosphere */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 spatial-depth-grid opacity-60" />

            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-ice/12 via-ice-deep/05 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-[28%] -left-32 w-[520px] h-[520px] bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl opacity-75" />
            <div className="absolute top-[55%] -right-32 w-[560px] h-[560px] bg-gradient-to-tl from-purple-500/08 to-transparent rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-10 left-1/3 w-[600px] h-[350px] bg-gradient-to-t from-emerald-500/06 to-transparent rounded-full blur-3xl opacity-50" />
          </div>

          <Navbar />
          {/* Top spacing ensures content is never hidden behind the fixed navbar */}
          <main className="relative z-10 flex-1 pt-20 sm:pt-24">
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingState message="Loading Ayurvedic knowledge..." />
                  </div>
                }
              >
                <AnimatedRoutes />
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}