import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserProfileSidebar } from "@/components/ui/menu";
import { avatars, Avatar } from "@/components/ui/avatar-picker";

// Helper para buscar avatar SVG pelo alt text
const getAvatarSvg = (avatarAlt: string | null | undefined): React.ReactNode => {
  if (!avatarAlt) return avatars[0].svg;
  const found = avatars.find(a => a.alt === avatarAlt);
  return found ? found.svg : avatars[0].svg;
};
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminSessions } from "@/hooks/useAdminSessions";
import { SessionsSection } from "@/components/admin/sessions";
import { SystemDebugPanel } from "@/components/admin/debug";
import { AdminDashboardSection } from "@/components/admin/dashboard";
import { TrialSettingsSection } from "@/components/admin/trial";
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
  Wallet,
  ChevronDown,
  ImageIcon,
  Bug,
  FileText,
  Activity,
  Sliders
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

  // Sanitize price input to only allow numbers and decimal point
  const sanitizePriceInput = (value: string) => {
    // Allow only numbers, dots, and commas
    return value.replace(/[^0-9.,]/g, '').replace(',', '.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    if (!name.trim()) {
      toast.error('Nome do plano é obrigatório');
      return;
    }
    
    // Validate price
    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Preço inválido');
      return;
    }
    
    // Validate promotional price if provided
    if (promotionalPrice) {
      const promoNum = parseFloat(promotionalPrice.replace(',', '.'));
      if (isNaN(promoNum) || promoNum < 0) {
        toast.error('Preço promocional inválido');
        return;
      }
      if (promoNum >= priceNum) {
        toast.error('Preço promocional deve ser menor que o preço original');
        return;
      }
    }
    
    onSave({
      name: name.trim(),
      price,
      promotional_price: promotionalPrice || null,
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
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(sanitizePriceInput(e.target.value))}
                placeholder="49.90"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Use 0 para plano gratuito</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Preço Promocional (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                value={promotionalPrice}
                onChange={(e) => setPromotionalPrice(sanitizePriceInput(e.target.value))}
                placeholder="39.90"
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
    isRefreshing,
    stats,
    refetch,
    updatePlan,
    createPlan,
    deletePlan,
    updateSubscription,
    renewSubscription,
    updatePayment,
    confirmPaymentAndActivateSubscription,
    cancelPaymentAndOrder
  } = useAdminSubscriptions();
  
  const [activeSubTab, setActiveSubTab] = useState<"subscribers" | "plans" | "payments" | "trial">("subscribers");
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
  const [showCancelPaymentModal, setShowCancelPaymentModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);

  // Search states
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");

  // Loading states
  const [isRenewing, setIsRenewing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancellingPayment, setIsCancellingPayment] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // Filter payments to only show subscription payments (product_type === 'subscription')
  const subscriptionPayments = dbPayments.filter(p => p.product_type === 'subscription');

  // Filtered lists based on search
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!subscriberSearch.trim()) return true;
    const searchLower = subscriberSearch.toLowerCase();
    return (
      sub.user_name?.toLowerCase().includes(searchLower) ||
      sub.user_email?.toLowerCase().includes(searchLower) ||
      sub.plan_name?.toLowerCase().includes(searchLower)
    );
  });

  const filteredPayments = subscriptionPayments.filter(payment => {
    if (!paymentSearch.trim()) return true;
    const searchLower = paymentSearch.toLowerCase();
    return (
      payment.user_name?.toLowerCase().includes(searchLower) ||
      payment.user_email?.toLowerCase().includes(searchLower) ||
      payment.plan_name?.toLowerCase().includes(searchLower) ||
      payment.id.toLowerCase().includes(searchLower)
    );
  });

  const filteredPlans = dbPlans.filter(plan => {
    if (!planSearch.trim()) return true;
    const searchLower = planSearch.toLowerCase();
    return plan.name?.toLowerCase().includes(searchLower);
  });

  // Handler for toggling plan active status with feedback
  const handleTogglePlanStatus = async (plan: any) => {
    setTogglingPlanId(plan.id);
    const result = await updatePlan(plan.id, { is_active: !plan.is_active });
    if (result.success) {
      toast.success(plan.is_active ? 'Plano desativado' : 'Plano ativado');
    } else {
      toast.error(result.error || 'Erro ao alterar status do plano');
    }
    setTogglingPlanId(null);
    refetch(false);
  };

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
    refetch(false);
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
    refetch(false);
  };

  const handleSavePlan = async (planData: { name: string; price: string; promotional_price: string | null; period: number; features: string[]; status: string; max_subscriptions_per_user: number | null }) => {
    setIsSavingPlan(true);
    try {
      // Clean price string: remove "R$ " and replace comma with dot for parsing
      const cleanPrice = (str: string) => parseFloat(str.replace('R$ ', '').replace(',', '.')) || 0;
      
      const priceValue = cleanPrice(planData.price);
      const promoValue = planData.promotional_price 
        ? cleanPrice(planData.promotional_price)
        : null;
      
      // Validate price
      if (priceValue < 0) {
        toast.error('O preço não pode ser negativo');
        return;
      }
      
      // Validate promotional price
      if (promoValue !== null && promoValue >= priceValue) {
        toast.error('O preço promocional deve ser menor que o preço original');
        return;
      }
      
      if (editingPlan) {
        const result = await updatePlan(editingPlan.id, { 
          name: planData.name,
          price: priceValue,
          promotional_price: promoValue,
          period: planData.period,
          features: planData.features,
          is_active: planData.status === 'active',
          max_subscriptions_per_user: planData.max_subscriptions_per_user
        });
        if (result.success) {
          toast.success('Plano atualizado');
        } else {
          toast.error(result.error || 'Erro ao atualizar plano');
          return;
        }
      } else {
        const result = await createPlan({
          name: planData.name,
          price: priceValue,
          promotional_price: promoValue,
          period: planData.period,
          features: planData.features,
          max_subscriptions_per_user: planData.max_subscriptions_per_user
        });
        if (result.success) {
          toast.success('Plano criado');
        } else {
          toast.error(result.error || 'Erro ao criar plano');
          return;
        }
      }
      setEditingPlan(null);
      setIsModalOpen(false);
      refetch(false);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleEditPlan = (plan: any) => {
    // Pass raw numeric values - the modal will handle formatting
    setEditingPlan({
      ...plan,
      price: String(plan.price),
      promotional_price: plan.promotional_price ? String(plan.promotional_price) : null,
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
  const handleCancelPaymentClick = (payment: any) => {
    setSelectedPayment(payment);
    setShowCancelPaymentModal(true);
  };

  const handleConfirmPaymentClick = (payment: any) => {
    setSelectedPayment(payment);
    setShowConfirmPaymentModal(true);
  };

  const handleConfirmCancelPayment = async () => {
    if (selectedPayment) {
      setIsCancellingPayment(true);
      const result = await cancelPaymentAndOrder(selectedPayment.id);
      if (result.success) {
        toast.success('Pagamento cancelado');
      } else {
        toast.error(result.error || 'Erro ao cancelar pagamento');
      }
      setIsCancellingPayment(false);
    }
    setShowCancelPaymentModal(false);
    setSelectedPayment(null);
    refetch(false);
  };

  const handleConfirmPaymentConfirmation = async () => {
    if (selectedPayment) {
      setIsConfirmingPayment(true);
      const result = await confirmPaymentAndActivateSubscription(selectedPayment.id);
      if (result.success) {
        toast.success('Pagamento confirmado e assinatura ativada');
      } else {
        toast.error(result.error || 'Erro ao confirmar pagamento');
      }
      setIsConfirmingPayment(false);
    }
    setShowConfirmPaymentModal(false);
    setSelectedPayment(null);
    refetch(false);
  };

  const statusStyles: Record<string, string> = {
    active: "bg-success/10 text-success",
    cancelled: "bg-muted text-muted-foreground",
    overdue: "bg-destructive/10 text-destructive",
    expired: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    failed: "bg-destructive/10 text-destructive",
    refunded: "bg-muted text-muted-foreground"
  };

  const statusLabels: Record<string, string> = {
    active: "Ativo",
    cancelled: "Cancelado",
    overdue: "Atrasado",
    expired: "Expirado",
    paid: "Pago",
    pending: "Pendente",
    failed: "Falhou",
    refunded: "Reembolsado"
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefreshing} className="w-full sm:w-auto">
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-success/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.activeSubscribers}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Assinantes Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-foreground truncate">R$ {stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Receita Mensal</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-warning/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.overdueSubscribers}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pendente</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-destructive/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.churnRate}%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Taxa Cancelamento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="bg-card border border-border rounded-xl p-1 sm:p-1.5">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveSubTab("subscribers")}
            className={cn(
              "flex-1 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2",
              activeSubTab === "subscribers" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Assinantes</span>
            <span className="xs:hidden sm:hidden">Assin.</span>
          </button>
          <button
            onClick={() => setActiveSubTab("plans")}
            className={cn(
              "flex-1 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2",
              activeSubTab === "plans" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Planos
          </button>
          <button
            onClick={() => setActiveSubTab("trial")}
            className={cn(
              "flex-1 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2",
              activeSubTab === "trial" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Trial
          </button>
          <button
            onClick={() => setActiveSubTab("payments")}
            className={cn(
              "flex-1 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2",
              activeSubTab === "payments" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Pagamentos</span>
            <span className="xs:hidden sm:hidden">Pagam.</span>
          </button>
        </div>
      </div>

      {/* Subscribers Tab */}
      {activeSubTab === "subscribers" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou plano..."
              value={subscriberSearch}
              onChange={(e) => setSubscriberSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {subscriberSearch ? "Nenhum resultado encontrado" : "Nenhum assinante"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {subscriberSearch ? "Tente buscar por outro termo." : "Quando usuários assinarem planos, eles aparecerão aqui."}
                </p>
              </div>
            ) : (
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
                    {filteredSubscriptions.map((sub) => (
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
          )}
        </div>
      </div>
    )}

      {/* Plans Tab */}
      {activeSubTab === "plans" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Planos de Assinatura</h3>
              <p className="text-sm text-muted-foreground">{filteredPlans.length} de {dbPlans.length} plano(s)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar plano..."
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  className="w-full sm:w-[200px] pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <Button onClick={handleCreatePlan}>
                <Plus className="w-4 h-4 mr-2" /> Criar Plano
              </Button>
            </div>
          </div>
          
          {/* Empty State */}
          {dbPlans.length === 0 && !isLoading && (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum plano encontrado</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Crie seu primeiro plano de assinatura para começar a vender e gerenciar assinantes.
              </p>
              <Button onClick={handleCreatePlan}>
                <Plus className="w-4 h-4 mr-2" /> Criar Primeiro Plano
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          )}

          {/* Plans Grid */}
          {filteredPlans.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className={cn(
                  "bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-lg hover:border-primary/30",
                  togglingPlanId === plan.id && "opacity-50",
                  !plan.is_active && "opacity-60"
                )}>
                  {/* Plan Header */}
                  <div className="p-5 border-b border-border bg-muted/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                            plan.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                          )}>
                            {plan.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          {plan.promotional_price ? (
                            <>
                              <span className="text-2xl font-bold text-success">{formatPrice(plan.promotional_price)}</span>
                              <span className="text-sm text-muted-foreground line-through">{formatPrice(plan.price)}</span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-foreground">
                              {plan.price === 0 ? 'Grátis' : formatPrice(plan.price)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plan.period === 0 ? 'Acesso vitalício' : `Válido por ${plan.period} dias`}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1" disabled={togglingPlanId === plan.id}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditPlan(plan)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleTogglePlanStatus(plan)}
                          >
                            {plan.is_active ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {plan.is_active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
                  </div>

                  {/* Features */}
                  <div className="p-5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Recursos inclusos</p>
                    <div className="space-y-2.5">
                      {(plan.features || []).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">Nenhum recurso definido</p>
                      )}
                      {(plan.features || []).slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{feature}</span>
                        </div>
                      ))}
                      {(plan.features || []).length > 4 && (
                        <p className="text-xs text-muted-foreground pl-6">
                          +{(plan.features || []).length - 4} recursos
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{plan.subscribers_count || 0}</span>
                      <span className="text-muted-foreground">assinantes</span>
                    </div>
                    {plan.max_subscriptions_per_user && (
                      <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">
                        Limite: {plan.max_subscriptions_per_user}x
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  disabled={isDeletingPlan}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  disabled={isDeletingPlan}
                  onClick={async () => {
                    setIsDeletingPlan(true);
                    const result = await deletePlan(planToDelete.id);
                    if (result.success) {
                      toast.success('Plano excluído');
                    } else {
                      toast.error(result.error || 'Erro ao excluir plano');
                    }
                    setIsDeletingPlan(false);
                    setShowDeletePlanModal(false);
                    setPlanToDelete(null);
                    refetch(false);
                  }}
                >
                  {isDeletingPlan ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Plano
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Trial Tab */}
      {activeSubTab === "trial" && (
        <TrialSettingsSection />
      )}

      {/* Payments Tab */}
      {activeSubTab === "payments" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por ID, usuário ou plano..."
              value={paymentSearch}
              onChange={(e) => setPaymentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {paymentSearch ? "Nenhum resultado encontrado" : "Nenhum pagamento"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {paymentSearch ? "Tente buscar por outro termo." : "Pagamentos de assinaturas aparecerão aqui."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground p-4">ID</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4">Email</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4">Plano</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-4 text-sm font-mono text-foreground">#{payment.id.slice(0, 8)}</td>
                        <td className="p-4 text-sm text-foreground">{payment.user_name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{payment.user_email || '—'}</td>
                        <td className="p-4 text-sm text-muted-foreground">{payment.plan_name}</td>
                        <td className="p-4 text-sm font-medium text-foreground">{formatPrice(payment.amount)}</td>
                        <td className="p-4">
                          <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[payment.status] || statusStyles.pending)}>
                            {statusLabels[payment.status] || payment.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(payment.created_at)}</td>
                        <td className="p-4">
                          {(payment.status === "pending" || payment.status === "cancelled") ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border border-border">
                                <DropdownMenuItem className="cursor-pointer text-success focus:text-success" onClick={() => handleConfirmPaymentClick(payment)}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> {payment.status === "cancelled" ? "Atualizar para Pago" : "Confirmar Pagamento"}
                                </DropdownMenuItem>
                                {payment.status === "pending" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleCancelPaymentClick(payment)}>
                                      <XCircle className="w-4 h-4 mr-2" /> Cancelar
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Payment Modal */}
      {showCancelPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelPaymentModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Cancelar Pagamento</h2>
              <button onClick={() => setShowCancelPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                <XCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-foreground">Cancelar pagamento <strong>#{selectedPayment.id.slice(0, 8)}</strong>?</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Usuário: {selectedPayment.user_name}</p>
                <p>Plano: {selectedPayment.plan_name}</p>
                <p>Valor: {formatPrice(selectedPayment.amount)}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowCancelPaymentModal(false)} className="flex-1" disabled={isCancellingPayment}>
                Voltar
              </Button>
              <Button variant="destructive" onClick={handleConfirmCancelPayment} className="flex-1" disabled={isCancellingPayment}>
                {isCancellingPayment ? <Spinner size="sm" className="mr-2" /> : null}
                {isCancellingPayment ? "Cancelando..." : "Cancelar Pagamento"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {showConfirmPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmPaymentModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Confirmar Pagamento</h2>
              <button onClick={() => setShowConfirmPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
                <p className="text-sm text-foreground">Confirmar pagamento <strong>#{selectedPayment.id.slice(0, 8)}</strong>?</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Usuário: {selectedPayment.user_name}</p>
                <p>Plano: {selectedPayment.plan_name}</p>
                <p>Valor: {formatPrice(selectedPayment.amount)}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta ação irá marcar o pagamento como pago e ativar a assinatura.
              </p>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setShowConfirmPaymentModal(false)} className="flex-1" disabled={isConfirmingPayment}>
                Voltar
              </Button>
              <Button onClick={handleConfirmPaymentConfirmation} className="flex-1" disabled={isConfirmingPayment}>
                {isConfirmingPayment ? <Spinner size="sm" className="mr-2" /> : null}
                {isConfirmingPayment ? "Confirmando..." : "Confirmar Pagamento"}
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
        <p className="text-sm text-muted-foreground">Gerenciamento de assinaturas, planos e teste grátis</p>
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
  const [editForm, setEditForm] = useState({ name: "", email: "", whatsapp: "" });
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
    updatedAt: new Date(user.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
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
    setEditForm({ name: user.name, email: user.email, whatsapp: user.whatsapp === "—" ? "" : user.whatsapp });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (selectedUser) {
      setIsSavingEdit(true);
      const result = await updateUserProfile(selectedUser.user_id, {
        name: editForm.name,
        email: editForm.email,
        whatsapp: editForm.whatsapp || undefined,
      });
      setIsSavingEdit(false);
      if (result.success) {
        toast.success('Usuário atualizado com sucesso!');
        setShowEditModal(false);
        setSelectedUser(null);
        refetch(false);
      } else {
        toast.error(result.error || 'Erro ao atualizar usuário');
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
        toast.success(newBannedStatus ? 'Usuário banido com sucesso!' : 'Usuário desbanido com sucesso!');
        setShowBanModal(false);
        setSelectedUser(null);
        refetch(false);
      } else {
        toast.error(result.error || 'Erro ao atualizar status do usuário');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.role !== 'admin' && (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.whatsapp.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Buscar por nome, email ou WhatsApp..."
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
                        <div className="w-10 h-10 flex items-center justify-center">{getAvatarSvg(user.avatar)}</div>
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
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-primary/10 [&_svg]:w-12 [&_svg]:h-12">
                    {getAvatarSvg(selectedUser.avatar)}
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
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">WhatsApp</label>
                    <input
                      type="text"
                      value={editForm.whatsapp}
                      onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                      placeholder="+5565999999999"
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


// SessionsSection is now imported from src/components/admin/sessions

// API Section - Asaas Gateway + Resend + reCAPTCHA
const ApiSection = () => {
  const [activeApiTab, setActiveApiTab] = useState<"gateway" | "email" | "security" | "audit">("gateway");
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  
  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  
  // Asaas state
  const [asaasApiKey, setAsaasApiKey] = useState("");
  const [asaasEnabled, setAsaasEnabled] = useState(true);
  const [hasAsaasKey, setHasAsaasKey] = useState(false);
  const [showAsaasKey, setShowAsaasKey] = useState(false);
  const [isSavingAsaas, setIsSavingAsaas] = useState(false);
  const [asaasSaveSuccess, setAsaasSaveSuccess] = useState(false);
  const [isTestingAsaas, setIsTestingAsaas] = useState(false);
  const [asaasConnected, setAsaasConnected] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

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
  const [templateShowLogo, setTemplateShowLogo] = useState(true);
  const [templateLogoUrl, setTemplateLogoUrl] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingSettings(true);
      try {
        // Fetch gateway settings from DB
        const { data: settings } = await supabase
          .from('gateway_settings')
          .select('*')
          .eq('provider', 'pixup')
          .maybeSingle();

        if (settings) {
          // Resend settings
          setResendFromEmail(settings.resend_from_email || "");
          setResendFromName(settings.resend_from_name || "DLG Connect");
          setEmailEnabled(settings.email_enabled === true);
          setHasResendKey(!!settings.resend_api_key);
          // reCAPTCHA settings
          setRecaptchaEnabled(settings.recaptcha_enabled === true);
          setRecaptchaSiteKey(settings.recaptcha_site_key || "");
          setHasRecaptchaSecret(!!settings.recaptcha_secret_key);
          // Feature toggles
          setPasswordRecoveryEnabled(settings.password_recovery_enabled === true);
          setEmailVerificationEnabled(settings.email_verification_enabled === true);
          // Email template settings
          setTemplateTitle(settings.email_template_title || "✉️ Verificação de Email");
          setTemplateGreeting(settings.email_template_greeting || "Olá {name}!");
          setTemplateMessage(settings.email_template_message || "Seu código de verificação é:");
          setTemplateExpiryText(settings.email_template_expiry_text || "Este código expira em 15 minutos.");
          setTemplateFooter(settings.email_template_footer || "DLG Connect - Sistema de Gestão");
          setTemplateBgColor(settings.email_template_bg_color || "#0a0a0a");
          setTemplateAccentColor(settings.email_template_accent_color || "#4ade80");
          setTemplateShowLogo(settings.email_template_show_logo !== false);
          setTemplateLogoUrl(settings.email_template_logo_url || "");
          // Asaas settings
          setHasAsaasKey(!!settings.asaas_api_key);
          setAsaasEnabled(settings.asaas_enabled !== false);
        }

        // Test Asaas connection if key exists
        const { data: asaasData } = await supabase.functions.invoke('asaas', {
          body: { action: 'test_connection' }
        });
        
        if (asaasData?.success) {
          setHasAsaasKey(true);
          setAsaasConnected(true);
        }
      } catch (error) {
        console.error('Error loading API settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  // Asaas save handler - saves API key to gateway_settings
  const handleSaveAsaas = async () => {
    const trimmedApiKey = asaasApiKey.trim();
    
    if (!hasAsaasKey && !trimmedApiKey) {
      toast.error("Preencha a API Key do Asaas");
      return;
    }

    setIsSavingAsaas(true);
    setAsaasSaveSuccess(false);
    try {
      // Save API key to gateway_settings table
      const updateData: any = {
        asaas_enabled: true,
        updated_at: new Date().toISOString()
      };
      
      if (trimmedApiKey) {
        updateData.asaas_api_key = trimmedApiKey;
      }

      const { error } = await supabase
        .from('gateway_settings')
        .update(updateData)
        .eq('provider', 'pixup');

      if (error) throw error;

      toast.success("API Key do Asaas salva!");
      setHasAsaasKey(true);
      setAsaasApiKey("");
      setAsaasSaveSuccess(true);
      setTimeout(() => setAsaasSaveSuccess(false), 2000);
      
      // Test connection after saving
      handleTestAsaas();
    } catch (error) {
      console.error('Error saving Asaas settings:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSavingAsaas(false);
    }
  };

  // Asaas test connection handler
  const handleTestAsaas = async () => {
    setIsTestingAsaas(true);
    try {
      const { data, error } = await supabase.functions.invoke('asaas', {
        body: { action: 'test_connection' }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Conexão Asaas estabelecida! Saldo: R$ ${data.data?.balance?.toFixed(2) || '0.00'}`);
        setAsaasConnected(true);
        setHasAsaasKey(true);
      } else {
        toast.error(data?.error || "Falha na conexão");
        setAsaasConnected(false);
      }
    } catch (error) {
      console.error('Error testing Asaas connection:', error);
      toast.error("Erro ao testar conexão");
      setAsaasConnected(false);
    } finally {
      setIsTestingAsaas(false);
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

  // Webhook URL is now copied inline in the component

  const handleSaveEmailTemplate = async () => {
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
          email_template_accent_color: templateAccentColor,
          email_template_show_logo: templateShowLogo,
          email_template_logo_url: templateLogoUrl
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
  };

  const handleSaveRecaptcha = async () => {
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
  };

  const handleTestRecaptcha = () => {
    if (!hasRecaptchaSecret) {
      toast.error("Configure a Secret Key primeiro");
      return;
    }
    toast.success("reCAPTCHA está configurado corretamente!");
  };

  const apiTabs = [
    { id: "gateway" as const, label: "Gateway PIX", icon: CreditCard },
    { id: "email" as const, label: "Email", icon: Zap },
    { id: "security" as const, label: "Segurança", icon: Shield },
    { id: "audit" as const, label: "Auditoria", icon: FileText },
  ];

  // Load audit logs when audit tab is active
  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeApiTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeApiTab]);

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
          {/* Asaas Card - Único Gateway */}
          <div className="bg-card border border-amber-500/30 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Asaas</h3>
                  <p className="text-sm text-muted-foreground">Gateway de Pagamentos (PIX + Cartão)</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit border",
                asaasConnected 
                  ? "bg-green-500/10 text-green-500 border-green-500/30" 
                  : hasAsaasKey 
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" 
                    : "bg-muted/50 text-muted-foreground border-border"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse", 
                  asaasConnected ? "bg-green-500" : hasAsaasKey ? "bg-yellow-500" : "bg-muted-foreground"
                )} />
                {asaasConnected ? "Conectado" : hasAsaasKey ? "Configurado" : "Não configurado"}
              </div>
            </div>

            <div className="space-y-4">
              {/* API Key Input */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">API Key do Asaas</label>
                <div className="relative">
                  <input
                    type={showAsaasKey ? "text" : "password"}
                    value={asaasApiKey}
                    onChange={(e) => setAsaasApiKey(e.target.value)}
                    placeholder={hasAsaasKey ? "••••••••• (já configurada)" : "$aact_xxxxxxxxxxxxxxxx..."}
                    className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAsaasKey(!showAsaasKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAsaasKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Webhook URL - Direct Edge Function */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">URL do Webhook (V3)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asaas-webhook`}
                    className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant={webhookCopied ? "default" : "outline"}
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asaas-webhook`);
                      setWebhookCopied(true);
                      toast.success("URL copiada!");
                      setTimeout(() => setWebhookCopied(false), 2000);
                    }}
                    title="Copiar URL do webhook"
                    className={cn(
                      "transition-all",
                      webhookCopied && "bg-green-600 hover:bg-green-600 border-green-600"
                    )}
                  >
                    {webhookCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Use esta URL ao criar o webhook no Asaas (API V2)
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
                <Button 
                  onClick={handleSaveAsaas} 
                  disabled={isSavingAsaas}
                  className={cn("gap-2 transition-colors", asaasSaveSuccess && "bg-green-600 hover:bg-green-600")}
                >
                  {isSavingAsaas ? <Spinner size="sm" /> : asaasSaveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {asaasSaveSuccess ? "Salvo!" : "Salvar"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestAsaas} 
                  disabled={isTestingAsaas || !hasAsaasKey}
                  className={cn("gap-2", asaasConnected && "border-green-500/50 text-green-500")}
                >
                  {isTestingAsaas ? <Spinner size="sm" /> : asaasConnected ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {asaasConnected ? "Conexão OK" : "Testar Conexão"}
                </Button>
                <a 
                  href="https://www.asaas.com/webhooks/list" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Painel Asaas
                </a>
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

          {/* Email Template - Collapsible */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowTemplateEditor(!showTemplateEditor)}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Template de Email</h3>
                  <p className="text-sm text-muted-foreground">Personalizar aparência dos emails</p>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", showTemplateEditor && "rotate-180")} />
            </button>

            {showTemplateEditor && (
              <div className="border-t border-border p-4 sm:p-6">
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

                    {/* Logo Settings */}
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Exibir Logo</span>
                        </div>
                        <button
                          onClick={() => setTemplateShowLogo(!templateShowLogo)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
                            templateShowLogo ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                            templateShowLogo ? "translate-x-6" : "translate-x-1"
                          )} />
                        </button>
                      </div>
                      {templateShowLogo && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">URL da Logo</label>
                          <input
                            type="url"
                            value={templateLogoUrl}
                            onChange={(e) => setTemplateLogoUrl(e.target.value)}
                            placeholder="https://seusite.com/logo.png"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Use a URL pública da sua logo ou favicon</p>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={handleSaveEmailTemplate}
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
                    <div className="rounded-lg overflow-hidden border border-border" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', backgroundColor: templateBgColor, color: '#fff' }}>
                        {templateShowLogo && templateLogoUrl && (
                          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <img src={templateLogoUrl} alt="Logo" style={{ maxWidth: '120px', maxHeight: '50px', objectFit: 'contain' }} />
                          </div>
                        )}
                        <h1 style={{ color: templateAccentColor, fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{templateTitle}</h1>
                        <p style={{ marginBottom: '8px', fontSize: '14px' }}>{templateGreeting.replace('{name}', 'João')}</p>
                        <p style={{ marginBottom: '12px', fontSize: '14px' }}>{templateMessage}</p>
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                          <div style={{ background: '#111', padding: '12px 24px', borderRadius: '8px', display: 'inline-block' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', color: templateAccentColor }}>123456</span>
                          </div>
                        </div>
                        <p style={{ color: '#fff', fontSize: '11px', marginBottom: '6px' }}>{templateExpiryText}</p>
                        <p style={{ color: '#fff', fontSize: '11px' }}>Se você não solicitou, ignore este email.</p>
                        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />
                        <p style={{ color: '#fff', fontSize: '10px' }}>{templateFooter}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit border",
              recaptchaEnabled && hasRecaptchaSecret 
                ? "bg-green-500/10 text-green-500 border-green-500/30" 
                : hasRecaptchaSecret 
                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" 
                  : "bg-muted/50 text-muted-foreground border-border"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse", 
                recaptchaEnabled && hasRecaptchaSecret 
                  ? "bg-green-500" 
                  : hasRecaptchaSecret 
                    ? "bg-yellow-500" 
                    : "bg-muted-foreground"
              )} />
              {recaptchaEnabled && hasRecaptchaSecret ? "Conectado" : 
               hasRecaptchaSecret ? "Configurado" : "Desativado"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center",
                  recaptchaEnabled ? "bg-green-500/10" : "bg-muted"
                )}>
                  <Shield className={cn("w-4 h-4", recaptchaEnabled ? "text-green-500" : "text-muted-foreground")} />
                </div>
                <span className="text-sm font-medium text-foreground">Habilitar reCAPTCHA</span>
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
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
                  recaptchaEnabled ? "bg-green-500" : "bg-muted",
                  (!hasRecaptchaSecret && !recaptchaEnabled) && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                  recaptchaEnabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
              <Button 
                onClick={handleSaveRecaptcha}
                disabled={isSavingRecaptcha}
                className={cn("gap-2 transition-colors", recaptchaSaveSuccess && "bg-green-600 hover:bg-green-600")}
              >
                {isSavingRecaptcha ? <Spinner size="sm" /> : recaptchaSaveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {recaptchaSaveSuccess ? "Salvo!" : "Salvar Configurações"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleTestRecaptcha}
                disabled={!hasRecaptchaSecret}
                className={cn("gap-2", recaptchaEnabled && hasRecaptchaSecret && "border-green-500/50 text-green-500")}
              >
                {recaptchaEnabled && hasRecaptchaSecret ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                {recaptchaEnabled && hasRecaptchaSecret ? "Conectado" : "Testar Conexão"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeApiTab === "audit" && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Logs de Auditoria</h3>
                <p className="text-sm text-muted-foreground">Histórico de alterações nas configurações</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadAuditLogs}
              disabled={isLoadingAudit}
              className="gap-2"
            >
              {isLoadingAudit ? <Spinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
              Atualizar
            </Button>
          </div>

          {isLoadingAudit ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">Nenhum log de auditoria encontrado</p>
              <p className="text-xs">Os logs aparecerão aqui quando houver alterações</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5",
                      log.action === 'UPDATE' ? "bg-blue-500/10" : 
                      log.action === 'CREATE' ? "bg-green-500/10" : 
                      log.action === 'DELETE' ? "bg-red-500/10" : "bg-muted"
                    )}>
                      {log.action === 'UPDATE' ? <Edit className="w-4 h-4 text-blue-500" /> :
                       log.action === 'CREATE' ? <Plus className="w-4 h-4 text-green-500" /> :
                       log.action === 'DELETE' ? <Trash2 className="w-4 h-4 text-red-500" /> :
                       <FileText className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          log.action === 'UPDATE' ? "bg-blue-500/10 text-blue-500" : 
                          log.action === 'CREATE' ? "bg-green-500/10 text-green-500" : 
                          log.action === 'DELETE' ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                        )}>
                          {log.action}
                        </span>
                        <span className="text-sm font-medium text-foreground">{log.resource}</span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {log.ip_address || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground sm:flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Bot Management Section
const BotManagementSection = () => {
  const { botFile, botHistory, isLoading, isUploading, isActivating: hookIsActivating, uploadBotFile, deleteBotFile, getDownloadUrl, setActiveVersion, versionExists } = useAdminBot();
  const { settings: systemSettings, setAllowBotDownload } = useSystemSettings();
  const [version, setVersion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; path: string; version: string } | null>(null);
  const [activateConfirm, setActivateConfirm] = useState<{ id: string; version: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isTogglingDownload, setIsTogglingDownload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleDownload = async () => {
    setIsTogglingDownload(true);
    const result = await setAllowBotDownload(!systemSettings.allowBotDownload);
    if (result.success) {
      toast.success(systemSettings.allowBotDownload ? 'Download do bot desabilitado' : 'Download do bot habilitado');
    } else {
      toast.error(result.error || 'Erro ao alterar configuração');
    }
    setIsTogglingDownload(false);
  };

  const handleDownloadActive = async () => {
    const url = await getDownloadUrl();
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = botFile?.file_name || 'DLGConnect.exe';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadVersion = async (filePath: string, fileName: string) => {
    const url = await getDownloadUrl(filePath);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
    if (activateConfirm && !hookIsActivating) {
      setIsActivating(true);
      const success = await setActiveVersion(activateConfirm.id);
      setIsActivating(false);
      if (success) {
        setActivateConfirm(null);
      }
    }
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gerenciar Bot</h2>
          <p className="text-sm text-muted-foreground">Upload do executável DLGConnect.exe</p>
        </div>
        
        {/* Toggle Download Permission */}
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <Download className={`w-4 h-4 ${systemSettings.allowBotDownload ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium text-foreground">Permitir Download</span>
          </div>
          <button
            onClick={handleToggleDownload}
            disabled={isTogglingDownload}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              systemSettings.allowBotDownload ? 'bg-success' : 'bg-muted'
            } ${isTogglingDownload ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                systemSettings.allowBotDownload ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
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
                onClick={handleDownloadActive}
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
                    onClick={() => handleDownloadVersion(file.file_path, file.file_name)}
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
  const [activeTab, setActiveTab] = useState("overview");
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
    name: profile?.name || user?.user_metadata?.name || "Administrador",
    email: profile?.email || user?.email || "admin@dlgconnect.com",
    initials: (profile?.name || user?.user_metadata?.name || "AD").slice(0, 2).toUpperCase(),
    avatar: profile?.avatar || "😀",
  };

  const sidebarTabs = ["overview", "dashboard", "users", "sessions", "bot", "api", "debug"];

  const profileNavItems = [
    { label: "Dashboard", icon: <Activity className="h-full w-full" />, onClick: () => setActiveTab("overview") },
    { label: "Planos", icon: <LayoutDashboard className="h-full w-full" />, onClick: () => setActiveTab("dashboard") },
    { label: "Usuários", icon: <Users className="h-full w-full" />, onClick: () => setActiveTab("users") },
    { label: "Sessions", icon: <Globe className="h-full w-full" />, onClick: () => setActiveTab("sessions") },
    { label: "Bot", icon: <HardDrive className="h-full w-full" />, onClick: () => setActiveTab("bot") },
    { label: "API", icon: <Zap className="h-full w-full" />, onClick: () => setActiveTab("api") },
    { label: "Debug", icon: <Bug className="h-full w-full" />, onClick: () => setActiveTab("debug") },
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
      case "overview":
        return <AdminDashboardSection />;
      case "dashboard":
        return <DashboardSection />;
      case "users":
        return <UsersSection />;
      case "sessions":
        return <SessionsSection />;
      case "bot":
        return <BotManagementSection />;
      case "api":
        return <ApiSection />;
      case "debug":
        return <SystemDebugPanel />;
      default:
        return <AdminDashboardSection />;
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
