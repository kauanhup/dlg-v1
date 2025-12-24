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
      {/* Top border line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-10" />
      
      {/* Scrolling container */}
      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-6 sm:gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {/* Duplicate items for seamless loop */}
          {[...features, ...features].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 px-5 py-2.5 whitespace-nowrap flex-shrink-0 group"
            >
              <feature.icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors duration-300" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};