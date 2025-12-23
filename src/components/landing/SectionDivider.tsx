import { motion } from "framer-motion";
import { Shield, Zap, Users, Clock, Activity, Lock } from "lucide-react";

const features = [
  { icon: Shield, text: "Monitoramento 24/7" },
  { icon: Activity, text: "Status em tempo real" },
  { icon: Lock, text: "Proteção Anti-Ban" },
  { icon: Zap, text: "Limites inteligentes" },
  { icon: Users, text: "Multi-Contas" },
  { icon: Clock, text: "Delays Automáticos" },
];

export const SectionDivider = () => {
  return (
    <div className="relative py-6 sm:py-8 overflow-hidden bg-background">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      
      {/* Scrolling container */}
      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-6 sm:gap-8"
          animate={{ x: [0, -1200] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {/* Duplicate items for seamless loop */}
          {[...features, ...features, ...features].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,18%)] whitespace-nowrap flex-shrink-0"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80">{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Subtle line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-y-1/2 -z-10" />
    </div>
  );
};
