import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send, Monitor, Rocket } from "lucide-react";

// Floating badge with fluid animations - reduced delays for smoothness
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
    className="group relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg cursor-default overflow-hidden"
    initial={{ opacity: 0, scale: 0.8, y: 15 }}
    animate={{ 
      opacity: 1, 
      scale: 1, 
      y: [0, -4, 0],
    }}
    transition={{ 
      opacity: { duration: 0.3, delay: delay * 0.5 },
      scale: { duration: 0.4, delay: delay * 0.5, type: "spring", stiffness: 400, damping: 20 },
      y: {
        duration: 2.5 + floatOffset,
        delay: delay * 0.5 + 0.3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }}
    whileHover={{ 
      scale: 1.08, 
      y: -6,
      boxShadow: "0 10px 30px -8px hsl(var(--primary) / 0.4)",
      borderColor: "hsl(var(--primary) / 0.6)"
    }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Shimmer sweep effect */}
    <motion.div
      className="absolute inset-0 -translate-x-full"
      style={{
        background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)"
      }}
      animate={{ x: ["-100%", "200%"] }}
      transition={{
        duration: 1.5,
        delay: delay * 0.5 + 1,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut"
      }}
    />
    
    {/* Icon container */}
    <motion.div 
      className="relative w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
      animate={{ 
        boxShadow: [
          "0 0 0 0 hsl(var(--primary) / 0.3)",
          "0 0 0 6px hsl(var(--primary) / 0)",
        ]
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        delay: delay * 0.5 + 0.5,
        ease: "easeOut"
      }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: delay * 0.5,
          ease: "easeInOut"
        }}
      >
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary relative z-10" />
      </motion.div>
    </motion.div>
    
    <span className="relative text-[10px] sm:text-xs font-semibold text-foreground whitespace-nowrap">{label}</span>
  </motion.div>
);

// Enhanced animated line with smooth energy particles
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
      transition={{ duration: 0.8, delay: delay * 0.5, ease: "easeOut" }}
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
        opacity: [0, 0.5, 0.25]
      }}
      transition={{ 
        pathLength: { duration: 0.8, delay: delay * 0.5 },
        opacity: { duration: 1.5, delay: delay * 0.5 + 0.5, repeat: Infinity, ease: "easeInOut" }
      }}
      style={{ filter: "blur(2px)" }}
    />
    
    {/* Energy particle */}
    <motion.circle
      r="3"
      fill="hsl(var(--primary))"
      style={{ filter: "blur(0.5px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0.8, 0] }}
      transition={{
        duration: 1.5,
        delay: delay * 0.5 + 0.8,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut"
      }}
    >
      <animateMotion
        dur="1.5s"
        repeatCount="indefinite"
        begin={`${delay * 0.5 + 0.8}s`}
        path={d}
      />
    </motion.circle>
  </g>
);

// Pulsing node with smooth animation
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
    {/* Outer pulse ring */}
    <motion.circle 
      cx={cx} 
      cy={cy} 
      r="4" 
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="1"
      initial={{ scale: 1, opacity: 0 }}
      animate={{ 
        scale: [1, 2.5, 3.5],
        opacity: [0.4, 0.15, 0]
      }}
      transition={{
        duration: 2,
        delay: delay * 0.5 + 0.2,
        repeat: Infinity,
        repeatDelay: 0.5,
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
        scale: [1, 1.15, 1],
        opacity: 1
      }}
      transition={{ 
        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        opacity: { delay: delay * 0.5, duration: 0.2 }
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
      transition={{ delay: delay * 0.5 + 0.1, type: "spring", stiffness: 400 }}
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
    fillOpacity="0.5"
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0, 0.5, 0],
      cy: [startY, startY - 25],
      cx: [startX, startX + (Math.random() - 0.5) * 15]
    }}
    transition={{
      duration: 2.5,
      delay: delay * 0.5,
      repeat: Infinity,
      repeatDelay: 1.5,
      ease: "easeOut"
    }}
  />
);

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] mx-auto h-[300px] xs:h-[340px] sm:h-[400px] flex items-center justify-center">
      {/* Animated ambient glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-primary/20 blur-[50px] sm:blur-[70px]" />
      </motion.div>
      
      {/* Secondary rotating glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-24 sm:w-36 h-24 sm:h-36 rounded-full bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-[40px] sm:blur-[50px]" />
      </motion.div>

      {/* Mind map SVG lines - responsive viewBox */}
      <svg 
        className="absolute inset-0 w-full h-full hidden sm:block" 
        viewBox="0 0 420 400"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
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
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g filter="url(#glow)">
          {/* Delay Inteligente */}
          <AnimatedLine d="M 210 200 C 260 160, 320 100, 378 72" delay={0.1} />
          
          {/* Multi-Contas */}
          <AnimatedLine d="M 210 200 C 280 180, 350 160, 399 144" delay={0.15} />
          
          {/* Modo PC */}
          <AnimatedLine d="M 210 200 C 280 210, 360 220, 412 232" delay={0.2} />
          
          {/* Anti-Ban */}
          <AnimatedLine d="M 210 200 C 260 250, 330 300, 386 336" delay={0.25} />
          
          {/* Extração */}
          <AnimatedLine d="M 210 200 C 150 170, 80 130, 21 104" delay={0.3} />
          
          {/* Crescimento */}
          <AnimatedLine d="M 210 200 C 160 250, 100 290, 63 328" delay={0.35} />
          
          {/* Automação */}
          <AnimatedLine d="M 210 200 C 215 260, 225 320, 231 368" delay={0.4} />
        </g>

        {/* Floating particles around center */}
        <g filter="url(#strongGlow)">
          <FloatingParticle startX={195} startY={210} delay={0.5} />
          <FloatingParticle startX={225} startY={215} delay={0.8} />
          <FloatingParticle startX={200} startY={185} delay={1.1} />
          <FloatingParticle startX={220} startY={190} delay={1.4} />
        </g>

        {/* Pulsing node dots at badge positions */}
        <g filter="url(#glow)">
          <PulsingDot cx={378} cy={72} delay={0.3} />
          <PulsingDot cx={399} cy={144} delay={0.35} />
          <PulsingDot cx={412} cy={232} delay={0.4} />
          <PulsingDot cx={386} cy={336} delay={0.45} />
          <PulsingDot cx={21} cy={104} delay={0.5} />
          <PulsingDot cx={63} cy={328} delay={0.55} />
          <PulsingDot cx={231} cy={368} delay={0.6} />
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
            scale: [0.8, 1.3, 1.6],
            opacity: [0.5, 0.2, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </svg>

      {/* Central node - Telegram Icon */}
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
      >
        {/* Outer glow ring animated */}
        <motion.div 
          className="absolute -inset-6 sm:-inset-8 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)"
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Inner glow with rotation */}
        <motion.div 
          className="absolute -inset-4 sm:-inset-5 rounded-full bg-primary/10 blur-lg sm:blur-xl"
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 8, repeat: Infinity, ease: "linear" }
          }}
        />
        
        {/* Main container */}
        <motion.div 
          className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center shadow-2xl overflow-hidden"
          style={{ 
            boxShadow: "0 0 30px -5px hsl(var(--primary) / 0.3), inset 0 -4px 15px -5px hsl(var(--primary) / 0.1)" 
          }}
          animate={{
            boxShadow: [
              "0 0 30px -5px hsl(var(--primary) / 0.3), inset 0 -4px 15px -5px hsl(var(--primary) / 0.1)",
              "0 0 50px -5px hsl(var(--primary) / 0.5), inset 0 -4px 15px -5px hsl(var(--primary) / 0.15)",
              "0 0 30px -5px hsl(var(--primary) / 0.3), inset 0 -4px 15px -5px hsl(var(--primary) / 0.1)"
            ]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ 
            scale: 1.08,
            boxShadow: "0 0 60px -5px hsl(var(--primary) / 0.6), inset 0 -4px 15px -5px hsl(var(--primary) / 0.2)"
          }}
        >
          {/* Rotating gradient border */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, hsl(var(--primary) / 0.6), transparent 30%, hsl(var(--primary) / 0.3), transparent 60%, hsl(var(--primary) / 0.6))",
              padding: "2px"
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
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
                background: "linear-gradient(90deg, transparent, white/15, transparent)",
                width: "50%"
              }}
              animate={{ x: ["-100%", "300%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2.5,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Telegram icon */}
          <motion.svg 
            viewBox="0 0 24 24" 
            className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 relative z-10"
            animate={{ 
              filter: [
                "drop-shadow(0 0 10px hsl(var(--primary) / 0.5))",
                "drop-shadow(0 0 20px hsl(var(--primary) / 0.7))",
                "drop-shadow(0 0 10px hsl(var(--primary) / 0.5))"
              ],
              scale: [1, 1.03, 1]
            }}
            transition={{
              duration: 2,
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

      {/* Badges - Desktop/Tablet - positioned exactly on SVG dots */}
      {/* viewBox is 420x400, so we convert dot coordinates to percentages */}
      
      {/* Delay Inteligente - dot at (378, 72) → 90%, 18% */}
      <div className="absolute hidden sm:block" style={{ left: '90%', top: '18%', transform: 'translate(-50%, -120%)' }}>
        <Badge icon={Clock} label="Delay Inteligente" delay={0.4} floatOffset={0} />
      </div>

      {/* Multi-Contas - dot at (399, 144) → 95%, 36% */}
      <div className="absolute hidden sm:block" style={{ left: '95%', top: '36%', transform: 'translate(-50%, -120%)' }}>
        <Badge icon={Users} label="Multi-Contas" delay={0.45} floatOffset={0.3} />
      </div>

      {/* Modo PC - dot at (412, 232) → 98%, 58% */}
      <div className="absolute hidden sm:block" style={{ left: '98%', top: '58%', transform: 'translate(-50%, -120%)' }}>
        <Badge icon={Monitor} label="Modo PC" delay={0.5} floatOffset={0.6} />
      </div>

      {/* Anti-Ban - dot at (386, 336) → 92%, 84% */}
      <div className="absolute hidden sm:block" style={{ left: '92%', top: '84%', transform: 'translate(-50%, -120%)' }}>
        <Badge icon={Shield} label="Anti-Ban" delay={0.55} floatOffset={0.2} />
      </div>

      {/* Extração - dot at (21, 104) → 5%, 26% */}
      <div className="absolute hidden sm:block" style={{ left: '5%', top: '26%', transform: 'translate(-50%, -120%)' }}>
        <Badge icon={Send} label="Extração" delay={0.6} floatOffset={0.5} />
      </div>

      {/* Crescimento - dot at (63, 328) → 15%, 82% */}
      <div className="absolute hidden sm:block" style={{ left: '15%', top: '82%', transform: 'translate(-50%, -120%)' }}>
        <Badge icon={Rocket} label="Crescimento" delay={0.65} floatOffset={0.4} />
      </div>

      {/* Automação - dot at (231, 368) → 55%, 92% */}
      <div className="absolute hidden sm:block" style={{ left: '55%', top: '92%', transform: 'translate(-50%, -120%)' }}>
        <Badge icon={Zap} label="Automação" delay={0.7} floatOffset={0.1} />
      </div>

      {/* Mobile layout - compact badges at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:hidden px-2">
        <motion.div
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-background/95 backdrop-blur-sm border border-border/50 shadow-md"
          initial={{ opacity: 0, y: 15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-primary" />
          <span className="text-[9px] xs:text-[10px] font-medium text-foreground">Delay</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-background/95 backdrop-blur-sm border border-border/50 shadow-md"
          initial={{ opacity: 0, y: 15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.25, type: "spring", stiffness: 300 }}
        >
          <Shield className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-primary" />
          <span className="text-[9px] xs:text-[10px] font-medium text-foreground">Anti-Ban</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-background/95 backdrop-blur-sm border border-border/50 shadow-md"
          initial={{ opacity: 0, y: 15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3, type: "spring", stiffness: 300 }}
        >
          <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-primary" />
          <span className="text-[9px] xs:text-[10px] font-medium text-foreground">Automação</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-background/95 backdrop-blur-sm border border-border/50 shadow-md"
          initial={{ opacity: 0, y: 15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.35, type: "spring", stiffness: 300 }}
        >
          <Users className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-primary" />
          <span className="text-[9px] xs:text-[10px] font-medium text-foreground">Multi-Contas</span>
        </motion.div>
      </div>
    </div>
  );
};
