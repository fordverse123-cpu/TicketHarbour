import React from 'react';
import PixelCardWrapper from './PixelCardWrapper';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  category = 'default',
  variant,
  enablePixel = true,
  onClick,
  ...props
}) {
  const cardContent = (
    <div
      onClick={onClick}
      className={`
        bg-harbour-card/75 backdrop-blur-xl border border-white/10 rounded-2xl p-6
        box-shadow-card-glow text-white transition-all duration-300 relative overflow-hidden
        ${hover ? 'hover:-translate-y-1 hover:border-white/20 hover:shadow-card-glow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Glossy top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />
      <div className="relative z-10">{children}</div>
    </div>
  );

  if (enablePixel) {
    return (
      <PixelCardWrapper category={category} variant={variant} className="rounded-2xl h-full">
        {cardContent}
      </PixelCardWrapper>
    );
  }

  return cardContent;
}
