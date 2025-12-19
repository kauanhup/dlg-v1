import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <motion.footer 
      className="py-10 border-t border-border"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo + Social */}
          <div className="flex items-center gap-4">
            <img 
              src={logo} 
              alt="DLG Connect" 
              className="w-10 h-10 invert opacity-70"
            />
            <a
              href="https://instagram.com/dlgconnect"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
            >
              <Instagram className="w-5 h-5 text-foreground" />
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-muted-foreground text-sm text-center">
            © 2025 DLG Connect. Criado por{" "}
            <a 
              href="https://wa.me/5565996498222" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors"
            >
              Kauan Hup
            </a>
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;