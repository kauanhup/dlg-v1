import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentConfirmedBannerProps {
  userId: string | undefined;
}

/**
 * Persistent banner that shows "Payment confirmed!" for users who recently completed a payment.
 * Shows for 24 hours after the last payment confirmation.
 * Can be dismissed by the user.
 */
export const PaymentConfirmedBanner = ({ userId }: PaymentConfirmedBannerProps) => {
  const [recentPayment, setRecentPayment] = useState<{
    productName: string;
    paidAt: string;
  } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const checkRecentPayment = async () => {
      // Check if already dismissed this session
      const dismissedKey = `payment_confirmed_dismissed_${userId}`;
      const dismissedAt = localStorage.getItem(dismissedKey);
      
      if (dismissedAt) {
        const dismissedTime = new Date(dismissedAt).getTime();
        const now = Date.now();
        // If dismissed less than 24h ago, don't show
        if (now - dismissedTime < 24 * 60 * 60 * 1000) {
          setIsDismissed(true);
          return;
        } else {
          // Clear old dismissal
          localStorage.removeItem(dismissedKey);
        }
      }

      // Check for payments confirmed in the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentPaidPayment } = await supabase
        .from('payments')
        .select(`
          paid_at,
          order:orders (
            product_name,
            product_type
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'paid')
        .gte('paid_at', twentyFourHoursAgo)
        .order('paid_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentPaidPayment?.paid_at && recentPaidPayment?.order) {
        const order = recentPaidPayment.order as any;
        setRecentPayment({
          productName: order.product_name || 'Produto',
          paidAt: recentPaidPayment.paid_at,
        });
      }
    };

    checkRecentPayment();
  }, [userId]);

  const handleDismiss = () => {
    if (userId) {
      localStorage.setItem(`payment_confirmed_dismissed_${userId}`, new Date().toISOString());
    }
    setIsDismissed(true);
  };

  // Don't show if no recent payment or already dismissed
  if (!recentPayment || isDismissed) return null;

  // Calculate how long ago
  const paidTime = new Date(recentPayment.paidAt).getTime();
  const now = Date.now();
  const hoursAgo = Math.floor((now - paidTime) / (1000 * 60 * 60));
  const minutesAgo = Math.floor((now - paidTime) / (1000 * 60));
  
  let timeAgoText = "";
  if (minutesAgo < 60) {
    timeAgoText = minutesAgo <= 1 ? "agora" : `há ${minutesAgo} min`;
  } else {
    timeAgoText = hoursAgo === 1 ? "há 1 hora" : `há ${hoursAgo} horas`;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <div className="bg-success/10 border border-success/30 rounded-lg p-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-success/20 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-success" />
          </button>
          
          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <h4 className="font-semibold text-success text-sm">
                  Pagamento confirmado!
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {recentPayment.productName} • {timeAgoText}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentConfirmedBanner;