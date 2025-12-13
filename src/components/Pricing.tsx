import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Semanal",
    price: "47",
    period: "7 dias",
    features: [
      "Até 3 contas Telegram",
      "500 adições/dia",
      "Dashboard básico",
      "Suporte por email",
    ],
  },
  {
    name: "Mensal",
    price: "127",
    period: "30 dias",
    features: [
      "Até 10 contas Telegram",
      "2.500 adições/dia",
      "Dashboard completo",
      "Rotação automática",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    name: "Vitalício",
    price: "997",
    period: "Pagamento único",
    features: [
      "Contas ilimitadas",
      "Adições ilimitadas",
      "Todos os recursos",
      "Atualizações vitalícias",
      "Suporte VIP",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
} as const;

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-primary text-sm font-medium mb-3">PREÇOS</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Escolha seu plano
          </h2>
          <p className="text-muted-foreground">
            Planos flexíveis para cada necessidade. Comece hoje.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -6,
                transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              className={`relative p-6 rounded-xl transition-shadow overflow-visible ${
                plan.popular 
                  ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10 mt-4" 
                  : "border border-border bg-card hover:shadow-lg hover:shadow-primary/5"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md whitespace-nowrap">
                    ⭐ Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-display font-bold text-lg mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-3xl font-display font-bold">{plan.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{plan.period}</p>
              </div>

              <ul className="space-y-2.5 mb-5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/comprar" className="w-full">
                <Button 
                  className={`w-full h-11 ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : ''
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Começar Agora
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.p 
          className="text-center text-muted-foreground text-sm mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
        >
          ✓ Pagamento via PIX &nbsp;·&nbsp; ✓ Entrega Imediata &nbsp;·&nbsp; ✓ Sem Mensalidade
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
