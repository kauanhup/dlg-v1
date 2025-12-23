import { BotDashboardPreview, BotActionsPreview, BotAccountsPreview } from "./BotPreviews";
import { motion, useScroll, useTransform } from "framer-motion";
import { Users, Clock, Shield, Zap } from "lucide-react";
import { useRef } from "react";

// GPU-optimized easing
const gpuEase = [0.33, 1, 0.68, 1] as const;

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, color, delay = 0 }: FeatureCardProps) => (
  <motion.div
    className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.3 }}
    transition={{ duration: 0.5, delay, ease: gpuEase }}
    whileHover={{ y: -4, transition: { duration: 0.25 } }}
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

const BotShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20 sm:mb-28"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: gpuEase }}
        >
          <motion.span 
            className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Recursos
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Tudo que você precisa para{" "}
            <span className="text-primary">crescer</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Interface profissional, automação inteligente e proteção avançada em um único sistema.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 sm:mb-32">
          <FeatureCard
            icon={Users}
            title="Multi-Contas"
            description="Gerencie múltiplas contas do Telegram simultaneamente com facilidade."
            color="bg-blue-500"
            delay={0}
          />
          <FeatureCard
            icon={Clock}
            title="Delays Inteligentes"
            description="Sistema automático de delays para evitar detecção e banimentos."
            color="bg-green-500"
            delay={0.1}
          />
          <FeatureCard
            icon={Shield}
            title="Proteção Anti-Ban"
            description="Algoritmos avançados que protegem suas contas contra bloqueios."
            color="bg-purple-500"
            delay={0.2}
          />
          <FeatureCard
            icon={Zap}
            title="Alta Performance"
            description="Processamento rápido e eficiente para máxima produtividade."
            color="bg-orange-500"
            delay={0.3}
          />
        </div>

        {/* Dashboard preview - Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 sm:mb-40">
          <motion.div 
            className="order-2 lg:order-1"
            style={{ y: y1 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: gpuEase }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-3xl blur-2xl" />
              <BotDashboardPreview />
            </motion.div>
          </motion.div>

          <motion.div 
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: gpuEase }}
          >
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Dashboard</span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3 mb-6">
              Controle total em <span className="text-primary">tempo real</span>
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Acompanhe o status de cada conta, monitore a saúde do sistema e gerencie limites diários com uma interface profissional e intuitiva.
            </p>
            <div className="flex flex-wrap gap-4">
              {["Status em tempo real", "Métricas detalhadas", "Alertas automáticos"].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Actions preview - Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 sm:mb-40">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: gpuEase }}
          >
            <span className="text-green-500 text-sm font-semibold tracking-wider uppercase">Automação</span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3 mb-6">
              Extraia e adicione <span className="text-green-500">automaticamente</span>
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Configure suas automações com delays inteligentes e limites seguros. Acompanhe o progresso em tempo real com logs detalhados.
            </p>
            <div className="flex flex-wrap gap-4">
              {["Extração em massa", "Filtros avançados", "Logs completos"].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div style={{ y: y2 }}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: gpuEase }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-l from-green-500/20 via-green-500/5 to-transparent rounded-3xl blur-2xl" />
              <BotActionsPreview />
            </motion.div>
          </motion.div>
        </div>

        {/* Accounts preview - Section 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            className="order-2 lg:order-1"
            style={{ y: y1 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: gpuEase }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 via-yellow-500/5 to-transparent rounded-3xl blur-2xl" />
              <BotAccountsPreview />
            </motion.div>
          </motion.div>

          <motion.div 
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: gpuEase }}
          >
            <span className="text-yellow-500 text-sm font-semibold tracking-wider uppercase">Contas</span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3 mb-6">
              Múltiplas contas em <span className="text-yellow-500">um só lugar</span>
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Conecte várias contas do Telegram, monitore status e gerencie tudo de forma centralizada. Suporte para sessions e códigos 2FA.
            </p>
            <div className="flex flex-wrap gap-4">
              {["Sessions .session", "Código 2FA", "Status individual"].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BotShowcase;
