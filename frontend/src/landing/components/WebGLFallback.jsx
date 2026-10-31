import React from 'react';

export default function WebGLFallback() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-30"
      aria-hidden="true"
    >
      {/* Polished ambient anatomical SVG silhouette on dark slate */}
      <svg
        viewBox="0 0 400 800"
        className="w-full h-full max-w-lg max-h-[85vh] text-[#BFC8D6]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {/* Cranium outline */}
        <circle cx="200" cy="120" r="70" stroke="#7F8FA3" strokeWidth="2" opacity="0.6" />
        <ellipse cx="175" cy="125" rx="16" ry="20" stroke="#6FB3E0" opacity="0.7" />
        <ellipse cx="225" cy="125" rx="16" ry="20" stroke="#6FB3E0" opacity="0.7" />
        <path d="M 195 130 L 200 155 L 205 130 Z" stroke="#BFC8D6" opacity="0.6" />
        <path d="M 170 170 Q 200 185 230 170" stroke="#BFC8D6" strokeWidth="2" opacity="0.5" />

        {/* Straight vertebral column axis */}
        <line x1="200" y1="190" x2="200" y2="600" stroke="#BFC8D6" strokeWidth="3" opacity="0.7" />

        {/* Vertebral disc markers */}
        {[220, 245, 270, 295, 320, 350, 380, 410, 440, 470, 500, 530, 560].map((y) => (
          <g key={y}>
            <ellipse cx="200" cy={y} rx="22" ry="8" stroke="#7F8FA3" opacity="0.6" />
            <line x1="165" y1={y} x2="235" y2={y} stroke="#6FB3E0" opacity="0.4" />
          </g>
        ))}

        {/* Thoracic rib cage arcs */}
        {[250, 280, 310, 340, 370, 400].map((y, i) => (
          <path
            key={y}
            d={`M 200 ${y} Q ${130 - i * 5} ${y + 20} 200 ${y + 40} M 200 ${y} Q ${270 + i * 5} ${y + 20} 200 ${y + 40}`}
            stroke="#BFC8D6"
            strokeWidth="1.2"
            opacity="0.35"
          />
        ))}

        {/* Pelvic girdle */}
        <path
          d="M 150 580 Q 200 550 250 580 Q 230 630 200 620 Q 170 630 150 580 Z"
          stroke="#7F8FA3"
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

