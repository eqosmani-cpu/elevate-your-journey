import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/login" });
        return;
      }

      // Check onboarding status
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
      if (!session) {
        navigate({ to: "/login" });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!authChecked || !isAuthenticated) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AuthenticatedDashboard />
    </AppShell>
  );
}

function AuthenticatedDashboard() {
  const {
    profile,
    todayTask,
    todayCompleted,
    tasksThisWeek,
    activeBlock,
    nextBooking,
    trendingPosts,
    unreadNotifications,
    isLoading,
  } = useDashboardData();
  const navigate = useNavigate();
  const { task: aiTask, loading: aiLoading, generate: generateAiTask, clear: clearAiTask } = useAiTaskGenerator();

  if (isLoading || !profile) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <DashboardHeader
        profile={profile}
        unreadNotifications={unreadNotifications}
      />

      {/* Today's task */}
      {todayTask && (
        <TodayCard
          task={todayTask}
          completed={todayCompleted}
          onStart={() => navigate({ to: "/training" })}
        />
      )}

      {/* AI Task Generator */}
      {aiTask ? (
        <AiTaskCard
          task={aiTask}
          onStart={() => navigate({ to: "/training" })}
          onDismiss={clearAiTask}
        />
      ) : (
        <AiGenerateButton
          loading={aiLoading}
          onClick={() => generateAiTask()}
          label="Personalisierte Aufgabe generieren ✨"
          className="w-full"
        />
      )}

      {/* Stats row */}
      <StatsRow
        tasksThisWeek={tasksThisWeek}
        activeBlock={activeBlock}
        nextBooking={nextBooking}
      />

      {/* Community highlight */}
      <CommunityHighlight posts={trendingPosts} />

      {/* Motivational quote */}
      <MotivationalQuote />

      {/* Quick actions */}
      <QuickActions />

      {/* XP level bar */}
      <XpLevelBar profile={profile} />
    </div>
  );
}
