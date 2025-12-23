"use client";

import { useRef, ReactNode } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

// GPU-optimized easing - smooth and performant
const gpuEase = [0.33, 1, 0.68, 1] as const; // cubic-bezier for 60fps

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
  threshold?: number;
}

export const ScrollReveal = ({
  children,
  className = "",
  duration = 0.3,
  direction = "up",
  distance = 24,
  once = false,
  threshold = 0.2,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once, 
    amount: threshold,
    margin: "-40px 0px -40px 0px"
  });

  const getTransform = () => {
    switch (direction) {
      case "up": return { y: distance };
      case "down": return { y: -distance };
      case "left": return { x: distance };
      case "right": return { x: -distance };
      case "none": return {};
    }
  };

  const initial = getTransform();

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ willChange: "transform, opacity" }}
      initial={{ opacity: 0, ...initial }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initial }}
      transition={{
        duration,
        ease: gpuEase,
      }}
    >
      {children}
    </motion.div>
  );
};

interface ParallaxScrollProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export const ParallaxScroll = ({
  children,
  className = "",
  speed = 0.3,
}: ParallaxScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60 * speed, -60 * speed]);

  return (
    <motion.div 
      ref={ref} 
      style={{ y, willChange: "transform" }} 
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface FadeInViewProps {
  children: ReactNode;
  className?: string;
}

export const FadeInView = ({
  children,
  className = "",
}: FadeInViewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: false, 
    amount: 0.3,
    margin: "-60px 0px -60px 0px"
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ willChange: "transform, opacity" }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.28,
        ease: gpuEase,
      }}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.05,
}: StaggerContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      style={{ willChange: "transform, opacity" }}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.25,
            ease: gpuEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
