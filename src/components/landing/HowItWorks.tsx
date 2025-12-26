import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Download, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBotDownload } from "@/hooks/useBotDownload";
import { TUTORIAL_STEPS, YOUTUBE_TUTORIAL_URL } from "@/lib/landing/constants";
import { gpuEase, bounceEase } from "@/hooks/useScrollAnimation";

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
        {/* Header with blur-in effect */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 px-2"
          initial={{ opacity: 0, filter: "blur(10px)", y: 30 }}
          animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.6, ease: gpuEase }}
        >
          <motion.h2 
            className="text-2xl xs:text-3xl sm:text-4xl font-display font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: gpuEase }}
          >
            Simples de Usar
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: gpuEase }}
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
              initial={{ 
                opacity: 0, 
                x: index % 2 === 0 ? -80 : 80,
                rotateY: index % 2 === 0 ? -15 : 15
              }}
              animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: 0.2 + (index * 0.15),
                ease: gpuEase
              }}
              style={{ perspective: 1000 }}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left px-2 sm:px-0">
                <motion.span 
                  className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-display font-bold bg-gradient-to-b from-primary/30 to-transparent bg-clip-text text-transparent mb-4 sm:mb-6 inline-block"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + (index * 0.15), duration: 0.5, ease: bounceEase }}
                >
                  {step.step}
                </motion.span>
                <h3 className="text-xl xs:text-2xl sm:text-3xl font-display font-semibold mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {step.description}
                </p>
                
                {/* Tutorial Button */}
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + (index * 0.15), duration: 0.4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
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
                </motion.div>
              </div>

              {/* Image with zoom-in and flip effect */}
              <div className="flex-1 w-full flex justify-center">
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.7, rotateY: index % 2 === 0 ? 20 : -20 }}
                  animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
                  transition={{ delay: 0.3 + (index * 0.15), duration: 0.7, ease: gpuEase }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  style={{ perspective: 1000 }}
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
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out z-10 pointer-events-none" />
                    
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
                    animate={{ y: [-2, 4, -2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-500/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    animate={{ y: [2, -4, 2] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Download Button with scale-bounce */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6, ease: bounceEase }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
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
          </motion.div>
          <motion.p 
            className="text-muted-foreground text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            {getDownloadMessage()}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
