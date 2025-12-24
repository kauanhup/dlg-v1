import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";
import { useRef } from "react";

const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.2,
    margin: "-50px"
  });
  
  const videoUrl = "";

  return (
    <section id="features" className="py-20 sm:py-28 bg-background" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        >
          <motion.p
            className="text-primary text-sm font-medium mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.05, ease: [0.33, 1, 0.68, 1] }}
          >
            Demonstração
          </motion.p>
          <motion.h2 
            className="text-3xl sm:text-4xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.08, ease: [0.33, 1, 0.68, 1] }}
          >
            Conheça o Bot
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.25, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
          >
            Veja como o bot funciona na prática e descubra todo seu potencial.
          </motion.p>
        </motion.div>

        <motion.div
          className="w-full max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.12, ease: [0.33, 1, 0.68, 1] }}
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
                  className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Play className="w-8 h-8 text-primary ml-1" />
                </motion.div>
                <p className="text-muted-foreground text-sm">Vídeo em breve</p>
              </div>
            )}
            
            {/* Hover glow effect */}
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl -z-10"
              initial={{ opacity: 0.3 }}
              whileHover={{ opacity: 0.6 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
