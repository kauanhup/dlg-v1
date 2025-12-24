import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useScrollAnimation";
import { useMemo } from "react";

export const FloatingParticles = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Generate particles only once, with reduced count for performance
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 3,
    })), []
  );

  // Don't render if user prefers reduced motion
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/15"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [-15, 15, -15],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
      
      {/* Subtle gradient orbs - reduced blur for performance */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/5 blur-[60px]"
        style={{ willChange: "transform, opacity" }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/5 w-40 h-40 rounded-full bg-blue-500/5 blur-[50px]"
        style={{ willChange: "transform, opacity" }}
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
};

export default FloatingParticles;
