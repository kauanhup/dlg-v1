import { motion } from "framer-motion";
import { Users, Zap, Shield, Clock, Send, Monitor, Rocket, LucideIcon } from "lucide-react";

// SVG Badge component that renders inside the SVG
const SVGBadge = ({ 
  x, 
  y, 
  label, 
  delay,
  anchor = "start" // "start" = left, "middle" = center, "end" = right
}: { 
  x: number;
  y: number;
  label: string; 
  delay: number;
  anchor?: "start" | "middle" | "end";
}) => {
  // Calculate text offset based on anchor
  const getXOffset = () => {
    switch (anchor) {
      case "end": return -8;
      case "middle": return 0;
      default: return 8;
    }
  };

  return (
    <g>
      {/* Badge background */}
      <motion.rect
        x={anchor === "end" ? x - 110 : anchor === "middle" ? x - 55 : x}
        y={y - 28}
        width="110"
        height="24"
        rx="6"
        fill="hsl(var(--background))"
        fillOpacity="0.95"
        stroke="hsl(var(--border))"
        strokeOpacity="0.5"
        strokeWidth="1"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: delay * 0.5 }}
        style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
      />
      {/* Badge text */}
      <motion.text
        x={anchor === "end" ? x - 55 : anchor === "middle" ? x : x + 55}
        y={y - 12}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize="11"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: delay * 0.5 + 0.1 }}
      >
        {label}
      </motion.text>
    </g>
  );
};

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

// Mobile badge component
const MobileBadge = ({ 
  icon: Icon, 
  label, 
  delay 
}: { 
  icon: LucideIcon; 
  label: string; 
  delay: number;
}) => (
  <motion.div
    className="flex items-center gap-1 px-2 py-1 rounded-md bg-background/95 backdrop-blur-sm border border-border/50 shadow-md"
    initial={{ opacity: 0, y: 15, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.3, delay, type: "spring", stiffness: 300 }}
  >
    <Icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-primary" />
    <span className="text-[9px] xs:text-[10px] font-medium text-foreground">{label}</span>
  </motion.div>
);

export const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] mx-auto h-[280px] xs:h-[320px] sm:h-[400px] md:h-[450px] flex items-center justify-center">
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

      {/* Mind map SVG - everything inside including badges */}
      <svg 
        className="absolute inset-0 w-full h-full hidden sm:block" 
        viewBox="0 0 500 450"
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
          {/* Lines from center (250, 225) to each badge dot */}
          {/* Delay Inteligente - top right */}
          <AnimatedLine d="M 250 225 Q 320 160, 420 80" delay={0.1} />
          
          {/* Multi-Contas - right upper */}
          <AnimatedLine d="M 250 225 Q 350 190, 450 160" delay={0.15} />
          
          {/* Modo PC - right middle */}
          <AnimatedLine d="M 250 225 Q 360 230, 460 250" delay={0.2} />
          
          {/* Anti-Ban - right lower */}
          <AnimatedLine d="M 250 225 Q 340 300, 430 360" delay={0.25} />
          
          {/* Extração - left upper */}
          <AnimatedLine d="M 250 225 Q 160 170, 70 100" delay={0.3} />
          
          {/* Crescimento - left lower */}
          <AnimatedLine d="M 250 225 Q 150 300, 80 370" delay={0.35} />
          
          {/* Automação - bottom center */}
          <AnimatedLine d="M 250 225 Q 250 310, 250 400" delay={0.4} />
        </g>

        {/* Floating particles around center */}
        <g filter="url(#strongGlow)">
          <FloatingParticle startX={235} startY={235} delay={0.5} />
          <FloatingParticle startX={265} startY={240} delay={0.8} />
          <FloatingParticle startX={240} startY={210} delay={1.1} />
          <FloatingParticle startX={260} startY={215} delay={1.4} />
        </g>

        {/* Pulsing dots at line endpoints */}
        <g filter="url(#glow)">
          <PulsingDot cx={420} cy={80} delay={0.3} />
          <PulsingDot cx={450} cy={160} delay={0.35} />
          <PulsingDot cx={460} cy={250} delay={0.4} />
          <PulsingDot cx={430} cy={360} delay={0.45} />
          <PulsingDot cx={70} cy={100} delay={0.5} />
          <PulsingDot cx={80} cy={370} delay={0.55} />
          <PulsingDot cx={250} cy={400} delay={0.6} />
        </g>

        {/* Badges positioned above/below each dot */}
        {/* Right side badges - anchor end (text to left of dot) */}
        <SVGBadge x={420} y={55} label="⏱ Delay Inteligente" delay={0.4} anchor="middle" />
        <SVGBadge x={450} y={135} label="👥 Multi-Contas" delay={0.45} anchor="middle" />
        <SVGBadge x={460} y={225} label="🖥 Modo PC" delay={0.5} anchor="middle" />
        <SVGBadge x={430} y={390} label="🛡 Anti-Ban" delay={0.55} anchor="middle" />
        
        {/* Left side badges */}
        <SVGBadge x={70} y={75} label="📤 Extração" delay={0.6} anchor="middle" />
        <SVGBadge x={80} y={400} label="🚀 Crescimento" delay={0.65} anchor="middle" />
        
        {/* Bottom center badge */}
        <SVGBadge x={250} y={430} label="⚡ Automação" delay={0.7} anchor="middle" />
        
        {/* Central pulsing rings */}
        <motion.circle
          cx="250"
          cy="225"
          r="50"
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

      {/* Mobile layout - compact badges at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:hidden px-2">
        <MobileBadge icon={Clock} label="Delay" delay={0.2} />
        <MobileBadge icon={Shield} label="Anti-Ban" delay={0.25} />
        <MobileBadge icon={Zap} label="Automação" delay={0.3} />
        <MobileBadge icon={Users} label="Multi-Contas" delay={0.35} />
      </div>
    </div>
  );
};
