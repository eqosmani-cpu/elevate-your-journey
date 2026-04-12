import { cn } from "@/lib/utils";
import { Clock, Check } from "lucide-react";

interface TaskCardProps {
  title: string;
  category: string;
  duration: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  completed?: boolean;
  className?: string;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  Fokus: "bg-accent-light text-primary",
  Resilienz: "bg-muted text-muted-foreground",
  Motivation: "bg-gold-light text-gold",
  Visualisierung: "bg-accent-light text-primary",
  Achtsamkeit: "bg-muted text-muted-foreground",
};

export function TaskCard({
  title,
  category,
  duration,
  difficulty,
  completed = false,
  className,
  onClick,
}: TaskCardProps) {
  const catColor = categoryColors[category] || "bg-muted text-muted-foreground";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl bg-card p-4 border border-border shadow-xs card-hover",
        completed && "opacity-60",
        className
      )}
    >
      {/* Category tag */}
      <span className={cn("inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-medium tracking-label uppercase mb-3", catColor)}>
        {category}
      </span>

      {/* Title */}
      <h3 className="font-display text-[15px] text-card-foreground leading-snug mb-3">
        {title}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[12px]">
          {completed ? (
            <>
              <Check size={12} className="text-primary" />
              <span className="text-primary">Erledigt</span>
            </>
          ) : (
            <>
              <Clock size={12} strokeWidth={1.5} />
              <span>{duration}</span>
            </>
          )}
        </div>

        {/* Difficulty dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                i < difficulty ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
