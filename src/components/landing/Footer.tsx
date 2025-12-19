import { motion } from "framer-motion";
import { Instagram, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="pt-16 pb-8 border-t border-border bg-background/50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logo} 
                alt="DLG Connect" 
                className="w-10 h-10 invert"
              />
              <span className="font-display font-bold text-lg">DLG Connect</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sistema de automação avançado para crescimento de grupos Telegram com segurança e eficiência.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Links Rápidos</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Planos
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <Link to="/comprar" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Comprar
                </Link>
              </li>
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Conta</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/recuperar-senha" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Recuperar Senha
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://wa.me/5565996498222" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/dlgconnect" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contato@dlgconnect.com" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  E-mail
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} DLG Connect. Todos os direitos reservados.
            </p>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              Desenvolvido por{" "}
              <a 
                href="https://wa.me/5565996498222" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-colors inline-flex items-center gap-1"
              >
                Kauan Hup
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;