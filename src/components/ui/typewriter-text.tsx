"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
}

export function TypewriterText({
  texts,
  typingSpeed = 70,
  deletingSpeed = 35,
  pauseTime = 2800,
  className,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = React.useState("");
  const [textIndex, setTextIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    const currentText = texts[textIndex];

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimeout);
    }

    if (isDeleting) {
      if (displayText === "") {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
        return;
      }

      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(timeout);
    }

    if (displayText === currentText) {
      setIsPaused(true);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText(currentText.slice(0, displayText.length + 1));
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, isPaused, textIndex, texts, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={cn("inline-flex items-baseline relative", className)}>
      {/* Glow effect behind text */}
      <motion.span
        className="absolute inset-0 blur-2xl opacity-60 pointer-events-none"
        style={{
          background: "hsl(var(--primary))",
          filter: "blur(24px)",
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Shiny text */}
      <motion.span 
        className="relative font-bold bg-clip-text text-transparent"
        style={{
          backgroundImage: "linear-gradient(110deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.5) 25%, hsl(var(--primary)) 50%, hsl(var(--primary)/0.5) 75%, hsl(var(--primary)) 100%)",
          backgroundSize: "300% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {displayText}
      </motion.span>
      
      {/* Cursor */}
      <motion.span 
        className="relative inline-block w-[3px] h-[0.85em] bg-primary ml-0.5 rounded-sm shadow-[0_0_12px_hsl(var(--primary)/0.8)]"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}
