import { motion } from "framer-motion";
import { Shield, Zap, Users, Clock, Activity, Lock, CheckCircle, Sparkles, Send, Target } from "lucide-react";

const features = [
  { icon: Shield, text: "Proteção Anti-Ban", highlight: true },
  { icon: Activity, text: "Status em Tempo Real" },
  { icon: Zap, text: "Delays Inteligentes", highlight: true },
  { icon: Users, text: "Multi-Contas" },
  { icon: Target, text: "Extração Avançada", highlight: true },
  { icon: Send, text: "Adicionar em Massa" },
  { icon: Clock, text: "Automação 24/7" },
  { icon: Lock, text: "100% Seguro" },
  { icon: CheckCircle, text: "Fácil de Usar" },
  { icon: Sparkles, text: "Interface Pro" },
];

export const SectionDivider = () => {
  return (
    <div className="relative py-8 sm:py-10 overflow-hidden bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent">
      {/* Top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-40 sm:w-56 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-40 sm:w-56 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />
      
      {/* Scrolling container */}
      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-3 sm:gap-4"
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
              className={`
                flex items-center gap-2.5 px-4 py-2.5 whitespace-nowrap flex-shrink-0
                rounded-full border transition-all duration-300
                ${feature.highlight 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-border/20 bg-card/30"
                }
              `}
            >
              {/* Icon with glow for highlights */}
              <div className={`relative ${feature.highlight ? "text-primary" : "text-primary/50"}`}>
                {feature.highlight && (
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                )}
                <feature.icon className="relative w-4 h-4" strokeWidth={feature.highlight ? 2 : 1.5} />
              </div>
              
              {/* Text */}
              <span className={`text-sm font-medium ${feature.highlight ? "text-foreground" : "text-muted-foreground/80"}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </div>
  );
};