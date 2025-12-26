import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// GPU-optimized easing curves
export const gpuEase = [0.33, 1, 0.68, 1] as const;
export const bounceEase = [0.68, -0.55, 0.265, 1.55] as const;
export const smoothEase = [0.4, 0, 0.2, 1] as const;

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

// ===== FADE ANIMATIONS =====
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInUpRight = {
  hidden: { opacity: 0, y: 40, x: 40 },
  visible: { opacity: 1, y: 0, x: 0 },
};

export const fadeInUpLeft = {
  hidden: { opacity: 0, y: 40, x: -40 },
  visible: { opacity: 1, y: 0, x: 0 },
};

export const fadeInDownRight = {
  hidden: { opacity: 0, y: -40, x: 40 },
  visible: { opacity: 1, y: 0, x: 0 },
};

export const fadeInDownLeft = {
  hidden: { opacity: 0, y: -40, x: -40 },
  visible: { opacity: 1, y: 0, x: 0 },
};

// ===== FLIP ANIMATIONS =====
export const flipLeft = {
  hidden: { opacity: 0, rotateY: -90, perspective: 1000 },
  visible: { opacity: 1, rotateY: 0, perspective: 1000 },
};

export const flipRight = {
  hidden: { opacity: 0, rotateY: 90, perspective: 1000 },
  visible: { opacity: 1, rotateY: 0, perspective: 1000 },
};

export const flipUp = {
  hidden: { opacity: 0, rotateX: 90, perspective: 1000 },
  visible: { opacity: 1, rotateX: 0, perspective: 1000 },
};

export const flipDown = {
  hidden: { opacity: 0, rotateX: -90, perspective: 1000 },
  visible: { opacity: 1, rotateX: 0, perspective: 1000 },
};

// ===== ZOOM ANIMATIONS =====
export const zoomIn = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1 },
};

export const zoomInUp = {
  hidden: { opacity: 0, scale: 0.6, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const zoomInDown = {
  hidden: { opacity: 0, scale: 0.6, y: -40 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const zoomInLeft = {
  hidden: { opacity: 0, scale: 0.6, x: -60 },
  visible: { opacity: 1, scale: 1, x: 0 },
};

export const zoomInRight = {
  hidden: { opacity: 0, scale: 0.6, x: 60 },
  visible: { opacity: 1, scale: 1, x: 0 },
};

export const zoomOut = {
  hidden: { opacity: 0, scale: 1.4 },
  visible: { opacity: 1, scale: 1 },
};

export const zoomOutUp = {
  hidden: { opacity: 0, scale: 1.4, y: -40 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const zoomOutDown = {
  hidden: { opacity: 0, scale: 1.4, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// ===== SLIDE ANIMATIONS =====
export const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
};

export const slideInUp = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
};

export const slideInDown = {
  hidden: { opacity: 0, y: -100 },
  visible: { opacity: 1, y: 0 },
};

// ===== SCALE ANIMATIONS =====
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export const scaleInBounce = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { opacity: 1, scale: 1 },
};

// ===== ROTATE ANIMATIONS =====
export const rotateIn = {
  hidden: { opacity: 0, rotate: -180, scale: 0.6 },
  visible: { opacity: 1, rotate: 0, scale: 1 },
};

export const rotateInLeft = {
  hidden: { opacity: 0, rotate: -90, x: -60 },
  visible: { opacity: 1, rotate: 0, x: 0 },
};

export const rotateInRight = {
  hidden: { opacity: 0, rotate: 90, x: 60 },
  visible: { opacity: 1, rotate: 0, x: 0 },
};

// ===== STAGGER ANIMATIONS =====
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

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: gpuEase,
    },
  },
};

export const staggerItemScale = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: bounceEase,
    },
  },
};

// ===== TRANSITION PRESETS =====
export const defaultTransition = {
  duration: 0.6,
  ease: gpuEase,
};

export const quickTransition = {
  duration: 0.3,
  ease: gpuEase,
};

export const slowTransition = {
  duration: 0.8,
  ease: gpuEase,
};

export const bounceTransition = {
  duration: 0.7,
  ease: bounceEase,
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
};

// Create delayed transition
export const delayedTransition = (delay: number, duration = 0.6) => ({
  duration,
  delay,
  ease: gpuEase,
});

// ===== SPECIAL EFFECTS =====
export const blurIn = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

export const blurInUp = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 30 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
};

export const glowPulse = {
  hidden: { opacity: 0, boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)" },
  visible: { 
    opacity: 1, 
    boxShadow: [
      "0 0 0 0 rgba(139, 92, 246, 0)",
      "0 0 30px 10px rgba(139, 92, 246, 0.3)",
      "0 0 0 0 rgba(139, 92, 246, 0)"
    ],
  },
};
