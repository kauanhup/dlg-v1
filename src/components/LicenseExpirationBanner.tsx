import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LicenseExpirationBannerProps {
  licenseInfo: {
    status: string;
    daysLeft: number;
    expiresAt: string | null;
    planName: string;
  } | null;
  onDismiss?: () => void;
  dismissed?: boolean;
}

export const LicenseExpirationBanner = ({ 
  licenseInfo, 
  onDismiss,
  dismissed = false
}: LicenseExpirationBannerProps) => {
  const navigate = useNavigate();

  const bannerConfig = useMemo(() => {
    if (!licenseInfo || licenseInfo.status !== 'active') return null;
    
    const daysLeft = licenseInfo.daysLeft;
    
    // Only show banner if 7 days or less
    if (daysLeft > 7) return null;
    
    if (daysLeft <= 0) {
      return {
        variant: 'critical' as const,
        icon: AlertTriangle,
        title: 'Licença Expirada!',
        message: 'Sua licença expirou. Renove agora para continuar usando o sistema.',
        bgClass: 'bg-destructive/15 border-destructive/30',
        iconClass: 'text-destructive',
        titleClass: 'text-destructive',
      };
    }
    
    if (daysLeft === 1) {
      return {
        variant: 'urgent' as const,
        icon: AlertTriangle,
        title: 'Expira AMANHÃ!',
        message: 'Sua licença expira amanhã. Renove agora para não perder acesso.',
        bgClass: 'bg-destructive/10 border-destructive/20',
        iconClass: 'text-destructive',
        titleClass: 'text-destructive',
      };
    }
    
    if (daysLeft <= 3) {
      return {
        variant: 'warning' as const,
        icon: Clock,
        title: `Expira em ${daysLeft} dias`,
        message: 'Sua licença está prestes a expirar. Renove para evitar interrupções.',
        bgClass: 'bg-warning/10 border-warning/20',
        iconClass: 'text-warning',
        titleClass: 'text-warning',
      };
    }
    
    // 4-7 days
    return {
      variant: 'info' as const,
      icon: Clock,
      title: `Expira em ${daysLeft} dias`,
      message: 'Lembrete: sua licença expira em breve.',
      bgClass: 'bg-primary/10 border-primary/20',
      iconClass: 'text-primary',
      titleClass: 'text-primary',
    };
  }, [licenseInfo]);

  if (!bannerConfig || dismissed) return null;

  const IconComponent = bannerConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "border rounded-lg p-4 mb-4",
          bannerConfig.bgClass
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5", bannerConfig.iconClass)}>
            <IconComponent className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn("font-semibold text-sm", bannerConfig.titleClass)}>
                {bannerConfig.title}
              </h3>
              <span className="text-xs text-muted-foreground">
                ({licenseInfo?.planName})
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {bannerConfig.message}
            </p>
            {licenseInfo?.expiresAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Data de expiração: {new Date(licenseInfo.expiresAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => navigate('/comprar')}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Renovar
            </Button>
            
            {onDismiss && bannerConfig.variant !== 'critical' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-8 w-8 p-0"
                aria-label="Fechar aviso"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LicenseExpirationBanner;
