import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Key, 
  Clock, 
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
  Home
} from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("licencas");
  
  // Mock data for UI
  const userLicense = {
    key: "SWEX-XXXX-XXXX-XXXX",
    plan: "30 Dias",
    status: "active",
    expiresAt: "15 Jan 2025",
    daysLeft: 23,
    activatedAt: "16 Dez 2024"
  };

  const sessions = [
    { id: 1, number: "+55 11 9xxxx-xxxx", status: "active", addedAt: "10 Dez 2024" },
    { id: 2, number: "+55 21 9xxxx-xxxx", status: "active", addedAt: "12 Dez 2024" },
  ];

  const menuItems = [
    { id: "licencas", label: "Minhas Licenças", icon: Key },
    { id: "numeros", label: "Números/Sessions", icon: Phone },
    { id: "comprar", label: "Comprar Mais", icon: CreditCard },
    { id: "configuracoes", label: "Configurações", icon: Settings },
    { id: "ajuda", label: "Ajuda", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-foreground">SWEXTRATOR</span>
                  <span className="text-[9px] text-muted-foreground -mt-0.5">v2.0.1</span>
                </div>
              </Link>
              
              <Link to="/" className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center border border-border">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">João Silva</p>
                  <p className="text-xs text-muted-foreground">joao@email.com</p>
                </div>
              </div>
              <Link to="/">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === item.id 
                      ? "bg-gradient-primary text-primary-foreground glow-sm" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {activeTab === "licencas" && (
              <>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">Minhas Licenças</h1>
                  <p className="text-muted-foreground mt-1">Gerencie suas licenças ativas</p>
                </div>

                {/* License Card */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center glow-sm">
                        <Key className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground text-lg">Plano {userLicense.plan}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-success font-medium">Licença Ativa</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copiar Chave
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground">Chave</p>
                      <p className="font-mono text-foreground mt-1">{userLicense.key}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground">Ativada em</p>
                      <p className="text-foreground mt-1">{userLicense.activatedAt}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground">Expira em</p>
                      <p className="text-foreground mt-1">{userLicense.expiresAt}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Tempo restante</span>
                      <span className="text-foreground font-medium">{userLicense.daysLeft} dias</span>
                    </div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary rounded-full transition-all"
                        style={{ width: `${(userLicense.daysLeft / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button className="flex-1 gap-2 bg-gradient-primary hover:opacity-90">
                      <Zap className="w-4 h-4" />
                      Renovar Licença
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Shield className="w-4 h-4" />
                      Upgrade para Vitalício
                    </Button>
                  </div>
                </div>

                {/* Alert for expiring soon */}
                <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sua licença expira em breve</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Renove agora e ganhe 10% de desconto na próxima licença.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "numeros" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Números/Sessions</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seus números cadastrados</p>
                  </div>
                  <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4" />
                    Adicionar Número
                  </Button>
                </div>

                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between card-hover">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                          <Phone className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{session.number}</p>
                          <p className="text-sm text-muted-foreground">Adicionado em {session.addedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm font-medium">
                          Ativo
                        </span>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Purchase more sessions */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-foreground">Precisa de mais números?</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Adicione mais números ao seu plano com desconto
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab("comprar")} className="bg-gradient-primary hover:opacity-90">
                      Comprar Números
                    </Button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "comprar" && (
              <>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">Comprar Mais</h1>
                  <p className="text-muted-foreground mt-1">Expanda seus recursos</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Numbers Package */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold text-foreground">Pacote de Números</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Adicione mais números ao seu plano
                      </p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { qty: "+5 números", price: "R$ 29,90" },
                        { qty: "+10 números", price: "R$ 49,90" },
                        { qty: "+25 números", price: "R$ 99,90", popular: true },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                          item.popular 
                            ? "bg-primary/10 border border-primary/30 hover:bg-primary/15" 
                            : "bg-secondary/50 hover:bg-secondary border border-transparent"
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">{item.qty}</span>
                            {item.popular && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Popular</span>
                            )}
                          </div>
                          <span className="font-bold text-primary">{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-gradient-primary hover:opacity-90">Comprar Números</Button>
                  </div>

                  {/* Sessions Package */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold text-foreground">Pacote de Sessions</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Aumente o limite de sessões simultâneas
                      </p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { qty: "+3 sessions", price: "R$ 39,90" },
                        { qty: "+5 sessions", price: "R$ 59,90" },
                        { qty: "+10 sessions", price: "R$ 99,90", popular: true },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                          item.popular 
                            ? "bg-primary/10 border border-primary/30 hover:bg-primary/15" 
                            : "bg-secondary/50 hover:bg-secondary border border-transparent"
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">{item.qty}</span>
                            {item.popular && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Melhor valor</span>
                            )}
                          </div>
                          <span className="font-bold text-primary">{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-gradient-primary hover:opacity-90">Comprar Sessions</Button>
                  </div>
                </div>

                {/* Upgrade License */}
                <div className="bg-gradient-to-r from-warning/10 via-warning/5 to-transparent border border-warning/30 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-warning/20 rounded-xl flex items-center justify-center">
                        <Shield className="w-7 h-7 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground text-lg">Upgrade para Vitalício</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          Pague uma vez, use para sempre. Inclui todas as atualizações futuras.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-warning">R$ 1.997</p>
                        <p className="text-sm text-muted-foreground">pagamento único</p>
                      </div>
                      <Link to="/comprar">
                        <Button size="lg" className="bg-warning hover:bg-warning/90 text-warning-foreground">Ver Planos</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "configuracoes" && (
              <>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">Configurações</h1>
                  <p className="text-muted-foreground mt-1">Gerencie sua conta</p>
                </div>

                <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                  {[
                    { title: "Informações Pessoais", desc: "Atualize seu nome e email", action: "Editar" },
                    { title: "Alterar Senha", desc: "Atualize sua senha de acesso", action: "Alterar" },
                    { title: "Notificações", desc: "Configure alertas por email", action: "Configurar" },
                  ].map((item, i) => (
                    <div key={i} className="p-5 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Button variant="outline" size="sm">{item.action}</Button>
                    </div>
                  ))}
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-destructive">Excluir Conta</p>
                      <p className="text-sm text-muted-foreground">Remover permanentemente sua conta</p>
                    </div>
                    <Button variant="destructive" size="sm">Excluir</Button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "ajuda" && (
              <>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">Ajuda</h1>
                  <p className="text-muted-foreground mt-1">Encontre respostas para suas dúvidas</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { q: "Como ativar minha licença?", a: "Baixe o software, abra e insira sua chave de licença na tela inicial." },
                    { q: "Como adicionar números?", a: "Na aba \"Números/Sessions\" clique em \"Adicionar Número\"." },
                    { q: "Posso transferir minha licença?", a: "Sim, entre em contato com o suporte para solicitar a transferência." },
                    { q: "O que inclui a licença vitalícia?", a: "Acesso permanente ao software e todas as atualizações futuras." },
                  ].map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-5 card-hover cursor-pointer">
                      <h3 className="font-medium text-foreground">{item.q}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{item.a}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-secondary/50 rounded-xl p-6 text-center border border-border">
                  <p className="text-foreground font-medium">Não encontrou o que procura?</p>
                  <p className="text-sm text-muted-foreground mt-1">Entre em contato com nosso suporte</p>
                  <Button className="mt-4 bg-gradient-primary hover:opacity-90">Falar com Suporte</Button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
