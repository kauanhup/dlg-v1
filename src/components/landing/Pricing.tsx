import { useEffect, useRef, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";

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
  if (days === 90) return "3 meses";
  if (days === 180) return "6 meses";
  if (days === 365) return "1 ano";
  return `${days} dias`;
};

// GPU-optimized easing
const gpuEase = [0.25, 0.1, 0.25, 1] as const;

const Pricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { 
    once: true, 
    amount: 0.2
  });

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
        
        if (allPlans.length <= 4) {
          setPlans(allPlans);
        } else {
          const selectedPlans = [
            allPlans[0],
            allPlans[1],
            allPlans[Math.floor(allPlans.length / 2)],
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
    if (plans.length === 3) return 1;
    return 2;
  };

  const popularIndex = getPopularIndex();

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, hsl(var(--card) / 0.3) 50%, transparent 100%)'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div 
          className="mx-auto max-w-2xl text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: gpuEase }}
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Planos e Preços
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha o plano ideal para o seu crescimento
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <motion.div 
            className="text-center py-20 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Nenhum plano disponível no momento.
          </motion.div>
        ) : (
          <div className={`grid w-full gap-6 lg:gap-8 ${
            plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
            plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
            plans.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {plans.map((plan, index) => {
              const isPopular = index === popularIndex;
              const effectivePrice = plan.promotional_price ?? plan.price;
              const hasPromo = plan.promotional_price !== null && plan.promotional_price < plan.price;

              return (
                <motion.div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                    isPopular 
                      ? "bg-gradient-to-b from-primary/10 via-card/80 to-card/50 border-2 border-primary/50 shadow-xl shadow-primary/10 scale-[1.02] lg:scale-105" 
                      : "glass-card hover:border-primary/20"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: gpuEase }}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-[hsl(187,85%,43%)] text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatPeriod(plan.period)} de acesso</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-bold text-foreground">R$ {formatPrice(effectivePrice)}</span>
                    </div>
                    {hasPromo && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          R$ {formatPrice(plan.price)}
                        </span>
                        <span className="inline-block rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          Economia de R$ {formatPrice(plan.price - effectivePrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {plan.features && plan.features.length > 0 && (
                    <ul className="flex-1 space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-success" />
                          </div>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  <Link to="/comprar" className="mt-auto block">
                    <Button 
                      className={`w-full h-12 font-semibold transition-all duration-300 ${
                        isPopular 
                          ? "btn-primary-glow hover:scale-[1.02]" 
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {effectivePrice === 0 ? 'Testar Grátis' : 'Escolher Plano'}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* See all plans link */}
        <motion.div 
          className="mt-10 sm:mt-12 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.4, ease: gpuEase }}
        >
          <Link to="/comprar">
            <Button 
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/5 font-semibold"
            >
              Ver todos os planos
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;