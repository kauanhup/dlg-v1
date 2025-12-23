import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { PixelCursorTrail } from "@/components/ui/pixel-trail";
import { motion } from "framer-motion";
import { BotDashboardPreview } from "./BotPreviews";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-36 md:pb-24 relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>

      {/* Pixel Trail Effect */}
      <PixelCursorTrail />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            {/* Title */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Automação profissional para crescer no Telegram com{" "}
              <TypewriterText 
                texts={["segurança", "rapidez", "inteligência"]}
                typingSpeed={80}
                deletingSpeed={40}
                pauseTime={2500}
                className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
              />
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 sm:mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Gerencie múltiplas contas, extraia e transfira membros com limites inteligentes, delays seguros e controle total do processo.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
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

          {/* Right side - Bot Screenshot */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ perspective: "1000px" }}
          >
            <motion.div 
              className="relative"
              initial={{ rotateY: -8, rotateX: 5 }}
              animate={{ rotateY: 0, rotateX: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Subtle glow */}
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-[40px] blur-3xl opacity-50" />
              
              {/* Preview container with perspective */}
              <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)]">
                <BotDashboardPreview />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;