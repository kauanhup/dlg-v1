import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserProfileSidebar } from "@/components/ui/menu";
import { avatars } from "@/components/ui/avatar-picker";
import { cn } from "@/lib/utils";
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
  ShoppingCart,
  Globe,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ChevronDown,
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
  Plus
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

// Pricing Configuration
const SESSION_PRICES = {
  brasileiras: { venda: 25.00, custo: 8.00 },
  estrangeiras: { venda: 15.00, custo: 5.00 }
};

// Sales Data for Chart
const salesData = [
  { mes: "Jul", brasileiras: 45, estrangeiras: 32, receita: 1605 },
  { mes: "Ago", brasileiras: 52, estrangeiras: 41, receita: 1915 },
  { mes: "Set", brasileiras: 38, estrangeiras: 55, receita: 1775 },
  { mes: "Out", brasileiras: 67, estrangeiras: 48, receita: 2395 },
  { mes: "Nov", brasileiras: 81, estrangeiras: 62, receita: 2955 },
  { mes: "Dez", brasileiras: 94, estrangeiras: 78, receita: 3520 },
];

// Simple Bar Chart Component
const SalesChart = ({ data }: { data: typeof salesData }) => {
  const maxReceita = Math.max(...data.map(d => d.receita));
  
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.mes} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-8">{item.mes}</span>
          <div className="flex-1 flex gap-1 h-6">
            <div 
              className="bg-primary/80 rounded-sm flex items-center justify-end pr-1"
              style={{ width: `${(item.brasileiras / (item.brasileiras + item.estrangeiras)) * 100}%` }}
            >
              <span className="text-[10px] text-primary-foreground font-medium">{item.brasileiras}</span>
            </div>
            <div 
              className="bg-primary/40 rounded-sm flex items-center justify-end pr-1"
              style={{ width: `${(item.estrangeiras / (item.brasileiras + item.estrangeiras)) * 100}%` }}
            >
              <span className="text-[10px] text-foreground font-medium">{item.estrangeiras}</span>
            </div>
          </div>
          <span className="text-xs font-medium text-foreground w-20 text-right">
            R$ {item.receita.toLocaleString('pt-BR')}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/80 rounded-sm" />
          <span className="text-xs text-muted-foreground">Brasileiras</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/40 rounded-sm" />
          <span className="text-xs text-muted-foreground">Estrangeiras</span>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview
const DashboardSection = () => {
  // Calculate totals from sales data
  const totalBrasileiras = salesData.reduce((acc, d) => acc + d.brasileiras, 0);
  const totalEstrangeiras = salesData.reduce((acc, d) => acc + d.estrangeiras, 0);
  const totalSessions = totalBrasileiras + totalEstrangeiras;
  
  const receitaBrasileiras = totalBrasileiras * SESSION_PRICES.brasileiras.venda;
  const receitaEstrangeiras = totalEstrangeiras * SESSION_PRICES.estrangeiras.venda;
  const receitaTotal = receitaBrasileiras + receitaEstrangeiras;
  
  const custoBrasileiras = totalBrasileiras * SESSION_PRICES.brasileiras.custo;
  const custoEstrangeiras = totalEstrangeiras * SESSION_PRICES.estrangeiras.custo;
  const custoTotal = custoBrasileiras + custoEstrangeiras;
  
  const lucroLiquido = receitaTotal - custoTotal;

  const recentOrders = [
    { id: "#ORD-001", user: "João Silva", type: "Brasileiras", qty: 10, amount: "R$ 250,00", status: "completed", date: "14 Dez" },
    { id: "#ORD-002", user: "Maria Santos", type: "Estrangeiras", qty: 5, amount: "R$ 75,00", status: "pending", date: "14 Dez" },
    { id: "#ORD-003", user: "Pedro Costa", type: "Brasileiras", qty: 3, amount: "R$ 75,00", status: "completed", date: "13 Dez" },
    { id: "#ORD-004", user: "Ana Lima", type: "Estrangeiras", qty: 20, amount: "R$ 300,00", status: "failed", date: "13 Dez" },
  ];

  const statusStyles = {
    completed: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    failed: "bg-destructive/10 text-destructive"
  };

  const statusLabels = {
    completed: "Concluído",
    pending: "Pendente",
    failed: "Falhou"
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do sistema</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Usuários Totais" value="1,234" change="+12%" icon={Users} />
        <StatCard 
          title="Sessions Vendidas" 
          value={totalSessions.toLocaleString('pt-BR')} 
          change="+18%" 
          icon={Package} 
        />
        <StatCard 
          title="Receita Total" 
          value={`R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="+8.2%" 
          icon={DollarSign} 
        />
        <StatCard 
          title="Lucro Líquido" 
          value={`R$ ${lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="+15%" 
          icon={TrendingUp} 
        />
      </div>

      {/* Pricing Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Sessions Brasileiras</h3>
              <p className="text-xs text-muted-foreground">Preço fixo por tipo</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-background/50 rounded-md p-2">
              <p className="text-lg font-bold text-foreground">R$ {SESSION_PRICES.brasileiras.venda.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Venda</p>
            </div>
            <div className="bg-background/50 rounded-md p-2">
              <p className="text-lg font-bold text-muted-foreground">R$ {SESSION_PRICES.brasileiras.custo.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Custo</p>
            </div>
            <div className="bg-background/50 rounded-md p-2">
              <p className="text-lg font-bold text-success">R$ {(SESSION_PRICES.brasileiras.venda - SESSION_PRICES.brasileiras.custo).toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Lucro</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Sessions Estrangeiras</h3>
              <p className="text-xs text-muted-foreground">Preço fixo por tipo</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-background/50 rounded-md p-2">
              <p className="text-lg font-bold text-foreground">R$ {SESSION_PRICES.estrangeiras.venda.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Venda</p>
            </div>
            <div className="bg-background/50 rounded-md p-2">
              <p className="text-lg font-bold text-muted-foreground">R$ {SESSION_PRICES.estrangeiras.custo.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Custo</p>
            </div>
            <div className="bg-background/50 rounded-md p-2">
              <p className="text-lg font-bold text-success">R$ {(SESSION_PRICES.estrangeiras.venda - SESSION_PRICES.estrangeiras.custo).toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Lucro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-foreground">Vendas por Mês</h2>
            <p className="text-xs text-muted-foreground">Sessions vendidas nos últimos 6 meses</p>
          </div>
        </div>
        <SalesChart data={salesData} />
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Pedidos Recentes</h2>
          <Button variant="ghost" size="sm" className="text-xs">Ver todos</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Pedido</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Tipo</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Qtd</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0">
                  <td className="p-4 text-sm font-medium text-foreground">{order.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.user}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.type}</td>
                  <td className="p-4 text-sm text-foreground">{order.qty}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{order.amount}</td>
                  <td className="p-4">
                    <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[order.status as keyof typeof statusStyles])}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// Users Management
const UsersSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const users = [
    { id: 1, name: "João Silva", email: "joao@email.com", plan: "Pro", status: "active", sessions: 12, createdAt: "10 Dez 2024" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", plan: "Free", status: "active", sessions: 3, createdAt: "08 Dez 2024" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", plan: "Pro", status: "banned", sessions: 0, createdAt: "05 Dez 2024" },
    { id: 4, name: "Ana Lima", email: "ana@email.com", plan: "Pro", status: "active", sessions: 25, createdAt: "01 Dez 2024" },
    { id: 5, name: "Carlos Souza", email: "carlos@email.com", plan: "Free", status: "inactive", sessions: 0, createdAt: "28 Nov 2024" },
  ];

  const statusStyles = {
    active: "bg-success/10 text-success",
    inactive: "bg-muted text-muted-foreground",
    banned: "bg-destructive/10 text-destructive"
  };

  const statusLabels = {
    active: "Ativo",
    inactive: "Inativo",
    banned: "Banido"
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gerenciar usuários do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <Button size="sm">Exportar</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Plano</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Sessions</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Cadastro</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-md font-medium",
                      user.plan === "Pro" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[user.status as keyof typeof statusStyles])}>
                      {statusLabels[user.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground">{user.sessions}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.createdAt}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border border-border">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                          <Ban className="w-4 h-4 mr-2" /> Banir
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
    </motion.div>
  );
};

// Orders Management
const OrdersSection = () => {
  const orders = [
    { id: "#ORD-001", user: "João Silva", email: "joao@email.com", product: "25 Sessions BR", amount: "R$ 199,90", status: "completed", payment: "PIX", date: "14 Dez 2024" },
    { id: "#ORD-002", user: "Maria Santos", email: "maria@email.com", product: "10 Sessions BR", amount: "R$ 89,90", status: "pending", payment: "Cartão", date: "14 Dez 2024" },
    { id: "#ORD-003", user: "Pedro Costa", email: "pedro@email.com", product: "5 Sessions INTL", amount: "R$ 29,90", status: "completed", payment: "PIX", date: "13 Dez 2024" },
    { id: "#ORD-004", user: "Ana Lima", email: "ana@email.com", product: "25 Sessions INTL", amount: "R$ 99,90", status: "refunded", payment: "Cartão", date: "13 Dez 2024" },
  ];

  const statusStyles = {
    completed: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    refunded: "bg-muted text-muted-foreground",
    failed: "bg-destructive/10 text-destructive"
  };

  const statusLabels = {
    completed: "Concluído",
    pending: "Pendente",
    refunded: "Reembolsado",
    failed: "Falhou"
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Gerenciar pedidos e pagamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">234</p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">8</p>
              <p className="text-xs text-muted-foreground">Reembolsados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Pedido</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Produto</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Pagamento</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">{order.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.user}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground">{order.product}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{order.amount}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.payment}</td>
                  <td className="p-4">
                    <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[order.status as keyof typeof statusStyles])}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// Sessions Management
const SessionsSection = () => {
  const sessions = [
    { id: 1, number: "+55 11 91234-5678", type: "BR", status: "available", owner: null, createdAt: "10 Dez 2024" },
    { id: 2, number: "+55 21 98765-4321", type: "BR", status: "sold", owner: "João Silva", createdAt: "08 Dez 2024" },
    { id: 3, number: "+1 555 123-4567", type: "INTL", status: "available", owner: null, createdAt: "05 Dez 2024" },
    { id: 4, number: "+44 20 7946 0958", type: "INTL", status: "sold", owner: "Maria Santos", createdAt: "01 Dez 2024" },
    { id: 5, number: "+55 31 99876-5432", type: "BR", status: "expired", owner: "Pedro Costa", createdAt: "28 Nov 2024" },
  ];

  const statusStyles = {
    available: "bg-success/10 text-success",
    sold: "bg-primary/10 text-primary",
    expired: "bg-destructive/10 text-destructive"
  };

  const statusLabels = {
    available: "Disponível",
    sold: "Vendida",
    expired: "Expirada"
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sessions</h1>
          <p className="text-sm text-muted-foreground">Gerenciar estoque de sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
          </Button>
          <Button size="sm">Adicionar Sessions</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-foreground">231</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Disponíveis</p>
          <p className="text-2xl font-bold text-success">142</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Vendidas</p>
          <p className="text-2xl font-bold text-primary">76</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Expiradas</p>
          <p className="text-2xl font-bold text-destructive">13</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Número</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Tipo</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Proprietário</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Criado em</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-mono text-foreground">{session.number}</td>
                  <td className="p-4">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-md font-medium",
                      session.type === "BR" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                    )}>
                      {session.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[session.status as keyof typeof statusStyles])}>
                      {statusLabels[session.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{session.owner || "—"}</td>
                  <td className="p-4 text-sm text-muted-foreground">{session.createdAt}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border border-border">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
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
    </motion.div>
  );
};

// Subscriptions Section
const SubscriptionsSection = () => {
  const [activeSubTab, setActiveSubTab] = useState<"subscribers" | "plans" | "payments">("subscribers");

  // Subscribers data
  const subscribers = [
    { id: 1, name: "João Silva", email: "joao@email.com", plan: "Pro Mensal", status: "active", startDate: "01 Nov 2024", nextBilling: "01 Jan 2025", amount: "R$ 49,90" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", plan: "Pro Anual", status: "active", startDate: "15 Jun 2024", nextBilling: "15 Jun 2025", amount: "R$ 399,90" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", plan: "Pro Mensal", status: "cancelled", startDate: "10 Set 2024", nextBilling: "—", amount: "R$ 49,90" },
    { id: 4, name: "Ana Lima", email: "ana@email.com", plan: "Enterprise", status: "active", startDate: "01 Dez 2024", nextBilling: "01 Dez 2025", amount: "R$ 999,90" },
    { id: 5, name: "Carlos Souza", email: "carlos@email.com", plan: "Pro Mensal", status: "overdue", startDate: "05 Out 2024", nextBilling: "05 Dez 2024", amount: "R$ 49,90" },
  ];

  // Plans data
  const plans = [
    { id: 1, name: "Grátis", price: "R$ 0", period: "—", sessions: 0, features: ["Acesso básico", "Suporte por email"], subscribers: 423, status: "active" },
    { id: 2, name: "Pro Mensal", price: "R$ 49,90", period: "mês", sessions: 50, features: ["50 sessions/mês", "Suporte prioritário", "API access"], subscribers: 156, status: "active" },
    { id: 3, name: "Pro Anual", price: "R$ 399,90", period: "ano", sessions: 600, features: ["600 sessions/ano", "Suporte 24/7", "API access", "2 meses grátis"], subscribers: 78, status: "active" },
    { id: 4, name: "Enterprise", price: "R$ 999,90", period: "ano", sessions: -1, features: ["Sessions ilimitadas", "Suporte dedicado", "SLA 99.9%", "Whitelabel"], subscribers: 12, status: "active" },
  ];

  // Payments history
  const payments = [
    { id: "#PAY-001", user: "João Silva", plan: "Pro Mensal", amount: "R$ 49,90", method: "PIX", status: "paid", date: "01 Dez 2024" },
    { id: "#PAY-002", user: "Maria Santos", plan: "Pro Anual", amount: "R$ 399,90", method: "Cartão", status: "paid", date: "15 Nov 2024" },
    { id: "#PAY-003", user: "Carlos Souza", plan: "Pro Mensal", amount: "R$ 49,90", method: "PIX", status: "failed", date: "05 Dez 2024" },
    { id: "#PAY-004", user: "Ana Lima", plan: "Enterprise", amount: "R$ 999,90", method: "Boleto", status: "pending", date: "01 Dez 2024" },
    { id: "#PAY-005", user: "Pedro Costa", plan: "Pro Mensal", amount: "R$ 49,90", method: "Cartão", status: "refunded", date: "10 Nov 2024" },
  ];

  // Metrics calculations
  const activeSubscribers = subscribers.filter(s => s.status === "active").length;
  const cancelledSubscribers = subscribers.filter(s => s.status === "cancelled").length;
  const overdueSubscribers = subscribers.filter(s => s.status === "overdue").length;
  const mrr = 156 * 49.90 + (78 * 399.90 / 12) + (12 * 999.90 / 12); // Monthly Recurring Revenue
  const churnRate = (cancelledSubscribers / subscribers.length * 100).toFixed(1);

  const statusStyles = {
    active: "bg-success/10 text-success",
    cancelled: "bg-muted text-muted-foreground",
    overdue: "bg-destructive/10 text-destructive",
    paid: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    failed: "bg-destructive/10 text-destructive",
    refunded: "bg-muted text-muted-foreground"
  };

  const statusLabels = {
    active: "Ativo",
    cancelled: "Cancelado",
    overdue: "Atrasado",
    paid: "Pago",
    pending: "Pendente",
    failed: "Falhou",
    refunded: "Reembolsado"
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Assinaturas</h1>
          <p className="text-sm text-muted-foreground">Gerenciar planos e assinantes</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Novo Plano
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{activeSubscribers}</p>
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
              <p className="text-lg font-bold text-foreground">R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">MRR (Receita Mensal)</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{overdueSubscribers}</p>
              <p className="text-xs text-muted-foreground">Pagamentos Atrasados</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{churnRate}%</p>
              <p className="text-xs text-muted-foreground">Taxa de Churn</p>
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
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">{sub.plan}</td>
                    <td className="p-4">
                      <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[sub.status as keyof typeof statusStyles])}>
                        {statusLabels[sub.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{sub.startDate}</td>
                    <td className="p-4 text-sm text-muted-foreground">{sub.nextBilling}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{sub.amount}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Repeat className="w-4 h-4 mr-2" /> Renovar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
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
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    {plan.period !== "—" && <span className="text-sm text-muted-foreground">/{plan.period}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border border-border">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Desativar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2 mb-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{plan.subscribers} assinantes</span>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-md",
                  plan.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                )}>
                  {plan.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          ))}
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
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-sm font-mono text-foreground">{payment.id}</td>
                    <td className="p-4 text-sm text-foreground">{payment.user}</td>
                    <td className="p-4 text-sm text-muted-foreground">{payment.plan}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{payment.amount}</td>
                    <td className="p-4 text-sm text-muted-foreground">{payment.method}</td>
                    <td className="p-4">
                      <span className={cn("text-xs px-2 py-1 rounded-md", statusStyles[payment.status as keyof typeof statusStyles])}>
                        {statusLabels[payment.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Settings Section
const SettingsSection = () => {
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Configurações do sistema</p>
      </div>

      <div className="grid gap-4">
        {/* Pricing Settings */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Preços das Sessions</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Preço por Session BR (R$)</label>
              <input
                type="number"
                defaultValue="9.98"
                step="0.01"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Preço por Session INTL (R$)</label>
              <input
                type="number"
                defaultValue="5.98"
                step="0.01"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Modo de manutenção</p>
                <p className="text-xs text-muted-foreground">Desativa o acesso ao sistema para usuários</p>
              </div>
              <Button variant="outline" size="sm">Desativado</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Registro de novos usuários</p>
                <p className="text-xs text-muted-foreground">Permitir criação de novas contas</p>
              </div>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>
          </div>
        </div>

        {/* Admin Credentials */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Credenciais de Administrador</h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Email de acesso:</p>
            <code className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded">admin@swextractor.com</code>
            <p className="text-sm text-muted-foreground mb-2 mt-4">Senha:</p>
            <code className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded">admin123</code>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Admin Component
const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(1);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const adminUser = {
    name: "Administrador",
    email: "admin@swextractor.com",
    initials: "AD",
  };

  const sidebarTabs = ["dashboard", "users", "subscriptions", "orders", "sessions", "settings"];

  const profileNavItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="h-full w-full" />, onClick: () => setActiveTab("dashboard") },
    { label: "Usuários", icon: <Users className="h-full w-full" />, onClick: () => setActiveTab("users") },
    { label: "Assinaturas", icon: <CreditCard className="h-full w-full" />, onClick: () => setActiveTab("subscriptions") },
    { label: "Pedidos", icon: <ShoppingCart className="h-full w-full" />, onClick: () => setActiveTab("orders") },
    { label: "Sessions", icon: <Globe className="h-full w-full" />, onClick: () => setActiveTab("sessions") },
    { label: "Configurações", icon: <Settings className="h-full w-full" />, onClick: () => setActiveTab("settings"), isSeparator: true },
  ];

  const sidebarActiveIndex = sidebarTabs.indexOf(activeTab);

  const handleSidebarChange = (index: number) => {
    setActiveTab(sidebarTabs[index]);
  };

  const logoutItem = {
    label: "Sair",
    icon: <LogOut className="h-full w-full" />,
    onClick: () => navigate("/login"),
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardSection />;
      case "users":
        return <UsersSection />;
      case "subscriptions":
        return <SubscriptionsSection />;
      case "orders":
        return <OrdersSection />;
      case "sessions":
        return <SessionsSection />;
      case "settings":
        return <SettingsSection />;
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
          logoutItem={logoutItem}
          activeIndex={sidebarActiveIndex >= 0 ? sidebarActiveIndex : 0}
          onActiveChange={handleSidebarChange}
          onAvatarChange={(avatar) => setSelectedAvatarId(avatar.id)}
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

          {/* Center Menu */}
          <nav className="flex-1 flex justify-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md relative">
              {[
                { label: "Sessions", tab: "sessions", icon: Globe },
                { label: "Assinaturas", tab: "subscriptions", icon: CreditCard },
              ].map((item) => (
                <motion.button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors",
                    activeTab === item.tab
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeTab === item.tab && (
                    <motion.div
                      layoutId="admin-mobile-tab-bg"
                      className="absolute inset-0 bg-card rounded shadow-sm"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="hidden sm:inline relative z-10">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </nav>

          <div className="w-9 h-9" />
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
                logoutItem={logoutItem}
                activeIndex={sidebarActiveIndex >= 0 ? sidebarActiveIndex : 0}
                onActiveChange={(index) => {
                  handleSidebarChange(index);
                  setIsMobileSidebarOpen(false);
                }}
                onAvatarChange={(avatar) => setSelectedAvatarId(avatar.id)}
                className="h-full border-r-0"
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-14 lg:pt-0 min-w-0">
        {/* Desktop Header with Center Menu */}
        <header className="hidden lg:flex items-center justify-center h-14 px-6 border-b border-border bg-card sticky top-0 z-40">
          <nav className="flex items-center gap-1 relative">
            {[
              { label: "Sessions", tab: "sessions", icon: Globe },
              { label: "Assinaturas", tab: "subscriptions", icon: CreditCard },
            ].map((item) => (
              <motion.button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === item.tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === item.tab && (
                  <motion.div
                    layoutId="admin-desktop-tab-bg"
                    className="absolute inset-0 bg-muted rounded-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </header>
        
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
