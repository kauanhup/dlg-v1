import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const PIX_EXPIRATION_MINUTES = 15;

interface PendingPayment {
  id: string;
  order_id: string;
  amount: number;
  created_at: string;
  order?: {
    product_name: string;
    product_type: string;
    quantity: number;
  } | null;
}

export const PendingPaymentBanner = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

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
      navigate('/checkout', {
        state: {
          type: order.product_name,
          qty: order.quantity,
          price: `R$ ${Number(pendingPayment.amount).toFixed(2).replace('.', ',')}`
        }
      });
    } else {
      navigate('/pagamentos');
    }
  };

  if (!isLoggedIn || !pendingPayment || dismissed || !timeLeft) return null;

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md"
      >
        <div className="bg-warning/10 border border-warning/30 backdrop-blur-xl rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-foreground text-sm">Pagamento Pendente</h4>
                <button 
                  onClick={() => setDismissed(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pendingPayment.order?.product_name || 'Pedido'} - {formatPrice(Number(pendingPayment.amount))}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className={cn(
                  "text-xs font-mono font-bold",
                  timeLeft.minutes < 5 ? "text-destructive" : "text-warning"
                )}>
                  {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-7 text-xs bg-warning/10 border-warning/30 hover:bg-warning/20"
                  onClick={handleGoToCheckout}
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  Pagar Agora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PendingPaymentBanner;
