import { useState, useEffect } from "react";
import { Home, Layers, CreditCard, HelpCircle, LogIn, ShoppingCart, Download } from "lucide-react";
import { AnimeNavBar } from "@/components/ui/anime-navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Header = () => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBotFile = async () => {
      try {
        const { data, error } = await supabase
          .from('bot_files')
          .select('file_path')
          .eq('is_active', true)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const { data: urlData } = supabase.storage
            .from('bot-files')
            .getPublicUrl(data.file_path);
          setDownloadUrl(urlData.publicUrl);
        }
      } catch (error) {
        console.error('Error fetching bot file:', error);
      }
    };

    fetchBotFile();
  }, []);

  const handleDownload = () => {
    if (!downloadUrl) {
      toast.error("Bot não disponível no momento");
      return;
    }
    window.location.href = downloadUrl;
  };

  const navItems = [
    { name: "Início", url: "/", icon: Home },
    { name: "Recursos", url: "#features", icon: Layers },
    { name: "Preços", url: "#pricing", icon: CreditCard },
    { name: "FAQ", url: "#faq", icon: HelpCircle },
    { name: "Entrar", url: "/login", icon: LogIn, isPage: true },
    { name: "Download", url: "#", icon: Download, isPage: true, onClick: handleDownload },
    { name: "Comprar", url: "/comprar", icon: ShoppingCart, isPage: true },
  ];

  return <AnimeNavBar items={navItems} defaultActive="Início" />;
};

export default Header;
