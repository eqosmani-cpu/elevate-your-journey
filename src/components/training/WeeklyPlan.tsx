import { useWeeklyActivity, useProfile } from "@/hooks/useTrainingData";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function WeeklyPlan() {
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyActivity();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (weeklyLoading || profileLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  const today = new Date().toDateString();
  const streak = profile?.streak_current ?? 0;

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-sm text-foreground">Wochenplan</h2>
        <div className="flex items-center gap-1.5">
          <Flame size={16} className={cn("transition-colors", streak > 0 ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-sm font-bold font-display", streak > 0 ? "text-primary glow-neon-text" : "text-muted-foreground")}>
            {streak} Tage
          </span>
        </div>
      </div>

      {/* Calendar strip */}
      <div className="flex items-center justify-between mb-4">
        {weekly?.weekDates.map((date, i) => {
          const dateStr = date.toDateString();
          const isToday = dateStr === today;
          const isActive = weekly.activeDays.has(dateStr);
          const isFuture = date > new Date();

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">{dayLabels[i]}</span>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all",
                  isActive && "bg-primary text-primary-foreground glow-neon",
                  isToday && !isActive && "ring-2 ring-foreground/30 text-foreground",
                  !isToday && !isActive && !isFuture && "bg-muted/50 text-muted-foreground",
                  isFuture && !isActive && "bg-muted/20 text-muted-foreground/50"
                )}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground">
            {weekly?.activeDayCount ?? 0} von 7 Tagen aktiv
          </span>
          <span className="text-[11px] text-primary font-semibold">
            {Math.round(((weekly?.activeDayCount ?? 0) / 7) * 100)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 glow-neon"
            style={{ width: `${((weekly?.activeDayCount ?? 0) / 7) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
