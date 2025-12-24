import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTA = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-card via-background to-background" ref={ref}>
      {/* Smooth top transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-card to-transparent pointer-events-none" />
      
      {/* Background glow - centered and subtle */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/8 rounded-full blur-[100px]" />
      </motion.div>
      
      {/* Smooth bottom transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        >

          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.08 }}
          >
            Pronto para escalar?
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground mb-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            Junte-se a milhares de usuários que já estão crescendo seus grupos 
            com automação inteligente.
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.12 }}
          >
            <Link to="/comprar" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto sm:min-w-[220px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
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
