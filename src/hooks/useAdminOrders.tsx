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

  // Complete order: approve payment, assign sessions from session_files, create user_sessions
  const completeOrder = async (orderId: string) => {
    try {
      // Get order details
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Pedido não encontrado');

      // Get available session files for this type
      const { data: availableFiles, error: filesError } = await supabase
        .from('session_files')
        .select('*')
        .eq('type', order.product_type)
        .eq('status', 'available')
        .limit(order.quantity);

      if (filesError) throw filesError;

      if (!availableFiles || availableFiles.length < order.quantity) {
        return { 
          success: false, 
          error: `Estoque insuficiente. Disponível: ${availableFiles?.length || 0}, Necessário: ${order.quantity}` 
        };
      }

      // Get file URLs from storage for user_sessions
      const sessionDataPromises = availableFiles.map(async (file) => {
        const { data: signedUrl } = await supabase.storage
          .from('sessions')
          .createSignedUrl(file.file_path, 86400 * 30); // 30 days
        return {
          fileId: file.id,
          fileName: file.file_name,
          filePath: file.file_path,
          signedUrl: signedUrl?.signedUrl || file.file_path
        };
      });

      const sessionData = await Promise.all(sessionDataPromises);

      // Create user_sessions records
      const userSessionsInsert = sessionData.map(data => ({
        user_id: order.user_id,
        order_id: orderId,
        type: order.product_type,
        session_data: data.fileName,
        is_downloaded: false,
      }));

      const { error: sessionsError } = await supabase
        .from('user_sessions')
        .insert(userSessionsInsert);

      if (sessionsError) throw sessionsError;

      // Update session_files to mark as sold
      const fileIds = availableFiles.map(f => f.id);
      const { error: updateFilesError } = await supabase
        .from('session_files')
        .update({ 
          status: 'sold', 
          user_id: order.user_id, 
          order_id: orderId,
          sold_at: new Date().toISOString()
        })
        .in('id', fileIds);

      if (updateFilesError) throw updateFilesError;

      // Update sessions_inventory quantity
      const { data: inventoryData } = await supabase
        .from('sessions_inventory')
        .select('quantity')
        .eq('type', order.product_type)
        .single();

      if (inventoryData) {
        await supabase
          .from('sessions_inventory')
          .update({ quantity: Math.max(0, inventoryData.quantity - order.quantity) })
          .eq('type', order.product_type);
      }

      // Update order status to completed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('order_id', orderId);

      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'completed' } : o
      ));

      return { success: true, assignedSessions: order.quantity };
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
    stats,
  };
};
