import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { useGLTF } from '@react-three/drei';
import LandingNavbar from './components/LandingNavbar.jsx';
import AnatomyCanvas from './components/AnatomyCanvas.jsx';
import WebGLFallback from './components/WebGLFallback.jsx';
import LandingPreloader from './components/LandingPreloader.jsx';
import HeroSection from './components/HeroSection.jsx';
import SpineFeatureCards from './components/SpineFeatureCards.jsx';
import SkeletonRevealSection from './components/SkeletonRevealSection.jsx';
import LearningAreasSection from './components/LearningAreasSection.jsx';
import FinalCtaSection from './components/FinalCtaSection.jsx';
import LandingFooter from './components/LandingFooter.jsx';
import { useScrollScene } from './hooks/useScrollScene.js';
import { useQualityTier } from './hooks/useQualityTier.js';
import { useWebGLSupport } from './hooks/useWebGLSupport.js';
import './styles/landing.css';

// scrollProgress updates on every scroll frame and only the feature cards consume it.
// These siblings take progress-free props, so they must not re-render with it.
const MemoAnatomyCanvas = memo(AnatomyCanvas);
const MemoHeroSection = memo(HeroSection);
const MemoSkeletonRevealSection = memo(SkeletonRevealSection);
const MemoLearningAreasSection = memo(LearningAreasSection);
const MemoFinalCtaSection = memo(FinalCtaSection);

export default function LandingPage() {
  const trackRef = useRef(null);
  const tier = useQualityTier();
  const webglSupported = useWebGLSupport();
  const [isSceneReady, setIsSceneReady] = useState(false);

  const { sceneStateRef, activeCardIndex, currentStage, scrollProgress, reducedMotion } =
    useScrollScene({ trackRef, isReady: isSceneReady });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'DHATUPOSHNA — Diamond Skeleton Anatomy | Immersive 3D Ayurvedic Learning';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Step 4: Idle prefetch for in-app Explore3D assets after landing page is ready
  useEffect(() => {
    if (!isSceneReady) return;

    const prefetchExplore = () => {
      fetch('/models/explore-regions.json').catch(() => {});
      const isMobile = tier === 'low';
      const shellPath = `/models/explore-body-shell${isMobile ? '-lite' : ''}.glb`;
      const skelPath = `/models/explore-skeleton${isMobile ? '-lite' : ''}.glb`;
      const rasaPath = `/models/explore-body-rasa${isMobile ? '-lite' : ''}.glb`;
      useGLTF.preload(shellPath, '/draco/');
      useGLTF.preload(skelPath, '/draco/');
      useGLTF.preload(rasaPath, '/draco/');
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchExplore, { timeout: 3000 });
    } else {
      setTimeout(prefetchExplore, 1800);
    }
  }, [isSceneReady, tier]);

  const handleScrollToSpine = useCallback(() => {
    const spineEl = document.getElementById('section-spine');
    if (spineEl) {
      spineEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  return (
    <div ref={trackRef} className="dp-landing">
      {/* Branded Loading Experience Gate */}
      <LandingPreloader onReady={handleSceneReady} />

      {/* Landing Fixed Navbar */}
      <LandingNavbar currentStage={currentStage} />

      {/* Fixed 3D Canvas / WebGL Fallback */}
      {webglSupported ? (
        <MemoAnatomyCanvas
          sceneStateRef={sceneStateRef}
          tier={tier}
          activeCardIndex={activeCardIndex}
          stage={currentStage}
        />
      ) : (
        <WebGLFallback />
      )}

      {/* Main Content Sections Scrolling Over 3D Canvas */}
      <main id="main-content" className="relative z-10">
        {/* Stage 1 & 2: Hero and Skull Sequence */}
        <MemoHeroSection onScrollToSpine={handleScrollToSpine} />

        {/* Stage 3 & 4: Giant Vertically Straight Spine & 8 Feature Cards */}
        <SpineFeatureCards progress={scrollProgress} reducedMotion={reducedMotion} />

        {/* Stage 5: Full Skeleton Reveal */}
        <MemoSkeletonRevealSection />

        {/* Stage 6: Learning Areas with Dual Knowledge Layers */}
        <MemoLearningAreasSection />

        {/* Stage 7: Final Call to Action */}
        <MemoFinalCtaSection />
      </main>

      {/* Dedicated Landing Footer */}
      <LandingFooter />
    </div>
  );
}

