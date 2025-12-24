import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useScrollAnimation";

export const GridBackground = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle dot grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      
      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Animated scan line - only if not reduced motion */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"
          style={{ willChange: "transform" }}
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
};

export default GridBackground;
