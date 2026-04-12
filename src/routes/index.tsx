import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/navigation/AppShell";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { TierBadge } from "@/components/ui/TierBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { TaskCard } from "@/components/ui/TaskCard";
import { GreenButton } from "@/components/ui/GreenButton";
import { Target, TrendingUp, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindPitch — Mental Coaching für Fußballer" },
      { name: "description", content: "Dein Mental-Coach für maximale Performance auf dem Platz." },
      { property: "og:title", content: "MindPitch — Mental Coaching für Fußballer" },
      { property: "og:description", content: "Dein Mental-Coach für maximale Performance auf dem Platz." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <UserAvatar name="Max Müller" level={7} xpProgress={65} size="md" />
            <div>
              <h1 className="text-lg font-display font-bold text-foreground leading-tight">
                Hey, Max 👋
              </h1>
              <p className="text-xs text-muted-foreground">Bereit für dein Training?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StreakBadge count={12} />
            <TierBadge tier="pro" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Target, label: "Fokus-Score", value: "78%", color: "text-primary" },
            { icon: TrendingUp, label: "Woche", value: "5/7", color: "text-chart-5" },
            { icon: Award, label: "XP Gesamt", value: "2.450", color: "text-chart-3" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-card border border-border p-3 text-center">
              <stat.icon size={18} className={`${stat.color} mx-auto mb-1.5`} />
              <p className={`font-display font-bold text-base ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Progress section */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm">Wochenziel</h2>
            <span className="text-xs text-muted-foreground">5 von 7 Übungen</span>
          </div>
          <div className="flex items-center gap-5">
            <ProgressRing progress={71} size={72} strokeWidth={5}>
              <span className="text-sm font-display font-bold text-primary">71%</span>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-2">Noch 2 Übungen bis zum Wochenziel</p>
              <GreenButton size="sm">Weitertrainieren</GreenButton>
            </div>
          </div>
        </div>

        {/* Recommended tasks */}
        <div className="mb-6">
          <h2 className="font-display font-semibold text-sm mb-3">Empfohlene Übungen</h2>
          <div className="grid gap-3">
            <TaskCard
              title="Vor-Spiel Visualisierung"
              category="Visualisierung"
              duration="10 Min."
              difficulty={3}
            />
            <TaskCard
              title="Fokus unter Druck halten"
              category="Fokus"
              duration="8 Min."
              difficulty={4}
            />
            <TaskCard
              title="Comeback-Mindset nach Rückstand"
              category="Resilienz"
              duration="12 Min."
              difficulty={5}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
