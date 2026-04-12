import { GreenButton } from "@/components/ui/GreenButton";
import { Clock, Check, ArrowRight } from "lucide-react";
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

interface TodayCardProps {
  task: Task;
  completed: boolean;
  onStart: () => void;
}

export function TodayCard({ task, completed, onStart }: TodayCardProps) {
  const catLabel = categoryLabels[task.category] || task.category;

  return (
    <div
      className={cn(
        "rounded-3xl p-6 transition-all duration-300 relative overflow-hidden",
        completed
          ? "bg-accent-light border border-border"
          : "bg-primary text-primary-foreground shadow-accent"
      )}
    >
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className={cn(
            "text-[11px] font-body font-medium uppercase tracking-label",
            completed ? "text-primary" : "text-primary-foreground/70"
          )}>
            {completed ? "Abgeschlossen" : "Heutige Aufgabe"}
          </span>
          {completed && (
            <span className="flex items-center gap-1 text-[12px] font-medium text-primary">
              <Check size={14} strokeWidth={1.5} />
              Erledigt
            </span>
          )}
        </div>

        <h2 className={cn(
          "text-[22px] font-display mb-3 leading-tight",
          completed ? "text-foreground" : "text-primary-foreground"
        )}>
          {task.title}
        </h2>

        <div className="flex items-center gap-3 mb-5">
          <span className={cn(
            "inline-block rounded-lg px-2.5 py-1 text-[11px] font-medium tracking-label uppercase",
            completed ? "bg-primary/10 text-primary" : "bg-white/15 text-primary-foreground"
          )}>
            {catLabel}
          </span>
          <div className={cn(
            "flex items-center gap-1 text-[12px]",
            completed ? "text-muted-foreground" : "text-primary-foreground/70"
          )}>
            <Clock size={12} strokeWidth={1.5} />
            <span>{task.duration_min} Min.</span>
          </div>
        </div>

        {completed ? (
          <div className="h-1 rounded-full bg-primary/15 overflow-hidden">
            <div className="h-full w-full rounded-full bg-primary" />
          </div>
        ) : (
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 text-[14px] font-body font-medium text-primary-foreground hover:opacity-80 transition-opacity"
          >
            Jetzt starten
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
