import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  gradientColors?: string;
  gradientAnimationDuration?: number;
  hoverEffect?: boolean;
  className?: string;
  textClassName?: string;
}

const AnimatedText = React.forwardRef<HTMLSpanElement, AnimatedTextProps>(
  (
    {
      text,
      gradientColors = "linear-gradient(90deg, hsl(var(--muted-foreground)), hsl(var(--foreground)), hsl(var(--muted-foreground)))",
      gradientAnimationDuration = 2,
      hoverEffect = false,
      className,
      textClassName,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const textVariants: Variants = {
      initial: {
        backgroundPosition: "0% 0",
      },
      animate: {
        backgroundPosition: "200% 0",
        transition: {
          duration: gradientAnimationDuration,
          repeat: Infinity,
          ease: "linear",
        },
      },
    };

    return (
      <span ref={ref} className={cn("relative", className)} {...props}>
        <motion.span
          className={cn(
            "bg-clip-text text-transparent bg-[length:200%_100%]",
            textClassName
          )}
          style={{
            backgroundImage: gradientColors,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            paddingBottom: '0.25em',
            display: 'inline-block',
          }}
          variants={textVariants}
          initial="initial"
          animate="animate"
          onHoverStart={() => hoverEffect && setIsHovered(true)}
          onHoverEnd={() => hoverEffect && setIsHovered(false)}
        >
          {text}
        </motion.span>
      </span>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
