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
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[13px] font-body font-medium transition-all",
        isActive
          ? "bg-accent-light text-primary"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Flame
        size={14}
        strokeWidth={1.5}
        className={cn(isActive && "text-primary")}
        fill={isActive ? "currentColor" : "none"}
      />
      <span>{count}</span>
    </div>
  );
}
