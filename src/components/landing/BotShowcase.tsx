import { BotDashboardPreview, BotActionsPreview, BotAccountsPreview } from "./BotPreviews";
import { motion, useInView } from "framer-motion";
import { Users, Clock } from "lucide-react";
import { useRef } from "react";

// Smooth easing curve for buttery animations
const smoothEase = [0.22, 1, 0.36, 1] as const;

const floatAnimation = {
  y: [0, -6, 0],
};

const pulseGlow = {
  scale: [1, 1.02, 1],
  opacity: [0.5, 0.7, 0.5],
};

// Reusable scroll reveal section component
const RevealSection = ({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: false, 
    amount: 0.25,
    margin: "-80px 0px -80px 0px"
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 50, filter: "blur(12px)" }}
      transition={{ duration: 0.8, delay, ease: smoothEase }}
    >
      {children}
    </motion.div>
  );
};

const BotShowcase = () => {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      {/* Section 1: Dashboard */}
      <div className="container mx-auto px-4 mb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Preview */}
          <RevealSection className="relative">
            <motion.div 
              className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-3xl"
              animate={pulseGlow}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="relative"
              animate={floatAnimation}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotDashboardPreview />
            </motion.div>
          </RevealSection>

          {/* Right - Text */}
          <RevealSection delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              Controle total em{" "}
              <span className="text-primary">tempo real</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg">
              Acompanhe o status de cada conta, monitore a saúde do sistema e gerencie limites diários com uma interface profissional.
            </p>

            {/* Animated Stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { value: "12", label: "Contas Ativas", color: "text-green-500" },
                { value: "847", label: "Membros/dia", color: "text-primary" },
                { value: "99.9%", label: "Uptime", color: "text-yellow-500" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center group cursor-default"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: smoothEase }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.25 } }}
                >
                  <p className={`text-3xl sm:text-4xl font-bold ${stat.color} transition-all duration-300 group-hover:drop-shadow-lg`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </div>
      </div>

      {/* Section 2: Actions - Inverted */}
      <div className="container mx-auto px-4 mb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text */}
          <RevealSection className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              Extraia e adicione membros{" "}
              <span className="text-green-500">automaticamente</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg">
              Configure suas automações com delays inteligentes e limites seguros. Acompanhe o progresso em tempo real.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Extração de Membros", value: "De qualquer grupo público" },
                { icon: Clock, label: "Delays Seguros", value: "Evita flood e ban" },
              ].map((stat) => (
                <motion.div 
                  key={stat.label} 
                  className="flex items-start gap-3 group cursor-default"
                  whileHover={{ x: 4, transition: { duration: 0.25, ease: smoothEase } }}
                >
                  <motion.div 
                    className="h-10 w-10 bg-green-500/10 border border-green-500/20 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-300 group-hover:bg-green-500/20 group-hover:border-green-500/40 group-hover:shadow-lg group-hover:shadow-green-500/10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.25 }}
                  >
                    <stat.icon className="h-5 w-5 text-green-500" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-foreground transition-colors duration-300">{stat.label}</p>
                    <p className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/80">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </RevealSection>

          {/* Right - Preview */}
          <RevealSection className="order-1 lg:order-2 relative" delay={0.1}>
            <motion.div 
              className="absolute -inset-4 bg-gradient-to-l from-green-500/20 via-green-500/5 to-transparent rounded-3xl blur-2xl"
              animate={pulseGlow}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="relative"
              animate={floatAnimation}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotActionsPreview />
            </motion.div>
          </RevealSection>
        </div>
      </div>

      {/* Section 3: Accounts */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Preview */}
          <RevealSection className="relative">
            <motion.div 
              className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 via-yellow-500/5 to-transparent rounded-3xl blur-2xl"
              animate={pulseGlow}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="relative"
              animate={floatAnimation}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotAccountsPreview />
            </motion.div>
          </RevealSection>

          {/* Right - Text */}
          <RevealSection delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              Múltiplas contas em{" "}
              <span className="text-yellow-500">um só lugar</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg">
              Conecte várias contas do Telegram, monitore status e gerencie tudo de forma centralizada. Suporte para sessions e códigos de verificação.
            </p>

            {/* Animated Feature Tags */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Sessions .session", delay: 0 },
                { label: "Código 2FA", delay: 0.1 },
              ].map((tag, index) => (
                <motion.span 
                  key={tag.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-medium cursor-default"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ delay: tag.delay, duration: 0.5, ease: smoothEase }}
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "rgba(234, 179, 8, 0.2)",
                    borderColor: "rgba(234, 179, 8, 0.4)",
                    transition: { duration: 0.25, ease: smoothEase } 
                  }}
                >
                  <motion.span
                    className="w-2 h-2 rounded-full bg-yellow-500"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      delay: index * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                  {tag.label}
                </motion.span>
              ))}
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
};

export default BotShowcase;
