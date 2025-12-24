import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBotDownload = () => {
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

  const getDownloadMessage = () => {
    if (!isLoggedIn) return "Faça login e adquira uma licença para baixar";
    if (!hasLicense) return "Adquira uma licença para ter acesso ao download";
    return "Clique para baixar a versão mais recente";
  };

  return {
    isLoggedIn,
    hasLicense,
    isLoading,
    handleDownload,
    getDownloadMessage,
  };
};
