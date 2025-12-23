import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";
import { useRef } from "react";

// GPU-optimized easing
const gpuEase = [0.33, 1, 0.68, 1] as const;

const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: false, 
    amount: 0.3,
    margin: "-60px 0px -60px 0px"
  });
  
  const videoUrl = "";

  return (
    <section id="features" className="py-20 sm:py-28 bg-background" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-12"
          style={{ willChange: "transform, opacity" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: gpuEase }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Conheça o Bot
          </h2>
          <p className="text-muted-foreground">
            Veja como o bot funciona na prática e descubra todo seu potencial.
          </p>
        </motion.div>

        <motion.div
          className="w-full max-w-3xl mx-auto"
          style={{ willChange: "transform, opacity" }}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.35, ease: gpuEase }}
        >
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/10">
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
                  className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Play className="w-8 h-8 text-primary ml-1" />
                </motion.div>
                <p className="text-muted-foreground text-sm">Vídeo em breve</p>
              </div>
            )}
            
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl opacity-50 -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
