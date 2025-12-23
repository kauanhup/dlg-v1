import { motion } from "framer-motion";
import { Play } from "lucide-react";

// GPU-optimized easing
const gpuEase = [0.33, 1, 0.68, 1] as const;

const Features = () => {
  const videoUrl = "";

  return (
    <section id="features" className="py-24 sm:py-32 lg:py-40 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: gpuEase }}
        >
          <motion.span 
            className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Demonstração
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
            Veja o bot em <span className="text-primary">ação</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Descubra como o DLG Connect pode transformar sua estratégia de crescimento.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          className="w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, ease: gpuEase }}
        >
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border bg-card shadow-2xl">
            {videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-card via-card to-primary/5">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                </motion.div>
                <p className="text-muted-foreground text-sm mt-6">Vídeo em breve</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
