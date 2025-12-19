import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <motion.footer 
      className="py-12 border-t border-border"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <img 
            src={logo} 
            alt="DLG Connect" 
            className="w-12 h-12 invert opacity-60"
          />
          
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