import React from 'react';
import SpotlightCard from '../SpotlightCard';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  category = 'default',
  onClick,
  borderRadius = 16,
  spotlightColor = 'rgba(3, 179, 195, 0.20)',
  showOnFocus = true,
  ...props
}) {
  return (
    <SpotlightCard
      onClick={onClick}
      spotlightColor={spotlightColor}
      showOnFocus={showOnFocus}
      className={`glass-card p-6 h-full w-full relative overflow-hidden rounded-3xl border border-white/10 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      contentClassName="relative z-10 h-full w-full"
      {...props}
    >
      {/* Glossy top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />
      {children}
    </SpotlightCard>
  );
}
