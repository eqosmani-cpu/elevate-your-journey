import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const MILESTONE_BONUS: Record<number, number> = {
  3: 10, 7: 50, 14: 30, 30: 75, 60: 100, 100: 200,
};

export function useStreakTracker() {
  const prevStreak = useRef<number | null>(null);

  const checkStreakMilestones = useCallback(async (currentStreak: number) => {
    if (prevStreak.current === null) {
      prevStreak.current = currentStreak;
      return;
    }
    if (currentStreak === prevStreak.current) return;

    // Check if we just hit a milestone
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak >= milestone && (prevStreak.current ?? 0) < milestone) {
        toast.success(`🔥 ${milestone}-Tage Streak! +${MILESTONE_BONUS[milestone]} XP Bonus`, {
          duration: 5000,
        });

        // Award badge and bonus XP
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.rpc("add_xp", {
            _user_id: user.id,
            _points: MILESTONE_BONUS[milestone],
            _reason: `${milestone}-Tage Streak Bonus`,
            _source: "streak_bonus",
          });
          await supabase.rpc("award_badge", {
            _user_id: user.id,
            _badge_slug: `streak_${milestone}`,
          });
        }
      }
    }

    prevStreak.current = currentStreak;
  }, []);

  return { checkStreakMilestones };
}

export function useDailyLoginXp() {
  const hasAwarded = useRef(false);

  useEffect(() => {
    if (hasAwarded.current) return;

    const awardLoginXp = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already awarded today
      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabase
        .from("xp_log")
        .select("id")
        .eq("user_id", user.id)
        .eq("source", "login")
        .gte("created_at", `${today}T00:00:00Z`)
        .limit(1);

      if (existing && existing.length > 0) return;

      hasAwarded.current = true;
      await supabase.rpc("add_xp", {
        _user_id: user.id,
        _points: 5,
        _reason: "Erster Login des Tages",
        _source: "login",
      });

      // Also update streak
      await supabase.rpc("check_and_update_streak", { _user_id: user.id });
    };

    awardLoginXp();
  }, []);
}
