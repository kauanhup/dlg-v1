import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  period: number;
  features: string[];
  is_active: boolean;
}

const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatPeriod = (days: number) => {
  if (days === 0) return "Vitalício";
  if (days === 7) return "7 dias";
  if (days === 14) return "14 dias";
  if (days === 30) return "30 dias";
  if (days === 90) return "90 dias";
  if (days === 180) return "180 dias";
  if (days === 365) return "1 ano";
  return `${days} dias`;
};

const Pricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;

        const allPlans = data || [];
        
        // Pega os 2 primeiros e o último
        if (allPlans.length <= 3) {
          setPlans(allPlans);
        } else {
          const selectedPlans = [
            allPlans[0],
            allPlans[1],
            allPlans[allPlans.length - 1]
          ];
          setPlans(selectedPlans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPopularIndex = () => {
    if (plans.length === 0) return -1;
    if (plans.length <= 2) return plans.length - 1;
    return 1; // Middle plan
  };

  const popularIndex = getPopularIndex();

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-12"
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

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum plano disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = index === popularIndex;
              const effectivePrice = plan.promotional_price ?? plan.price;
              const hasPromo = plan.promotional_price !== null && plan.promotional_price < plan.price;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative p-6 rounded-xl transition-all duration-300 ${
                    isPopular 
                      ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-105" 
                      : "border border-border bg-card hover:shadow-lg hover:shadow-primary/5"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md whitespace-nowrap">
                        ⭐ Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-5 pt-2">
                    <h3 className="font-display font-bold text-lg mb-3">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-sm text-muted-foreground">R$</span>
                      {hasPromo ? (
                        <>
                          <span className="text-3xl font-display font-bold text-success">{formatPrice(effectivePrice)}</span>
                          <span className="text-sm text-muted-foreground line-through ml-2">R$ {formatPrice(plan.price)}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-display font-bold">{formatPrice(effectivePrice)}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatPeriod(plan.period)}</p>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2.5 mb-5">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPopular ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <Check className={`w-3 h-3 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <span className="text-muted-foreground text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link to="/comprar" className="w-full">
                    <Button 
                      className={`w-full h-11 ${
                        isPopular 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                          : ''
                      }`}
                      variant={isPopular ? "default" : "outline"}
                    >
                      Começar Agora
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

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
