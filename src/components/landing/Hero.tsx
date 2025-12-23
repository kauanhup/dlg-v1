import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { AnimatedText } from "@/components/ui/animated-shiny-text";
import { motion } from "framer-motion";
import botDashboard1 from "@/assets/bot-dashboard-1.png";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-36 md:pb-24 relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>
      
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
              <AnimatedText 
                text="segurança"
                textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-display font-bold leading-tight"
                gradientColors="linear-gradient(90deg, hsl(var(--primary)), hsl(var(--foreground)), hsl(var(--primary)))"
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
            initial={{ opacity: 0, x: 40, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent rounded-3xl blur-2xl" />
              
              {/* Screenshot container */}
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={botDashboard1}
                  alt="DLG Connect Bot Dashboard"
                  className="w-full h-auto"
                  draggable={false}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                v2.0 PRO
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-card border border-border px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                100% Seguro
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;