import { motion } from "framer-motion";

export const SectionDivider = () => {
  return (
    <div className="relative py-8 sm:py-12 overflow-hidden bg-background">
      {/* Gradient fade top */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent z-10" />
      
      {/* Main divider line */}
      <div className="relative flex items-center justify-center">
        {/* Left line */}
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-primary/40" />
        
        {/* Center rotating element */}
        <div className="relative mx-4 sm:mx-8">
          {/* Outer rotating ring */}
          <motion.div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {/* Dots on ring */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/60" />
          </motion.div>
          
          {/* Inner counter-rotating ring */}
          <motion.div
            className="absolute inset-2 sm:inset-3 rounded-full border border-primary/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-1/2 -right-0.5 -translate-y-1/2 w-1 h-1 rounded-full bg-primary/80" />
          </motion.div>
          
          {/* Center glow */}
          <div className="absolute inset-4 sm:inset-5 rounded-full bg-primary/20 blur-sm" />
          <div className="absolute inset-[18px] sm:inset-[22px] rounded-full bg-primary/40" />
        </div>
        
        {/* Right line */}
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/20 to-primary/40" />
      </div>
      
      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${20 + i * 20}%`,
            top: "50%",
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Gradient fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10" />
    </div>
  );
};
