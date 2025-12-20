import { useState, useEffect } from "react";
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

interface PendingPayment {
  id: string;
  order_id: string;
  amount: number;
  created_at: string;
  pix_code: string | null;
  order?: {
    product_name: string;
    product_type: string;
    quantity: number;
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
  
  // Persist dismissed state in sessionStorage (per payment ID)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_payment_ids');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Don't show on excluded routes
  const isExcludedRoute = EXCLUDED_ROUTES.includes(location.pathname);

  useEffect(() => {
    const checkPendingPayment = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoggedIn(false);
        setPendingPayment(null);
        return;
      }

      setIsLoggedIn(true);

      // Check for pending payments within expiration window
      const expirationTime = new Date(Date.now() - PIX_EXPIRATION_MINUTES * 60 * 1000).toISOString();
      
      const { data } = await supabase
        .from('payments')
        .select(`
          id,
          order_id,
          amount,
          created_at,
          pix_code,
          order:orders(product_name, product_type, quantity)
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .gte('created_at', expirationTime)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setPendingPayment(data);
      } else {
        setPendingPayment(null);
      }
    };

    checkPendingPayment();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setIsLoggedIn(false);
        setPendingPayment(null);
      } else {
        checkPendingPayment();
      }
    });
    
    // Check every 30 seconds
    const interval = setInterval(checkPendingPayment, 30000);
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!pendingPayment) return;

    const updateTimer = () => {
      const createdAt = new Date(pendingPayment.created_at);
      const expiresAt = new Date(createdAt.getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setPendingPayment(null);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pendingPayment]);

  const handleGoToCheckout = () => {
    if (pendingPayment?.order) {
      const order = pendingPayment.order;
      // Pass PIX code if exists to prevent regeneration
      navigate('/checkout', {
        state: {
          type: order.product_name,
          qty: order.quantity,
          price: `R$ ${Number(pendingPayment.amount).toFixed(2).replace('.', ',')}`,
          existingOrderId: pendingPayment.order_id,
          existingPixCode: pendingPayment.pix_code, // Pass the existing PIX code
          paymentCreatedAt: pendingPayment.created_at // Pass creation time for expiration calc
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
      // Cancel payment
      await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('id', pendingPayment.id);
      
      // Cancel order
      if (pendingPayment.order_id) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', pendingPayment.order_id);
      }
      
      // Add to dismissed list
      const newDismissed = new Set(dismissedIds);
      newDismissed.add(pendingPayment.id);
      setDismissedIds(newDismissed);
      sessionStorage.setItem('dismissed_payment_ids', JSON.stringify([...newDismissed]));
      
      setPendingPayment(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
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
            <div className="flex items-center gap-2">
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
                className="h-7 text-xs bg-destructive/10 border-destructive/30 hover:bg-destructive/20 text-destructive"
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
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Cancelar Pedido?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
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
