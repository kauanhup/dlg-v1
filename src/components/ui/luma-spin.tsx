import { cn } from "@/lib/utils";

interface LumaSpinProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LumaSpin = ({ className, size = "md" }: LumaSpinProps) => {
  const sizeMap = {
    sm: { container: "w-[40px] h-[40px]", inset: "20px" },
    md: { container: "w-[60px] h-[60px]", inset: "30px" },
    lg: { container: "w-[70px] h-[70px]", inset: "35px" },
  };

  const config = sizeMap[size];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", config.container)}>
        <div className="absolute bg-primary rounded-md animate-loaderAnim inset-0" />
        <div className="absolute bg-primary/70 rounded-md animate-loaderAnim animation-delay inset-0" />
      </div>
      <style>{`
        @keyframes loaderAnim {
          0% { inset: 0 ${config.inset} ${config.inset} 0; }
          12.5% { inset: 0 ${config.inset} 0 0; }
          25% { inset: ${config.inset} ${config.inset} 0 0; }
          37.5% { inset: ${config.inset} 0 0 0; }
          50% { inset: ${config.inset} 0 0 ${config.inset}; }
          62.5% { inset: 0 0 0 ${config.inset}; }
          75% { inset: 0 0 ${config.inset} ${config.inset}; }
          87.5% { inset: 0 0 ${config.inset} 0; }
          100% { inset: 0 ${config.inset} ${config.inset} 0; }
        }
        .animate-loaderAnim {
          animation: loaderAnim 2.5s ease-in-out infinite;
        }
        .animation-delay {
          animation-delay: -1.25s;
        }
      `}</style>
    </div>
  );
};

export default LumaSpin;
