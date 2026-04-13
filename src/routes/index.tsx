import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { CommunityHighlight } from "@/components/dashboard/CommunityHighlight";
import { MotivationalQuote } from "@/components/dashboard/MotivationalQuote";
import { UpcomingCoaching } from "@/components/dashboard/UpcomingCoaching";
import { AiTaskCard, AiGenerateButton } from "@/components/ai/AiTaskCard";
import { useAiTaskGenerator } from "@/hooks/useAiCoach";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTierGate } from "@/hooks/useTierGate";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { LevelUpOverlay } from "@/components/gamification/LevelUpOverlay";
import { useDailyLoginXp, useStreakTracker } from "@/hooks/useStreakTracker";
import { supabase } from "@/integrations/supabase/client";
import { GreenButton } from "@/components/ui/GreenButton";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindPitch — Mental Coaching für Fußballer" },
      { name: "description", content: "Dein Mental-Coach für maximale Performance auf dem Platz." },
      { property: "og:title", content: "MindPitch — Mental Coaching für Fußballer" },
      { property: "og:description", content: "Dein Mental-Coach für maximale Performance auf dem Platz." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single();
      if (profile && !profile.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
      setIsAuthenticated(true);
      setAuthChecked(true);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate({ to: "/login" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!authChecked || !isAuthenticated) {
    return <AppShell><DashboardSkeleton /></AppShell>;
  }

  return <AppShell title="Übersicht"><AuthenticatedDashboard /></AppShell>;
}

function AuthenticatedDashboard() {
  const {
    profile, todayTask, todayCompleted, tasksThisWeek,
    activeBlock, nextBooking, trendingPosts, unreadNotifications, isLoading,
  } = useDashboardData();
  const navigate = useNavigate();
  const { task: aiTask, loading: aiLoading, generate: generateAiTask, clear: clearAiTask } = useAiTaskGenerator();
  const { upgradeOpen, setUpgradeOpen, highlightTier, requireTier, hasAccess, currentTier } = useTierGate();
  const { checkStreakMilestones } = useStreakTracker();
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const prevLevelRef = useRef<number | null>(null);

  useDailyLoginXp();

  useEffect(() => {
    if (!profile) return;
    if (prevLevelRef.current !== null && profile.level > prevLevelRef.current) {
      setLevelUpLevel(profile.level);
    }
    prevLevelRef.current = profile.level;
    checkStreakMilestones(profile.streak_current);
  }, [profile?.level, profile?.streak_current, checkStreakMilestones]);

  const [weeklyAiCount, setWeeklyAiCount] = useState(0);
  useEffect(() => {
    if (hasAccess("pro")) return;
  }, [hasAccess]);

  const handleGenerateAi = () => {
    if (!hasAccess("pro") && weeklyAiCount >= 1) {
      requireTier("pro");
      return;
    }
    generateAiTask();
    if (!hasAccess("pro")) setWeeklyAiCount((c) => c + 1);
  };

  if (isLoading || !profile) return <DashboardSkeleton />;

  const showUpgradePrompt = currentTier === "free" && tasksThisWeek >= 3;

  return (
    <div className="px-4 py-6 md:px-8 md:py-2 max-w-[800px] mx-auto space-y-8">
      <DashboardGreeting profile={profile} tasksThisWeek={tasksThisWeek} />

      <StatsRow profile={profile} tasksThisWeek={tasksThisWeek} />

      {todayTask && (
        <TodayCard task={todayTask} completed={todayCompleted} onStart={() => navigate({ to: "/training" })} />
      )}

      {showUpgradePrompt && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg text-foreground mb-1">Bereit für mehr?</h3>
          <p className="text-[13px] text-muted-foreground mb-4 font-light">
            Du hast diese Woche bereits {tasksThisWeek} Aufgaben abgeschlossen. Schalte unbegrenzte Aufgaben frei.
          </p>
          <GreenButton size="sm" onClick={() => requireTier("pro")}>
            Potenzial freischalten
            <ArrowRight size={14} strokeWidth={1.5} />
          </GreenButton>
        </div>
      )}

      {aiTask ? (
        <AiTaskCard task={aiTask} onStart={() => navigate({ to: "/training" })} onDismiss={clearAiTask} />
      ) : (
        <AiGenerateButton
          loading={aiLoading}
          onClick={handleGenerateAi}
          label={`Personalisierte Aufgabe generieren${!hasAccess("pro") ? ` (${1 - weeklyAiCount}/1)` : ""}`}
          className="w-full"
        />
      )}

      <CommunityHighlight posts={trendingPosts} />

      <UpcomingCoaching booking={nextBooking} />

      <MotivationalQuote />

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} highlightTier={highlightTier} />
      <LevelUpOverlay level={levelUpLevel} onDismiss={() => setLevelUpLevel(null)} />
    </div>
  );
}
