import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  useUserBadges,
  useAllBadges,
  useWeeklyLeaderboard,
  useUserRank,
  useXpHistory,
  useCompletionHeatmap,
} from "@/hooks/useGamification";
import { getLevelLabel, LEVEL_THRESHOLDS } from "@/components/dashboard/DashboardHeader";
import { TierBadge } from "@/components/ui/TierBadge";
import { ArrowLeft, Trophy, Flame, Target, BarChart3, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Fortschritt — MindPitch" },
      { name: "description", content: "Deine Statistiken, Badges und Leaderboard." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { profile, isLoading: dashLoading } = useDashboardData();
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges();
  const { data: allBadges } = useAllBadges();
  const { data: leaderboard, isLoading: lbLoading } = useWeeklyLeaderboard();
  const { data: userRank } = useUserRank();
  const { data: xpHistory } = useXpHistory(30);
  const { data: heatmapData } = useCompletionHeatmap();

  const isLoading = dashLoading || badgesLoading;

  // XP chart data (aggregate by day)
  const chartData = useMemo(() => {
    if (!xpHistory) return [];
    const byDay: Record<string, number> = {};
    xpHistory.forEach((entry) => {
      const day = new Date(entry.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      byDay[day] = (byDay[day] ?? 0) + entry.points;
    });
    return Object.entries(byDay).map(([day, xp]) => ({ day, xp }));
  }, [xpHistory]);

  // Heatmap (last 90 days grid)
  const heatmapGrid = useMemo(() => {
    if (!heatmapData) return [];
    const counts: Record<string, number> = {};
    heatmapData.forEach((c) => {
      const day = new Date(c.completed_at).toISOString().slice(0, 10);
      counts[day] = (counts[day] ?? 0) + 1;
    });

    const days: { date: string; count: number }[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: counts[key] ?? 0 });
    }
    return days;
  }, [heatmapData]);

  // Earned badge slugs
  const earnedSlugs = useMemo(
    () => new Set((userBadges ?? []).map((ub: any) => ub.badges?.slug)),
    [userBadges]
  );

  if (isLoading || !profile) {
    return (
      <AppShell>
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </AppShell>
    );
  }

  const currentLevel = LEVEL_THRESHOLDS.find((t) => t.level === profile.level) ?? LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS.find((t) => t.level === profile.level + 1);
  const xpInLevel = profile.xp_points - currentLevel.minXp;
  const xpNeeded = (nextLevel?.minXp ?? currentLevel.maxXp + 1) - currentLevel.minXp;
  const progress = Math.min(100, (xpInLevel / xpNeeded) * 100);

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-24 space-y-6">
        <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-primary" />
          <h1 className="font-display font-bold text-xl text-foreground">Fortschritt</h1>
        </div>

        {/* Level overview */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-bold text-foreground text-lg">Level {profile.level}</h2>
              <p className="text-xs text-primary font-semibold">{getLevelLabel(profile.level)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{profile.xp_points}</p>
              <p className="text-[11px] text-muted-foreground">XP gesamt</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden mb-2">
            <div
              className="h-full rounded-full gradient-neon transition-all duration-700"
              style={{ width: `${progress}%`, filter: "drop-shadow(0 0 6px oklch(0.85 0.22 155 / 0.5))" }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{getLevelLabel(profile.level)}</span>
            {nextLevel && <span>{Math.max(0, nextLevel.minXp - profile.xp_points)} XP bis {nextLevel.label}</span>}
          </div>

          {/* Level milestones */}
          <div className="flex items-center justify-between mt-4 gap-1">
            {LEVEL_THRESHOLDS.map((t) => (
              <div key={t.level} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all",
                  profile.level >= t.level
                    ? "gradient-neon text-primary-foreground glow-neon"
                    : "bg-muted text-muted-foreground"
                )}>
                  {t.level}
                </div>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak & stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <Flame size={24} className="text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{profile.streak_current}</p>
            <p className="text-[11px] text-muted-foreground">Tage Streak</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <Trophy size={24} className="text-chart-3 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{profile.streak_longest}</p>
            <p className="text-[11px] text-muted-foreground">Längster Streak</p>
          </div>
        </div>

        {/* XP Chart */}
        {chartData.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">XP der letzten 30 Tage</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="oklch(0.85 0.22 155)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "oklch(0.85 0.22 155)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Heatmap */}
        {heatmapGrid.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Aktivitäts-Heatmap (90 Tage)</h3>
            <div className="flex flex-wrap gap-[3px]">
              {heatmapGrid.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count} Aufgaben`}
                  className={cn(
                    "w-3 h-3 rounded-sm transition-colors",
                    d.count === 0 && "bg-muted",
                    d.count === 1 && "bg-primary/30",
                    d.count === 2 && "bg-primary/50",
                    d.count >= 3 && "bg-primary glow-neon"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <Medal size={16} className="text-chart-3" />
            Badges
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(allBadges ?? []).map((badge) => {
              const earned = earnedSlugs.has(badge.slug);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "rounded-xl p-3 text-center border transition-all",
                    earned
                      ? "bg-primary/5 border-primary/30"
                      : "bg-muted/30 border-border opacity-40"
                  )}
                >
                  <span className="text-2xl block mb-1">{badge.emoji}</span>
                  <p className={cn("text-[11px] font-semibold", earned ? "text-foreground" : "text-muted-foreground")}>
                    {badge.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
            <Crown size={16} className="text-tier-elite" />
            Wöchentliches Leaderboard
          </h3>

          {lbLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (leaderboard ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Noch keine Daten diese Woche.</p>
          ) : (
            <div className="space-y-2">
              {(leaderboard ?? []).map((entry: any) => {
                const isTop3 = entry.rank <= 3;
                const rankEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : "";
                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                      isTop3 ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"
                    )}
                  >
                    <span className={cn("w-8 text-center font-bold text-sm", isTop3 ? "text-primary" : "text-muted-foreground")}>
                      {rankEmoji || `#${entry.rank}`}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{entry.user_name}</span>
                    <span className="text-xs font-bold text-primary">{entry.weekly_xp} XP</span>
                  </div>
                );
              })}

              {/* User's own rank */}
              {userRank && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/30 px-3 py-2.5">
                    <span className="w-8 text-center font-bold text-sm text-primary">#{userRank.rank}</span>
                    <span className="flex-1 text-sm font-medium text-foreground">Du</span>
                    <span className="text-xs font-bold text-primary">{userRank.weekly_xp} XP</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tier */}
        <div className="flex justify-center">
          <TierBadge tier={profile.tier as "free" | "pro" | "elite"} />
        </div>
      </div>
    </AppShell>
  );
}
