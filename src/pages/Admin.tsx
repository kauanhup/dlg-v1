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
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useAdminBot } from "@/hooks/useAdminBot";
import { MorphingSquare } from "@/components/ui/morphing-square";
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
  History
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
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  plan: { id: string; name: string; price: string; promotional_price?: string | null; period: number; features: string[]; status: string } | null;
  onSave: (planData: { name: string; price: string; promotional_price: string | null; period: number; features: string[]; status: string }) => void;
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [period, setPeriod] = useState(30);
  const [features, setFeatures] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (isOpen && plan) {
      setName(plan.name);
      setPrice(String(plan.price).replace("R$ ", "").replace(",", "."));
      setPromotionalPrice(plan.promotional_price ? String(plan.promotional_price).replace("R$ ", "").replace(",", ".") : "");
      setPeriod(Number(plan.period) || 30);
      setFeatures(plan.features?.join("\n") || "");
      setStatus(plan.status);
    } else if (isOpen && !plan) {
      setName("");
      setPrice("");
      setPromotionalPrice("");
      setPeriod(30);
      setFeatures("");
      setStatus("active");
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
      status
    });
    onClose();
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

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {plan ? "Salvar" : "Criar Plano"}
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
      const result = await renewSubscription(selectedSubscriber.id, selectedSubscriber.plan_id);
      if (!result.success) {
        toast.error(result.error || 'Erro ao renovar assinatura');
      } else {
        toast.success('Assinatura renovada com sucesso');
      }
    }
    setShowRenewModal(false);
    setSelectedSubscriber(null);
    refetch();
  };

  const handleConfirmCancel = async () => {
    if (selectedSubscriber) {
      await updateSubscription(selectedSubscriber.id, { 
        status: 'cancelled', 
        next_billing_date: null 
      });
      toast.success('Assinatura cancelada');
    }
    setShowCancelModal(false);
    setSelectedSubscriber(null);
    refetch();
  };

  const handleSavePlan = async (planData: { name: string; price: string; promotional_price: string | null; period: number; features: string[]; status: string }) => {
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
        is_active: planData.status === 'active'
      });
      toast.success('Plano atualizado');
    } else {
      await createPlan({
        name: planData.name,
        price: priceValue,
        promotional_price: promoValue,
        period: planData.period,
        features: planData.features
      });
      toast.success('Plano criado');
    }
    setEditingPlan(null);
    setIsModalOpen(false);
    refetch();
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan({
      ...plan,
      price: formatPrice(plan.price),
      promotional_price: plan.promotional_price ? formatPrice(plan.promotional_price) : null,
      status: plan.is_active ? 'active' : 'inactive'
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
      await updatePayment(selectedPayment.id, { status: newPaymentStatus });
      toast.success('Status atualizado');
    }
    setShowEditStatusModal(false);
    setSelectedPayment(null);
    refetch();
  };

  const handleConfirmRefund = async () => {
    if (selectedPayment) {
      await updatePayment(selectedPayment.id, { status: 'refunded' });
      toast.success('Pagamento reembolsado');
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
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                      <span className="text-sm text-muted-foreground">
                        / {plan.period === 0 ? 'vitalício' : `${plan.period} dias`}
                      </span>
                    </div>
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
              <Button variant="outline" onClick={() => setShowEditStatusModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirmStatusChange} className="flex-1">
                Salvar
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
              <Button variant="outline" onClick={() => setShowRefundModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmRefund} className="flex-1">
                Reembolsar
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
              <Button variant="outline" onClick={() => setShowRenewModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirmRenew} className="flex-1 bg-success hover:bg-success/90">
                Renovar
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
              <Button variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1">
                Voltar
              </Button>
              <Button variant="destructive" onClick={handleConfirmCancel} className="flex-1">
                Cancelar Assinatura
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
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
      const result = await updateUserProfile(selectedUser.user_id, {
        name: editForm.name,
        email: editForm.email,
      });
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
      const newBannedStatus = !selectedUser.banned;
      const result = await banUser(selectedUser.user_id, newBannedStatus);
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
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                      Cancelar
                    </Button>
                    <Button className="flex-1" onClick={handleSaveEdit}>
                      Salvar
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
                    <Button variant="outline" className="flex-1" onClick={() => setShowBanModal(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant={selectedUser.banned ? "default" : "destructive"} 
                      className="flex-1" 
                      onClick={handleConfirmBan}
                    >
                      {selectedUser.banned ? "Desbanir" : "Banir"}
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

  // Initialize local state from DB values
  useEffect(() => {
    if (stats.brasileiras) {
      setCostBrasileiras(stats.brasileiras.cost_per_session?.toFixed(2) || "0.00");
    }
    if (stats.estrangeiras) {
      setCostEstrangeiras(stats.estrangeiras.cost_per_session?.toFixed(2) || "0.00");
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
      // Save inventory costs
      const costBrValue = parseFloat(costBrasileiras.replace(',', '.')) || 0;
      const costEstValue = parseFloat(costEstrangeiras.replace(',', '.')) || 0;
      
      await updateInventory('brasileiras', { cost_per_session: costBrValue });
      await updateInventory('estrangeiras', { cost_per_session: costEstValue });

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

// Gateway Section - PixUp
const GatewaySection = () => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('pixup', {
          body: { action: 'get_settings' }
        });

        if (data?.success && data?.data) {
          setClientId(data.data.client_id || "");
          setWebhookUrl(data.data.webhook_url || "");
          setIsConnected(data.data.is_active || false);
        }
      } catch (error) {
        console.error('Error loading gateway settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!clientId || !clientSecret) {
      toast.error("Preencha o Client ID e Client Secret");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pixup', {
        body: { 
          action: 'save_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          webhook_url: webhookUrl
        }
      });

      if (data?.success) {
        toast.success("Credenciais salvas com sucesso!");
        setIsConnected(true);
        setClientSecret(""); // Clear secret after save
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

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gateway de Pagamento</h2>
          <p className="text-sm text-muted-foreground">Configurações do PixUp (BSPAY)</p>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
          isConnected ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
        )}>
          <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-yellow-500")} />
          {isConnected ? "Conectado" : "Desconectado"}
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Configuração da API</h3>
            <p className="text-sm text-muted-foreground">Credenciais de acesso ao PixUp/BSPAY</p>
          </div>
        </div>

        <div className="space-y-4">
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
                placeholder="Seu client_secret do BSPAY"
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
            <p className="text-xs text-muted-foreground mt-1">
              Obtenha suas credenciais no painel do BSPAY
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">URL do Webhook (opcional)</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://seu-dominio.com/webhook/pixup"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Configurações
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Testar Conexão
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Bot Management Section
const BotManagementSection = () => {
  const { botFile, botHistory, isLoading, isUploading, uploadBotFile, deleteBotFile, getDownloadUrl, setActiveVersion } = useAdminBot();
  const [version, setVersion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; path: string; version: string } | null>(null);
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
      await deleteBotFile(deleteConfirm.id, deleteConfirm.path);
      setDeleteConfirm(null);
    }
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gerenciar Bot</h2>
        <p className="text-sm text-muted-foreground">Upload do executável SWEXTRACTOR.exe</p>
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
                onClick={() => window.open(getDownloadUrl() || '', '_blank')}
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
                      onClick={() => setActiveVersion(file.id)}
                    >
                      Ativar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getDownloadUrl(file.file_path) || '', '_blank')}
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
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
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
    email: user?.email || "admin@swextractor.com",
    initials: (user?.user_metadata?.name || "AD").slice(0, 2).toUpperCase(),
  };

  const sidebarTabs = ["dashboard", "users", "sessions", "bot", "gateway"];

  const profileNavItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="h-full w-full" />, onClick: () => setActiveTab("dashboard") },
    { label: "Usuários", icon: <Users className="h-full w-full" />, onClick: () => setActiveTab("users") },
    { label: "Sessions", icon: <Globe className="h-full w-full" />, onClick: () => setActiveTab("sessions") },
    { label: "Bot", icon: <HardDrive className="h-full w-full" />, onClick: () => setActiveTab("bot") },
    { label: "Gateway", icon: <Zap className="h-full w-full" />, onClick: () => setActiveTab("gateway") },
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
    onClick: async () => {
      await signOut();
      navigate("/login");
    },
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardSection />;
      case "users":
        return <UsersSection />;
      case "sessions":
        return <SessionsSection />;
      case "bot":
        return <BotManagementSection />;
      case "gateway":
        return <GatewaySection />;
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
            © 2025 SWEXTRACTOR. Desenvolvido por{" "}
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
