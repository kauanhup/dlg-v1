import { motion, Variants } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { 
  useScrollAnimation, 
  gpuEase,
  bounceEase,
  usePrefersReducedMotion
} from "@/hooks/useScrollAnimation";

// Animation type matching AOS library style
type AnimationType = 
  // Fade animations
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-up-right"
  | "fade-up-left"
  | "fade-down-right"
  | "fade-down-left"
  // Flip animations
  | "flip-left"
  | "flip-right"
  | "flip-up"
  | "flip-down"
  // Zoom animations
  | "zoom-in"
  | "zoom-in-up"
  | "zoom-in-down"
  | "zoom-in-left"
  | "zoom-in-right"
  | "zoom-out"
  | "zoom-out-up"
  | "zoom-out-down"
  // Slide animations
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  // Scale animations
  | "scale-in"
  | "scale-bounce"
  // Rotate animations
  | "rotate-in"
  | "rotate-left"
  | "rotate-right"
  // Special effects
  | "blur-in"
  | "blur-in-up"
  // Legacy support
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "fadeIn"
  | "scaleIn";

const animationVariants: Record<AnimationType, Variants> = {
  // Fade animations
  "fade": { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1 } 
  },
  "fade-up": { 
    hidden: { opacity: 0, y: 50 }, 
    visible: { opacity: 1, y: 0 } 
  },
  "fade-down": { 
    hidden: { opacity: 0, y: -50 }, 
    visible: { opacity: 1, y: 0 } 
  },
  "fade-left": { 
    hidden: { opacity: 0, x: -60 }, 
    visible: { opacity: 1, x: 0 } 
  },
  "fade-right": { 
    hidden: { opacity: 0, x: 60 }, 
    visible: { opacity: 1, x: 0 } 
  },
  "fade-up-right": { 
    hidden: { opacity: 0, y: 50, x: 50 }, 
    visible: { opacity: 1, y: 0, x: 0 } 
  },
  "fade-up-left": { 
    hidden: { opacity: 0, y: 50, x: -50 }, 
    visible: { opacity: 1, y: 0, x: 0 } 
  },
  "fade-down-right": { 
    hidden: { opacity: 0, y: -50, x: 50 }, 
    visible: { opacity: 1, y: 0, x: 0 } 
  },
  "fade-down-left": { 
    hidden: { opacity: 0, y: -50, x: -50 }, 
    visible: { opacity: 1, y: 0, x: 0 } 
  },
  
  // Flip animations
  "flip-left": { 
    hidden: { opacity: 0, rotateY: -90 }, 
    visible: { opacity: 1, rotateY: 0 } 
  },
  "flip-right": { 
    hidden: { opacity: 0, rotateY: 90 }, 
    visible: { opacity: 1, rotateY: 0 } 
  },
  "flip-up": { 
    hidden: { opacity: 0, rotateX: 90 }, 
    visible: { opacity: 1, rotateX: 0 } 
  },
  "flip-down": { 
    hidden: { opacity: 0, rotateX: -90 }, 
    visible: { opacity: 1, rotateX: 0 } 
  },
  
  // Zoom animations
  "zoom-in": { 
    hidden: { opacity: 0, scale: 0.5 }, 
    visible: { opacity: 1, scale: 1 } 
  },
  "zoom-in-up": { 
    hidden: { opacity: 0, scale: 0.5, y: 60 }, 
    visible: { opacity: 1, scale: 1, y: 0 } 
  },
  "zoom-in-down": { 
    hidden: { opacity: 0, scale: 0.5, y: -60 }, 
    visible: { opacity: 1, scale: 1, y: 0 } 
  },
  "zoom-in-left": { 
    hidden: { opacity: 0, scale: 0.5, x: -80 }, 
    visible: { opacity: 1, scale: 1, x: 0 } 
  },
  "zoom-in-right": { 
    hidden: { opacity: 0, scale: 0.5, x: 80 }, 
    visible: { opacity: 1, scale: 1, x: 0 } 
  },
  "zoom-out": { 
    hidden: { opacity: 0, scale: 1.5 }, 
    visible: { opacity: 1, scale: 1 } 
  },
  "zoom-out-up": { 
    hidden: { opacity: 0, scale: 1.5, y: -40 }, 
    visible: { opacity: 1, scale: 1, y: 0 } 
  },
  "zoom-out-down": { 
    hidden: { opacity: 0, scale: 1.5, y: 40 }, 
    visible: { opacity: 1, scale: 1, y: 0 } 
  },
  
  // Slide animations
  "slide-left": { 
    hidden: { opacity: 0, x: -120 }, 
    visible: { opacity: 1, x: 0 } 
  },
  "slide-right": { 
    hidden: { opacity: 0, x: 120 }, 
    visible: { opacity: 1, x: 0 } 
  },
  "slide-up": { 
    hidden: { opacity: 0, y: 120 }, 
    visible: { opacity: 1, y: 0 } 
  },
  "slide-down": { 
    hidden: { opacity: 0, y: -120 }, 
    visible: { opacity: 1, y: 0 } 
  },
  
  // Scale animations
  "scale-in": { 
    hidden: { opacity: 0, scale: 0.8 }, 
    visible: { opacity: 1, scale: 1 } 
  },
  "scale-bounce": { 
    hidden: { opacity: 0, scale: 0.3 }, 
    visible: { opacity: 1, scale: 1 } 
  },
  
  // Rotate animations
  "rotate-in": { 
    hidden: { opacity: 0, rotate: -180, scale: 0.5 }, 
    visible: { opacity: 1, rotate: 0, scale: 1 } 
  },
  "rotate-left": { 
    hidden: { opacity: 0, rotate: -90, x: -60 }, 
    visible: { opacity: 1, rotate: 0, x: 0 } 
  },
  "rotate-right": { 
    hidden: { opacity: 0, rotate: 90, x: 60 }, 
    visible: { opacity: 1, rotate: 0, x: 0 } 
  },
  
  // Special effects
  "blur-in": { 
    hidden: { opacity: 0, filter: "blur(12px)" }, 
    visible: { opacity: 1, filter: "blur(0px)" } 
  },
  "blur-in-up": { 
    hidden: { opacity: 0, filter: "blur(12px)", y: 40 }, 
    visible: { opacity: 1, filter: "blur(0px)", y: 0 } 
  },
  
  // Legacy support (camelCase versions)
  "fadeInUp": { 
    hidden: { opacity: 0, y: 50 }, 
    visible: { opacity: 1, y: 0 } 
  },
  "fadeInDown": { 
    hidden: { opacity: 0, y: -50 }, 
    visible: { opacity: 1, y: 0 } 
  },
  "fadeInLeft": { 
    hidden: { opacity: 0, x: -60 }, 
    visible: { opacity: 1, x: 0 } 
  },
  "fadeInRight": { 
    hidden: { opacity: 0, x: 60 }, 
    visible: { opacity: 1, x: 0 } 
  },
  "fadeIn": { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1 } 
  },
  "scaleIn": { 
    hidden: { opacity: 0, scale: 0.8 }, 
    visible: { opacity: 1, scale: 1 } 
  },
};

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  easing?: "smooth" | "bounce";
}

export const AnimatedSection = forwardRef<HTMLDivElement, AnimatedSectionProps>(({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  easing = "smooth",
}, ref) => {
  const { ref: scrollRef, isInView, prefersReducedMotion } = useScrollAnimation({
    once,
    amount,
  });

  const variants = animationVariants[animation];
  const ease = easing === "bounce" ? bounceEase : gpuEase;

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={(node: HTMLDivElement | null) => {
        (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        delay,
        ease,
      }}
      style={{ willChange: "transform, opacity", perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
});

AnimatedSection.displayName = "AnimatedSection";

// Animated text component for headings/paragraphs
interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  animation?: AnimationType;
}

export const AnimatedText = ({
  children,
  className = "",
  delay = 0,
  as: Component = "p",
  animation = "fade-up",
}: AnimatedTextProps) => {
  const { ref, isInView, prefersReducedMotion } = useScrollAnimation({ once: true });

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const MotionComponent = motion[Component];
  const variants = animationVariants[animation];

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration: 0.5,
        delay,
        ease: gpuEase,
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </MotionComponent>
  );
};

// Animated list container
interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const AnimatedList = ({
  children,
  className = "",
  staggerDelay = 0.1,
}: AnimatedListProps) => {
  const { ref, isInView, prefersReducedMotion } = useScrollAnimation({ once: true });

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
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

// Animated list item
interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
}

export const AnimatedListItem = ({
  children,
  className = "",
  animation = "fade-up",
}: AnimatedListItemProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const variants = animationVariants[animation];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      transition={{
        duration: 0.5,
        ease: gpuEase,
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
