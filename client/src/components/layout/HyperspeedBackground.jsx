import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const DEFAULT_HYPERSPEED_OPTIONS = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  },
};

export default function HyperspeedBackground({ options = DEFAULT_HYPERSPEED_OPTIONS }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      console.warn('WebGL not supported for Hyperspeed canvas, falling back to CSS dark gradient.', e);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(options.colors.background);

    const camera = new THREE.PerspectiveCamera(
      options.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      options.length
    );
    camera.position.set(0, 3, -10);
    camera.lookAt(0, 0, 100);

    // Create Road & Light Stick particles geometry
    const isMobile = window.innerWidth < 768;
    const stickCount = isMobile ? 10 : options.totalSideLightSticks;
    const lightPairs = isMobile ? 20 : options.lightPairsPerRoadWay;

    // Side Light Sticks Geometry
    const sticksGeo = new THREE.BufferGeometry();
    const stickPositions = new Float32Array(stickCount * 6); // 2 points per stick
    for (let i = 0; i < stickCount; i++) {
      const z = (i / stickCount) * options.length;
      const side = i % 2 === 0 ? -12 : 12;
      stickPositions[i * 6] = side;
      stickPositions[i * 6 + 1] = 0;
      stickPositions[i * 6 + 2] = z;

      stickPositions[i * 6 + 3] = side;
      stickPositions[i * 6 + 4] = 4;
      stickPositions[i * 6 + 5] = z;
    }
    sticksGeo.setAttribute('position', new THREE.BufferAttribute(stickPositions, 3));
    const sticksMat = new THREE.LineBasicMaterial({
      color: options.colors.sticks,
      transparent: true,
      opacity: 0.7,
    });
    const sticksMesh = new THREE.LineSegments(sticksGeo, sticksMat);
    scene.add(sticksMesh);

    // Left & Right Car Light Trails Geometry
    const trailsGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(lightPairs * 6);
    for (let i = 0; i < lightPairs; i++) {
      const z = (i / lightPairs) * options.length;
      const xLeft = -4 - (i % 3) * 1.5;
      trailPositions[i * 6] = xLeft;
      trailPositions[i * 6 + 1] = 0.5;
      trailPositions[i * 6 + 2] = z;

      const xRight = 4 + (i % 3) * 1.5;
      trailPositions[i * 6 + 3] = xRight;
      trailPositions[i * 6 + 4] = 0.5;
      trailPositions[i * 6 + 5] = z;
    }
    trailsGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailsMat = new THREE.PointsMaterial({
      color: 0x03b3c3,
      size: 1.5,
      transparent: true,
      opacity: 0.8,
    });
    const trailsPoints = new THREE.Points(trailsGeo, trailsMat);
    scene.add(trailsPoints);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Forward motion shift
      const speed = isMobile ? 0.8 : options.speedUp;
      const positions = trailsGeo.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 2] -= speed * 2;
        if (positions[i * 3 + 2] < 0) {
          positions[i * 3 + 2] += options.length;
        }
      }
      trailsGeo.attributes.position.needsUpdate = true;

      // Gentle camera sway
      camera.position.x = Math.sin(elapsedTime * 0.5) * 0.4;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup WebGL resources cleanly
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sticksGeo.dispose();
      sticksMat.dispose();
      trailsGeo.dispose();
      trailsMat.dispose();
    };
  }, [options]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-[#000000]"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
