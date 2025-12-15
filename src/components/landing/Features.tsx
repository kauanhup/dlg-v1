import { 
  LayoutDashboard, 
  Smartphone, 
  Zap, 
  Shield,
  RotateCcw,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

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
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
} as const;

const Features = () => {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                y: -4,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;