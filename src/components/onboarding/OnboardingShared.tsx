import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full px-6 pt-6 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-display font-medium text-muted-foreground">
          Schritt {currentStep} von {totalSteps}
        </span>
        <span className="text-xs font-display font-semibold text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full gradient-neon"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px oklch(0.85 0.22 155 / 0.5))" }}
        />
      </div>
    </div>
  );
}

// Shared animation variants for step transitions
export const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export const stepTransition = {
  type: "tween" as const,
  duration: 0.35,
  ease: "easeInOut" as const,
};

// Selectable card component
interface SelectCardProps {
  emoji: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function SelectCard({ emoji, label, sublabel, selected, onClick, className }: SelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer",
        selected
          ? "border-primary bg-primary/10 glow-neon"
          : "border-border bg-card hover:border-primary/30",
        className
      )}
    >
      <span className="text-2xl mb-1">{emoji}</span>
      <span className="text-xs font-display font-semibold text-foreground">{label}</span>
      {sublabel && (
        <span className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</span>
      )}
    </button>
  );
}
