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
      sm: "min-h-[44px] px-5 text-[13px]",
      default: "min-h-[44px] px-6 text-[14px]",
      lg: "min-h-[48px] px-8 text-[15px]",
    };

    const variantClasses = {
      default:
        "bg-[#3A5C4A] text-white hover:bg-[#2E4A3C] hover:translate-y-[-1px] hover:shadow-hover",
      outline:
        "border border-[#E8E8E8] text-[#1A1A1A] bg-transparent hover:bg-[#FAFAF8] hover:translate-y-[-1px]",
      ghost:
        "text-[#3A5C4A] bg-transparent hover:bg-[#EDF2EE]",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A5C4A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
          "touch-target",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        ref={ref}
        {...props}
      />
    );
  }
);
GreenButton.displayName = "GreenButton";

export { GreenButton };
