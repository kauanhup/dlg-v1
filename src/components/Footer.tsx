import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer 
      className="py-8 border-t border-border"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <p className="text-muted-foreground text-sm text-center">
          © 2025 SWEXTRATOR. Criado por{" "}
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
    </motion.footer>
  );
};

export default Footer;
