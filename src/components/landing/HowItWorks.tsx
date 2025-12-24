import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Download, ChevronLeft, ChevronRight, Monitor, Smartphone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Import images from assets
import botDashboard1 from "@/assets/bot-dashboard-1.png";
import botDashboard2 from "@/assets/bot-dashboard-2.png";
import botDashboard3 from "@/assets/bot-dashboard-3.png";

const screenshots = [
  {
    title: "Dashboard Principal",
    description: "Visão geral de todas as suas contas e métricas em tempo real.",
    image: botDashboard1,
    icon: Monitor,
  },
  {
    title: "Central de Ações",
    description: "Gerencie extrações, adições e automações de forma intuitiva.",
    image: botDashboard2,
    icon: Settings,
  },
  {
    title: "Gerenciamento de Contas",
    description: "Controle total sobre suas sessions e saúde das contas.",
    image: botDashboard3,
    icon: Smartphone,
  },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.1,
    margin: "-50px"
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
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
        // Check for active license
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <section id="download" className="py-20 sm:py-28 bg-gradient-to-b from-background via-background to-primary/5 overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="text-primary text-sm font-medium mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Conheça a Interface
          </motion.p>
          <motion.h2 
            className="text-3xl sm:text-4xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Veja o Bot em Ação
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Interface moderna e intuitiva para gerenciar todas as suas automações.
          </motion.p>
        </motion.div>

        {/* Screenshot Carousel */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm shadow-2xl shadow-primary/10">
              <motion.img 
                key={currentIndex}
                src={screenshots[currentIndex].image} 
                alt={screenshots[currentIndex].title}
                className="w-full h-auto object-cover"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Overlay with info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent p-6">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const IconComponent = screenshots[currentIndex].icon;
                    return (
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                    );
                  })()}
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    {screenshots[currentIndex].title}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {screenshots[currentIndex].description}
                </p>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-3xl blur-2xl -z-10 opacity-50" />
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-border backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-border backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Download Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
          >
            <Download className="w-5 h-5 mr-2" />
            {isLoading ? "Baixando..." : isLoggedIn && hasLicense ? "Baixar Bot" : "Baixar Bot"}
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
