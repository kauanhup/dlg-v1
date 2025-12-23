import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// GPU-optimized easing
const gpuEase = [0.33, 1, 0.68, 1] as const;

const CTA = () => {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          style={{ willChange: "transform, opacity" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.3, ease: gpuEase }}
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
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.25, ease: gpuEase }}
          >
            <Link to="/comprar" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto sm:min-w-[200px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
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
