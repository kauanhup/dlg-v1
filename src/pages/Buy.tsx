import { Check, Sparkles, Crown, Shield, Clock, Zap, CreditCard, Loader2, Gift, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header, Footer } from "@/components/landing";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUpgradeCredit } from "@/hooks/useUpgradeCredit";

interface Plan {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  period: number;
  features: string[] | null;
  is_active: boolean;
}

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

const formatPeriod = (days: number): string => {
  if (days === 0) return "pagamento único";
  if (days === 7) return "por 7 dias";
  if (days === 15) return "por 15 dias";
  if (days === 30) return "por 30 dias";
  if (days === 90) return "por 3 meses";
  if (days === 180) return "por 6 meses";
  if (days === 365) return "por 1 ano";
  return `por ${days} dias`;
};

const Buy = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  // Get upgrade credit info
  const { activeSubscription, calculateFinalPrice, isLoading: creditLoading } = useUpgradeCredit(userId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get user ID for credit calculation
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (!error && data) {
        setPlans(data);
      }
      setIsLoading(false);
    };

    fetchPlans();
  }, []);

  // Determine which plans are "popular" (cheapest with period >= 30) and "lifetime" (period = 0)
  const getCardStyle = (plan: Plan, index: number) => {
    const isLifetime = plan.period === 0;
    const isPopular = !isLifetime && plan.period >= 30 && index === plans.findIndex(p => p.period >= 30 && p.period !== 0);
    return { isPopular, isLifetime };
  };

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

          {/* Upgrade Credit Banner */}
          {activeSubscription && activeSubscription.credit_value > 0 && (
            <motion.div 
              className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-success/10 border border-success/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-success">Crédito de Upgrade Disponível!</h4>
                  <p className="text-sm text-muted-foreground">
                    Você tem <span className="font-bold text-success">R$ {activeSubscription.credit_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> de crédito 
                    ({activeSubscription.days_remaining} dias restantes do plano {activeSubscription.plan_name})
                  </p>
                </div>
                <ArrowUpCircle className="w-6 h-6 text-success" />
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum plano disponível no momento.
            </div>
          ) : (
            /* Plans Grid */
            <motion.div 
              className={`grid gap-4 sm:gap-5 mb-10 ${
                plans.length <= 3 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' 
                  : plans.length === 4 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              }`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {plans.map((plan, index) => {
                const { isPopular, isLifetime } = getCardStyle(plan, index);
                const displayPrice = plan.promotional_price ?? plan.price;
                
                // Calculate upgrade price with credit
                const hasCredit = activeSubscription && activeSubscription.credit_value > 0;
                const isCurrentPlan = activeSubscription?.plan_id === plan.id;
                const finalPrice = hasCredit && !isCurrentPlan ? calculateFinalPrice(displayPrice) : displayPrice;
                const showUpgradeDiscount = hasCredit && !isCurrentPlan && finalPrice < displayPrice;
                
                return (
                  <motion.div
                    key={plan.id}
                    variants={cardVariants}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    className={`relative p-5 sm:p-6 rounded-2xl transition-shadow overflow-visible ${
                      isCurrentPlan
                        ? "border-2 border-muted opacity-60"
                        : isPopular 
                          ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10 mt-4" 
                          : isLifetime 
                            ? "border-2 border-warning/50 bg-warning/5 mt-4" 
                            : "border border-border bg-card hover:shadow-lg hover:shadow-primary/5"
                    }`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground shadow-md whitespace-nowrap">
                          Plano Atual
                        </span>
                      </div>
                    )}
                    
                    {!isCurrentPlan && isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md whitespace-nowrap">
                          <Sparkles className="w-3 h-3" />
                          Popular
                        </span>
                      </div>
                    )}
                    
                    {!isCurrentPlan && isLifetime && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-warning text-warning-foreground shadow-md whitespace-nowrap">
                          <Crown className="w-3 h-3" />
                          Vitalício
                        </span>
                      </div>
                    )}

                    <div className="mb-5">
                      <h3 className="font-display font-bold text-lg mb-1">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {isLifetime ? "Licença permanente" : `Acesso por ${plan.period} dias`}
                      </p>
                      
                      {/* Price display with upgrade credit */}
                      {showUpgradeDiscount ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm text-success">R$</span>
                            <span className="text-3xl font-display font-bold text-success">
                              {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-xs text-success mt-1 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            Crédito aplicado: -R$ {activeSubscription!.credit_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm text-muted-foreground">R$</span>
                            <span className="text-3xl font-display font-bold">
                              {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          {plan.promotional_price && (
                            <p className="text-xs text-muted-foreground line-through mt-1">
                              R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </p>
                          )}
                        </>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{formatPeriod(plan.period)}</p>
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isPopular ? 'bg-primary/20' : isLifetime ? 'bg-warning/20' : 'bg-success/20'
                            }`}>
                              <Check className={`w-3 h-3 ${isPopular ? 'text-primary' : isLifetime ? 'text-warning' : 'text-success'}`} />
                            </div>
                            <span className="text-muted-foreground text-xs sm:text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {isCurrentPlan ? (
                      <Button 
                        className="w-full h-11"
                        variant="outline"
                        disabled
                      >
                        Plano Atual
                      </Button>
                    ) : (
                      <Link to={`/checkout?plano=${plan.id}`} className="w-full">
                        <Button 
                          className={`w-full h-11 ${
                            showUpgradeDiscount
                              ? 'bg-success hover:bg-success/90 text-success-foreground'
                              : isPopular 
                                ? 'bg-primary hover:bg-primary/90' 
                                : isLifetime 
                                  ? 'bg-warning hover:bg-warning/90 text-warning-foreground' 
                                  : ''
                          }`}
                          variant={showUpgradeDiscount || isPopular || isLifetime ? "default" : "outline"}
                        >
                          {showUpgradeDiscount 
                            ? 'Fazer Upgrade' 
                            : (plan.promotional_price ?? plan.price) === 0 
                              ? 'Testar Agora' 
                              : 'Comprar agora'}
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

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
