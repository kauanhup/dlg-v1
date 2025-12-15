import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Pronto para escalar?
          </h2>
          
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Junte-se a milhares de usuários que já estão crescendo seus grupos 
            com automação inteligente.
          </p>
          
          <motion.div 
            className="flex items-center justify-center px-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link to="/comprar" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;