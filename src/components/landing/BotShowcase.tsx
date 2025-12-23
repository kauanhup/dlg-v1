import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import botDashboard1 from "@/assets/bot-dashboard-1.png";
import botDashboard2 from "@/assets/bot-dashboard-2.png";
import botDashboard3 from "@/assets/bot-dashboard-3.png";
import { motion } from "framer-motion";

const BotShowcase = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center">
            <motion.span 
              className="inline-block px-4 py-1.5 mb-4 text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary rounded-full border border-primary/20"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              Interface Profissional
            </motion.span>
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Controle{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                total
              </span>{" "}
              na palma da mão
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-base sm:text-lg max-w-xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Dashboard intuitivo com todas as ferramentas que você precisa para gerenciar suas contas e grupos.
            </motion.p>
          </div>
        }
      >
        <img
          src={botDashboard1}
          alt="Dashboard do Bot DLG Connect"
          className="w-full h-full object-cover object-left-top"
          draggable={false}
        />
      </ContainerScroll>

      {/* Additional Screenshots Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <motion.div 
            className="relative group"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={botDashboard2}
                alt="Configurações de transferência"
                className="w-full h-auto"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-semibold text-foreground mb-1">Transferência Inteligente</h3>
                <p className="text-sm text-muted-foreground">Configure delays e limites para máxima segurança</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="relative group"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={botDashboard3}
                alt="Analytics e estatísticas"
                className="w-full h-auto"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-semibold text-foreground mb-1">Analytics Completo</h3>
                <p className="text-sm text-muted-foreground">Acompanhe o crescimento em tempo real</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BotShowcase;
