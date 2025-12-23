import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { BotDashboardPreview, BotActionsPreview, BotAccountsPreview } from "./BotPreviews";
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
        <div className="w-full h-full flex items-center justify-center p-4">
          <BotDashboardPreview />
        </div>
      </ContainerScroll>

      {/* Additional Previews Grid */}
      <div className="container mx-auto px-4 pb-20 -mt-32">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <motion.div 
            className="relative group"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <BotActionsPreview />
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-1">Central de Ações</h3>
                <p className="text-sm text-muted-foreground">Extraia, adicione e gerencie membros automaticamente</p>
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
            <div className="relative">
              <BotAccountsPreview />
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-1">Gerenciamento de Contas</h3>
                <p className="text-sm text-muted-foreground">Conecte múltiplas contas e monitore o status em tempo real</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BotShowcase;
