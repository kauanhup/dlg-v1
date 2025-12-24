import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// GPU-optimized easing
const gpuEase = [0.25, 0.1, 0.25, 1] as const;

const CTA = () => {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, hsl(var(--primary) / 0.1), transparent 60%)'
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: gpuEase }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
            Pronto para escalar?
          </h2>
          
          <p className="text-muted-foreground text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Junte-se a milhares de usuários que já estão crescendo seus grupos 
            com automação inteligente.
          </p>
          
          <motion.div 
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1, ease: gpuEase }}
          >
            <Link to="/comprar">
              <Button 
                size="lg" 
                className="min-w-[220px] h-14 text-base font-semibold btn-primary-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;