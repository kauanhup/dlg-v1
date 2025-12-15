import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface License {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  order_id: string | null;
  type: string;
  session_data: string;
  is_downloaded: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_name: string;
  product_type: string;
  quantity: number;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

export interface SessionCombo {
  id: string;
  type: string;
  quantity: number;
  price: number;
  is_popular: boolean;
}

export interface SessionInventory {
  type: string;
  quantity: number;
}

export interface LoginHistory {
  id: string;
  user_id: string;
  device: string | null;
  location: string | null;
  ip_address: string | null;
  status: string;
  failure_reason: string | null;
  created_at: string;
}

export const useUserDashboard = (userId: string | undefined) => {
  const [license, setLicense] = useState<License | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [combos, setCombos] = useState<SessionCombo[]>([]);
  const [inventory, setInventory] = useState<SessionInventory[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user license
      const { data: licenseData, error: licenseError } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (licenseError) throw licenseError;
      setLicense(licenseData);

      // Fetch user sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // Fetch user orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch available combos (public data)
      const { data: combosData, error: combosError } = await supabase
        .from('session_combos')
        .select('*')
        .eq('is_active', true)
        .order('quantity', { ascending: true });

      if (combosError) throw combosError;
      setCombos(combosData || []);

      // Fetch inventory (public data - just quantities)
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('sessions_inventory')
        .select('type, quantity');

      if (inventoryError) throw inventoryError;
      setInventory(inventoryData || []);

      // Fetch login history
      const { data: loginHistoryData, error: loginHistoryError } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (loginHistoryError) throw loginHistoryError;
      setLoginHistory(loginHistoryData || []);

    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const markSessionDownloaded = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_downloaded: true })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, is_downloaded: true } : s
      ));

      return { success: true };
    } catch (err) {
      console.error('Error marking session downloaded:', err);
      return { success: false, error: 'Erro ao atualizar session' };
    }
  };

  const createOrder = async (orderData: {
    product_name: string;
    product_type: string;
    quantity: number;
    amount: number;
    payment_method?: string;
  }) => {
    if (!userId) return { success: false, error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          ...orderData,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setOrders(prev => [data, ...prev]);

      return { success: true, data };
    } catch (err) {
      console.error('Error creating order:', err);
      return { success: false, error: 'Erro ao criar pedido' };
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const getCombosByType = (type: string) => combos.filter(c => c.type === type);
  const getInventoryByType = (type: string) => inventory.find(i => i.type === type);

  const stats = {
    totalSessions: sessions.length,
    downloadedSessions: sessions.filter(s => s.is_downloaded).length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    brasileirasAvailable: getInventoryByType('brasileiras')?.quantity || 0,
    estrangeirasAvailable: getInventoryByType('estrangeiras')?.quantity || 0,
  };

  return {
    license,
    sessions,
    orders,
    combos,
    inventory,
    loginHistory,
    isLoading,
    error,
    refetch: fetchData,
    markSessionDownloaded,
    createOrder,
    getCombosByType,
    getInventoryByType,
    stats,
  };
};
