import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Check, CreditCard, ArrowLeft, Copy, CheckCircle2, Loader2, Clock, Crown, Sparkles, ShieldCheck, Wallet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MorphingSquare } from "@/components/ui/morphing-square";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { useAlertToast } from "@/hooks/use-alert-toast";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";

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

const PIX_EXPIRATION_MINUTES = 15;

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useAlertToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false); // FIX #4: Loading state for plan fetch
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
  
  // SEGURANÇA: Verificar modo manutenção
  const { settings: systemSettings, isLoading: settingsLoading } = useSystemSettings();
  // FIX #6: Track active channel to prevent duplicates
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
  const locationState = location.state as { type?: string; qty?: number; price?: string; existingOrderId?: string } | null;
  
  // Priority: location state > search params
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

  // Determine session type for database orders - MUST match constraint: session_brasileiras, session_estrangeiras
  const getOrderProductType = useCallback((typeStr: string | null): string => {
    if (!typeStr) return '';
    if (typeStr.toLowerCase().includes('brasileir')) return 'session_brasileiras';
    if (typeStr.toLowerCase().includes('estrangeir')) return 'session_estrangeiras';
    return typeStr.toLowerCase();
  }, []);

  // Determine session type for session_files table - uses: brasileiras, estrangeiras
  const getSessionFileType = useCallback((typeStr: string | null): string => {
    if (!typeStr) return '';
    if (typeStr.toLowerCase().includes('brasileir')) return 'brasileiras';
    if (typeStr.toLowerCase().includes('estrangeir')) return 'estrangeiras';
    return typeStr.toLowerCase();
  }, []);

  // Determine if it's a session purchase or plan purchase
  const isSessionPurchase = !!(type && qty && price);
  const isPlanPurchase = !!planId;

  // MEMOIZE sessionInfo to prevent re-renders (was causing infinite loop)
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

  // Fetch plan if planId is present - FIX #3 & #4: Better loading and error handling
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

  // Fetch payment settings and auto-select gateway - OPTIMIZED: Parallel calls
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        // Fetch both settings in PARALLEL for faster loading
        const [pixupResult, evoResult] = await Promise.all([
          supabase.functions.invoke('pixup', { body: { action: 'get_public_settings' } }),
          supabase.functions.invoke('evopay', { body: { action: 'get_public_settings' } })
        ]);
        
        const pixupEnabled = pixupResult.data?.data?.is_active || false;
        const evoPayEnabled = evoResult.data?.data?.evopay_enabled || false;
        
        setPaymentSettings({
          pixEnabled: pixupEnabled,
          evoPayEnabled: evoPayEnabled
        });
        
        // Auto-select gateway: random if both active, or use the active one
        if (pixupEnabled && evoPayEnabled) {
          setSelectedPaymentMethod(Math.random() < 0.5 ? 'pix' : 'evopay');
        } else if (evoPayEnabled) {
          setSelectedPaymentMethod('evopay');
        } else if (pixupEnabled) {
          setSelectedPaymentMethod('pix');
        }
      } catch (error) {
        console.log('Could not fetch payment settings');
      }
    };
    fetchPaymentSettings();
  }, []);

  // Check for existing pending order on page load
  useEffect(() => {
    const checkExistingOrder = async (userId: string) => {
      // Build product identifier for matching
      const productType = isPlanPurchase ? 'subscription' : (isSessionPurchase && sessionInfo ? sessionInfo.dbType : null);
      const productName = isPlanPurchase && plan ? plan.name : (isSessionPurchase && sessionInfo ? sessionInfo.type : null);
      
      if (!productType) return;

      // Look for recent pending order (last 30 min) for same product
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
        // Found pending order - ALWAYS set orderId to prevent re-validation
        setOrderId(pendingOrder.id);
        setPaymentStatus(pendingOrder.status);
        console.log('Found pending order:', pendingOrder.id);

        // Get payment info if exists
        const { data: payment } = await supabase
          .from('payments')
          .select('pix_code, payment_method')
          .eq('order_id', pendingOrder.id)
          .maybeSingle();

        if (payment?.payment_method) {
          setSelectedPaymentMethod(payment.payment_method as PaymentMethod || 'pix');
        }

        // Only restore PIX data if we have a valid pix_code and not expired
        if (payment?.pix_code) {
          const orderCreated = new Date(pendingOrder.created_at);
          const expTime = new Date(orderCreated.getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000);
          
          if (expTime > new Date()) {
            setExpirationTime(expTime);
            setPixData({
              pixCode: payment.pix_code,
              transactionId: pendingOrder.id,
            });
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
      
      // If we have an existing order ID from the banner, use it directly
      if (existingOrderIdFromState) {
        setOrderId(existingOrderIdFromState);
        console.log('Using existing order from banner:', existingOrderIdFromState);
        
        // Check if there's already a PIX for this order
        const { data: payment } = await supabase
          .from('payments')
          .select('pix_code, payment_method')
          .eq('order_id', existingOrderIdFromState)
          .maybeSingle();
        
        if (payment?.payment_method) {
          setSelectedPaymentMethod(payment.payment_method as PaymentMethod || 'pix');
        }
        
        if (payment?.pix_code) {
          // Get order creation time for expiration
          const { data: orderData } = await supabase
            .from('orders')
            .select('created_at, status')
            .eq('id', existingOrderIdFromState)
            .single();
          
          if (orderData) {
            setPaymentStatus(orderData.status);
            const orderCreated = new Date(orderData.created_at);
            const expTime = new Date(orderCreated.getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000);
            
            if (expTime > new Date()) {
              setExpirationTime(expTime);
              setPixData({
                pixCode: payment.pix_code,
                transactionId: existingOrderIdFromState,
              });
            }
          }
        }
      } else if (plan || sessionInfo) {
        // Check for existing pending order after we have user and product info
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

  // Subscribe to order status changes - FIX #6: Prevent duplicate listeners
  useEffect(() => {
    if (!orderId) return;

    // Clean up existing channel first to prevent duplicates
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`order-${orderId}-${Date.now()}`) // Unique channel name
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

  // Helper function to generate PIX for an existing order (used when recovering pending orders)
  const generatePixForOrder = async (existingOrderId: string, amount: number, productName: string, quantity: number) => {
    const expTime = new Date();
    expTime.setMinutes(expTime.getMinutes() + PIX_EXPIRATION_MINUTES);
    setExpirationTime(expTime);

    const description = isPlanPurchase ? `Licença: ${productName}` : `${quantity}x ${productName}`;

    if (selectedPaymentMethod === 'evopay') {
      const { data: evoResponse, error: evoError } = await supabase.functions.invoke('evopay', {
        body: {
          action: 'create_pix',
          amount: amount,
          external_id: existingOrderId,
          description: description,
        },
      });

      if (evoError) {
        console.error('EvoPay PIX generation error:', evoError);
        toast.error("Gateway indisponível", "Não foi possível gerar o PIX. Tente novamente.");
        return;
      }
      
      if (evoResponse?.data?.pixCode) {
        const transactionId = evoResponse.data.transactionId || evoResponse.data.id;
        setPixData({
          pixCode: evoResponse.data.pixCode,
          qrCodeBase64: undefined,
          transactionId: transactionId,
          expiresAt: undefined,
        });

        supabase.from('payments').update({
          pix_code: evoResponse.data.pixCode, // Store actual PIX code, not transactionId
        }).eq('order_id', existingOrderId);

        toast.success("PIX gerado!", "Escaneie o QR Code ou copie o código para pagar.");
      } else {
        toast.warning("Gateway não configurado", "Aguarde aprovação manual do admin.");
      }
      return;
    }

    // PixUp
    const { data: pixResponse, error: pixError } = await supabase.functions.invoke('pixup', {
      body: {
        action: 'create_pix',
        amount: amount,
        external_id: existingOrderId,
        description: description,
      },
    });

    if (pixError) {
      console.error('PIX generation error:', pixError);
      toast.error("Gateway indisponível", "Não foi possível gerar o PIX. Tente novamente.");
      return;
    }
    
    if (pixResponse?.data?.pixCode || pixResponse?.data?.qrcode) {
      const pixCode = pixResponse.data.pixCode || pixResponse.data.qrcode;
      const qrCodeBase64 = pixResponse.data.qrCodeBase64 || pixResponse.data.qrcode_base64;
      
      setPixData({
        pixCode: pixCode,
        qrCodeBase64: qrCodeBase64,
        transactionId: pixResponse.data.transactionId || pixResponse.data.id,
        expiresAt: pixResponse.data.expiresAt,
      });

      supabase.from('payments').update({
        pix_code: pixCode,
      }).eq('order_id', existingOrderId);

      toast.success("PIX gerado!", "Escaneie o QR Code ou copie o código para pagar.");
    } else {
      toast.warning("Gateway não configurado", "Aguarde aprovação manual do admin.");
    }
  };

  const handlePayment = async () => {
    // FIX #5: Prevent double-click by checking isProcessing first
    if (!user || isProcessing) return;

    // SEGURANÇA: Bloquear compras durante modo manutenção
    if (systemSettings.maintenanceMode) {
      toast.error("Sistema em manutenção", "Compras estão temporariamente desabilitadas. Tente novamente mais tarde.");
      return;
    }

    // Handle free products
    if (isFreeProduct) {
      await handleFreeActivation();
      return;
    }

    setIsProcessing(true);
    
    try {
      // FIX: If we already have an orderId (from pending order), regenerate PIX for it
      if (orderId && !pixData) {
        // Fetch existing order details
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

        // Generate new PIX for existing order
        await generatePixForOrder(orderId, existingOrder.amount, existingOrder.product_name, existingOrder.quantity);
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

        // OTIMIZADO: Buscar combos e inventário em PARALELO (muito mais rápido)
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

        // Validar estoque primeiro (fail fast)
        const availableStock = inventoryData?.quantity || 0;
        if (availableStock < quantity) {
          toast.error("Estoque insuficiente", `Apenas ${availableStock} sessions disponíveis deste tipo.`);
          setIsProcessing(false);
          return;
        }

        // Verificar se o preço corresponde a um combo válido
        const matchingCombo = combosData?.find(c => c.quantity === quantity);
        
        // Calcular preço customizado se aplicável
        const isValidCustomPrice = inventoryData?.custom_quantity_enabled && 
          quantity >= (inventoryData.custom_quantity_min || 1) &&
          Math.abs(sessionInfo.price - (quantity * inventoryData.custom_price_per_unit)) < 0.01;

        // Validar que o preço é legítimo
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
        // FIX: Validate subscription limit for PAID plans too (not just free)
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

        amount = planPrice;
        productName = plan.name;
        productType = 'subscription';
        quantity = 1;
      } else {
        throw new Error('Invalid product');
      }

      // Create order first (payment needs order_id)
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        product_name: productName,
        product_type: productType,
        quantity: quantity,
        amount: amount,
        status: 'pending',
        payment_method: selectedPaymentMethod,
      }).select('id').single();

      if (orderError) throw orderError;
      setOrderId(orderData.id);

      // OTIMIZADO: Criar payment em background (não bloqueia o PIX)
      supabase.from('payments').insert({
        user_id: user.id,
        order_id: orderData.id,
        amount: amount,
        payment_method: selectedPaymentMethod,
        status: 'pending',
      }).then(({ error }) => {
        if (error) console.error('Payment record error:', error);
      });

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
          const transactionId = evoResponse.data.transactionId || evoResponse.data.id;
          
          setPixData({
            pixCode: evoResponse.data.pixCode,
            qrCodeBase64: undefined,
            transactionId: transactionId,
            expiresAt: undefined,
          });

          // Store actual PIX code in background (not transactionId)
          supabase.from('payments').update({
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

        // Update payment in background (não bloqueia UI)
        supabase.from('payments').update({
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

  const handleCancelOrder = async () => {
    if (!orderId || !user) return;
    
    setIsProcessing(true);
    
    try {
      // Update order status to cancelled
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (orderError) throw orderError;

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId);

      toast.success("Pedido cancelado", "Você pode criar um novo pedido quando quiser.");
      
      // Reset state
      setPixData(null);
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

  // FIX #4: Show loading when fetching plan
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

  // FIX #3: If plan purchase but no plan found (after loading), show error state
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
    <>
      <SEO 
        title="Checkout"
        description="Finalize sua compra de forma segura. Pagamento via PIX com confirmação instantânea."
        canonical="/checkout"
      />
      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Branding & Product Info (hidden on mobile/tablet) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-[20%] left-[20%] w-48 xl:w-72 h-48 xl:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[30%] right-[10%] w-64 xl:w-96 h-64 xl:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" 
              style={{
                backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
          </div>
          
          {/* Content - Centered */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full h-full px-12 xl:px-16 2xl:px-20">
            <div className="w-full max-w-lg text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Back Button */}
                <Link 
                  to={isPlanPurchase ? "/comprar" : "/dashboard"} 
                  className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {isPlanPurchase ? "Voltar aos planos" : "Voltar ao dashboard"}
                </Link>

                {/* Title */}
                <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                  {pixData ? (
                    <>Escaneie o QR Code</>
                  ) : isFreeProduct ? (
                    <>Ativar plano grátis</>
                  ) : (
                    <>Finalizar compra</>
                  )}
                </h1>
                
                <p className="text-base xl:text-lg text-muted-foreground mb-10 max-w-sm mx-auto">
                  {pixData 
                    ? "Abra o app do seu banco e escaneie o código para pagar."
                    : isFreeProduct 
                    ? "Ative seu plano gratuito e comece a usar agora mesmo."
                    : "Pague via PIX de forma rápida e segura."}
                </p>

                {/* Product Summary */}
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
                      </div>
                      <div className="text-right shrink-0">
                        {displayInfo.price === 0 ? (
                          <span className="text-xl font-display font-bold text-success">Grátis</span>
                        ) : (
                          <span className="text-xl font-display font-bold text-foreground">{formatPrice(displayInfo.price)}</span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
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
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-background relative min-h-screen lg:min-h-0 overflow-y-auto">
          {/* Mobile/Tablet Background */}
          <div className="absolute inset-0 lg:hidden">
            <AnimatedShaderBackground className="w-full h-full opacity-20" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[360px] sm:max-w-[400px] md:max-w-[420px] relative z-10 my-auto"
          >
            {/* Mobile Back Button */}
            <div className="lg:hidden mb-4">
              <Link 
                to={isPlanPurchase ? "/comprar" : "/dashboard"} 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {isPlanPurchase ? "Voltar aos planos" : "Voltar ao dashboard"}
              </Link>
            </div>

            {/* Payment Card */}
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 shadow-xl">
              {/* Mobile Header */}
              <div className="text-center mb-4 sm:mb-5 lg:hidden">
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground">
                  {pixData ? "Escaneie o QR Code" : isFreeProduct ? "Ativar Plano" : "Finalizar Compra"}
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-1.5">
                  {pixData ? "Abra o app do seu banco e escaneie" : isFreeProduct ? "Ative seu plano gratuito" : "Pague via PIX de forma segura"}
                </p>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:block text-center mb-5">
                <h2 className="text-xl font-display font-bold text-foreground">
                  {pixData ? "Pagamento PIX" : isFreeProduct ? "Ativação Gratuita" : "Método de Pagamento"}
                </h2>
              </div>

              {/* Mobile Product Card - FIX #1: Better padding and spacing */}
              <div className="lg:hidden mb-5">
                {displayInfo && (
                  <div className="bg-muted/30 rounded-xl p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
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
                        <h3 className="font-semibold text-base text-foreground truncate">{displayInfo.title}</h3>
                        <p className="text-sm text-muted-foreground">{displayInfo.subtitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {displayInfo.price === 0 ? (
                          <span className="text-lg font-bold text-success">Grátis</span>
                        ) : (
                          <span className="text-lg font-bold text-foreground">{formatPrice(displayInfo.price)}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Mobile Features - show first 2 */}
                    {displayInfo.features.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                        {displayInfo.features.slice(0, 2).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Content */}
              {!pixData && !orderId ? (
                <div className="space-y-4">
                  {isFreeProduct ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">
                        Clique no botão abaixo para ativar seu plano gratuito instantaneamente.
                      </p>
                    </div>
                  ) : (
                    <>

                      <div className="text-center py-2">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {`Pagamento instantâneo via PIX. ${isPlanPurchase ? "Sua licença será" : "Suas sessions serão"} liberada${isPlanPurchase ? "" : "s"} automaticamente.`}
                        </p>
                      </div>
                    </>
                  )}

                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing || !displayInfo}
                    size="lg"
                    className={`w-full h-11 sm:h-12 text-sm sm:text-base font-medium ${
                      isFreeProduct 
                        ? 'bg-success hover:bg-success/90' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
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
                <div className="space-y-4">
                  {/* Payment Status */}
                  <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${
                    paymentStatus === 'completed' || paymentStatus === 'paid'
                      ? 'bg-success/10 text-success'
                      : isExpired
                      ? 'bg-destructive/10 text-destructive'
                      : pixData?.pixCode
                      ? 'bg-warning/10 text-warning'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {paymentStatus === 'completed' || paymentStatus === 'paid' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-xs sm:text-sm">Pagamento confirmado!</span>
                      </>
                    ) : isExpired ? (
                      <>
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-xs sm:text-sm">PIX expirado</span>
                      </>
                    ) : pixData?.pixCode ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="font-medium text-xs sm:text-sm">Aguardando pagamento...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-xs sm:text-sm">Pedido registrado</span>
                      </>
                    )}
                  </div>

                  {/* Order registered - prompt to generate PIX */}
                  {!pixData?.pixCode && orderId && paymentStatus === 'pending' && !isExpired && (
                    <div className="text-center py-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Clique abaixo para gerar o código PIX
                      </p>
                    </div>
                  )}

                  {/* Countdown Timer */}
                  {timeLeft && !isExpired && paymentStatus === 'pending' && pixData?.pixCode && (
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm text-muted-foreground">Expira em</span>
                      <span className="font-mono font-bold text-lg sm:text-xl tabular-nums">
                        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {/* QR Code */}
                  {pixData?.pixCode && !isExpired && paymentStatus === 'pending' && (
                    <div className="flex justify-center">
                      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                        <QRCodeSVG 
                          value={pixData.pixCode} 
                          size={180}
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
                        <div className="font-mono text-[10px] sm:text-xs break-all line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
                          {pixData.pixCode}
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                          ) : (
                            <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generate new PIX button when expired OR when gateway failed - FIX #2: Reset orderId properly */}
                  {/* Generate PIX button when no pixData but order exists - regenerate for existing order */}
                  {!pixData?.pixCode && orderId && paymentStatus === 'pending' && (
                    <Button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando PIX...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Gerar QR Code PIX
                        </span>
                      )}
                    </Button>
                  )}

                  {/* Generate new PIX button when expired - needs to create new order */}
                  {isExpired && (
                    <Button 
                      onClick={() => {
                        // Clear all payment state before retry
                        setPixData(null);
                        setExpirationTime(null);
                        setTimeLeft(null);
                        setOrderId(null);
                        setPaymentStatus('pending');
                        setCopied(false);
                      }}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      Gerar novo código PIX
                    </Button>
                  )}

                  {/* Cancel order button - show when QR is active */}
                  {pixData?.pixCode && !isExpired && paymentStatus === 'pending' && (
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
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
