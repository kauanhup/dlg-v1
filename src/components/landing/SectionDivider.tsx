import { motion } from "framer-motion";

export const SectionDivider = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative py-16 sm:py-24 ${className}`}>
      {/* Elegant gradient divider */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        />
      </div>
      
      {/* Center accent */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="w-2 h-2 rounded-full bg-primary/50"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
        />
      </div>
      
      {/* Subtle glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-32 bg-primary/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
};
