import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserProfileSidebar } from "@/components/ui/menu";
import { MenuBar } from "@/components/ui/glow-menu";
import { AvatarPicker, avatars } from "@/components/ui/avatar-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Heart,
  Monitor
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("licencas");
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(1);

  // Apply theme to document
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);
  
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
    { device: "Windows 11 Pro - PC Principal", location: "São Paulo, BR", current: true, lastActive: "Agora" },
    { device: "Windows 10 - Notebook Dell", location: "São Paulo, BR", current: false, lastActive: "2h atrás" },
    { device: "Windows 11 - PC Escritório", location: "Campinas, BR", current: false, lastActive: "1 dia atrás" },
  ];

  const loginHistory = [
    { date: "14 Dez 2024, 10:32", device: "Google Chrome", location: "São Paulo, BR", status: "success", reason: "" },
    { date: "13 Dez 2024, 18:45", device: "Google Chrome", location: "São Paulo, BR", status: "success", reason: "" },
    { date: "12 Dez 2024, 09:15", device: "Google Chrome", location: "Rio de Janeiro, BR", status: "failed", reason: "Senha incorreta" },
  ];

  const user = {
    name: "João Dev",
    email: "joao@email.com",
    initials: "JD",
    plan: "Plano Pro"
  };

  const sidebarTabs = ["perfil", "preferencias", "historico", "ajuda"];
  
  const profileNavItems = [
    { label: "Minha Conta", icon: <User className="h-full w-full" />, onClick: () => setActiveTab("perfil") },
    { label: "Preferências", icon: <Settings className="h-full w-full" />, onClick: () => setActiveTab("preferencias") },
    { label: "Histórico", icon: <History className="h-full w-full" />, onClick: () => setActiveTab("historico") },
    { label: "Ajuda", icon: <HelpCircle className="h-full w-full" />, onClick: () => setActiveTab("ajuda"), isSeparator: true },
  ];

  const sidebarActiveIndex = sidebarTabs.indexOf(activeTab);
  
  const handleSidebarChange = (index: number) => {
    setActiveTab(sidebarTabs[index]);
  };

  const logoutItem = {
    label: "Sair",
    icon: <LogOut className="h-full w-full" />,
    onClick: () => navigate("/"),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-[256px] sticky top-0 h-screen flex-shrink-0 border-r border-border">
        <UserProfileSidebar 
          user={{
            name: user.name,
            email: user.email,
            initials: user.initials,
            selectedAvatarId: selectedAvatarId
          }}
          navItems={profileNavItems}
          logoutItem={logoutItem}
          onAvatarChange={(avatar) => setSelectedAvatarId(avatar.id)}
          activeIndex={sidebarActiveIndex >= 0 ? sidebarActiveIndex : null}
          onActiveChange={handleSidebarChange}
          className="h-full border-r-0"
        />
      </aside>

      {/* Mobile/Tablet Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50">
                {selectedAvatarId ? (
                  <div className="w-9 h-9 flex items-center justify-center [&>svg]:w-9 [&>svg]:h-9">
                    {avatars.find(a => a.id === selectedAvatarId)?.svg}
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-primary-foreground bg-primary w-full h-full flex items-center justify-center">{user.initials}</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-card border border-border">
              <DropdownMenuLabel className="font-normal px-3 py-2">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("perfil")} className="px-3 py-2 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Minha Conta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("preferencias")} className="px-3 py-2 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Preferências
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("historico")} className="px-3 py-2 cursor-pointer">
                <History className="mr-2 h-4 w-4" />
                Histórico
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("ajuda")} className="px-3 py-2 cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Ajuda
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")} className="px-3 py-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Center: Navigation */}
          <nav className="flex-1 flex justify-center">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md relative">
              {[
                { label: "Licenças", tab: "licencas", icon: Key },
                { label: "Números", tab: "numeros", icon: Phone },
                { label: "Loja", tab: "comprar", icon: CreditCard },
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
                      layoutId="mobile-tab-bg"
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

          {/* Menu toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-card border-b border-border p-2 md:hidden">
            {[
              { label: "Minha Conta", icon: User, tab: "perfil" },
              { label: "Preferências", icon: Settings, tab: "preferencias" },
              { label: "Histórico", icon: History, tab: "historico" },
              { label: "Ajuda", icon: HelpCircle, tab: "ajuda" },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <div className="mt-2 pt-2 border-t border-border">
              <button
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 lg:pt-0 min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-border bg-card sticky top-0 z-40">
          <nav className="flex items-center gap-1 relative">
            {[
              { label: "Licenças", tab: "licencas", icon: Key },
              { label: "Números", tab: "numeros", icon: Phone },
              { label: "Loja", tab: "comprar", icon: CreditCard },
            ].map((item) => (
              <motion.button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-md transition-colors",
                  activeTab === item.tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileTap={{ scale: 0.97 }}
              >
                {activeTab === item.tab && (
                  <motion.div
                    layoutId="header-tab-bg"
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
        
        {/* Content */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Licenças */}
        {activeTab === "licencas" && (
          <motion.div {...fadeIn} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Minhas Licenças</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas licenças ativas</p>
              </div>
            </div>

            {/* Main License Card */}
            <motion.div 
              className="bg-card border border-border rounded-md overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* License Header */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                      <Key className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Plano {userLicense.plan}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                          <span className="text-xs text-success font-medium">Ativa</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{userLicense.daysLeft} dias restantes</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">Copiar Chave</span>
                  </Button>
                </div>
              </div>

              {/* License Details */}
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-md p-4 transition-all hover:bg-muted/70">
                    <div className="flex items-center gap-2 mb-2">
                      <KeyRound className="w-4 h-4 text-primary" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Chave</p>
                    </div>
                    <p className="text-sm font-mono text-foreground truncate">{userLicense.key}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-4 transition-all hover:bg-muted/70">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ativada em</p>
                    </div>
                    <p className="text-sm text-foreground">{userLicense.activatedAt}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-4 transition-all hover:bg-muted/70">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expira em</p>
                    </div>
                    <p className="text-sm text-foreground">{userLicense.expiresAt}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tempo restante</span>
                    <span className="text-foreground font-semibold">{userLicense.daysLeft} de 30 dias</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(userLicense.daysLeft / 30) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </motion.div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button size="sm" className="flex-1 h-10 bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20">
                    <Zap className="w-4 h-4 mr-2" />
                    Renovar Licença
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-10 border-primary/30 hover:bg-primary/5">
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    Upgrade Vitalício
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Warning Alert */}
            <motion.div 
              className="bg-warning/10 border border-warning/30 rounded-md p-4 flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Sua licença expira em breve!</p>
                <p className="text-sm text-muted-foreground mt-0.5">Renove agora e ganhe <span className="text-warning font-medium">10% de desconto</span> no próximo período.</p>
              </div>
              <Button size="sm" variant="outline" className="hidden sm:flex h-8 border-warning/30 text-warning hover:bg-warning/10 hover:text-warning">
                Renovar
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Números */}
        {activeTab === "numeros" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Números</h1>
                <p className="text-sm text-muted-foreground">Gerencie seus números</p>
              </div>
              <Button size="sm" className="h-9">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className="bg-card border border-border rounded-md p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-success/10 rounded-md flex items-center justify-center">
                      <Phone className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.number}</p>
                      <p className="text-xs text-muted-foreground">{session.addedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-success/10 text-success rounded-md text-xs font-medium">
                      Ativo
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 border border-border rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Precisa de mais números?</p>
                <p className="text-sm text-muted-foreground">Adicione com desconto especial</p>
              </div>
              <Button size="sm" variant="outline" className="h-9" onClick={() => setActiveTab("comprar")}>
                Ver pacotes
              </Button>
            </div>
          </motion.div>
        )}

        {/* Comprar */}
        {activeTab === "comprar" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Loja</h1>
              <p className="text-sm text-muted-foreground">Expanda seus recursos</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Pacote de Números</h3>
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
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md text-sm cursor-pointer transition-colors",
                        item.popular 
                          ? "bg-primary/10 border border-primary/20" 
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm">{item.qty}</span>
                        {item.popular && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">TOP</span>
                        )}
                      </div>
                      <span className="font-semibold text-primary text-sm">{item.price}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full h-9">Comprar</Button>
              </div>

              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Pacote de Sessions</h3>
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
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md text-sm cursor-pointer transition-colors",
                        item.popular 
                          ? "bg-primary/10 border border-primary/20" 
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm">{item.qty}</span>
                        {item.popular && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">MELHOR</span>
                        )}
                      </div>
                      <span className="font-semibold text-primary text-sm">{item.price}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full h-9">Comprar</Button>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-md p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-md flex items-center justify-center">
                    <Shield className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Upgrade Vitalício</h3>
                    <p className="text-sm text-muted-foreground">Pague uma vez, use para sempre</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-warning">R$ 1.997</p>
                    <p className="text-xs text-muted-foreground">pagamento único</p>
                  </div>
                  <Link to="/comprar">
                    <Button size="sm" className="h-9 bg-warning hover:bg-warning/90 text-warning-foreground">
                      Ver <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preferências */}
        {activeTab === "preferencias" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Preferências</h1>
              <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
            </div>

            <div className="space-y-4">
              {/* Avatar - só mobile/tablet */}
              <div className="lg:hidden bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Avatar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {avatars.map((avatar) => (
                    <motion.button
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={cn(
                        "relative w-12 h-12 rounded-md overflow-hidden border-2 transition-colors",
                        selectedAvatarId === avatar.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-muted-foreground hover:bg-muted/50"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {avatar.svg}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tema */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  Aparência
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsDarkTheme(true)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border transition-colors",
                      isDarkTheme ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Escuro</span>
                  </button>
                  <button
                    onClick={() => setIsDarkTheme(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border transition-colors",
                      !isDarkTheme ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">Claro</span>
                  </button>
                </div>
              </div>

              {/* Notificações */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Notificações
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Notificações por email", desc: "Receba atualizações por email" },
                    { label: "Alertas de licença", desc: "Aviso quando expirar" },
                    { label: "Novidades e promoções", desc: "Ofertas exclusivas" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Histórico */}
        {activeTab === "historico" && (
          <motion.div {...fadeIn} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Histórico</h1>
                <p className="text-sm text-muted-foreground">Veja suas atividades recentes</p>
              </div>
            </div>

            {/* Grid de cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Histórico de Compras */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Compras Recentes
                </h3>
                <div className="space-y-2">
                  {[
                    { item: "Licença 30 Dias", date: "16 Dez 2024", value: "R$ 49,90", status: "Aprovado" },
                    { item: "Pacote +5 Números", date: "10 Dez 2024", value: "R$ 29,90", status: "Aprovado" },
                    { item: "Licença 30 Dias", date: "16 Nov 2024", value: "R$ 49,90", status: "Aprovado" },
                  ].map((purchase, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{purchase.item}</p>
                          <p className="text-xs text-muted-foreground">{purchase.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{purchase.value}</p>
                        <p className="text-xs text-success">{purchase.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Histórico de Logins */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Logins Recentes
                </h3>
                <div className="space-y-2">
                  {loginHistory.map((login, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          login.status === "success" ? "bg-success/10" : "bg-destructive/10"
                        )}>
                          {login.status === "success" 
                            ? <CheckCircle className="w-4 h-4 text-success" />
                            : <AlertTriangle className="w-4 h-4 text-destructive" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{login.device}</p>
                          <p className="text-xs text-muted-foreground">{login.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{login.date}</p>
                        <span className={`text-xs font-medium ${
                          login.status === 'success' ? 'text-success' : 'text-destructive'
                        }`}>
                          {login.status === 'success' ? 'Sucesso' : login.reason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sessões Ativas - Bot */}
              <motion.div 
                className="bg-card border border-border rounded-md p-5 space-y-4 sm:col-span-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    Sessões Ativas (Bot)
                  </h3>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
                    Encerrar todas
                  </Button>
                </div>
                <div className="space-y-2">
                  {activeSessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${session.current ? 'bg-success' : 'bg-muted-foreground'}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{session.device}</p>
                          <p className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive flex-shrink-0">
                        Encerrar
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Ajuda */}
        {activeTab === "ajuda" && (
          <motion.div {...fadeIn} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Ajuda</h1>
                <p className="text-sm text-muted-foreground">Precisa de suporte?</p>
              </div>
            </div>

            {/* WhatsApp Card */}
            <motion.div 
              className="bg-card border border-border rounded-md p-6 sm:p-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-[#25D366]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">Fale com a gente</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Nosso time de suporte está pronto para te ajudar. Respondemos rapidamente pelo WhatsApp!
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="mt-4 gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-lg shadow-[#25D366]/20"
                  onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chamar no WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground">
                  Atendimento de Seg a Sex, 9h às 18h
                </p>
              </div>
            </motion.div>

            {/* Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-card border border-border rounded-md p-4 transition-all hover:bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Tempo de resposta</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Respondemos em até 2 horas durante o horário comercial</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-md p-4 transition-all hover:bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Suporte especializado</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Time pronto para resolver qualquer problema</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Perfil Expandido */}
        {activeTab === "perfil" && (
          <motion.div {...fadeIn} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Minha Conta</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas informações</p>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-card border border-border rounded-md p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border flex-shrink-0">
                  {selectedAvatarId ? (
                    <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                      {avatars.find(a => a.id === selectedAvatarId)?.svg}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary-foreground">{user.initials}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-foreground">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">Bem-vindo de volta! 👋</p>
                </div>
              </div>
            </div>

            {/* Grid de cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Informações */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Informações
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="text-sm text-foreground mt-0.5">{user.name}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">Plano</p>
                      <p className="text-sm text-foreground mt-0.5">{user.plan}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md transition-all hover:bg-muted/70">
                    <div>
                      <p className="text-xs text-muted-foreground">Membro desde</p>
                      <p className="text-sm text-foreground mt-0.5">Dezembro 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segurança - Alterar Senha */}
              <motion.div 
                className="bg-card border border-border rounded-md p-5 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Alterar Senha
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Senha atual</label>
                    <div className="relative group">
                      <input 
                        type={showApiKey ? "text" : "password"}
                        defaultValue="senha123"
                        className="w-full h-10 px-3 pr-10 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Nova senha</label>
                    <input 
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      className="w-full h-10 px-3 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Confirmar nova senha</label>
                    <input 
                      type="password"
                      placeholder="Repita a nova senha"
                      className="w-full h-10 px-3 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="pt-2 space-y-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="w-full h-9 bg-gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                        >
                          <Lock className="w-3.5 h-3.5 mr-2" />
                          Alterar senha
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Confirmar alteração de senha
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-left">
                            Tem certeza que deseja alterar sua senha? Por motivos de segurança, você será desconectado de todos os dispositivos e precisará fazer login novamente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => {
                              localStorage.removeItem("isLoggedIn");
                              navigate("/login");
                            }}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Sim, alterar senha
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Por segurança, você será desconectado após alterar a senha
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
        </div>

        {/* Footer */}
        <footer className="mt-auto py-4 px-4 border-t border-border bg-card/50">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 SWEXTRATOR. Desenvolvido por{" "}
            <a 
              href="https://wa.me/5565996498222" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors"
            >
              Kauan Hup
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
