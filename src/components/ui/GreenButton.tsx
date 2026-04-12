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
      sm: "h-9 px-4 text-sm",
      default: "h-11 px-6 text-sm",
      lg: "h-13 px-8 text-base",
    };

    const variantClasses = {
      default:
        "bg-primary text-primary-foreground glow-neon hover:glow-neon-intense active:scale-[0.98]",
      outline:
        "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
      ghost:
        "text-primary bg-transparent hover:bg-primary/10",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-display font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
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
