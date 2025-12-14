import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  LogOut,
  User,
  CreditCard,
  Settings,
  HelpCircle,
  Phone,
  ChevronRight,
  Copy,
  Shield,
  Zap,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const tabItems = [
  { title: "Licenças", icon: Key },
  { title: "Números", icon: Phone },
  { type: "separator" as const },
  { title: "Loja", icon: CreditCard },
  { title: "Config", icon: Settings },
  { title: "Ajuda", icon: HelpCircle },
  { type: "separator" as const },
  { title: "Perfil", icon: User },
];

const tabIdMap = ["licencas", "numeros", null, "comprar", "configuracoes", "ajuda", null, "perfil"];

const Dashboard = () => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const activeTab = tabIdMap[activeTabIndex] || "licencas";
  
  const userLicense = {
    key: "SWEX-XXXX-XXXX-XXXX",
    plan: "30 Dias",
    expiresAt: "15 Jan 2025",
    daysLeft: 23,
    activatedAt: "16 Dez 2024"
  };

  const sessions = [
    { id: 1, number: "+55 11 9xxxx-xxxx", addedAt: "10 Dez 2024" },
    { id: 2, number: "+55 21 9xxxx-xxxx", addedAt: "12 Dez 2024" },
  ];

  const handleTabChange = (index: number | null) => {
    if (index !== null && tabIdMap[index] !== null) {
      setActiveTabIndex(index);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            <Link to="/" className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
            </Link>

            <div className="flex-1 flex justify-center">
              <ExpandableTabs 
                tabs={tabItems} 
                activeIndex={activeTabIndex}
                onChange={handleTabChange}
                className="border-border/50 bg-card/50 backdrop-blur-sm"
              />
            </div>

            <Link to="/" className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-3">
                <LogOut className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Licenças */}
        {activeTab === "licencas" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Minhas Licenças</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Gerencie suas licenças ativas</p>
            </div>

            {/* Main License Card */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">Plano {userLicense.plan}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs text-success font-medium">Ativa</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground">
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Copiar</span>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Chave</p>
                  <p className="text-xs font-mono text-foreground mt-1 truncate">{userLicense.key}</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ativada</p>
                  <p className="text-xs text-foreground mt-1">{userLicense.activatedAt}</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Expira</p>
                  <p className="text-xs text-foreground mt-1">{userLicense.expiresAt}</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Tempo restante</span>
                  <span className="text-foreground font-medium">{userLicense.daysLeft} dias</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(userLicense.daysLeft / 30) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-primary rounded-full"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1 h-9 bg-gradient-primary hover:opacity-90 gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Renovar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9 gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Upgrade Vitalício
                </Button>
              </div>
            </div>

            {/* Alert */}
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Licença expira em breve</p>
                <p className="text-xs text-muted-foreground mt-0.5">Renove agora e ganhe 10% de desconto.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Números */}
        {activeTab === "numeros" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Números</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus números</p>
              </div>
              <Button size="sm" className="h-8 gap-1.5 bg-gradient-primary hover:opacity-90">
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-success/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.number}</p>
                      <p className="text-xs text-muted-foreground">{session.addedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-success/10 text-success rounded text-[10px] font-medium uppercase">
                      Ativo
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Precisa de mais números?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Adicione com desconto especial</p>
              </div>
              <Button size="sm" variant="outline" className="h-8" onClick={() => setActiveTabIndex(3)}>
                Ver pacotes
              </Button>
            </div>
          </motion.div>
        )}

        {/* Comprar */}
        {activeTab === "comprar" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Loja</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Expanda seus recursos</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Numbers Package */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-sm">Pacote de Números</h3>
                    <p className="text-xs text-muted-foreground">Adicione mais números</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { qty: "+5 números", price: "R$ 29,90" },
                    { qty: "+10 números", price: "R$ 49,90" },
                    { qty: "+25 números", price: "R$ 99,90", popular: true },
                  ].map((item, i) => (
                    <div 
                      key={i}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                        item.popular 
                          ? "bg-primary/10 border border-primary/20" 
                          : "bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-xs">{item.qty}</span>
                        {item.popular && (
                          <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">TOP</span>
                        )}
                      </div>
                      <span className="font-bold text-primary text-xs">{item.price}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full h-8 bg-gradient-primary hover:opacity-90">Comprar</Button>
              </div>

              {/* Sessions Package */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-sm">Pacote de Sessions</h3>
                    <p className="text-xs text-muted-foreground">Mais sessões simultâneas</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { qty: "+3 sessions", price: "R$ 39,90" },
                    { qty: "+5 sessions", price: "R$ 59,90" },
                    { qty: "+10 sessions", price: "R$ 99,90", popular: true },
                  ].map((item, i) => (
                    <div 
                      key={i}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                        item.popular 
                          ? "bg-primary/10 border border-primary/20" 
                          : "bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-xs">{item.qty}</span>
                        {item.popular && (
                          <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">MELHOR</span>
                        )}
                      </div>
                      <span className="font-bold text-primary text-xs">{item.price}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full h-8 bg-gradient-primary hover:opacity-90">Comprar</Button>
              </div>
            </div>

            {/* Upgrade Banner */}
            <div className="bg-gradient-to-r from-warning/10 to-transparent border border-warning/20 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-sm">Upgrade Vitalício</h3>
                    <p className="text-xs text-muted-foreground">Pague uma vez, use para sempre</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-display font-bold text-warning">R$ 1.997</p>
                    <p className="text-[10px] text-muted-foreground">pagamento único</p>
                  </div>
                  <Link to="/comprar">
                    <Button size="sm" className="h-8 bg-warning hover:bg-warning/90 text-warning-foreground gap-1">
                      Ver <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Configurações */}
        {activeTab === "configuracoes" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Configurações</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Gerencie sua conta</p>
            </div>

            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {[
                { label: "Perfil", desc: "Nome, email e foto", icon: User },
                { label: "Segurança", desc: "Senha e 2FA", icon: Shield },
                { label: "Notificações", desc: "Alertas e emails", icon: MessageCircle },
                { label: "Faturamento", desc: "Histórico de pagamentos", icon: CreditCard },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-4 hover:bg-secondary/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Zona de Perigo</p>
                <p className="text-xs text-muted-foreground">Excluir conta permanentemente</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Excluir
              </Button>
            </div>
          </motion.div>
        )}

        {/* Ajuda */}
        {activeTab === "ajuda" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Ajuda</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Tire suas dúvidas</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: "Documentação", desc: "Guias completos", icon: ExternalLink },
                { title: "FAQ", desc: "Perguntas frequentes", icon: HelpCircle },
                { title: "Suporte", desc: "Fale conosco", icon: MessageCircle },
                { title: "Comunidade", desc: "Grupo Telegram", icon: Phone },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Ajuda urgente?</p>
                <p className="text-xs text-muted-foreground">Respondemos em até 2h</p>
              </div>
              <Button size="sm" className="h-8 gap-1.5 bg-gradient-primary hover:opacity-90">
                <MessageCircle className="w-3.5 h-3.5" />
                Chamado
              </Button>
            </div>
          </motion.div>
        )}

        {/* Perfil */}
        {activeTab === "perfil" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Meu Perfil</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Suas informações</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">João Silva</h3>
                  <p className="text-sm text-muted-foreground">joao@email.com</p>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { label: "Nome completo", value: "João Silva" },
                  { label: "Email", value: "joao@email.com" },
                  { label: "Membro desde", value: "Dezembro 2024" },
                ].map((item, i) => (
                  <div key={i} className="bg-secondary/40 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="text-sm text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Editar Perfil
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
