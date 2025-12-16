import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Check, CreditCard, ArrowLeft, Copy, CheckCircle2, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MorphingSquare } from "@/components/ui/morphing-square";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { supabase } from "@/integrations/supabase/client";

interface PixData {
  pixCode: string;
  qrCodeBase64?: string;
  transactionId: string;
  expiresAt?: string;
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useAlertToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');

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

  // Subscribe to order status changes
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setPaymentStatus(newStatus);
          
          if (newStatus === 'completed' || newStatus === 'paid') {
            toast.success("Pagamento confirmado!", "Suas sessions foram liberadas.");
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, navigate, toast]);

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

        setOrderId(orderData.id);

        // Create payment record
        const { error: paymentError } = await supabase.from('payments').insert({
          user_id: user.id,
          order_id: orderData.id,
          amount: sessionInfo.price,
          payment_method: 'pix',
          status: 'pending',
        });

        if (paymentError) console.error('Payment record error:', paymentError);

        // Generate PIX via gateway
        const { data: pixResponse, error: pixError } = await supabase.functions.invoke('pixup', {
          body: {
            action: 'create_pix',
            amount: sessionInfo.price,
            orderId: orderData.id,
            description: `${sessionInfo.quantity}x ${sessionInfo.type}`,
          },
        });

        if (pixError) {
          console.error('PIX generation error:', pixError);
          toast.error("Gateway indisponível", "Pedido criado. Configure o gateway PIX ou aguarde aprovação manual.");
        } else if (pixResponse?.pixCode) {
          setPixData({
            pixCode: pixResponse.pixCode,
            qrCodeBase64: pixResponse.qrCodeBase64,
            transactionId: pixResponse.transactionId,
            expiresAt: pixResponse.expiresAt,
          });

          // Update payment with PIX code
          await supabase.from('payments').update({
            pix_code: pixResponse.pixCode,
          }).eq('order_id', orderData.id);

          toast.success("PIX gerado!", "Escaneie o QR Code ou copie o código para pagar.");
        } else {
          toast.warning("Gateway não configurado", "Pedido criado. Aguarde aprovação manual do admin.");
        }
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

  const copyPixCode = async () => {
    if (!pixData?.pixCode) return;
    
    try {
      await navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      toast.success("Copiado!", "Código PIX copiado para a área de transferência.");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Erro", "Não foi possível copiar o código.");
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

                {!pixData ? (
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
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Gerando PIX...
                        </span>
                      ) : (
                        "Gerar código PIX"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Payment Status */}
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                      paymentStatus === 'completed' || paymentStatus === 'paid'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {paymentStatus === 'completed' || paymentStatus === 'paid' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Pagamento confirmado!</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="font-medium">Aguardando pagamento...</span>
                        </>
                      )}
                    </div>

                    {/* QR Code */}
                    {pixData.qrCodeBase64 && (
                      <div className="flex justify-center p-4 bg-white rounded-xl">
                        <img 
                          src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                          alt="QR Code PIX" 
                          className="w-48 h-48"
                        />
                      </div>
                    )}

                    {!pixData.qrCodeBase64 && (
                      <div className="flex justify-center p-4 bg-muted/50 rounded-xl">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <QrCode className="w-16 h-16" />
                          <span className="text-sm">QR Code não disponível</span>
                        </div>
                      </div>
                    )}

                    {/* PIX Code */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Código PIX Copia e Cola:</label>
                      <div className="relative">
                        <div className="bg-muted/50 border border-border/50 rounded-lg p-3 pr-12 font-mono text-xs break-all max-h-24 overflow-y-auto">
                          {pixData.pixCode}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={copyPixCode}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Após o pagamento, suas sessions serão liberadas automaticamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
