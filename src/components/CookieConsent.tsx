import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "dlg_cookie_consent";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Utilizamos cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Usamos cookies para melhorar sua experiência, analisar o tráfego do site e 
                    personalizar conteúdo. Ao continuar navegando, você concorda com nossa{" "}
                    <Link 
                      to="/politica-privacidade" 
                      className="text-primary hover:underline"
                    >
                      Política de Privacidade
                    </Link>.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecline}
                    className="flex-1 sm:flex-none"
                  >
                    Recusar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none"
                  >
                    Aceitar
                  </Button>
                </div>

                {/* Close button (mobile) */}
                <button
                  onClick={handleDecline}
                  className="absolute top-2 right-2 sm:hidden p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
