import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscribers_count?: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  next_billing_date: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  plan_name?: string;
  plan_price?: number;
}

export interface Payment {
  id: string;
  user_id: string;
  order_id: string | null;
  subscription_id: string | null;
  amount: number;
  status: string;
  payment_method: string;
  pix_code: string | null;
  paid_at: string | null;
  created_at: string;
  user_name?: string;
  plan_name?: string;
}

export const useAdminSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (plansError) throw plansError;

      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch user profiles
      const userIds = [...new Set([
        ...(subsData?.map(s => s.user_id) || []),
        ...(paymentsData?.map(p => p.user_id) || [])
      ])];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Count subscribers per plan
      const subscriberCounts: Record<string, number> = {};
      (subsData || []).filter(s => s.status === 'active').forEach(s => {
        subscriberCounts[s.plan_id] = (subscriberCounts[s.plan_id] || 0) + 1;
      });

      // Merge plans with subscriber counts
      const plansWithCounts: SubscriptionPlan[] = (plansData || []).map(plan => ({
        ...plan,
        subscribers_count: subscriberCounts[plan.id] || 0,
      }));

      setPlans(plansWithCounts);

      // Merge subscriptions with user and plan info
      const subsWithInfo: UserSubscription[] = (subsData || []).map(sub => {
        const profile = profiles?.find(p => p.user_id === sub.user_id);
        const plan = plansData?.find(p => p.id === sub.plan_id);
        return {
          ...sub,
          user_name: profile?.name || 'Usuário desconhecido',
          user_email: profile?.email || '',
          plan_name: plan?.name || 'Plano desconhecido',
          plan_price: plan?.price || 0,
        };
      });

      setSubscriptions(subsWithInfo);

      // Merge payments with user info
      const paymentsWithInfo: Payment[] = (paymentsData || []).map(payment => {
        const profile = profiles?.find(p => p.user_id === payment.user_id);
        const sub = subsData?.find(s => s.id === payment.subscription_id);
        const plan = sub ? plansData?.find(p => p.id === sub.plan_id) : null;
        return {
          ...payment,
          user_name: profile?.name || 'Usuário desconhecido',
          plan_name: plan?.name || '—',
        };
      });

      setPayments(paymentsWithInfo);

    } catch (err) {
      console.error('Error fetching subscriptions data:', err);
      setError('Erro ao carregar dados de assinaturas');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlan = async (planId: string, data: Partial<SubscriptionPlan>) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update(data)
        .eq('id', planId);

      if (error) throw error;

      // Refetch to get updated data
      await fetchData();

      return { success: true };
    } catch (err) {
      console.error('Error updating plan:', err);
      return { success: false, error: 'Erro ao atualizar plano' };
    }
  };

  const createPlan = async (data: { name: string; price: number; period: number; features: string[] }) => {
    try {
      const { data: newPlan, error } = await supabase
        .from('subscription_plans')
        .insert({ ...data, is_active: true })
        .select()
        .single();

      if (error) throw error;

      // Refetch to get updated data
      await fetchData();

      return { success: true, data: newPlan };
    } catch (err) {
      console.error('Error creating plan:', err);
      return { success: false, error: 'Erro ao criar plano' };
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      setPlans(prev => prev.filter(plan => plan.id !== planId));

      return { success: true };
    } catch (err) {
      console.error('Error deleting plan:', err);
      return { success: false, error: 'Erro ao excluir plano' };
    }
  };

  const updateSubscription = async (subId: string, data: Partial<UserSubscription>) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update(data)
        .eq('id', subId);

      if (error) throw error;

      setSubscriptions(prev => prev.map(sub => 
        sub.id === subId ? { ...sub, ...data } : sub
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating subscription:', err);
      return { success: false, error: 'Erro ao atualizar assinatura' };
    }
  };

  const updatePayment = async (paymentId: string, data: Partial<Payment>) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update(data)
        .eq('id', paymentId);

      if (error) throw error;

      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? { ...payment, ...data } : payment
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating payment:', err);
      return { success: false, error: 'Erro ao atualizar pagamento' };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    activeSubscribers: subscriptions.filter(s => s.status === 'active').length,
    cancelledSubscribers: subscriptions.filter(s => s.status === 'cancelled').length,
    overdueSubscribers: subscriptions.filter(s => s.status === 'overdue').length,
    mrr: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.plan_price || 0), 0),
    churnRate: subscriptions.length > 0 
      ? (subscriptions.filter(s => s.status === 'cancelled').length / subscriptions.length * 100).toFixed(1)
      : '0',
  };

  return {
    plans,
    subscriptions,
    payments,
    isLoading,
    error,
    refetch: fetchData,
    updatePlan,
    createPlan,
    deletePlan,
    updateSubscription,
    updatePayment,
    stats,
  };
};
