import { motion } from "framer-motion";
import { Users, Zap, Shield, Send, MessageCircle, UserPlus } from "lucide-react";

const floatingIcons = [
  { icon: Users, delay: 0, x: 12, y: 18 },
  { icon: Send, delay: 0.2, x: 78, y: 12 },
  { icon: Shield, delay: 0.4, x: 72, y: 58 },
  { icon: MessageCircle, delay: 0.6, x: 8, y: 52 },
  { icon: UserPlus, delay: 0.8, x: 45, y: 72 },
];

const stats = [
  { value: "50K+", label: "Membros", color: "from-green-500 to-emerald-500" },
  { value: "99.9%", label: "Uptime", color: "from-primary to-blue-500" },
  { value: "< 1s", label: "Velocidade", color: "from-yellow-500 to-orange-500" },
];

export const HeroVisual = () => {
  return (
    <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] flex items-center justify-center">
      {/* Central glowing orb */}
      <motion.div
        className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-56 lg:h-56"
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
        <div className="absolute inset-6 sm:inset-8 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl" />
        
        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-14 h-14 sm:w-18 sm:h-18 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/30">
            <Zap className="w-7 h-7 sm:w-9 sm:h-9 lg:w-12 lg:h-12 text-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating icons - positioned relative to the visual center */}
      {floatingIcons.map((item, index) => (
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
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { delay: item.delay + 0.5, duration: 0.5 },
            scale: { delay: item.delay + 0.5, duration: 0.5 },
            y: { delay: item.delay + 1, duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-[hsl(220,20%,10%)] border border-[hsl(220,15%,20%)] flex items-center justify-center shadow-lg backdrop-blur-sm">
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 text-primary" />
          </div>
        </motion.div>
      ))}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(211, 100%, 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {floatingIcons.map((item, index) => (
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

      {/* Stats cards - positioned at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex justify-center gap-2 sm:gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="bg-[hsl(220,20%,8%)]/90 backdrop-blur-md border border-[hsl(220,15%,18%)] rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.15, duration: 0.5 }}
          >
            <p className={`text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-muted-foreground whitespace-nowrap">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Particle effects */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/50"
          style={{
            left: `${25 + Math.random() * 50}%`,
            top: `${25 + Math.random() * 50}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
