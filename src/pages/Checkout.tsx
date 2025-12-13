import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MorphingSquare } from "@/components/ui/morphing-square";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";

const plans: Record<string, { name: string; price: string; period: string; features: string[] }> = {
  "7dias": {
    name: "7 Dias",
    price: "47",
    period: "por 7 dias",
    features: ["Até 3 contas Telegram", "500 adições/dia", "Dashboard básico", "Suporte por email"],
  },
  "15dias": {
    name: "15 Dias",
    price: "77",
    period: "por 15 dias",
    features: ["Até 5 contas Telegram", "1.000 adições/dia", "Dashboard completo", "Suporte prioritário"],
  },
  "30dias": {
    name: "30 Dias",
    price: "127",
    period: "por 30 dias",
    features: ["Até 10 contas Telegram", "2.500 adições/dia", "Dashboard completo", "Rotação automática", "Suporte 24/7"],
  },
  "1ano": {
    name: "1 Ano",
    price: "997",
    period: "por 1 ano",
    features: ["Até 25 contas Telegram", "5.000 adições/dia", "Todos os recursos", "Suporte VIP"],
  },
  "vitalicio": {
    name: "Vitalício",
    price: "1.997",
    period: "pagamento único",
    features: ["Contas ilimitadas", "Adições ilimitadas", "Todos os recursos", "Atualizações vitalícias", "Suporte VIP prioritário"],
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useAlertToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const planId = searchParams.get("plano") || "30dias";
  const plan = plans[planId] || plans["30dias"];

  // Simular verificação de login (substituir por auth real depois)
  const [isLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  useEffect(() => {
    // Se não estiver logado, redireciona pro login com o plano como parâmetro
    if (!isLoggedIn) {
      navigate(`/login?redirect=/checkout?plano=${planId}`);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate, planId]);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simular processamento de pagamento
    setTimeout(() => {
      toast.success("Pagamento iniciado!", "Você será redirecionado para o pagamento via PIX.");
      setIsProcessing(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatedShaderBackground className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <MorphingSquare message="Carregando checkout..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>

      <main className="relative z-10 pt-12 pb-16 sm:pt-16 sm:pb-20 min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Back button */}
            <Link 
              to="/comprar" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar aos planos
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Plan Summary */}
              <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">Resumo do Pedido</h2>
                    <p className="text-sm text-muted-foreground">Plano selecionado</p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-display font-bold text-xl">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.period}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-display font-bold">R$ {plan.price}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mt-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border/50 mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-display font-bold text-primary">R$ {plan.price}</span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display font-bold text-lg mb-6">Pagamento</h2>

                <div className="space-y-4">
                  <div className="bg-muted/50 border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                        <span className="text-success font-bold text-sm">PIX</span>
                      </div>
                      <span className="font-medium">Pagamento via PIX</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pagamento instantâneo. Sua licença será liberada automaticamente após a confirmação.
                    </p>
                  </div>

                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-12 sm:h-14 text-base bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <MorphingSquare className="w-5 h-5" />
                        Processando...
                      </span>
                    ) : (
                      "Pagar com PIX"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
