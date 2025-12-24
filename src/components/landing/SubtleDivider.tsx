import { motion } from "framer-motion";

interface SubtleDividerProps {
  variant?: "default" | "glow" | "dots";
  className?: string;
}

export const SubtleDivider = ({ variant = "default", className = "" }: SubtleDividerProps) => {
  if (variant === "dots") {
    return (
      <div className={`flex items-center justify-center gap-3 py-8 sm:py-12 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/30"
            initial={{ opacity: 0.3 }}
            whileInView={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "glow") {
    return (
      <div className={`relative py-8 sm:py-12 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 sm:w-48 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 sm:w-24 h-4 bg-primary/10 rounded-full blur-xl" />
        </motion.div>
      </div>
    );
  }

  // Default variant - elegant gradient line
  return (
    <div className={`relative py-8 sm:py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-center">
          {/* Left fade line */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/30 to-border/50" />
          
          {/* Center element */}
          <div className="mx-4 sm:mx-6">
            <motion.div 
              className="w-2 h-2 rounded-full bg-primary/40 ring-4 ring-primary/10"
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Right fade line */}
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border/30 to-border/50" />
        </div>
      </div>
    </div>
  );
};

export default SubtleDivider;
