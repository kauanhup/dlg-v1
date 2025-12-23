import { Users, Clock, Calendar, Ban, Zap, Shield, Phone, Wifi, WifiOff, Home, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

export const BotDashboardPreview = () => {
  return (
    <div className="relative group w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/40 via-blue-500/30 to-primary/40 rounded-[20px] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
      
      {/* Floating badge */}
      <motion.div
        className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20 bg-green-500/20 border border-green-500/40 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[8px] sm:text-[10px] font-semibold text-green-400">Online</span>
        </div>
      </motion.div>
      
      {/* Main container */}
      <div className="relative bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,20%,7%)] to-[hsl(220,25%,4%)] rounded-xl sm:rounded-[20px] overflow-hidden border border-[hsl(220,15%,20%)] shadow-2xl">
        {/* Top bar */}
        <div className="bg-[hsl(220,20%,12%)] border-b border-[hsl(220,15%,18%)] px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[hsl(220,15%,8%)] rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-[7px] sm:text-[9px] text-gray-400 flex items-center gap-1 sm:gap-1.5 border border-[hsl(220,15%,15%)]">
              <span className="text-green-500 text-[6px] sm:text-[8px]">●</span>
              dlgconnect.app
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white">Dashboard</h1>
              <p className="text-[7px] sm:text-[9px] text-gray-400">Visão geral</p>
            </div>
            <button className="h-5 sm:h-7 px-2 sm:px-3 text-[7px] sm:text-[9px] font-semibold bg-gradient-to-r from-primary to-primary/80 text-white rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-1.5 shadow-lg shadow-primary/20">
              <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden xs:inline">Nova Ação</span>
              <span className="xs:hidden">Ação</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {[
              { label: "Contas Ativas", value: "12", icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Em Flood", value: "3", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { label: "Adições Hoje", value: "847", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
              { label: "Extrações", value: "2.4k", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.bg} flex items-center justify-center rounded-md sm:rounded-lg`}>
                    <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`text-sm sm:text-base font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[6px] sm:text-[8px] text-gray-400 leading-tight">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Account Health */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-lg sm:rounded-xl overflow-hidden">
            <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,14%)] px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2">
              <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
              <span className="text-[8px] sm:text-[10px] font-semibold text-white">Saúde das Contas</span>
            </div>
            <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
              {[
                { phone: "+55 11 9****-1234", health: 95 },
                { phone: "+55 21 9****-5678", health: 87 },
                { phone: "+55 11 9****-9012", health: 62 },
              ].map((account, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 bg-[hsl(220,15%,12%)] border border-[hsl(220,15%,16%)] flex items-center justify-center rounded-md sm:rounded-lg">
                    <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <p className="text-[7px] sm:text-[9px] font-medium text-white truncate">{account.phone}</p>
                      <span className={`text-[6px] sm:text-[8px] font-bold ${account.health >= 80 ? 'text-green-500' : account.health >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {account.health}%
                      </span>
                    </div>
                    <div className="h-0.5 sm:h-1 bg-[hsl(220,15%,14%)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${account.health >= 80 ? 'bg-green-500' : account.health >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${account.health}%` }}
                      />
                    </div>
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


export const BotActionsPreview = () => {
  return (
    <div className="relative group w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-green-500/30 rounded-xl sm:rounded-[28px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,20%,7%)] to-[hsl(220,25%,4%)] rounded-xl sm:rounded-[24px] overflow-hidden border border-[hsl(220,15%,20%)] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]">
        {/* Top bar */}
        <div className="bg-[hsl(220,20%,12%)] border-b border-[hsl(220,15%,18%)] px-2 sm:px-4 py-1.5 sm:py-2.5 flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[hsl(220,15%,8%)] rounded-md px-2 sm:px-4 py-0.5 sm:py-1 text-[7px] sm:text-[10px] text-gray-400 flex items-center gap-1.5 sm:gap-2 border border-[hsl(220,15%,15%)]">
              <span className="text-green-500">●</span>
              Central de Ações
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">Central de Ações</h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400">Gerencie automações</p>
            </div>
            <button className="h-6 sm:h-8 px-2.5 sm:px-4 text-[8px] sm:text-[10px] font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md sm:rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-green-500/20">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline">Iniciar Ação</span>
              <span className="xs:hidden">Iniciar</span>
            </button>
          </div>

          {/* Action Types */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            {[
              { label: "Extrair", icon: Users, active: true },
              { label: "Adicionar", icon: Zap },
              { label: "Mensagem", icon: Clock },
              { label: "Denunciar", icon: Ban },
            ].map((action) => (
              <div 
                key={action.label} 
                className={`p-2 sm:p-4 rounded-lg sm:rounded-xl border text-center transition-all ${
                  action.active 
                    ? "bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/10" 
                    : "bg-[hsl(220,20%,8%)] border-[hsl(220,15%,14%)] hover:border-[hsl(220,15%,20%)]"
                }`}
              >
                <action.icon className={`h-4 w-4 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 ${action.active ? 'text-green-500' : 'text-gray-400'}`} />
                <p className={`text-[8px] sm:text-xs font-medium ${action.active ? 'text-green-500' : 'text-gray-400'}`}>
                  {action.label}
                </p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] p-3 sm:p-4 rounded-lg sm:rounded-xl">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[9px] sm:text-xs text-gray-400">Progresso da Extração</span>
              <span className="text-[9px] sm:text-xs font-bold text-green-500">45%</span>
            </div>
            <div className="h-2 sm:h-3 bg-[hsl(220,15%,14%)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "45%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 sm:mt-3 text-[7px] sm:text-[10px] text-gray-400">
              <span>450 membros</span>
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
    { phone: "+55 11 9876-4321", status: "active", addedToday: 156 },
    { phone: "+55 21 9123-5678", status: "active", addedToday: 89 },
    { phone: "+55 11 9555-4444", status: "flood", addedToday: 0 },
  ];

  return (
    <div className="relative group w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/30 via-amber-500/20 to-yellow-500/30 rounded-xl sm:rounded-[28px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,20%,7%)] to-[hsl(220,25%,4%)] rounded-xl sm:rounded-[24px] overflow-hidden border border-[hsl(220,15%,20%)] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]">
        {/* Top bar */}
        <div className="bg-[hsl(220,20%,12%)] border-b border-[hsl(220,15%,18%)] px-2 sm:px-4 py-1.5 sm:py-2.5 flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[hsl(220,15%,8%)] rounded-md px-2 sm:px-4 py-0.5 sm:py-1 text-[7px] sm:text-[10px] text-gray-400 flex items-center gap-1.5 sm:gap-2 border border-[hsl(220,15%,15%)]">
              <span className="text-green-500">●</span>
              Gerenciar Contas
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">Gerenciar Contas</h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400">3 contas conectadas</p>
            </div>
            <button className="h-6 sm:h-8 px-2.5 sm:px-4 text-[8px] sm:text-[10px] font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-md sm:rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-yellow-500/20">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Adicionar
            </button>
          </div>

          {/* Accounts List - Mobile friendly */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-lg sm:rounded-xl overflow-hidden">
            {/* Header - Hidden on very small screens */}
            <div className="hidden xs:grid grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 bg-[hsl(220,15%,12%)] text-[8px] sm:text-[10px] text-gray-400 font-semibold">
              <span>Telefone</span>
              <span>Status</span>
              <span>Hoje</span>
              <span>Ações</span>
            </div>
            <div className="divide-y divide-[hsl(220,15%,14%)]">
              {accountsList.map((account, i) => (
                <div key={i} className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-xs items-center hover:bg-[hsl(220,15%,10%)] transition-colors">
                  <span className="text-white font-medium truncate col-span-2 xs:col-span-1">{account.phone}</span>
                  <span className={`flex items-center gap-1.5 sm:gap-2 ${
                    account.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-current animate-pulse" />
                    {account.status === 'active' ? 'Ativo' : 'Flood'}
                  </span>
                  <span className="text-gray-400 font-medium">{account.addedToday}</span>
                  <div className="flex gap-1.5 sm:gap-2 justify-end xs:justify-start">
                    <button className="h-5 w-5 sm:h-7 sm:w-7 bg-[hsl(220,15%,14%)] flex items-center justify-center rounded-md sm:rounded-lg hover:bg-primary/20 transition-colors">
                      <Settings className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-gray-400" />
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
