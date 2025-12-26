import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";
import { useRef } from "react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "-50px" });
  
  const videoUrl = "";

  return (
    <section id="features" className="py-12 sm:py-20 lg:py-28 bg-background" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 px-2"
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
        >
          <motion.p
            className="text-primary text-xs sm:text-sm font-medium mb-2 sm:mb-3"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1, ease }}
          >
            Demonstração
          </motion.p>
          <motion.h2 
            className="text-2xl xs:text-3xl sm:text-4xl font-display font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15, ease }}
          >
            Conheça o Bot
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2, ease }}
          >
            Veja como o bot funciona na prática e descubra todo seu potencial.
          </motion.p>
        </motion.div>

        <motion.div
          className="w-full max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.25, ease }}
        >
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/10 group">
            {videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
                <motion.div
                  className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 cursor-pointer transition-all duration-200 hover:bg-primary/20 hover:scale-105 active:scale-95"
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-8 h-8 text-primary ml-1" />
                </motion.div>
                <p className="text-muted-foreground text-sm">Vídeo em breve</p>
              </div>
            )}
            
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl -z-10 opacity-40" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
