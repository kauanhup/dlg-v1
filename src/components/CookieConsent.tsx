import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const COOKIE_CONSENT_KEY = "dlg_cookie_consent";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const location = useLocation();

  // Only show on home page
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setShowBanner(false);
      return;
    }

    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isHomePage]);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  if (!isHomePage) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="fixed bottom-4 left-4 z-[9999] max-w-sm"
        >
          <div className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Usamos cookies para melhorar sua experiência.{" "}
                  <Link 
                    to="/politica-privacidade" 
                    className="text-primary hover:underline"
                  >
                    Saiba mais
                  </Link>
                </p>
                
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleDecline}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={handleAccept}
                    className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-md transition-colors"
                  >
                    Aceitar
                  </button>
                </div>
              </div>

              <button
                onClick={handleDecline}
                className="p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
