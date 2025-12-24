import { motion, Variants } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { 
  useScrollAnimation, 
  fadeInUp, 
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeIn,
  scaleIn,
  gpuEase,
  usePrefersReducedMotion
} from "@/hooks/useScrollAnimation";

type AnimationType = "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "fadeIn" | "scaleIn";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

const animationVariants: Record<AnimationType, Variants> = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeIn,
  scaleIn,
};

export const AnimatedSection = forwardRef<HTMLDivElement, AnimatedSectionProps>(({
  children,
  className = "",
  animation = "fadeInUp",
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.2,
}, ref) => {
  const { ref: scrollRef, isInView, prefersReducedMotion } = useScrollAnimation({
    once,
    amount,
  });

  const variants = animationVariants[animation];

  // If user prefers reduced motion, show content immediately
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
        // Combine refs
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
        ease: gpuEase,
      }}
      style={{ willChange: "transform, opacity" }}
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
}

export const AnimatedText = ({
  children,
  className = "",
  delay = 0,
  as: Component = "p",
}: AnimatedTextProps) => {
  const { ref, isInView, prefersReducedMotion } = useScrollAnimation({ once: true });

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const MotionComponent = motion[Component];

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.4,
        delay,
        ease: gpuEase,
      }}
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
}

export const AnimatedListItem = ({
  children,
  className = "",
}: AnimatedListItemProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: gpuEase,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
