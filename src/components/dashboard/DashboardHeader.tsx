import { UserAvatar } from "@/components/ui/UserAvatar";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface DashboardHeaderProps {
  profile: Profile;
  unreadNotifications: number;
}

// Time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

// Level labels
export function getLevelLabel(level: number): string {
  const labels: Record<number, string> = {
    1: "Rookie",
    2: "Performer",
    3: "Challenger",
    4: "Elite Mindset",
    5: "Legend",
  };
  return labels[level] ?? "Legend";
}

export const LEVEL_THRESHOLDS = [
  { level: 1, label: "Rookie", minXp: 0, maxXp: 200 },
  { level: 2, label: "Performer", minXp: 201, maxXp: 500 },
  { level: 3, label: "Challenger", minXp: 501, maxXp: 1000 },
  { level: 4, label: "Elite Mindset", minXp: 1001, maxXp: 2000 },
  { level: 5, label: "Legend", minXp: 2001, maxXp: Infinity },
];

export function DashboardHeader({ profile, unreadNotifications }: DashboardHeaderProps) {
  const greeting = getGreeting();
  const displayName = profile.name || "Spieler";
  const firstName = displayName.split(" ")[0];
  const xpForNextLevel = profile.level * 500;
  const xpProgress = Math.min(100, (profile.xp_points / xpForNextLevel) * 100);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <UserAvatar
          name={displayName}
          imageUrl={profile.avatar_url || undefined}
          level={profile.level}
          xpProgress={xpProgress}
          size="md"
        />
        <div>
          <h1 className="text-lg font-display font-bold text-foreground leading-tight">
            {greeting}, {firstName} 👋
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {profile.xp_points} XP
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-primary font-semibold">
              Lvl {profile.level}: {getLevelLabel(profile.level)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StreakBadge count={profile.streak_current} />
        <button className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground">
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background" />
          )}
        </button>
      </div>
    </div>
  );
}
