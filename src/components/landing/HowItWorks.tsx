import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Download, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBotDownload } from "@/hooks/useBotDownload";
import { TUTORIAL_STEPS, YOUTUBE_TUTORIAL_URL } from "@/lib/landing/constants";

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.1,
    margin: "-50px"
  });
  
  const { isLoading, handleDownload, getDownloadMessage } = useBotDownload();

  const openTutorial = () => {
    window.open(YOUTUBE_TUTORIAL_URL, '_blank');
  };

  return (
    <section id="download" className="py-12 sm:py-20 lg:py-28 bg-gradient-to-b from-background via-background to-primary/5 overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 px-2"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        >
          <motion.h2 
            className="text-2xl xs:text-3xl sm:text-4xl font-display font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.05, ease: [0.33, 1, 0.68, 1] }}
          >
            Simples de Usar
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.08, ease: [0.33, 1, 0.68, 1] }}
          >
            Em apenas 3 passos você configura e começa a automatizar seu Telegram.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid gap-10 sm:gap-16 lg:gap-20 mb-10 sm:mb-16">
          {TUTORIAL_STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-6 sm:gap-8 lg:gap-16 items-center`}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.35, 
                delay: 0.1 + (index * 0.08),
                ease: [0.33, 1, 0.68, 1]
              }}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left px-2 sm:px-0">
                <span className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-display font-bold bg-gradient-to-b from-primary/30 to-transparent bg-clip-text text-transparent mb-4 sm:mb-6">
                  {step.step}
                </span>
                <h3 className="text-xl xs:text-2xl sm:text-3xl font-display font-semibold mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {step.description}
                </p>
                
                {/* Tutorial Button */}
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.15 + (index * 0.08), duration: 0.25 }}
                >
                  <Button
                    variant="outline"
                    onClick={openTutorial}
                    className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                  >
                    <Play className="w-4 h-4" />
                    Ver Tutorial
                    <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                  </Button>
                </motion.div>
              </div>

              {/* Image with effects */}
              <div className="flex-1 w-full flex justify-center">
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                >
                  {/* Outer glow */}
                  <motion.div 
                    className="absolute -inset-2 bg-gradient-to-r from-primary/50 via-blue-500/40 to-purple-500/50 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-300"
                    animate={{ 
                      background: [
                        "linear-gradient(90deg, hsl(var(--primary) / 0.5), hsl(217 91% 60% / 0.4), hsl(270 70% 60% / 0.5))",
                        "linear-gradient(180deg, hsl(270 70% 60% / 0.5), hsl(var(--primary) / 0.5), hsl(217 91% 60% / 0.4))",
                        "linear-gradient(270deg, hsl(217 91% 60% / 0.4), hsl(270 70% 60% / 0.5), hsl(var(--primary) / 0.5))",
                        "linear-gradient(90deg, hsl(var(--primary) / 0.5), hsl(217 91% 60% / 0.4), hsl(270 70% 60% / 0.5))"
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Inner glow */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-blue-500/20 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Image container */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/20 group-hover:border-primary/40 shadow-2xl shadow-black/60 transition-all duration-200">
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out z-10 pointer-events-none" />
                    
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full max-w-xl h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    
                    {/* Top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    
                    {/* Bottom gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-500/20 to-transparent pointer-events-none" />
                  </div>
                  
                  {/* Floating particles on hover */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-500/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    animate={{ y: [2, -2, 2] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Download Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.35, ease: [0.33, 1, 0.68, 1] }}
        >
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
          >
            <Download className="w-5 h-5 mr-2" />
            {isLoading ? "Baixando..." : "Baixar Bot"}
          </Button>
          <p className="text-muted-foreground text-sm mt-4">
            {getDownloadMessage()}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
