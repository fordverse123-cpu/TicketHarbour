import React from 'react';

export default function GlassInput({
  label,
  icon: Icon,
  error,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}) {
  return (
    <div className={`space-y-1.5 w-full ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-300 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyanAccent-400 pointer-events-none" />
        )}
        <input
          type={type}
          className={`
            w-full bg-harbour-dark/80 border border-white/15 rounded-xl text-white placeholder-slate-400 text-sm
            ${Icon ? 'pl-10 pr-4' : 'px-4'} py-3
            focus:outline-none focus:border-cyanAccent-500 focus:ring-2 focus:ring-cyanAccent-500/20
            transition-all duration-300 shadow-inner
            ${error ? 'border-rose-500 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
