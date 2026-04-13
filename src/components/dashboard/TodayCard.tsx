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

  if (completed) {
    return (
      <div className="rounded-2xl bg-accent-light border border-border p-8">
        <div className="flex items-center gap-2 mb-3">
          <Check size={16} strokeWidth={1.5} className="text-primary" />
          <span className="text-[13px] text-primary font-body">Heute abgeschlossen</span>
        </div>
        <h2 className="font-display text-xl text-foreground leading-tight">{task.title}</h2>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-primary p-8">
      <p className="text-[10px] uppercase tracking-label text-primary-foreground/50 mb-4">
        Heutige Aufgabe
      </p>
      <h2 className="font-display text-2xl text-primary-foreground leading-tight mb-2">
        {task.title}
      </h2>
      {task.description && (
        <p className="text-[13px] text-primary-foreground/60 font-light line-clamp-2 mb-5">
          {task.description}
        </p>
      )}
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-block rounded-lg px-2.5 py-1 text-[11px] tracking-label uppercase bg-[rgba(255,255,255,0.15)] text-primary-foreground/70">
          {catLabel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] bg-[rgba(255,255,255,0.15)] text-primary-foreground/70">
          <Clock size={11} strokeWidth={1.5} />
          {task.duration_min} Min
        </span>
      </div>
      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-[10px] bg-card text-primary px-5 py-2.5 text-sm font-body font-medium hover:opacity-90 transition-opacity"
      >
        Aufgabe starten
        <ArrowRight size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
