import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const RotatingDivider = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw rotating geometric shape
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Outer ring
      const outerRadius = Math.min(width, height) * 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner geometric pattern
      const segments = 8;
      const innerRadius = outerRadius * 0.6;
      
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const nextAngle = ((i + 1) / segments) * Math.PI * 2;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle) * outerRadius,
          Math.sin(angle) * outerRadius
        );
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + (i % 2) * 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Diamond shapes
        ctx.beginPath();
        ctx.moveTo(
          Math.cos(angle) * innerRadius,
          Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
          Math.cos((angle + nextAngle) / 2) * outerRadius,
          Math.sin((angle + nextAngle) / 2) * outerRadius
        );
        ctx.lineTo(
          Math.cos(nextAngle) * innerRadius,
          Math.sin(nextAngle) * innerRadius
        );
        ctx.strokeStyle = "rgba(168, 85, 247, 0.2)";
        ctx.stroke();
      }

      // Center circle
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius * 0.15, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius * 0.15);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.5)");
      gradient.addColorStop(1, "rgba(139, 92, 246, 0.1)");
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.restore();

      // Counter-rotating outer elements
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-rotation * 0.5);

      const dotCount = 12;
      const dotRadius = outerRadius * 1.2;
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        const x = Math.cos(angle) * dotRadius;
        const y = Math.sin(angle) * dotRadius;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${0.3 + Math.sin(rotation * 2 + i) * 0.2})`;
        ctx.fill();
      }

      ctx.restore();

      rotation += 0.003;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden bg-gradient-to-b from-background via-card/20 to-background">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />
      
      {/* Horizontal line */}
      <motion.div 
        className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Canvas with rotating element */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 bg-primary/10 rounded-full blur-3xl" />
    </div>
  );
};

export default RotatingDivider;
