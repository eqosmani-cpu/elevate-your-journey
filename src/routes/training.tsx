import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { TaskFilters } from "@/components/training/TaskFilters";
import { WeeklyPlan } from "@/components/training/WeeklyPlan";
import { useTasks, useTaskCompletions } from "@/hooks/useTrainingData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Lock, Check, ChevronRight, Eye, Shield, Target, Users, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTierGate } from "@/hooks/useTierGate";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
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

const categoryIcons: Record<string, React.ReactNode> = {
  focus: <Target size={16} strokeWidth={1.5} />,
  confidence: <Shield size={16} strokeWidth={1.5} />,
  pressure: <Sparkles size={16} strokeWidth={1.5} />,
  team: <Users size={16} strokeWidth={1.5} />,
  recovery: <Heart size={16} strokeWidth={1.5} />,
  visualization: <Eye size={16} strokeWidth={1.5} />,
};

const categoryBgColors: Record<string, string> = {
  focus: "bg-[#EAF0F5] text-[#5A7A9B]",
  confidence: "bg-[#EAF5EC] text-[#4A7A52]",
  pressure: "bg-[#F5EAF0] text-[#8A5A6A]",
  team: "bg-[#F0EAF5] text-[#6A5A8A]",
  recovery: "bg-[#F5F0EA] text-[#8A7A5A]",
  visualization: "bg-[#EAF5F5] text-[#5A8A8A]",
};

const difficultyDots: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

function TrainingPage() {
  const [category, setCategory] = useState("all");
  const { upgradeOpen, setUpgradeOpen, highlightTier, requireTier, hasAccess } = useTierGate();

  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: completions } = useTaskCompletions();

  const completedIds = useMemo(
    () => new Set((completions ?? []).map((c) => c.task_id)),
    [completions]
  );

  const weeklyCompletionCount = useMemo(() => {
    if (!completions) return 0;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    return completions.filter((c) => new Date(c.completed_at) >= weekStart).length;
  }, [completions]);

  const freeTaskLimitReached = !hasAccess("pro") && weeklyCompletionCount >= 3;

  const filtered = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      return true;
    });
  }, [tasks, category]);

  const handleTaskClick = (task: Tables<"tasks">) => {
    if (task.tier_required !== "free" && !requireTier(task.tier_required as "pro" | "elite")) return false;
    if (freeTaskLimitReached && !requireTier("pro")) return false;
    return true;
  };

  return (
    <AppShell>
      <div className="max-w-[800px] mx-auto px-5 py-8 md:px-8 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl text-foreground tracking-[-0.5px]">Training</h1>
          <p className="text-sm text-tertiary font-light mt-1.5">
            Tägliche mentale Übungen für deinen Fortschritt.
          </p>
        </div>

        {/* Free limit warning */}
        {freeTaskLimitReached && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-6 text-center">
            <p className="text-sm text-foreground mb-1">Wochenlimit erreicht (3/3)</p>
            <p className="text-xs text-tertiary font-light mb-3">Upgrade auf Pro für unbegrenzte Aufgaben.</p>
            <button
              onClick={() => requireTier("pro")}
              className="text-[13px] text-primary hover:opacity-70 transition-opacity"
            >
              Upgrade auf Pro →
            </button>
          </div>
        )}

        {/* Weekly plan */}
        <div className="mb-8">
          <WeeklyPlan />
        </div>

        {/* Filters */}
        <TaskFilters
          category={category}
          onCategoryChange={setCategory}
        />

        {/* Task list */}
        <div className="mt-4 space-y-2">
          {tasksLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-5 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-tertiary text-sm font-light">Keine Übungen gefunden.</p>
            </div>
          ) : (
            filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                completed={completedIds.has(task.id)}
                onGatedClick={handleTaskClick}
              />
            ))
          )}
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} highlightTier={highlightTier} />
    </AppShell>
  );
}

function TaskRow({ task, completed, onGatedClick }: { task: Tables<"tasks">; completed: boolean; onGatedClick: (task: Tables<"tasks">) => boolean }) {
  const isLocked = task.tier_required !== "free";
  const dots = difficultyDots[task.difficulty] ?? 1;
  const icon = categoryIcons[task.category] ?? <Target size={16} strokeWidth={1.5} />;
  const iconBg = categoryBgColors[task.category] ?? "bg-muted text-tertiary";

  const content = (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl bg-card border border-border px-5 py-5 transition-all duration-200",
        !isLocked && !completed && "hover:translate-y-[-1px] hover:shadow-sm",
        isLocked && "opacity-50",
        completed && "opacity-70"
      )}
    >
      {/* Category icon */}
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "text-[15px] leading-snug",
          completed ? "text-tertiary" : "text-foreground"
        )}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-tertiary">{task.duration_min} Min.</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-[5px] h-[5px] rounded-full",
                  i < dots ? "bg-primary" : "bg-[#E0E0E0]"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right action */}
      <div className="shrink-0">
        {completed ? (
          <Check size={16} strokeWidth={1.5} className="text-primary" />
        ) : isLocked ? (
          <Lock size={14} strokeWidth={1.5} className="text-tertiary" />
        ) : (
          <ChevronRight size={16} strokeWidth={1.5} className="text-tertiary" />
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <button onClick={() => onGatedClick(task)} className="text-left w-full">
        {content}
      </button>
    );
  }

  return (
    <Link
      to="/training/$taskId"
      params={{ taskId: task.id }}
      onClick={(e) => {
        if (!onGatedClick(task)) e.preventDefault();
      }}
    >
      {content}
    </Link>
  );
}
