import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
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
  Home,
  ExternalLink,
  MessageCircle
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const tabItems = [
  { title: "Licenças", icon: Key },
  { title: "Números", icon: Phone },
  { type: "separator" as const },
  { title: "Comprar", icon: CreditCard },
  { title: "Config", icon: Settings },
  { title: "Ajuda", icon: HelpCircle },
  { type: "separator" as const },
  { title: "Perfil", icon: User },
];

const tabIdMap = ["licencas", "numeros", null, "comprar", "configuracoes", "ajuda", null, "perfil"];

const Dashboard = () => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  
  const activeTab = tabIdMap[activeTabIndex] || "licencas";
  
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

  const handleTabChange = (index: number | null) => {
    if (index !== null && tabIdMap[index] !== null) {
      setActiveTabIndex(index);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center"
              >
                <Zap className="w-5 h-5 text-primary-foreground" />
              </motion.div>
            </Link>

            <div className="flex-1 flex justify-center overflow-x-auto scrollbar-hide">
              <ExpandableTabs 
                tabs={tabItems} 
                activeIndex={activeTabIndex}
                onChange={handleTabChange}
                className="border-none bg-transparent shadow-none"
              />
            </div>

            <Link to="/" className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="max-w-4xl mx-auto space-y-6">
          {activeTab === "licencas" && (
              <motion.div
                key="licencas"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                <motion.div variants={fadeInUp}>
                  <h1 className="text-2xl font-display font-bold text-foreground">Minhas Licenças</h1>
                  <p className="text-muted-foreground mt-1">Gerencie suas licenças ativas</p>
                </motion.div>

                {/* License Card */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ y: -2 }}
                  className="bg-card border border-border rounded-2xl p-6 space-y-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center glow-sm"
                      >
                        <Key className="w-7 h-7 text-primary-foreground" />
                      </motion.div>
                      <div>
                        <h3 className="font-display font-bold text-foreground text-lg">Plano {userLicense.plan}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-success font-medium">Licença Ativa</span>
                        </div>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copiar Chave
                      </Button>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Chave", value: userLicense.key, mono: true },
                      { label: "Ativada em", value: userLicense.activatedAt },
                      { label: "Expira em", value: userLicense.expiresAt },
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="bg-secondary/50 rounded-xl p-4 border border-border/50"
                      >
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className={`text-foreground mt-1 ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Tempo restante</span>
                      <span className="text-foreground font-medium">{userLicense.daysLeft} dias</span>
                    </div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(userLicense.daysLeft / 30) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-primary rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button className="w-full gap-2 bg-gradient-primary hover:opacity-90">
                        <Zap className="w-4 h-4" />
                        Renovar Licença
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button variant="outline" className="w-full gap-2">
                        <Shield className="w-4 h-4" />
                        Upgrade para Vitalício
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Alert for expiring soon */}
                <motion.div 
                  variants={fadeInUp}
                  className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-4"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0"
                  >
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground">Sua licença expira em breve</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Renove agora e ganhe 10% de desconto na próxima licença.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "numeros" && (
              <motion.div
                key="numeros"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                <motion.div variants={fadeInUp} className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Números/Sessions</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seus números cadastrados</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                      <Plus className="w-4 h-4" />
                      Adicionar Número
                    </Button>
                  </motion.div>
                </motion.div>

                <div className="grid gap-4">
                  {sessions.map((session, index) => (
                    <motion.div 
                      key={session.id}
                      variants={fadeInUp}
                      whileHover={{ y: -2, x: 4 }}
                      className="bg-card border border-border rounded-xl p-5 flex items-center justify-between transition-shadow hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          whileHover={{ rotate: 10 }}
                          className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center"
                        >
                          <Phone className="w-6 h-6 text-success" />
                        </motion.div>
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
                    </motion.div>
                  ))}
                </div>

                {/* Purchase more sessions */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-foreground">Precisa de mais números?</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Adicione mais números ao seu plano com desconto
                      </p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => setActiveTabIndex(3)} className="bg-gradient-primary hover:opacity-90">
                        Comprar Números
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "comprar" && (
              <motion.div
                key="comprar"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                <motion.div variants={fadeInUp}>
                  <h1 className="text-2xl font-display font-bold text-foreground">Comprar Mais</h1>
                  <p className="text-muted-foreground mt-1">Expanda seus recursos</p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Numbers Package */}
                  <motion.div 
                    variants={fadeInUp}
                    whileHover={{ y: -4 }}
                    className="bg-card border border-border rounded-2xl p-6 space-y-5 transition-shadow hover:shadow-xl hover:shadow-primary/5"
                  >
                    <motion.div 
                      whileHover={{ rotate: 10 }}
                      className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center"
                    >
                      <Phone className="w-6 h-6 text-primary" />
                    </motion.div>
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
                        <motion.div 
                          key={i}
                          whileHover={{ x: 4 }}
                          className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                            item.popular 
                              ? "bg-primary/10 border border-primary/30 hover:bg-primary/15" 
                              : "bg-secondary/50 hover:bg-secondary border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">{item.qty}</span>
                            {item.popular && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Popular</span>
                            )}
                          </div>
                          <span className="font-bold text-primary">{item.price}</span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-primary hover:opacity-90">Comprar Números</Button>
                    </motion.div>
                  </motion.div>

                  {/* Sessions Package */}
                  <motion.div 
                    variants={fadeInUp}
                    whileHover={{ y: -4 }}
                    className="bg-card border border-border rounded-2xl p-6 space-y-5 transition-shadow hover:shadow-xl hover:shadow-primary/5"
                  >
                    <motion.div 
                      whileHover={{ rotate: 10 }}
                      className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center"
                    >
                      <Zap className="w-6 h-6 text-accent" />
                    </motion.div>
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
                        <motion.div 
                          key={i}
                          whileHover={{ x: 4 }}
                          className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                            item.popular 
                              ? "bg-primary/10 border border-primary/30 hover:bg-primary/15" 
                              : "bg-secondary/50 hover:bg-secondary border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">{item.qty}</span>
                            {item.popular && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Melhor valor</span>
                            )}
                          </div>
                          <span className="font-bold text-primary">{item.price}</span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-primary hover:opacity-90">Comprar Sessions</Button>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Upgrade License */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-r from-warning/10 via-warning/5 to-transparent border border-warning/30 rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-14 h-14 bg-warning/20 rounded-xl flex items-center justify-center"
                      >
                        <Shield className="w-7 h-7 text-warning" />
                      </motion.div>
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
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="lg" className="bg-warning hover:bg-warning/90 text-warning-foreground">Ver Planos</Button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "configuracoes" && (
              <motion.div
                key="configuracoes"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                <motion.div variants={fadeInUp}>
                  <h1 className="text-2xl font-display font-bold text-foreground">Configurações</h1>
                  <p className="text-muted-foreground mt-1">Gerencie sua conta</p>
                </motion.div>

                <motion.div 
                  variants={fadeInUp}
                  className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden"
                >
                  {[
                    { label: "Perfil", desc: "Editar nome, email e foto", icon: User },
                    { label: "Segurança", desc: "Senha e autenticação", icon: Shield },
                    { label: "Notificações", desc: "Preferências de alertas", icon: MessageCircle },
                    { label: "Faturamento", desc: "Histórico de pagamentos", icon: CreditCard },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ backgroundColor: "hsl(var(--secondary) / 0.3)", x: 4 }}
                      className="flex items-center justify-between p-5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Zona de Perigo</p>
                      <p className="text-sm text-muted-foreground mt-1">Excluir conta permanentemente</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        Excluir Conta
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "ajuda" && (
              <motion.div
                key="ajuda"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                <motion.div variants={fadeInUp}>
                  <h1 className="text-2xl font-display font-bold text-foreground">Central de Ajuda</h1>
                  <p className="text-muted-foreground mt-1">Tire suas dúvidas</p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "Documentação", desc: "Guias e tutoriais completos", icon: ExternalLink },
                    { title: "FAQ", desc: "Perguntas frequentes", icon: HelpCircle },
                    { title: "Suporte", desc: "Fale com nossa equipe", icon: MessageCircle },
                    { title: "Comunidade", desc: "Grupo no Telegram", icon: Phone },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      variants={fadeInUp}
                      whileHover={{ y: -4, x: 4 }}
                      className="bg-card border border-border rounded-xl p-5 cursor-pointer transition-shadow hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          whileHover={{ rotate: 10 }}
                          className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center"
                        >
                          <item.icon className="w-6 h-6 text-primary" />
                        </motion.div>
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-foreground">Precisa de ajuda urgente?</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Nossa equipe responde em até 2 horas
                      </p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                        <MessageCircle className="w-4 h-4" />
                        Abrir Chamado
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "perfil" && (
              <motion.div
                key="perfil"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                <motion.div variants={fadeInUp}>
                  <h1 className="text-2xl font-display font-bold text-foreground">Meu Perfil</h1>
                  <p className="text-muted-foreground mt-1">Gerencie suas informações</p>
                </motion.div>

                <motion.div 
                  variants={fadeInUp}
                  className="bg-card border border-border rounded-2xl p-6 space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg">João Silva</h3>
                      <p className="text-muted-foreground">joao@email.com</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { label: "Nome completo", value: "João Silva" },
                      { label: "Email", value: "joao@email.com" },
                      { label: "Membro desde", value: "Dezembro 2024" },
                    ].map((item, i) => (
                      <div key={i} className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="text-foreground mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Editar Perfil
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
