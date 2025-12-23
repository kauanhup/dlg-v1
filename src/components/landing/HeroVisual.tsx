import { motion } from "framer-motion";
import { Users, Zap, Shield, Send, MessageCircle, UserPlus } from "lucide-react";

const floatingIcons = [
  { icon: Users, delay: 0, x: 20, y: 30 },
  { icon: Send, delay: 0.2, x: 80, y: 15 },
  { icon: Shield, delay: 0.4, x: 65, y: 70 },
  { icon: MessageCircle, delay: 0.6, x: 15, y: 65 },
  { icon: UserPlus, delay: 0.8, x: 45, y: 85 },
];

const stats = [
  { value: "50K+", label: "Membros Transferidos", color: "from-green-500 to-emerald-500" },
  { value: "99.9%", label: "Uptime", color: "from-primary to-blue-500" },
  { value: "< 1s", label: "Velocidade", color: "from-yellow-500 to-orange-500" },
];

export const HeroVisual = () => {
  return (
    <div className="relative w-full h-[400px] lg:h-[500px]">
      {/* Central glowing orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 lg:w-64 lg:h-64"
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
          className="absolute inset-4 rounded-full border border-primary/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner glow */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl" />
        
        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/30">
            <Zap className="w-10 h-10 lg:w-14 lg:h-14 text-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -10, 0],
          }}
          transition={{
            opacity: { delay: item.delay + 0.5, duration: 0.5 },
            scale: { delay: item.delay + 0.5, duration: 0.5 },
            y: { delay: item.delay + 1, duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-[hsl(220,20%,10%)] border border-[hsl(220,15%,20%)] flex items-center justify-center shadow-lg backdrop-blur-sm">
            <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
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

      {/* Stats cards */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="bg-[hsl(220,20%,8%)]/90 backdrop-blur-md border border-[hsl(220,15%,18%)] rounded-xl px-4 py-3 lg:px-6 lg:py-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.15, duration: 0.5 }}
          >
            <p className={`text-xl lg:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
            <p className="text-[10px] lg:text-xs text-muted-foreground whitespace-nowrap">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Particle effects */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/50"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
