import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { AnimatedText } from "@/components/ui/animated-shiny-text";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-36 md:pb-24 relative overflow-hidden min-h-[80vh] flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">

          {/* Title */}
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Escale seus grupos com{" "}
            <AnimatedText 
              text="automação inteligente"
              textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight"
              gradientColors="linear-gradient(90deg, hsl(var(--primary)), hsl(var(--foreground)), hsl(var(--primary)))"
            />
          </motion.h1>

          {/* Description */}
          <motion.p 
            className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 sm:mb-10 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Gerencie múltiplas contas, extraia e transfira membros automaticamente. 
            Sistema completo para crescer com segurança.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link to="/comprar" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto sm:min-w-[180px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto sm:min-w-[180px] h-12">
                Já tenho licença
              </Button>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;