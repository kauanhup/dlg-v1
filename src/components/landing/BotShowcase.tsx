import { BotDashboardPreview, BotActionsPreview, BotAccountsPreview } from "./BotPreviews";
import { motion, useInView } from "framer-motion";
import { Users, Clock } from "lucide-react";
import { useRef } from "react";
import { SubtleDivider } from "./SubtleDivider";

// GPU-optimized easing
const gpuEase = [0.25, 0.1, 0.25, 1] as const;

// Reusable scroll reveal section component
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
    amount: 0.2
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: gpuEase }}
    >
      {children}
    </motion.div>
  );
};

const BotShowcase = () => {
  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
      {/* Section 1: Dashboard */}
      <div className="container mx-auto px-4 mb-20 sm:mb-28 lg:mb-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-center">
          {/* Left - Preview */}
          <RevealSection className="relative order-2 lg:order-1">
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl opacity-50" />
            <div className="relative">
              <BotDashboardPreview />
            </div>
          </RevealSection>

          {/* Right - Text */}
          <RevealSection className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight tracking-tight">
              Controle total em{" "}
              <span className="text-gradient">tempo real</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Acompanhe o status de cada conta, monitore a saúde do sistema e gerencie limites diários com uma interface profissional.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8">
              {[
                { value: "12", label: "Contas Ativas", color: "text-success" },
                { value: "847", label: "Membros/dia", color: "text-primary" },
                { value: "99.9%", label: "Uptime", color: "text-warning" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center group cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4, ease: gpuEase }}
                >
                  <p className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </div>
      </div>

      {/* Divider 1 */}
      <SubtleDivider variant="default" />

      {/* Section 2: Actions */}
      <div className="container mx-auto px-4 my-20 sm:my-28 lg:my-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-center">
          {/* Left - Text */}
          <RevealSection className="text-center lg:text-center lg:pl-8 xl:pl-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight tracking-tight">
              Extraia e adicione membros{" "}
              <span className="text-success">automaticamente</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
              Configure suas automações com delays inteligentes e limites seguros. Acompanhe o progresso em tempo real.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto">
              {[
                { icon: Users, label: "Extração de Membros", value: "De qualquer grupo público" },
                { icon: Clock, label: "Delays Seguros", value: "Evita flood e ban" },
              ].map((stat) => (
                <div 
                  key={stat.label} 
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl glass-card"
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-success/10 border border-success/20 flex items-center justify-center rounded-xl flex-shrink-0">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>

          {/* Right - Preview */}
          <RevealSection className="relative">
            <div className="absolute -inset-4 bg-gradient-to-l from-success/10 via-success/5 to-transparent rounded-3xl blur-2xl opacity-50" />
            <div className="relative">
              <BotActionsPreview />
            </div>
          </RevealSection>
        </div>
      </div>

      {/* Divider 2 */}
      <SubtleDivider variant="glow" />

      {/* Section 3: Accounts */}
      <div className="container mx-auto px-4 mt-20 sm:mt-28 lg:mt-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-center">
          {/* Left - Preview */}
          <RevealSection className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-r from-warning/10 via-warning/5 to-transparent rounded-3xl blur-2xl opacity-50" />
            <div className="relative">
              <BotAccountsPreview />
            </div>
          </RevealSection>

          {/* Right - Text */}
          <RevealSection className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-tight tracking-tight">
              Múltiplas contas em{" "}
              <span className="text-warning">um só lugar</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Conecte várias contas do Telegram, monitore status e gerencie tudo de forma centralizada. Suporte para sessions e códigos de verificação.
            </p>

            {/* Feature Tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {[
                { label: "Sessions .session" },
                { label: "Código 2FA" },
              ].map((tag, index) => (
                <motion.span 
                  key={tag.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 text-warning text-sm font-medium cursor-default transition-colors duration-200 hover:bg-warning/15"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4, ease: gpuEase }}
                >
                  <span className="w-2 h-2 rounded-full bg-warning" />
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