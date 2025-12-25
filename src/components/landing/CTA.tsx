import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTA = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-card" ref={ref}>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div 
          className="max-w-2xl mx-auto text-center px-2"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        >
          <motion.h2 
            className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.08 }}
          >
            Pronto para escalar?
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            Junte-se a milhares de usuários que já estão crescendo seus grupos 
            com automação inteligente.
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center px-2 sm:px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.12 }}
          >
            <Link to="/comprar" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto sm:min-w-[220px] h-11 sm:h-12 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
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
