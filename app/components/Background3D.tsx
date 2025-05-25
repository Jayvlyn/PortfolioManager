'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function Background3D() {
  const [windowHeight, setWindowHeight] = useState(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseY]);

  const rotateX = useSpring(useTransform(mouseY, [0, windowHeight], [5, -5]), {
    stiffness: 50,
    damping: 30
  });

  return (
    <div className="fixed inset-0 -z-10">
      <motion.div
        className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800"
        style={{
          rotateX,
          transformPerspective: '1000px'
        }}
      />
    </div>
  );
} 