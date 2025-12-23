import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Smartphone, 
  Zap, 
  Shield,
  RotateCcw,
  Clock
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Completo",
    description: "Estatísticas em tempo real de contas ativas, em cooldown e banidas."
  },
  {
    icon: Smartphone,
    title: "Multi Contas",
    description: "Conecte múltiplas contas via session ou código de verificação."
  },
  {
    icon: Zap,
    title: "Automação Avançada",
    description: "Extração e transferência automática de membros entre grupos."
  },
  {
    icon: Clock,
    title: "Delay Customizável",
    description: "Configure intervalos personalizados para máxima segurança."
  },
  {
    icon: RotateCcw,
    title: "Rotação Automática",
    description: "Sistema inteligente de rotação para evitar banimentos."
  },
  {
    icon: Shield,
    title: "Proteção Total",
    description: "Limites de segurança e verificação de privacidade integrados."
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const Features = () => {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-primary text-sm font-medium mb-3">RECURSOS</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-muted-foreground">
            Ferramentas profissionais para gerenciar seu crescimento no Telegram.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -6,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-default"
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
              </motion.div>
              <h3 className="font-display font-semibold mb-2 text-foreground transition-colors duration-300 group-hover:text-primary">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-muted-foreground/80">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;