import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send, Monitor, Rocket } from "lucide-react";

// Floating badge with enhanced animations
const Badge = ({ 
  icon: Icon, 
  label, 
  delay,
  floatOffset = 0
}: { 
  icon: React.ElementType; 
  label: string; 
  delay: number;
  floatOffset?: number;
}) => (
  <motion.div
    className="group relative flex items-center gap-2 px-3 py-2 rounded-xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg cursor-default overflow-hidden"
    initial={{ opacity: 0, scale: 0.5, y: 30, rotate: -10 }}
    animate={{ 
      opacity: 1, 
      scale: 1, 
      y: [0, -6, 0],
      rotate: 0
    }}
    transition={{ 
      opacity: { duration: 0.4, delay },
      scale: { duration: 0.5, delay, type: "spring", stiffness: 300, damping: 15 },
      rotate: { duration: 0.5, delay },
      y: {
        duration: 3 + floatOffset,
        delay: delay + 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }}
    whileHover={{ 
      scale: 1.12, 
      y: -8,
      boxShadow: "0 12px 40px -8px hsl(var(--primary) / 0.5)",
      borderColor: "hsl(var(--primary) / 0.8)"
    }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Animated gradient border */}
    <motion.div
      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), transparent, hsl(var(--primary) / 0.2))",
        backgroundSize: "200% 200%"
      }}
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
    
    {/* Shimmer sweep effect */}
    <motion.div
      className="absolute inset-0 -translate-x-full"
      style={{
        background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.15), transparent)"
      }}
      animate={{ x: ["-100%", "200%"] }}
      transition={{
        duration: 2,
        delay: delay + 2,
        repeat: Infinity,
        repeatDelay: 4,
        ease: "easeInOut"
      }}
    />
    
    {/* Icon container with multi-layer effects */}
    <motion.div 
      className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
      animate={{ 
        boxShadow: [
          "0 0 0 0 hsl(var(--primary) / 0.4)",
          "0 0 0 8px hsl(var(--primary) / 0)",
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: delay + 1,
        ease: "easeOut"
      }}
    >
      {/* Inner glow */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-primary/20"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        animate={{ 
          rotate: [0, 8, -8, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: delay,
          ease: "easeInOut"
        }}
      >
        <Icon className="w-4 h-4 text-primary relative z-10" />
      </motion.div>
    </motion.div>
    
    <span className="relative text-xs font-semibold text-foreground whitespace-nowrap">{label}</span>
    
    {/* Sparkle effect */}
    <motion.div
      className="absolute top-1 right-2 w-1 h-1 rounded-full bg-primary"
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0]
      }}
      transition={{
        duration: 1.5,
        delay: delay + 3,
        repeat: Infinity,
        repeatDelay: 3
      }}
    />
  </motion.div>
);

// Enhanced animated line with multiple energy particles
const AnimatedLine = ({ 
  d, 
  delay 
}: { 
  d: string; 
  delay: number;
}) => (
  <g>
    {/* Base line with gradient */}
    <motion.path 
      d={d}
      stroke="url(#branchGrad)" 
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
    />
    
    {/* Glowing overlay line */}
    <motion.path 
      d={d}
      stroke="url(#branchGradBright)" 
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: 1, 
        opacity: [0, 0.6, 0.3]
      }}
      transition={{ 
        pathLength: { duration: 1.2, delay },
        opacity: { duration: 2, delay: delay + 1, repeat: Infinity, ease: "easeInOut" }
      }}
      style={{ filter: "blur(3px)" }}
    />
    
    {/* Primary energy particle */}
    <motion.circle
      r="4"
      fill="hsl(var(--primary))"
      style={{ filter: "blur(1px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 2,
        delay: delay + 1.5,
        repeat: Infinity,
        repeatDelay: 2.5,
        ease: "easeInOut"
      }}
    >
      <animateMotion
        dur="2s"
        repeatCount="indefinite"
        begin={`${delay + 1.5}s`}
        path={d}
      />
    </motion.circle>
    
    {/* Secondary smaller particle */}
    <motion.circle
      r="2"
      fill="hsl(var(--primary))"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.7, 0.7, 0] }}
      transition={{
        duration: 2,
        delay: delay + 2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut"
      }}
    >
      <animateMotion
        dur="2s"
        repeatCount="indefinite"
        begin={`${delay + 2}s`}
        path={d}
      />
    </motion.circle>
  </g>
);

// Enhanced pulsing node with sparkle
const PulsingDot = ({ 
  cx, 
  cy, 
  delay 
}: { 
  cx: number; 
  cy: number; 
  delay: number;
}) => (
  <g>
    {/* Outer pulse ring 1 */}
    <motion.circle 
      cx={cx} 
      cy={cy} 
      r="4" 
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="1"
      initial={{ scale: 1, opacity: 0 }}
      animate={{ 
        scale: [1, 3, 4],
        opacity: [0.5, 0.2, 0]
      }}
      transition={{
        duration: 2.5,
        delay: delay + 0.3,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeOut"
      }}
    />
    
    {/* Outer pulse ring 2 (offset) */}
    <motion.circle 
      cx={cx} 
      cy={cy} 
      r="4" 
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="0.5"
      initial={{ scale: 1, opacity: 0 }}
      animate={{ 
        scale: [1, 2.5, 3.5],
        opacity: [0.4, 0.15, 0]
      }}
      transition={{
        duration: 2.5,
        delay: delay + 1.3,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeOut"
      }}
    />
    
    {/* Core dot with glow */}
    <motion.circle 
      cx={cx} 
      cy={cy} 
      r="5" 
      fill="hsl(var(--primary))" 
      fillOpacity="0.9"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: 1
      }}
      transition={{ 
        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        opacity: { delay, duration: 0.3 }
      }}
      style={{ filter: "blur(0.5px)" }}
    />
    
    {/* Inner bright core */}
    <motion.circle 
      cx={cx} 
      cy={cy} 
      r="2" 
      fill="white" 
      fillOpacity="0.8"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: delay + 0.1, type: "spring", stiffness: 400 }}
    />
  </g>
);

// Floating particle component
const FloatingParticle = ({ 
  startX, 
  startY, 
  delay 
}: { 
  startX: number; 
  startY: number; 
  delay: number;
}) => (
  <motion.circle
    cx={startX}
    cy={startY}
    r="1.5"
    fill="hsl(var(--primary))"
    fillOpacity="0.6"
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      cy: [startY, startY - 30],
      cx: [startX, startX + (Math.random() - 0.5) * 20]
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeOut"
    }}
  />
);

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[380px] lg:max-w-[420px] mx-auto h-[360px] sm:h-[400px] flex items-center justify-center">
      {/* Animated ambient glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-48 h-48 rounded-full bg-primary/20 blur-[70px]" />
      </motion.div>
      
      {/* Secondary rotating glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-36 h-36 rounded-full bg-gradient-to-r from-primary/15 via-transparent to-primary/15 blur-[50px]" />
      </motion.div>
      
      {/* Tertiary pulsing glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [-180, 180]
        }}
        transition={{
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 25, repeat: Infinity, ease: "linear" }
        }}
      >
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-[40px]" />
      </motion.div>

      {/* Mind map SVG lines */}
      <svg 
        className="absolute inset-0 w-full h-full hidden sm:block" 
        viewBox="0 0 420 400"
        fill="none"
      >
        <defs>
          <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="branchGradBright" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g filter="url(#glow)">
          <AnimatedLine d="M 210 200 C 260 180, 300 120, 360 90" delay={0.1} />
          <AnimatedLine d="M 210 200 C 280 190, 330 170, 380 160" delay={0.15} />
          <AnimatedLine d="M 210 200 C 290 200, 340 230, 390 250" delay={0.2} />
          <AnimatedLine d="M 210 200 C 260 230, 300 290, 360 320" delay={0.25} />
          <AnimatedLine d="M 210 200 C 150 180, 100 140, 50 120" delay={0.3} />
          <AnimatedLine d="M 210 200 C 170 230, 130 280, 90 310" delay={0.35} />
          <AnimatedLine d="M 210 200 C 210 260, 230 310, 250 350" delay={0.4} />
        </g>

        {/* Floating particles around center */}
        <g filter="url(#strongGlow)">
          <FloatingParticle startX={195} startY={210} delay={1} />
          <FloatingParticle startX={225} startY={215} delay={1.5} />
          <FloatingParticle startX={200} startY={185} delay={2} />
          <FloatingParticle startX={220} startY={190} delay={2.5} />
          <FloatingParticle startX={190} startY={200} delay={3} />
          <FloatingParticle startX={230} startY={205} delay={3.5} />
        </g>

        {/* Pulsing node dots at endpoints */}
        <g filter="url(#glow)">
          <PulsingDot cx={360} cy={90} delay={0.5} />
          <PulsingDot cx={380} cy={160} delay={0.55} />
          <PulsingDot cx={390} cy={250} delay={0.6} />
          <PulsingDot cx={360} cy={320} delay={0.65} />
          <PulsingDot cx={50} cy={120} delay={0.7} />
          <PulsingDot cx={90} cy={310} delay={0.75} />
          <PulsingDot cx={250} cy={350} delay={0.8} />
        </g>
        
        {/* Central pulsing rings */}
        <motion.circle
          cx="210"
          cy="200"
          r="45"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.4, 1.8],
            opacity: [0.6, 0.2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        <motion.circle
          cx="210"
          cy="200"
          r="45"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.3, 1.6],
            opacity: [0.4, 0.15, 0]
          }}
          transition={{
            duration: 3,
            delay: 1,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </svg>

      {/* Central node - Telegram Icon */}
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ 
          duration: 1, 
          type: "spring",
          stiffness: 150,
          damping: 12
        }}
      >
        {/* Outer glow ring animated */}
        <motion.div 
          className="absolute -inset-8 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)"
          }}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Inner glow with rotation */}
        <motion.div 
          className="absolute -inset-5 rounded-full bg-primary/15 blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 10, repeat: Infinity, ease: "linear" }
          }}
        />
        
        {/* Main container with 3D-like effect */}
        <motion.div 
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center shadow-2xl overflow-hidden"
          style={{ 
            boxShadow: "0 0 40px -5px hsl(var(--primary) / 0.4), inset 0 -5px 20px -5px hsl(var(--primary) / 0.1)" 
          }}
          animate={{
            boxShadow: [
              "0 0 40px -5px hsl(var(--primary) / 0.4), inset 0 -5px 20px -5px hsl(var(--primary) / 0.1)",
              "0 0 60px -5px hsl(var(--primary) / 0.6), inset 0 -5px 20px -5px hsl(var(--primary) / 0.2)",
              "0 0 40px -5px hsl(var(--primary) / 0.4), inset 0 -5px 20px -5px hsl(var(--primary) / 0.1)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 0 80px -5px hsl(var(--primary) / 0.7), inset 0 -5px 20px -5px hsl(var(--primary) / 0.3)"
          }}
        >
          {/* Rotating gradient border */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, hsl(var(--primary) / 0.8), transparent 30%, hsl(var(--primary) / 0.4), transparent 60%, hsl(var(--primary) / 0.8))",
              padding: "2px"
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full bg-background" />
          </motion.div>
          
          {/* Shine sweep effect */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 -translate-x-full"
              style={{
                background: "linear-gradient(90deg, transparent, white/20, transparent)",
                width: "50%"
              }}
              animate={{ x: ["-100%", "300%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Telegram icon with enhanced glow */}
          <motion.svg 
            viewBox="0 0 24 24" 
            className="w-12 h-12 sm:w-14 sm:h-14 relative z-10"
            animate={{ 
              filter: [
                "drop-shadow(0 0 15px hsl(var(--primary) / 0.7))",
                "drop-shadow(0 0 30px hsl(var(--primary) / 0.9))",
                "drop-shadow(0 0 15px hsl(var(--primary) / 0.7))"
              ],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <defs>
              <linearGradient id="tgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(200, 90%, 60%)" />
                <stop offset="50%" stopColor="hsl(205, 95%, 50%)" />
                <stop offset="100%" stopColor="hsl(211, 100%, 45%)" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#tgGrad)"
              d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
            />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Badges with floating animation - more spacing */}
      <div className="absolute hidden sm:block top-[5%] right-[5%]">
        <Badge icon={Clock} label="Delay Inteligente" delay={0.4} floatOffset={0} />
      </div>

      <div className="absolute hidden sm:block top-[28%] right-[-5%]">
        <Badge icon={Users} label="Multi-Contas" delay={0.45} floatOffset={0.3} />
      </div>

      <div className="absolute hidden sm:block top-[55%] right-[-8%]">
        <Badge icon={Monitor} label="Modo PC" delay={0.5} floatOffset={0.6} />
      </div>

      <div className="absolute hidden sm:block bottom-[5%] right-[0%]">
        <Badge icon={Shield} label="Anti-Ban" delay={0.55} floatOffset={0.2} />
      </div>

      <div className="absolute hidden sm:block top-[12%] left-[-5%]">
        <Badge icon={Send} label="Extração" delay={0.6} floatOffset={0.5} />
      </div>

      <div className="absolute hidden sm:block bottom-[10%] left-[5%]">
        <Badge icon={Rocket} label="Crescimento" delay={0.65} floatOffset={0.4} />
      </div>

      <div className="absolute hidden sm:block bottom-[-5%] left-[45%]">
        <Badge icon={Zap} label="Automação" delay={0.7} floatOffset={0.1} />
      </div>

      {/* Mobile layout with enhanced animations */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 sm:hidden">
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
        >
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Delay</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
        >
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Anti-Ban</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
        >
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Automação</span>
        </motion.div>
      </div>
    </div>
  );
};
