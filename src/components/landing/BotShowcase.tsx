import { BotDashboardPreview, BotActionsPreview, BotAccountsPreview } from "./BotPreviews";
import { motion, useInView } from "framer-motion";
import { Users, Clock } from "lucide-react";
import { useRef } from "react";
import { SubtleDivider } from "./SubtleDivider";
import { gpuEase, usePrefersReducedMotion } from "@/hooks/useScrollAnimation";

// Minimal float animation - GPU only - faster
const floatAnimation = {
  y: [0, -3, 0],
};

// Reusable scroll reveal section component - GPU optimized
const RevealSection = ({ 
  children, 
  className = "",
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.15,
    margin: "-40px"
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ willChange: "transform, opacity" }}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.3, ease: gpuEase }}
    >
      {children}
    </motion.div>
  );
};

const BotShowcase = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background py-12 sm:py-20 lg:py-32">
      {/* Section 1: Dashboard */}
      <div className="container mx-auto px-4 mb-16 sm:mb-24 lg:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left - Preview */}
          <RevealSection className="relative order-2 lg:order-1">
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent rounded-3xl blur-3xl opacity-60" />
            <motion.div 
              className="relative"
              animate={prefersReducedMotion ? {} : floatAnimation}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotDashboardPreview />
            </motion.div>
          </RevealSection>

          {/* Right - Text */}
          <RevealSection className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Controle total em{" "}
              <span className="text-primary">tempo real</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              Acompanhe o status de cada conta, monitore a saúde do sistema e gerencie limites diários com uma interface profissional.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6">
              {[
                { value: "12", label: "Contas Ativas", color: "text-green-500" },
                { value: "847", label: "Membros/dia", color: "text-primary" },
                { value: "99.9%", label: "Uptime", color: "text-yellow-500" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center group cursor-default"
                  style={{ willChange: "transform, opacity" }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ delay: index * 0.03, duration: 0.2, ease: gpuEase }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                >
                  <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </div>
      </div>

      {/* Divider 1 */}
      <SubtleDivider variant="default" />

      {/* Section 2: Actions - Inverted */}
      <div className="container mx-auto px-4 mb-16 sm:mb-24 lg:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* Left - Text */}
          <RevealSection className="text-center lg:text-center lg:pl-8 xl:pl-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Extraia e adicione membros{" "}
              <span className="text-green-500">automaticamente</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">
              Configure suas automações com delays inteligentes e limites seguros. Acompanhe o progresso em tempo real.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
              {[
                { icon: Users, label: "Extração de Membros", value: "De qualquer grupo público" },
                { icon: Clock, label: "Delays Seguros", value: "Evita flood e ban" },
              ].map((stat) => (
                <motion.div 
                  key={stat.label} 
                  className="flex items-start gap-2 sm:gap-3 group cursor-default p-2 sm:p-0"
                  whileHover={{ x: 2, transition: { duration: 0.15, ease: gpuEase } }}
                >
                  <motion.div 
                    className="h-8 w-8 sm:h-10 sm:w-10 bg-green-500/10 border border-green-500/20 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors duration-150 group-hover:bg-green-500/15"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.15 }}
                  >
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium text-foreground">{stat.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </RevealSection>

          {/* Right - Preview */}
          <RevealSection className="relative">
            <div className="absolute -inset-4 bg-gradient-to-l from-green-500/15 via-green-500/5 to-transparent rounded-3xl blur-2xl opacity-60" />
            <motion.div 
              className="relative"
              animate={prefersReducedMotion ? {} : floatAnimation}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotActionsPreview />
            </motion.div>
          </RevealSection>
        </div>
      </div>

      {/* Divider 2 */}
      <SubtleDivider variant="glow" />

      {/* Section 3: Accounts */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* Left - Preview */}
          <RevealSection className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/15 via-yellow-500/5 to-transparent rounded-3xl blur-2xl opacity-60" />
            <motion.div 
              className="relative"
              animate={prefersReducedMotion ? {} : floatAnimation}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotAccountsPreview />
            </motion.div>
          </RevealSection>

          {/* Right - Text */}
          <RevealSection className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Múltiplas contas em{" "}
              <span className="text-yellow-500">um só lugar</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              Conecte várias contas do Telegram, monitore status e gerencie tudo de forma centralizada. Suporte para sessions e códigos de verificação.
            </p>

            {/* Feature Tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
              {[
                { label: "Sessions .session" },
                { label: "Código 2FA" },
              ].map((tag, index) => (
                <motion.span 
                  key={tag.label}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs sm:text-sm font-medium cursor-default transition-colors duration-150 hover:bg-yellow-500/15"
                  style={{ willChange: "transform, opacity" }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ delay: index * 0.03, duration: 0.2, ease: gpuEase }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500" />
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
