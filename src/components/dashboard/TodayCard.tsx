import { GreenButton } from "@/components/ui/GreenButton";
import { Clock, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const categoryLabels: Record<string, string> = {
  focus: "Fokus",
  confidence: "Selbstvertrauen",
  pressure: "Druck",
  team: "Team",
  recovery: "Erholung",
  visualization: "Visualisierung",
};

const categoryColors: Record<string, string> = {
  focus: "bg-chart-1/15 text-chart-1",
  confidence: "bg-chart-3/15 text-chart-3",
  pressure: "bg-destructive/15 text-destructive",
  team: "bg-chart-5/15 text-chart-5",
  recovery: "bg-chart-2/15 text-chart-2",
  visualization: "bg-chart-4/15 text-chart-4",
};

interface TodayCardProps {
  task: Task;
  completed: boolean;
  onStart: () => void;
}

export function TodayCard({ task, completed, onStart }: TodayCardProps) {
  const catLabel = categoryLabels[task.category] || task.category;
  const catColor = categoryColors[task.category] || "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden",
        completed
          ? "bg-primary/5 border-primary/20"
          : "bg-gradient-to-br from-primary/15 via-primary/10 to-transparent border-primary/30 glow-neon"
      )}
    >
      {/* Subtle glow background */}
      {!completed && (
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      )}

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-display font-semibold text-primary uppercase tracking-wider">
            {completed ? "Abgeschlossen" : "Heutige Aufgabe"}
          </span>
          {completed && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Check size={14} />
              Erledigt ✓
            </span>
          )}
        </div>

        <h2 className="text-lg font-display font-bold text-foreground mb-2">
          {task.title}
        </h2>

        <div className="flex items-center gap-3 mb-4">
          <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold", catColor)}>
            {catLabel}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>{task.duration_min} Min.</span>
          </div>
        </div>

        {completed ? (
          <div className="h-1.5 rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full w-full rounded-full gradient-neon" />
          </div>
        ) : (
          <GreenButton size="default" onClick={onStart} className="w-full sm:w-auto">
            <Play size={16} />
            Jetzt starten →
          </GreenButton>
        )}
      </div>
    </div>
  );
}
