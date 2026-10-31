import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';

export default function LandingPreloader({ onReady, minDurationMs = 400 }) {
  const { active, progress } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Smoothly step displayProgress towards actual progress
    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        const target = active ? Math.min(progress, 99) : 100;
        if (prev < target) {
          const step = Math.max(1, Math.round((target - prev) * 0.25));
          return Math.min(prev + step, target);
        }
        return prev;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [active, progress]);

  useEffect(() => {
    // When assets finish loading or maximum fallback timeout (4s) triggers
    let fadeTimer;
    let removeTimer;

    const completeLoading = () => {
      setFadingOut(true);
      if (onReady) onReady();
      removeTimer = setTimeout(() => {
        setHidden(true);
      }, 700);
    };

    if (!active && displayProgress >= 100) {
      fadeTimer = setTimeout(completeLoading, minDurationMs);
    }

    // Safety timeout: Never keep the user blocked on preloader if asset stalls
    const safetyTimeout = setTimeout(() => {
      setDisplayProgress(100);
      completeLoading();
    }, 4500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      clearTimeout(safetyTimeout);
    };
  }, [active, displayProgress, minDurationMs, onReady]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0F16] transition-opacity duration-700 ease-out select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={fadingOut}
      aria-live="polite"
      role="status"
    >
      {/* Ambient background glow */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#6FB3E0]/15 via-[#F5A623]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Brand Icon with Pulsing Halo */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6FB3E0]/40 via-[#BFC8D6]/30 to-[#F5A623]/40 p-[1px] shadow-2xl shadow-[#6FB3E0]/25">
          <div className="w-full h-full bg-[#0A0F16] rounded-[15px] flex items-center justify-center overflow-hidden">
            <img
              src="/dhatuposhna_icon.png"
              alt="DHATUPOSHANA"
              width={42}
              height={42}
              className="w-10 h-10 object-contain drop-shadow"
            />
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl border border-[#6FB3E0]/40 animate-ping opacity-30 pointer-events-none" />
      </div>

      {/* Title & Tagline */}
      <h2 className="dp-serif text-xl sm:text-2xl font-bold tracking-[0.16em] text-[#E4EAF2] mb-1.5">
        DHATUPOSHNA
      </h2>
      <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#9AA7B8] font-medium mb-6">
        Initializing 3D Anatomy Experience
      </p>

      {/* Modern Progress Bar */}
      <div className="w-52 sm:w-64 h-1.5 bg-[#151C26] rounded-full overflow-hidden border border-[#BFC8D6]/20 relative shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#6FB3E0] via-[#BFC8D6] to-[#F5A623] rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(111,179,224,0.6)]"
          style={{ width: `${Math.round(displayProgress)}%` }}
        />
      </div>

      {/* Percentage Indicator */}
      <div className="mt-3 text-[11px] font-mono tracking-wider text-[#BFC8D6]/80">
        {Math.round(displayProgress)}%
      </div>
    </div>
  );
}

