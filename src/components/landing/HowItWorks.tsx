import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Download, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBotDownload } from "@/hooks/useBotDownload";
import { TUTORIAL_STEPS, YOUTUBE_TUTORIAL_URL } from "@/lib/landing/constants";

const ease = [0.25, 0.1, 0.25, 1] as const;

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "-50px" });
  
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
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          <motion.h2 
            className="text-2xl xs:text-3xl sm:text-4xl font-display font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1, ease }}
          >
            Simples de Usar
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15, ease }}
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
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + (index * 0.1), ease }}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left px-2 sm:px-0">
                <span className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-display font-bold bg-gradient-to-b from-primary/30 to-transparent bg-clip-text text-transparent mb-4 sm:mb-6 inline-block">
                  {step.step}
                </span>
                <h3 className="text-xl xs:text-2xl sm:text-3xl font-display font-semibold mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {step.description}
                </p>
                
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={openTutorial}
                    className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4" />
                    Ver Tutorial
                    <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1 w-full flex justify-center">
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.2 + (index * 0.1), duration: 0.5, ease }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/40 via-blue-500/30 to-purple-500/40 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-blue-500/20 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  <div className="relative rounded-2xl overflow-hidden border border-white/20 group-hover:border-primary/40 shadow-2xl shadow-black/60 transition-all duration-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out z-10 pointer-events-none" />
                    
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full max-w-xl h-auto object-cover"
                      loading="lazy"
                    />
                    
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Download Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4, ease }}
        >
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
