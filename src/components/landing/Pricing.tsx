import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, useInView } from "framer-motion";

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

// Smooth easing curve
const smoothEase = [0.22, 1, 0.36, 1] as const;

const Pricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { 
    once: false, 
    amount: 0.15,
    margin: "-50px 0px -50px 0px"
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
      v: Math.random() * 0.2 + 0.04,
      o: Math.random() * 0.3 + 0.1,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 14000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.2 + 0.04;
          p.o = Math.random() * 0.3 + 0.1;
        }
        ctx.fillStyle = `rgba(139,92,246,${p.o * 0.4})`;
        ctx.fillRect(p.x, p.y, 0.6, 2);
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
    <section
      ref={sectionRef}
      id="pricing"
      className="relative min-h-screen overflow-hidden py-24 sm:py-32"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center">
          <motion.div 
            className="mx-auto max-w-xl text-center"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 30, filter: "blur(10px)" }}
            transition={{ duration: 0.7, ease: smoothEase }}
          >
            <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Planos e Preços
            </h2>
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
              transition={{ duration: 0.5 }}
            >
              Nenhum plano disponível no momento.
            </motion.div>
          ) : (
            <div className={`mt-10 sm:mt-14 grid w-full gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0 ${
              plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
              plans.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {plans.map((plan, index) => {
                const isPopular = index === popularIndex;
                const effectivePrice = plan.promotional_price ?? plan.price;
                const hasPromo = plan.promotional_price !== null && plan.promotional_price < plan.price;

                return (
                  <motion.div
                    key={plan.id}
                    className={`relative flex flex-col p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                      isPopular 
                        ? "bg-primary/5 border-primary/40 scale-[1.02] shadow-lg shadow-primary/20" 
                        : "bg-card/60 border-border hover:border-primary/30"
                    }`}
                    initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                    animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 40, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: smoothEase }}
                    whileHover={{ 
                      y: -4, 
                      transition: { duration: 0.25, ease: smoothEase } 
                    }}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">R$ {formatPrice(effectivePrice)}</span>
                        {hasPromo && (
                          <span className="ml-2 text-sm text-muted-foreground line-through">
                            R$ {formatPrice(plan.price)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPeriod(plan.period)} de acesso
                      </p>
                      {hasPromo && (
                        <span className="mt-2 inline-block rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                          Economia de R$ {formatPrice(plan.price - effectivePrice)}
                        </span>
                      )}
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <ul className="mt-6 flex-1 space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link to="/comprar" className="mt-6 block">
                      <motion.button 
                        className={`w-full rounded-xl px-5 py-3 font-semibold text-sm transition-all duration-300 ${
                          isPopular 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                            : "bg-transparent border border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        {effectivePrice === 0 ? 'Testar Grátis' : 'Escolher Plano'}
                      </motion.button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <motion.div 
            className="mt-8 sm:mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4, ease: smoothEase }}
          >
            <Link to="/comprar">
              <motion.button 
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm text-primary bg-transparent rounded-xl transition-all duration-300 hover:bg-primary/10"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Ver todos os planos
                <span className="text-lg">→</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
