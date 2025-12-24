import { useInView } from "framer-motion";
import { useRef, useMemo, useEffect, useState } from "react";

// GPU-optimized easing curve for smooth animations
export const gpuEase = [0.33, 1, 0.68, 1] as const;

// Check for reduced motion preference
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};

// Optimized scroll animation hook with intersection observer
export const useScrollAnimation = (options?: {
  once?: boolean;
  amount?: number;
  margin?: `${number}px` | `${number}px ${number}px` | `${number}px ${number}px ${number}px ${number}px`;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    amount: options?.amount ?? 0.2,
    margin: options?.margin ?? "-50px",
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  return { ref, isInView, prefersReducedMotion };
};

// Pre-defined animation variants for performance
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

// Stagger container for children animations
export const staggerContainer = (staggerDelay = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

// Stagger item for use within stagger container
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: gpuEase,
    },
  },
};

// Default transition settings
export const defaultTransition = {
  duration: 0.5,
  ease: gpuEase,
};

export const quickTransition = {
  duration: 0.3,
  ease: gpuEase,
};

export const slowTransition = {
  duration: 0.7,
  ease: gpuEase,
};

// Create delayed transition
export const delayedTransition = (delay: number) => ({
  duration: 0.5,
  delay,
  ease: gpuEase,
});
