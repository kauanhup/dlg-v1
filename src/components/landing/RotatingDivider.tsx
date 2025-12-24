import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useScrollAnimation";

const RotatingDivider = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative w-full py-16 sm:py-20 overflow-hidden">
      {/* Gradient transition from dark to background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,20%,4%)] via-[hsl(220,18%,8%)] to-background" />
      
      {/* Animated horizontal lines */}
      <div className="absolute inset-0 flex items-center">
        <motion.div 
          className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${15 + i * 18}%`,
              top: "50%",
            }}
            animate={prefersReducedMotion ? {} : {
              y: [-8, 8, -8],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Center diamond element */}
      <div className="relative flex items-center justify-center">
        {/* Glow */}
        <div className="absolute w-32 h-16 bg-primary/10 rounded-full blur-2xl" />
        
        {/* Outer diamond */}
        <motion.div
          className="absolute w-8 h-8 border border-primary/30"
          style={{ rotate: 45 }}
          animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Inner diamond */}
        <motion.div
          className="absolute w-4 h-4 border border-primary/50"
          style={{ rotate: 45 }}
          animate={prefersReducedMotion ? {} : { scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        
        {/* Center dot */}
        <motion.div
          className="relative w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Side accents */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2">
        <motion.div
          className="w-12 h-[1px] bg-gradient-to-r from-transparent to-primary/30"
          animate={prefersReducedMotion ? {} : { opacity: [0.2, 0.5, 0.2], x: [-5, 0, -5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2">
        <motion.div
          className="w-12 h-[1px] bg-gradient-to-l from-transparent to-primary/30"
          animate={prefersReducedMotion ? {} : { opacity: [0.2, 0.5, 0.2], x: [5, 0, 5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default RotatingDivider;
