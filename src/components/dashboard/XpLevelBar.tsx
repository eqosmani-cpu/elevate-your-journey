import { getLevelLabel, LEVEL_THRESHOLDS } from "./DashboardHeader";
import { Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface XpLevelBarProps {
  profile: Profile;
}

export function XpLevelBar({ profile }: XpLevelBarProps) {
  const currentLevel = LEVEL_THRESHOLDS.find((t) => t.level === profile.level) ?? LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS.find((t) => t.level === profile.level + 1);
  const xpInLevel = profile.xp_points - currentLevel.minXp;
  const xpNeeded = (nextLevel?.minXp ?? currentLevel.maxXp + 1) - currentLevel.minXp;
  const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

  const currentLabel = getLevelLabel(profile.level);
  const nextLabel = nextLevel?.label ?? "Max";

  return (
    <Link to="/progress" className="block rounded-2xl bg-card border border-border p-4 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <BarChart3 size={14} className="text-primary" />
          <span className="text-xs font-display font-semibold text-foreground">
            Level {profile.level}: {currentLabel}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {profile.xp_points} XP
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
          {nextLevel ? `Noch ${Math.max(0, nextLevel.minXp - profile.xp_points)} XP bis` : "Maximales Level!"}
        </span>
        <span className="text-[10px] font-display font-semibold text-primary">
          {nextLabel} →
        </span>
      </div>
    </Link>
  );
}
