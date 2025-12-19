import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserProfileSidebar } from "@/components/ui/menu";
import { avatars } from "@/components/ui/avatar-picker";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminSessions } from "@/hooks/useAdminSessions";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useAdminBot } from "@/hooks/useAdminBot";
import { MorphingSquare } from "@/components/ui/morphing-square";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Globe,
  LogOut,
  TrendingUp,
  DollarSign,
  Package,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Shield,
  Ban,
  RefreshCw,
  Menu,
  X,
  CreditCard,
  Calendar,
  ShoppingCart,
  AlertCircle,
  UserCheck,
  Repeat,
  Plus,
  Wrench,
  UserPlus,
  Phone,
  Save,
  Zap,
  Copy,
  Info,
  Upload,
  FileDown,
  HardDrive,
  History,
  Wallet
} from "lucide-react";


const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// Stats Card Component
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
  <div className="bg-card border border-border rounded-lg p-5">
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
    <div className="mt-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
);


// Plan Form Modal Component
const PlanFormModal = ({ 
  isOpen, 
  onClose, 
  plan, 
  onSave,
  isLoading = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  plan: { id: string; name: string; price: string; promotional_price?: string | null; period: number; features: string[]; status: string; max_subscriptions_per_user?: number | null } | null;
  onSave: (planData: { name: string; price: string; promotional_price: string | null; period: number; features: string[]; status: string; max_subscriptions_per_user: number | null }) => void;
  isLoading?: boolean;
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [period, setPeriod] = useState(30);
  const [features, setFeatures] = useState("");
  const [status, setStatus] = useState("active");
  const [maxSubscriptions, setMaxSubscriptions] = useState<string>("");

  useEffect(() => {
    if (isOpen && plan) {
      setName(plan.name);
      setPrice(String(plan.price).replace("R$ ", "").replace(",", "."));
      setPromotionalPrice(plan.promotional_price ? String(plan.promotional_price).replace("R$ ", "").replace(",", ".") : "");
      setPeriod(Number(plan.period) || 30);
      setFeatures(plan.features?.join("\n") || "");
      setStatus(plan.status);
      setMaxSubscriptions(plan.max_subscriptions_per_user !== null && plan.max_subscriptions_per_user !== undefined ? String(plan.max_subscriptions_per_user) : "");
    } else if (isOpen && !plan) {
      setName("");
      setPrice("");
      setPromotionalPrice("");
      setPeriod(30);
      setFeatures("");
      setStatus("active");
      setMaxSubscriptions("");
    }
  }, [plan, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      price: `R$ ${price}`,
      promotional_price: promotionalPrice ? `R$ ${promotionalPrice}` : null,
      period,
      features: features.split("\n").filter(f => f.trim()),
      status,
      max_subscriptions_per_user: maxSubscriptions ? parseInt(maxSubscriptions) : null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {plan ? "Editar Plano" : "Criar Plano"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Nome do Plano</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pro Mensal"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Preço (R$)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49,90"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Preço Promocional (R$)</label>
              <input
                type="text"
                value={promotionalPrice}
                onChange={(e) => setPromotionalPrice(e.target.value)}
                placeholder="39,90"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">Deixe vazio se não houver</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Dias de Acesso</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value) || 0)}
                placeholder="30"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">dias</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">0 = acesso vitalício</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Recursos (um por linha)</label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="50 sessions/mês&#10;Suporte prioritário&#10;API access"
              rows={4}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Limite de Assinaturas por Usuário</label>
            <input
              type="number"
              min="1"
              value={maxSubscriptions}
              onChange={(e) => setMaxSubscriptions(e.target.value)}
              placeholder="Ilimitado"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">Deixe vazio para ilimitado. Use 1 para planos de teste únicos.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <Spinner /> : (plan ? "Salvar" : "Criar Plano")}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Subscriptions Tab Content (used in Dashboard)
const SubscriptionsTabContent = () => {
  const { 
    plans: dbPlans, 
    subscriptions, 
    payments: dbPayments, 
    isLoading, 
    stats,
    refetch,
    updatePlan,
    createPlan,
    deletePlan,
    updateSubscription,
    renewSubscription,
    updatePayment 
  } = useAdminSubscriptions();
  
  const [activeSubTab, setActiveSubTab] = useState<"subscribers" | "plans" | "payments">("subscribers");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planToDelete, setPlanToDelete] = useState<any>(null);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);
  
  // Subscriber modals state
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Payment modals state
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  // Loading states
  const [isRenewing, setIsRenewing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatPrice = (amount: number) => {
    return `R$ ${Number(amount).toFixed(2).replace('.', ',')}`;
  };

  // Subscriber action handlers
  const handleViewDetails = (sub: any) => {
    setSelectedSubscriber(sub);
    setShowDetailsModal(true);
  };

  const handleRenewClick = (sub: any) => {
    setSelectedSubscriber(sub);
    setShowRenewModal(true);
  };

  const handleCancelClick = (sub: any) => {
    setSelectedSubscriber(sub);
    setShowCancelModal(true);
  };

  const handleConfirmRenew = async () => {
    if (selectedSubscriber) {
      setIsRenewing(true);
      const result = await renewSubscription(selectedSubscriber.id, selectedSubscriber.plan_id);
      if (!result.success) {
        toast.error(result.error || 'Erro ao renovar assinatura');
      } else {
        toast.success('Assinatura renovada com sucesso');
      }
      setIsRenewing(false);
    }
    setShowRenewModal(false);
    setSelectedSubscriber(null);
    refetch();
  };

  const handleConfirmCancel = async () => {
    if (selectedSubscriber) {
      setIsCancelling(true);
      await updateSubscription(selectedSubscriber.id, { 
        status: 'cancelled', 
        next_billing_date: null 
      });
      toast.success('Assinatura cancelada');
      setIsCancelling(false);
    }
    setShowCancelModal(false);
    setSelectedSubscriber(null);
    refetch();
  };

  const handleSavePlan = async (planData: { name: string; price: string; promotional_price: string | null; period: number; features: string[]; status: string; max_subscriptions_per_user: number | null }) => {
    setIsSavingPlan(true);
    try {
      const priceValue = parseFloat(planData.price.replace('R$ ', '').replace(',', '.')) || 0;
      const promoValue = planData.promotional_price 
        ? parseFloat(planData.promotional_price.replace('R$ ', '').replace(',', '.')) || null 
        : null;
      
      if (editingPlan) {
        await updatePlan(editingPlan.id, { 
          name: planData.name,
          price: priceValue,
          promotional_price: promoValue,
          period: planData.period,
          features: planData.features,
          is_active: planData.status === 'active',
          max_subscriptions_per_user: planData.max_subscriptions_per_user
        });
        toast.success('Plano atualizado');
      } else {
        await createPlan({
          name: planData.name,
          price: priceValue,
          promotional_price: promoValue,
          period: planData.period,
          features: planData.features,
          max_subscriptions_per_user: planData.max_subscriptions_per_user
        });
        toast.success('Plano criado');
      }
      setEditingPlan(null);
      setIsModalOpen(false);
      refetch();
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan({
      ...plan,
      price: formatPrice(plan.price),
      promotional_price: plan.promotional_price ? formatPrice(plan.promotional_price) : null,
      status: plan.is_active ? 'active' : 'inactive',
      max_subscriptions_per_user: plan.max_subscriptions_per_user
    });
    setIsModalOpen(true);
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  // Payment action handlers
  const handleEditPaymentStatus = (payment: any) => {
    setSelectedPayment(payment);
    setNewPaymentStatus(payment.status);
    setShowEditStatusModal(true);
  };

  const handleRefundClick = (payment: any) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (selectedPayment && newPaymentStatus) {
      setIsSavingStatus(true);
      await updatePayment(selectedPayment.id, { status: newPaymentStatus });
      toast.success('Status atualizado');
      setIsSavingStatus(false);
    }
    setShowEditStatusModal(false);
    setSelectedPayment(null);
    refetch();
  };

  const handleConfirmRefund = async () => {
    if (selectedPayment) {
      setIsRefunding(true);
      await updatePayment(selectedPayment.id, { status: 'refunded' });
      toast.success('Pagamento reembolsado');
      setIsRefunding(false);
    }
    setShowRefundModal(false);
    setSelectedPayment(null);
    refetch();
  };

  const statusStyles: Record<string, string> = {
    active: "bg-success/10 text-success",
    cancelled: "bg-muted text-muted-foreground",
    overdue: "bg-destructive/10 text-destructive",
    paid: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    failed: "bg-destructive/10 text-destructive",
    refunded: "bg-muted text-muted-foreground"
  };

  const statusLabels: Record<string, string> = {
    active: "Ativo",
    cancelled: "Cancelado",
    overdue: "Atrasado",
    paid: "Pago",
    pending: "Pendente",
    failed: "Falhou",
    refunded: "Reembolsado"
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.activeSubscribers}</p>
              <p className="text-xs text-muted-foreground">Assinantes Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">R$ {stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">Receita Mensal</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.overdueSubscribers}</p>
              <p className="text-xs text-muted-foreground">Pendente</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.churnRate}%</p>
              <p className="text-xs text-muted-foreground">Taxa de Cancelamento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveSubTab("subscribers")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeSubTab === "subscribers" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Assinantes
        </button>
        <button
          onClick={() => setActiveSubTab("plans")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeSubTab === "plans" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Planos
        </button>
        <button
          onClick={() => setActiveSubTab("payments")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeSubTab === "payments" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Pagamentos
        </button>
      </div>

      {/* Subscribers Tab */}
      {activeSubTab === "subscribers" && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Plano</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Início</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Próx. Cobrança</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{sub.user_name}</p>
                        <p className="text-xs text-muted-foreground">{sub.user_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">{sub.plan_name}</td>
                    <td className="p-4">
                      <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[sub.status] || statusStyles.pending)}>
                        {statusLabels[sub.status] || sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(sub.start_date)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(sub.next_billing_date)}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{formatPrice(sub.plan_price || 0)}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewDetails(sub)}>
                            <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleRenewClick(sub)}>
                            <Repeat className="w-4 h-4 mr-2" /> Renovar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleCancelClick(sub)}>
                            <XCircle className="w-4 h-4 mr-2" /> Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeSubTab === "plans" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={handleCreatePlan}>
              <Plus className="w-4 h-4 mr-2" /> Criar Plano
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {dbPlans.map((plan) => (
              <div key={plan.id} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      {plan.promotional_price ? (
                        <>
                          <span className="text-2xl font-bold text-success">{formatPrice(plan.promotional_price)}</span>
                          <span className="text-sm text-muted-foreground line-through">{formatPrice(plan.price)}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        / {plan.period === 0 ? 'vitalício' : `${plan.period} dias`}
                      </span>
                    </div>
                    {plan.max_subscriptions_per_user && (
                      <span className="text-xs text-warning mt-1">
                        Limite: {plan.max_subscriptions_per_user}x por usuário
                      </span>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border border-border">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditPlan(plan)}>
                        <Edit className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => updatePlan(plan.id, { is_active: !plan.is_active })}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> {plan.is_active ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => {
                          setPlanToDelete(plan);
                          setShowDeletePlanModal(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2 mb-4">
                  {(plan.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{plan.subscribers_count || 0} assinantes</span>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-md",
                    plan.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {plan.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Form Modal */}
      <PlanFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        plan={editingPlan}
        onSave={handleSavePlan}
        isLoading={isSavingPlan}
      />

      {/* Delete Plan Confirmation Modal */}
      {showDeletePlanModal && planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeletePlanModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Excluir Plano</h3>
              <p className="text-muted-foreground mb-2">
                Você está prestes a excluir o plano:
              </p>
              <div className="bg-muted/50 rounded-lg px-4 py-3 mb-4 w-full">
                <p className="font-semibold text-foreground">{planToDelete.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(planToDelete.price)} / {planToDelete.period === 0 ? 'vitalício' : `${planToDelete.period} dias`}
                </p>
              </div>
              <p className="text-sm text-destructive mb-6">
                ⚠️ Esta ação é irreversível e não pode ser desfeita.
              </p>
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowDeletePlanModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={async () => {
                    const result = await deletePlan(planToDelete.id);
                    if (result.success) {
                      toast.success('Plano excluído');
                    } else {
                      toast.error(result.error || 'Erro ao excluir plano');
                    }
                    setShowDeletePlanModal(false);
                    setPlanToDelete(null);
                    refetch();
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Plano
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payments Tab */}
      {activeSubTab === "payments" && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Plano</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Método</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dbPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-sm font-mono text-foreground">#{payment.id.slice(0, 8)}</td>
                    <td className="p-4 text-sm text-foreground">{payment.user_name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{payment.plan_name}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{formatPrice(payment.amount)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{payment.payment_method}</td>
                    <td className="p-4">
                      <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[payment.status] || statusStyles.pending)}>
                        {statusLabels[payment.status] || payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(payment.created_at)}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditPaymentStatus(payment)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar Status
                          </DropdownMenuItem>
                          {payment.status !== "refunded" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleRefundClick(payment)}>
                                <RefreshCw className="w-4 h-4 mr-2" /> Reembolsar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Payment Status Modal */}
      {showEditStatusModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditStatusModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Editar Status</h2>
              <button onClick={() => setShowEditStatusModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Pagamento: <strong className="text-foreground">#{selectedPayment.id.slice(0, 8)}</strong></p>
                <p>Usuário: {selectedPayment.user_name}</p>
                <p>Valor: {formatPrice(selectedPayment.amount)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Novo Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                  <option value="failed">Falhou</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowEditStatusModal(false)} className="flex-1" disabled={isSavingStatus}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmStatusChange} className="flex-1" disabled={isSavingStatus}>
                {isSavingStatus ? <Spinner size="sm" className="mr-2" /> : null}
                {isSavingStatus ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRefundModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Confirmar Reembolso</h2>
              <button onClick={() => setShowRefundModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                <RefreshCw className="w-5 h-5 text-warning" />
                <p className="text-sm text-foreground">Reembolsar pagamento <strong>{selectedPayment.id}</strong>?</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Usuário: {selectedPayment.user_name}</p>
                <p>Valor: {formatPrice(selectedPayment.amount)}</p>
                <p>Data: {formatDate(selectedPayment.created_at)}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta ação irá marcar o pagamento como reembolsado.
              </p>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowRefundModal(false)} className="flex-1" disabled={isRefunding}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmRefund} className="flex-1" disabled={isRefunding}>
                {isRefunding ? <Spinner size="sm" className="mr-2" /> : null}
                {isRefunding ? "Reembolsando..." : "Reembolsar"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Subscriber Details Modal */}
      {showDetailsModal && selectedSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailsModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Detalhes do Assinante</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedSubscriber.user_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubscriber.user_email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Plano</p>
                  <p className="text-sm font-medium text-foreground">{selectedSubscriber.plan_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[selectedSubscriber.status as keyof typeof statusStyles])}>
                    {statusLabels[selectedSubscriber.status as keyof typeof statusLabels]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(selectedSubscriber.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Próx. Cobrança</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(selectedSubscriber.next_billing_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="text-sm font-medium text-foreground">{formatPrice(selectedSubscriber.plan_price || 0)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="flex-1">
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Renew Confirmation Modal */}
      {showRenewModal && selectedSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRenewModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Renovar Assinatura</h2>
              <button onClick={() => setShowRenewModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                <Repeat className="w-5 h-5 text-success" />
                <p className="text-sm text-foreground">Renovar assinatura de <strong>{selectedSubscriber.user_name}</strong>?</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Plano: {selectedSubscriber.plan_name}</p>
                <p>Valor: {formatPrice(selectedSubscriber.plan_price || 0)}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowRenewModal(false)} className="flex-1" disabled={isRenewing}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmRenew} className="flex-1 bg-success hover:bg-success/90" disabled={isRenewing}>
                {isRenewing ? <Spinner size="sm" className="mr-2" /> : null}
                {isRenewing ? "Renovando..." : "Renovar"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Cancelar Assinatura</h2>
              <button onClick={() => setShowCancelModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                <XCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-foreground">Cancelar assinatura de <strong>{selectedSubscriber.user_name}</strong>?</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Esta ação irá cancelar a assinatura imediatamente. O usuário perderá acesso aos recursos do plano.
              </p>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1" disabled={isCancelling}>
                Voltar
              </Button>
              <Button variant="destructive" onClick={handleConfirmCancel} className="flex-1" disabled={isCancelling}>
                {isCancelling ? <Spinner size="sm" className="mr-2" /> : null}
                {isCancelling ? "Cancelando..." : "Cancelar Assinatura"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Orders Management Section
const OrdersSection = () => {
  const { orders, isLoading, completeOrder, refundOrder, stats, refetch } = useAdminOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleCompleteClick = (order: any) => {
    setSelectedOrder(order);
    setShowCompleteModal(true);
  };

  const handleRefundClick = (order: any) => {
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
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Gerenciar pedidos e aprovações</p>
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
          value={stats.total.toString()} 
          change={`${stats.pending} pendentes`}
          icon={ShoppingCart}
          trend="up"
        />
        <StatCard 
          title="Concluídos" 
          value={stats.completed.toString()} 
          change={`${Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%`}
          icon={CheckCircle}
          trend="up"
        />
        <StatCard 
          title="Pendentes" 
          value={stats.pending.toString()} 
          change="Aguardando"
          icon={Clock}
          trend={stats.pending > 0 ? "down" : "up"}
        />
        <StatCard 
          title="Receita" 
          value={formatPrice(stats.totalRevenue)} 
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Data</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.user_name}</p>
                        <p className="text-xs text-muted-foreground">{order.user_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{order.product_name}</p>
                      <p className="text-xs text-muted-foreground">{order.product_type}</p>
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
                      <div className="flex justify-end gap-2">
                        {(order.status === 'pending' || order.status === 'paid') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCompleteClick(order)}
                            className="h-8 text-success hover:text-success hover:bg-success/10"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        {order.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefundClick(order)}
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reembolsar
                          </Button>
                        )}
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
                  <span className="text-muted-foreground">Produto</span>
                  <span className="font-medium">{selectedOrder.product_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade</span>
                  <span className="font-medium">{selectedOrder.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-medium text-primary">{formatPrice(selectedOrder.amount)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedOrder.product_type === 'subscription' 
                  ? 'Isso irá ativar a licença do usuário automaticamente.'
                  : 'Isso irá liberar as sessions para o usuário automaticamente.'}
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
    </motion.div>
  );
};

// Dashboard Overview
const DashboardSection = () => {
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Planos</h1>
        <p className="text-sm text-muted-foreground">Gerenciamento de assinaturas e planos</p>
      </div>

      {/* Subscriptions Content - Full Management */}
      <SubscriptionsTabContent />
    </motion.div>
  );
};

// Users Management
const UsersSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  
  const { users: dbUsers, isLoading, updateUserRole, banUser, updateUserProfile, refetch } = useAdminUsers();
  
  // Transform db users to display format
  const users = dbUsers.map(user => ({
    id: user.id,
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    banned: user.banned,
    createdAt: new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    lastLogin: new Date(user.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    whatsapp: user.whatsapp || "—",
  }));

  const statusStyles = {
    active: "bg-success/10 text-success",
    banned: "bg-destructive/10 text-destructive"
  };

  const statusLabels = {
    active: "Ativo",
    banned: "Banido"
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (selectedUser) {
      setIsSavingEdit(true);
      const result = await updateUserProfile(selectedUser.user_id, {
        name: editForm.name,
        email: editForm.email,
      });
      setIsSavingEdit(false);
      if (result.success) {
        setShowEditModal(false);
        setSelectedUser(null);
      }
    }
  };

  const handleBanClick = (user: any) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleConfirmBan = async () => {
    if (selectedUser) {
      setIsBanning(true);
      const newBannedStatus = !selectedUser.banned;
      const result = await banUser(selectedUser.user_id, newBannedStatus);
      setIsBanning(false);
      if (result.success) {
        setShowBanModal(false);
        setSelectedUser(null);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.role !== 'admin' && (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gerenciar usuários do sistema</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por email ou nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">WhatsApp</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Cadastro</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{user.avatar}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-md font-medium",
                        user.banned ? statusStyles.banned : statusStyles.active
                      )}>
                        {user.banned ? statusLabels.banned : statusLabels.active}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.whatsapp}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.createdAt}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewDetails(user)}>
                            <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className={cn(
                              "cursor-pointer",
                              user.banned ? "text-success focus:text-success" : "text-destructive focus:text-destructive"
                            )}
                            onClick={() => handleBanClick(user)}
                          >
                            <Ban className="w-4 h-4 mr-2" /> {user.banned ? "Desbanir" : "Banir"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-card border border-border rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Detalhes do Usuário</h2>
                  <button onClick={() => setShowDetailsModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Header com Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-primary/10">
                    <span className="text-4xl">{selectedUser.avatar}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-semibold text-foreground truncate">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Cadastrado em</p>
                    </div>
                    <p className="font-medium text-foreground">{selectedUser.createdAt}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Última atualização</p>
                    </div>
                    <p className="font-medium text-foreground">{selectedUser.updatedAt || selectedUser.createdAt}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{selectedUser.whatsapp || 'Não informado'}</p>
                      {selectedUser.whatsapp && (
                        <a 
                          href={`https://wa.me/${selectedUser.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-success/10 text-success px-3 py-1 rounded-full hover:bg-success/20 transition-colors"
                        >
                          Abrir Chat
                        </a>
                      )}
                    </div>
                  </div>
                </div>


                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEdit(selectedUser);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button 
                    variant={selectedUser.banned ? "default" : "destructive"}
                    className="flex-1"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleBanClick(selectedUser);
                    }}
                  >
                    {selectedUser.banned ? (
                      <><UserCheck className="w-4 h-4 mr-2" /> Desbanir</>
                    ) : (
                      <><Ban className="w-4 h-4 mr-2" /> Banir</>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-card border border-border rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Editar Usuário</h2>
                  <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Nome</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)} disabled={isSavingEdit}>
                      Cancelar
                    </Button>
                    <Button className="flex-1" onClick={handleSaveEdit} disabled={isSavingEdit}>
                      {isSavingEdit ? <Spinner size="sm" className="mr-2" /> : null}
                      {isSavingEdit ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ban Confirmation Modal */}
      <AnimatePresence>
        {showBanModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowBanModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm max-h-[calc(100vh-2rem)] overflow-y-auto bg-card border border-border rounded-lg p-6 shadow-xl">
                <div className="text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
                    selectedUser.banned ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    <Ban className={cn("w-6 h-6", selectedUser.banned ? "text-success" : "text-destructive")} />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    {selectedUser.banned ? "Desbanir usuário?" : "Banir usuário?"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedUser.banned 
                      ? `Tem certeza que deseja desbanir ${selectedUser.name}? O usuário poderá acessar o sistema novamente.`
                      : `Tem certeza que deseja banir ${selectedUser.name}? O usuário não poderá mais acessar o sistema.`
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowBanModal(false)} disabled={isBanning}>
                      Cancelar
                    </Button>
                    <Button 
                      variant={selectedUser.banned ? "default" : "destructive"} 
                      className="flex-1" 
                      onClick={handleConfirmBan}
                      disabled={isBanning}
                    >
                      {isBanning ? <Spinner size="sm" className="mr-2" /> : null}
                      {isBanning 
                        ? (selectedUser.banned ? "Desbanindo..." : "Banindo...") 
                        : (selectedUser.banned ? "Desbanir" : "Banir")
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// Sessions Management
const SessionsSection = () => {
  const { 
    inventory, 
    combos: dbCombos, 
    sessionFiles,
    soldSessions,
    isLoading, 
    isUploading,
    uploadSessionFiles,
    deleteSessionFile,
    updateInventory, 
    updateCombo: updateDbCombo, 
    addCombo: addDbCombo, 
    deleteCombo,
    getCombosByType,
    getFilesByType,
    stats 
  } = useAdminSessions();
  
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'brasileiras' | 'estrangeiras'>('brasileiras');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; totalUploaded: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for editable values
  const [costBrasileiras, setCostBrasileiras] = useState("");
  const [costEstrangeiras, setCostEstrangeiras] = useState("");
  const [comboEdits, setComboEdits] = useState<Record<string, { quantity: string; price: string }>>({});
  
  // Custom quantity settings state
  const [customQtyBrEnabled, setCustomQtyBrEnabled] = useState(false);
  const [customQtyBrMin, setCustomQtyBrMin] = useState("1");
  const [customQtyBrPrice, setCustomQtyBrPrice] = useState("0.00");
  const [customQtyEstEnabled, setCustomQtyEstEnabled] = useState(false);
  const [customQtyEstMin, setCustomQtyEstMin] = useState("1");
  const [customQtyEstPrice, setCustomQtyEstPrice] = useState("0.00");

  // Initialize local state from DB values
  useEffect(() => {
    if (stats.brasileiras) {
      setCostBrasileiras(stats.brasileiras.cost_per_session?.toFixed(2) || "0.00");
      setCustomQtyBrEnabled(stats.brasileiras.custom_quantity_enabled || false);
      setCustomQtyBrMin(String(stats.brasileiras.custom_quantity_min || 1));
      setCustomQtyBrPrice((stats.brasileiras.custom_price_per_unit || 0).toFixed(2));
    }
    if (stats.estrangeiras) {
      setCostEstrangeiras(stats.estrangeiras.cost_per_session?.toFixed(2) || "0.00");
      setCustomQtyEstEnabled(stats.estrangeiras.custom_quantity_enabled || false);
      setCustomQtyEstMin(String(stats.estrangeiras.custom_quantity_min || 1));
      setCustomQtyEstPrice((stats.estrangeiras.custom_price_per_unit || 0).toFixed(2));
    }
  }, [stats.brasileiras, stats.estrangeiras]);

  useEffect(() => {
    const edits: Record<string, { quantity: string; price: string }> = {};
    dbCombos.forEach(combo => {
      if (!comboEdits[combo.id]) {
        edits[combo.id] = { quantity: combo.quantity.toString(), price: combo.price.toFixed(2) };
      }
    });
    if (Object.keys(edits).length > 0) {
      setComboEdits(prev => ({ ...prev, ...edits }));
    }
  }, [dbCombos]);

  const brasileirasInv = stats.brasileiras;
  const estrangeirasInv = stats.estrangeiras;
  const brasileirasCombos = getCombosByType('brasileiras');
  const estrangeirasCombos = getCombosByType('estrangeiras');
  const brasileirasFiles = getFilesByType('brasileiras');
  const estrangeirasFiles = getFilesByType('estrangeiras');

  const handleSelectType = (type: 'brasileiras' | 'estrangeiras') => {
    setUploadType(type);
    setShowTypeSelector(false);
    // Trigger file input
    document.getElementById('session-upload')?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
      setShowUploadModal(true);
    }
    e.target.value = '';
  };

  const handleConfirmUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    const result = await uploadSessionFiles(selectedFiles, uploadType);
    setUploadResult({ success: result.success, totalUploaded: result.totalUploaded || 0 });
    
    if (result.success) {
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFiles([]);
        setUploadResult(null);
      }, 2000);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setUploadResult(null);
  };

  const handleComboEdit = (comboId: string, field: 'quantity' | 'price', value: string) => {
    setComboEdits(prev => ({
      ...prev,
      [comboId]: { ...prev[comboId], [field]: value }
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Save inventory costs and custom quantity settings
      const costBrValue = parseFloat(costBrasileiras.replace(',', '.')) || 0;
      const costEstValue = parseFloat(costEstrangeiras.replace(',', '.')) || 0;
      const customBrMin = parseInt(customQtyBrMin) || 1;
      const customBrPrice = parseFloat(customQtyBrPrice.replace(',', '.')) || 0;
      const customEstMin = parseInt(customQtyEstMin) || 1;
      const customEstPrice = parseFloat(customQtyEstPrice.replace(',', '.')) || 0;
      
      await updateInventory('brasileiras', { 
        cost_per_session: costBrValue,
        custom_quantity_enabled: customQtyBrEnabled,
        custom_quantity_min: customBrMin,
        custom_price_per_unit: customBrPrice
      });
      await updateInventory('estrangeiras', { 
        cost_per_session: costEstValue,
        custom_quantity_enabled: customQtyEstEnabled,
        custom_quantity_min: customEstMin,
        custom_price_per_unit: customEstPrice
      });

      // Save combo edits
      for (const [comboId, edit] of Object.entries(comboEdits)) {
        const quantity = parseInt(edit.quantity) || 0;
        const price = parseFloat(edit.price.replace(',', '.')) || 0;
        await updateDbCombo(comboId, { quantity, price });
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCombo = async (type: string) => {
    await addDbCombo(type, 10, 49.90);
  };

  const handleDeleteCombo = async (comboId: string) => {
    await deleteCombo(comboId);
    setComboEdits(prev => {
      const newEdits = { ...prev };
      delete newEdits[comboId];
      return newEdits;
    });
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

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sessions</h1>
          <p className="text-sm text-muted-foreground">Gerenciar estoque de sessions importadas (.session)</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".session"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="session-upload"
          />
          <Button size="sm" disabled={isUploading} onClick={() => setShowTypeSelector(true)}>
            <Plus className="w-4 h-4 mr-2" /> Importar Sessions
          </Button>
        </div>
      </div>

      {/* Type Selector Modal */}
      <AnimatePresence>
        {showTypeSelector && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowTypeSelector(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm bg-card border border-border rounded-lg p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                  Qual tipo de session?
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSelectType('brasileiras')}
                    className="flex-1 p-4 rounded-lg bg-success/10 hover:bg-success/20 border border-success/30 transition-colors"
                  >
                    <span className="text-3xl block mb-2">🇧🇷</span>
                    <span className="text-sm font-medium text-foreground">Brasileiras</span>
                  </button>
                  <button
                    onClick={() => handleSelectType('estrangeiras')}
                    className="flex-1 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-colors"
                  >
                    <span className="text-3xl block mb-2">🌍</span>
                    <span className="text-sm font-medium text-foreground">Estrangeiras</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upload Confirmation Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancelUpload}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Upload {uploadType === 'brasileiras' ? '🇧🇷 Brasileiras' : '🌍 Estrangeiras'}
                  </h2>
                  <button onClick={handleCancelUpload} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {uploadResult ? (
                  <div className={cn(
                    "p-4 rounded-lg text-center",
                    uploadResult.success ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {uploadResult.success ? (
                      <>
                        <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
                        <p className="text-success font-medium">
                          {uploadResult.totalUploaded} arquivo(s) importado(s) com sucesso!
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
                        <p className="text-destructive font-medium">Erro ao fazer upload</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedFiles.length} arquivo(s) selecionado(s)
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="text-xs bg-muted/30 px-2 py-1 rounded">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={handleCancelUpload}>
                        Cancelar
                      </Button>
                      <Button 
                        className="flex-1" 
                        onClick={handleConfirmUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Fazer Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Disponíveis</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalAvailable}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Brasileiras</p>
          <p className="text-2xl font-bold text-success">{stats.totalBrasileiras}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Estrangeiras</p>
          <p className="text-2xl font-bold text-primary">{stats.totalEstrangeiras}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Arquivos</p>
          <p className="text-2xl font-bold text-foreground">{sessionFiles.length}</p>
        </div>
      </div>

      {/* Session Files List */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Arquivos de Session ({sessionFiles.length})
        </h3>
        
        {sessionFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum arquivo importado ainda</p>
            <p className="text-xs">Use o botão "Importar Sessions" para adicionar arquivos</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessionFiles.slice(0, 50).map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">{file.type === 'brasileiras' ? '🇧🇷' : '🌍'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(file.uploaded_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-md",
                    file.status === 'available' ? "bg-success/10 text-success" :
                    file.status === 'sold' ? "bg-muted text-muted-foreground" :
                    "bg-warning/10 text-warning"
                  )}>
                    {file.status === 'available' ? 'Disponível' : file.status === 'sold' ? 'Vendido' : 'Reservado'}
                  </span>
                  {file.status === 'available' && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteSessionFile(file.id, file.file_path)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {sessionFiles.length > 50 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                Mostrando 50 de {sessionFiles.length} arquivos
              </p>
            )}
          </div>
        )}
      </div>

      {/* Custo Pago por Session */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Custo Pago por Session
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Valor que você paga ao adquirir cada session</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Custo Session Brasileira (R$)</label>
            <input
              type="text"
              value={costBrasileiras}
              onChange={(e) => setCostBrasileiras(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="5.00"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Custo Session Estrangeira (R$)</label>
            <input
              type="text"
              value={costEstrangeiras}
              onChange={(e) => setCostEstrangeiras(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="2.50"
            />
          </div>
        </div>
      </div>

      {/* Quantidade Personalizada */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Quantidade Personalizada
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Permite que usuários escolham uma quantidade personalizada além dos combos</p>
        
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Brasileiras */}
          <div className="space-y-3 p-4 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                🇧🇷 Sessions Brasileiras
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={customQtyBrEnabled}
                  onChange={(e) => setCustomQtyBrEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-success peer-focus:ring-2 peer-focus:ring-success/50 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            {customQtyBrEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Quantidade Mín.</label>
                  <input
                    type="number"
                    min="1"
                    value={customQtyBrMin}
                    onChange={(e) => setCustomQtyBrMin(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Preço/Unid. (R$)</label>
                  <input
                    type="text"
                    value={customQtyBrPrice}
                    onChange={(e) => setCustomQtyBrPrice(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="5.00"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Estrangeiras */}
          <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                🌍 Sessions Estrangeiras
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={customQtyEstEnabled}
                  onChange={(e) => setCustomQtyEstEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/50 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            {customQtyEstEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Quantidade Mín.</label>
                  <input
                    type="number"
                    min="1"
                    value={customQtyEstMin}
                    onChange={(e) => setCustomQtyEstMin(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Preço/Unid. (R$)</label>
                  <input
                    type="text"
                    value={customQtyEstPrice}
                    onChange={(e) => setCustomQtyEstPrice(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="2.50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Combos Brasileiras */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Combos Sessions Brasileiras
          </h3>
          <Button size="sm" variant="outline" onClick={() => handleAddCombo('brasileiras')}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>
        <div className="space-y-3">
          {brasileirasCombos.map((combo) => (
            <div key={combo.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Quantidade</label>
                  <input
                    type="number"
                    value={comboEdits[combo.id]?.quantity || combo.quantity}
                    onChange={(e) => handleComboEdit(combo.id, 'quantity', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Preço Venda (R$)</label>
                  <input
                    type="text"
                    value={comboEdits[combo.id]?.price || combo.price.toFixed(2)}
                    onChange={(e) => handleComboEdit(combo.id, 'price', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteCombo(combo.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Combos Estrangeiras */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Combos Sessions Estrangeiras
          </h3>
          <Button size="sm" variant="outline" onClick={() => handleAddCombo('estrangeiras')}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>
        <div className="space-y-3">
          {estrangeirasCombos.map((combo) => (
            <div key={combo.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Quantidade</label>
                  <input
                    type="number"
                    value={comboEdits[combo.id]?.quantity || combo.quantity}
                    onChange={(e) => handleComboEdit(combo.id, 'quantity', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Preço Venda (R$)</label>
                  <input
                    type="text"
                    value={comboEdits[combo.id]?.price || combo.price.toFixed(2)}
                    onChange={(e) => handleComboEdit(combo.id, 'price', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteCombo(combo.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {/* Histórico de Vendas */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Histórico de Vendas
        </h3>
        
        {soldSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma venda registrada ainda</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {soldSessions.slice(0, 30).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">{sale.type === 'brasileiras' ? '🇧🇷' : '🌍'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{sale.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(sale.sold_at)}</p>
                  </div>
                </div>
                <div className="text-right min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{sale.buyer_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{sale.buyer_email}</p>
                </div>
              </div>
            ))}
            {soldSessions.length > 30 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                Mostrando 30 de {soldSessions.length} vendas
              </p>
            )}
          </div>
        )}
      </div>

    </motion.div>
  );
};

// API Section - PixUp + Resend + reCAPTCHA
const ApiSection = () => {
  const [activeApiTab, setActiveApiTab] = useState<"gateway" | "email" | "security" | "template">("gateway");
  
  // PixUp state
  const [pixupEnabled, setPixupEnabled] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasSecret, setHasSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mercado Pago state
  const [mpEnabled, setMpEnabled] = useState(false);
  const [mpAccessToken, setMpAccessToken] = useState("");
  const [mpPublicKey, setMpPublicKey] = useState("");
  const [hasMpToken, setHasMpToken] = useState(false);
  const [showMpToken, setShowMpToken] = useState(false);
  const [isSavingMp, setIsSavingMp] = useState(false);
  const [mpSaveSuccess, setMpSaveSuccess] = useState(false);
  const [isTestingMp, setIsTestingMp] = useState(false);
  const [mpConnected, setMpConnected] = useState(false);

  // EvoPay state
  const [evoEnabled, setEvoEnabled] = useState(false);
  const [evoApiKey, setEvoApiKey] = useState("");
  const [evoWebhookUrl, setEvoWebhookUrl] = useState("");
  const [hasEvoKey, setHasEvoKey] = useState(false);
  const [showEvoKey, setShowEvoKey] = useState(false);
  const [isSavingEvo, setIsSavingEvo] = useState(false);
  const [evoSaveSuccess, setEvoSaveSuccess] = useState(false);
  const [isTestingEvo, setIsTestingEvo] = useState(false);
  const [evoConnected, setEvoConnected] = useState(false);

  // Resend state
  const [resendApiKey, setResendApiKey] = useState("");
  const [resendFromEmail, setResendFromEmail] = useState("");
  const [resendFromName, setResendFromName] = useState("DLG Connect");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [hasResendKey, setHasResendKey] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailSaveSuccess, setEmailSaveSuccess] = useState(false);

  // reCAPTCHA state
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState("");
  const [recaptchaSecretKey, setRecaptchaSecretKey] = useState("");
  const [hasRecaptchaSecret, setHasRecaptchaSecret] = useState(false);
  const [showRecaptchaSecret, setShowRecaptchaSecret] = useState(false);
  const [isSavingRecaptcha, setIsSavingRecaptcha] = useState(false);
  const [recaptchaSaveSuccess, setRecaptchaSaveSuccess] = useState(false);

  // Feature toggles
  const [passwordRecoveryEnabled, setPasswordRecoveryEnabled] = useState(false);
  const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(false);
  const [isSavingToggles, setIsSavingToggles] = useState(false);

  // Email template state
  const [templateTitle, setTemplateTitle] = useState("✉️ Verificação de Email");
  const [templateGreeting, setTemplateGreeting] = useState("Olá {name}!");
  const [templateMessage, setTemplateMessage] = useState("Seu código de verificação é:");
  const [templateExpiryText, setTemplateExpiryText] = useState("Este código expira em 15 minutos.");
  const [templateFooter, setTemplateFooter] = useState("DLG Connect - Sistema de Gestão");
  const [templateBgColor, setTemplateBgColor] = useState("#0a0a0a");
  const [templateAccentColor, setTemplateAccentColor] = useState("#4ade80");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const { data, error } = await supabase.functions.invoke('pixup', {
          body: { action: 'get_settings' }
        });

        console.log('API settings loaded:', data);

        if (data?.success && data?.data) {
          setClientId(data.data.client_id || "");
          setWebhookUrl(data.data.webhook_url || "");
          setIsConnected(data.data.is_active === true);
          setPixupEnabled(data.data.is_active === true);
          setHasSecret(data.data.has_secret === true);
          // Resend settings
          setResendFromEmail(data.data.resend_from_email || "");
          setResendFromName(data.data.resend_from_name || "DLG Connect");
          setEmailEnabled(data.data.email_enabled === true);
          setHasResendKey(data.data.has_resend_key === true);
          // reCAPTCHA settings
          setRecaptchaEnabled(data.data.recaptcha_enabled === true);
          setRecaptchaSiteKey(data.data.recaptcha_site_key || "");
          setHasRecaptchaSecret(data.data.has_recaptcha_secret === true);
          // Feature toggles
          setPasswordRecoveryEnabled(data.data.password_recovery_enabled === true);
          setEmailVerificationEnabled(data.data.email_verification_enabled === true);
          // Email template settings
          setTemplateTitle(data.data.email_template_title || "✉️ Verificação de Email");
          setTemplateGreeting(data.data.email_template_greeting || "Olá {name}!");
          setTemplateMessage(data.data.email_template_message || "Seu código de verificação é:");
          setTemplateExpiryText(data.data.email_template_expiry_text || "Este código expira em 15 minutos.");
          setTemplateFooter(data.data.email_template_footer || "DLG Connect - Sistema de Gestão");
          setTemplateBgColor(data.data.email_template_bg_color || "#0a0a0a");
          setTemplateAccentColor(data.data.email_template_accent_color || "#4ade80");
          // Mercado Pago settings
          setMpEnabled(data.data.mercadopago_enabled === true);
          setMpPublicKey(data.data.mercadopago_public_key || "");
          setHasMpToken(data.data.has_mercadopago_token === true);
          // EvoPay settings
          setEvoEnabled(data.data.evopay_enabled === true);
          setHasEvoKey(data.data.has_evopay_key === true);
          setEvoWebhookUrl(data.data.evopay_webhook_url || "");
        } else {
          // No settings yet
          setClientId("");
          setWebhookUrl("");
          setIsConnected(false);
          setPixupEnabled(false);
          setHasSecret(false);
          setMpEnabled(false);
          setMpPublicKey("");
          setHasMpToken(false);
          setEvoEnabled(false);
          setHasEvoKey(false);
        }
      } catch (error) {
        console.error('Error loading API settings:', error);
        toast.error("Erro ao carregar configurações");
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    const trimmedClientId = clientId.trim();
    const trimmedClientSecret = clientSecret.trim();
    
    if (!trimmedClientId) {
      toast.error("Preencha o Client ID");
      return;
    }
    
    // Require secret if no existing secret
    if (!hasSecret && !trimmedClientSecret) {
      toast.error("Preencha o Client Secret");
      return;
    }

    setIsLoading(true);
    setSaveSuccess(false);
    try {
      const payload: any = { 
        action: 'save_credentials',
        client_id: trimmedClientId,
        webhook_url: webhookUrl.trim(),
        is_active: pixupEnabled
      };
      
      // Include secret if provided (new or update)
      if (trimmedClientSecret) {
        payload.client_secret = trimmedClientSecret;
      }

      console.log('Saving credentials:', { ...payload, client_secret: payload.client_secret ? '***' : undefined });

      const { data, error } = await supabase.functions.invoke('pixup', {
        body: payload
      });

      console.log('Save response:', data);

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success("Credenciais salvas com sucesso!");
        setHasSecret(true);
        setClientSecret(""); // Clear secret input after save
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        toast.error(data?.error || "Erro ao salvar credenciais");
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error("Erro ao salvar credenciais");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('pixup', {
        body: { action: 'test_connection' }
      });

      console.log('Test connection response:', data);

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success("Conexão bem sucedida!");
        setIsConnected(true);
      } else {
        toast.error(data?.error || "Falha na conexão");
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error("Erro ao testar conexão");
      setIsConnected(false);
    } finally {
    setIsTesting(false);
    }
  };

  // Mercado Pago save handler
  const handleSaveMercadoPago = async () => {
    setIsSavingMp(true);
    setMpSaveSuccess(false);
    try {
      // Save directly to database via RPC or edge function
      const { data, error } = await supabase.functions.invoke('pixup', {
        body: { 
          action: 'save_mercadopago_settings',
          mercadopago_enabled: mpEnabled,
          mercadopago_public_key: mpPublicKey.trim() || null,
          mercadopago_access_token: mpAccessToken.trim() || null
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Configurações do Mercado Pago salvas!");
        setMpSaveSuccess(true);
        setHasMpToken(!!mpAccessToken.trim() || hasMpToken);
        setMpAccessToken(""); // Clear after save
        setTimeout(() => setMpSaveSuccess(false), 2000);
      } else {
        toast.error(data?.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error('Error saving Mercado Pago settings:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSavingMp(false);
    }
  };

  // Mercado Pago test connection handler
  const handleTestMercadoPago = async () => {
    setIsTestingMp(true);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago', {
        body: { action: 'test_connection' }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Conexão estabelecida! Conta: ${data.data?.email || 'OK'}`);
        setMpConnected(true);
      } else {
        toast.error(data?.error || "Falha na conexão");
        setMpConnected(false);
      }
    } catch (error) {
      console.error('Error testing Mercado Pago connection:', error);
      toast.error("Erro ao testar conexão");
      setMpConnected(false);
    } finally {
      setIsTestingMp(false);
    }
  };

  // EvoPay save handler
  const handleSaveEvoPay = async () => {
    setIsSavingEvo(true);
    setEvoSaveSuccess(false);
    try {
      const { data, error } = await supabase.functions.invoke('pixup', {
        body: { 
          action: 'save_evopay_settings',
          evopay_enabled: evoEnabled,
          evopay_api_key: evoApiKey.trim() || null,
          evopay_webhook_url: evoWebhookUrl.trim() || null
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Configurações do EvoPay salvas!");
        setEvoSaveSuccess(true);
        setHasEvoKey(!!evoApiKey.trim() || hasEvoKey);
        setEvoApiKey(""); // Clear after save
        setTimeout(() => setEvoSaveSuccess(false), 2000);
      } else {
        toast.error(data?.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error('Error saving EvoPay settings:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSavingEvo(false);
    }
  };

  // EvoPay test connection handler
  const handleTestEvoPay = async () => {
    setIsTestingEvo(true);
    try {
      const { data, error } = await supabase.functions.invoke('evopay', {
        body: { action: 'test_connection' }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Conexão estabelecida! Saldo: R$ ${data.data?.balance?.toFixed(2) || '0.00'}`);
        setEvoConnected(true);
      } else {
        toast.error(data?.error || "Falha na conexão");
        setEvoConnected(false);
      }
    } catch (error) {
      console.error('Error testing EvoPay connection:', error);
      toast.error("Erro ao testar conexão");
      setEvoConnected(false);
    } finally {
      setIsTestingEvo(false);
    }
  };

  const handleSaveEmail = async () => {
    const trimmedApiKey = resendApiKey.trim();
    const trimmedFromEmail = resendFromEmail.trim();
    
    if (!hasResendKey && !trimmedApiKey) {
      toast.error("Preencha a API Key do Resend");
      return;
    }
    
    if (!trimmedFromEmail) {
      toast.error("Preencha o email de envio");
      return;
    }

    setIsSavingEmail(true);
    setEmailSaveSuccess(false);
    try {
      const payload: any = { 
        action: 'save_email_settings',
        resend_from_email: trimmedFromEmail,
        resend_from_name: resendFromName.trim() || "DLG Connect",
        email_enabled: true
      };
      
      if (trimmedApiKey) {
        payload.resend_api_key = trimmedApiKey;
      }

      const { data, error } = await supabase.functions.invoke('pixup', {
        body: payload
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Configurações de email salvas!");
        setHasResendKey(true);
        setEmailEnabled(true);
        setResendApiKey("");
        setEmailSaveSuccess(true);
        setTimeout(() => setEmailSaveSuccess(false), 2000);
      } else {
        toast.error(data?.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error("Erro ao salvar configurações de email");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          action: 'test',
          to: resendFromEmail
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Email de teste enviado!");
      } else {
        toast.error(data?.error || "Falha ao enviar email");
      }
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error("Erro ao testar email");
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleSaveToggles = async (field: string, value: boolean) => {
    setIsSavingToggles(true);
    try {
      const { data, error } = await supabase.functions.invoke('pixup', {
        body: { 
          action: 'save_feature_toggles',
          [field]: value
        }
      });
      if (error) throw error;
      if (data?.success) {
        toast.success("Configuração salva!");
        if (field === 'password_recovery_enabled') setPasswordRecoveryEnabled(value);
        if (field === 'email_verification_enabled') setEmailVerificationEnabled(value);
      } else {
        toast.error(data?.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error('Error saving toggle:', error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setIsSavingToggles(false);
    }
  };

  const apiTabs = [
    { id: "gateway" as const, label: "Gateway PIX", icon: CreditCard },
    { id: "email" as const, label: "Email", icon: Zap },
    { id: "security" as const, label: "Segurança", icon: Shield },
    { id: "template" as const, label: "Template", icon: Edit },
  ];

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Configurações de API</h2>
        <p className="text-sm text-muted-foreground">Gerencie integrações e segurança</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-lg">
        {apiTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveApiTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none justify-center",
              activeApiTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Gateway PIX Tab */}
      {activeApiTab === "gateway" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">PixUp (Gateway PIX)</h3>
                <p className="text-sm text-muted-foreground">Credenciais BSPAY</p>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit",
              pixupEnabled && isConnected ? "bg-green-500/10 text-green-500" : 
              pixupEnabled && hasSecret ? "bg-yellow-500/10 text-yellow-500" :
              "bg-muted text-muted-foreground"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full", 
                pixupEnabled && isConnected ? "bg-green-500" : 
                pixupEnabled && hasSecret ? "bg-yellow-500" :
                "bg-muted-foreground"
              )} />
              {pixupEnabled && isConnected ? "Conectado" : 
               pixupEnabled && hasSecret ? "Configurado" : "Desativado"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Habilitar PixUp</span>
              </div>
              <button
                onClick={() => setPixupEnabled(!pixupEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  pixupEnabled ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  pixupEnabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Seu client_id do BSPAY"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder={hasSecret ? "••••••••• (já configurado)" : "Seu client_secret"}
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">URL do Webhook</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://seu-dominio.com/webhook"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleSave} disabled={isLoading} className={cn("gap-2 transition-colors", saveSuccess && "bg-green-600 hover:bg-green-600")}>
                {isLoading ? <Spinner size="sm" /> : saveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saveSuccess ? "Salvo!" : "Salvar"}
              </Button>
              <Button variant="outline" onClick={handleTestConnection} disabled={isTesting} className="gap-2">
                {isTesting ? <Spinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
                Testar
              </Button>
            </div>
          </div>
          </div>

          {/* Mercado Pago Configuration */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Mercado Pago</h3>
                  <p className="text-sm text-muted-foreground">Gateway de pagamento</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit",
                mpEnabled && hasMpToken && mpConnected ? "bg-green-500/10 text-green-500" : 
                mpEnabled && hasMpToken ? "bg-yellow-500/10 text-yellow-500" : 
                "bg-muted text-muted-foreground"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full", 
                  mpEnabled && hasMpToken && mpConnected ? "bg-green-500" : 
                  mpEnabled && hasMpToken ? "bg-yellow-500" : 
                  "bg-muted-foreground"
                )} />
                {mpEnabled && hasMpToken && mpConnected ? "Conectado" : 
                 mpEnabled && hasMpToken ? "Configurado" : "Desativado"}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Habilitar Mercado Pago</span>
                </div>
                <button
                  onClick={() => setMpEnabled(!mpEnabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    mpEnabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    mpEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Public Key</label>
                <input
                  type="text"
                  value={mpPublicKey}
                  onChange={(e) => setMpPublicKey(e.target.value)}
                  placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Access Token</label>
                <div className="relative">
                  <input
                    type={showMpToken ? "text" : "password"}
                    value={mpAccessToken}
                    onChange={(e) => setMpAccessToken(e.target.value)}
                    placeholder={hasMpToken ? "••••••••• (já configurado)" : "APP_USR-xxxxxxxx-xxxx-xxxx-xxxx"}
                    className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMpToken(!showMpToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showMpToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenha em <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener" className="text-primary hover:underline">Mercado Pago Developers</a>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={handleSaveMercadoPago} disabled={isSavingMp} className={cn("gap-2 transition-colors", mpSaveSuccess && "bg-green-600 hover:bg-green-600")}>
                  {isSavingMp ? <Spinner size="sm" /> : mpSaveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {mpSaveSuccess ? "Salvo!" : "Salvar"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestMercadoPago} 
                  disabled={isTestingMp || !hasMpToken}
                  className={cn("gap-2", mpConnected && "border-green-500 text-green-500")}
                >
                  {isTestingMp ? <Spinner size="sm" /> : mpConnected ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {mpConnected ? "Conectado" : "Testar Conexão"}
                </Button>
              </div>

            </div>
          </div>

          {/* EvoPay Configuration */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">EvoPay</h3>
                  <p className="text-sm text-muted-foreground">Gateway PIX alternativo</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit",
                evoEnabled && hasEvoKey && evoConnected ? "bg-green-500/10 text-green-500" : 
                evoEnabled && hasEvoKey ? "bg-yellow-500/10 text-yellow-500" : 
                "bg-muted text-muted-foreground"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full", 
                  evoEnabled && hasEvoKey && evoConnected ? "bg-green-500" : 
                  evoEnabled && hasEvoKey ? "bg-yellow-500" : 
                  "bg-muted-foreground"
                )} />
                {evoEnabled && hasEvoKey && evoConnected ? "Conectado" : 
                 evoEnabled && hasEvoKey ? "Configurado" : "Desativado"}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Habilitar EvoPay</span>
                </div>
                <button
                  onClick={() => setEvoEnabled(!evoEnabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    evoEnabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    evoEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">API Key</label>
                <div className="relative">
                  <input
                    type={showEvoKey ? "text" : "password"}
                    value={evoApiKey}
                    onChange={(e) => setEvoApiKey(e.target.value)}
                    placeholder={hasEvoKey ? "••••••••• (já configurado)" : "Sua API Key do EvoPay"}
                    className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEvoKey(!showEvoKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showEvoKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenha em <a href="https://evopay.cash" target="_blank" rel="noopener" className="text-primary hover:underline">evopay.cash</a>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Webhook URL</label>
                <input
                  type="text"
                  value={evoWebhookUrl}
                  onChange={(e) => setEvoWebhookUrl(e.target.value)}
                  placeholder="URL para receber notificações de pagamento"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Configure no painel do EvoPay para receber callbacks de pagamento
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={handleSaveEvoPay} disabled={isSavingEvo} className={cn("gap-2 transition-colors", evoSaveSuccess && "bg-green-600 hover:bg-green-600")}>
                  {isSavingEvo ? <Spinner size="sm" /> : evoSaveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {evoSaveSuccess ? "Salvo!" : "Salvar"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestEvoPay} 
                  disabled={isTestingEvo || !hasEvoKey}
                  className={cn("gap-2", evoConnected && "border-green-500 text-green-500")}
                >
                  {isTestingEvo ? <Spinner size="sm" /> : evoConnected ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {evoConnected ? "Conectado" : "Testar Conexão"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeApiTab === "email" && (
        <div className="space-y-6">
          {/* Resend Configuration */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Resend (Email)</h3>
                  <p className="text-sm text-muted-foreground">Serviço de envio de emails</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit",
                emailEnabled && hasResendKey ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
              )}>
                <div className={cn("w-2 h-2 rounded-full", emailEnabled && hasResendKey ? "bg-green-500" : "bg-yellow-500")} />
                {emailEnabled && hasResendKey ? "Ativo" : "Inativo"}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">API Key</label>
                <div className="relative">
                  <input
                    type={showResendKey ? "text" : "password"}
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder={hasResendKey ? "••••••••• (já configurada)" : "re_xxxxxxxx..."}
                    className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResendKey(!showResendKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenha em <a href="https://resend.com/api-keys" target="_blank" rel="noopener" className="text-primary hover:underline">resend.com</a>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email de Envio</label>
                  <input
                    type="email"
                    value={resendFromEmail}
                    onChange={(e) => setResendFromEmail(e.target.value)}
                    placeholder="suporte@seudominio.com"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Nome do Remetente</label>
                  <input
                    type="text"
                    value={resendFromName}
                    onChange={(e) => setResendFromName(e.target.value)}
                    placeholder="DLG Connect"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={handleSaveEmail} disabled={isSavingEmail} className={cn("gap-2 transition-colors", emailSaveSuccess && "bg-green-600 hover:bg-green-600")}>
                  {isSavingEmail ? <Spinner size="sm" /> : emailSaveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {emailSaveSuccess ? "Salvo!" : "Salvar"}
                </Button>
                <Button variant="outline" onClick={handleTestEmail} disabled={isTestingEmail || !hasResendKey} className="gap-2">
                  {isTestingEmail ? <Spinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
                  Enviar Teste
                </Button>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Funcionalidades</h3>
              {!(hasResendKey && emailEnabled) && (
                <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                  Configure o Resend primeiro
                </span>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={cn("flex-1", !(hasResendKey && emailEnabled) && "opacity-50")}>
                  <p className="font-medium text-foreground">Recuperação de Senha</p>
                  <p className="text-sm text-muted-foreground">Envio de código por email</p>
                </div>
                <button
                  onClick={() => handleSaveToggles('password_recovery_enabled', !passwordRecoveryEnabled)}
                  disabled={isSavingToggles || !(hasResendKey && emailEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors flex-shrink-0",
                    passwordRecoveryEnabled && hasResendKey && emailEnabled ? 'bg-primary' : 'bg-muted',
                    !(hasResendKey && emailEnabled) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                    passwordRecoveryEnabled && hasResendKey && emailEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className={cn("flex-1", !(hasResendKey && emailEnabled) && "opacity-50")}>
                  <p className="font-medium text-foreground">Verificação no Cadastro</p>
                  <p className="text-sm text-muted-foreground">Código obrigatório para criar conta</p>
                </div>
                <button
                  onClick={() => handleSaveToggles('email_verification_enabled', !emailVerificationEnabled)}
                  disabled={isSavingToggles || !(hasResendKey && emailEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors flex-shrink-0",
                    emailVerificationEnabled && hasResendKey && emailEnabled ? 'bg-primary' : 'bg-muted',
                    !(hasResendKey && emailEnabled) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                    emailVerificationEnabled && hasResendKey && emailEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeApiTab === "security" && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">reCAPTCHA v2</h3>
                <p className="text-sm text-muted-foreground">Proteção contra bots</p>
              </div>
            </div>
            <button
              onClick={async () => {
                setIsSavingRecaptcha(true);
                try {
                  const { data } = await supabase.functions.invoke('pixup', {
                    body: { action: 'save_recaptcha_settings', recaptcha_enabled: !recaptchaEnabled }
                  });
                  if (data?.success) {
                    setRecaptchaEnabled(!recaptchaEnabled);
                    toast.success(recaptchaEnabled ? "Desativado" : "Ativado");
                  } else {
                    toast.error(data?.error || "Erro");
                  }
                } catch { toast.error("Erro ao salvar"); }
                finally { setIsSavingRecaptcha(false); }
              }}
              disabled={isSavingRecaptcha || (!hasRecaptchaSecret && !recaptchaEnabled)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors flex-shrink-0",
                recaptchaEnabled ? 'bg-green-500' : 'bg-muted',
                (!hasRecaptchaSecret && !recaptchaEnabled) && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                recaptchaEnabled ? 'translate-x-6' : 'translate-x-0.5'
              )} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Site Key</label>
              <input
                type="text"
                value={recaptchaSiteKey}
                onChange={(e) => setRecaptchaSiteKey(e.target.value)}
                placeholder="6Lc..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Secret Key</label>
              <div className="relative">
                <input
                  type={showRecaptchaSecret ? "text" : "password"}
                  value={recaptchaSecretKey}
                  onChange={(e) => setRecaptchaSecretKey(e.target.value)}
                  placeholder={hasRecaptchaSecret ? "••••••••• (já configurado)" : "6Lc..."}
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowRecaptchaSecret(!showRecaptchaSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showRecaptchaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Obtenha em <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener" className="text-primary hover:underline">google.com/recaptcha</a>
              </p>
            </div>

            <Button 
              onClick={async () => {
                if (!recaptchaSiteKey.trim()) { toast.error("Preencha a Site Key"); return; }
                if (!hasRecaptchaSecret && !recaptchaSecretKey.trim()) { toast.error("Preencha a Secret Key"); return; }
                setIsSavingRecaptcha(true);
                setRecaptchaSaveSuccess(false);
                try {
                  const payload: any = { action: 'save_recaptcha_settings', recaptcha_site_key: recaptchaSiteKey.trim() };
                  if (recaptchaSecretKey.trim()) payload.recaptcha_secret_key = recaptchaSecretKey.trim();
                  const { data } = await supabase.functions.invoke('pixup', { body: payload });
                  if (data?.success) {
                    toast.success("Salvo!");
                    setHasRecaptchaSecret(true);
                    setRecaptchaSecretKey("");
                    setRecaptchaSaveSuccess(true);
                    setTimeout(() => setRecaptchaSaveSuccess(false), 2000);
                  } else { toast.error(data?.error || "Erro"); }
                } catch { toast.error("Erro ao salvar"); }
                finally { setIsSavingRecaptcha(false); }
              }}
              disabled={isSavingRecaptcha}
              className={cn("gap-2 transition-colors", recaptchaSaveSuccess && "bg-green-600 hover:bg-green-600")}
            >
              {isSavingRecaptcha ? <Spinner size="sm" /> : recaptchaSaveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {recaptchaSaveSuccess ? "Salvo!" : "Salvar"}
            </Button>
          </div>
        </div>
      )}

      {/* Template Tab */}
      {activeApiTab === "template" && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Template de Email</h3>
              <p className="text-sm text-muted-foreground">Usado em cadastro e recuperação de senha</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Título</label>
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Saudação</label>
                <input
                  type="text"
                  value={templateGreeting}
                  onChange={(e) => setTemplateGreeting(e.target.value)}
                  placeholder="Use {name} para o nome"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">Use {"{name}"} para nome do usuário</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Mensagem</label>
                <input
                  type="text"
                  value={templateMessage}
                  onChange={(e) => setTemplateMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Texto de Expiração</label>
                <input
                  type="text"
                  value={templateExpiryText}
                  onChange={(e) => setTemplateExpiryText(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Rodapé</label>
                <input
                  type="text"
                  value={templateFooter}
                  onChange={(e) => setTemplateFooter(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Cor de Fundo</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={templateBgColor}
                      onChange={(e) => setTemplateBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-border flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={templateBgColor}
                      onChange={(e) => setTemplateBgColor(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-2 bg-background border border-border rounded-md text-foreground font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Cor de Destaque</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={templateAccentColor}
                      onChange={(e) => setTemplateAccentColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-border flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={templateAccentColor}
                      onChange={(e) => setTemplateAccentColor(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-2 bg-background border border-border rounded-md text-foreground font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
              <Button 
                onClick={async () => {
                  setIsSavingTemplate(true);
                  setTemplateSaveSuccess(false);
                  try {
                    const { data } = await supabase.functions.invoke('pixup', {
                      body: { 
                        action: 'save_email_template',
                        email_template_title: templateTitle,
                        email_template_greeting: templateGreeting,
                        email_template_message: templateMessage,
                        email_template_expiry_text: templateExpiryText,
                        email_template_footer: templateFooter,
                        email_template_bg_color: templateBgColor,
                        email_template_accent_color: templateAccentColor
                      }
                    });
                    if (data?.success) { 
                      toast.success("Template salvo!"); 
                      setTemplateSaveSuccess(true);
                      setTimeout(() => setTemplateSaveSuccess(false), 2000);
                    }
                    else { toast.error(data?.error || "Erro ao salvar"); }
                  } catch { toast.error("Erro ao salvar"); }
                  finally { setIsSavingTemplate(false); }
                }}
                disabled={isSavingTemplate}
                className={cn("w-full gap-2 transition-colors", templateSaveSuccess && "bg-green-600 hover:bg-green-600")}
              >
                {isSavingTemplate ? <Spinner size="sm" /> : templateSaveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {templateSaveSuccess ? "Salvo!" : "Salvar Template"}
              </Button>
            </div>

            {/* Preview */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Preview</label>
              <div className="rounded-lg overflow-hidden border border-border" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', backgroundColor: templateBgColor, color: '#fff' }}>
                  <h1 style={{ color: templateAccentColor, fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{templateTitle}</h1>
                  <p style={{ marginBottom: '8px', fontSize: '14px' }}>{templateGreeting.replace('{name}', 'João')}</p>
                  <p style={{ marginBottom: '12px', fontSize: '14px' }}>{templateMessage}</p>
                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <div style={{ background: '#111', padding: '12px 24px', borderRadius: '8px', display: 'inline-block' }}>
                      <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', color: templateAccentColor }}>123456</span>
                    </div>
                  </div>
                  <p style={{ color: '#888', fontSize: '11px', marginBottom: '6px' }}>{templateExpiryText}</p>
                  <p style={{ color: '#888', fontSize: '11px' }}>Se você não solicitou, ignore este email.</p>
                  <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />
                  <p style={{ color: '#666', fontSize: '10px' }}>{templateFooter}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Bot Management Section
const BotManagementSection = () => {
  const { botFile, botHistory, isLoading, isUploading, uploadBotFile, deleteBotFile, getDownloadUrl, setActiveVersion } = useAdminBot();
  const [version, setVersion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; path: string; version: string } | null>(null);
  const [activateConfirm, setActivateConfirm] = useState<{ id: string; version: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.exe')) {
        toast.error('Apenas arquivos .exe são permitidos');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !version.trim()) {
      toast.error('Selecione um arquivo e informe a versão');
      return;
    }
    await uploadBotFile(selectedFile, version.trim());
    setSelectedFile(null);
    setVersion("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      setIsDeleting(true);
      await deleteBotFile(deleteConfirm.id, deleteConfirm.path);
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleActivateConfirm = async () => {
    if (activateConfirm) {
      setIsActivating(true);
      await setActiveVersion(activateConfirm.id);
      setIsActivating(false);
      setActivateConfirm(null);
    }
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gerenciar Bot</h2>
        <p className="text-sm text-muted-foreground">Upload do executável DLGConnect.exe</p>
      </div>

      {/* Current Bot File */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          Versão Ativa
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : botFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{botFile.file_name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">v{botFile.version}</span>
                    <span>•</span>
                    <span>{formatBytes(botFile.file_size)}</span>
                    <span>•</span>
                    <span>{formatDate(botFile.uploaded_at)}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const url = await getDownloadUrl();
                  if (url) window.open(url, '_blank');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <HardDrive className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum arquivo de bot ativo</p>
          </div>
        )}
      </div>

      {/* Upload New Bot */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          Enviar Nova Versão
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Versão</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Ex: 1.0.0"
              className="w-full max-w-xs px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Arquivo .exe</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".exe"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
              {selectedFile && (
                <span className="text-sm text-foreground">
                  {selectedFile.name} ({formatBytes(selectedFile.size)})
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !version.trim() || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Enviar Bot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Histórico de Versões
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : botHistory.length > 0 ? (
          <div className="space-y-2">
            {botHistory.map((file) => (
              <div 
                key={file.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  file.is_active 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-muted/20 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileDown className={`w-5 h-5 ${file.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">v{file.version}</span>
                      {file.is_active && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatBytes(file.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploaded_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!file.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivateConfirm({ id: file.id, version: file.version })}
                    >
                      Ativar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const url = await getDownloadUrl(file.file_path);
                      if (url) window.open(url, '_blank');
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirm({ id: file.id, path: file.file_path, version: file.version })}
                    disabled={file.is_active}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma versão no histórico</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Confirmar Exclusão</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Tem certeza que deseja excluir a versão <span className="font-medium text-foreground">v{deleteConfirm.version}</span>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                  {isDeleting ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activate Confirmation Modal */}
      <AnimatePresence>
        {activateConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setActivateConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Confirmar Ativação</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Deseja ativar a versão <span className="font-medium text-foreground">v{activateConfirm.version}</span>? A versão atual será desativada.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setActivateConfirm(null)} disabled={isActivating}>
                  Cancelar
                </Button>
                <Button onClick={handleActivateConfirm} disabled={isActivating}>
                  {isActivating ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {isActivating ? "Ativando..." : "Ativar"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Admin Component
const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(1);
  const { settings, setMaintenanceMode, setAllowRegistration } = useSystemSettings();

  // Use auth hook with admin role requirement
  const { user, isLoading, isAdmin, role, signOut, profile, updateProfile } = useAuth('admin');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Initialize avatar from profile
  useEffect(() => {
    if (profile?.avatar) {
      const avatarIndex = avatars.findIndex(a => a.alt === profile.avatar);
      if (avatarIndex >= 0) {
        setSelectedAvatarId(avatars[avatarIndex].id);
      }
    }
  }, [profile?.avatar]);

  const handleAvatarChange = async (avatar: typeof avatars[0]) => {
    setSelectedAvatarId(avatar.id);
    await updateProfile({ avatar: avatar.alt });
  };

  // Redirect non-admins immediately when role is loaded
  useEffect(() => {
    if (!isLoading && role !== null && role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, role, navigate]);

  // SECURITY: Block ALL rendering until role is confirmed as admin
  // This prevents any admin UI from flashing before authorization is verified
  if (isLoading || !isAdmin) {
    // Still checking auth or not admin
    if (!isLoading && !isAdmin) {
      // Confirmed non-admin - show access denied (redirect happening via useEffect)
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground mb-2">Você não tem permissão para acessar esta página.</p>
            <p className="text-sm text-muted-foreground">Redirecionando...</p>
          </div>
        </div>
      );
    }
    // Still loading - show loading spinner (no admin UI exposed)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <MorphingSquare />
      </div>
    );
  }

  // From here, user is CONFIRMED as admin - safe to render admin UI
  
  const adminUser = {
    name: user?.user_metadata?.name || "Administrador",
    email: user?.email || "admin@dlgconnect.com",
    initials: (user?.user_metadata?.name || "AD").slice(0, 2).toUpperCase(),
  };

  const sidebarTabs = ["dashboard", "orders", "users", "sessions", "bot", "api"];

  const profileNavItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="h-full w-full" />, onClick: () => setActiveTab("dashboard") },
    { label: "Pedidos", icon: <ShoppingCart className="h-full w-full" />, onClick: () => setActiveTab("orders") },
    { label: "Usuários", icon: <Users className="h-full w-full" />, onClick: () => setActiveTab("users") },
    { label: "Sessions", icon: <Globe className="h-full w-full" />, onClick: () => setActiveTab("sessions") },
    { label: "Bot", icon: <HardDrive className="h-full w-full" />, onClick: () => setActiveTab("bot") },
    { label: "API", icon: <Zap className="h-full w-full" />, onClick: () => setActiveTab("api") },
  ];

  const toggleItems = [
    { 
      label: "Manutenção", 
      icon: <Wrench className="h-full w-full" />, 
      checked: settings.maintenanceMode, 
      onCheckedChange: setMaintenanceMode 
    },
    { 
      label: "Novos registros", 
      icon: <UserPlus className="h-full w-full" />, 
      checked: settings.allowRegistration, 
      onCheckedChange: setAllowRegistration 
    },
  ];

  const sidebarActiveIndex = sidebarTabs.indexOf(activeTab);

  const handleSidebarChange = (index: number) => {
    setActiveTab(sidebarTabs[index]);
  };

  const logoutItem = {
    label: "Sair",
    icon: <LogOut className="h-full w-full" />,
    onClick: () => signOut(),
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardSection />;
      case "orders":
        return <OrdersSection />;
      case "users":
        return <UsersSection />;
      case "sessions":
        return <SessionsSection />;
      case "bot":
        return <BotManagementSection />;
      case "api":
        return <ApiSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-[256px] sticky top-0 h-screen flex-shrink-0 border-r border-border">
        <UserProfileSidebar 
          user={{
            name: adminUser.name,
            email: adminUser.email,
            initials: adminUser.initials,
            selectedAvatarId: selectedAvatarId
          }}
          navItems={profileNavItems}
          toggleItems={toggleItems}
          logoutItem={logoutItem}
          activeIndex={sidebarActiveIndex >= 0 ? sidebarActiveIndex : 0}
          onActiveChange={handleSidebarChange}
          onAvatarChange={handleAvatarChange}
          className="h-full border-r-0"
        />
      </aside>

      {/* Mobile/Tablet Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-card border-r border-border"
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <UserProfileSidebar 
                user={{
                  name: adminUser.name,
                  email: adminUser.email,
                  initials: adminUser.initials,
                  selectedAvatarId: selectedAvatarId
                }}
                navItems={profileNavItems}
                toggleItems={toggleItems}
                logoutItem={logoutItem}
                activeIndex={sidebarActiveIndex >= 0 ? sidebarActiveIndex : 0}
                onActiveChange={(index) => {
                  handleSidebarChange(index);
                  setIsMobileSidebarOpen(false);
                }}
                onAvatarChange={handleAvatarChange}
                className="h-full border-r-0"
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-14 lg:pt-0 min-w-0">
        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-4 px-6">
          <p className="text-center text-xs text-muted-foreground">
            © 2025 DLG Connect. Desenvolvido por{" "}
            <a 
              href="https://wa.me/5565996498222" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Kauan Hup
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Admin;
