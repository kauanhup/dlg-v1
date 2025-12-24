import { Users, Clock, Calendar, Ban, Zap, Shield, Phone, Wifi, WifiOff, Home, Settings, Activity, ShoppingCart, Plus, Download, MessageSquare, AlertTriangle, Check, X, ToggleLeft, Key, Globe, Filter, Timer } from "lucide-react";
import { motion } from "framer-motion";

// Preview da página de Contas (/accounts)
export const BotDashboardPreview = () => {
  const accounts = [
    { phone: "+55 11 98765-4321", status: "Ativa", statusColor: "text-green-500", today: 156, lastUse: "2 min atrás" },
    { phone: "+55 21 91234-5678", status: "Ativa", statusColor: "text-green-500", today: 89, lastUse: "15 min atrás" },
    { phone: "+55 11 95555-4444", status: "Float 2d", statusColor: "text-yellow-500", today: 0, lastUse: "1 dia atrás" },
    { phone: "+55 19 97777-8888", status: "Ativa", statusColor: "text-green-500", today: 234, lastUse: "5 min atrás" },
    { phone: "+55 48 92222-3333", status: "7 dias", statusColor: "text-orange-500", today: 0, lastUse: "5 dias atrás" },
    { phone: "+55 85 96666-1111", status: "Banida", statusColor: "text-red-500", today: 0, lastUse: "2 dias atrás" },
  ];

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
          <span className="text-[8px] sm:text-[10px] font-semibold text-green-400">3 Ativas</span>
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
              group-booster.app/accounts
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white">Contas Telegram</h1>
              <p className="text-[7px] sm:text-[9px] text-gray-400">Gerencie suas contas conectadas</p>
            </div>
            <div className="flex gap-1.5">
              <button className="h-5 sm:h-7 px-2 sm:px-3 text-[7px] sm:text-[9px] font-semibold bg-[hsl(220,20%,15%)] text-white rounded-md sm:rounded-lg flex items-center gap-1 border border-[hsl(220,15%,25%)]">
                <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Comprar
              </button>
              <button className="h-5 sm:h-7 px-2 sm:px-3 text-[7px] sm:text-[9px] font-semibold bg-gradient-to-r from-primary to-primary/80 text-white rounded-md sm:rounded-lg flex items-center gap-1 shadow-lg shadow-primary/20">
                <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Conectar
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {[
              { label: "Ativas", value: "3", color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Float 2d", value: "1", color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { label: "7 dias", value: "1", color: "text-orange-500", bg: "bg-orange-500/10" },
              { label: "Banidas", value: "1", color: "text-red-500", bg: "bg-red-500/10" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} border border-[hsl(220,15%,14%)] p-1.5 sm:p-2 rounded-lg text-center`}>
                <p className={`text-sm sm:text-lg font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[6px] sm:text-[8px] text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Accounts Table */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-lg sm:rounded-xl overflow-hidden">
            <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,14%)] px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between">
              <span className="text-[8px] sm:text-[10px] font-semibold text-white">Lista de Contas</span>
              <span className="text-[7px] sm:text-[9px] text-primary">Todos</span>
            </div>
            <div className="divide-y divide-[hsl(220,15%,14%)]">
              {accounts.slice(0, 4).map((account, i) => (
                <div key={i} className="grid grid-cols-4 gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[7px] sm:text-[9px] items-center">
                  <span className="text-white font-medium truncate">{account.phone}</span>
                  <span className={`${account.statusColor} flex items-center gap-1`}>
                    <span className="h-1 w-1 rounded-full bg-current" />
                    {account.status}
                  </span>
                  <span className="text-gray-400">{account.today}</span>
                  <span className="text-gray-500 text-[6px] sm:text-[8px]">{account.lastUse}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Preview da página de Ações (/actions)
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
              group-booster.app/actions
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">Central de Ações</h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400">Gerencie suas automações do Telegram</p>
            </div>
            <button className="h-6 sm:h-8 px-2.5 sm:px-4 text-[8px] sm:text-[10px] font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md sm:rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-green-500/20">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Executar
            </button>
          </div>

          {/* Action Types */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            {[
              { label: "Extrair", icon: Download, active: true },
              { label: "Adicionar", icon: Plus },
              { label: "Mensagem", icon: MessageSquare },
              { label: "Denunciar", icon: AlertTriangle },
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

          {/* Extraction Card */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] p-3 sm:p-4 rounded-lg sm:rounded-xl">
            <h3 className="text-[9px] sm:text-xs font-semibold text-white mb-2">Extrair Membros</h3>
            <p className="text-[7px] sm:text-[9px] text-gray-400 mb-3">Extraia a lista de membros de qualquer grupo público para usar em outras ações.</p>
            
            <div className="bg-[hsl(220,15%,12%)] border border-[hsl(220,15%,18%)] rounded-lg p-2 mb-3">
              <span className="text-[7px] sm:text-[9px] text-gray-400">Grupo para Extrair</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] sm:text-[10px] text-white">Membros disponíveis:</span>
                <span className="text-[8px] sm:text-[10px] text-primary font-bold">1,234</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { label: "Extraídos Hoje", value: "1,234", color: "text-blue-500" },
              { label: "Adicionados Hoje", value: "156", color: "text-green-500" },
              { label: "Mensagens Enviadas", value: "89", color: "text-purple-500" },
              { label: "Ações Concluídas", value: "12", color: "text-primary" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] p-2 rounded-lg text-center">
                <p className={`text-xs sm:text-sm font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[5px] sm:text-[7px] text-gray-400 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Preview da página de Configurações (/settings)
export const BotAccountsPreview = () => {
  const toggleSettings = [
    { label: "Cache de Membros", desc: "Armazenar dados localmente", on: true },
    { label: "Auto-reconexão", desc: "Reconectar se desconectar", on: true },
    { label: "Modo Debug", desc: "Logs detalhados", on: false },
    { label: "Compressão de Dados", desc: "Reduzir uso de banda", on: true },
  ];

  const securitySettings = [
    { label: "Anti-Ban Mode", desc: "Delays aleatórios extras", on: true },
    { label: "Simular Digitação", desc: "Parecer mais humano", on: true },
    { label: "Flood Wait Auto", desc: "Pausar se detectar flood", on: true },
    { label: "Proxy Rotativo", desc: "Alternar IPs", on: false },
  ];

  return (
    <div className="relative group w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-violet-500/20 to-purple-500/30 rounded-xl sm:rounded-[28px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      
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
              group-booster.app/settings
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">Configurações</h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400">Gerencie as configurações do sistema</p>
            </div>
          </div>

          {/* API Credentials */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-lg sm:rounded-xl overflow-hidden">
            <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,14%)] px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2">
              <Key className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
              <span className="text-[8px] sm:text-[10px] font-semibold text-white">Credenciais API</span>
            </div>
            <div className="p-2 sm:p-3 grid grid-cols-3 gap-2">
              <div className="bg-[hsl(220,15%,12%)] rounded-lg p-2">
                <span className="text-[6px] sm:text-[8px] text-gray-400">API ID do Telegram</span>
                <div className="h-4 sm:h-5 bg-[hsl(220,15%,15%)] rounded mt-1 flex items-center px-2">
                  <span className="text-[7px] sm:text-[9px] text-gray-500">••••••</span>
                </div>
              </div>
              <div className="bg-[hsl(220,15%,12%)] rounded-lg p-2">
                <span className="text-[6px] sm:text-[8px] text-gray-400">API Hash</span>
                <div className="h-4 sm:h-5 bg-[hsl(220,15%,15%)] rounded mt-1 flex items-center px-2">
                  <span className="text-[7px] sm:text-[9px] text-gray-500">••••••••••••</span>
                </div>
              </div>
              <div className="bg-[hsl(220,15%,12%)] rounded-lg p-2">
                <span className="text-[6px] sm:text-[8px] text-gray-400">Telefone Principal</span>
                <div className="h-4 sm:h-5 bg-[hsl(220,15%,15%)] rounded mt-1 flex items-center px-2">
                  <span className="text-[7px] sm:text-[9px] text-gray-500">+55 11 ****</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Security Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Performance */}
            <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-lg overflow-hidden">
              <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,14%)] px-2 py-1.5 flex items-center gap-1.5">
                <Zap className="h-2.5 w-2.5 text-yellow-500" />
                <span className="text-[7px] sm:text-[9px] font-semibold text-white">Performance</span>
              </div>
              <div className="p-2 space-y-1.5">
                {toggleSettings.slice(0, 3).map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between">
                    <span className="text-[6px] sm:text-[8px] text-gray-300">{setting.label}</span>
                    <div className={`w-6 h-3 rounded-full ${setting.on ? 'bg-primary' : 'bg-gray-600'} relative`}>
                      <div className={`absolute w-2 h-2 bg-white rounded-full top-0.5 transition-all ${setting.on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-lg overflow-hidden">
              <div className="bg-[hsl(220,15%,12%)] border-b border-[hsl(220,15%,14%)] px-2 py-1.5 flex items-center gap-1.5">
                <Shield className="h-2.5 w-2.5 text-green-500" />
                <span className="text-[7px] sm:text-[9px] font-semibold text-white">Segurança</span>
              </div>
              <div className="p-2 space-y-1.5">
                {securitySettings.slice(0, 3).map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between">
                    <span className="text-[6px] sm:text-[8px] text-gray-300">{setting.label}</span>
                    <div className={`w-6 h-3 rounded-full ${setting.on ? 'bg-green-500' : 'bg-gray-600'} relative`}>
                      <div className={`absolute w-2 h-2 bg-white rounded-full top-0.5 transition-all ${setting.on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Settings */}
          <div className="bg-[hsl(220,20%,8%)] border border-[hsl(220,15%,14%)] rounded-lg p-2 sm:p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Timer className="h-2.5 w-2.5 text-primary" />
              <span className="text-[7px] sm:text-[9px] font-semibold text-white">Configurações de Ações</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[hsl(220,15%,12%)] rounded-lg p-1.5 text-center">
                <span className="text-[6px] text-gray-400">Delay</span>
                <p className="text-[8px] font-bold text-primary">25-40s</p>
              </div>
              <div className="bg-[hsl(220,15%,12%)] rounded-lg p-1.5 text-center">
                <span className="text-[6px] text-gray-400">Limite</span>
                <p className="text-[8px] font-bold text-yellow-500">50/dia</p>
              </div>
              <div className="bg-[hsl(220,15%,12%)] rounded-lg p-1.5 text-center">
                <span className="text-[6px] text-gray-400">Duplicatas</span>
                <p className="text-[8px] font-bold text-green-500">Pular</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
