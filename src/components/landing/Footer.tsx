import { motion } from "framer-motion";
import { Instagram, MessageCircle, Mail, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linkClass = "text-muted-foreground/80 hover:text-foreground transition-colors duration-200 text-xs sm:text-sm";
  const socialClass = "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200";

  return (
    <footer className="relative pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 border-t border-border/50">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-12 mb-10 sm:mb-16">
          
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <motion.div 
              className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={logo} 
                alt="DLG Connect" 
                className="w-7 h-7 sm:w-8 sm:h-8 invert opacity-90"
              />
              <span className="font-display font-semibold text-foreground/90 text-sm sm:text-base">DLG Connect</span>
            </motion.div>
            <p className="text-muted-foreground/70 text-xs sm:text-sm leading-relaxed max-w-xs mb-4 sm:mb-6">
              Automação inteligente para crescimento de grupos Telegram.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-2">
              <a 
                href="https://wa.me/5565996498222" 
                target="_blank" 
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a 
                href="https://instagram.com/dlgconnect" 
                target="_blank" 
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a 
                href="mailto:contato@dlgconnect.com" 
                className={socialClass}
                aria-label="E-mail"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-medium text-foreground/60 uppercase tracking-wider mb-3 sm:mb-4">Navegação</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li><a href="#features" className={linkClass}>Recursos</a></li>
              <li><a href="#pricing" className={linkClass}>Planos</a></li>
              <li><a href="#faq" className={linkClass}>FAQ</a></li>
              <li><Link to="/comprar" className={linkClass}>Comprar</Link></li>
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-medium text-foreground/60 uppercase tracking-wider mb-3 sm:mb-4">Conta</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li><Link to="/login" className={linkClass}>Entrar</Link></li>
              <li><Link to="/dashboard" className={linkClass}>Dashboard</Link></li>
              <li><Link to="/recuperar-senha" className={linkClass}>Recuperar Senha</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[10px] sm:text-xs font-medium text-foreground/60 uppercase tracking-wider mb-3 sm:mb-4">Legal</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li><Link to="/politica-privacidade" className={linkClass}>Privacidade</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 sm:pt-6 border-t border-border/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <p className="text-muted-foreground/60 text-[10px] sm:text-xs">
              © {currentYear} DLG Connect
            </p>
            <p className="text-muted-foreground/60 text-[10px] sm:text-xs flex items-center gap-1">
              por{" "}
              <a 
                href="https://wa.me/5565996498222" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors inline-flex items-center gap-0.5 font-medium"
              >
                Kauan Hup
                <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
