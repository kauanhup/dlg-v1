import { useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useScrollAnimation";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { formatPrice, formatPeriod } from "@/lib/formatters";

const ease = [0.25, 0.1, 0.25, 1] as const;

const Pricing = () => {
  const { plans, isLoading, popularIndex } = useSubscriptionPlans();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1, margin: "-40px" });
  const prefersReducedMotion = usePrefersReducedMotion();

  // Particles - mais leve
  useEffect(() => {
    if (prefersReducedMotion) return;

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
      v: Math.random() * 0.08 + 0.02,
      o: Math.random() * 0.15 + 0.05,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 40000);
      for (let i = 0; i < Math.min(count, 15); i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
        }
        ctx.fillStyle = `rgba(139,92,246,${p.o * 0.25})`;
        ctx.fillRect(p.x, p.y, 0.5, 1);
      });
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => { setSize(); init(); });
    ro.observe(canvas.parentElement || document.body);
    init();
    raf = requestAnimationFrame(draw);

    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} id="pricing" className="relative min-h-screen overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="py-16 sm:py-24 lg:py-32">
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center">
            <motion.div 
              className="mx-auto max-w-xl text-center px-2"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease }}
            >
              <h2 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
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
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3 }}
              >
                Nenhum plano disponível no momento.
              </motion.div>
            ) : (
              <div className={`mt-8 sm:mt-14 grid w-full gap-3 sm:gap-6 lg:gap-8 ${
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
                      className={`relative flex flex-col p-4 sm:p-6 rounded-xl sm:rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
                        isPopular 
                          ? "bg-primary/5 border-primary/40 scale-[1.01] sm:scale-[1.02] shadow-lg shadow-primary/20" 
                          : "bg-card/60 border-border hover:border-primary/30"
                      }`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    >
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">{plan.name}</h3>
                        <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-bold text-foreground">R$ {formatPrice(effectivePrice)}</span>
                          {hasPromo && (
                            <span className="ml-2 text-xs sm:text-sm text-muted-foreground line-through">
                              R$ {formatPrice(plan.price)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                          {formatPeriod(plan.period)} de acesso
                        </p>
                        {hasPromo && (
                          <span className="mt-2 inline-block rounded-md bg-green-500/10 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-green-500">
                            Economia de R$ {formatPrice(plan.price - effectivePrice)}
                          </span>
                        )}
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <ul className="mt-4 sm:mt-6 flex-1 space-y-2 sm:space-y-3">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-muted-foreground">
                              <Check className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link to="/comprar" className="mt-4 sm:mt-6 block">
                        <button 
                          className={`w-full rounded-lg sm:rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                            isPopular 
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                              : "bg-transparent border border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50"
                          }`}
                        >
                          {effectivePrice === 0 ? 'Testar Grátis' : 'Escolher Plano'}
                        </button>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <motion.div 
              className="mt-8 sm:mt-10 text-center"
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3, ease }}
            >
              <Link to="/comprar">
                <button className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm text-primary bg-transparent rounded-xl transition-all duration-200 hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98]">
                  Ver todos os planos
                  <span className="text-lg">→</span>
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
