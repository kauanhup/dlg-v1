import { motion } from "framer-motion";

const RotatingDivider = () => {
  return (
    <div className="relative py-16 sm:py-20 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      
      {/* Main horizontal line */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      </div>
      
      {/* Center element */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle ring */}
        <motion.div
          className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-primary/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner glow */}
        <div className="absolute w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full blur-xl" />
        
        {/* Center dot */}
        <motion.div
          className="relative w-3 h-3 bg-primary/40 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Orbiting dots */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: i * 3.75 }}
            style={{ transformOrigin: "0 0", left: "50%", top: "50%", marginLeft: "-0.75px", marginTop: "-36px" }}
          />
        ))}
      </div>
      
      {/* Side decorative elements */}
      <div className="absolute left-[15%] top-1/2 -translate-y-1/2 hidden md:block">
        <motion.div
          className="w-1 h-1 bg-primary/20 rounded-full"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute right-[15%] top-1/2 -translate-y-1/2 hidden md:block">
        <motion.div
          className="w-1 h-1 bg-primary/20 rounded-full"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
    </div>
  );
};

export default RotatingDivider;