import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { HeroVisual } from "./HeroVisual";
import { RetroGrid } from "@/components/ui/retro-grid";

const gpuEase = [0.33, 1, 0.68, 1] as const;
const bounceEase = [0.68, -0.55, 0.265, 1.55] as const;

const Hero = () => {
  return (
    <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 lg:pb-24 relative overflow-hidden min-h-[85vh] sm:min-h-[85vh] flex items-center">
      {/* Premium background */}
      <div className="absolute inset-0 z-0 bg-background">
        {/* Gradient orbs - smaller on mobile */}
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-[60px] sm:blur-[100px]"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[40%] right-[-15%] w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-gradient-to-bl from-primary/15 via-primary/3 to-transparent rounded-full blur-[80px] sm:blur-[120px]"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute bottom-[-10%] left-[30%] w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-[50px] sm:blur-[80px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
      </div>
      
      {/* Retro Grid */}
      <RetroGrid angle={75} />
      
      {/* Top fade overlay */}
      <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-background to-transparent z-[1]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 sm:gap-10 lg:gap-8 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left space-y-4 sm:space-y-6">
            {/* Title with blur-in effect */}
            <motion.h1
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-display tracking-[-0.03em] leading-[1.15] sm:leading-[1.2]"
              style={{ willChange: "transform, opacity, filter" }}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.1, ease: gpuEase }}
            >
              <span className="block bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent pb-1">
                Cresça no Telegram
              </span>
              <span className="block mt-1">
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">com </span>
                <TypewriterText 
                  texts={["segurança", "rapidez", "inteligência"]}
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseTime={2500}
                />
              </span>
            </motion.h1>

            {/* Subtitle with fade-up */}
            <motion.p
              className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground/80 max-w-md sm:max-w-lg mx-auto lg:mx-0 leading-[1.5] sm:leading-[1.6] font-medium tracking-[-0.01em] px-2 sm:px-0"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: gpuEase }}
            >
              Automação profissional para Telegram.{" "}
              <span className="text-foreground/90">Sem gambiarra. Sem risco.</span>
            </motion.p>

            {/* CTA Buttons with scale-bounce effect */}
            <motion.div 
              className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 px-4 sm:px-0"
              style={{ willChange: "transform, opacity" }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: bounceEase }}
            >
              <Link to="/comprar" className="w-full xs:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    size="lg" 
                    className="w-full xs:w-auto min-w-[140px] sm:min-w-[180px] h-10 sm:h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
                  >
                    Começar Agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/login" className="w-full xs:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full xs:w-auto min-w-[140px] sm:min-w-[180px] h-10 sm:h-12 text-sm sm:text-base font-medium hover:bg-muted/50 transition-all duration-200"
                  >
                    Já tenho licença
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right side - Visual with zoom-in effect */}
          <motion.div
            className="relative hidden sm:block lg:mt-0"
            style={{ willChange: "transform, opacity", perspective: 1000 }}
            initial={{ opacity: 0, scale: 0.7, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: gpuEase }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
