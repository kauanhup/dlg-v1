import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { HeroVisual } from "./HeroVisual";

// GPU-optimized easing
const gpuEase = [0.33, 1, 0.68, 1] as const;

const Hero = () => {
  return (
    <section className="pt-20 pb-8 sm:pt-24 sm:pb-12 md:pt-28 md:pb-16 lg:pb-20 relative overflow-hidden min-h-[80vh] sm:min-h-[85vh] flex items-center">
      {/* Simple Gradient Light Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] opacity-40" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left side - Text content - Always first on mobile */}
          <div className="text-center lg:text-left">
            {/* Title */}
            <motion.h1
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight mb-4 sm:mb-6 leading-tight sm:leading-normal"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: gpuEase }}
            >
              Cresça no Telegram com{" "}
              <TypewriterText 
                texts={["segurança", "rapidez", "inteligência"]}
                typingSpeed={80}
                deletingSpeed={40}
                pauseTime={2500}
                className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent inline-block"
              />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground mb-5 sm:mb-6 max-w-md mx-auto lg:mx-0"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: gpuEase }}
            >
              Sem gambiarra. Sem scripts quebrados. Sem risco desnecessário.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 md:gap-4"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: gpuEase }}
            >
              <Link to="/comprar" className="w-full xs:w-auto">
                <Button 
                  size="lg" 
                  className="w-full xs:w-auto min-w-[160px] sm:min-w-[180px] h-10 sm:h-12 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Começar Agora
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login" className="w-full xs:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full xs:w-auto min-w-[160px] sm:min-w-[180px] h-10 sm:h-12 text-sm sm:text-base hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Já tenho licença
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right side - Visual - Below text on mobile */}
          <motion.div
            className="relative hidden sm:block lg:mt-0"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: gpuEase }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
