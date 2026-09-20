import React from 'react';

const VARIANTS = {
  primary: 'bg-[#03B3C3]/15 text-[#03B3C3] border-[#03B3C3]/30',
  secondary: 'bg-[#6750A2]/20 text-[#03B3C3] border-[#6750A2]/40',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  neutral: 'bg-white/10 text-slate-300 border-white/15',
};

export default function GlassBadge({
  children,
  variant = 'primary',
  icon: Icon,
  className = '',
}) {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md transition-all ${variantStyles} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
