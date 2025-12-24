import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";
import { useRef } from "react";

// GPU-optimized easing
const gpuEase = [0.25, 0.1, 0.25, 1] as const;

const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.3
  });
  
  const videoUrl = "";

  return (
    <section id="features" className="py-24 sm:py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background" />
      
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: gpuEase }}
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4 tracking-tight">
            Conheça o Bot
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Veja como o bot funciona na prática e descubra todo seu potencial.
          </p>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1, ease: gpuEase }}
        >
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden glass-card">
            {videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
                <motion.div
                  className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 cursor-pointer hover:bg-primary/15 transition-colors"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Play className="w-8 h-8 text-primary ml-1" />
                </motion.div>
                <p className="text-muted-foreground text-sm">Vídeo em breve</p>
              </div>
            )}
            
            {/* Subtle glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-2xl blur-xl opacity-50 -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;