import { Users, Clock, Calendar, Ban, Zap, Shield, Phone, Wifi, WifiOff, Home, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="bg-[hsl(220,20%,4%)] rounded-lg overflow-hidden border border-[hsl(220,15%,12%)] shadow-2xl scale-[0.85] origin-top-left w-[118%]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-44 bg-[hsl(220,20%,7%)] border-r border-[hsl(220,15%,12%)] flex flex-col">
          {/* Logo */}
          <div className="border-b border-[hsl(220,15%,12%)] px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-white rounded flex items-center justify-center">
                <span className="text-[hsl(211,100%,50%)] font-bold text-xs">DLG</span>
              </div>
              <div>
                <h2 className="text-[10px] font-bold text-white">DLG CONNECT</h2>
                <p className="text-[8px] text-gray-400">Automação Telegram</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-2 px-2">
            <div className="space-y-0.5">
              {menuItems.map((item) => (
                <div
                  key={item.title}
                  className={`flex items-center gap-2 px-2 py-1.5 text-[10px] ${
                    item.active
                      ? "bg-[hsl(211,100%,50%)] text-white"
                      : "text-gray-400 hover:bg-[hsl(220,15%,10%)]"
                  }`}
                >
                  <item.icon className="h-3 w-3" />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </nav>

          {/* Status */}
          <div className="border-t border-[hsl(220,15%,12%)] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] text-gray-400">Sistema Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-white">Dashboard</h1>
              <p className="text-[8px] text-gray-400">Visão geral do sistema</p>
            </div>
            <button className="h-6 px-2 text-[9px] font-medium bg-[hsl(211,100%,50%)] text-white flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" />
              Nova Ação
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Ativas", value: "12", icon: Users, color: "text-green-500" },
              { label: "Flood", value: "5", icon: Clock, color: "text-yellow-500" },
              { label: "7 Dias", value: "8", icon: Calendar, color: "text-[hsl(211,100%,50%)]" },
              { label: "Banidas", value: "2", icon: Ban, color: "text-red-500" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[hsl(220,20%,7%)] border border-[hsl(220,15%,12%)] p-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,12%)] flex items-center justify-center">
                    <stat.icon className={`h-3 w-3 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[7px] text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Accounts Status */}
          <div className="grid grid-cols-2 gap-2">
            {/* Account Health Monitor */}
            <div className="bg-[hsl(220,20%,7%)] border border-[hsl(220,15%,12%)]">
              <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,12%)] px-2 py-1 flex items-center gap-1.5">
                <Shield className="h-2.5 w-2.5 text-[hsl(211,100%,50%)]" />
                <span className="text-[9px] font-medium text-white">Saúde das Contas</span>
              </div>
              <div className="divide-y divide-[hsl(220,15%,12%)]">
                {accounts.map((account, i) => {
                  const StatusIcon = getStatusIcon(account.status);
                  return (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                      <div className="h-5 w-5 bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,12%)] flex items-center justify-center">
                        <Phone className="h-2.5 w-2.5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[9px] font-medium text-white">{account.phone}</p>
                          <StatusIcon className={`h-2.5 w-2.5 ${getStatusColor(account.status)}`} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="h-1 flex-1 bg-[hsl(220,15%,12%)] rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getHealthColor(account.health)}`}
                              style={{ width: `${account.health}%` }}
                            />
                          </div>
                          <span className="text-[7px] text-gray-400">{account.health}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Limits */}
            <div className="bg-[hsl(220,20%,7%)] border border-[hsl(220,15%,12%)]">
              <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,12%)] px-2 py-1 flex items-center gap-1.5">
                <Zap className="h-2.5 w-2.5 text-green-500" />
                <span className="text-[9px] font-medium text-white">Limite Diário</span>
              </div>
              <div className="divide-y divide-[hsl(220,15%,12%)]">
                {accounts.map((account, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                    <div className="h-5 w-5 bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,12%)] flex items-center justify-center">
                      <Users className="h-2.5 w-2.5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-medium text-white">{account.phone}</p>
                        <span className={`text-[8px] font-medium ${account.todayAdded >= account.limit ? 'text-red-500' : 'text-green-500'}`}>
                          {account.todayAdded}/{account.limit}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        <div className="h-1 bg-[hsl(220,15%,12%)] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${account.todayAdded >= account.limit ? 'bg-red-500' : 'bg-green-500'}`}
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
  );
};

export const BotActionsPreview = () => {
  return (
    <div className="bg-[hsl(220,20%,4%)] rounded-lg overflow-hidden border border-[hsl(220,15%,12%)] shadow-2xl">
      <div className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-white">Central de Ações</h1>
            <p className="text-[8px] text-gray-400">Gerencie suas automações</p>
          </div>
          <button className="h-6 px-2 text-[9px] font-medium bg-green-500 text-white flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" />
            Iniciar Ação
          </button>
        </div>

        {/* Action Types */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Extrair", icon: Users, active: true },
            { label: "Adicionar", icon: Zap },
            { label: "Mensagem", icon: Clock },
            { label: "Denunciar", icon: Ban },
          ].map((action) => (
            <div 
              key={action.label} 
              className={`p-2 border text-center ${
                action.active 
                  ? "bg-[hsl(211,100%,50%)]/10 border-[hsl(211,100%,50%)]" 
                  : "bg-[hsl(220,20%,7%)] border-[hsl(220,15%,12%)]"
              }`}
            >
              <action.icon className={`h-4 w-4 mx-auto mb-1 ${action.active ? 'text-[hsl(211,100%,50%)]' : 'text-gray-400'}`} />
              <p className={`text-[8px] font-medium ${action.active ? 'text-[hsl(211,100%,50%)]' : 'text-gray-400'}`}>
                {action.label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="bg-[hsl(220,20%,7%)] border border-[hsl(220,15%,12%)] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-gray-400">Progresso da Extração</span>
            <span className="text-[9px] font-medium text-green-500">45%</span>
          </div>
          <div className="h-2 bg-[hsl(220,15%,12%)] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[hsl(211,100%,50%)] to-green-500"
              initial={{ width: 0 }}
              animate={{ width: "45%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[8px] text-gray-400">
            <span>450 membros extraídos</span>
            <span>~550 restantes</span>
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
    <div className="bg-[hsl(220,20%,4%)] rounded-lg overflow-hidden border border-[hsl(220,15%,12%)] shadow-2xl">
      <div className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-white">Gerenciar Contas</h1>
            <p className="text-[8px] text-gray-400">4 contas conectadas</p>
          </div>
          <button className="h-6 px-2 text-[9px] font-medium bg-[hsl(211,100%,50%)] text-white flex items-center gap-1">
            <Users className="h-2.5 w-2.5" />
            Adicionar
          </button>
        </div>

        {/* Accounts Table */}
        <div className="bg-[hsl(220,20%,7%)] border border-[hsl(220,15%,12%)]">
          <div className="grid grid-cols-4 gap-2 px-2 py-1.5 bg-[hsl(220,15%,12%)] text-[8px] text-gray-400 font-medium">
            <span>Telefone</span>
            <span>Status</span>
            <span>Adições Hoje</span>
            <span>Ações</span>
          </div>
          <div className="divide-y divide-[hsl(220,15%,12%)]">
            {accountsList.map((account, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 px-2 py-1.5 text-[9px] items-center">
                <span className="text-white font-medium">{account.phone}</span>
                <span className={`flex items-center gap-1 ${
                  account.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {account.status === 'active' ? 'Ativo' : 'Flood'}
                </span>
                <span className="text-gray-400">{account.addedToday}</span>
                <div className="flex gap-1">
                  <button className="h-5 w-5 bg-[hsl(220,15%,12%)] flex items-center justify-center hover:bg-[hsl(211,100%,50%)]/20">
                    <Settings className="h-2.5 w-2.5 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
