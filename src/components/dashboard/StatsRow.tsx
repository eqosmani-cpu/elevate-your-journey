import type { Database } from "@/integrations/supabase/types";
import { getLevelLabel } from "./DashboardHeader";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface StatsRowProps {
  profile: Profile;
  tasksThisWeek: number;
}

export function StatsRow({ profile, tasksThisWeek }: StatsRowProps) {
  const levelLabel = getLevelLabel(profile.level);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-2xl bg-card border border-border p-6">
        <p className="text-[10px] uppercase tracking-label text-tertiary mb-2">Streak</p>
        <p className="font-display text-[32px] text-foreground leading-none">{profile.streak_current}</p>
        <p className="text-xs text-tertiary mt-1">Tage aktiv</p>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <p className="text-[10px] uppercase tracking-label text-tertiary mb-2">Aufgaben</p>
        <p className="font-display text-[32px] text-foreground leading-none">
          {tasksThisWeek}<span className="text-muted-foreground font-body text-base font-light"> / 7</span>
        </p>
        <p className="text-xs text-tertiary mt-1">diese Woche</p>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <p className="text-[10px] uppercase tracking-label text-tertiary mb-2">Niveau</p>
        <p className="font-display text-[32px] text-foreground leading-none truncate">{levelLabel}</p>
        <p className="text-xs text-tertiary mt-1">{profile.xp_points} XP</p>
      </div>
    </div>
  );
}
