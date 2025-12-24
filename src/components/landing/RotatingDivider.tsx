import { motion } from "framer-motion";

const RotatingDivider = () => {
  return (
    <div className="relative py-12 sm:py-16 overflow-hidden bg-gradient-to-b from-[hsl(220,20%,6%)] via-background to-background">
      {/* Animated glow line */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
        <motion.div 
          className="h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Center element */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          className="absolute w-32 h-32 bg-primary/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Outer ring */}
        <motion.div
          className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary/60 rounded-full" />
        </motion.div>
        
        {/* Inner ring */}
        <motion.div
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-primary/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary/80 rounded-full" />
        </motion.div>
        
        {/* Center pulsing dot */}
        <motion.div
          className="relative w-4 h-4 bg-primary rounded-full shadow-lg shadow-primary/50"
          animate={{ scale: [1, 1.3, 1], boxShadow: ["0 0 20px hsl(var(--primary) / 0.5)", "0 0 40px hsl(var(--primary) / 0.8)", "0 0 20px hsl(var(--primary) / 0.5)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Side particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full hidden sm:block"
          style={{ 
            left: `${15 + i * 14}%`, 
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}
    </div>
  );
};

export default RotatingDivider;