import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useAdminOrders, Order } from "@/hooks/useAdminOrders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Package,
} from "lucide-react";

interface SessionOrdersSectionProps {
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = "up" 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ElementType; 
  trend?: "up" | "down"; 
}) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className={cn(
        "text-xs font-medium px-2 py-1 rounded-md",
        trend === "up" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      )}>
        {change}
      </span>
    </div>
    <div className="mt-3">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{title}</p>
    </div>
  </div>
);

export const SessionOrdersSection = ({ className }: SessionOrdersSectionProps) => {
  const { orders, isLoading, completeOrder, refundOrder, stats, refetch } = useAdminOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter only session orders
  const sessionOrders = orders.filter(order => 
    order.product_type === 'session_brasileiras' || 
    order.product_type === 'session_estrangeiras'
  );

  // Recalculate stats for session orders only
  const sessionStats = {
    total: sessionOrders.length,
    completed: sessionOrders.filter(o => o.status === 'completed').length,
    pending: sessionOrders.filter(o => o.status === 'pending' || o.status === 'paid').length,
    refunded: sessionOrders.filter(o => o.status === 'refunded').length,
    totalRevenue: sessionOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount), 0),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number) => {
    return `R$ ${Number(amount).toFixed(2).replace('.', ',')}`;
  };

  const statusStyles: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    paid: "bg-primary/10 text-primary",
    completed: "bg-success/10 text-success",
    cancelled: "bg-muted text-muted-foreground",
    refunded: "bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    completed: "Concluído",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
  };

  const productTypeLabels: Record<string, string> = {
    session_brasileiras: "Brasileiras",
    session_estrangeiras: "Estrangeiras",
  };

  const handleCompleteClick = (order: Order) => {
    setSelectedOrder(order);
    setShowCompleteModal(true);
  };

  const handleRefundClick = (order: Order) => {
    setSelectedOrder(order);
    setShowRefundModal(true);
  };

  const handleConfirmComplete = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    const result = await completeOrder(selectedOrder.id);
    setIsProcessing(false);
    
    if (result.success) {
      toast.success('Pedido aprovado e entregue com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao completar pedido');
    }
    
    setShowCompleteModal(false);
    setSelectedOrder(null);
  };

  const handleConfirmRefund = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    const result = await refundOrder(selectedOrder.id);
    setIsProcessing(false);
    
    if (result.success) {
      toast.success('Pedido reembolsado com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao reembolsar pedido');
    }
    
    setShowRefundModal(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pedidos de Sessions</h2>
          <p className="text-sm text-muted-foreground">Gerenciar pedidos de sessions brasileiras e estrangeiras</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Pedidos" 
          value={sessionStats.total.toString()} 
          change={`${sessionStats.pending} pendentes`}
          icon={ShoppingCart}
          trend="up"
        />
        <StatCard 
          title="Concluídos" 
          value={sessionStats.completed.toString()} 
          change={`${sessionStats.total > 0 ? Math.round((sessionStats.completed / sessionStats.total) * 100) : 0}%`}
          icon={CheckCircle}
          trend="up"
        />
        <StatCard 
          title="Pendentes" 
          value={sessionStats.pending.toString()} 
          change="Aguardando"
          icon={Clock}
          trend={sessionStats.pending > 0 ? "down" : "up"}
        />
        <StatCard 
          title="Receita" 
          value={formatPrice(sessionStats.totalRevenue)} 
          change="Confirmada"
          icon={DollarSign}
          trend="up"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Data</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessionOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum pedido de sessions encontrado</p>
                  </td>
                </tr>
              ) : (
                sessionOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.user_name}</p>
                        <p className="text-xs text-muted-foreground">{order.user_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-md",
                        order.product_type === 'session_brasileiras' 
                          ? "bg-success/10 text-success" 
                          : "bg-primary/10 text-primary"
                      )}>
                        {productTypeLabels[order.product_type] || order.product_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{order.quantity}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{formatPrice(order.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-md",
                        statusStyles[order.status] || statusStyles.pending
                      )}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border border-border">
                            {(order.status === 'pending' || order.status === 'paid') && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-success focus:text-success"
                                onClick={() => handleCompleteClick(order)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" /> Aprovar e Entregar
                              </DropdownMenuItem>
                            )}
                            {order.status === 'completed' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => handleRefundClick(order)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Reembolsar
                                </DropdownMenuItem>
                              </>
                            )}
                            {order.status !== 'pending' && order.status !== 'paid' && order.status !== 'completed' && (
                              <DropdownMenuItem disabled className="text-muted-foreground">
                                Sem ações disponíveis
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Order Modal */}
      {showCompleteModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompleteModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Aprovar e Entregar Pedido</h3>
            <div className="space-y-3 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium">{selectedOrder.user_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">{productTypeLabels[selectedOrder.product_type] || selectedOrder.product_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade</span>
                  <span className="font-medium">{selectedOrder.quantity} sessions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-medium text-primary">{formatPrice(selectedOrder.amount)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Isso irá liberar {selectedOrder.quantity} sessions para o usuário automaticamente.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCompleteModal(false)} className="flex-1" disabled={isProcessing}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmComplete} className="flex-1 bg-success hover:bg-success/90" disabled={isProcessing}>
                {isProcessing ? <Spinner size="sm" className="mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {isProcessing ? 'Processando...' : 'Aprovar e Entregar'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRefundModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Reembolsar Pedido</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                <XCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm">Reembolsar pedido de <strong>{selectedOrder.user_name}</strong>?</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Valor: <span className="font-medium">{formatPrice(selectedOrder.amount)}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRefundModal(false)} className="flex-1" disabled={isProcessing}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmRefund} className="flex-1" disabled={isProcessing}>
                {isProcessing ? <Spinner size="sm" className="mr-2" /> : null}
                {isProcessing ? 'Processando...' : 'Confirmar Reembolso'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
