import React from 'react';

/**
 * Shared PageLoader Component
 * High-contrast, branded loading spinner with pulsing TH badge and accessibility support.
 */
export default function PageLoader({ text = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center min-h-[300px] w-full py-16 px-4 space-y-4 text-center select-none"
    >
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] opacity-30 animate-ping duration-1000 pointer-events-none" />
        
        {/* Rotating border spinner ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-[#03B3C3] border-r-[#6750A2] animate-spin pointer-events-none" />
        
        {/* Central TH Brand Badge */}
        <div className="w-12 h-12 rounded-xl bg-[#111111] border border-white/15 flex items-center justify-center shadow-2xl relative z-10">
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] text-lg">
            TH
          </span>
        </div>
      </div>

      {text && (
        <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] animate-pulse">
          {text}
        </p>
      )}

      {/* Screen Reader Only Announcement */}
      <span className="sr-only">{text}</span>
    </div>
  );
}
