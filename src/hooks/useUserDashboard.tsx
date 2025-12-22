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

export interface SessionFile {
  id: string;
  file_name: string;
  file_path: string;
  type: string;
  status: string;
  uploaded_at: string;
  sold_at: string | null;
  order_id: string | null;
  user_id: string | null;
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
  custom_quantity_enabled: boolean;
  custom_quantity_min: number;
  custom_price_per_unit: number;
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
  const [sessionFiles, setSessionFiles] = useState<SessionFile[]>([]);
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
      // Fetch user license - get the most recent one (active first, then any)
      const { data: licenseData, error: licenseError } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', userId)
        .order('status', { ascending: true }) // 'active' comes before 'cancelled', 'expired'
        .order('end_date', { ascending: false }) // Most recent first
        .limit(1)
        .maybeSingle();

      if (licenseError) throw licenseError;
      setLicense(licenseData);

      // Fetch user's purchased session files (from session_files table)
      const { data: sessionFilesData, error: sessionFilesError } = await supabase
        .from('session_files')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'sold')
        .order('sold_at', { ascending: false });

      if (sessionFilesError) throw sessionFilesError;
      setSessionFiles(sessionFilesData || []);

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

      // Fetch inventory (public data - quantities and custom settings)
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('sessions_inventory')
        .select('type, quantity, custom_quantity_enabled, custom_quantity_min, custom_price_per_unit');

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

  const downloadSessionFile = async (fileId: string, filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('sessions')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error('Error downloading session file:', err);
      return { success: false, error: 'Erro ao baixar arquivo' };
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
  const getSessionFilesByType = (type: string) => sessionFiles.filter(f => f.type === type);

  const stats = {
    totalSessionFiles: sessionFiles.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    brasileirasAvailable: getInventoryByType('brasileiras')?.quantity || 0,
    estrangeirasAvailable: getInventoryByType('estrangeiras')?.quantity || 0,
    userBrasileiras: getSessionFilesByType('brasileiras').length,
    userEstrangeiras: getSessionFilesByType('estrangeiras').length,
  };

  return {
    license,
    sessionFiles,
    orders,
    combos,
    inventory,
    loginHistory,
    isLoading,
    error,
    refetch: fetchData,
    downloadSessionFile,
    createOrder,
    getCombosByType,
    getInventoryByType,
    getSessionFilesByType,
    stats,
  };
};
