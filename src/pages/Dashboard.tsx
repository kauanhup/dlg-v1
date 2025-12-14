import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SidebarWithSubmenu } from "@/components/ui/sidebar-with-submenu";
import { cn } from "@/lib/utils";
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
  ArrowUpRight,
  Lock,
  Smartphone,
  History,
  Moon,
  Bell,
  Globe,
  Clock,
  KeyRound,
  Activity,
  Download,
  Pause,
  Trash2,
  Wifi,
  Gauge,
  Eye,
  EyeOff,
  Mail,
  Sun,
  Menu,
  X,
  LayoutDashboard,
  Receipt
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("licencas");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const activeSessions = [
    { device: "Chrome - Windows", location: "São Paulo, BR", current: true, lastActive: "Agora" },
    { device: "Safari - iPhone", location: "São Paulo, BR", current: false, lastActive: "2h atrás" },
  ];

  const loginHistory = [
    { date: "14 Dez 2024, 10:32", device: "Chrome - Windows", location: "São Paulo, BR", status: "success" },
    { date: "13 Dez 2024, 18:45", device: "Safari - iPhone", location: "São Paulo, BR", status: "success" },
    { date: "12 Dez 2024, 09:15", device: "Firefox - Mac", location: "Rio de Janeiro, BR", status: "failed" },
  ];

  const user = {
    name: "João Dev",
    email: "joao@email.com",
    initials: "JD",
    plan: "Plano Pro"
  };

  const navigation = [
    { name: "Licenças", icon: <Key className="h-full w-full" />, onClick: () => setActiveTab("licencas"), isActive: activeTab === "licencas" },
    { name: "Números", icon: <Phone className="h-full w-full" />, onClick: () => setActiveTab("numeros"), isActive: activeTab === "numeros" },
    { name: "Loja", icon: <CreditCard className="h-full w-full" />, onClick: () => setActiveTab("comprar"), isActive: activeTab === "comprar" },
  ];

  const footerNavigation = [
    { name: "Ajuda", icon: <HelpCircle className="h-full w-full" />, onClick: () => setActiveTab("ajuda"), isActive: activeTab === "ajuda" },
    { name: "Configurações", icon: <Settings className="h-full w-full" />, onClick: () => setActiveTab("configuracoes"), isActive: activeTab === "configuracoes" },
  ];

  const nestedNavItems = [
    {
      label: "Conta",
      icon: <User className="h-full w-full" />,
      items: [
        { name: "Perfil", onClick: () => setActiveTab("perfil"), isActive: activeTab === "perfil" },
        { name: "Segurança", onClick: () => setActiveTab("configuracoes"), isActive: false },
        { name: "Notificações", onClick: () => setActiveTab("configuracoes"), isActive: false },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-[300px] sticky top-0 h-screen">
        <SidebarWithSubmenu 
          user={user}
          navigation={navigation}
          footerNavigation={footerNavigation}
          nestedNavItems={nestedNavItems}
          onLogout={() => navigate("/")}
          className="h-full"
        />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center glow-sm">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-lg">SWEX</span>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 p-0 rounded-xl hover:bg-secondary/60"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 left-0 right-0 glass-strong border-t border-border/50 p-4 space-y-2"
          >
            {[...navigation, ...footerNavigation].map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  item.isActive 
                    ? "bg-gradient-primary text-primary-foreground shadow-lg glow-sm" 
                    : "text-muted-foreground hover:bg-secondary/60"
                )}
              >
                <span className="w-5 h-5">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pt-0 pt-16 relative z-10">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        
        {/* Licenças */}
        {activeTab === "licencas" && (
          <motion.div {...fadeIn} className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="section-header">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center glow-sm">
                <Key className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="section-title">Minhas Licenças</h1>
                <p className="section-subtitle">Gerencie suas licenças ativas</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Status", value: "Ativa", icon: CheckCircle, color: "text-success" },
                { label: "Plano", value: userLicense.plan, icon: Zap, color: "text-primary" },
                { label: "Dias Restantes", value: userLicense.daysLeft, icon: Clock, color: "text-warning" },
                { label: "Ativada em", value: userLicense.activatedAt, icon: Activity, color: "text-muted-foreground" },
              ].map((stat, i) => (
                <div key={i} className="stat-card group">
                  <div className="flex items-center gap-2 mb-3">
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Main License Card */}
            <div className="glass rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center glow-md">
                    <Key className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-foreground">Plano {userLicense.plan}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm text-success font-medium">Licença Ativa</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl border-border/50 hover:bg-secondary/60">
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar Chave</span>
                </Button>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-4 font-mono text-sm text-foreground/80 tracking-wider">
                {userLicense.key}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Progresso do plano</span>
                  <span className="text-foreground font-medium">{userLicense.daysLeft} dias restantes</span>
                </div>
                <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(userLicense.daysLeft / 30) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-primary rounded-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button className="flex-1 h-12 bg-gradient-primary hover:opacity-90 gap-2 rounded-xl glow-sm text-base font-semibold">
                  <Zap className="w-5 h-5" />
                  Renovar Licença
                </Button>
                <Button variant="outline" className="flex-1 h-12 gap-2 rounded-xl border-warning/30 text-warning hover:bg-warning/10 hover:text-warning">
                  <Sparkles className="w-5 h-5" />
                  Upgrade Vitalício
                </Button>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-warning/10 via-warning/5 to-transparent border border-warning/20 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-2xl" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Sua licença expira em breve</p>
                  <p className="text-sm text-muted-foreground mt-1">Renove agora e ganhe 10% de desconto exclusivo.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Números */}
        {activeTab === "numeros" && (
          <motion.div {...fadeIn} className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="section-header mb-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-success-foreground" />
                </div>
                <div>
                  <h1 className="section-title">Meus Números</h1>
                  <p className="section-subtitle">Gerencie seus números ativos</p>
                </div>
              </div>
              <Button className="h-11 gap-2 bg-gradient-primary hover:opacity-90 rounded-xl glow-sm">
                <Plus className="w-4 h-4" />
                Adicionar Número
              </Button>
            </div>

            <div className="space-y-3">
              {sessions.map((session) => (
                <motion.div 
                  key={session.id}
                  whileHover={{ scale: 1.01 }}
                  className="glass rounded-2xl p-5 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-success/15 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{session.number}</p>
                      <p className="text-sm text-muted-foreground">Adicionado em {session.addedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-success/15 text-success rounded-lg text-xs font-semibold uppercase tracking-wider">
                      Conectado
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-foreground">Precisa de mais números?</p>
                  <p className="text-sm text-muted-foreground mt-1">Adicione com desconto especial de até 30%</p>
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-primary/30 hover:bg-primary/10" onClick={() => setActiveTab("comprar")}>
                  Ver Pacotes
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comprar */}
        {activeTab === "comprar" && (
          <motion.div {...fadeIn} className="max-w-5xl mx-auto space-y-8">
            <div className="section-header">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center glow-sm">
                <CreditCard className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="section-title">Loja</h1>
                <p className="section-subtitle">Expanda seus recursos e capacidades</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Pacote Números */}
              <div className="glass rounded-3xl p-6 space-y-5 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-foreground">Pacote de Números</h3>
                    <p className="text-sm text-muted-foreground">Adicione mais números à sua conta</p>
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
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl text-sm cursor-pointer transition-all",
                        item.popular 
                          ? "bg-primary/15 border border-primary/30 hover:bg-primary/20" 
                          : "bg-secondary/40 hover:bg-secondary/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-foreground font-medium">{item.qty}</span>
                        {item.popular && (
                          <span className="text-[10px] bg-primary/30 text-primary px-2 py-1 rounded-md font-bold uppercase">Mais Popular</span>
                        )}
                      </div>
                      <span className="font-bold text-primary text-base">{item.price}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full h-12 bg-gradient-primary hover:opacity-90 rounded-xl text-base font-semibold">Comprar</Button>
              </div>

              {/* Pacote Sessions */}
              <div className="glass rounded-3xl p-6 space-y-5 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent/15 rounded-2xl flex items-center justify-center">
                    <Zap className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-foreground">Pacote de Sessions</h3>
                    <p className="text-sm text-muted-foreground">Mais sessões simultâneas</p>
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
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl text-sm cursor-pointer transition-all",
                        item.popular 
                          ? "bg-primary/15 border border-primary/30 hover:bg-primary/20" 
                          : "bg-secondary/40 hover:bg-secondary/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-foreground font-medium">{item.qty}</span>
                        {item.popular && (
                          <span className="text-[10px] bg-primary/30 text-primary px-2 py-1 rounded-md font-bold uppercase">Melhor Valor</span>
                        )}
                      </div>
                      <span className="font-bold text-primary text-base">{item.price}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full h-12 bg-gradient-primary hover:opacity-90 rounded-xl text-base font-semibold">Comprar</Button>
              </div>
            </div>

            {/* Upgrade Vitalício */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-warning/15 via-warning/10 to-transparent border border-warning/30 p-8">
              <div className="absolute top-0 right-0 w-60 h-60 bg-warning/15 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-warning/10 rounded-full blur-2xl" />
              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-warning/20 rounded-2xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground">Upgrade Vitalício</h3>
                    <p className="text-sm text-muted-foreground mt-1">Pague uma vez, use para sempre. Sem mensalidades.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-3xl font-display font-bold text-warning">R$ 1.997</p>
                    <p className="text-xs text-muted-foreground">pagamento único</p>
                  </div>
                  <Link to="/comprar">
                    <Button className="h-12 px-6 bg-warning hover:bg-warning/90 text-warning-foreground gap-2 rounded-xl font-semibold">
                      Ver Detalhes <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Configurações */}
        {activeTab === "configuracoes" && (
          <motion.div {...fadeIn} className="max-w-4xl mx-auto space-y-6">
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
          <motion.div {...fadeIn} className="max-w-4xl mx-auto space-y-6">
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

        {/* Perfil Expandido */}
        {activeTab === "perfil" && (
          <motion.div {...fadeIn} className="space-y-8">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Meu Perfil</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Gerencie todas as suas configurações</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Coluna 1 - Informações da Conta */}
              <div className="space-y-6">
                {/* Info Básica */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Informações
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-foreground">João Silva</p>
                      <p className="text-xs text-muted-foreground">joao@email.com</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Email</p>
                        <p className="text-xs text-foreground mt-0.5">joao@email.com</p>
                      </div>
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Membro desde</p>
                        <p className="text-xs text-foreground mt-0.5">Dezembro 2024</p>
                      </div>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Preferências */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Preferências
                  </h3>
                  <div className="space-y-3">
                    <div 
                      className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/60 transition-colors"
                      onClick={() => setIsDarkTheme(!isDarkTheme)}
                    >
                      <div className="flex items-center gap-3">
                        {isDarkTheme ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
                        <div>
                          <p className="text-xs font-medium text-foreground">Tema</p>
                          <p className="text-[10px] text-muted-foreground">{isDarkTheme ? "Escuro" : "Claro"}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-colors ${isDarkTheme ? 'bg-primary' : 'bg-secondary'} relative`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${isDarkTheme ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Notificações</p>
                          <p className="text-[10px] text-muted-foreground">Email e push</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Idioma</p>
                          <p className="text-[10px] text-muted-foreground">Português (BR)</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Fuso Horário</p>
                          <p className="text-[10px] text-muted-foreground">America/Sao_Paulo (GMT-3)</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2 - Segurança */}
              <div className="space-y-6">
                {/* Segurança */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Segurança
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Alterar Senha</p>
                          <p className="text-[10px] text-muted-foreground">Última alteração: 30 dias atrás</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Autenticação 2FA</p>
                          <p className="text-[10px] text-muted-foreground">Não configurado</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded font-medium">Configurar</span>
                    </div>
                  </div>
                </div>

                {/* Sessões Ativas */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      Sessões Ativas
                    </h3>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
                      Encerrar todas
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {activeSessions.map((session, i) => (
                      <div key={i} className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${session.current ? 'bg-success' : 'bg-muted-foreground'}`} />
                          <div>
                            <p className="text-xs font-medium text-foreground">{session.device}</p>
                            <p className="text-[10px] text-muted-foreground">{session.location} • {session.lastActive}</p>
                          </div>
                        </div>
                        {session.current ? (
                          <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded font-medium">Atual</span>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground">
                            Encerrar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Histórico de Login */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Histórico de Login
                  </h3>
                  <div className="space-y-2">
                    {loginHistory.map((login, i) => (
                      <div key={i} className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-foreground">{login.device}</p>
                          <p className="text-[10px] text-muted-foreground">{login.date} • {login.location}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          login.status === 'success' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                        }`}>
                          {login.status === 'success' ? 'Sucesso' : 'Falhou'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coluna 3 - API & Ações */}
              <div className="space-y-6">
                {/* API Keys */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-primary" />
                      Chaves de API
                    </h3>
                    <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded font-medium">2 Ativas</span>
                  </div>

                  {/* API Key Principal */}
                  <div className="bg-secondary/40 rounded-xl p-4 space-y-3 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <p className="text-xs font-medium text-foreground">Production Key</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-lg px-3 py-2 border border-border/30">
                      <p className="text-[11px] font-mono text-muted-foreground break-all">
                        {showApiKey ? "sk_live_7x8k9m2n3p4q5r6s7t8u9v0wxyz123456" : "sk_live_••••••••••••••••••••••••••••••••"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Criada em 01 Dez 2024</span>
                      <span>Último uso: 2 min atrás</span>
                    </div>
                  </div>

                  {/* API Key Teste */}
                  <div className="bg-secondary/40 rounded-xl p-4 space-y-3 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-warning" />
                        <p className="text-xs font-medium text-foreground">Test Key</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-lg px-3 py-2 border border-border/30">
                      <p className="text-[11px] font-mono text-muted-foreground break-all">
                        sk_test_••••••••••••••••••••••••••••••••
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Criada em 05 Dez 2024</span>
                      <span>Último uso: 3 dias atrás</span>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-secondary/30 rounded-lg p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground">1.2k</p>
                      <p className="text-[9px] text-muted-foreground uppercase">Requisições/dia</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2.5 text-center">
                      <p className="text-sm font-bold text-success">99.9%</p>
                      <p className="text-[9px] text-muted-foreground uppercase">Uptime</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2.5 text-center">
                      <p className="text-sm font-bold text-foreground">45ms</p>
                      <p className="text-[9px] text-muted-foreground uppercase">Latência</p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 gap-1.5 text-xs">
                      <Activity className="w-3.5 h-3.5" />
                      Ver Logs
                    </Button>
                    <Button size="sm" className="flex-1 h-8 gap-1.5 bg-gradient-primary hover:opacity-90 text-xs">
                      <Plus className="w-3.5 h-3.5" />
                      Nova Chave
                    </Button>
                  </div>

                  {/* Aviso de segurança */}
                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-foreground font-medium">Mantenha suas chaves seguras</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Nunca compartilhe ou exponha suas API keys em código público.</p>
                    </div>
                  </div>
                </div>

                {/* Config da Ferramenta */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    Configurações da Ferramenta
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Limites de Automação</p>
                          <p className="text-[10px] text-muted-foreground">1000 ações/dia</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground">Configurações de Proxy</p>
                          <p className="text-[10px] text-muted-foreground">Nenhum configurado</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Ações da Conta */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Ações da Conta
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full h-9 justify-start gap-2">
                      <Download className="w-4 h-4" />
                      Exportar Meus Dados
                    </Button>
                    <Button variant="outline" size="sm" className="w-full h-9 justify-start gap-2">
                      <LogOut className="w-4 h-4" />
                      Sair de Todos os Dispositivos
                    </Button>
                    <Button variant="outline" size="sm" className="w-full h-9 justify-start gap-2 text-warning border-warning/50 hover:bg-warning/10">
                      <Pause className="w-4 h-4" />
                      Desativar Conta Temporariamente
                    </Button>
                    <Button variant="outline" size="sm" className="w-full h-9 justify-start gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                      Excluir Conta Permanentemente
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
