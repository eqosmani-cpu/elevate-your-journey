import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  count: number;
  className?: string;
}

export function StreakBadge({ count, className }: StreakBadgeProps) {
  const isActive = count > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-display font-semibold transition-all",
        isActive
          ? "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Flame
        size={14}
        className={cn(
          "transition-all",
          isActive && "text-primary drop-shadow-[0_0_6px_oklch(0.85_0.22_155_/_0.6)]"
        )}
        fill={isActive ? "currentColor" : "none"}
      />
      <span>{count}</span>
    </div>
  );
}
