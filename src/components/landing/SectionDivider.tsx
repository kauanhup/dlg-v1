import { motion } from "framer-motion";
import { Shield, Zap, Users, Clock, Activity, Lock, CheckCircle, Sparkles } from "lucide-react";

const features = [
  { icon: Shield, text: "Monitoramento 24/7" },
  { icon: Activity, text: "Status em tempo real" },
  { icon: Lock, text: "Proteção Anti-Ban" },
  { icon: Zap, text: "Limites inteligentes" },
  { icon: Users, text: "Multi-Contas" },
  { icon: Clock, text: "Delays Automáticos" },
  { icon: CheckCircle, text: "100% Seguro" },
  { icon: Sparkles, text: "Interface Profissional" },
];

export const SectionDivider = () => {
  return (
    <div className="relative py-6 overflow-hidden">
      {/* Top subtle line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-background to-transparent z-10" />
      
      {/* Scrolling container */}
      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-6 sm:gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
        >
          {/* Duplicate items for seamless loop */}
          {[...features, ...features].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 whitespace-nowrap flex-shrink-0"
            >
              <feature.icon className="w-3.5 h-3.5 text-primary/50" strokeWidth={1.5} />
              <span className="text-xs font-medium text-muted-foreground/70 tracking-wide uppercase">{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Bottom subtle line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
};