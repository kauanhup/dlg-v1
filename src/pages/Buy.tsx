import { Check, Sparkles, Crown, Shield, Clock, Zap, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const plans = [
  {
    id: "7dias",
    name: "7 Dias",
    price: "47",
    period: "por 7 dias",
    description: "Ideal para testar",
    features: [
      "Até 3 contas Telegram",
      "500 adições/dia",
      "Dashboard básico",
      "Suporte por email",
    ],
  },
  {
    id: "15dias",
    name: "15 Dias",
    price: "77",
    period: "por 15 dias",
    description: "Para iniciantes",
    features: [
      "Até 5 contas Telegram",
      "1.000 adições/dia",
      "Dashboard completo",
      "Histórico completo",
      "Suporte prioritário",
    ],
  },
  {
    id: "30dias",
    name: "30 Dias",
    price: "127",
    period: "por 30 dias",
    description: "Mais popular",
    features: [
      "Até 10 contas Telegram",
      "2.500 adições/dia",
      "Dashboard completo",
      "Histórico completo",
      "Rotação automática",
      "Suporte 24/7",
    ],
    popular: true,
  },
  {
    id: "1ano",
    name: "1 Ano",
    price: "997",
    period: "por 1 ano",
    description: "Melhor custo-benefício",
    features: [
      "Até 25 contas Telegram",
      "5.000 adições/dia",
      "Todos os recursos",
      "Histórico ilimitado",
      "Suporte VIP",
      "Atualizações incluídas",
      "Equivale a R$83/mês",
    ],
  },
  {
    id: "vitalicio",
    name: "Vitalício",
    price: "1.997",
    period: "pagamento único",
    description: "Licença permanente",
    features: [
      "Contas ilimitadas",
      "Adições ilimitadas",
      "Todos os recursos",
      "Atualizações vitalícias",
      "Suporte VIP prioritário",
      "Acesso beta features",
      "Treinamento exclusivo",
    ],
    lifetime: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
} as const;

const Buy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Title */}
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Compra segura</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-4">
              Escolha sua licença
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Selecione o plano ideal para você. Após a compra, sua chave será entregue instantaneamente.
            </p>
          </motion.div>

          {/* Plans Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className={`relative p-5 sm:p-6 rounded-2xl transition-shadow overflow-visible ${
                  plan.popular 
                    ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10 mt-4" 
                    : plan.lifetime 
                      ? "border-2 border-warning/50 bg-warning/5 mt-4" 
                      : "border border-border bg-card hover:shadow-lg hover:shadow-primary/5"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md whitespace-nowrap">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </span>
                  </div>
                )}
                
                {plan.lifetime && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-warning text-warning-foreground shadow-md whitespace-nowrap">
                      <Crown className="w-3 h-3" />
                      Melhor valor
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="font-display font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-3xl font-display font-bold">{plan.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.period}</p>
                </div>

                <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'bg-primary/20' : plan.lifetime ? 'bg-warning/20' : 'bg-success/20'
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : plan.lifetime ? 'text-warning' : 'text-success'}`} />
                      </div>
                      <span className="text-muted-foreground text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={`/checkout?plano=${plan.id}`} className="w-full">
                  <Button 
                    className={`w-full h-11 ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : plan.lifetime 
                          ? 'bg-warning hover:bg-warning/90 text-warning-foreground' 
                          : ''
                    }`}
                    variant={plan.popular || plan.lifetime ? "default" : "outline"}
                  >
                    Comprar agora
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>


          {/* Trust badges */}
          <motion.div 
            className="bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Shield, title: "Pagamento Seguro", desc: "Criptografia de ponta", color: "text-success" },
                { icon: Clock, title: "Entrega Instantânea", desc: "Chave na hora após pagamento", color: "text-primary" },
                { icon: Zap, title: "Teste Grátis de 7 Dias", desc: "Experimente antes de comprar", color: "text-warning" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm sm:text-base text-foreground">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Buy;
