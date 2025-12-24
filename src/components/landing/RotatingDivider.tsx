import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useScrollAnimation";

const RotatingDivider = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative w-full py-12 sm:py-16 overflow-hidden bg-transparent">
      {/* Animated horizontal line */}
      <div className="absolute inset-0 flex items-center">
        <motion.div 
          className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Center element */}
      <div className="relative flex items-center justify-center">
        {/* Subtle glow */}
        <div className="absolute w-20 h-8 bg-primary/10 rounded-full blur-xl" />
        
        {/* Center dots */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-1 h-1 bg-primary/40 rounded-full"
            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-2 h-2 bg-primary/60 rounded-full shadow-sm shadow-primary/30"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-1 h-1 bg-primary/40 rounded-full"
            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

export default RotatingDivider;
