import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";
import { useRef } from "react";
import { gpuEase, bounceEase } from "@/hooks/useScrollAnimation";

const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.2,
    margin: "-50px"
  });
  
  const videoUrl = "";

  return (
    <section id="features" className="py-12 sm:py-20 lg:py-28 bg-background" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 px-2"
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, ease: gpuEase }}
        >
          <motion.p
            className="text-primary text-xs sm:text-sm font-medium mb-2 sm:mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1, ease: bounceEase }}
          >
            Demonstração
          </motion.p>
          <motion.h2 
            className="text-2xl xs:text-3xl sm:text-4xl font-display font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: gpuEase }}
          >
            Conheça o Bot
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: gpuEase }}
          >
            Veja como o bot funciona na prática e descubra todo seu potencial.
          </motion.p>
        </motion.div>

        <motion.div
          className="w-full max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.7, rotateX: 15 }}
          animate={isInView ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25, ease: gpuEase }}
          style={{ perspective: 1200 }}
        >
          <motion.div 
            className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/10 group"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
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
                  className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 cursor-pointer"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.5, duration: 0.5, ease: bounceEase }}
                  whileHover={{ scale: 1.15, boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-8 h-8 text-primary ml-1" />
                </motion.div>
                <motion.p 
                  className="text-muted-foreground text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  Vídeo em breve
                </motion.p>
              </div>
            )}
            
            {/* Animated glow effect */}
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl -z-10"
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
