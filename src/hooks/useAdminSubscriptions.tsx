import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  period: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscribers_count?: number;
  max_subscriptions_per_user: number | null;
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
  product_type?: string;
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
        .select('*');

      if (plansError) throw plansError;
      
      // Sort by effective price (promotional if exists, otherwise regular)
      const sortedPlans = (plansData || []).sort((a, b) => {
        const priceA = a.promotional_price ?? a.price;
        const priceB = b.promotional_price ?? b.price;
        return priceA - priceB;
      });

      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch payments with order info
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*, orders(product_type, product_name)')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch user profiles - only if there are user IDs to fetch
      const userIds = [...new Set([
        ...(subsData?.map(s => s.user_id) || []),
        ...(paymentsData?.map(p => p.user_id) || [])
      ])].filter(Boolean);
      
      let profiles: { user_id: string; name: string; email: string }[] = [];
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;
        profiles = profilesData || [];
      }

      // Count subscribers per plan
      const subscriberCounts: Record<string, number> = {};
      (subsData || []).filter(s => s.status === 'active').forEach(s => {
        subscriberCounts[s.plan_id] = (subscriberCounts[s.plan_id] || 0) + 1;
      });

      // Merge plans with subscriber counts
      const plansWithCounts: SubscriptionPlan[] = sortedPlans.map(plan => ({
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

      // Merge payments with user info and product_type from order
      const paymentsWithInfo: Payment[] = (paymentsData || []).map(payment => {
        const profile = profiles?.find(p => p.user_id === payment.user_id);
        
        // Get product_type and plan_name from order relation
        const orderData = payment.orders as { product_type: string; product_name: string } | null;
        const productType = orderData?.product_type || null;
        let planName = orderData?.product_name || '—';
        
        // If it's a subscription and has subscription_id, try to get plan name from there
        if (payment.subscription_id) {
          const sub = subsData?.find(s => s.id === payment.subscription_id);
          if (sub) {
            const plan = plansData?.find(p => p.id === sub.plan_id);
            if (plan) planName = plan.name;
          }
        }
        
        return {
          ...payment,
          orders: undefined, // Remove the nested orders object
          user_name: profile?.name || 'Usuário desconhecido',
          plan_name: planName,
          product_type: productType,
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

  const createPlan = async (data: { name: string; price: number; promotional_price?: number | null; period: number; features: string[]; max_subscriptions_per_user?: number | null }) => {
    try {
      const { data: newPlan, error } = await supabase
        .from('subscription_plans')
        .insert({ 
          name: data.name,
          price: data.price,
          promotional_price: data.promotional_price || null,
          period: data.period,
          features: data.features,
          is_active: true,
          max_subscriptions_per_user: data.max_subscriptions_per_user ?? null
        })
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
      // Check for ACTIVE subscribers before deleting
      const { count: activeCount, error: countError } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', planId)
        .eq('status', 'active');

      if (countError) throw countError;
      
      if (activeCount && activeCount > 0) {
        return { success: false, error: 'Não é possível excluir um plano com assinantes ativos' };
      }

      // Get all subscription IDs for this plan
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('plan_id', planId);

      const subIds = subs?.map(s => s.id) || [];

      // Unlink payments from these subscriptions first
      if (subIds.length > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ subscription_id: null })
          .in('subscription_id', subIds);

        if (paymentError) {
          console.error('Error unlinking payments:', paymentError);
        }
      }

      // Delete subscriptions
      const { error: deleteSubsError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('plan_id', planId);

      
      
      if (deleteSubsError) {
        console.error('Error deleting subscriptions:', deleteSubsError);
        throw deleteSubsError;
      }

      // Now delete the plan
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

  const renewSubscription = async (subId: string, planId: string) => {
    try {
      // Check if plan still exists
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('id, period')
        .eq('id', planId)
        .maybeSingle();

      if (planError) throw planError;
      
      if (!planData) {
        return { success: false, error: 'O plano desta assinatura não existe mais' };
      }

      // Calculate next billing date based on plan period
      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + (planData.period || 30));

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'active', 
          next_billing_date: nextBillingDate.toISOString() 
        })
        .eq('id', subId);

      if (error) throw error;

      setSubscriptions(prev => prev.map(sub => 
        sub.id === subId ? { ...sub, status: 'active', next_billing_date: nextBillingDate.toISOString() } : sub
      ));

      return { success: true };
    } catch (err) {
      console.error('Error renewing subscription:', err);
      return { success: false, error: 'Erro ao renovar assinatura' };
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

  // Calculate MRR by normalizing all prices to monthly (30 days)
  const calculateMRR = () => {
    const activeWithPlans = subscriptions.filter(s => s.status === 'active');
    let totalMRR = 0;
    
    activeWithPlans.forEach(sub => {
      const plan = plans.find(p => p.id === sub.plan_id);
      if (plan && plan.period > 0) {
        // Normalize to monthly: (price / period) * 30
        const monthlyValue = ((plan.promotional_price ?? plan.price) / plan.period) * 30;
        totalMRR += monthlyValue;
      }
      // Lifetime plans (period = 0) don't contribute to MRR
    });
    
    return totalMRR;
  };

  const stats = {
    activeSubscribers: subscriptions.filter(s => s.status === 'active').length,
    cancelledSubscribers: subscriptions.filter(s => s.status === 'cancelled').length,
    overdueSubscribers: subscriptions.filter(s => s.status === 'overdue').length,
    mrr: calculateMRR(),
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
    renewSubscription,
    updatePayment,
    stats,
  };
};
