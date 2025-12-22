import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  start_date: string;
  next_billing_date: string | null;
  price_paid: number;
  days_total: number;
  days_remaining: number;
  credit_value: number;
}

export interface UpgradeCreditResult {
  activeSubscription: ActiveSubscription | null;
  isLoading: boolean;
  error: string | null;
  calculateFinalPrice: (newPlanPrice: number) => number;
  refetch: () => Promise<void>;
}

/**
 * Hook to calculate upgrade credit from current active subscription
 * 
 * Credit calculation:
 * - Gets the daily value of the current subscription (price / total days)
 * - Multiplies by remaining days to get credit value
 * - Credit is applied as discount on new plan purchase
 */
export const useUpgradeCredit = (userId: string | undefined): UpgradeCreditResult => {
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSubscription = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get active subscription with plan details
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          plan_id,
          status,
          start_date,
          next_billing_date,
          subscription_plans (
            name,
            price,
            promotional_price,
            period
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) throw subError;

      if (!subscription || !subscription.subscription_plans) {
        setActiveSubscription(null);
        setIsLoading(false);
        return;
      }

      const plan = subscription.subscription_plans as any;
      const pricePaid = plan.promotional_price ?? plan.price;
      const daysTotal = plan.period;

      // Calculate days remaining
      const now = new Date();
      const endDate = subscription.next_billing_date 
        ? new Date(subscription.next_billing_date)
        : null;

      let daysRemaining = 0;
      if (endDate && endDate > now) {
        daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Calculate credit value (proportional to remaining days)
      // Lifetime plans (period = 0) don't give credit
      let creditValue = 0;
      if (daysTotal > 0 && daysRemaining > 0) {
        const dailyValue = pricePaid / daysTotal;
        creditValue = Math.round(dailyValue * daysRemaining * 100) / 100; // Round to 2 decimals
      }

      setActiveSubscription({
        id: subscription.id,
        plan_id: subscription.plan_id,
        plan_name: plan.name,
        status: subscription.status,
        start_date: subscription.start_date,
        next_billing_date: subscription.next_billing_date,
        price_paid: pricePaid,
        days_total: daysTotal,
        days_remaining: daysRemaining,
        credit_value: creditValue,
      });
    } catch (err) {
      console.error('Error fetching active subscription:', err);
      setError('Erro ao buscar assinatura ativa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSubscription();
  }, [userId]);

  /**
   * Calculate final price after applying credit
   * @param newPlanPrice - The price of the new plan to upgrade to
   * @returns Final price after discount (minimum 0)
   */
  const calculateFinalPrice = (newPlanPrice: number): number => {
    if (!activeSubscription) return newPlanPrice;
    const finalPrice = newPlanPrice - activeSubscription.credit_value;
    return Math.max(0, Math.round(finalPrice * 100) / 100);
  };

  return {
    activeSubscription,
    isLoading,
    error,
    calculateFinalPrice,
    refetch: fetchActiveSubscription,
  };
};
