import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { HeroVisual } from "./HeroVisual";

// GPU-optimized easing - SaaS standard
const gpuEase = [0.25, 0.1, 0.25, 1] as const;

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 -z-10">
        {/* Main gradient - deep blue tint */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.12), transparent 50%),
              linear-gradient(180deg, hsl(222 47% 4%) 0%, hsl(222 47% 2%) 50%, hsl(222 47% 4%) 100%)
            `
          }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      {/* Bottom decorative glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.08), transparent 70%)',
          filter: 'blur(60px)'
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: gpuEase }}
              className="mb-6 sm:mb-8"
            >
              <span className="badge-glow">
                <span className="ping-dot" />
                Automação Profissional para Telegram
              </span>
            </motion.div>

            {/* Title with gradient */}
            <motion.h1
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight mb-4 sm:mb-6 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: gpuEase }}
            >
              Cresça no Telegram com{" "}
              <TypewriterText 
                texts={["segurança", "rapidez", "inteligência"]}
                typingSpeed={80}
                deletingSpeed={40}
                pauseTime={2500}
                className="bg-gradient-to-r from-primary via-[hsl(187,85%,50%)] to-primary bg-clip-text text-transparent inline-block"
              />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: gpuEase }}
            >
              Adicione membros, extraia usuários e gerencie seus grupos com o sistema mais completo do mercado.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: gpuEase }}
            >
              <Link to="/comprar" className="w-full xs:w-auto">
                <Button 
                  size="lg" 
                  className="w-full xs:w-auto min-w-[180px] sm:min-w-[200px] h-12 sm:h-14 text-sm sm:text-base font-semibold btn-primary-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Começar Agora
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login" className="w-full xs:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full xs:w-auto min-w-[180px] sm:min-w-[200px] h-12 sm:h-14 text-sm sm:text-base font-semibold border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Já tenho licença
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right side - Visual */}
          <motion.div
            className="relative hidden sm:block lg:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: gpuEase }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;