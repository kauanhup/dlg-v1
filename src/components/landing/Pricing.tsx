import { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
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
  if (days === 90) return "3 meses";
  if (days === 180) return "6 meses";
  if (days === 365) return "1 ano";
  return `${days} dias`;
};

const planIcons = [Zap, Sparkles, Crown, Sparkles];
const planColors = [
  { bg: "from-blue-500/10 to-blue-500/5", border: "border-blue-500/20", accent: "text-blue-500", glow: "shadow-blue-500/20" },
  { bg: "from-primary/10 to-primary/5", border: "border-primary/30", accent: "text-primary", glow: "shadow-primary/30" },
  { bg: "from-yellow-500/10 to-yellow-500/5", border: "border-yellow-500/20", accent: "text-yellow-500", glow: "shadow-yellow-500/20" },
  { bg: "from-purple-500/10 to-purple-500/5", border: "border-purple-500/20", accent: "text-purple-500", glow: "shadow-purple-500/20" },
];

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
        
        // Show up to 4 plans
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
    return 2; // Third plan for 4 plans
  };

  const popularIndex = getPopularIndex();

  return (
    <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Planos Flexíveis</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-5 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Escolha seu plano
          </h2>
          <p className="text-muted-foreground text-lg">
            Invista no crescimento do seu grupo. Sem mensalidade, sem surpresas.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum plano disponível no momento.
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 ${plans.length >= 3 ? 'lg:grid-cols-3' : ''} ${plans.length >= 4 ? 'xl:grid-cols-4' : ''} gap-6 max-w-7xl mx-auto`}>
            {plans.map((plan, index) => {
              const isPopular = index === popularIndex;
              const effectivePrice = plan.promotional_price ?? plan.price;
              const hasPromo = plan.promotional_price !== null && plan.promotional_price < plan.price;
              const colors = planColors[index % planColors.length];
              const Icon = planIcons[index % planIcons.length];

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className={`relative group`}
                >
                  {/* Card */}
                  <div className={`relative h-full p-6 rounded-2xl border-2 transition-all duration-500 bg-gradient-to-b ${colors.bg} backdrop-blur-sm ${
                    isPopular 
                      ? `border-primary shadow-2xl ${colors.glow}` 
                      : `${colors.border} hover:border-primary/40 hover:shadow-xl hover:${colors.glow}`
                  }`}>
                    
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <motion.span 
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Sparkles className="w-3 h-3" />
                          MAIS POPULAR
                        </motion.span>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center mb-5 ${isPopular ? 'mt-2' : ''}`}>
                      <Icon className={`w-6 h-6 ${colors.accent}`} />
                    </div>

                    {/* Plan Name */}
                    <h3 className="font-display font-bold text-xl mb-2 text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-5">{formatPeriod(plan.period)} de acesso</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">R$</span>
                        {hasPromo ? (
                          <>
                            <span className={`text-4xl font-display font-bold ${colors.accent}`}>{formatPrice(effectivePrice)}</span>
                            <span className="text-sm text-muted-foreground line-through ml-2">R$ {formatPrice(plan.price)}</span>
                          </>
                        ) : (
                          <span className="text-4xl font-display font-bold text-foreground">{formatPrice(effectivePrice)}</span>
                        )}
                      </div>
                      {hasPromo && (
                        <motion.span 
                          className="inline-block mt-2 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium"
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Economia de R$ {formatPrice(plan.price - effectivePrice)}
                        </motion.span>
                      )}
                    </div>

                    {/* Features */}
                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-start gap-3 text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isPopular ? 'bg-primary/20' : colors.bg
                            } border ${isPopular ? 'border-primary/30' : colors.border}`}>
                              <Check className={`w-3 h-3 ${isPopular ? 'text-primary' : colors.accent}`} />
                            </div>
                            <span className="text-muted-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}

                    {/* CTA Button */}
                    <Link to="/comprar" className="w-full block mt-auto">
                      <Button 
                        className={`w-full h-12 font-semibold transition-all duration-300 ${
                          isPopular 
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30' 
                            : 'hover:bg-primary hover:text-primary-foreground'
                        }`}
                        variant={isPopular ? "default" : "outline"}
                      >
                        {effectivePrice === 0 ? 'Testar Grátis' : 'Escolher Plano'}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/comprar">
            <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-2">
              Ver todos os planos disponíveis
              <span className="text-lg">→</span>
            </Button>
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {[
            { icon: "💳", text: "Pagamento via PIX" },
            { icon: "⚡", text: "Entrega Imediata" },
            { icon: "🔒", text: "100% Seguro" },
            { icon: "✨", text: "Sem Mensalidade" },
          ].map((badge, i) => (
            <motion.div
              key={badge.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary), 0.05)" }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm text-muted-foreground">{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;