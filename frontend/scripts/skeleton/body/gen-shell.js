// Skin shell (silhouette layer, deliberately NOT a Dhatu).
// Derived from the same segment tables as the fat layer, so it encloses every
// internal layer with margin by construction.

import { SEGMENTS, segmentKey, mirroredField, SKIN_BOTTOM_Y } from './frame.js';
import { loftTube, part, fbm } from './mesh-utils.js';

export function buildShell(quality = 'high') {
  const radial = quality === 'high' ? 20 : 12;
  const parts = [];

  const emit = (name, tube, noiseAmp) => {
    const g = loftTube(tube, {
      radial,
      inset: 0,
      capRings: 3,
      noise: { amp: noiseAmp, freq: 26, octaves: 2 },
      seed: name.length * 7.13,
    });
    // Keep the soles off the presentation floor plane.
    const arr = g.attributes.position.array;
    for (let i = 1; i < arr.length; i += 3) {
      if (arr[i] < SKIN_BOTTOM_Y) arr[i] = SKIN_BOTTOM_Y + (SKIN_BOTTOM_Y - arr[i]) * 0.12;
    }
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
    parts.push(part(name, 'shell', 'skin_shell', g));
  };

  for (const seg of SEGMENTS) {
    // Subtle organic undulation on large surfaces, none on digits.
    const amp = /^(finger|toe)/.test(seg.id) ? 0.0004 : 0.0016;
    emit(`skin_${segmentKey(seg)}`, seg.field, amp);
    if (seg.side === 'L') emit(`skin_${seg.id}_R`, mirroredField(seg.field), amp);
  }

  // Face: a soft brow/cheek/jaw relief field is added through fbm only; the
  // brief asks for a believable head form, not facial sculpt detail.
  void fbm;
  return parts;
}
