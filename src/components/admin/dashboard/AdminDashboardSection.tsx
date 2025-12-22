import { motion } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  UserCheck,
  Package,
  Clock,
  Zap
} from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useAdminSessions } from "@/hooks/useAdminSessions";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const MetricCard = ({ title, value, change, trend = "neutral", icon: Icon, color, delay = 0 }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="relative overflow-hidden bg-card border border-border rounded-xl p-5 group hover:border-primary/30 transition-all duration-300"
  >
    {/* Gradient glow effect */}
    <div className={cn(
      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
      `bg-gradient-to-br ${color} blur-xl`
    )} />
    
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          `bg-gradient-to-br ${color}`
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" && "bg-emerald-500/10 text-emerald-500",
            trend === "down" && "bg-red-500/10 text-red-500",
            trend === "neutral" && "bg-muted text-muted-foreground"
          )}>
            {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      
      <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </div>
  </motion.div>
);

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

const ActivityItem = ({ title, description, time, icon: Icon, color }: ActivityItemProps) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
    <div className={cn(
      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
      color
    )}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{title}</p>
      <p className="text-xs text-muted-foreground truncate">{description}</p>
    </div>
    <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
  </div>
);

const QuickStatCard = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) => (
  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export const AdminDashboardSection = () => {
  const { users, totalUsers, bannedCount, isLoading: usersLoading } = useAdminUsers();
  const { orders, isLoading: ordersLoading } = useAdminOrders();
  const { subscriptions, isLoading: subsLoading } = useAdminSubscriptions();
  const { inventory, isLoading: sessionsLoading } = useAdminSessions();

  const isLoading = usersLoading || ordersLoading || subsLoading || sessionsLoading;

  // Calculate metrics
  const activeUsers = users?.filter(u => !u.banned).length || 0;
  const totalRevenue = orders?.reduce((sum, order) => {
    if (order.status === 'completed' || order.status === 'paid') {
      return sum + (Number(order.amount) || 0);
    }
    return sum;
  }, 0) || 0;

  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const completedOrders = orders?.filter(o => o.status === 'completed' || o.status === 'paid').length || 0;
  
  const totalSessions = inventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Get recent activities from orders
  const recentActivities = orders?.slice(0, 5).map(order => ({
    title: order.product_name || 'Pedido',
    description: `${order.product_type === 'session' ? 'Session' : 'Assinatura'} - ${order.quantity || 1}x`,
    time: new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    icon: order.status === 'completed' || order.status === 'paid' ? DollarSign : Clock,
    color: order.status === 'completed' || order.status === 'paid' 
      ? 'bg-emerald-500/10 text-emerald-500' 
      : 'bg-amber-500/10 text-amber-500'
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div {...fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral do sistema
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Atualizado agora</span>
        </div>
      </motion.div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(totalRevenue)}
          change="+12%"
          trend="up"
          icon={DollarSign}
          color="from-emerald-500/20 to-emerald-600/5"
          delay={0}
        />
        <MetricCard
          title="Total de Usuários"
          value={totalUsers}
          change={`${activeUsers} ativos`}
          trend="neutral"
          icon={Users}
          color="from-blue-500/20 to-blue-600/5"
          delay={0.1}
        />
        <MetricCard
          title="Assinaturas Ativas"
          value={activeSubscriptions}
          change="+5%"
          trend="up"
          icon={TrendingUp}
          color="from-violet-500/20 to-violet-600/5"
          delay={0.2}
        />
        <MetricCard
          title="Pedidos Pendentes"
          value={pendingOrders}
          change={`${completedOrders} completos`}
          trend="neutral"
          icon={ShoppingCart}
          color="from-amber-500/20 to-amber-600/5"
          delay={0.3}
        />
      </div>

      {/* Secondary Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-1 bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Estatísticas Rápidas</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <QuickStatCard label="Sessions em Estoque" value={totalSessions} icon={Package} />
            <QuickStatCard label="Usuários Ativos" value={activeUsers} icon={UserCheck} />
            <QuickStatCard label="Pedidos Hoje" value={orders?.filter(o => {
              const today = new Date().toDateString();
              return new Date(o.created_at).toDateString() === today;
            }).length || 0} icon={ShoppingCart} />
            <QuickStatCard label="Receita Hoje" value={formatCurrency(
              orders?.filter(o => {
                const today = new Date().toDateString();
                return new Date(o.created_at).toDateString() === today && 
                  (o.status === 'completed' || o.status === 'paid');
              }).reduce((sum, o) => sum + (Number(o.amount) || 0), 0) || 0
            )} icon={Wallet} />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Atividade Recente</h3>
          </div>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-1">
              {recentActivities.map((activity, idx) => (
                <ActivityItem key={idx} {...activity} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma atividade recente</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Cards Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">{completedOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">Pedidos Completos</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{pendingOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{activeUsers}</p>
          <p className="text-xs text-muted-foreground mt-1">Usuários Ativos</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{bannedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Banidos</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
