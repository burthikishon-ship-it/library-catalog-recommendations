import React, { useState } from 'react';

export default function KietLogo({ className = 'h-10', showSubtitle = false, variant = 'nav' }) {
  const [hasError, setHasError] = useState(false);

  if (variant === 'hero') {
    return (
      <div className="inline-flex flex-col items-center justify-center p-3 rounded-2xl bg-white/95 shadow-2xl border border-slate-700/40 backdrop-blur-md transition-transform hover:scale-105">
        <img
          src="/kiet-logo.png"
          alt="KIET - Kakinada Institute of Engineering & Technology"
          className="h-16 sm:h-20 w-auto object-contain"
          onError={() => setHasError(true)}
        />
        {showSubtitle && (
          <span className="text-[10px] font-bold tracking-wider text-slate-800 uppercase mt-1">
            Kakinada Institute of Engineering & Technology
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Official College Logo Badge */}
      <div className="bg-white p-1.5 rounded-xl shadow-md border border-slate-200/20 flex items-center justify-center shrink-0">
        <img
          src="/kiet-logo.png"
          alt="KIET Logo"
          className={`${className} w-auto object-contain`}
          onError={() => setHasError(true)}
        />
      </div>

      {showSubtitle && (
        <div className="flex flex-col text-left">
          <span className="text-base font-extrabold tracking-tight text-white leading-none">
            KIET <span className="text-brand-400">Library</span>
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Kakinada
          </span>
        </div>
      )}
    </div>
  );
}
