import React, { useState, useEffect, useCallback, lazy, Suspense, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';

const AeroShards = lazy(() => import('../ui/AeroShards'));

const DESKTOP_PROPS = {
  backgroundColor: '#050505',
  shardColor: '#6750A2',
  accentColor: '#03B3C3',
  placement: 'full',
  flow: 'stream',
  material: 'pearl',
  detail: 'balanced',
  effect: 'none',
  density: 1,
  speed: 0.6,
  spin: 0.6,
  glow: 0.8,
  bloom: 0.3,
  grain: 0.02,
  chromaticAberration: 0.004,
  interaction: 'repel',
  interactionStrength: 0.3,
  interactionRadius: 1.2,
  rippleIntensity: 0,
  holdToGather: false,
};

const TOUCH_PROPS = {
  backgroundColor: '#050505',
  shardColor: '#6750A2',
  accentColor: '#03B3C3',
  placement: 'full',
  flow: 'stream',
  material: 'pearl',
  detail: 'balanced',
  effect: 'none',
  density: 0.6,
  speed: 0.6,
  spin: 0.6,
  glow: 0.8,
  bloom: 0.2,
  grain: 0,
  chromaticAberration: 0,
  interaction: 'none',
  rippleIntensity: 0,
  holdToGather: false,
};

const FALLBACK_GRADIENT =
  'radial-gradient(circle at top, rgba(103,80,162,0.25), transparent 45%), radial-gradient(circle at bottom right, rgba(3,179,195,0.12), transparent 45%), #050505';

class BackgroundErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const subscribeCompact = (callback) => {
  if (typeof window === 'undefined') return () => {};
  const media = window.matchMedia('(max-width: 767px), (pointer: coarse)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};

const getCompactSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
};

const getCompactServerSnapshot = () => false;

function useIsCompact() {
  return useSyncExternalStore(subscribeCompact, getCompactSnapshot, getCompactServerSnapshot);
}

function useOverlayOpacity() {
  const location = useLocation();
  const pathname = location.pathname;

  const isDataDense =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/super-admin') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/profile' ||
    pathname === '/my-bookings' ||
    pathname === '/checkout';

  return isDataDense ? 0.55 : 0.35;
}

const AeroShardsBackground = React.memo(function AeroShardsBackground() {
  const [failed, setFailed] = useState(false);
  const [canUseWebGPU, setCanUseWebGPU] = useState(false);
  const isCompact = useIsCompact();
  const overlayOpacity = useOverlayOpacity();

  useEffect(() => {
    let active = true;
    try {
      if (typeof navigator !== 'undefined' && 'gpu' in navigator && navigator.gpu) {
        navigator.gpu
          .requestAdapter()
          .then((adapter) => {
            if (active) {
              if (adapter) {
                setCanUseWebGPU(true);
              } else {
                setFailed(true);
              }
            }
          })
          .catch(() => {
            if (active) setFailed(true);
          });
      } else {
        if (active) setFailed(true);
      }
    } catch (e) {
      if (active) setFailed(true);
    }
    return () => {
      active = false;
    };
  }, []);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  const shardProps = isCompact ? TOUCH_PROPS : DESKTOP_PROPS;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh] overflow-hidden"
      aria-hidden="true"
    >
      {/* Static Fallback Gradient Layer */}
      <div
        className="absolute inset-0"
        style={{ background: FALLBACK_GRADIENT }}
      />

      {/* WebGPU AeroShards Layer */}
      {canUseWebGPU && !failed && (
        <BackgroundErrorBoundary onError={handleError}>
          <Suspense fallback={null}>
            <div className="absolute inset-0">
              <AeroShards {...shardProps} onError={handleError} />
            </div>
          </Suspense>
        </BackgroundErrorBoundary>
      )}

      {/* Readability Overlay Layer */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />
    </div>
  );
});

export default AeroShardsBackground;
