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

    // Draw Telegram paper plane icon
    const drawTelegramIcon = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 24, size / 24);
      
      ctx.beginPath();
      // Telegram paper plane path
      ctx.moveTo(2.01, 10.97);
      ctx.lineTo(9.67, 13.36);
      ctx.lineTo(12.02, 21.02);
      ctx.lineTo(21.99, 3.01);
      ctx.lineTo(2.01, 10.97);
      ctx.closePath();
      
      ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
      ctx.fill();
      
      // Inner fold
      ctx.beginPath();
      ctx.moveTo(9.67, 13.36);
      ctx.lineTo(12.02, 21.02);
      ctx.lineTo(13.15, 14.83);
      ctx.lineTo(9.67, 13.36);
      ctx.closePath();
      ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.8})`;
      ctx.fill();
      
      ctx.restore();
    };

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Orbiting Telegram icons
      const orbitRadius = Math.min(width, height) * 0.25;
      const iconCount = 6;
      
      for (let i = 0; i < iconCount; i++) {
        const angle = rotation + (i / iconCount) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius * 0.4; // Elliptical orbit
        const depth = Math.sin(angle); // For 3D effect
        const size = 16 + depth * 6;
        const alpha = 0.3 + depth * 0.3;
        
        drawTelegramIcon(x - size/2, y - size/2, size, alpha);
      }

      // Second orbit (counter-rotating)
      const orbit2Radius = orbitRadius * 1.5;
      for (let i = 0; i < 8; i++) {
        const angle = -rotation * 0.7 + (i / 8) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * orbit2Radius;
        const y = centerY + Math.sin(angle) * orbit2Radius * 0.3;
        const depth = Math.sin(angle);
        
        // Connection dots
        ctx.beginPath();
        ctx.arc(x, y, 3 + depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${0.2 + depth * 0.2})`;
        ctx.fill();
        
        // Connection lines to center
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(centerX, centerY);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.05 + depth * 0.05})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Central hub with glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.4)");
      gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.15)");
      gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Central Telegram icon (larger, rotating opposite)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-rotation * 0.5);
      drawTelegramIcon(-15, -15, 30, 0.8);
      ctx.restore();

      // Floating particles
      for (let i = 0; i < 20; i++) {
        const particleAngle = rotation * 0.3 + (i / 20) * Math.PI * 2;
        const particleRadius = 80 + Math.sin(rotation * 2 + i) * 30;
        const px = centerX + Math.cos(particleAngle + i * 0.5) * particleRadius;
        const py = centerY + Math.sin(particleAngle + i * 0.5) * particleRadius * 0.5;
        
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${0.2 + Math.sin(rotation + i) * 0.15})`;
        ctx.fill();
      }

      rotation += 0.008;
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
    <div className="relative h-36 sm:h-44 md:h-52 overflow-hidden bg-gradient-to-b from-background via-card/10 to-background">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      
      {/* Horizontal lines */}
      <motion.div 
        className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      />

      {/* Canvas with rotating elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Central glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default RotatingDivider;
