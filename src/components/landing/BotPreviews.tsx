import { Users, Clock, Calendar, Ban, Zap, Shield, Phone, Wifi, WifiOff, Home, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

// Static preview data
const accounts = [
  { phone: "+55 11 9****-1234", status: "online", health: 95, todayAdded: 45, limit: 50 },
  { phone: "+55 11 9****-5678", status: "online", health: 87, todayAdded: 38, limit: 50 },
  { phone: "+55 21 9****-9012", status: "flood", health: 62, todayAdded: 50, limit: 50 },
  { phone: "+55 31 9****-3456", status: "offline", health: 100, todayAdded: 0, limit: 50 },
];

const menuItems = [
  { title: "Dashboard", icon: Home, active: true },
  { title: "Contas", icon: Users },
  { title: "Ações", icon: Zap },
  { title: "Atividades", icon: Activity },
  { title: "Configurações", icon: Settings },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "online": return "text-green-500";
    case "flood": return "text-yellow-500";
    case "offline": return "text-gray-500";
    default: return "text-gray-500";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "online": return Wifi;
    case "flood": return Clock;
    case "offline": return WifiOff;
    default: return WifiOff;
  }
};

const getHealthColor = (health: number) => {
  if (health >= 80) return "bg-green-500";
  if (health >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

export const BotDashboardPreview = () => {
  return (
    <div className="relative group">
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-blue-500/20 to-primary/30 rounded-[28px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Main container */}
      <div className="relative bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,20%,7%)] to-[hsl(220,25%,4%)] rounded-[24px] overflow-hidden border border-[hsl(220,15%,20%)] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]">
        {/* Top bar - browser style */}
        <div className="bg-[hsl(220,20%,12%)] border-b border-[hsl(220,15%,18%)] px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[hsl(220,15%,8%)] rounded-md px-4 py-1 text-[10px] text-gray-400 flex items-center gap-2 border border-[hsl(220,15%,15%)]">
              <span className="text-green-500">●</span>
              dlgconnect.app
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-52 bg-gradient-to-b from-[hsl(220,20%,9%)] to-[hsl(220,20%,5%)] border-r border-[hsl(220,15%,16%)] flex flex-col">
            {/* Logo */}
            <div className="border-b border-[hsl(220,15%,16%)] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center p-1 shadow-lg">
                  <img src={logo} alt="DLG" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white tracking-wide">DLG CONNECT</h2>
                  <p className="text-[9px] text-gray-500">Automação Telegram</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-3">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <div
                    key={item.title}
                    className={`flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-all ${
                      item.active
                        ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20"
                        : "text-gray-400 hover:bg-[hsl(220,15%,12%)] hover:text-gray-300"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                ))}
              </div>
            </nav>

            {/* Status */}
            <div className="border-t border-[hsl(220,15%,16%)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                <span className="text-[10px] text-gray-400">Sistema Online</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 p-5 space-y-4 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-white">Dashboard</h1>
                <p className="text-[10px] text-gray-400">Visão geral do sistema</p>
              </div>
              <button className="h-8 px-4 text-[10px] font-semibold bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                <Zap className="h-3.5 w-3.5" />
                Nova Ação
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Ativas", value: "12", icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Flood", value: "5", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                { label: "7 Dias", value: "8", icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
                { label: "Banidas", value: "2", icon: Ban, color: "text-red-500", bg: "bg-red-500/10" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 ${stat.bg} border border-current/20 flex items-center justify-center rounded-lg`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[8px] text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Accounts Status */}
            <div className="grid grid-cols-2 gap-3">
              {/* Account Health Monitor */}
              <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-xl overflow-hidden">
                <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,14%)] px-3 py-2 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold text-white">Saúde das Contas</span>
                </div>
                <div className="divide-y divide-[hsl(220,15%,12%)]">
                  {accounts.map((account, i) => {
                    const StatusIcon = getStatusIcon(account.status);
                    return (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="h-7 w-7 bg-[hsl(220,15%,12%)] border border-[hsl(220,15%,16%)] flex items-center justify-center rounded-lg">
                          <Phone className="h-3 w-3 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-medium text-white">{account.phone}</p>
                            <StatusIcon className={`h-3 w-3 ${getStatusColor(account.status)}`} />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 flex-1 bg-[hsl(220,15%,14%)] rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getHealthColor(account.health)} transition-all duration-500`}
                                style={{ width: `${account.health}%` }}
                              />
                            </div>
                            <span className="text-[8px] text-gray-400 font-medium">{account.health}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Limits */}
              <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-xl overflow-hidden">
                <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,14%)] px-3 py-2 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-[10px] font-semibold text-white">Limite Diário</span>
                </div>
                <div className="divide-y divide-[hsl(220,15%,12%)]">
                  {accounts.map((account, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="h-7 w-7 bg-[hsl(220,15%,12%)] border border-[hsl(220,15%,16%)] flex items-center justify-center rounded-lg">
                        <Users className="h-3 w-3 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-medium text-white">{account.phone}</p>
                          <span className={`text-[9px] font-bold ${account.todayAdded >= account.limit ? 'text-red-500' : 'text-green-500'}`}>
                            {account.todayAdded}/{account.limit}
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="h-1.5 bg-[hsl(220,15%,14%)] rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${account.todayAdded >= account.limit ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${(account.todayAdded / account.limit) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BotActionsPreview = () => {
  return (
    <div className="relative group">
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-green-500/30 rounded-[28px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,20%,7%)] to-[hsl(220,25%,4%)] rounded-[24px] overflow-hidden border border-[hsl(220,15%,20%)] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]">
        {/* Top bar */}
        <div className="bg-[hsl(220,20%,12%)] border-b border-[hsl(220,15%,18%)] px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[hsl(220,15%,8%)] rounded-md px-4 py-1 text-[10px] text-gray-400 flex items-center gap-2 border border-[hsl(220,15%,15%)]">
              <span className="text-green-500">●</span>
              Central de Ações
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-white">Central de Ações</h1>
              <p className="text-[10px] text-gray-400">Gerencie suas automações</p>
            </div>
            <button className="h-8 px-4 text-[10px] font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-green-500/20">
              <Zap className="h-3.5 w-3.5" />
              Iniciar Ação
            </button>
          </div>

          {/* Action Types */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Extrair", icon: Users, active: true },
              { label: "Adicionar", icon: Zap },
              { label: "Mensagem", icon: Clock },
              { label: "Denunciar", icon: Ban },
            ].map((action) => (
              <div 
                key={action.label} 
                className={`p-4 rounded-xl border text-center transition-all ${
                  action.active 
                    ? "bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/10" 
                    : "bg-[hsl(220,20%,8%)] border-[hsl(220,15%,14%)] hover:border-[hsl(220,15%,20%)]"
                }`}
              >
                <action.icon className={`h-6 w-6 mx-auto mb-2 ${action.active ? 'text-green-500' : 'text-gray-400'}`} />
                <p className={`text-xs font-medium ${action.active ? 'text-green-500' : 'text-gray-400'}`}>
                  {action.label}
                </p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">Progresso da Extração</span>
              <span className="text-xs font-bold text-green-500">45%</span>
            </div>
            <div className="h-3 bg-[hsl(220,15%,14%)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "45%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
              <span>450 membros extraídos</span>
              <span>~550 restantes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BotAccountsPreview = () => {
  const accountsList = [
    { phone: "+55 11 98765-4321", status: "active", addedToday: 156 },
    { phone: "+55 21 91234-5678", status: "active", addedToday: 89 },
    { phone: "+55 11 95555-4444", status: "flood", addedToday: 0 },
    { phone: "+55 19 97777-8888", status: "active", addedToday: 234 },
  ];

  return (
    <div className="relative group">
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/30 via-amber-500/20 to-yellow-500/30 rounded-[28px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,20%,7%)] to-[hsl(220,25%,4%)] rounded-[24px] overflow-hidden border border-[hsl(220,15%,20%)] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]">
        {/* Top bar */}
        <div className="bg-[hsl(220,20%,12%)] border-b border-[hsl(220,15%,18%)] px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[hsl(220,15%,8%)] rounded-md px-4 py-1 text-[10px] text-gray-400 flex items-center gap-2 border border-[hsl(220,15%,15%)]">
              <span className="text-green-500">●</span>
              Gerenciar Contas
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-white">Gerenciar Contas</h1>
              <p className="text-[10px] text-gray-400">4 contas conectadas</p>
            </div>
            <button className="h-8 px-4 text-[10px] font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/20">
              <Users className="h-3.5 w-3.5" />
              Adicionar
            </button>
          </div>

          {/* Accounts Table */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 gap-3 px-4 py-3 bg-[hsl(220,15%,12%)] text-[10px] text-gray-400 font-semibold">
              <span>Telefone</span>
              <span>Status</span>
              <span>Adições Hoje</span>
              <span>Ações</span>
            </div>
            <div className="divide-y divide-[hsl(220,15%,14%)]">
              {accountsList.map((account, i) => (
                <div key={i} className="grid grid-cols-4 gap-3 px-4 py-3 text-xs items-center hover:bg-[hsl(220,15%,10%)] transition-colors">
                  <span className="text-white font-medium">{account.phone}</span>
                  <span className={`flex items-center gap-2 ${
                    account.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                    {account.status === 'active' ? 'Ativo' : 'Flood'}
                  </span>
                  <span className="text-gray-400 font-medium">{account.addedToday}</span>
                  <div className="flex gap-2">
                    <button className="h-7 w-7 bg-[hsl(220,15%,14%)] flex items-center justify-center rounded-lg hover:bg-primary/20 transition-colors">
                      <Settings className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
