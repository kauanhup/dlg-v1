import { 
  LayoutDashboard, 
  Smartphone, 
  Zap, 
  Shield,
  RotateCcw,
  Clock
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Completo",
    description: "Estatísticas em tempo real de contas ativas, em cooldown e banidas."
  },
  {
    icon: Smartphone,
    title: "Multi Contas",
    description: "Conecte múltiplas contas via session ou código de verificação."
  },
  {
    icon: Zap,
    title: "Automação Avançada",
    description: "Extração e transferência automática de membros entre grupos."
  },
  {
    icon: Clock,
    title: "Delay Customizável",
    description: "Configure intervalos personalizados para máxima segurança."
  },
  {
    icon: RotateCcw,
    title: "Rotação Automática",
    description: "Sistema inteligente de rotação para evitar banimentos."
  },
  {
    icon: Shield,
    title: "Proteção Total",
    description: "Limites de segurança e verificação de privacidade integrados."
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-primary text-sm font-medium mb-3">RECURSOS</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-muted-foreground">
            Ferramentas profissionais para gerenciar seu crescimento no Telegram.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;