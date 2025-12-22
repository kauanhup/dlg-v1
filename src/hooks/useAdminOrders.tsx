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

  // Complete order: uses atomic database function to prevent race conditions
  const completeOrder = async (orderId: string) => {
    try {
      // Get order details
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Pedido não encontrado');

      // Call atomic database function that handles locking and prevents race conditions
      const { data, error: rpcError } = await supabase.rpc('complete_order_atomic', {
        _order_id: orderId,
        _user_id: order.user_id,
        _product_type: order.product_type,
        _quantity: order.quantity
      });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw new Error(rpcError.message);
      }

      const result = data as { success: boolean; error?: string; assigned_sessions?: number };

      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Erro desconhecido ao completar pedido' 
        };
      }

      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'completed' } : o
      ));

      return { success: true, assignedSessions: result.assigned_sessions || order.quantity };
    } catch (err: any) {
      console.error('Error completing order:', err);
      return { success: false, error: err.message || 'Erro ao completar pedido' };
    }
  };

  const refundOrder = async (orderId: string) => {
    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('order_id', orderId);

      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'refunded' } : o
      ));

      return { success: true };
    } catch (err) {
      console.error('Error refunding order:', err);
      return { success: false, error: 'Erro ao reembolsar pedido' };
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId);

      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ));

      return { success: true };
    } catch (err) {
      console.error('Error cancelling order:', err);
      return { success: false, error: 'Erro ao cancelar pedido' };
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
    completeOrder,
    refundOrder,
    cancelOrder,
    stats,
  };
};
