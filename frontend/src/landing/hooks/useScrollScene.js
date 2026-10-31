import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  TOTAL_SPINE_ROTATION_SWEEP,
  SKELETON_CENTER_Y,
  getSkeletonFitCameraDistance,
  SPINE_CARD_PHASE,
  SPINE_CARD_WINDOWS,
  CAMERA_HERO_Y,
  CAMERA_CERVICAL_Y,
  activeSpineCardIndex,
} from '../constants/landingTheme.js';

gsap.registerPlugin(ScrollTrigger);

// Skull-only hero beat, then the alignment/docking beat that ends exactly where the
// sticky card frame becomes pinned. The spine descent then runs across the card phase
// and the rig holds at the coccyx until the skeleton reveal takes over.
const SKULL_ROTATE_END = 0.06;
const DOCK_END = SPINE_CARD_PHASE.start;
const SPINE_HOLD_END = 0.4;
const REVEAL_FADE_END = 0.46;
const REVEAL_CAMERA_END = 0.54;
const SETTLE_END = 0.72;

export function useScrollScene({ trackRef, isReady = true }) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Plain mutable object read directly by Three.js render loop without React re-renders
  const sceneStateRef = useRef({
    // Raw 0..1 scroll position. Everything derived from it (camera, opacities, the
    // feature cards and the particle vortex) is a pure function of this value, so
    // scrubbing up, down or jumping straight to an offset always resolves to the
    // same scene state.
    scrollProgress: 0,
    prefersReducedMotion: false,
    stage: 1,

    // Skull
    skullRotY: 0.2,
    skullOffsetX: 0.12,
    skullTilt: 0.04,
    skullScale: 1.0,
    skullOpacity: 1.0,

    // Spine & Rigid Rig
    spineRotY: 0,
    spineScale: 1.0,
    spineOpacity: 0,

    // Full Skeleton
    skeletonRotY: 0,
    skeletonScale: 1.0,
    skeletonOpacity: 0,

    // Camera & Framing
    cameraX: 0,
    cameraY: CAMERA_HERO_Y, // Cranium focal center for hero view
    cameraZ: 0.85,
    targetX: 0,
    targetY: CAMERA_HERO_Y,
    targetZ: 0,
    fitDistance: 3.0,
  });

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sceneStateRef.current.prefersReducedMotion = prefersReduced;
    setReducedMotion(prefersReduced);

    if (!isReady || !trackRef.current) return;

    const initialAspect = window.innerWidth / Math.max(1, window.innerHeight);
    const initialFitDist = getSkeletonFitCameraDistance(initialAspect);
    sceneStateRef.current.fitDistance = initialFitDist;

    if (prefersReduced) {
      // In reduced motion mode, show stable static poses
      // scrollProgress stays at 0, which parks the particles in their resting shell
      sceneStateRef.current.skullRotY = 0.2;
      sceneStateRef.current.skullOffsetX = 0.12;
      sceneStateRef.current.skullOpacity = 1;
      sceneStateRef.current.spineRotY = 0;
      sceneStateRef.current.spineOpacity = 1;
      sceneStateRef.current.skeletonOpacity = 1;
      return;
    }

    const state = sceneStateRef.current;

    // Master ScrollTrigger timeline scrubbing across the full container track
    const ctx = gsap.context(() => {
      const currentAspect = window.innerWidth / Math.max(1, window.innerHeight);
      const fitDist = getSkeletonFitCameraDistance(currentAspect);
      state.fitDistance = fitDist;

      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            state.scrollProgress = p;

            // Discrete active stages
            let s = 1;
            if (p < SKULL_ROTATE_END) s = 1;      // Stage 1: Hero Cranium View
            else if (p < DOCK_END) s = 2;         // Stage 2: Skull Alignment & Docking onto C1
            else if (p < SPINE_HOLD_END) s = 4;   // Stage 3 & 4: Spine Descent + 8 Feature Cards
            else if (p < REVEAL_CAMERA_END) s = 5; // Stage 5: Full Skeleton Reveal
            else s = 6;                            // Stage 6 & 7: Learning Areas & Final CTA
            state.stage = s;
            setCurrentStage(s);

            // Same progress source the cards use, so the 3D highlight cannot drift
            setActiveCardIndex(activeSpineCardIndex(p));
            setScrollProgress(p);
          },
        },
      });

      // =========================================================================
      // STAGE 1: HERO VIEW (0.00 -> 0.06)
      // Skull rotates clockwise with scroll; camera focused at cranium (Y = 1.61)
      // =========================================================================
      masterTl
        .to(state, {
          skullRotY: 1.80,
          duration: SKULL_ROTATE_END,
          ease: 'power1.inOut',
        }, 0);

      // =========================================================================
      // STAGE 2: ALIGNMENT & RIGID DOCKING ONTO C1 (0.06 -> 0.112)
      // Skull smoothly centers (X -> 0, tilt -> 0) and settles onto C1 atlas.
      // Spine fades in; camera moves to the cervical top so the descent can start
      // the moment the sticky card frame pins.
      // =========================================================================
      masterTl
        .to(state, {
          skullOffsetX: 0.0,
          skullTilt: 0.0,
          skullRotY: 0.0,
          duration: DOCK_END - SKULL_ROTATE_END,
          ease: 'power2.inOut',
        }, SKULL_ROTATE_END)
        .to(state, {
          spineOpacity: 1.0,
          duration: DOCK_END - SKULL_ROTATE_END,
          ease: 'power2.out',
        }, SKULL_ROTATE_END)
        .to(state, {
          cameraY: CAMERA_CERVICAL_Y,
          targetY: CAMERA_CERVICAL_Y,
          duration: DOCK_END - SKULL_ROTATE_END,
          ease: 'power2.inOut',
        }, SKULL_ROTATE_END);

      // =========================================================================
      // STAGE 3 & 4: SPINE CAMERA DESCENT & CLOCKWISE ROTATION (0.112 -> 0.40)
      // The spine itself stays fixed at anatomical origin (0, 0, 0); the camera
      // descends. Rotation is linear across the whole phase.
      // =========================================================================
      masterTl
        .to(state, {
          spineRotY: -TOTAL_SPINE_ROTATION_SWEEP,
          duration: SPINE_HOLD_END - DOCK_END,
          ease: 'none',
        }, DOCK_END);

      // Camera walk-down: one linear segment per card window, so the camera sits on
      // each card's own vertebra exactly at that card's peak. Mirrors spineCameraYAt().
      SPINE_CARD_WINDOWS.forEach((window, i) => {
        const fromTime = i === 0 ? SPINE_CARD_PHASE.start : SPINE_CARD_WINDOWS[i - 1].peak;

        masterTl.to(state, {
          cameraY: window.anchorY,
          targetY: window.anchorY,
          duration: window.peak - fromTime,
          ease: 'none',
        }, fromTime);
      });

      masterTl.to(state, {
        cameraY: 0.74,
        targetY: 0.74,
        duration: SPINE_CARD_PHASE.end - SPINE_CARD_WINDOWS[SPINE_CARD_WINDOWS.length - 1].peak,
        ease: 'none',
      }, SPINE_CARD_WINDOWS[SPINE_CARD_WINDOWS.length - 1].peak);

      // =========================================================================
      // STAGE 5: FULL SKELETON REVEAL (0.40 -> 0.54)
      // Camera pulls back dynamically to frame the ENTIRE standing skeleton from
      // skull to feet soles; target moves to the skeleton centre (Y = 0.864).
      // Seamless crossfade: spine + skull rig fades out as the full skeleton fades in.
      // =========================================================================
      masterTl
        .to(state, {
          spineOpacity: 0.0,
          skullOpacity: 0.0,
          duration: REVEAL_FADE_END - SPINE_HOLD_END,
          ease: 'power1.out',
        }, SPINE_HOLD_END)
        .to(state, {
          skeletonOpacity: 1.0,
          duration: REVEAL_FADE_END - SPINE_HOLD_END,
          ease: 'power1.in',
        }, SPINE_HOLD_END)
        .to(state, {
          cameraY: SKELETON_CENTER_Y,
          targetY: SKELETON_CENTER_Y,
          cameraZ: fitDist,
          duration: REVEAL_CAMERA_END - SPINE_HOLD_END,
          ease: 'power2.out',
        }, SPINE_HOLD_END);

      // =========================================================================
      // STAGE 6 & 7: LEARNING AREAS & FINAL CTA (0.54 -> 0.72)
      // Full skeleton settles as a dim silver presence in the background
      // =========================================================================
      masterTl
        .to(state, {
          skeletonOpacity: 0.22,
          cameraZ: fitDist + 0.35,
          duration: SETTLE_END - REVEAL_CAMERA_END,
          ease: 'power1.out',
        }, REVEAL_CAMERA_END);

      // =========================================================================
      // TIMELINE CALIBRATION (0.72 -> 1.00)
      // ScrollTrigger seeks the scrubbed animation by its *progress*, so a child
      // placed at time T lands at scroll progress T / duration. Every beat above is
      // written in raw scroll-progress units, which only holds if the total duration
      // is exactly 1 - otherwise the whole sequence is compressed (a 0.72 duration
      // made the spine descent finish at progress 0.46 instead of 0.332 and the cards
      // and the camera could never agree). This hold keeps skullScale parked and
      // stretches the timeline to 1 second of scroll.
      // =========================================================================
      masterTl.to(state, {
        skullScale: 1.0,
        duration: 1 - SETTLE_END,
        ease: 'none',
      }, SETTLE_END);
    });

    // Handle responsive resize: recalculate dynamic skeleton framing distance
    const handleResize = () => {
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const newFitDist = getSkeletonFitCameraDistance(aspect);
      state.fitDistance = newFitDist;
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [trackRef, isReady]);

  return {
    sceneStateRef,
    activeCardIndex,
    currentStage,
    scrollProgress,
    reducedMotion,
  };
}
