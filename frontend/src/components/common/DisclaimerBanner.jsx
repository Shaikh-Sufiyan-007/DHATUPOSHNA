import React from 'react';
import { Info } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs">
        <Info className="w-4 h-4 shrink-0 text-amber-400" />
        <span>Educational resource only • Not medical advice or diagnostic evaluation.</span>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-4 my-4 border-amber-500/20 bg-amber-950/20 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-semibold text-amber-200 text-xs tracking-wide uppercase mb-1">
          Educational & Scientific Disclaimer
        </h4>
        <p>
          This platform is intended for educational and informational purposes only. It does not provide medical diagnosis, treatment, or personalized healthcare advice. In accordance with authentic Ayurvedic epistemology, 3D anatomical body regions represent conceptual educational loci rather than claims of literal equivalence between classical Dhatus and singular modern organs.
        </p>
      </div>
    </div>
  );
}
