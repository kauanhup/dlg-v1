import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
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

const Pricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 12000);
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
    <section
      id="pricing"
      data-locked
      className={`relative min-h-screen overflow-hidden py-24 sm:py-32 ${ready ? "is-ready" : ""}`}
      style={{
        "--bg": "hsl(var(--background))",
        "--text": "hsl(var(--foreground))",
        "--muted": "hsl(var(--muted-foreground))",
        "--accent-line": "rgba(139, 92, 246, 0.15)",
        "--glow": "linear-gradient(90deg, rgba(139,92,246,0.4), rgba(168,85,247,0.4))",
        "--card": "rgba(15, 15, 20, 0.6)",
        "--card-pop": "rgba(139, 92, 246, 0.08)",
        "--card-muted": "rgba(10, 10, 15, 0.8)",
        "--border": "rgba(139, 92, 246, 0.2)",
        "--btn-primary-bg": "hsl(var(--primary))",
        "--btn-primary-fg": "hsl(var(--primary-foreground))",
        "--btn-ghost-border": "rgba(139, 92, 246, 0.3)",
        "--btn-ghost-hover": "rgba(139, 92, 246, 0.1)",
      } as React.CSSProperties}
    >
      <style>{`
        @media (prefers-color-scheme: light){section[data-locked]{background:var(--bg);color:var(--text);color-scheme:dark}}
        
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .accent-lines .hline,.accent-lines .vline{position:absolute;background:var(--accent-line);animation-fill-mode:forwards}
        .accent-lines .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%}
        .accent-lines .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%}
        .is-ready .accent-lines .hline:nth-of-type(1){top:18%;animation:drawX .6s ease .08s forwards}
        .is-ready .accent-lines .hline:nth-of-type(2){top:50%;animation:drawX .6s ease .16s forwards}
        .is-ready .accent-lines .hline:nth-of-type(3){top:82%;animation:drawX .6s ease .24s forwards}
        .is-ready .accent-lines .vline:nth-of-type(1){left:18%;animation:drawY .7s ease .20s forwards}
        .is-ready .accent-lines .vline:nth-of-type(2){left:50%;animation:drawY .7s ease .28s forwards}
        .is-ready .accent-lines .vline:nth-of-type(3){left:82%;animation:drawY .7s ease .36s forwards}
        @keyframes drawX{to{transform:scaleX(1)}}
        @keyframes drawY{to{transform:scaleY(1)}}
        .kicker,.title,.subtitle{opacity:0;transform:translateY(8px)}
        .is-ready .kicker{animation:kIn .5s ease .08s forwards;letter-spacing:.22em}
        .is-ready .title{animation:tIn .6s cubic-bezier(.22,1,.36,1) .16s forwards}
        .is-ready .subtitle{animation:sIn .6s ease .26s forwards}
        @keyframes kIn{to{opacity:.9;transform:none;letter-spacing:.14em}}
        @keyframes tIn{to{opacity:1;transform:none}}
        @keyframes sIn{to{opacity:1;transform:none}}
        .card{background:var(--card);border:1px solid var(--border);border-radius:16px}
        .card-pop{background:var(--card-pop);border:1px solid hsl(var(--primary) / 0.4);border-radius:16px;transform:scale(1.02);box-shadow:0 10px 30px rgba(139,92,246,.2);backdrop-filter:blur(6px)}
        .card-muted{background:var(--card-muted)}
        .card-animate{opacity:0;transform:translateY(12px)}
        .is-ready .card-animate{animation:fadeUp .6s ease forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
        .btn-primary{width:100%;border-radius:12px;padding:12px 20px;font-weight:600;font-size:14px;background:var(--btn-primary-bg);color:var(--btn-primary-fg);transition:transform .15s ease,filter .15s ease,background .2s ease}
        .btn-primary:hover{filter:brightness(1.1)}
        .btn-primary:active{transform:translateY(1px)}
        .btn-ghost{width:100%;border-radius:12px;padding:12px 20px;font-weight:600;font-size:14px;color:hsl(var(--foreground));border:1px solid var(--btn-ghost-border);background:transparent;transition:background .2s ease,transform .15s ease}
        .btn-ghost:hover{background:var(--btn-ghost-hover)}
        .btn-ghost:active{transform:translateY(1px)}
        .btn-link{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;font-weight:600;font-size:14px;color:hsl(var(--primary));background:transparent;border:none;border-radius:12px;transition:background .2s ease,transform .15s ease}
        .btn-link:hover{background:rgba(139,92,246,0.1)}
        .btn-link:active{transform:translateY(1px)}
      `}</style>

      <div className="vignette" />


      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="title font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Planos e Preços
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum plano disponível no momento.
            </div>
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
                  <div
                    key={plan.id}
                    className={`card-animate relative flex flex-col ${isPopular ? "card-pop" : "card"} p-6`}
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
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
                      <button className={isPopular ? "btn-primary" : "btn-ghost"}>
                        {effectivePrice === 0 ? 'Testar Grátis' : 'Escolher Plano'}
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 sm:mt-10 text-center">
            <Link to="/comprar">
              <button className="btn-link">
                Ver todos os planos
                <span className="text-lg">→</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
