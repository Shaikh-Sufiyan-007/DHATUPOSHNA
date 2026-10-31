import { useState } from 'react';
import { QUALITY_TIERS } from '../constants/landingTheme.js';

function detectInitialTier() {
  if (typeof window === 'undefined') return QUALITY_TIERS.HIGH;

  try {
    // 1. Check URL override: ?quality=low|medium|high
    const params = new URLSearchParams(window.location.search);
    const queryQuality = params.get('quality')?.toLowerCase();
    if (queryQuality && Object.values(QUALITY_TIERS).includes(queryQuality)) {
      return queryQuality;
    }

    // 2. Mobile and small screens default to LOW or MEDIUM for smooth 60fps
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    if (isMobile || hardwareConcurrency <= 2) {
      return QUALITY_TIERS.LOW;
    }
    if (isTablet || hardwareConcurrency <= 4) {
      return QUALITY_TIERS.MEDIUM;
    }
  } catch {
    // fallback
  }

  return QUALITY_TIERS.HIGH;
}

export function useQualityTier() {
  const [tier] = useState(detectInitialTier);
  return tier;
}
