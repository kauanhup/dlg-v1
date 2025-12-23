import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send, UserPlus } from "lucide-react";

const floatingFeatures = [
  { icon: Clock, label: "Delay Inteligente", delay: 0, x: 5, y: 18 },
  { icon: Users, label: "Multi-Contas", delay: 0.2, x: 72, y: 6 },
  { icon: Shield, label: "Anti-Ban", delay: 0.4, x: 78, y: 72 },
  { icon: Send, label: "Extração", delay: 0.6, x: 3, y: 68 },
  { icon: UserPlus, label: "Adicionar", delay: 0.8, x: 40, y: 90 },
];

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[240px] xs:max-w-xs sm:max-w-sm lg:max-w-md mx-auto h-[220px] xs:h-[260px] sm:h-[320px] lg:h-[360px] flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 xs:w-40 xs:h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Central glowing orb */}
      <motion.div
        className="relative w-24 h-24 xs:w-28 xs:h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
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
          <div className="absolute -top-0.5 sm:-top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
        </motion.div>
        
        {/* Middle ring */}
        <motion.div
          className="absolute inset-3 xs:inset-4 sm:inset-5 rounded-full border border-primary/25"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {/* Dot on ring */}
          <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/70" />
        </motion.div>
        
        {/* Inner glow */}
        <div className="absolute inset-4 xs:inset-6 sm:inset-8 rounded-full bg-gradient-to-br from-primary/30 via-primary/15 to-transparent blur-xl" />
        
        {/* Telegram airplane */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 drop-shadow-[0_0_20px_rgba(55,174,226,0.5)]"
          >
            <defs>
              <linearGradient id="telegramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#37AEE2" />
                <stop offset="100%" stopColor="#1E96C8" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#telegramGradient)"
              d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating feature badges - Hidden on very small screens */}
      {floatingFeatures.map((item, index) => (
        <motion.div
          key={index}
          className="absolute hidden xs:block"
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
          <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 rounded-lg sm:rounded-xl bg-[hsl(220,20%,8%)]/90 border border-[hsl(220,15%,22%)] shadow-xl backdrop-blur-md hover:border-primary/30 transition-colors">
            <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-md sm:rounded-lg bg-primary/15 flex items-center justify-center">
              <item.icon className="w-2 h-2 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-primary" />
            </div>
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-foreground/90 whitespace-nowrap">{item.label}</span>
          </div>
        </motion.div>
      ))}

      {/* Connection lines - Hidden on very small screens */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden xs:block" style={{ zIndex: -1 }}>
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
          className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-primary/50"
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
