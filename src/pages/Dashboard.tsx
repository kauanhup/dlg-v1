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
    { date: "11 Dez 2024, 22:30", device: "IP Desconhecido", location: "Desconhecido", status: "failed", reason: "IP bloqueado" },
  ];

  const user = {
    name: "João Dev",
    email: "joao@email.com",
    initials: "JD",
    plan: "Plano Pro"
  };

  const profileNavItems = [
    { label: "Minha Conta", icon: <User className="h-full w-full" />, onClick: () => setActiveTab("perfil") },
    { label: "Preferências", icon: <Settings className="h-full w-full" />, onClick: () => setActiveTab("preferencias") },
    { label: "Histórico", icon: <History className="h-full w-full" />, onClick: () => setActiveTab("historico") },
    { label: "Ajuda", icon: <HelpCircle className="h-full w-full" />, onClick: () => setActiveTab("ajuda"), isSeparator: true },
  ];

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
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
              {[
                { label: "Licenças", tab: "licencas", icon: Key },
                { label: "Números", tab: "numeros", icon: Phone },
                { label: "Loja", tab: "comprar", icon: CreditCard },
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors",
                    activeTab === item.tab
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
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
          <nav className="flex items-center gap-1">
            {[
              { label: "Licenças", tab: "licencas", icon: Key },
              { label: "Números", tab: "numeros", icon: Phone },
              { label: "Loja", tab: "comprar", icon: CreditCard },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-md transition-colors",
                  activeTab === item.tab
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        
        {/* Content */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Licenças */}
        {activeTab === "licencas" && (
          <motion.div {...fadeIn} className="space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Minhas Licenças</h1>
              <p className="text-sm text-muted-foreground">Gerencie suas licenças ativas</p>
            </div>

            {/* Main License Card */}
            <div className="bg-card border border-border rounded-md p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Plano {userLicense.plan}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs text-success font-medium">Ativa</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                  <Copy className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline text-xs">Copiar</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Chave</p>
                  <p className="text-sm font-mono text-foreground mt-1 truncate">{userLicense.key}</p>
                </div>
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ativada</p>
                  <p className="text-sm text-foreground mt-1">{userLicense.activatedAt}</p>
                </div>
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Expira</p>
                  <p className="text-sm text-foreground mt-1">{userLicense.expiresAt}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Tempo restante</span>
                  <span className="text-foreground font-medium">{userLicense.daysLeft} dias</span>
                </div>
                <div className="h-2 bg-muted rounded overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(userLicense.daysLeft / 30) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-primary rounded"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button size="sm" className="flex-1 h-9">
                  <Zap className="w-4 h-4 mr-2" />
                  Renovar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Vitalício
                </Button>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-md p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Licença expira em breve</p>
                <p className="text-sm text-muted-foreground">Renove agora e ganhe 10% de desconto.</p>
              </div>
            </div>
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
          <motion.div {...fadeIn} className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Histórico</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Veja suas atividades recentes</p>
            </div>

            <div className="space-y-4">
              {/* Histórico de Compras */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Compras Recentes
                </h3>
                <div className="space-y-2">
                  {[
                    { item: "Licença 30 Dias", date: "16 Dez 2024", value: "R$ 49,90", status: "Aprovado" },
                    { item: "Pacote +5 Números", date: "10 Dez 2024", value: "R$ 29,90", status: "Aprovado" },
                  ].map((purchase, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
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
                <Button variant="outline" size="sm" className="w-full h-8 gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Exportar histórico
                </Button>
              </div>

              {/* Histórico de Logins */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Logins Recentes
                </h3>
                <div className="space-y-2">
                  {loginHistory.map((login, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
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
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  Sessões Ativas (Bot)
                </h3>
                <div className="space-y-2">
                  {activeSessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Monitor className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{session.device}</p>
                            {session.current && (
                              <span className="text-[9px] bg-success/20 text-success px-1.5 py-0.5 rounded font-medium">ATUAL</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
                          Encerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border flex-shrink-0">
                  {selectedAvatarId ? (
                    <div className="w-16 h-16 flex items-center justify-center [&>svg]:w-16 [&>svg]:h-16">
                      {avatars.find(a => a.id === selectedAvatarId)?.svg}
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-primary flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary-foreground">{user.initials}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-foreground">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{user.plan}</span>
                    <span className="text-xs text-muted-foreground">Membro desde Dez 2024</span>
                  </div>
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
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="text-sm text-foreground mt-0.5">{user.name}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">Editar</Button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="text-xs text-muted-foreground">Plano</p>
                      <p className="text-sm text-foreground mt-0.5">{user.plan}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div>
                      <p className="text-xs text-muted-foreground">Membro desde</p>
                      <p className="text-sm text-foreground mt-0.5">Dezembro 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segurança - Alterar Senha */}
              <div className="bg-card border border-border rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Alterar Senha
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Senha atual</label>
                    <div className="relative">
                      <input 
                        type={showApiKey ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full h-9 px-3 pr-10 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Nova senha</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-9 px-3 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Confirmar nova senha</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-9 px-3 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <Button size="sm" className="w-full h-8 mt-2">Salvar nova senha</Button>
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
