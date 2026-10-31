import React from 'react';
import { Info } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ice/10 border border-ice/20 text-ice-bright/90 text-xs sm:text-sm font-body">
        <Info className="w-4 h-4 shrink-0 text-ice" />
        <span>Educational resource only • Not medical advice or diagnostic evaluation.</span>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-4 my-4 border-ice/20 bg-ice-deep/20 text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-3 font-body">
      <div className="p-1.5 rounded-lg bg-ice/10 text-ice shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-semibold text-ice-bright text-sm tracking-wide uppercase mb-1 font-heading">
          Educational & Scientific Disclaimer
        </h4>
        <p>
          This platform is intended for educational and informational purposes only. It does not provide medical diagnosis, treatment, or personalized healthcare advice. In accordance with authentic Ayurvedic epistemology, 3D anatomical body regions represent conceptual educational loci rather than claims of literal equivalence between classical Dhatus and singular modern organs.
        </p>
      </div>
    </div>
  );
}