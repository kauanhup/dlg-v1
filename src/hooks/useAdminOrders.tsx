import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch user profiles for each order
      const userIds = [...new Set(ordersData?.map(o => o.user_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Merge orders with user info
      const ordersWithUsers: Order[] = (ordersData || []).map(order => {
        const profile = profiles?.find(p => p.user_id === order.user_id);
        return {
          ...order,
          user_name: profile?.name || 'Usuário desconhecido',
          user_email: profile?.email || '',
        };
      });

      setOrders(ordersWithUsers);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating order:', err);
      return { success: false, error: 'Erro ao atualizar pedido' };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount), 0),
  };

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    stats,
  };
};
