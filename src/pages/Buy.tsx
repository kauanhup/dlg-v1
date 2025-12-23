import { Check, Loader2, Gift, ArrowUpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header, Footer } from "@/components/landing";
import { useEffect, useState, useRef } from "react";
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

const formatPeriod = (days: number): string => {
  if (days === 0) return "Vitalício";
  if (days === 7) return "7 dias";
  if (days === 15) return "15 dias";
  if (days === 30) return "30 dias";
  if (days === 90) return "3 meses";
  if (days === 180) return "6 meses";
  if (days === 365) return "1 ano";
  return `${days} dias`;
};

const Buy = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { activeSubscription, calculateFinalPrice, isValidUpgrade } = useUpgradeCredit(userId);

  useEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

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

  // Particles animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      canvas.height = Math.max(1, Math.floor(rect?.height ?? window.innerHeight));
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = (): P => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(139,92,246,${p.o * 0.5})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas.parentElement || document.body);

    init();
    raf = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const getPopularIndex = () => {
    if (plans.length === 0) return -1;
    if (plans.length <= 2) return plans.length - 1;
    if (plans.length === 3) return 1;
    return 2;
  };

  const popularIndex = getPopularIndex();

  return (
    <div 
      className={`min-h-screen bg-background ${ready ? "is-ready" : ""}`}
      style={{
        "--card-bg": "rgba(15, 15, 20, 0.6)",
        "--card-pop": "rgba(139, 92, 246, 0.08)",
        "--border-color": "rgba(139, 92, 246, 0.2)",
        "--btn-ghost-border": "rgba(139, 92, 246, 0.3)",
        "--btn-ghost-hover": "rgba(139, 92, 246, 0.1)",
      } as React.CSSProperties}
    >
      <style>{`
        .card-buy{background:var(--card-bg);border:1px solid var(--border-color);border-radius:16px;backdrop-filter:blur(8px)}
        .card-buy-pop{background:var(--card-pop);border:1px solid hsl(var(--primary) / 0.4);border-radius:16px;box-shadow:0 10px 30px rgba(139,92,246,.15);backdrop-filter:blur(8px)}
        .card-animate{opacity:0;transform:translateY(12px)}
        .is-ready .card-animate{animation:fadeUp .6s ease forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
        .btn-buy{width:100%;border-radius:12px;padding:12px 20px;font-weight:600;font-size:14px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));transition:transform .15s ease,filter .15s ease}
        .btn-buy:hover{filter:brightness(1.1)}
        .btn-buy:active{transform:translateY(1px)}
        .btn-buy-ghost{width:100%;border-radius:12px;padding:12px 20px;font-weight:600;font-size:14px;color:hsl(var(--foreground));border:1px solid var(--btn-ghost-border);background:transparent;transition:background .2s ease,transform .15s ease}
        .btn-buy-ghost:hover{background:var(--btn-ghost-hover)}
        .btn-buy-ghost:active{transform:translateY(1px)}
        .btn-buy-success{width:100%;border-radius:12px;padding:12px 20px;font-weight:600;font-size:14px;background:hsl(var(--success));color:hsl(var(--success-foreground));transition:transform .15s ease,filter .15s ease}
        .btn-buy-success:hover{filter:brightness(1.1)}
        .title-animate{opacity:0;transform:translateY(8px)}
        .is-ready .title-animate{animation:tIn .6s cubic-bezier(.22,1,.36,1) .1s forwards}
        @keyframes tIn{to{opacity:1;transform:none}}
        .vignette-buy{position:fixed;inset:0;pointer-events:none;background:radial-gradient(80% 60% at 50% 20%, rgba(139,92,246,.06), transparent 60%)}
      `}</style>

      <Header />

      <div className="vignette-buy" />
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" />

      <main className="relative z-10 pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Title */}
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="title-animate text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
              Escolha seu plano
            </h1>
          </motion.div>

          {/* Upgrade Credit Banner */}
          {activeSubscription && activeSubscription.credit_value > 0 && (
            <motion.div 
              className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-success/10 border border-success/30 backdrop-blur-sm"
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
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum plano disponível no momento.
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${
              plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
              plans.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {plans.map((plan, index) => {
                const isPopular = index === popularIndex;
                const displayPrice = plan.promotional_price ?? plan.price;
                const hasPromo = plan.promotional_price !== null && plan.promotional_price < plan.price;
                
                const hasActiveSubscription = !!activeSubscription;
                const isCurrentPlan = activeSubscription?.plan_id === plan.id;
                const canUpgrade = isValidUpgrade(displayPrice);
                const isDowngrade = hasActiveSubscription && !isCurrentPlan && !canUpgrade;
                
                const hasCredit = activeSubscription && activeSubscription.credit_value > 0;
                const finalPrice = hasCredit && !isCurrentPlan && canUpgrade ? calculateFinalPrice(displayPrice) : displayPrice;
                const showUpgradeDiscount = hasCredit && !isCurrentPlan && canUpgrade && finalPrice < displayPrice;

                return (
                  <div
                    key={plan.id}
                    className={`card-animate relative flex flex-col p-6 ${
                      isCurrentPlan || isDowngrade 
                        ? "card-buy opacity-50" 
                        : isPopular 
                          ? "card-buy-pop" 
                          : "card-buy"
                    }`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    {/* Badges */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                          Plano Atual
                        </span>
                      </div>
                    )}

                    {isDowngrade && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/70 text-muted-foreground">
                          Indisponível
                        </span>
                      </div>
                    )}

                    <div className={isCurrentPlan || isDowngrade ? "mt-2" : ""}>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {formatPeriod(plan.period)} de acesso
                      </p>

                      {/* Price */}
                      {showUpgradeDiscount ? (
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-success">
                              R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-xs text-success mt-1 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            Crédito: -R$ {activeSubscription!.credit_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-foreground">
                              R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          {hasPromo && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground line-through">
                                R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                                -{Math.round((1 - displayPrice / plan.price) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    {plan.features && plan.features.length > 0 && (
                      <ul className="flex-1 space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isPopular ? 'bg-primary/20' : 'bg-primary/10'
                            }`}>
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA Button */}
                    {isCurrentPlan ? (
                      <button className="btn-buy-ghost opacity-50 cursor-not-allowed" disabled>
                        Plano Atual
                      </button>
                    ) : isDowngrade ? (
                      <button className="btn-buy-ghost opacity-50 cursor-not-allowed" disabled>
                        Indisponível
                      </button>
                    ) : (
                      <Link to={`/checkout?plano=${plan.id}`} className="w-full">
                        <button className={showUpgradeDiscount ? "btn-buy-success" : isPopular ? "btn-buy" : "btn-buy-ghost"}>
                          {showUpgradeDiscount 
                            ? 'Fazer Upgrade' 
                            : displayPrice === 0 
                              ? 'Testar Grátis' 
                              : 'Escolher Plano'}
                        </button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Buy;
