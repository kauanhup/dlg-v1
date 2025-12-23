import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send, UserPlus } from "lucide-react";

const floatingFeatures = [
  { icon: Clock, label: "Delay Inteligente", delay: 0, x: 8, y: 20 },
  { icon: Users, label: "Multi-Contas", delay: 0.2, x: 75, y: 8 },
  { icon: Shield, label: "Anti-Ban", delay: 0.4, x: 78, y: 75 },
  { icon: Send, label: "Extração", delay: 0.6, x: 5, y: 70 },
  { icon: UserPlus, label: "Adicionar", delay: 0.8, x: 45, y: 92 },
];

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto h-[280px] sm:h-[320px] lg:h-[360px] flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Central glowing orb */}
      <motion.div
        className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {/* Dot on ring */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
        </motion.div>
        
        {/* Middle ring */}
        <motion.div
          className="absolute inset-4 sm:inset-5 rounded-full border border-primary/25"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {/* Dot on ring */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/70" />
        </motion.div>
        
        {/* Inner glow center */}
        <div className="absolute inset-8 sm:inset-10 lg:inset-12 rounded-full bg-gradient-to-br from-primary/40 via-primary/20 to-transparent blur-lg" />
      </motion.div>

      {/* Floating feature badges */}
      {floatingFeatures.map((item, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ 
            left: `${item.x}%`, 
            top: `${item.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -5, 0],
          }}
          transition={{
            opacity: { delay: item.delay + 0.5, duration: 0.5 },
            scale: { delay: item.delay + 0.5, duration: 0.5 },
            y: { delay: item.delay + 1, duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[hsl(220,20%,8%)]/90 border border-[hsl(220,15%,22%)] shadow-xl backdrop-blur-md hover:border-primary/30 transition-colors">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-primary/15 flex items-center justify-center">
              <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-foreground/90 whitespace-nowrap">{item.label}</span>
          </div>
        </motion.div>
      ))}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {floatingFeatures.map((item, index) => (
          <motion.line
            key={index}
            x1="50%"
            y1="50%"
            x2={`${item.x + 8}%`}
            y2={`${item.y + 3}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: item.delay + 0.8, duration: 0.8 }}
          />
        ))}
      </svg>

      {/* Subtle particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/50"
          style={{
            left: `${40 + Math.random() * 20}%`,
            top: `${40 + Math.random() * 20}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
