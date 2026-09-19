import React, { useEffect, useRef, useState } from 'react';

const VARIANTS = {
  default: {
    colors: ['#03B3C3', '#6750A2', '#D856BF', '#F8FAFC'],
    gap: 6,
    speed: 35,
  },
  pink: {
    colors: ['#D856BF', '#6750A2', '#A1A1AA'],
    gap: 6,
    speed: 35,
  },
  blue: {
    colors: ['#03B3C3', '#4F46E5', '#27272A'],
    gap: 6,
    speed: 35,
  },
  yellow: {
    colors: ['#D97706', '#03B3C3', '#27272A'],
    gap: 6,
    speed: 35,
  },
};

export default function PixelCard({
  variant = 'default',
  gap,
  speed,
  colors,
  noHover = false,
  className = '',
  children,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const variantConfig = VARIANTS[variant] || VARIANTS.default;
  const pixelColors = colors || variantConfig.colors;
  const pixelGap = gap || variantConfig.gap;
  const pixelSpeed = speed || variantConfig.speed;

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let pixels = [];
    let width = 0;
    let height = 0;
    let activeOpacity = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;

      // Initialize pixel grid
      const cols = Math.ceil(width / pixelGap);
      const rows = Math.ceil(height / pixelGap);
      pixels = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pixels.push({
            x: c * pixelGap,
            y: r * pixelGap,
            color: pixelColors[Math.floor(Math.random() * pixelColors.length)],
            alpha: 0,
            maxAlpha: Math.random() * 0.4 + 0.2, // Subtle shimmer alpha (0.2 to 0.6 max)
            speed: (Math.random() * 0.05 + 0.02) * (pixelSpeed / 30),
            delay: Math.random() * 20,
          });
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);
    resize();

    const draw = () => {
      if (!ctx || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Smooth opacity ramp up on hover, ramp down on mouseleave
      if (isHovered) {
        activeOpacity = Math.min(activeOpacity + 0.08, 1);
      } else {
        activeOpacity = Math.max(activeOpacity - 0.05, 0);
      }

      if (activeOpacity > 0) {
        for (let i = 0; i < pixels.length; i++) {
          const p = pixels[i];
          if (isHovered) {
            p.alpha = Math.min(p.alpha + p.speed, p.maxAlpha);
          } else {
            p.alpha = Math.max(p.alpha - p.speed * 1.5, 0);
          }

          if (p.alpha > 0) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * activeOpacity;
            ctx.fillRect(p.x, p.y, pixelGap - 1, pixelGap - 1);
          }
        }

        animId = requestAnimationFrame(draw);
      } else {
        // Animation loop stops completely when activeOpacity reaches 0
        ctx.clearRect(0, 0, width, height);
      }
    };

    if (isHovered || activeOpacity > 0) {
      animId = requestAnimationFrame(draw);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [isHovered, pixelColors, pixelGap, pixelSpeed]);

  const handleMouseEnter = () => {
    if (!noHover && window.matchMedia('(hover: hover)').matches) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFocus = () => {
    setIsHovered(true);
  };

  const handleBlur = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Canvas Layer behind content */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 rounded-[inherit]"
        aria-hidden="true"
      />

      {/* Content Layer above canvas */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
