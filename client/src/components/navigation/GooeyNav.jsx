import React, { useState, useEffect, useRef } from 'react';

export default function GooeyNav({ items, activeHref, onItemClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const idx = items.findIndex((item) => item.href === activeHref);
    if (idx !== -1) {
      setActiveIndex(idx);
    }
  }, [activeHref, items]);

  useEffect(() => {
    if (!containerRef.current) return;
    const navElements = containerRef.current.querySelectorAll('.gooey-item');
    if (navElements[activeIndex]) {
      const el = navElements[activeIndex];
      setPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeIndex, items]);

  const handleNavClick = (e, item, idx) => {
    if (onItemClick) {
      onItemClick(e, item);
    }
    setActiveIndex(idx);
  };

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      {/* SVG Filter for Gooey Blob Effect */}
      <svg className="hidden">
        <defs>
          <filter id="gooey-nav-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Floating Active Gooey Pill */}
      <div
        className="absolute top-0 bottom-0 rounded-full transition-all duration-300 ease-out pointer-events-none z-0"
        style={{
          left: `${pillStyle.left}px`,
          width: `${pillStyle.width}px`,
          opacity: pillStyle.opacity,
          background: 'linear-gradient(135deg, #19D3D3 0%, #4F46E5 100%)',
          boxShadow: '0 0 15px rgba(25, 211, 211, 0.4), 0 0 25px rgba(79, 70, 229, 0.3)',
        }}
      >
        {/* Particle accents floating inside active pill */}
        <span className="absolute -top-1 left-1/4 w-1.5 h-1.5 rounded-full bg-[#19D3D3] animate-pulse opacity-75"></span>
        <span className="absolute -bottom-1 right-1/3 w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-ping opacity-60"></span>
        <span className="absolute top-1/2 right-2 w-1 h-1 rounded-full bg-white opacity-80"></span>
      </div>

      {/* Nav List */}
      <nav aria-label="Category navigation" className="relative z-10 flex items-center gap-1 sm:gap-2">
        {items.map((item, idx) => {
          const isActive = idx === activeIndex || item.href === activeHref;
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item, idx)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              tabIndex={0}
              className={`gooey-item relative px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#19D3D3]/40 whitespace-nowrap ${
                isActive
                  ? 'text-white'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
