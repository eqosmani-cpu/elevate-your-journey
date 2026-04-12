import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/navigation/AppShell";
import { GreenButton } from "@/components/ui/GreenButton";
import { CalendarDays, Clock, Video, Star } from "lucide-react";

export const Route = createFileRoute("/coaching")({
  head: () => ({
    meta: [
      { title: "Coaching — MindPitch" },
      { name: "description", content: "Buche eine 1:1 Coaching-Session." },
    ],
  }),
  component: CoachingPage,
});

const coaches = [
  { id: 1, name: "Dr. Anna Weber", specialty: "Sport-Psychologie", rating: 4.9, sessions: 340, available: true },
  { id: 2, name: "Markus Stein", specialty: "Performance-Coaching", rating: 4.8, sessions: 215, available: true },
  { id: 3, name: "Julia Hartmann", specialty: "Achtsamkeit & Fokus", rating: 4.7, sessions: 180, available: false },
];

function CoachingPage() {
  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
        <h1 className="text-xl font-display font-bold text-foreground mb-1">Coaching</h1>
        <p className="text-xs text-muted-foreground mb-6">Buche eine 1:1 Session mit einem Mental-Coach</p>

        {/* Next session banner */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={16} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Nächste Session</span>
          </div>
          <p className="text-sm font-display font-semibold text-foreground mb-1">
            Dienstag, 15. April — 18:00 Uhr
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Video size={12} />
              <span>Video-Call</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>45 Min.</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">mit Dr. Anna Weber</p>
        </div>

        {/* Coaches */}
        <h2 className="font-display font-semibold text-sm mb-3">Verfügbare Coaches</h2>
        <div className="space-y-3">
          {coaches.map((coach) => (
            <div key={coach.id} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center text-lg font-display font-bold text-foreground shrink-0">
                {coach.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm text-card-foreground">{coach.name}</h3>
                <p className="text-[11px] text-muted-foreground">{coach.specialty}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="text-chart-3 fill-chart-3" />
                    <span>{coach.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{coach.sessions} Sessions</span>
                </div>
              </div>
              <GreenButton size="sm" disabled={!coach.available}>
                {coach.available ? "Buchen" : "Belegt"}
              </GreenButton>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
