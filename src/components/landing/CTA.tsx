import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { gpuEase, bounceEase } from "@/hooks/useScrollAnimation";

const CTA = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-card" ref={ref}>
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none"
        animate={{ 
          background: [
            "radial-gradient(ellipse at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div 
          className="max-w-2xl mx-auto text-center px-2"
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.7, ease: gpuEase }}
        >
          <motion.h2 
            className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: gpuEase }}
          >
            Pronto para escalar?
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: gpuEase }}
          >
            Junte-se a milhares de usuários que já estão crescendo seus grupos 
            com automação inteligente.
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center px-2 sm:px-4"
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: bounceEase }}
          >
            <Link to="/comprar" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto sm:min-w-[220px] h-11 sm:h-12 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-primary/25"
                >
                  Começar Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
