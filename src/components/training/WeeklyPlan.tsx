import { useWeeklyActivity, useProfile } from "@/hooks/useTrainingData";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function WeeklyPlan() {
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyActivity();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (weeklyLoading || profileLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const today = new Date().toDateString();
  const streak = profile?.streak_current ?? 0;

  return (
    <div>
      {/* Streak label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-tertiary">Wochenübersicht</span>
        <span className="text-xs text-tertiary">
          {streak > 0 ? `${streak} Tage Streak` : "Kein aktiver Streak"}
        </span>
      </div>

      {/* Day dots */}
      <div className="flex items-center justify-between mb-4">
        {weekly?.weekDates.map((date, i) => {
          const dateStr = date.toDateString();
          const isToday = dateStr === today;
          const isActive = weekly.activeDays.has(dateStr);
          const isFuture = date > new Date();

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-tertiary">{dayLabels[i]}</span>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[11px] transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isToday && !isActive && "ring-1.5 ring-foreground/20 text-foreground",
                  !isToday && !isActive && !isFuture && "bg-muted/50 text-tertiary",
                  isFuture && !isActive && "text-tertiary/40"
                )}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between text-[11px] text-tertiary mb-1.5">
        <span>{weekly?.activeDayCount ?? 0} von 7 Tagen aktiv</span>
        <span>{Math.round(((weekly?.activeDayCount ?? 0) / 7) * 100)}%</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${((weekly?.activeDayCount ?? 0) / 7) * 100}%` }}
        />
      </div>
    </div>
  );
}
