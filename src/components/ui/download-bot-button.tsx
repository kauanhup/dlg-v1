import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DownloadBotButtonProps {
  className?: string;
}

const DownloadBotButton = ({ className }: DownloadBotButtonProps) => {
  const handleDownload = () => {
    // TODO: Replace with actual download URL
    const downloadUrl = "/bot/SWEXTRACTOR.exe";
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "SWEXTRACTOR.exe";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.button
      onClick={handleDownload}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "cursor-pointer group relative inline-flex items-center gap-2 px-6 py-3 bg-foreground/90 text-background rounded-3xl hover:bg-foreground/80 transition-all duration-200 font-semibold shadow-md",
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
        SWEXTRACTOR.exe
      </div>
    </motion.button>
  );
};

export { DownloadBotButton };
