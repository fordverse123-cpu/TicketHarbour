import React, { useState, useEffect, useRef } from 'react';
import { GalleryHeading } from '../shaders/neuform-isolated/NeuformIsolatedEffects';
import '../shaders/threeui.css';

export default function AppLoader({
  visible = false,
  mode = 'fullscreen',
  text = 'Loading TicketHarbour...',
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const showTimerRef = useRef(null);
  const minDurationTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // 150ms debounce before showing to prevent flashing on instant loads
      showTimerRef.current = setTimeout(() => {
        setShouldRender(true);
        startTimeRef.current = Date.now();
      }, 150);
    } else {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);

      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remainingMin = Math.max(0, 300 - elapsed);
        minDurationTimerRef.current = setTimeout(() => {
          setShouldRender(false);
          startTimeRef.current = null;
        }, remainingMin);
      } else {
        setShouldRender(false);
      }
    }

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (minDurationTimerRef.current) clearTimeout(minDurationTimerRef.current);
    };
  }, [visible]);

  // Lock body scroll only when fullscreen loader is visible
  useEffect(() => {
    if (shouldRender && mode === 'fullscreen') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [shouldRender, mode]);

  if (!shouldRender) return null;

  if (mode === 'fullscreen') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-xl pointer-events-auto"
      >
        <span className="sr-only">{text}</span>
        <div className="w-full max-w-2xl h-64 flex items-center justify-center px-4">
          <GalleryHeading
            variant="horizontal-sweep"
            mode="dark"
            font="oldstyle"
            weight="700"
            headlineSize={1.2}
            hue={0}
            saturation={1.0}
            brightness={1.0}
          />
        </div>
      </div>
    );
  }

  // Contained mode for card/result lists
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505]/85 backdrop-blur-md rounded-3xl min-h-[320px] pointer-events-auto"
    >
      <span className="sr-only">{text}</span>
      <div className="w-full max-w-xl h-56 flex items-center justify-center px-4">
        <GalleryHeading
          variant="horizontal-sweep"
          mode="dark"
          font="oldstyle"
          weight="700"
          headlineSize={1.1}
          hue={0}
          saturation={1.0}
          brightness={1.0}
        />
      </div>
    </div>
  );
}
