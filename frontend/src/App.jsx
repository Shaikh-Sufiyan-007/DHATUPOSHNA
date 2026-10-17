import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

import Home from './pages/Home.jsx';
import Explore3D from './pages/Explore3D.jsx';
import Dhatus from './pages/Dhatus.jsx';
import DhatuDetail from './pages/DhatuDetail.jsx';
import Dhatvagni from './pages/Dhatvagni.jsx';
import DhatvagniDetail from './pages/DhatvagniDetail.jsx';
import Dhatuposhana from './pages/Dhatuposhana.jsx';
import DhatuposhanaDetail from './pages/DhatuposhanaDetail.jsx';
import Nyayas from './pages/Nyayas.jsx';
import NyayaDetail from './pages/NyayaDetail.jsx';
import Concepts from './pages/Concepts.jsx';
import ConceptDetail from './pages/ConceptDetail.jsx';
import Glossary from './pages/Glossary.jsx';
import Quizzes from './pages/Quizzes.jsx';
import QuizDetail from './pages/QuizDetail.jsx';
import References from './pages/References.jsx';
import ReferenceDetail from './pages/ReferenceDetail.jsx';
import Search from './pages/Search.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import PublicRoute from './components/common/PublicRoute.jsx';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith('/explore')) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="relative min-h-screen flex flex-col bg-[#030712] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 spatial-depth-grid opacity-60" />

            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-amber-500/12 via-amber-600/05 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-[28%] -left-32 w-[520px] h-[520px] bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl opacity-75" />
            <div className="absolute top-[55%] -right-32 w-[560px] h-[560px] bg-gradient-to-tl from-purple-500/08 to-transparent rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-10 left-1/3 w-[600px] h-[350px] bg-gradient-to-t from-emerald-500/06 to-transparent rounded-full blur-3xl opacity-50" />
          </div>

          <Navbar />
          <main className="relative z-10 flex-1">
            <Routes>
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
                <Route path="/" element={<Home />} />
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

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
