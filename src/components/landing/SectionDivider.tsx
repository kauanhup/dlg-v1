import { motion } from "framer-motion";
import { Shield, Zap, Users, Target, Send } from "lucide-react";

const features = [
  { icon: Shield, text: "Anti-Ban", delay: 0 },
  { icon: Zap, text: "Delays Inteligentes", delay: 0.1 },
  { icon: Users, text: "Multi-Contas", delay: 0.2 },
  { icon: Target, text: "Extração", delay: 0.3 },
  { icon: Send, text: "Adicionar em Massa", delay: 0.4 },
];

export const SectionDivider = () => {
  return (
    <div className="relative py-16 sm:py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      
      {/* 3D Perspective Container */}
      <div 
        className="relative max-w-5xl mx-auto px-4"
        style={{ perspective: "1000px" }}
      >
        {/* Floating cards with 3D effect */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: feature.delay,
                ease: [0.23, 1, 0.32, 1]
              }}
              whileHover={{ 
                y: -8, 
                rotateX: 5,
                rotateY: 5,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              className="group relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Main card */}
              <div className="relative flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm shadow-lg shadow-black/5">
                {/* Icon container with depth */}
                <div 
                  className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                  style={{ transform: "translateZ(10px)" }}
                >
                  <feature.icon className="w-5 h-5 text-primary" strokeWidth={2} />
                  
                  {/* Icon inner glow */}
                  <div className="absolute inset-0 rounded-lg bg-primary/10 blur-sm" />
                </div>
                
                {/* Text with subtle shadow */}
                <span 
                  className="text-sm sm:text-base font-semibold text-foreground whitespace-nowrap"
                  style={{ transform: "translateZ(5px)" }}
                >
                  {feature.text}
                </span>
              </div>
              
              {/* Bottom reflection/shadow for 3D depth */}
              <div 
                className="absolute inset-x-2 -bottom-3 h-4 bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity"
                style={{ transform: "rotateX(90deg) translateZ(-20px)" }}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Connecting line with glow */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 -z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm" />
        </div>
      </div>
      
      {/* Subtle decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] -z-20">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};
