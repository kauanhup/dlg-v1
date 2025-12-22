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
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

interface SessionOrdersSectionProps {
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = "up",
  iconColor = "text-primary",
  bgColor = "bg-primary/10"
}: { 
  title: string; 
  value: string; 
  change?: string; 
  icon: React.ElementType; 
  trend?: "up" | "down" | "neutral";
  iconColor?: string;
  bgColor?: string;
}) => (
  <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
    <div className="flex items-center justify-between">
      <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center", bgColor)}>
        <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", iconColor)} />
      </div>
      {change && (
        <span className={cn(
          "text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md flex items-center gap-0.5",
          trend === "up" ? "bg-success/10 text-success" : 
          trend === "down" ? "bg-destructive/10 text-destructive" : 
          "bg-muted text-muted-foreground"
        )}>
          {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
          {change}
        </span>
      )}
    </div>
    <div className="mt-3 sm:mt-4">
      <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
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
    pending: "bg-warning/10 text-warning border border-warning/20",
    paid: "bg-primary/10 text-primary border border-primary/20",
    completed: "bg-success/10 text-success border border-success/20",
    cancelled: "bg-muted text-muted-foreground border border-border",
    refunded: "bg-destructive/10 text-destructive border border-destructive/20",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    completed: "Concluído",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
  };

  const productTypeLabels: Record<string, string> = {
    session_brasileiras: "🇧🇷 Brasileiras",
    session_estrangeiras: "🌍 Estrangeiras",
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
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Pedidos de Sessions</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {sessionStats.total} pedidos • {formatPrice(sessionStats.totalRevenue)} em receita
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          title="Total Pedidos" 
          value={sessionStats.total.toString()} 
          change={`${sessionStats.pending} pend.`}
          icon={ShoppingCart}
          trend="neutral"
        />
        <StatCard 
          title="Concluídos" 
          value={sessionStats.completed.toString()} 
          change={`${sessionStats.total > 0 ? Math.round((sessionStats.completed / sessionStats.total) * 100) : 0}%`}
          icon={CheckCircle}
          iconColor="text-success"
          bgColor="bg-success/10"
          trend="up"
        />
        <StatCard 
          title="Pendentes" 
          value={sessionStats.pending.toString()} 
          change="Aguardando"
          icon={Clock}
          iconColor="text-warning"
          bgColor="bg-warning/10"
          trend={sessionStats.pending > 0 ? "down" : "up"}
        />
        <StatCard 
          title="Receita" 
          value={formatPrice(sessionStats.totalRevenue)} 
          change="Confirmada"
          icon={DollarSign}
          iconColor="text-success"
          bgColor="bg-success/10"
          trend="up"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
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
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">Nenhum pedido de sessions</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Os pedidos aparecerão aqui quando forem realizados
                    </p>
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
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{order.quantity}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatPrice(order.amount)}</td>
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCompleteModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Aprovar e Entregar</h3>
            </div>
            <div className="space-y-3 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium text-foreground">{selectedOrder.user_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium text-foreground">{productTypeLabels[selectedOrder.product_type] || selectedOrder.product_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade</span>
                  <span className="font-medium text-foreground">{selectedOrder.quantity} sessions</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Valor Total</span>
                  <span className="font-bold text-success">{formatPrice(selectedOrder.amount)}</span>
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
              <Button onClick={handleConfirmComplete} className="flex-1 bg-success hover:bg-success/90 text-white" disabled={isProcessing}>
                {isProcessing ? <Spinner size="sm" className="mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {isProcessing ? 'Processando...' : 'Confirmar'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRefundModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Reembolsar Pedido</h3>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-foreground">Reembolsar pedido de <strong>{selectedOrder.user_name}</strong>?</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Valor: <span className="font-semibold text-foreground">{formatPrice(selectedOrder.amount)}</span>
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
