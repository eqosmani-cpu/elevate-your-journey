import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TaskCardProps {
  title: string;
  category: string;
  duration: string; // e.g. "10 Min."
  difficulty: 1 | 2 | 3 | 4 | 5;
  completed?: boolean;
  className?: string;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  Fokus: "bg-chart-1/15 text-chart-1",
  Resilienz: "bg-chart-5/15 text-chart-5",
  Motivation: "bg-chart-3/15 text-chart-3",
  Visualisierung: "bg-chart-4/15 text-chart-4",
  Achtsamkeit: "bg-chart-2/15 text-chart-2",
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
        "w-full text-left rounded-2xl bg-card p-4 border border-border transition-all duration-200",
        "hover:border-primary/30 hover:glow-neon active:scale-[0.98]",
        completed && "opacity-60",
        className
      )}
    >
      {/* Category tag */}
      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold mb-3", catColor)}>
        {category}
      </span>

      {/* Title */}
      <h3 className="font-display font-semibold text-card-foreground text-sm leading-snug mb-3">
        {title}
      </h3>

      {/* Footer: duration + difficulty */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Clock size={12} />
          <span>{duration}</span>
        </div>

        {/* Difficulty dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i < difficulty ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
