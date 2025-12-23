import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send, UserPlus } from "lucide-react";

const floatingFeatures = [
  { icon: Clock, label: "Delay Inteligente", delay: 0, x: 12, y: 18 },
  { icon: Users, label: "Multi-Contas", delay: 0.2, x: 85, y: 12 },
  { icon: Shield, label: "Anti-Ban", delay: 0.4, x: 88, y: 65 },
  { icon: Send, label: "Extração", delay: 0.6, x: 8, y: 60 },
  { icon: UserPlus, label: "Adicionar", delay: 0.8, x: 50, y: 85 },
];

export const HeroVisual = () => {
  return (
    <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[380px] flex items-center justify-center">
      {/* Central glowing orb */}
      <motion.div
        className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle ring */}
        <motion.div
          className="absolute inset-3 sm:inset-4 rounded-full border border-primary/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner glow */}
        <div className="absolute inset-5 sm:inset-6 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl" />
        
        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/30">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating feature badges */}
      {floatingFeatures.map((item, index) => (
        <motion.div
          key={index}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${item.x}%`, 
            top: `${item.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -6, 0],
          }}
          transition={{
            opacity: { delay: item.delay + 0.5, duration: 0.5 },
            scale: { delay: item.delay + 0.5, duration: 0.5 },
            y: { delay: item.delay + 1, duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[hsl(220,20%,10%)] border border-[hsl(220,15%,20%)] shadow-lg backdrop-blur-sm">
            <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-[10px] sm:text-xs font-medium text-foreground whitespace-nowrap">{item.label}</span>
          </div>
        </motion.div>
      ))}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {floatingFeatures.map((item, index) => (
          <motion.line
            key={index}
            x1="50%"
            y1="50%"
            x2={`${item.x}%`}
            y2={`${item.y}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: item.delay + 0.8, duration: 0.8 }}
          />
        ))}
      </svg>

      {/* Particle effects */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${35 + Math.random() * 30}%`,
            top: `${35 + Math.random() * 30}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
