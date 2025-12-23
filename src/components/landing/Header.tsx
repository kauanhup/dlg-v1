import { useState, useEffect } from "react";
import { Home, Layers, CreditCard, HelpCircle, LogIn, ShoppingCart, Download } from "lucide-react";
import { AnimeNavBar } from "@/components/ui/anime-navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Header = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [downloadEnabled, setDownloadEnabled] = useState(true);

  useEffect(() => {
    const fetchBotConfig = async () => {
      try {
        // Check if download is enabled
        const { data: settingData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'allow_bot_download')
          .maybeSingle();
        
        if (settingData) {
          setDownloadEnabled(settingData.value === 'true');
        }

        const { data, error } = await supabase
          .from('bot_files')
          .select('file_path')
          .eq('is_active', true)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFilePath(data.file_path);
        }
      } catch {
        // Silent fail
      }
    };

    fetchBotConfig();
  }, []);

  const handleDownload = async () => {
    if (!downloadEnabled) {
      toast.error("Downloads temporariamente desabilitados");
      return;
    }
    
    if (!filePath) {
      toast.error("Bot não disponível no momento");
      return;
    }
    
    const { data, error } = await supabase.storage
      .from('bot-files')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (error || !data?.signedUrl) {
      toast.error("Erro ao gerar link de download. Faça login primeiro.");
      return;
    }
    
    window.location.href = data.signedUrl;
  };

  const navItems = [
    { name: "Início", url: "/", icon: Home },
    { name: "Recursos", url: "#features", icon: Layers },
    { name: "Planos", url: "#pricing", icon: CreditCard },
    { name: "FAQ", url: "#faq", icon: HelpCircle },
    { name: "Entrar", url: "/login", icon: LogIn, isPage: true },
    { name: "Download", url: "#", icon: Download, isPage: true, onClick: handleDownload },
    { name: "Comprar", url: "/comprar", icon: ShoppingCart, isPage: true },
  ];

  return <AnimeNavBar items={navItems} defaultActive="Início" />;
};

export default Header;
