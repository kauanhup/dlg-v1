import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Check, CreditCard, ArrowLeft, Copy, CheckCircle2, Loader2, Clock, Crown, Sparkles, ShieldCheck, Wallet, Gift, AlertTriangle, Receipt, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MorphingSquare } from "@/components/ui/morphing-square";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useUpgradeCredit } from "@/hooks/useUpgradeCredit";
import { useInstallmentFees } from "@/hooks/useInstallmentFees";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import PageTransition from "@/components/PageTransition";

interface PixData {
  pixCode: string;
  qrCodeBase64?: string;
  transactionId: string;
  expiresAt?: string;
}

interface BoletoData {
  boletoCode: string;
  boletoUrl: string;
  transactionId: string;
  dueDate: string;
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

type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

interface CardFormData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  cpfCnpj: string;
  phone: string;
  postalCode: string;
  addressNumber: string;
}

const PIX_EXPIRATION_MINUTES = 15;

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useAlertToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [boletoCpf, setBoletoCpf] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState<number>(1);
  const [cardData, setCardData] = useState<CardFormData>({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    cpfCnpj: '',
    phone: '',
    postalCode: '',
    addressNumber: '',
  });
  
  const { settings: systemSettings, isLoading: settingsLoading } = useSystemSettings();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { activeSubscription, calculateFinalPrice, isValidUpgrade, isLoading: creditLoading } = useUpgradeCredit(user?.id);
  const { fees: installmentFees, calculateInstallmentValue, isLoading: feesLoading } = useInstallmentFees();

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
  const locationState = location.state as { 
    type?: string; 
    qty?: number; 
    price?: string; 
    existingOrderId?: string;
    existingPixCode?: string | null;
    paymentCreatedAt?: string;
  } | null;
  
  const type = locationState?.type || searchParams.get("type");
  const qty = locationState?.qty?.toString() || searchParams.get("qty");
  const price = locationState?.price || searchParams.get("price");
  const planId = searchParams.get("plano");
  const existingOrderIdFromState = locationState?.existingOrderId;

  // Parse price from string like "R$ 99,90" or number
  const parsePrice = useCallback((priceValue: string | number | null | undefined): number => {
    if (!priceValue) return 0;
    if (typeof priceValue === 'number') return priceValue;
    const cleaned = priceValue.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }, []);

  // Determine session type for database orders
  const getOrderProductType = useCallback((typeStr: string | null): string => {
    if (!typeStr) return '';
    if (typeStr.toLowerCase().includes('brasileir')) return 'session_brasileiras';
    if (typeStr.toLowerCase().includes('estrangeir')) return 'session_estrangeiras';
    return typeStr.toLowerCase();
  }, []);

  const getSessionFileType = useCallback((typeStr: string | null): string => {
    if (!typeStr) return '';
    if (typeStr.toLowerCase().includes('brasileir')) return 'brasileiras';
    if (typeStr.toLowerCase().includes('estrangeir')) return 'estrangeiras';
    return typeStr.toLowerCase();
  }, []);

  const isSessionPurchase = !!(type && qty && price);
  const isPlanPurchase = !!planId;

  const sessionInfo = useMemo(() => {
    if (!isSessionPurchase || !type || !qty || !price) return null;
    return {
      type: type.includes('Brasileir') ? 'Sessions Brasileiras' : type.includes('Estrangeir') ? 'Sessions Estrangeiras' : type,
      dbType: getOrderProductType(type),
      fileType: getSessionFileType(type),
      quantity: parseInt(qty || '0'),
      price: parsePrice(price),
    };
  }, [isSessionPurchase, type, qty, price, getOrderProductType, getSessionFileType, parsePrice]);

  // Fetch plan if planId is present
  useEffect(() => {
    if (!planId) return;

    const fetchPlan = async () => {
      setIsLoadingPlan(true);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .maybeSingle();

      setIsLoadingPlan(false);

      if (error || !data) {
        console.error('Error fetching plan:', error);
        toast.error("Plano não encontrado", "O plano selecionado não existe ou foi desativado.");
        setTimeout(() => navigate('/comprar'), 1500);
        return;
      }

      if (!data.is_active) {
        toast.error("Plano indisponível", "Este plano não está mais disponível.");
        setTimeout(() => navigate('/comprar'), 1500);
        return;
      }

      setPlan(data);
    };

    fetchPlan();
  }, [planId, navigate, toast]);

  // Get effective price for plan - with upgrade credit applied
  const basePlanPrice = plan ? (plan.promotional_price ?? plan.price) : 0;
  const canUpgradeToPlan = isValidUpgrade(basePlanPrice);
  const isDowngradeAttempt = isPlanPurchase && activeSubscription && !canUpgradeToPlan && activeSubscription.plan_id !== plan?.id;
  const isUpgrade = isPlanPurchase && activeSubscription && activeSubscription.credit_value > 0 && activeSubscription.plan_id !== plan?.id && canUpgradeToPlan;
  const planPrice = isUpgrade ? calculateFinalPrice(basePlanPrice) : basePlanPrice;
  const upgradeCredit = isUpgrade ? activeSubscription.credit_value : 0;
  const isFreeProduct = (isSessionPurchase && sessionInfo?.price === 0) || (isPlanPurchase && planPrice === 0);

  // Get current product amount for installment calculation
  const currentAmount = useMemo(() => {
    if (isSessionPurchase && sessionInfo) return sessionInfo.price;
    if (isPlanPurchase && plan) return planPrice;
    return 0;
  }, [isSessionPurchase, sessionInfo, isPlanPurchase, plan, planPrice]);

  // Calculate max installments (min R$5 per installment)
  const maxInstallments = useMemo(() => {
    if (currentAmount < 10) return 1;
    const max = Math.floor(currentAmount / 5);
    return Math.min(max, 12);
  }, [currentAmount]);

  // Warning before leaving checkout with pending payment
  useEffect(() => {
    if ((pixData || boletoData) && paymentStatus === 'pending') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Você tem um pagamento pendente. Tem certeza que deseja sair?';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [pixData, boletoData, paymentStatus]);

  // Countdown timer logic
  useEffect(() => {
    if (!expirationTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = expirationTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        if (paymentStatus === 'pending' && selectedPaymentMethod === 'pix') {
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
  }, [expirationTime, paymentStatus, toast, selectedPaymentMethod]);

  // Check for existing pending order on page load
  useEffect(() => {
    const checkExistingOrder = async (userId: string) => {
      const productType = isPlanPurchase ? 'subscription' : (isSessionPurchase && sessionInfo ? sessionInfo.dbType : null);
      
      if (!productType) return;

      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { data: pendingOrder } = await supabase
        .from('orders')
        .select('id, status, created_at')
        .eq('user_id', userId)
        .eq('product_type', productType)
        .eq('status', 'pending')
        .gte('created_at', thirtyMinAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pendingOrder) {
        setOrderId(pendingOrder.id);
        setPaymentStatus(pendingOrder.status);
        console.log('Found pending order:', pendingOrder.id);

        const { data: payment } = await supabase
          .from('payments')
          .select('pix_code, qr_code_base64, payment_method')
          .eq('order_id', pendingOrder.id)
          .maybeSingle();

        if (payment?.pix_code) {
          const orderCreated = new Date(pendingOrder.created_at);
          const expTime = new Date(orderCreated.getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000);
          
          if (expTime > new Date()) {
            setExpirationTime(expTime);
            setPixData({
              pixCode: payment.pix_code,
              qrCodeBase64: (payment as any).qr_code_base64 || undefined,
              transactionId: pendingOrder.id,
            });
            setSelectedPaymentMethod('pix');
            console.log('Recovered PIX for order:', pendingOrder.id);
          }
        }
      }
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const currentUrl = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      setUser(session.user);
      
      if (existingOrderIdFromState) {
        console.log('[Checkout] Checking existing order from banner:', existingOrderIdFromState);
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, status, product_name, product_type, quantity, amount')
          .eq('id', existingOrderIdFromState)
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (orderError || !orderData) {
          console.log('[Checkout] Order not found, will create new one');
          setIsLoading(false);
          return;
        }
        
        if (orderData.status !== 'pending') {
          console.log('[Checkout] Order status is not pending:', orderData.status);
          if (orderData.status === 'completed' || orderData.status === 'paid') {
            toast.success("Pedido já foi pago", "Redirecionando para o dashboard...");
            setTimeout(() => navigate('/dashboard'), 1500);
            return;
          }
          setIsLoading(false);
          return;
        }
        
        setOrderId(existingOrderIdFromState);
        setPaymentStatus('pending');
        
        const { data: payment } = await supabase
          .from('payments')
          .select('pix_code, qr_code_base64, payment_method, created_at, status')
          .eq('order_id', existingOrderIdFromState)
          .maybeSingle();
        
        if (payment) {
          if (payment.status !== 'pending') {
            console.log('[Checkout] Payment status is not pending:', payment.status);
            setIsLoading(false);
            return;
          }
          
          if (payment.pix_code) {
            const paymentCreated = new Date(payment.created_at);
            const expTime = new Date(paymentCreated.getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000);
            const timeRemaining = expTime.getTime() - Date.now();
            
            if (timeRemaining > 60 * 1000) {
              console.log('[Checkout] Valid PIX found, time remaining:', Math.round(timeRemaining / 1000), 's');
              setExpirationTime(expTime);
              setPixData({
                pixCode: payment.pix_code,
                qrCodeBase64: (payment as any).qr_code_base64 || undefined,
                transactionId: existingOrderIdFromState,
              });
              setSelectedPaymentMethod('pix');
            }
          }
        }
      } else if (plan || sessionInfo) {
        await checkExistingOrder(session.user.id);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, plan, sessionInfo, isPlanPurchase, isSessionPurchase, existingOrderIdFromState]);

  // Subscribe to order status changes
  useEffect(() => {
    if (!orderId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`order-${orderId}-${Date.now()}`)
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

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orderId, navigate, toast, isPlanPurchase]);

  // POLLING: Check PIX status every 5 seconds as backup to webhooks
  useEffect(() => {
    if (!orderId || !pixData?.transactionId || paymentStatus === 'completed' || paymentStatus === 'paid') {
      return;
    }

    const checkPixStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) return;

        console.log(`[Polling] Checking status via Asaas, transactionId: ${pixData.transactionId}`);

        const response = await supabase.functions.invoke('asaas', {
          body: { 
            action: 'check_status', 
            order_id: orderId,
            payment_id: pixData.transactionId
          },
          headers: {
            Authorization: `Bearer ${session.session.access_token}`
          }
        });

        if (response.error) {
          console.error('[Polling] Error checking PIX status:', response.error);
          return;
        }

        const result = response.data;
        console.log('[Polling] PIX status:', result?.data?.status);

        const confirmedStatuses = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];
        if (confirmedStatuses.includes(result?.data?.status)) {
          setPaymentStatus('completed');
          toast.success("Pagamento confirmado!", isPlanPurchase ? "Sua licença foi ativada." : "Suas sessions foram liberadas.");
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (error) {
        console.error('[Polling] Error:', error);
      }
    };

    checkPixStatus();
    const intervalId = setInterval(checkPixStatus, 5000);

    return () => clearInterval(intervalId);
  }, [orderId, pixData?.transactionId, paymentStatus, navigate, toast, isPlanPurchase]);

  // Creates order with amount=0 and calls complete_order_atomic
  const handleFreeActivation = async () => {
    if (!user || !isPlanPurchase || !plan) return;

    setIsProcessing(true);
    
    try {
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

      const orderInsertData: any = {
        user_id: user.id,
        product_name: plan.name,
        product_type: 'subscription',
        quantity: 1,
        amount: 0,
        status: 'pending',
        payment_method: 'free',
        plan_period_days: plan.period,
        plan_id_snapshot: plan.id,
        plan_features_snapshot: plan.features,
        order_version: 2,
      };
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsertData)
        .select('id')
        .single();

      if (orderError) throw orderError;

      await supabase.from('payments').insert({
        user_id: user.id,
        order_id: orderData.id,
        amount: 0,
        payment_method: 'free',
        status: 'paid',
        paid_at: new Date().toISOString(),
      });

      const { data: result, error: rpcError } = await supabase.rpc('complete_order_atomic', {
        _order_id: orderData.id,
        _user_id: user.id,
        _product_type: 'subscription',
        _quantity: 1,
      });

      if (rpcError) throw rpcError;
      
      const resultTyped = result as { success: boolean; error?: string };
      if (!resultTyped?.success) {
        throw new Error(resultTyped?.error || 'Erro ao ativar plano');
      }

      toast.success("Plano ativado!", "Seu plano gratuito foi ativado com sucesso.");
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error activating free plan:', error);
      toast.error("Erro", "Não foi possível ativar o plano. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to generate PIX for an existing order
  const generatePixForOrder = async (existingOrderId: string, amount: number, productName: string, quantity: number) => {
    const expTime = new Date();
    expTime.setMinutes(expTime.getMinutes() + PIX_EXPIRATION_MINUTES);
    setExpirationTime(expTime);

    const description = isPlanPurchase ? `Licença: ${productName}` : `${quantity}x ${productName}`;

    console.log('[Checkout] Generating PIX via Asaas for order:', existingOrderId);

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      toast.error("Sessão expirada", "Faça login novamente.");
      setExpirationTime(null);
      return;
    }

    const { data: response, error } = await supabase.functions.invoke('asaas', {
      body: {
        action: 'create_pix',
        order_id: existingOrderId,
        amount: amount,
        description: description,
      },
      headers: {
        Authorization: `Bearer ${session.session.access_token}`
      }
    });

    if (error) {
      console.error('[Checkout] Asaas error:', error);
      toast.error("Erro de conexão", "Não foi possível conectar ao sistema de pagamento. Tente novamente.");
      setExpirationTime(null);
      return;
    }

    if (!response?.success) {
      console.error('[Checkout] Asaas failed:', response);
      toast.error(
        "Sistema indisponível", 
        response?.error || "Sistema de pagamento temporariamente indisponível. Tente novamente."
      );
      setExpirationTime(null);
      return;
    }

    const pixCode = response.data?.pixCode;
    const qrCodeBase64 = response.data?.qrCodeBase64;
    
    if (pixCode) {
      console.log('[Checkout] PIX generated successfully via Asaas');
      setPixData({
        pixCode: pixCode,
        qrCodeBase64: qrCodeBase64,
        transactionId: response.data.transactionId,
        expiresAt: undefined,
      });
      toast.success("PIX gerado!", "Escaneie o QR Code ou copie o código para pagar.");
    } else {
      console.log('[Checkout] No PIX code returned');
      toast.warning("Erro ao gerar PIX", "Tente novamente.");
      setExpirationTime(null);
    }
  };

  // Generate boleto for an existing order
  const generateBoletoForOrder = async (existingOrderId: string, amount: number, productName: string, quantity: number) => {
    // Validate CPF for boleto
    const cpfClean = boletoCpf.replace(/\D/g, '');
    if (!cpfClean || (cpfClean.length !== 11 && cpfClean.length !== 14)) {
      toast.error("CPF/CNPJ inválido", "Informe um CPF ou CNPJ válido para gerar o boleto.");
      return;
    }

    const description = isPlanPurchase ? `Licença: ${productName}` : `${quantity}x ${productName}`;

    console.log('[Checkout] Generating Boleto via Asaas for order:', existingOrderId);

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      toast.error("Sessão expirada", "Faça login novamente.");
      return;
    }

    const { data: response, error } = await supabase.functions.invoke('asaas', {
      body: {
        action: 'create_boleto',
        order_id: existingOrderId,
        amount: amount,
        description: description,
        cpf_cnpj: cpfClean,
      },
      headers: {
        Authorization: `Bearer ${session.session.access_token}`
      }
    });

    if (error) {
      console.error('[Checkout] Asaas boleto error:', error);
      toast.error("Erro de conexão", "Não foi possível gerar o boleto. Tente novamente.");
      return;
    }

    if (!response?.success) {
      console.error('[Checkout] Asaas boleto failed:', response);
      toast.error("Erro ao gerar boleto", response?.error || "Verifique o CPF/CNPJ informado.");
      return;
    }

    if (response.data?.boletoCode) {
      console.log('[Checkout] Boleto generated successfully via Asaas');
      setBoletoData({
        boletoCode: response.data.boletoCode,
        boletoUrl: response.data.boletoUrl,
        transactionId: response.data.transactionId,
        dueDate: response.data.dueDate,
      });
      toast.success("Boleto gerado!", "Copie o código ou acesse o link para pagar.");
    } else {
      console.log('[Checkout] No boleto code returned');
      toast.warning("Erro ao gerar boleto", "Tente novamente.");
    }
  };

  // Process credit card payment
  const processCreditCardPayment = async (existingOrderId: string, amount: number, productName: string) => {
    // Validate card data
    if (!cardData.holderName || !cardData.number || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
      toast.error("Dados incompletos", "Preencha todos os dados do cartão.");
      return false;
    }

    if (!cardData.cpfCnpj || !cardData.postalCode || !cardData.addressNumber) {
      toast.error("Dados incompletos", "Preencha CPF, CEP e número do endereço.");
      return false;
    }

    console.log('[Checkout] Processing credit card via Asaas for order:', existingOrderId);

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      toast.error("Sessão expirada", "Faça login novamente.");
      return false;
    }

    // Get user profile for holder info
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('user_id', user.id)
      .single();

    const { data: response, error } = await supabase.functions.invoke('asaas', {
      body: {
        action: 'create_credit_card',
        order_id: existingOrderId,
        amount: amount,
        description: `Licença: ${productName}`,
        installments: installments,
        card_data: {
          holderName: cardData.holderName,
          number: cardData.number.replace(/\s/g, ''),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          ccv: cardData.ccv,
        },
        holder_info: {
          name: cardData.holderName,
          email: profile?.email || user.email,
          cpfCnpj: cardData.cpfCnpj.replace(/\D/g, ''),
          phone: cardData.phone?.replace(/\D/g, '') || undefined,
          postalCode: cardData.postalCode.replace(/\D/g, ''),
          addressNumber: cardData.addressNumber,
        },
      },
      headers: {
        Authorization: `Bearer ${session.session.access_token}`
      }
    });

    if (error) {
      console.error('[Checkout] Asaas credit card error:', error);
      toast.error("Erro de conexão", "Não foi possível processar o pagamento. Tente novamente.");
      return false;
    }

    if (!response?.success) {
      console.error('[Checkout] Asaas credit card failed:', response);
      toast.error("Pagamento recusado", response?.error || "Verifique os dados do cartão e tente novamente.");
      return false;
    }

    if (response.data?.confirmed) {
      console.log('[Checkout] Credit card payment confirmed!');
      setPaymentStatus('completed');
      toast.success("Pagamento aprovado!", isPlanPurchase ? "Sua licença foi ativada." : "Suas sessions foram liberadas.");
      setTimeout(() => navigate('/dashboard'), 2000);
      return true;
    } else {
      console.log('[Checkout] Credit card payment pending analysis');
      toast.info("Pagamento em análise", "Seu pagamento está sendo processado. Você será notificado quando for aprovado.");
      return true;
    }
  };

  // Validate and create order, then process payment
  const handlePayment = async () => {
    if (!user || isProcessing) return;

    if (systemSettings.maintenanceMode) {
      toast.error("Sistema em manutenção", "Compras estão temporariamente desabilitadas. Tente novamente mais tarde.");
      return;
    }

    // Check pending orders limit (max 3)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('created_at', thirtyMinutesAgo);

    if (!pendingError && pendingOrders && pendingOrders.length >= 3) {
      toast.error(
        "Limite de pedidos pendentes", 
        "Você já tem 3 pedidos aguardando pagamento. Finalize ou aguarde expiração (30min) antes de criar novos."
      );
      return;
    }

    if (isFreeProduct) {
      await handleFreeActivation();
      return;
    }

    setIsProcessing(true);
    
    try {
      // If we already have an orderId (from pending order), generate payment for it
      if (orderId && !pixData && !boletoData) {
        const { data: existingOrder, error: orderFetchError } = await supabase
          .from('orders')
          .select('amount, product_name, quantity')
          .eq('id', orderId)
          .single();
        
        if (orderFetchError || !existingOrder) {
          toast.error("Erro", "Pedido não encontrado. Crie um novo pedido.");
          setOrderId(null);
          setIsProcessing(false);
          return;
        }

        if (selectedPaymentMethod === 'pix') {
          await generatePixForOrder(orderId, existingOrder.amount, existingOrder.product_name, existingOrder.quantity);
        } else if (selectedPaymentMethod === 'boleto') {
          await generateBoletoForOrder(orderId, existingOrder.amount, existingOrder.product_name, existingOrder.quantity);
        } else if (selectedPaymentMethod === 'credit_card') {
          await processCreditCardPayment(orderId, existingOrder.amount, existingOrder.product_name);
        }
        setIsProcessing(false);
        return;
      }

      let amount: number;
      let productName: string;
      let productType: string;
      let quantity: number;

      if (isSessionPurchase && sessionInfo) {
        productName = sessionInfo.type;
        productType = sessionInfo.dbType;
        quantity = sessionInfo.quantity;

        const [combosResult, inventoryResult] = await Promise.all([
          supabase
            .from('session_combos')
            .select('quantity, price')
            .eq('type', sessionInfo.fileType)
            .eq('is_active', true),
          supabase
            .from('sessions_inventory')
            .select('custom_quantity_enabled, custom_quantity_min, custom_price_per_unit, quantity')
            .eq('type', sessionInfo.fileType)
            .maybeSingle()
        ]);

        const combosData = combosResult.data;
        const inventoryData = inventoryResult.data;

        const matchingCombo = combosData?.find(c => c.quantity === quantity);
        
        const isValidCustomPrice = inventoryData?.custom_quantity_enabled && 
          quantity >= (inventoryData.custom_quantity_min || 1) &&
          Math.abs(sessionInfo.price - (quantity * inventoryData.custom_price_per_unit)) < 0.01;

        if (matchingCombo) {
          if (Math.abs(sessionInfo.price - matchingCombo.price) > 0.01) {
            toast.error("Erro de validação", "Preço inválido. Recarregue a página.");
            setIsProcessing(false);
            return;
          }
          amount = matchingCombo.price;
        } else if (isValidCustomPrice) {
          amount = quantity * inventoryData.custom_price_per_unit;
        } else {
          toast.error("Erro de validação", "Combinação inválida.");
          setIsProcessing(false);
          return;
        }
      } else if (isPlanPurchase && plan) {
        const { data: currentPlan, error: planCheckError } = await supabase
          .from('subscription_plans')
          .select('price, promotional_price, is_active')
          .eq('id', plan.id)
          .single();

        if (planCheckError || !currentPlan) {
          toast.error("Erro", "Plano não encontrado. Recarregue a página.");
          setIsProcessing(false);
          return;
        }

        if (!currentPlan.is_active) {
          toast.error("Plano indisponível", "Este plano foi desativado. Escolha outro plano.");
          setIsProcessing(false);
          setTimeout(() => navigate('/comprar'), 1500);
          return;
        }

        const currentBasePrice = currentPlan.promotional_price ?? currentPlan.price;
        const currentFinalPrice = isUpgrade ? calculateFinalPrice(currentBasePrice) : currentBasePrice;
        
        if (Math.abs(currentFinalPrice - planPrice) > 0.01) {
          toast.error("Preço alterado", "O preço do plano foi alterado. Recarregue a página para ver o novo valor.");
          setPlan({ ...plan, price: currentPlan.price, promotional_price: currentPlan.promotional_price });
          setIsProcessing(false);
          return;
        }

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

        amount = currentFinalPrice;
        productName = plan.name;
        productType = 'subscription';
        quantity = 1;
      } else {
        throw new Error('Invalid product');
      }

      // Create order
      const orderInsertData: any = {
        user_id: user.id,
        product_name: productName,
        product_type: productType,
        quantity: quantity,
        amount: amount,
        status: 'pending',
        payment_method: selectedPaymentMethod === 'credit_card' ? 'asaas_credit_card' : selectedPaymentMethod === 'boleto' ? 'asaas_boleto' : 'pix',
      };
      
      if (isPlanPurchase && plan) {
        orderInsertData.plan_period_days = plan.period;
        orderInsertData.plan_id_snapshot = plan.id;
        orderInsertData.plan_features_snapshot = plan.features;
        orderInsertData.order_version = 2;
      } else {
        orderInsertData.order_version = 2;
      }
      
      if (isUpgrade && activeSubscription) {
        orderInsertData.upgrade_from_subscription_id = activeSubscription.id;
        orderInsertData.upgrade_credit_amount = upgradeCredit;
      }
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsertData)
        .select('id')
        .single();

      if (orderError) throw orderError;
      setOrderId(orderData.id);

      // For sessions, reserve atomically BEFORE generating payment
      if (isSessionPurchase && sessionInfo) {
        const { data: reserveResultRaw, error: reserveError } = await supabase.rpc('reserve_sessions_atomic', {
          p_session_type: sessionInfo.fileType,
          p_quantity: quantity,
          p_order_id: orderData.id
        });

        const reserveResult = reserveResultRaw as { 
          success: boolean; 
          error?: string; 
          reserved_count: number; 
          available_count?: number;
        } | null;

        if (reserveError || !reserveResult?.success) {
          await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderData.id);
          
          const errorMsg = reserveResult?.error || reserveError?.message || 'Erro ao reservar sessions';
          const availableCount = reserveResult?.available_count || 0;
          
          toast.error(
            "Estoque insuficiente", 
            availableCount > 0 
              ? `Apenas ${availableCount} sessions disponíveis. Reduza a quantidade e tente novamente.`
              : errorMsg
          );
          setOrderId(null);
          setIsProcessing(false);
          return;
        }

        console.log('[Checkout] Sessions reservadas atomicamente:', reserveResult.reserved_count);
      }

      // Create payment record
      const paymentMethod = selectedPaymentMethod === 'credit_card' ? 'asaas_credit_card' : 
                           selectedPaymentMethod === 'boleto' ? 'asaas_boleto' : 'asaas_pix';
      
      await supabase.from('payments').insert({
        user_id: user.id,
        order_id: orderData.id,
        amount: amount,
        payment_method: paymentMethod,
        status: 'pending',
      });

      // Process payment based on method
      if (selectedPaymentMethod === 'pix') {
        await generatePixForOrder(orderData.id, amount, productName, quantity);
      } else if (selectedPaymentMethod === 'boleto') {
        await generateBoletoForOrder(orderData.id, amount, productName, quantity);
      } else if (selectedPaymentMethod === 'credit_card') {
        await processCreditCardPayment(orderData.id, amount, productName);
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

  const copyBoletoCode = async () => {
    if (!boletoData?.boletoCode) return;
    
    try {
      await navigator.clipboard.writeText(boletoData.boletoCode);
      setCopied(true);
      toast.success("Copiado!", "Código do boleto copiado para a área de transferência.");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Erro", "Não foi possível copiar o código.");
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId || !user) return;
    
    setIsProcessing(true);
    
    try {
      if (isSessionPurchase) {
        await supabase.rpc('release_session_reservation', { p_order_id: orderId });
        console.log('[Checkout] Reservas liberadas para order:', orderId);
      }

      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (orderError) throw orderError;

      await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId);

      toast.success("Pedido cancelado", "Você pode criar um novo pedido quando quiser.");
      
      setPixData(null);
      setBoletoData(null);
      setExpirationTime(null);
      setTimeLeft(null);
      setOrderId(null);
      setPaymentStatus('pending');
      setCopied(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error("Erro", "Não foi possível cancelar o pedido.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Format CEP
  const formatCep = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  if (isLoading || (isPlanPurchase && !plan && isLoadingPlan)) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatedShaderBackground className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <MorphingSquare message={isLoadingPlan ? "Carregando plano..." : "Carregando checkout..."} className="bg-primary" />
        </div>
      </div>
    );
  }

  if (isPlanPurchase && !plan && !isLoadingPlan) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatedShaderBackground className="w-full h-full" />
        </div>
        <div className="relative z-10 text-center">
          <MorphingSquare message="Plano não encontrado..." className="bg-destructive" />
          <p className="text-muted-foreground mt-4 text-sm">Redirecionando...</p>
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
  const hasActivePayment = pixData?.pixCode || boletoData?.boletoCode;

  const displayInfo = isSessionPurchase && sessionInfo ? {
    title: sessionInfo.type,
    subtitle: `${sessionInfo.quantity} sessions`,
    price: sessionInfo.price,
    originalPrice: sessionInfo.price,
    features: [
      `${sessionInfo.quantity} sessions incluídas`,
      'Download imediato após confirmação',
      'Suporte incluído',
    ],
    isPlan: false,
    isUpgrade: false,
    upgradeCredit: 0,
  } : isPlanPurchase && plan ? {
    title: plan.name,
    subtitle: formatPeriod(plan.period),
    price: planPrice,
    originalPrice: basePlanPrice,
    features: plan.features || [],
    isPlan: true,
    isLifetime: plan.period === 0,
    isUpgrade: isUpgrade,
    upgradeCredit: upgradeCredit,
    upgradingFrom: activeSubscription?.plan_name || null,
  } : null;

  return (
    <PageTransition>
      <SEO 
        title="Checkout"
        description="Finalize sua compra de forma segura. Pagamento via PIX, Cartão ou Boleto."
        canonical="/checkout"
      />
      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row">
        {/* Left Side - Branding & Product Info (hidden on mobile/tablet) - STICKY */}
        <div className="hidden lg:block lg:w-1/2 lg:h-screen lg:sticky lg:top-0 relative bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-[20%] left-[20%] w-48 xl:w-72 h-48 xl:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[30%] right-[10%] w-64 xl:w-96 h-64 xl:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
            <div className="absolute inset-0 opacity-[0.03]" 
              style={{
                backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
          </div>
          
          <div className="relative z-10 flex flex-col justify-center items-center w-full h-full px-12 xl:px-16 2xl:px-20">
            <div className="w-full max-w-lg text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link 
                  to={isPlanPurchase ? "/comprar" : "/dashboard"} 
                  className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {isPlanPurchase ? "Voltar aos planos" : "Voltar ao dashboard"}
                </Link>

                <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                  {isDowngradeAttempt ? (
                    <>Downgrade não permitido</>
                  ) : hasActivePayment ? (
                    selectedPaymentMethod === 'pix' ? <>Escaneie o QR Code</> : <>Pague o boleto</>
                  ) : isFreeProduct ? (
                    <>Ativar plano grátis</>
                  ) : (
                    <>Finalizar compra</>
                  )}
                </h1>
                
                <p className="text-base xl:text-lg text-muted-foreground mb-10 max-w-sm mx-auto">
                  {isDowngradeAttempt 
                    ? `Você possui o plano "${activeSubscription?.plan_name}" ativo. Faça upgrade para um plano superior.`
                    : hasActivePayment 
                      ? selectedPaymentMethod === 'pix' 
                        ? "Abra o app do seu banco e escaneie o código para pagar."
                        : "Copie o código de barras ou acesse o link do boleto."
                      : isFreeProduct 
                        ? "Ative seu plano gratuito e comece a usar agora mesmo."
                        : "Escolha sua forma de pagamento preferida."}
                </p>

                {displayInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        displayInfo?.isPlan && displayInfo?.isLifetime 
                          ? 'bg-warning/10' 
                          : 'bg-primary/10'
                      }`}>
                        {displayInfo?.isPlan && displayInfo?.isLifetime ? (
                          <Crown className="w-6 h-6 text-warning" />
                        ) : displayInfo?.isPlan ? (
                          <Sparkles className="w-6 h-6 text-primary" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-lg text-foreground truncate">{displayInfo.title}</h3>
                        <p className="text-sm text-muted-foreground">{displayInfo.subtitle}</p>
                        {displayInfo.isUpgrade && displayInfo.upgradingFrom && (
                          <p className="text-xs text-success mt-1 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            Upgrade de {displayInfo.upgradingFrom}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {displayInfo.price === 0 ? (
                          <span className="text-xl font-display font-bold text-success">Grátis</span>
                        ) : displayInfo.isUpgrade && displayInfo.upgradeCredit > 0 ? (
                          <div>
                            <span className="text-sm text-muted-foreground line-through block">
                              {formatPrice(displayInfo.originalPrice)}
                            </span>
                            <span className="text-xl font-display font-bold text-success">{formatPrice(displayInfo.price)}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-display font-bold text-foreground">{formatPrice(displayInfo.price)}</span>
                        )}
                      </div>
                    </div>

                    {displayInfo.isUpgrade && displayInfo.upgradeCredit > 0 && (
                      <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Gift className="w-4 h-4 text-success" />
                            Crédito proporcional aplicado
                          </span>
                          <span className="text-success font-medium">-{formatPrice(displayInfo.upgradeCredit)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Dias restantes do seu plano atual convertidos em desconto.
                        </p>
                      </div>
                    )}

                    {displayInfo.features.length > 0 && (
                      <div className="space-y-2.5 pt-5 border-t border-border/50">
                        {displayInfo.features.slice(0, 4).map((feature, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                              ✓
                            </span>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="flex-1 lg:w-1/2 flex items-start lg:items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-background relative min-h-screen lg:min-h-0 overflow-y-auto">
          <div className="absolute inset-0 lg:hidden">
            <AnimatedShaderBackground className="w-full h-full opacity-20" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[400px] sm:max-w-[440px] relative z-10 my-4 lg:my-auto"
          >
            <div className="lg:hidden mb-4">
              <Link 
                to={isPlanPurchase ? "/comprar" : "/dashboard"} 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {isPlanPurchase ? "Voltar aos planos" : "Voltar ao dashboard"}
              </Link>
            </div>

            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl">
              <div className="text-center mb-4 sm:mb-5 lg:hidden">
                <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
                  {hasActivePayment ? (selectedPaymentMethod === 'pix' ? "Pagar com PIX" : "Pagar com Boleto") : isFreeProduct ? "Ativar Plano" : "Finalizar Compra"}
                </h2>
              </div>

              <div className="hidden lg:block text-center mb-5">
                <h2 className="text-xl font-display font-bold text-foreground">
                  {hasActivePayment ? (selectedPaymentMethod === 'pix' ? "Pagamento PIX" : selectedPaymentMethod === 'boleto' ? "Boleto Bancário" : "Cartão de Crédito") : isFreeProduct ? "Ativação Gratuita" : "Método de Pagamento"}
                </h2>
              </div>

              {/* Mobile Product Card */}
              <div className="lg:hidden mb-5">
                {displayInfo && (
                  <div className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">{displayInfo.title}</h3>
                        <p className="text-xs text-muted-foreground">{displayInfo.subtitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {displayInfo.price === 0 ? (
                          <span className="text-base font-bold text-success">Grátis</span>
                        ) : (
                          <span className="text-base font-bold text-foreground">{formatPrice(displayInfo.price)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Content */}
              {!hasActivePayment && !orderId ? (
                <div className="space-y-4">
                  {isFreeProduct ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">
                        Clique no botão abaixo para ativar seu plano gratuito instantaneamente.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Payment Method Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {[
                            { id: 'pix' as const, label: 'PIX', icon: Smartphone, desc: 'Aprovação instantânea' },
                            { id: 'credit_card' as const, label: 'Cartão', icon: CreditCard, desc: 'Até 12x' },
                            { id: 'boleto' as const, label: 'Boleto', icon: Receipt, desc: '3 dias úteis' },
                          ].map((method) => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setSelectedPaymentMethod(method.id)}
                              className={cn(
                                "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                                selectedPaymentMethod === method.id 
                                  ? "border-primary bg-primary/5 shadow-sm" 
                                  : "border-border/40 hover:border-border/80 bg-card hover:bg-muted/30"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                selectedPaymentMethod === method.id 
                                  ? "bg-primary/10" 
                                  : "bg-muted/50"
                              )}>
                                <method.icon className={cn(
                                  "w-5 h-5 transition-colors",
                                  selectedPaymentMethod === method.id 
                                    ? "text-primary" 
                                    : "text-muted-foreground"
                                )} />
                              </div>
                              <div className="text-center">
                                <span className={cn(
                                  "text-sm font-medium block",
                                  selectedPaymentMethod === method.id 
                                    ? "text-foreground" 
                                    : "text-muted-foreground"
                                )}>{method.label}</span>
                                <span className="text-[10px] text-muted-foreground">{method.desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Credit Card Form */}
                      <AnimatePresence mode="wait">
                        {selectedPaymentMethod === 'credit_card' && (
                          <motion.div
                            key="credit_card_form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 overflow-hidden"
                          >
                            {/* Card Number */}
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={19}
                                placeholder="Número do cartão"
                                value={cardData.number}
                                onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                                className="w-full h-12 px-4 rounded-xl border border-border/50 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                              />
                              <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                            </div>

                            {/* Card Holder Name */}
                            <input
                              type="text"
                              placeholder="Nome impresso no cartão"
                              value={cardData.holderName}
                              onChange={(e) => setCardData({ ...cardData, holderName: e.target.value.toUpperCase() })}
                              className="w-full h-12 px-4 rounded-xl border border-border/50 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />

                            {/* Expiry & CVV */}
                            <div className="grid grid-cols-3 gap-3">
                              <select
                                value={cardData.expiryMonth}
                                onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                                className="h-12 px-3 rounded-xl border border-border/50 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer text-center"
                              >
                                <option value="">Mês</option>
                                <option value="01">01</option>
                                <option value="02">02</option>
                                <option value="03">03</option>
                                <option value="04">04</option>
                                <option value="05">05</option>
                                <option value="06">06</option>
                                <option value="07">07</option>
                                <option value="08">08</option>
                                <option value="09">09</option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                              </select>
                              <select
                                value={cardData.expiryYear}
                                onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                                className="h-12 px-3 rounded-xl border border-border/50 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer text-center"
                              >
                                <option value="">Ano</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                                <option value="2028">2028</option>
                                <option value="2029">2029</option>
                                <option value="2030">2030</option>
                                <option value="2031">2031</option>
                                <option value="2032">2032</option>
                                <option value="2033">2033</option>
                                <option value="2034">2034</option>
                              </select>
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="CVV"
                                value={cardData.ccv}
                                onChange={(e) => setCardData({ ...cardData, ccv: e.target.value.replace(/\D/g, '') })}
                                className="h-12 px-4 rounded-xl border border-border/50 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center"
                              />
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border/50" />

                            {/* CPF */}
                            <input
                              type="text"
                              maxLength={18}
                              placeholder="CPF/CNPJ do titular"
                              value={cardData.cpfCnpj}
                              onChange={(e) => setCardData({ ...cardData, cpfCnpj: formatCpfCnpj(e.target.value) })}
                              className="w-full h-12 px-4 rounded-xl border border-border/50 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />

                            {/* Address */}
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                maxLength={9}
                                placeholder="CEP"
                                value={cardData.postalCode}
                                onChange={(e) => setCardData({ ...cardData, postalCode: formatCep(e.target.value) })}
                                className="h-12 px-4 rounded-xl border border-border/50 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                              />
                              <input
                                type="text"
                                placeholder="Nº endereço"
                                value={cardData.addressNumber}
                                onChange={(e) => setCardData({ ...cardData, addressNumber: e.target.value })}
                                className="h-12 px-4 rounded-xl border border-border/50 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                              />
                            </div>

                            {/* Installments - Simplified */}
                            {maxInstallments > 1 && (
                              <div className="space-y-2 pt-2 border-t border-border/30">
                                <label className="text-xs text-muted-foreground block">Parcelamento</label>
                                <select
                                  value={installments}
                                  onChange={(e) => setInstallments(Number(e.target.value))}
                                  className="w-full h-12 px-4 rounded-xl border border-border/50 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    backgroundSize: '20px'
                                  }}
                                >
                                  {Array.from({ length: maxInstallments }, (_, i) => {
                                    const parcela = i + 1;
                                    const { installmentValue, feePercentage } = calculateInstallmentValue(currentAmount, parcela);
                                    const hasInterest = feePercentage > 0;
                                    
                                    return (
                                      <option key={parcela} value={parcela}>
                                        {parcela}x de {formatPrice(installmentValue)} {parcela === 1 ? '(à vista)' : hasInterest ? `(+${feePercentage.toFixed(1)}% juros)` : '(sem juros)'}
                                      </option>
                                    );
                                  })}
                                </select>
                                
                                {/* Summary when interest applies */}
                                {installments > 1 && calculateInstallmentValue(currentAmount, installments).feePercentage > 0 && (
                                  <p className="text-xs text-muted-foreground text-right">
                                    Total: <span className="font-medium text-foreground">{formatPrice(calculateInstallmentValue(currentAmount, installments).totalWithFees)}</span>
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Boleto CPF Input */}
                      <AnimatePresence mode="wait">
                        {selectedPaymentMethod === 'boleto' && (
                          <motion.div
                            key="boleto_cpf_form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <input
                              type="text"
                              maxLength={18}
                              placeholder="CPF/CNPJ para o boleto"
                              value={boletoCpf}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '');
                                if (v.length <= 11) {
                                  setBoletoCpf(v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'));
                                } else {
                                  setBoletoCpf(v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'));
                                }
                              }}
                              className="w-full h-12 px-4 rounded-xl border border-border/50 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="text-center py-1">
                        <p className="text-xs text-muted-foreground">
                          {selectedPaymentMethod === 'pix' && "Pagamento instantâneo via PIX."}
                          {selectedPaymentMethod === 'credit_card' && "Aprovação imediata."}
                          {selectedPaymentMethod === 'boleto' && "Compensação em até 3 dias úteis."}
                        </p>
                      </div>
                    </>
                  )}

                  {isDowngradeAttempt ? (
                    <>
                      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center">
                        <p className="text-sm text-destructive font-medium mb-2">
                          Downgrade não permitido
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Você já possui o plano "{activeSubscription?.plan_name}" que é superior a este.
                        </p>
                      </div>
                      <Link to="/comprar" className="w-full">
                        <Button variant="outline" size="lg" className="w-full h-11">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Ver outros planos
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <Button 
                        onClick={handlePayment}
                        disabled={isProcessing || !displayInfo}
                        size="lg"
                        className={cn(
                          "w-full h-14 text-base font-semibold rounded-xl shadow-lg transition-all",
                          isFreeProduct 
                            ? 'bg-success hover:bg-success/90 shadow-success/20' 
                            : 'bg-primary hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01]'
                        )}
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isFreeProduct ? "Ativando..." : selectedPaymentMethod === 'credit_card' ? "Processando pagamento..." : "Gerando..."}
                          </span>
                        ) : isFreeProduct ? (
                          "Ativar Agora"
                        ) : selectedPaymentMethod === 'pix' ? (
                          <>Pagar com PIX</>
                        ) : selectedPaymentMethod === 'credit_card' ? (
                          <>Finalizar Pagamento</>
                        ) : (
                          <>Gerar Boleto</>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-success" />
                        <span>Pagamento 100% seguro e criptografado</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Payment Status */}
                  <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${
                    paymentStatus === 'completed' || paymentStatus === 'paid'
                      ? 'bg-success/10 text-success'
                      : isExpired
                      ? 'bg-destructive/10 text-destructive'
                      : hasActivePayment
                      ? 'bg-warning/10 text-warning'
                      : 'bg-primary/10 text-primary'
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
                    ) : hasActivePayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-medium text-sm">Aguardando pagamento...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium text-sm">Pedido registrado</span>
                      </>
                    )}
                  </div>

                  {/* Prompt to generate payment */}
                  {!hasActivePayment && orderId && paymentStatus === 'pending' && !isExpired && (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">
                        Clique abaixo para gerar o código de pagamento
                      </p>
                    </div>
                  )}

                  {/* Countdown Timer (PIX only) */}
                  {timeLeft && !isExpired && paymentStatus === 'pending' && pixData?.pixCode && (
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Expira em</span>
                      <span className="font-mono font-bold text-xl tabular-nums">
                        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {/* QR Code (PIX) */}
                  {pixData?.pixCode && !isExpired && paymentStatus === 'pending' && (
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-xl shadow-lg">
                        <QRCodeSVG value={pixData.pixCode} size={180} level="M" includeMargin={false} />
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
                        <div className="font-mono text-xs break-all line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
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
                    </div>
                  )}

                  {/* Boleto Code Copy */}
                  {boletoData?.boletoCode && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Código de Barras:</label>
                        <div 
                          onClick={copyBoletoCode}
                          className="relative bg-muted/50 hover:bg-muted/70 border border-border/50 rounded-xl p-3 pr-12 cursor-pointer transition-colors group"
                        >
                          <div className="font-mono text-xs break-all text-muted-foreground group-hover:text-foreground transition-colors">
                            {boletoData.boletoCode}
                          </div>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {copied ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <Copy className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {boletoData.boletoUrl && (
                        <a 
                          href={boletoData.boletoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm font-medium transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                          Abrir Boleto
                        </a>
                      )}
                      
                      <p className="text-xs text-muted-foreground text-center">
                        Vencimento: {new Date(boletoData.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {/* Generate payment button when no payment data but order exists */}
                  {!hasActivePayment && orderId && paymentStatus === 'pending' && (
                    <Button onClick={handlePayment} disabled={isProcessing} className="w-full">
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {selectedPaymentMethod === 'pix' && <Smartphone className="w-4 h-4" />}
                          {selectedPaymentMethod === 'credit_card' && <CreditCard className="w-4 h-4" />}
                          {selectedPaymentMethod === 'boleto' && <Receipt className="w-4 h-4" />}
                          {selectedPaymentMethod === 'pix' ? 'Gerar QR Code PIX' : selectedPaymentMethod === 'boleto' ? 'Gerar Boleto' : 'Pagar com Cartão'}
                        </span>
                      )}
                    </Button>
                  )}

                  {/* Generate new PIX button when expired */}
                  {isExpired && (
                    <Button 
                      onClick={() => {
                        setPixData(null);
                        setBoletoData(null);
                        setExpirationTime(null);
                        setTimeLeft(null);
                        setOrderId(null);
                        setPaymentStatus('pending');
                        setCopied(false);
                      }}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      Gerar novo código
                    </Button>
                  )}

                  {/* Cancel order button */}
                  {hasActivePayment && !isExpired && paymentStatus === 'pending' && (
                    <Button 
                      onClick={handleCancelOrder}
                      disabled={isProcessing}
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cancelando...
                        </span>
                      ) : (
                        "Cancelar compra"
                      )}
                    </Button>
                  )}

                  <p className="text-[10px] text-muted-foreground text-center">
                    {isExpired 
                      ? "O código expirou. Gere um novo código para continuar."
                      : !hasActivePayment && paymentStatus === 'pending'
                      ? "Você será notificado quando o pedido for aprovado."
                      : isPlanPurchase 
                        ? "Após o pagamento, sua licença será ativada automaticamente."
                        : "Após o pagamento, suas sessions serão liberadas automaticamente."
                    }
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Checkout;
