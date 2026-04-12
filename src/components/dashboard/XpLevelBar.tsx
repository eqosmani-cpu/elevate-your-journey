import { getLevelLabel, LEVEL_THRESHOLDS } from "./DashboardHeader";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
    <Link to="/progress" className="block rounded-2xl bg-card border border-border p-5 shadow-xs card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-body font-medium text-foreground">
          Level {profile.level} · {currentLabel}
        </span>
        <span className="text-[12px] text-muted-foreground font-light">
          {profile.xp_points} XP
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-light">
          {nextLevel ? `Noch ${Math.max(0, nextLevel.minXp - profile.xp_points)} XP` : "Maximales Level"}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
          {nextLabel}
          <ArrowRight size={10} strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
