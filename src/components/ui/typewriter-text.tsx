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
    <span className={cn("inline-flex items-baseline", className)}>
      <motion.span 
        className="font-bold bg-clip-text text-transparent"
        style={{
          backgroundImage: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 50%, hsl(var(--primary)) 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {displayText}
      </motion.span>
      <motion.span 
        className="inline-block w-[3px] h-[0.85em] bg-primary ml-0.5 rounded-sm"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}
