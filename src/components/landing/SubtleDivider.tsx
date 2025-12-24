import { motion } from "framer-motion";

interface SubtleDividerProps {
  variant?: "default" | "glow" | "dots";
  className?: string;
}

export const SubtleDivider = ({ variant = "default", className = "" }: SubtleDividerProps) => {
  if (variant === "dots") {
    return (
      <div className={`flex items-center justify-center gap-4 py-10 sm:py-14 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/40"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "glow") {
    return (
      <div className={`relative py-10 sm:py-14 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 sm:w-64 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-24 sm:w-32 h-6 bg-primary/10 rounded-full blur-xl" />
        </motion.div>
      </div>
    );
  }

  // Default variant - elegant gradient line with center element
  return (
    <div className={`relative py-10 sm:py-14 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-center">
          {/* Left fade line */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border/50" />
          
          {/* Center element */}
          <div className="mx-6 sm:mx-8">
            <motion.div 
              className="w-2.5 h-2.5 rounded-full bg-primary/50 ring-4 ring-primary/10"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Right fade line */}
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border/50" />
        </div>
      </div>
    </div>
  );
};

export default SubtleDivider;