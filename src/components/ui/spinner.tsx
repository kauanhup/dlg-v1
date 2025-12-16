import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Spinner = ({ className, size = "md" }: SpinnerProps) => {
  const sizeClasses = {
    sm: "text-[14px]",
    md: "text-[20px]",
    lg: "text-[28px]"
  };

  return (
    <div className={cn("spinner", sizeClasses[size], className)}>
      {[...Array(12)].map((_, i) => (
        <div key={i} className="spinner-blade" />
      ))}
    </div>
  );
};
