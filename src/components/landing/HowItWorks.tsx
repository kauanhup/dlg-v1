import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Download, Settings, Users, Send, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Import images from assets
import botDashboard1 from "@/assets/bot-dashboard-1.png";
import botDashboard2 from "@/assets/bot-dashboard-2.png";
import botDashboard3 from "@/assets/bot-dashboard-3.png";

const YOUTUBE_TUTORIAL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Link do tutorial

const steps = [
  {
    step: "01",
    title: "Configure o Bot",
    description: "Defina grupos alvo, configure delays inteligentes e ajuste as configurações de extração de membros.",
    icon: Settings,
    image: botDashboard1,
  },
  {
    step: "02",
    title: "Adicione suas Sessions",
    description: "Faça upload das suas contas Telegram para começar a automatizar. Suporte para múltiplas sessions simultâneas.",
    icon: Users,
    image: botDashboard2,
  },
  {
    step: "03",
    title: "Inicie a Automação",
    description: "Execute as ações e acompanhe o progresso em tempo real. Veja estatísticas e métricas detalhadas.",
    icon: Send,
    image: botDashboard3,
  },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.1,
    margin: "-50px"
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session) {
        const { data: license } = await supabase
          .from('licenses')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        setHasLicense(!!license);
      }
    };

    const fetchBotConfig = async () => {
      try {
        const { data: settingData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'allow_bot_download')
          .maybeSingle();
        
        if (settingData) {
          setDownloadEnabled(settingData.value === 'true');
        }

        const { data } = await supabase
          .from('bot_files')
          .select('file_path')
          .eq('is_active', true)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setFilePath(data.file_path);
        }
      } catch (error) {
        console.error('Failed to fetch bot config:', error);
        setDownloadEnabled(false);
      }
    };

    checkAuth();
    fetchBotConfig();
  }, []);

  const handleDownload = async () => {
    if (!isLoggedIn) {
      toast.info("Faça login para baixar o bot");
      navigate('/login');
      return;
    }

    if (!hasLicense) {
      toast.info("Você precisa de uma licença ativa para baixar o bot");
      navigate('/comprar');
      return;
    }

    if (!downloadEnabled) {
      toast.error("Downloads temporariamente desabilitados");
      return;
    }
    
    if (!filePath) {
      toast.error("Bot não disponível no momento");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.storage
        .from('bot-files')
        .createSignedUrl(filePath, 3600);
      
      if (error || !data?.signedUrl) {
        toast.error("Erro ao gerar link de download");
        return;
      }
      
      window.location.href = data.signedUrl;
      toast.success("Download iniciado!");
    } catch (error) {
      toast.error("Erro ao baixar o bot");
    } finally {
      setIsLoading(false);
    }
  };

  const openTutorial = () => {
    window.open(YOUTUBE_TUTORIAL_URL, '_blank');
  };

  return (
    <section id="download" className="py-20 sm:py-28 bg-gradient-to-b from-background via-background to-primary/5 overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Simples de Usar
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Em apenas 3 passos você configura e começa a automatizar seu Telegram.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid gap-16 lg:gap-20 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center`}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: 0.3 + (index * 0.2),
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-4 mb-6">
                  <span className="text-6xl sm:text-7xl font-display font-bold bg-gradient-to-b from-primary/30 to-transparent bg-clip-text text-transparent">
                    {step.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-semibold mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {step.description}
                </p>
                
                {/* Tutorial Button - Only on first step */}
                {index === 0 && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      variant="outline"
                      onClick={openTutorial}
                      className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Play className="w-4 h-4" />
                      Ver Tutorial
                      <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Image */}
              <div className="flex-1 w-full max-w-xl lg:max-w-lg">
                <motion.div 
                  className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm shadow-2xl shadow-primary/5 group"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Step badge */}
                  <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    Passo {step.step}
                  </div>
                  
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-3xl blur-2xl -z-10"
                    initial={{ opacity: 0.1 }}
                    whileHover={{ opacity: 0.4 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Download Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
          >
            <Download className="w-5 h-5 mr-2" />
            {isLoading ? "Baixando..." : "Baixar Bot"}
          </Button>
          <p className="text-muted-foreground text-sm mt-4">
            {!isLoggedIn 
              ? "Faça login e adquira uma licença para baixar" 
              : !hasLicense 
                ? "Adquira uma licença para ter acesso ao download"
                : "Clique para baixar a versão mais recente"}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
