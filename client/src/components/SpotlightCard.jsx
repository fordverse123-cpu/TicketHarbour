import { useRef, useState } from 'react';

const isMouse = (e) => e.pointerType === 'mouse' || e.pointerType === 'pen';

const SpotlightCard = ({
  children,
  className = '',
  contentClassName = 'h-full',
  spotlightColor = 'rgba(3, 179, 195, 0.20)',
  showOnFocus = true,
  ...rest
}) => {
  const ref = useRef(null);
  const hovering = useRef(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const onPointerEnter = (e) => {
    if (!isMouse(e)) return;
    hovering.current = true;
    setOpacity(0.6);
  };

  const onPointerMove = (e) => {
    if (!isMouse(e) || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const onPointerLeave = () => {
    hovering.current = false;
    setOpacity(0);
  };

  const onFocus = (e) => {
    if (!showOnFocus || !ref.current || !e.target.matches(':focus-visible')) return;
    const r = ref.current.getBoundingClientRect();
    setPosition({ x: r.width / 2, y: r.height / 2 });
    setOpacity(0.6);
  };

  const onBlur = () => {
    if (!hovering.current) setOpacity(0);
  };

  return (
    <div
      ref={ref}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`relative ${className}`}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ease-in-out motion-reduce:transition-none"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
};

export default SpotlightCard;
