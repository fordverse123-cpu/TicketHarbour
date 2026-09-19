import React, { useRef, useState, useEffect } from 'react';

export default function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '185 80 65',
  backgroundColor = '#111111',
  borderRadius = 16,
  glowRadius = 25,
  glowIntensity = 0.65,
  coneSpread = 25,
  animated = false,
  colors = ['#03B3C3', '#6750A2', '#D856BF'],
  fillOpacity = 0.05,
  ...props
}) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Media query to check if primary input is touch
    const touchMedia = window.matchMedia('(hover: none)');
    setIsTouch(touchMedia.matches);

    const handleTouchChange = (e) => setIsTouch(e.matches);
    touchMedia.addEventListener('change', handleTouchChange);
    return () => touchMedia.removeEventListener('change', handleTouchChange);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouch || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -1000, y: -1000 });
  };

  // Convert colors array to linear gradient string
  const gradientColorsStr = colors.join(', ');

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden group ${className}`}
      style={{
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        minWidth: 0,
      }}
      {...props}
    >
      {/* Subtle border glow overlay */}
      {isHovered && !isTouch && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? glowIntensity : 0,
            background: `radial-gradient(${glowRadius * 8}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowColor.replace(/ /g, ',')}, 0.35) 0%, transparent 80%)`,
          }}
        />
      )}

      {/* Subtle border highlight ring on hover */}
      {isHovered && !isTouch && (
        <div
          className="pointer-events-none absolute inset-0 z-0 border transition-all duration-300"
          style={{
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            borderColor: colors[0],
            boxShadow: `0 0 ${glowRadius}px rgba(${glowColor.replace(/ /g, ',')}, ${glowIntensity * 0.5})`,
          }}
        />
      )}

      {/* Card Content Container */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
