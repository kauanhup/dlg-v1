import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Check, CreditCard, ArrowLeft, Copy, CheckCircle2, Loader2, Clock, Crown, Sparkles, ShieldCheck, Wallet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MorphingSquare } from "@/components/ui/morphing-square";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface PixData {
  pixCode: string;
  qrCodeBase64?: string;
  transactionId: string;
  expiresAt?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  period: number;
  features: string[] | null;
  max_subscriptions_per_user: number | null;
}

interface PaymentSettings {
  pixEnabled: boolean;
  evoPayEnabled: boolean;
}

type PaymentMethod = 'pix' | 'evopay';

const PIX_EXPIRATION_MINUTES = 30;

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
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ pixEnabled: true, evoPayEnabled: false });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('pix');

  // Force dark theme
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
      }
    };
  }, []);

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
  const isPlanPurchase = !!planId;

  const sessionInfo = isSessionPurchase ? {
    type: type.includes('Brasileir') ? 'Sessions Brasileiras' : type.includes('Estrangeir') ? 'Sessions Estrangeiras' : type,
    dbType: getSessionType(type),
    quantity: parseInt(qty || '0'),
    price: parsePrice(price),
  } : null;

  // Fetch plan if planId is present
  useEffect(() => {
    if (!planId) return;

    const fetchPlan = async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        console.error('Error fetching plan:', error);
        toast.error("Erro", "Plano não encontrado.");
        navigate('/comprar');
        return;
      }

      setPlan(data);
    };

    fetchPlan();
  }, [planId, navigate, toast]);

  // Get effective price for plan
  const planPrice = plan ? (plan.promotional_price ?? plan.price) : 0;
  const isFreeProduct = (isSessionPurchase && sessionInfo?.price === 0) || (isPlanPurchase && planPrice === 0);

  // Countdown timer logic
  useEffect(() => {
    if (!expirationTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = expirationTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        if (paymentStatus === 'pending') {
          toast.error("PIX expirado", "O código PIX expirou. Gere um novo código.");
          setPixData(null);
          setExpirationTime(null);
        }
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expirationTime, paymentStatus, toast]);

  // Fetch payment settings
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        // Fetch EvoPay settings
        const { data: evoData } = await supabase.functions.invoke('evopay', {
          body: { action: 'get_public_settings' }
        });
        
        setPaymentSettings({
          pixEnabled: true, // PIX always available
          evoPayEnabled: evoData?.data?.evopay_enabled || false
        });
      } catch (error) {
        console.log('Could not fetch payment settings');
      }
    };
    fetchPaymentSettings();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
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
            toast.success("Pagamento confirmado!", isPlanPurchase ? "Sua licença foi ativada." : "Suas sessions foram liberadas.");
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, navigate, toast, isPlanPurchase]);

  const handleFreeActivation = async () => {
    if (!user) return;

    setIsProcessing(true);
    
    try {
      if (isPlanPurchase && plan) {
        // Check subscription limit if set
        if (plan.max_subscriptions_per_user !== null) {
          const { count, error: countError } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('plan_id', plan.id);

          if (countError) throw countError;

          if (count !== null && count >= plan.max_subscriptions_per_user) {
            toast.error("Limite atingido", `Você já utilizou este plano o máximo de ${plan.max_subscriptions_per_user} vez(es).`);
            setIsProcessing(false);
            return;
          }
        }

        // Create subscription for free plan
        const startDate = new Date();
        const nextBillingDate = plan.period > 0 
          ? new Date(startDate.getTime() + plan.period * 24 * 60 * 60 * 1000) 
          : null;

        const { error: subError } = await supabase.from('user_subscriptions').insert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          start_date: startDate.toISOString(),
          next_billing_date: nextBillingDate?.toISOString() || null,
        });

        if (subError) throw subError;

        // Create license
        const { error: licenseError } = await supabase.from('licenses').insert({
          user_id: user.id,
          plan_name: plan.name,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: nextBillingDate?.toISOString() || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });

        if (licenseError) console.error('License error:', licenseError);

        toast.success("Plano ativado!", "Seu plano gratuito foi ativado com sucesso.");
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Error activating free plan:', error);
      toast.error("Erro", "Não foi possível ativar o plano. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!user) return;

    // Handle free products
    if (isFreeProduct) {
      await handleFreeActivation();
      return;
    }

    setIsProcessing(true);
    
    try {
      let amount: number;
      let productName: string;
      let productType: string;
      let quantity: number;

      if (isSessionPurchase && sessionInfo) {
        amount = sessionInfo.price;
        productName = sessionInfo.type;
        productType = sessionInfo.dbType;
        quantity = sessionInfo.quantity;

        // Validate stock for session purchases
        const { count, error: stockError } = await supabase
          .from('session_files')
          .select('*', { count: 'exact', head: true })
          .eq('type', productType)
          .eq('status', 'available');

        if (stockError) {
          throw new Error('Erro ao verificar estoque');
        }

        if (count === null || count < quantity) {
          toast.error("Estoque insuficiente", `Apenas ${count || 0} sessions disponíveis deste tipo.`);
          setIsProcessing(false);
          return;
        }
      } else if (isPlanPurchase && plan) {
        amount = planPrice;
        productName = plan.name;
        productType = 'subscription';
        quantity = 1;
      } else {
        throw new Error('Invalid product');
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        product_name: productName,
        product_type: productType,
        quantity: quantity,
        amount: amount,
        status: 'pending',
        payment_method: selectedPaymentMethod,
      }).select().single();

      if (orderError) throw orderError;
      setOrderId(orderData.id);

      // Create payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        user_id: user.id,
        order_id: orderData.id,
        amount: amount,
        payment_method: selectedPaymentMethod,
        status: 'pending',
      });

      if (paymentError) console.error('Payment record error:', paymentError);

      // Handle EvoPay PIX payment
      if (selectedPaymentMethod === 'evopay') {
        const { data: evoResponse, error: evoError } = await supabase.functions.invoke('evopay', {
          body: {
            action: 'create_pix',
            amount: amount,
            external_id: orderData.id,
            description: isPlanPurchase ? `Licença: ${productName}` : `${quantity}x ${productName}`,
          },
        });

        const expTime = new Date();
        expTime.setMinutes(expTime.getMinutes() + PIX_EXPIRATION_MINUTES);
        setExpirationTime(expTime);

        if (evoError) {
          console.error('EvoPay PIX generation error:', evoError);
          toast.error("Gateway indisponível", "Pedido criado. Configure o gateway PIX ou aguarde aprovação manual.");
        } else if (evoResponse?.data?.pixCode) {
          setPixData({
            pixCode: evoResponse.data.pixCode,
            qrCodeBase64: undefined,
            transactionId: evoResponse.data.transactionId,
            expiresAt: undefined,
          });

          await supabase.from('payments').update({
            pix_code: evoResponse.data.pixCode,
          }).eq('order_id', orderData.id);

          toast.success("PIX gerado!", "Escaneie o QR Code ou copie o código para pagar.");
        } else {
          toast.warning("Gateway não configurado", "Pedido criado. Aguarde aprovação manual do admin.");
        }
        return;
      }

      // Handle PIX payment (PixUp)
      const { data: pixResponse, error: pixError } = await supabase.functions.invoke('pixup', {
        body: {
          action: 'create_pix',
          amount: amount,
          external_id: orderData.id,
          description: isPlanPurchase ? `Licença: ${productName}` : `${quantity}x ${productName}`,
        },
      });

      // Set expiration time regardless of gateway response
      const expTime = new Date();
      expTime.setMinutes(expTime.getMinutes() + PIX_EXPIRATION_MINUTES);
      setExpirationTime(expTime);

      if (pixError) {
        console.error('PIX generation error:', pixError);
        toast.error("Gateway indisponível", "Pedido criado. Configure o gateway PIX ou aguarde aprovação manual.");
      } else if (pixResponse?.data?.pixCode || pixResponse?.data?.qrcode) {
        const pixCode = pixResponse.data.pixCode || pixResponse.data.qrcode;
        const qrCodeBase64 = pixResponse.data.qrCodeBase64 || pixResponse.data.qrcode_base64;
        
        setPixData({
          pixCode: pixCode,
          qrCodeBase64: qrCodeBase64,
          transactionId: pixResponse.data.transactionId || pixResponse.data.id,
          expiresAt: pixResponse.data.expiresAt,
        });

        // Update payment with PIX code
        await supabase.from('payments').update({
          pix_code: pixCode,
        }).eq('order_id', orderData.id);

        toast.success("PIX gerado!", "Escaneie o QR Code ou copie o código para pagar.");
      } else {
        toast.warning("Gateway não configurado", "Pedido criado. Aguarde aprovação manual do admin.");
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

  if (isLoading || (isPlanPurchase && !plan)) {
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

  const formatPeriod = (days: number): string => {
    if (days === 0) return "Acesso vitalício";
    if (days === 7) return "7 dias de acesso";
    if (days === 15) return "15 dias de acesso";
    if (days === 30) return "30 dias de acesso";
    if (days === 90) return "3 meses de acesso";
    if (days === 180) return "6 meses de acesso";
    if (days === 365) return "1 ano de acesso";
    return `${days} dias de acesso`;
  };

  const isExpired = timeLeft === null && expirationTime !== null;

  // Determine product info for display
  const displayInfo = isSessionPurchase && sessionInfo ? {
    title: sessionInfo.type,
    subtitle: `${sessionInfo.quantity} sessions`,
    price: sessionInfo.price,
    features: [
      `${sessionInfo.quantity} sessions incluídas`,
      'Download imediato após confirmação',
      'Suporte incluído',
    ],
    isPlan: false,
  } : isPlanPurchase && plan ? {
    title: plan.name,
    subtitle: formatPeriod(plan.period),
    price: planPrice,
    features: plan.features || [],
    isPlan: true,
    isLifetime: plan.period === 0,
  } : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="container mx-auto px-4 sm:px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link 
              to={isPlanPurchase ? "/comprar" : "/dashboard"} 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {isPlanPurchase ? "Voltar aos planos" : "Voltar ao dashboard"}
            </Link>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-lg mx-auto"
            >
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                  {pixData ? "Escaneie o QR Code" : isFreeProduct ? "Ativar Plano" : "Finalizar Compra"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {pixData ? "Abra o app do seu banco e escaneie" : isFreeProduct ? "Ative seu plano gratuito" : "Pague via PIX de forma segura"}
                </p>
              </div>

              {/* Product Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass rounded-2xl p-5 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      displayInfo?.isPlan && displayInfo?.isLifetime 
                        ? 'bg-warning/10' 
                        : 'bg-primary/10'
                    }`}>
                      {displayInfo?.isPlan && displayInfo?.isLifetime ? (
                        <Crown className="w-5 h-5 text-warning" />
                      ) : displayInfo?.isPlan ? (
                        <Sparkles className="w-5 h-5 text-primary" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display font-bold">{displayInfo?.title}</h3>
                      <p className="text-xs text-muted-foreground">{displayInfo?.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {displayInfo?.price === 0 ? (
                      <span className="text-xl font-display font-bold text-success">Grátis</span>
                    ) : (
                      <span className="text-xl font-display font-bold">{formatPrice(displayInfo?.price || 0)}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                {displayInfo && displayInfo.features.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <ul className="space-y-1.5">
                      {displayInfo.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>

              {/* Payment Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                {!pixData && !orderId ? (
                  <div className="space-y-4">
                    {isFreeProduct ? (
                      <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground mb-4">
                          Clique no botão abaixo para ativar seu plano gratuito instantaneamente.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Payment Method Selection */}
                        {paymentSettings.evoPayEnabled && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-foreground">Forma de pagamento</p>
                            <div className="grid gap-3 grid-cols-2">
                              <button
                                onClick={() => setSelectedPaymentMethod('pix')}
                                className={cn(
                                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                  selectedPaymentMethod === 'pix' 
                                    ? "border-primary bg-primary/5" 
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <CreditCard className="w-6 h-6" />
                                <span className="text-sm font-medium">PIX</span>
                              </button>
                              <button
                                onClick={() => setSelectedPaymentMethod('evopay')}
                                className={cn(
                                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                  selectedPaymentMethod === 'evopay' 
                                    ? "border-primary bg-primary/5" 
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <Wallet className="w-6 h-6" />
                                <span className="text-sm font-medium">EvoPay</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="text-center py-2">
                          <p className="text-sm text-muted-foreground">
                            {`Pagamento instantâneo via PIX. ${isPlanPurchase ? "Sua licença será" : "Suas sessions serão"} liberada${isPlanPurchase ? "" : "s"} automaticamente.`}
                          </p>
                        </div>
                      </>
                    )}

                    <Button 
                      onClick={handlePayment}
                      disabled={isProcessing || !displayInfo}
                      size="lg"
                      className={`w-full h-12 text-base font-medium ${
                        isFreeProduct 
                          ? 'bg-success hover:bg-success/90' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {isFreeProduct ? "Ativando..." : "Gerando PIX..."}
                        </span>
                      ) : isFreeProduct ? (
                        "Ativar Agora"
                      ) : (
                        "Gerar código PIX"
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Pagamento 100% seguro</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Payment Status */}
                    <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${
                      paymentStatus === 'completed' || paymentStatus === 'paid'
                        ? 'bg-success/10 text-success'
                        : isExpired
                        ? 'bg-destructive/10 text-destructive'
                        : !pixData?.pixCode
                        ? 'bg-primary/10 text-primary'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {paymentStatus === 'completed' || paymentStatus === 'paid' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium text-sm">Pagamento confirmado!</span>
                        </>
                      ) : isExpired ? (
                        <>
                          <Clock className="w-5 h-5" />
                          <span className="font-medium text-sm">PIX expirado</span>
                        </>
                      ) : !pixData?.pixCode ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium text-sm">Aguardando aprovação</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="font-medium text-sm">Aguardando pagamento...</span>
                        </>
                      )}
                    </div>

                    {/* Gateway unavailable message */}
                    {!pixData?.pixCode && paymentStatus === 'pending' && !isExpired && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Seu pedido foi registrado e será processado pelo admin.
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          ID: {orderId?.slice(0, 8)}...
                        </p>
                      </div>
                    )}

                    {/* Countdown Timer */}
                    {timeLeft && !isExpired && paymentStatus === 'pending' && pixData?.pixCode && (
                      <div className="flex items-center justify-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Expira em</span>
                        <span className="font-mono font-bold text-xl tabular-nums">
                          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    {/* QR Code */}
                    {pixData?.pixCode && !isExpired && paymentStatus === 'pending' && (
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-2xl shadow-lg">
                          <QRCodeSVG 
                            value={pixData.pixCode} 
                            size={200}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      </div>
                    )}

                    {/* PIX Code Copy */}
                    {pixData?.pixCode && !isExpired && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Código PIX Copia e Cola:</label>
                        <div 
                          onClick={copyPixCode}
                          className="relative bg-muted/50 hover:bg-muted/70 border border-border/50 rounded-xl p-3 pr-12 cursor-pointer transition-colors group"
                        >
                          <div className="font-mono text-[10px] break-all line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
                            {pixData.pixCode}
                          </div>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {copied ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <Copy className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                        <p className="text-center text-xs text-muted-foreground">
                          Clique para copiar
                        </p>
                      </div>
                    )}

                    {/* Generate new PIX button when expired OR when gateway failed */}
                    {(isExpired || (!pixData?.pixCode && paymentStatus === 'pending')) && (
                      <Button 
                        onClick={() => {
                          setPixData(null);
                          setExpirationTime(null);
                          setOrderId(null);
                          setPaymentStatus('pending');
                        }}
                        className="w-full"
                        variant={isExpired ? "default" : "outline"}
                      >
                        {isExpired ? "Gerar novo código PIX" : "Tentar novamente"}
                      </Button>
                    )}

                    <p className="text-[10px] text-muted-foreground text-center">
                      {isExpired 
                        ? "O código PIX expirou. Gere um novo código para continuar."
                        : !pixData?.pixCode && paymentStatus === 'pending'
                        ? "Você será notificado quando o pedido for aprovado."
                        : isPlanPurchase 
                          ? "Após o pagamento, sua licença será ativada automaticamente."
                          : "Após o pagamento, suas sessions serão liberadas automaticamente."
                      }
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
