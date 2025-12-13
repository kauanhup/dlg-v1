import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XOctagon,
  X,
} from "lucide-react";

const alertToastVariants = cva(
  "relative w-full max-w-sm overflow-hidden rounded-lg shadow-lg flex items-start p-4 space-x-4",
  {
    variants: {
      variant: {
        success: "",
        warning: "",
        info: "",
        error: "",
      },
      styleVariant: {
        default: "bg-card border",
        filled: "",
      },
    },
    compoundVariants: [
      {
        variant: "success",
        styleVariant: "default",
        className: "text-success border-success/30",
      },
      {
        variant: "warning",
        styleVariant: "default",
        className: "text-warning border-warning/30",
      },
      {
        variant: "info",
        styleVariant: "default",
        className: "text-primary border-primary/30",
      },
      {
        variant: "error",
        styleVariant: "default",
        className: "text-destructive border-destructive/30",
      },
      {
        variant: "success",
        styleVariant: "filled",
        className: "bg-success text-success-foreground",
      },
      {
        variant: "warning",
        styleVariant: "filled",
        className: "bg-warning text-warning-foreground",
      },
      {
        variant: "info",
        styleVariant: "filled",
        className: "bg-primary text-primary-foreground",
      },
      {
        variant: "error",
        styleVariant: "filled",
        className: "bg-destructive text-destructive-foreground",
      },
    ],
    defaultVariants: {
      variant: "info",
      styleVariant: "default",
    },
  }
);

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XOctagon,
};

const iconColorClasses: Record<string, Record<string, string>> = {
  default: {
    success: "text-success",
    warning: "text-warning",
    info: "text-primary",
    error: "text-destructive",
  },
  filled: {
    success: "text-success-foreground",
    warning: "text-warning-foreground",
    info: "text-primary-foreground",
    error: "text-destructive-foreground",
  },
};

export interface AlertToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertToastVariants> {
  title: string;
  description: string;
  onClose: () => void;
}

const AlertToast = React.forwardRef<HTMLDivElement, AlertToastProps>(
  ({ className, variant = 'info', styleVariant = 'default', title, description, onClose }, ref) => {
    const Icon = iconMap[variant!];

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(alertToastVariants({ variant, styleVariant }), className)}
      >
        <div className={cn("flex-shrink-0", iconColorClasses[styleVariant!][variant!])}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", styleVariant === 'default' ? 'text-foreground' : '')}>{title}</p>
          <p className={cn("text-xs mt-0.5", styleVariant === 'default' ? 'text-muted-foreground' : 'opacity-90')}>{description}</p>
        </div>
        
        <button
          onClick={onClose}
          className={cn(
            "flex-shrink-0 rounded-full p-1 transition-colors",
            styleVariant === 'default' 
              ? "hover:bg-muted text-muted-foreground hover:text-foreground" 
              : "hover:bg-white/20"
          )}
        >
          <span className="sr-only">Fechar</span>
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }
);

AlertToast.displayName = "AlertToast";

export { AlertToast, alertToastVariants };
