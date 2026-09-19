import React from 'react';
import BorderGlow from './BorderGlow';
import { useTheme } from '../../context/ThemeContext';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  category = 'default',
  onClick,
  borderRadius = 16,
  ...props
}) {
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const glowProps = {
    backgroundColor: isDark ? '#111111' : '#FFFFFF',
    colors: isDark
      ? ['#03B3C3', '#6750A2', '#D856BF']
      : ['#0891B2', '#4F46E5', '#C026A3'],
    glowColor: isDark ? '185 80 65' : '200 65 50',
    glowRadius: isDark ? 24 : 22,
    glowIntensity: isDark ? 0.55 : 0.40,
    edgeSensitivity: 30,
    coneSpread: 25,
    animated: false,
  };

  return (
    <BorderGlow
      borderRadius={borderRadius}
      className={`h-full w-full ${onClick ? 'cursor-pointer' : ''}`}
      {...glowProps}
    >
      <div
        onClick={onClick}
        className={`
          glass-card p-6 h-full w-full transition-all duration-300 relative overflow-hidden
          ${hover ? 'hover:-translate-y-0.5' : ''}
          ${className}
        `}
        {...props}
      >
        {/* Glossy top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-current opacity-15 to-transparent pointer-events-none z-10" />
        <div className="relative z-10">{children}</div>
      </div>
    </BorderGlow>
  );
}
