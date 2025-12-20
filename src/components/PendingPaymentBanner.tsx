import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CreditCard, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Routes where the banner should NOT appear
const EXCLUDED_ROUTES = ['/', '/login', '/comprar', '/recuperar-senha', '/politica-privacidade', '/checkout'];

const PIX_EXPIRATION_MINUTES = 15;

// Use localStorage for persistence across browser sessions
const STORAGE_KEY = 'dismissed_payment_ids';

interface PendingPayment {
  id: string;
  order_id: string;
  amount: number;
  created_at: string;
  pix_code: string | null;
  order?: {
    id: string;
    product_name: string;
    product_type: string;
    quantity: number;
    status: string;
  } | null;
}

export const PendingPaymentBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Use ref for channel to prevent stale closures
  const paymentChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const orderChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Persist dismissed state in localStorage (persists across browser sessions)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Don't show on excluded routes
  const isExcludedRoute = EXCLUDED_ROUTES.includes(location.pathname);

  // Clean up old dismissed IDs (older than 24h)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        // Keep only recent IDs (we don't have timestamps, so just limit size)
        if (ids.length > 50) {
          const recentIds = ids.slice(-20);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds));
          setDismissedIds(new Set(recentIds));
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Function to clean up realtime channels
  const cleanupChannels = useCallback(() => {
    if (paymentChannelRef.current) {
      supabase.removeChannel(paymentChannelRef.current);
      paymentChannelRef.current = null;
    }
    if (orderChannelRef.current) {
      supabase.removeChannel(orderChannelRef.current);
      orderChannelRef.current = null;
    }
  }, []);

  // Function to set up realtime subscriptions
  const setupRealtimeSubscriptions = useCallback((paymentId: string, orderId: string) => {
    // Clean up existing channels first
    cleanupChannels();
    
    // Subscribe to payment changes
    paymentChannelRef.current = supabase
      .channel(`payment-banner-${paymentId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `id=eq.${paymentId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          console.log('[Banner] Payment status updated:', newStatus);
          if (newStatus === 'cancelled' || newStatus === 'paid') {
            setPendingPayment(null);
          }
        }
      )
      .subscribe();
    
    // Subscribe to order changes
    orderChannelRef.current = supabase
      .channel(`order-banner-${orderId}-${Date.now()}`)
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
          console.log('[Banner] Order status updated:', newStatus);
          if (newStatus === 'cancelled' || newStatus === 'completed' || newStatus === 'paid') {
            setPendingPayment(null);
          }
        }
      )
      .subscribe();
  }, [cleanupChannels]);

  const checkPendingPayment = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoggedIn(false);
      setPendingPayment(null);
      cleanupChannels();
      return;
    }

    setIsLoggedIn(true);

    // Check for pending payments within expiration window
    const expirationTime = new Date(Date.now() - PIX_EXPIRATION_MINUTES * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        order_id,
        amount,
        created_at,
        pix_code,
        order:orders(id, product_name, product_type, quantity, status)
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'pending')
      .gte('created_at', expirationTime)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Banner] Error fetching pending payment:', error);
      return;
    }

    // CRITICAL: Validate order status - don't show if order is cancelled/completed
    if (data) {
      const orderStatus = data.order?.status;
      
      // If order is not pending, don't show banner and cancel the payment
      if (orderStatus && orderStatus !== 'pending') {
        console.log('[Banner] Order not pending, skipping:', orderStatus);
        setPendingPayment(null);
        cleanupChannels();
        return;
      }

      // If order doesn't exist or payment has no valid order, skip
      if (!data.order_id || !data.order) {
        console.log('[Banner] No valid order for payment');
        setPendingPayment(null);
        cleanupChannels();
        return;
      }

      // Check if already dismissed
      if (dismissedIds.has(data.id)) {
        console.log('[Banner] Payment dismissed, skipping');
        setPendingPayment(null);
        cleanupChannels();
        return;
      }

      setPendingPayment(data);
      setupRealtimeSubscriptions(data.id, data.order_id);
    } else {
      setPendingPayment(null);
      cleanupChannels();
    }
  }, [dismissedIds, cleanupChannels, setupRealtimeSubscriptions]);

  useEffect(() => {
    checkPendingPayment();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setIsLoggedIn(false);
        setPendingPayment(null);
        cleanupChannels();
      } else {
        checkPendingPayment();
      }
    });
    
    // Check every 30 seconds for updates
    const interval = setInterval(checkPendingPayment, 30000);
    
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
      cleanupChannels();
    };
  }, [checkPendingPayment, cleanupChannels]);

  // Re-check when returning from other pages
  useEffect(() => {
    if (!isExcludedRoute) {
      checkPendingPayment();
    }
  }, [location.pathname, isExcludedRoute, checkPendingPayment]);

  // Countdown timer - uses absolute time to prevent drift in inactive tabs
  useEffect(() => {
    if (!pendingPayment) return;

    const createdAt = new Date(pendingPayment.created_at).getTime();
    const expiresAt = createdAt + PIX_EXPIRATION_MINUTES * 60 * 1000;

    const updateTimer = () => {
      // Always recalculate from current system time (Date.now)
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft(null);
        setPendingPayment(null);
        cleanupChannels();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ minutes, seconds });
    };

    // Update immediately
    updateTimer();
    
    // Use requestAnimationFrame-based interval for more reliable updates
    // when tab becomes active again
    const interval = setInterval(updateTimer, 1000);
    
    // Also update on visibility change (when user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pendingPayment, cleanupChannels]);

  const handleGoToCheckout = () => {
    if (pendingPayment?.order) {
      const order = pendingPayment.order;
      
      // Calculate if PIX is still valid (at least 2 minutes left)
      const createdAt = new Date(pendingPayment.created_at);
      const expiresAt = new Date(createdAt.getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000);
      const now = new Date();
      const timeRemaining = expiresAt.getTime() - now.getTime();
      const hasValidPix = pendingPayment.pix_code && timeRemaining > 2 * 60 * 1000; // At least 2 min left
      
      navigate('/checkout', {
        state: {
          type: order.product_name,
          qty: order.quantity,
          price: `R$ ${Number(pendingPayment.amount).toFixed(2).replace('.', ',')}`,
          existingOrderId: pendingPayment.order_id,
          // Only pass PIX code if it's still valid (at least 2 min left)
          existingPixCode: hasValidPix ? pendingPayment.pix_code : null,
          paymentCreatedAt: hasValidPix ? pendingPayment.created_at : null
        }
      });
    } else {
      navigate('/pagamentos');
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!pendingPayment || isCancelling) return;
    
    setIsCancelling(true);
    setShowCancelDialog(false);
    
    try {
      // Cancel payment first
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('id', pendingPayment.id);
      
      if (paymentError) {
        console.error('[Banner] Error cancelling payment:', paymentError);
      }
      
      // Cancel order
      if (pendingPayment.order_id) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', pendingPayment.order_id);
        
        if (orderError) {
          console.error('[Banner] Error cancelling order:', orderError);
        }
      }
      
      // Add to dismissed list and persist
      const newDismissed = new Set(dismissedIds);
      newDismissed.add(pendingPayment.id);
      setDismissedIds(newDismissed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...newDismissed]));
      
      // Clear state
      setPendingPayment(null);
      cleanupChannels();
    } catch (error) {
      console.error('[Banner] Error cancelling order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Check if this payment was dismissed
  const isDismissed = pendingPayment ? dismissedIds.has(pendingPayment.id) : false;

  if (isExcludedRoute || !isLoggedIn || !pendingPayment || isDismissed || !timeLeft) return null;

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 z-50 w-auto max-w-[320px] sm:max-w-sm"
        >
          <div className="bg-card/95 border border-warning/40 backdrop-blur-xl rounded-xl p-3 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-xs">Pagamento Pendente</h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  {pendingPayment.order?.product_name || 'Pedido'} - {formatPrice(Number(pendingPayment.amount))}
                </p>
              </div>
              <span className={cn(
                "text-xs font-mono font-bold px-2 py-1 rounded",
                timeLeft.minutes < 5 ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
              )}>
                {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full">
              <Button 
                size="sm" 
                className="h-7 text-xs flex-1 bg-primary hover:bg-primary/90"
                onClick={handleGoToCheckout}
              >
                <CreditCard className="w-3 h-3 mr-1" />
                Pagar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs flex-shrink-0 bg-destructive/10 border-destructive/30 hover:bg-destructive/20 text-destructive"
                onClick={handleCancelClick}
                disabled={isCancelling}
              >
                <X className="w-3 h-3 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-[340px] rounded-xl border-border/50 bg-card/95 backdrop-blur-xl p-5">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-lg font-semibold text-foreground">
              Cancelar Pedido?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-4">
            <AlertDialogCancel className="flex-1 m-0 bg-secondary/50 border-border/50 hover:bg-secondary">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PendingPaymentBanner;
