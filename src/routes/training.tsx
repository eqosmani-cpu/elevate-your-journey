import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/navigation/AppShell";
import { TaskCard } from "@/components/ui/TaskCard";
import { Brain, Crosshair } from "lucide-react";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training — MindPitch" },
      { name: "description", content: "Mentale Übungen und Block Breaker." },
    ],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
        <h1 className="text-xl font-display font-bold text-foreground mb-1">Training</h1>
        <p className="text-xs text-muted-foreground mb-6">Deine mentalen Übungen & Tools</p>

        {/* Block Breaker highlight */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-8 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Crosshair size={18} className="text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">Block Breaker Pro</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Identifiziere und überwinde mentale Blockaden mit gezielten Techniken.
            </p>
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <Brain size={14} />
              Jetzt starten →
            </button>
          </div>
        </div>

        {/* Tasks */}
        <h2 className="font-display font-semibold text-sm mb-3">Übungen</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <TaskCard title="Atemtechnik für Ruhe" category="Achtsamkeit" duration="5 Min." difficulty={1} />
          <TaskCard title="Tor-Visualisierung" category="Visualisierung" duration="8 Min." difficulty={3} />
          <TaskCard title="Selbstgespräch optimieren" category="Motivation" duration="10 Min." difficulty={4} />
          <TaskCard title="Drucksituation meistern" category="Fokus" duration="12 Min." difficulty={5} />
          <TaskCard title="Fehler loslassen" category="Resilienz" duration="7 Min." difficulty={2} />
          <TaskCard title="Spielfreude finden" category="Motivation" duration="6 Min." difficulty={2} />
        </div>
      </div>
    </AppShell>
  );
}
