import { getLevelLabel } from "./DashboardHeader";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface XpLevelBarProps {
  profile: Profile;
}

export function XpLevelBar({ profile }: XpLevelBarProps) {
  const xpForCurrentLevel = (profile.level - 1) * 500;
  const xpForNextLevel = profile.level * 500;
  const xpInLevel = profile.xp_points - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

  const currentLabel = getLevelLabel(profile.level);
  const nextLabel = getLevelLabel(profile.level + 1);

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-display font-semibold text-foreground">
          Level {profile.level}: {currentLabel}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {profile.xp_points} / {xpForNextLevel} XP
        </span>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden mb-1.5">
        <div
          className="h-full rounded-full gradient-neon transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            filter: "drop-shadow(0 0 6px oklch(0.85 0.22 155 / 0.5))",
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Noch {Math.max(0, xpForNextLevel - profile.xp_points)} XP bis
        </span>
        <span className="text-[10px] font-display font-semibold text-primary">
          {nextLabel}
        </span>
      </div>
    </div>
  );
}
