import { BotDashboardPreview, BotActionsPreview, BotAccountsPreview } from "./BotPreviews";
import { motion } from "framer-motion";
import { Shield, Zap, Users, Clock } from "lucide-react";

const BotShowcase = () => {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      {/* Section 1: Dashboard */}
      <div className="container mx-auto px-4 mb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary rounded-full border border-primary/20">
              Dashboard Completo
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              Controle total em{" "}
              <span className="text-primary">tempo real</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg">
              Acompanhe o status de cada conta, monitore a saúde do sistema e gerencie limites diários com uma interface profissional.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "Monitoramento 24/7", desc: "Status em tempo real" },
                { icon: Zap, label: "Proteção Anti-Ban", desc: "Limites inteligentes" },
                { icon: Users, label: "Multi-Contas", desc: "Gerencie todas juntas" },
                { icon: Clock, label: "Delays Automáticos", desc: "Segurança garantida" },
              ].map((stat) => (
                <motion.div 
                  key={stat.label} 
                  className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(220,15%,8%)]/50 border border-[hsl(220,15%,15%)] hover:border-primary/30 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <div className="h-10 w-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg flex-shrink-0">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-3xl opacity-60" />
            <div className="relative">
              <BotDashboardPreview />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Section 2: Actions - Inverted */}
      <div className="container mx-auto px-4 mb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-l from-green-500/20 via-green-500/5 to-transparent rounded-3xl blur-2xl opacity-60" />
            <div className="relative">
              <BotActionsPreview />
            </div>
          </motion.div>

          {/* Right - Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wide uppercase bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
              Central de Ações
            </span>
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
                { icon: Users, label: "Extração de Membros", value: "De qualquer grupo" },
                { icon: Clock, label: "Delays Seguros", value: "Evita flood e ban" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-green-500/10 border border-green-500/20 flex items-center justify-center rounded-lg flex-shrink-0">
                    <stat.icon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Section 3: Accounts */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wide uppercase bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">
              Gerenciamento
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              Múltiplas contas em{" "}
              <span className="text-yellow-500">um só lugar</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg">
              Conecte várias contas do Telegram, monitore status e gerencie tudo de forma centralizada. Suporte para sessions e códigos de verificação.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Multi-Contas", value: "Sem limite de contas" },
                { icon: Shield, label: "Status em Tempo Real", value: "Ativo, Flood, Banido" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center rounded-lg flex-shrink-0">
                    <stat.icon className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 via-yellow-500/5 to-transparent rounded-3xl blur-2xl opacity-60" />
            <div className="relative">
              <BotAccountsPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BotShowcase;
