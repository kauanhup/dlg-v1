import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { HeroVisual } from "./HeroVisual";

// Smooth easing curve for buttery animations
const smoothEase = [0.22, 1, 0.36, 1] as const;

const Hero = () => {
  return (
    <section className="pt-20 pb-8 sm:pt-24 sm:pb-12 md:pt-28 md:pb-16 lg:pb-20 relative overflow-hidden min-h-[80vh] sm:min-h-[85vh] flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Title */}
            <motion.h1
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight mb-4 sm:mb-6 leading-tight sm:leading-normal"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: smoothEase }}
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
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.15, ease: smoothEase }}
            >
              Sem gambiarra. Sem scripts quebrados. Sem risco desnecessário.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.3, ease: smoothEase }}
            >
              <Link to="/comprar" className="w-full xs:w-auto">
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.25, ease: smoothEase }}
                >
                  <Button size="lg" className="w-full xs:w-auto min-w-[160px] sm:min-w-[180px] h-10 sm:h-12 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300">
                    Começar Agora
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2" />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
              <Link to="/login" className="w-full xs:w-auto">
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.25, ease: smoothEase }}
                >
                  <Button variant="outline" size="lg" className="w-full xs:w-auto min-w-[160px] sm:min-w-[180px] h-10 sm:h-12 text-sm sm:text-base hover:shadow-lg transition-all duration-300">
                    Já tenho licença
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right side - Visual */}
          <motion.div
            className="relative mt-4 sm:mt-6 lg:mt-0 order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.92, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.4, ease: smoothEase }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
