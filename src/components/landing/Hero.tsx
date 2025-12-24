import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { HeroVisual } from "./HeroVisual";
import { RetroGrid } from "@/components/ui/retro-grid";

const gpuEase = [0.33, 1, 0.68, 1] as const;

const Hero = () => {
  return (
    <section className="pt-20 pb-8 sm:pt-24 sm:pb-12 md:pt-28 md:pb-16 lg:pb-20 relative overflow-hidden min-h-[80vh] sm:min-h-[85vh] flex items-center">
      {/* Premium background */}
      <div className="absolute inset-0 z-0 bg-background">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] right-[-15%] w-[500px] h-[500px] bg-gradient-to-bl from-primary/15 via-primary/3 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
      </div>
      
      {/* Retro Grid */}
      <RetroGrid angle={75} />
      
      {/* Top fade overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-[1]" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            {/* Title */}
            <motion.h1
              className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight mb-5 sm:mb-6 leading-[1.15]"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: gpuEase }}
            >
              <span className="text-foreground">Cresça no Telegram</span>
              <br />
              <span className="text-foreground">com </span>
              <TypewriterText 
                texts={["segurança", "rapidez", "inteligência"]}
                typingSpeed={80}
                deletingSpeed={40}
                pauseTime={2500}
              />
            </motion.h1>

            {/* Subtitle - improved */}
            <motion.p
              className="text-sm sm:text-base md:text-lg text-muted-foreground/90 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: gpuEase }}
            >
              <span className="text-foreground/80 font-medium">Automação profissional</span> para Telegram.
              <br className="hidden sm:block" />
              {" "}Sem gambiarra. Sem scripts quebrados. Sem risco.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.15, ease: gpuEase }}
            >
              <Link to="/comprar" className="w-full xs:w-auto">
                <Button 
                  size="lg" 
                  className="w-full xs:w-auto min-w-[160px] sm:min-w-[180px] h-11 sm:h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Começar Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login" className="w-full xs:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full xs:w-auto min-w-[160px] sm:min-w-[180px] h-11 sm:h-12 text-sm sm:text-base font-medium hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Já tenho licença
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right side - Visual */}
          <motion.div
            className="relative hidden sm:block lg:mt-0"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1, ease: gpuEase }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
