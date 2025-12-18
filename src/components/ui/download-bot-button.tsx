import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DownloadBotButtonProps {
  className?: string;
}

const DownloadBotButton = ({ className }: DownloadBotButtonProps) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotFile();
  }, []);

  const handleDownload = () => {
    if (!downloadUrl) {
      toast.error("Bot não disponível no momento");
      return;
    }
    window.open(downloadUrl, '_blank');
  };

  return (
    <motion.button
      onClick={handleDownload}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading}
      className={cn(
        "cursor-pointer group relative inline-flex items-center gap-2 px-6 py-3 bg-foreground/90 text-background rounded-3xl hover:bg-foreground/80 transition-all duration-200 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="w-5 h-5"
      >
        <path
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12"
        />
      </svg>
      Baixar Bot
      <div className="absolute opacity-0 -bottom-10 rounded-md py-1.5 px-3 bg-foreground/90 text-background text-xs left-1/2 -translate-x-1/2 group-hover:opacity-100 transition-opacity duration-200 shadow-lg whitespace-nowrap pointer-events-none">
        DLGConnect.exe
      </div>
    </motion.button>
  );
};

export { DownloadBotButton };
