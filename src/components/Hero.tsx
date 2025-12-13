import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import AnimatedShaderBackground from "./ui/animated-shader-background";
import { AnimatedText } from "./ui/animated-shiny-text";

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 fade-in-delay-1 leading-[1.1]">
            Escale seus grupos com{" "}
            <AnimatedText 
              text="automação inteligente"
              textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold"
              gradientColors="linear-gradient(90deg, hsl(var(--primary)), hsl(var(--foreground)), hsl(var(--primary)))"
              className="inline-block"
            />
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 sm:mb-10 fade-in-delay-2 px-2">
            Gerencie múltiplas contas, extraia e transfira membros automaticamente. 
            Sistema completo para crescer com segurança.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 fade-in-delay-3 px-4">
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
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
