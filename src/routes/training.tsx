import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { TaskFilters } from "@/components/training/TaskFilters";
import { WeeklyPlan } from "@/components/training/WeeklyPlan";
import { useTasks, useTaskCompletions } from "@/hooks/useTrainingData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Clock, Lock, CheckCircle2, Brain, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training — MindPitch" },
      { name: "description", content: "Mentale Übungen und Block Breaker." },
    ],
  }),
  component: TrainingPage,
});

const categoryLabels: Record<string, string> = {
  focus: "🎯 Fokus",
  confidence: "💪 Selbstvertrauen",
  pressure: "😤 Druck",
  team: "🤝 Team",
  recovery: "🏥 Recovery",
  visualization: "🧘 Visualisierung",
};

const categoryColors: Record<string, string> = {
  focus: "bg-chart-1/15 text-chart-1",
  confidence: "bg-chart-3/15 text-chart-3",
  pressure: "bg-destructive/15 text-destructive",
  team: "bg-chart-5/15 text-chart-5",
  recovery: "bg-chart-2/15 text-chart-2",
  visualization: "bg-chart-4/15 text-chart-4",
};

const difficultyDots: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

function TrainingPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [duration, setDuration] = useState("all");

  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: completions } = useTaskCompletions();

  const completedIds = useMemo(
    () => new Set((completions ?? []).map((c) => c.task_id)),
    [completions]
  );

  const filtered = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (duration === "short" && t.duration_min > 5) return false;
      if (duration === "medium" && (t.duration_min < 6 || t.duration_min > 10)) return false;
      if (duration === "long" && t.duration_min <= 10) return false;
      return true;
    });
  }, [tasks, category, search, duration]);

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-24">
        <h1 className="text-xl font-display font-bold text-foreground mb-1">Training</h1>
        <p className="text-xs text-muted-foreground mb-5">Deine mentalen Übungen & Tools</p>

        {/* Weekly plan */}
        <div className="mb-6">
          <WeeklyPlan />
        </div>

        {/* Block Breaker highlight */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-6 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Crosshair size={18} className="text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">Block Breaker Pro</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Identifiziere und überwinde mentale Blockaden mit gezielten Techniken.
            </p>
            <Link to="/blocks" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <Brain size={14} />
              Jetzt starten →
            </Link>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          search={search}
          category={category}
          duration={duration}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onDurationChange={setDuration}
        />

        {/* Task grid */}
        <div className="grid gap-3 sm:grid-cols-2 mt-5">
          {tasksLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-4 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <p className="text-muted-foreground text-sm">Keine Übungen gefunden.</p>
            </div>
          ) : (
            filtered.map((task) => (
              <TaskGridCard
                key={task.id}
                task={task}
                completed={completedIds.has(task.id)}
              />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

function TaskGridCard({ task, completed }: { task: Tables<"tasks">; completed: boolean }) {
  const isLocked = task.tier_required !== "free";
  const dots = difficultyDots[task.difficulty] ?? 1;
  const catLabel = categoryLabels[task.category] ?? task.category;
  const catColor = categoryColors[task.category] ?? "bg-muted text-muted-foreground";

  const content = (
    <div
      className={cn(
        "w-full text-left rounded-2xl bg-card p-4 border border-border transition-all duration-200",
        !isLocked && "hover:border-primary/30 hover:glow-neon",
        isLocked && "opacity-60",
        completed && "border-primary/20"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold", catColor)}>
          {catLabel}
        </span>
        {completed && <CheckCircle2 size={16} className="text-primary" />}
        {isLocked && <Lock size={14} className="text-muted-foreground" />}
      </div>

      <h3 className="font-display font-semibold text-card-foreground text-sm leading-snug mb-1">
        {task.title}
      </h3>
      {isLocked && (
        <p className="text-[10px] text-muted-foreground mb-1">🔒 Pro erforderlich</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Clock size={12} />
          <span>{task.duration_min} Min.</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                i < dots ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (isLocked) return <div>{content}</div>;

  return (
    <Link to="/training/$taskId" params={{ taskId: task.id }}>
      {content}
    </Link>
  );
}
