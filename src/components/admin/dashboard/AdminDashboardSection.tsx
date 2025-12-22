import { motion } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useAdminSessions } from "@/hooks/useAdminSessions";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// Stat Card matching admin style
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = "up" 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  icon: React.ElementType; 
  trend?: "up" | "down" | "neutral"; 
}) => (
  <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      </div>
      {change && (
        <span className={cn(
          "text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-0.5",
          trend === "up" ? "bg-success/10 text-success" : 
          trend === "down" ? "bg-destructive/10 text-destructive" : 
          "bg-muted text-muted-foreground"
        )}>
          {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
          {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
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

// Activity Item
const ActivityItem = ({ 
  title, 
  description, 
  time, 
  status 
}: { 
  title: string; 
  description: string; 
  time: string; 
  status: "completed" | "pending" | "cancelled"; 
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
    <div className={cn(
      "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0",
      status === "completed" && "bg-success/10",
      status === "pending" && "bg-warning/10",
      status === "cancelled" && "bg-destructive/10"
    )}>
      {status === "completed" && <CheckCircle className="w-4 h-4 text-success" />}
      {status === "pending" && <Clock className="w-4 h-4 text-warning" />}
      {status === "cancelled" && <XCircle className="w-4 h-4 text-destructive" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{title}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{description}</p>
    </div>
    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{time}</span>
  </div>
);

export const AdminDashboardSection = () => {
  const { profile } = useAuth();
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
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled' || o.status === 'expired').length || 0;
  
  const totalSessions = inventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;

  // Today's metrics
  const today = new Date().toDateString();
  const todayOrders = orders?.filter(o => new Date(o.created_at).toDateString() === today) || [];
  const todayRevenue = todayOrders.filter(o => o.status === 'completed' || o.status === 'paid')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const todayOrdersCount = todayOrders.length;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Generate chart data from orders (last 7 days)
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayOrders = orders?.filter(o => new Date(o.created_at).toDateString() === dateStr) || [];
      const dayRevenue = dayOrders
        .filter(o => o.status === 'completed' || o.status === 'paid')
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      
      data.push({
        name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        vendas: dayRevenue,
        pedidos: dayOrders.length
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  // Get recent activities from orders
  const recentActivities = orders?.slice(0, 6).map(order => ({
    title: order.product_name || 'Pedido',
    description: `${order.quantity || 1}x - ${formatCurrency(Number(order.amount) || 0)}`,
    time: new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    status: (order.status === 'completed' || order.status === 'paid') ? 'completed' as const : 
            order.status === 'pending' ? 'pending' as const : 'cancelled' as const
  })) || [];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = profile?.name?.split(' ')[0] || 'Admin';

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
      className="space-y-4 sm:space-y-6"
    >
      {/* Header with Greeting */}
      <motion.div {...fadeIn} className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Aqui está o resumo do seu negócio
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 w-fit">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Sistema online</span>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receita Total</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
            <div className="h-px sm:h-10 sm:w-px bg-border" />
            <div className="flex items-center gap-4 sm:gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className="text-base sm:text-lg font-semibold text-success">{formatCurrency(todayRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pedidos Hoje</p>
                <p className="text-base sm:text-lg font-semibold text-foreground">{todayOrdersCount}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div {...fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Usuários"
          value={String(totalUsers)}
          change={`${activeUsers} ativos`}
          icon={Users}
          trend="neutral"
        />
        <StatCard
          title="Assinaturas Ativas"
          value={String(activeSubscriptions)}
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Pedidos Pendentes"
          value={String(pendingOrders)}
          change={`${completedOrders} completos`}
          icon={ShoppingCart}
          trend="neutral"
        />
        <StatCard
          title="Sessions em Estoque"
          value={String(totalSessions)}
          icon={Package}
          trend="neutral"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <motion.div {...fadeIn} className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Vendas - Últimos 7 dias</h3>
              <p className="text-xs text-muted-foreground">Receita diária</p>
            </div>
          </div>
          
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                />
                <Area 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorVendas)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders Chart */}
        <motion.div {...fadeIn} className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Pedidos - Últimos 7 dias</h3>
              <p className="text-xs text-muted-foreground">Quantidade diária</p>
            </div>
          </div>
          
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [value, 'Pedidos']}
                />
                <Bar 
                  dataKey="pedidos" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <motion.div {...fadeIn} className="lg:col-span-2 bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Atividade Recente</h3>
              <p className="text-xs text-muted-foreground">Últimos pedidos</p>
            </div>
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

        {/* Status Summary */}
        <motion.div {...fadeIn} className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Status dos Pedidos</h3>
              <p className="text-xs text-muted-foreground">Resumo geral</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm text-foreground">Completos</span>
              </div>
              <span className="text-lg font-bold text-success">{completedOrders}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-sm text-foreground">Pendentes</span>
              </div>
              <span className="text-lg font-bold text-warning">{pendingOrders}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-foreground">Cancelados</span>
              </div>
              <span className="text-lg font-bold text-destructive">{cancelledOrders}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Banidos</span>
              </div>
              <span className="text-lg font-bold text-muted-foreground">{bannedCount}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
