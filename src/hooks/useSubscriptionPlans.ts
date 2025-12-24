import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Plan {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  period: number;
  features: string[];
  is_active: boolean;
}

export const useSubscriptionPlans = (maxPlans: number = 4) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;

        const allPlans = data || [];
        
        if (allPlans.length <= maxPlans) {
          setPlans(allPlans);
        } else {
          const selectedPlans = [
            allPlans[0],
            allPlans[1],
            allPlans[Math.floor(allPlans.length / 2)],
            allPlans[allPlans.length - 1]
          ];
          setPlans(selectedPlans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [maxPlans]);

  const getPopularIndex = () => {
    if (plans.length === 0) return -1;
    if (plans.length <= 2) return plans.length - 1;
    if (plans.length === 3) return 1;
    return 2;
  };

  return {
    plans,
    isLoading,
    popularIndex: getPopularIndex(),
  };
};
