import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserProfileSidebar } from "@/components/ui/menu";
import { MenuBar } from "@/components/ui/glow-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Star,
  Heart
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

  const profileNavItems = [
    { label: "Meu Perfil", icon: <User className="h-full w-full" />, onClick: () => setActiveTab("perfil") },
    { label: "Minhas Compras", icon: <CreditCard className="h-full w-full" />, onClick: () => setActiveTab("comprar") },
    { label: "Favoritos", icon: <Heart className="h-full w-full" />, onClick: () => {} },
    { label: "Avaliações", icon: <Star className="h-full w-full" />, onClick: () => {} },
    { label: "Configurações", icon: <Settings className="h-full w-full" />, onClick: () => setActiveTab("configuracoes"), isSeparator: true },
  ];

  const logoutItem = {
    label: "Sair",
    icon: <LogOut className="h-full w-full" />,
    onClick: () => navigate("/"),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar Desktop - Profile Only */}
      <aside className="hidden lg:flex flex-col w-[280px] sticky top-0 h-screen p-4 flex-shrink-0">
        <UserProfileSidebar 
          user={{
            name: user.name,
            email: user.email,
            initials: user.initials,
            avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60"
          }}
          navItems={profileNavItems}
          logoutItem={logoutItem}
          className="h-full"
        />
      </aside>

      {/* Mobile/Tablet Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side: Profile icon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background">
                <span className="text-xs font-bold text-primary-foreground">{user.initials}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-popover border border-border z-50">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("perfil")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("comprar")} className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Minhas Compras</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Heart className="mr-2 h-4 w-4" />
                <span>Favoritos</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Star className="mr-2 h-4 w-4" />
                <span>Avaliações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("configuracoes")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Right side: Burger menu */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-14 left-0 right-0 bg-background border-b border-border p-3 space-y-1 md:hidden"
          >
            {[
              { label: "Licenças", icon: <Key className="h-full w-full" />, onClick: () => setActiveTab("licencas") },
              { label: "Números", icon: <Phone className="h-full w-full" />, onClick: () => setActiveTab("numeros") },
              { label: "Loja", icon: <CreditCard className="h-full w-full" />, onClick: () => setActiveTab("comprar") },
              { label: "Configurações", icon: <Settings className="h-full w-full" />, onClick: () => setActiveTab("configuracoes") },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-secondary/50"
                )}
              >
                <span className="w-5 h-5">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className="pt-2 mt-2 border-t border-border">
              <button
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-14 lg:pt-0 min-w-0">
        {/* Glow Menu Header - Desktop only (lg+) */}
        <div className="hidden lg:flex justify-center py-4 px-4 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
          <MenuBar
            items={[
              {
                icon: Key,
                label: "Licenças",
                href: "#",
                gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
                iconColor: "text-blue-500",
              },
              {
                icon: Phone,
                label: "Números",
                href: "#",
                gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
                iconColor: "text-green-500",
              },
              {
                icon: CreditCard,
                label: "Loja",
                href: "#",
                gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
                iconColor: "text-orange-500",
              },
              {
                icon: Settings,
                label: "Configurações",
                href: "#",
                gradient: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(124,58,237,0.06) 50%, rgba(109,40,217,0) 100%)",
                iconColor: "text-violet-500",
              },
            ]}
            activeItem={activeTab === "licencas" ? "Licenças" : activeTab === "numeros" ? "Números" : activeTab === "comprar" ? "Loja" : activeTab === "configuracoes" ? "Configurações" : "Licenças"}
            onItemClick={(label) => {
              if (label === "Licenças") setActiveTab("licencas");
              else if (label === "Números") setActiveTab("numeros");
              else if (label === "Loja") setActiveTab("comprar");
              else if (label === "Configurações") setActiveTab("configuracoes");
            }}
          />
        </div>
        
        {/* Content */}
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Licenças */}
        {activeTab === "licencas" && (
          <motion.div {...fadeIn} className="max-w-4xl mx-auto space-y-6">
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
          <motion.div {...fadeIn} className="max-w-4xl mx-auto space-y-6">
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
              <Button size="sm" variant="outline" className="h-8" onClick={() => setActiveTab("comprar")}>
                Ver pacotes
              </Button>
            </div>
          </motion.div>
        )}

        {/* Comprar */}
        {activeTab === "comprar" && (
          <motion.div {...fadeIn} className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Loja</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Expanda seus recursos</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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
