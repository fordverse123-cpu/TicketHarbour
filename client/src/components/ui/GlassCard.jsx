import React from 'react';

export default function GlassCard({ children, className = '', hover = true, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-harbour-card/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6
        box-shadow-card-glow text-white transition-all duration-300 relative overflow-hidden
        ${hover ? 'hover:-translate-y-1 hover:border-cyanAccent-500/40 hover:shadow-glass-glow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Glossy top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
