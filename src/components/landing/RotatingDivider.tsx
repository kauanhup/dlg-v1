import { motion } from "framer-motion";

const RotatingDivider = () => {
  return (
    <div className="relative w-full py-10 sm:py-14 overflow-hidden bg-gradient-to-b from-[hsl(220,20%,6%)] via-background to-background">
      {/* Full width animated glow line */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full">
        <motion.div 
          className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent will-change-transform"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Center element */}
      <div className="relative flex items-center justify-center">
        {/* Glow background */}
        <div className="absolute w-24 h-24 bg-primary/15 rounded-full blur-2xl" />
        
        {/* Outer ring - GPU optimized */}
        <motion.div
          className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-primary/25 will-change-transform"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner ring */}
        <motion.div
          className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-primary/35 will-change-transform"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center dot */}
        <motion.div
          className="relative w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50 will-change-transform"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default RotatingDivider;