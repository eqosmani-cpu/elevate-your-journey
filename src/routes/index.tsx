import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { CommunityHighlight } from "@/components/dashboard/CommunityHighlight";
import { MotivationalQuote } from "@/components/dashboard/MotivationalQuote";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { XpLevelBar } from "@/components/dashboard/XpLevelBar";
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
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GreenButton } from "@/components/ui/GreenButton";
import { Sparkles } from "lucide-react";

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

  return <AppShell><AuthenticatedDashboard /></AppShell>;
}

function AuthenticatedDashboard() {
  const {
    profile, todayTask, todayCompleted, tasksThisWeek,
    activeBlock, nextBooking, trendingPosts, unreadNotifications, isLoading,
  } = useDashboardData();
  const navigate = useNavigate();
  const { task: aiTask, loading: aiLoading, generate: generateAiTask, clear: clearAiTask } = useAiTaskGenerator();
  const { upgradeOpen, setUpgradeOpen, highlightTier, requireTier, hasAccess, currentTier } = useTierGate();

  // Track weekly AI task count for free users
  const [weeklyAiCount, setWeeklyAiCount] = useState(0);
  useEffect(() => {
    if (hasAccess("pro")) return;
    const checkAiCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      // Rough proxy: count xp_log entries with source 'task' and reason containing 'KI'
      // For simplicity, we track locally per session
    };
    checkAiCount();
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

  // Show "Bereit für mehr?" after 3 completed tasks for free users
  const showUpgradePrompt = currentTier === "free" && tasksThisWeek >= 3;

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-6">
      <DashboardHeader profile={profile} unreadNotifications={unreadNotifications} />

      {todayTask && (
        <TodayCard task={todayTask} completed={todayCompleted} onStart={() => navigate({ to: "/training" })} />
      )}

      {/* Upgrade prompt after 3 tasks */}
      {showUpgradePrompt && (
        <div className="rounded-2xl border border-tier-pro/30 bg-tier-pro/5 p-5 text-center">
          <Sparkles size={24} className="text-tier-pro mx-auto mb-2" />
          <h3 className="font-display font-bold text-sm text-foreground mb-1">Bereit für mehr? 🚀</h3>
          <p className="text-[11px] text-muted-foreground mb-3">
            Du hast diese Woche bereits {tasksThisWeek} Aufgaben abgeschlossen. Schalte unbegrenzte Aufgaben und Block Breaker frei.
          </p>
          <GreenButton size="sm" onClick={() => requireTier("pro")}>
            Potenzial freischalten →
          </GreenButton>
        </div>
      )}

      {/* AI Task Generator */}
      {aiTask ? (
        <AiTaskCard task={aiTask} onStart={() => navigate({ to: "/training" })} onDismiss={clearAiTask} />
      ) : (
        <AiGenerateButton
          loading={aiLoading}
          onClick={handleGenerateAi}
          label={`Personalisierte Aufgabe generieren ✨${!hasAccess("pro") ? ` (${1 - weeklyAiCount}/1)` : ""}`}
          className="w-full"
        />
      )}

      <StatsRow tasksThisWeek={tasksThisWeek} activeBlock={activeBlock} nextBooking={nextBooking} />
      <CommunityHighlight posts={trendingPosts} />
      <MotivationalQuote />
      <QuickActions />
      <XpLevelBar profile={profile} />

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} highlightTier={highlightTier} />
    </div>
  );
}
