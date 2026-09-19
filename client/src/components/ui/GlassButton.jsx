import React from 'react';

export default function GlassButton({
  children,
  variant = 'gradient',
  size = 'md',
  className = '',
  loading = false,
  icon: Icon,
  disabled,
  ...props
}) {
  const baseStyles = 'rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    gradient: 'bg-gradient-to-r from-cyanAccent-500 to-indigoAccent-600 text-white shadow-lg hover:shadow-cyanAccent-500/25 hover:-translate-y-0.5 hover:scale-[1.02]',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-cyanAccent-500/30 backdrop-blur-md',
    outline: 'bg-transparent border border-cyanAccent-500/50 text-cyanAccent-400 hover:bg-cyanAccent-500/10 hover:border-cyanAccent-400',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/10',
    danger: 'bg-rose-600/80 hover:bg-rose-600 text-white border border-rose-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.gradient} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}
