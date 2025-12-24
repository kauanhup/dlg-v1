import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Send, Settings, ChevronRight } from "lucide-react";

// Import images from assets
import botDashboard1 from "@/assets/bot-dashboard-1.png";
import botDashboard2 from "@/assets/bot-dashboard-2.png";
import botDashboard3 from "@/assets/bot-dashboard-3.png";

const steps = [
  {
    step: "01",
    title: "Adicione suas Sessions",
    description: "Faça upload das suas contas Telegram para começar a automatizar. Suporte para múltiplas sessions simultâneas.",
    icon: Settings,
    image: botDashboard1,
  },
  {
    step: "02",
    title: "Configure o Bot",
    description: "Defina grupos alvo, configure delays inteligentes e ajuste as configurações de extração de membros.",
    icon: Users,
    image: botDashboard2,
  },
  {
    step: "03",
    title: "Inicie a Automação",
    description: "Execute as ações e acompanhe o progresso em tempo real. Veja estatísticas e métricas detalhadas.",
    icon: Send,
    image: botDashboard3,
  },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.1,
    margin: "-50px"
  });

  return (
    <section className="py-20 sm:py-28 bg-background overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="text-primary text-sm font-medium mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Como funciona
          </motion.p>
          <motion.h2 
            className="text-3xl sm:text-4xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Simples de Usar
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Em apenas 3 passos você configura e começa a automatizar seu Telegram.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid gap-16 lg:gap-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center`}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: 0.3 + (index * 0.2),
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-4 mb-6">
                  <span className="text-6xl sm:text-7xl font-display font-bold bg-gradient-to-b from-primary/30 to-transparent bg-clip-text text-transparent">
                    {step.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-semibold mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {step.description}
                </p>
                
                {index < steps.length - 1 && (
                  <motion.div 
                    className="hidden lg:flex items-center gap-2 mt-8 text-primary/60"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + (index * 0.2) }}
                  >
                    <div className="w-8 h-[2px] bg-gradient-to-r from-primary/60 to-transparent" />
                    <ChevronRight className="w-5 h-5" />
                    <span className="text-sm font-medium">Próximo passo</span>
                  </motion.div>
                )}
              </div>

              {/* Image */}
              <div className="flex-1 w-full max-w-xl lg:max-w-lg">
                <motion.div 
                  className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm shadow-2xl shadow-primary/5 group"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Step badge */}
                  <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    Passo {step.step}
                  </div>
                  
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-3xl blur-2xl -z-10"
                    initial={{ opacity: 0.1 }}
                    whileHover={{ opacity: 0.4 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
