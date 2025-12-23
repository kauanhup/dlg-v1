import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { TypewriterText } from "@/components/ui/typewriter-text";

// GPU-optimized easing
const gpuEase = [0.33, 1, 0.68, 1] as const;

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedShaderBackground className="w-full h-full" />
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background z-[1]" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: gpuEase }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Automação Profissional</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 sm:mb-8 leading-[1.1]"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: gpuEase }}
          >
            <span className="block text-foreground">Cresça no Telegram</span>
            <span className="block mt-2">
              <span className="text-foreground">com </span>
              <TypewriterText 
                texts={["segurança", "rapidez", "inteligência"]}
                typingSpeed={80}
                deletingSpeed={40}
                pauseTime={2500}
                className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: gpuEase }}
          >
            Sistema profissional de automação para Telegram. 
            Extraia e adicione membros com delays inteligentes e proteção anti-ban.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: gpuEase }}
          >
            <Link to="/comprar">
              <Button 
                size="lg" 
                className="min-w-[200px] h-14 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="min-w-[200px] h-14 text-base border-border/50 hover:bg-card hover:border-border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Já tenho licença
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="mt-16 sm:mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            style={{ willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: gpuEase }}
          >
            {[
              { value: "10K+", label: "Usuários" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Suporte" },
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1, ease: gpuEase }}
              >
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div 
            className="w-1 h-2 rounded-full bg-muted-foreground/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
