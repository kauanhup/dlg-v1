import { BotDashboardPreview, BotActionsPreview, BotAccountsPreview } from "./BotPreviews";
import { motion, type Variants } from "framer-motion";
import { Shield, Zap, Users, Clock } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const floatAnimation = {
  y: [0, -8, 0],
};

const pulseGlow = {
  scale: [1, 1.02, 1],
  opacity: [0.6, 0.8, 0.6],
};

const BotShowcase = () => {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      {/* Section 1: Dashboard */}
      <div className="container mx-auto px-4 mb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Preview */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <motion.div 
              className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-3xl"
              animate={pulseGlow}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="relative"
              animate={floatAnimation}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotDashboardPreview />
            </motion.div>
          </motion.div>

          {/* Right - Text */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight"
            >
              Controle total em{" "}
              <span className="text-primary">tempo real</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg"
            >
              Acompanhe o status de cada conta, monitore a saúde do sistema e gerencie limites diários com uma interface profissional.
            </motion.p>

            {/* Animated Stats */}
            <motion.div 
              className="flex flex-wrap gap-6"
              variants={staggerContainer}
            >
              {[
                { value: "12", label: "Contas Ativas", color: "text-green-500" },
                { value: "847", label: "Membros/dia", color: "text-primary" },
                { value: "99.9%", label: "Uptime", color: "text-yellow-500" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center group cursor-default"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <motion.p 
                    className={`text-3xl sm:text-4xl font-bold ${stat.color} transition-all duration-300 group-hover:drop-shadow-lg`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-1 transition-colors duration-300 group-hover:text-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Section 2: Actions - Inverted */}
      <div className="container mx-auto px-4 mb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="order-2 lg:order-1"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight"
            >
              Extraia e adicione membros{" "}
              <span className="text-green-500">automaticamente</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg"
            >
              Configure suas automações com delays inteligentes e limites seguros. Acompanhe o progresso em tempo real.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              variants={staggerContainer}
            >
              {[
                { icon: Users, label: "Extração de Membros", value: "De qualquer grupo público" },
                { icon: Clock, label: "Delays Seguros", value: "Evita flood e ban" },
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label} 
                  className="flex items-start gap-3 group cursor-default"
                  variants={fadeInUp}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  <motion.div 
                    className="h-10 w-10 bg-green-500/10 border border-green-500/20 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-300 group-hover:bg-green-500/20 group-hover:border-green-500/40 group-hover:shadow-lg group-hover:shadow-green-500/10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <stat.icon className="h-5 w-5 text-green-500" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-foreground transition-colors duration-300">{stat.label}</p>
                    <p className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/80">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Preview */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 lg:order-2 relative"
          >
            <motion.div 
              className="absolute -inset-4 bg-gradient-to-l from-green-500/20 via-green-500/5 to-transparent rounded-3xl blur-2xl"
              animate={pulseGlow}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="relative"
              animate={floatAnimation}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotActionsPreview />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Section 3: Accounts */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Preview */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <motion.div 
              className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 via-yellow-500/5 to-transparent rounded-3xl blur-2xl"
              animate={pulseGlow}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="relative"
              animate={floatAnimation}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <BotAccountsPreview />
            </motion.div>
          </motion.div>

          {/* Right - Text */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight"
            >
              Múltiplas contas em{" "}
              <span className="text-yellow-500">um só lugar</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg"
            >
              Conecte várias contas do Telegram, monitore status e gerencie tudo de forma centralizada. Suporte para sessions e códigos de verificação.
            </motion.p>

            {/* Animated Feature Tags */}
            <motion.div 
              className="flex flex-wrap gap-3"
              variants={staggerContainer}
            >
              {[
                { label: "Sessions .session", delay: 0 },
                { label: "Código 2FA", delay: 0.1 },
                { label: "Proxy Suporte", delay: 0.2 },
                { label: "Auto-Reconexão", delay: 0.3 },
              ].map((tag, index) => (
                <motion.span 
                  key={tag.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-medium cursor-default"
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "rgba(234, 179, 8, 0.2)",
                    borderColor: "rgba(234, 179, 8, 0.4)",
                    transition: { duration: 0.2 } 
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: tag.delay, duration: 0.4, type: "spring", stiffness: 200 }
                  }}
                  viewport={{ once: true }}
                >
                  <motion.span
                    className="w-2 h-2 rounded-full bg-yellow-500"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: index * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                  {tag.label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BotShowcase;
