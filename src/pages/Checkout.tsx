import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Check, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MorphingSquare } from "@/components/ui/morphing-square";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useAlertToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get parameters from location state (from Dashboard) OR searchParams (from Buy page)
  const locationState = location.state as { type?: string; qty?: number; price?: string } | null;
  
  // Priority: location state > search params
  const type = locationState?.type || searchParams.get("type");
  const qty = locationState?.qty?.toString() || searchParams.get("qty");
  const price = locationState?.price || searchParams.get("price");
  const planId = searchParams.get("plano");

  // Parse price from string like "R$ 99,90" or number
  const parsePrice = (priceValue: string | number | null | undefined): number => {
    if (!priceValue) return 0;
    if (typeof priceValue === 'number') return priceValue;
    // Remove "R$", spaces, and convert comma to dot
    const cleaned = priceValue.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  // Determine session type for database
  const getSessionType = (typeStr: string | null): string => {
    if (!typeStr) return '';
    if (typeStr.toLowerCase().includes('brasileir')) return 'brasileiras';
    if (typeStr.toLowerCase().includes('estrangeir')) return 'estrangeiras';
    return typeStr.toLowerCase();
  };

  // Determine if it's a session purchase or plan purchase
  const isSessionPurchase = type && qty && price;

  const sessionInfo = isSessionPurchase ? {
    type: type.includes('Brasileir') ? 'Sessions Brasileiras' : type.includes('Estrangeir') ? 'Sessions Estrangeiras' : type,
    dbType: getSessionType(type),
    quantity: parseInt(qty || '0'),
    price: parsePrice(price),
  } : null;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Build redirect URL with all current params
        const currentUrl = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    
    try {
      if (isSessionPurchase && sessionInfo) {
        // Create order for session purchase
        const { data: orderData, error: orderError } = await supabase.from('orders').insert({
          user_id: user.id,
          product_name: sessionInfo.type,
          product_type: sessionInfo.dbType,
          quantity: sessionInfo.quantity,
          amount: sessionInfo.price,
          status: 'pending',
          payment_method: 'pix',
        }).select().single();

        if (orderError) throw orderError;

        // Create payment record
        const { error: paymentError } = await supabase.from('payments').insert({
          user_id: user.id,
          order_id: orderData.id,
          amount: sessionInfo.price,
          payment_method: 'pix',
          status: 'pending',
        });

        if (paymentError) console.error('Payment record error:', paymentError);

        toast.success("Pedido criado!", "Aguardando confirmação do pagamento PIX.");
        
        // Redirect back to dashboard after order creation
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (planId) {
        // Handle plan purchase (license)
        toast.success("Pagamento iniciado!", "Você será redirecionado para o pagamento via PIX.");
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Erro", "Não foi possível criar o pedido. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
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

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Order Summary */}
              <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">Resumo do Pedido</h2>
                    <p className="text-sm text-muted-foreground">Confira os detalhes</p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  {isSessionPurchase && sessionInfo ? (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-display font-bold text-xl">{sessionInfo.type}</h3>
                          <p className="text-sm text-muted-foreground">{sessionInfo.quantity} sessions</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-display font-bold">{formatPrice(sessionInfo.price)}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mt-6">
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          {sessionInfo.quantity} sessions incluídas
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          Download imediato após confirmação
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          Suporte incluído
                        </li>
                      </ul>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum produto selecionado</p>
                    </div>
                  )}
                </div>

                {isSessionPurchase && sessionInfo && (
                  <div className="border-t border-border/50 mt-6 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-2xl font-display font-bold text-primary">{formatPrice(sessionInfo.price)}</span>
                    </div>
                  </div>
                )}
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
                      Pagamento instantâneo. Suas sessions serão liberadas automaticamente após a confirmação.
                    </p>
                  </div>

                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing || !isSessionPurchase}
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
