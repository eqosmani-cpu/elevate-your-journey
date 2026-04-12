import { Link } from "@tanstack/react-router";
import { Play, MessageSquarePlus, Calendar, Crosshair } from "lucide-react";

const actions = [
  { icon: Play, label: "Aufgabe starten", to: "/training" as const, color: "text-primary" },
  { icon: MessageSquarePlus, label: "Frage stellen", to: "/community" as const, color: "text-chart-5" },
  { icon: Calendar, label: "Coach buchen", to: "/coaching" as const, color: "text-chart-3" },
  { icon: Crosshair, label: "Block lösen", to: "/training" as const, color: "text-chart-4" },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="font-display font-semibold text-sm text-foreground mb-3">Schnellzugriff</h2>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 gap-1.5 transition-all duration-200 hover:border-primary/30 hover:bg-card/80 active:scale-[0.97]"
          >
            <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
              <action.icon size={18} className={action.color} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
