import { Link } from "@tanstack/react-router";
import { Compass, MessageSquarePlus, Calendar, Crosshair } from "lucide-react";

const actions = [
  { icon: Compass, label: "Aufgabe starten", to: "/training" as const },
  { icon: MessageSquarePlus, label: "Frage stellen", to: "/community" as const },
  { icon: Calendar, label: "Coach buchen", to: "/coaching" as const },
  { icon: Crosshair, label: "Block lösen", to: "/training" as const },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="font-display text-lg text-foreground mb-4">Schnellzugriff</h2>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex flex-col items-center justify-center rounded-2xl bg-card border border-border p-3 gap-2 shadow-xs card-hover"
          >
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <action.icon size={18} strokeWidth={1.5} className="text-primary" />
            </div>
            <span className="text-[10px] font-body font-light text-muted-foreground text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
