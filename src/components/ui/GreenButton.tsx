import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface GreenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const GreenButton = React.forwardRef<HTMLButtonElement, GreenButtonProps>(
  ({ className, asChild = false, size = "default", variant = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const sizeClasses = {
      sm: "h-9 px-5 text-[13px]",
      default: "h-11 px-6 text-[14px]",
      lg: "h-12 px-8 text-[15px]",
    };

    const variantClasses = {
      default:
        "bg-primary text-primary-foreground shadow-xs hover:shadow-accent active:scale-[0.98]",
      outline:
        "border border-border text-foreground bg-transparent hover:bg-accent-light",
      ghost:
        "text-primary bg-transparent hover:bg-accent-light",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-body font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
GreenButton.displayName = "GreenButton";

export { GreenButton };
