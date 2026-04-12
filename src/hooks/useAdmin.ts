import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  return useQuery({
    queryKey: ["admin-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const [
        { count: totalUsers },
        { count: usersLastWeek },
        { count: usersTwoWeeksAgo },
        { data: tierCounts },
        { count: tasksToday },
        { count: tasksWeek },
        { count: forumToday },
        { count: coachingWeek },
        { data: topUsers },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", twoWeeksAgo.toISOString()).lt("created_at", weekAgo.toISOString()),
        supabase.from("profiles").select("tier"),
        supabase.from("task_completions").select("*", { count: "exact", head: true }).gte("completed_at", todayStart),
        supabase.from("task_completions").select("*", { count: "exact", head: true }).gte("completed_at", weekAgo.toISOString()),
        supabase.from("forum_posts").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("bookings").select("*", { count: "exact", head: true }).gte("session_date", weekAgo.toISOString()),
        supabase.from("profiles").select("id, name, xp_points, streak_current, tier").order("xp_points", { ascending: false }).limit(5),
      ]);

      const proCount = tierCounts?.filter(p => p.tier === "pro").length ?? 0;
      const eliteCount = tierCounts?.filter(p => p.tier === "elite").length ?? 0;

      return {
        totalUsers: totalUsers ?? 0,
        newUsersThisWeek: usersLastWeek ?? 0,
        newUsersPrevWeek: usersTwoWeeksAgo ?? 0,
        proSubscribers: proCount,
        eliteSubscribers: eliteCount,
        tasksToday: tasksToday ?? 0,
        tasksWeek: tasksWeek ?? 0,
        forumPostsToday: forumToday ?? 0,
        coachingWeek: coachingWeek ?? 0,
        topUsers: topUsers ?? [],
      };
    },
    staleTime: 30_000,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, tier, xp_points, streak_current, created_at, avatar_url, level")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useAdminTasks() {
  return useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useAdminCoaches() {
  return useQuery({
    queryKey: ["admin-coaches"],
    queryFn: async () => {
      const { data } = await supabase.from("coaches").select("*");
      return data ?? [];
    },
  });
}

export function useAdminBlockPrograms() {
  return useQuery({
    queryKey: ["admin-block-programs"],
    queryFn: async () => {
      const { data } = await supabase.from("block_programs").select("*");
      return data ?? [];
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("forum_reports")
        .select("*, forum_posts(title, user_id), forum_comments(content, user_id)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useAdminForumPosts() {
  return useQuery({
    queryKey: ["admin-forum-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [
        { data: tierData },
        { data: taskCompletions },
        { data: forumPosts },
        { data: profiles },
        { data: blockProgress },
      ] = await Promise.all([
        supabase.from("profiles").select("tier"),
        supabase.from("task_completions").select("task_id, tasks(title, category)"),
        supabase.from("forum_posts").select("category"),
        supabase.from("profiles").select("streak_current"),
        supabase.from("block_progress").select("completed_at"),
      ]);

      // Tier distribution
      const tiers = { free: 0, pro: 0, elite: 0 };
      tierData?.forEach(p => { tiers[p.tier as keyof typeof tiers]++; });

      // Most completed tasks
      const taskCounts: Record<string, { title: string; count: number }> = {};
      taskCompletions?.forEach((tc: any) => {
        const title = tc.tasks?.title ?? "Unbekannt";
        if (!taskCounts[title]) taskCounts[title] = { title, count: 0 };
        taskCounts[title].count++;
      });
      const topTasks = Object.values(taskCounts).sort((a, b) => b.count - a.count).slice(0, 10);

      // Forum categories
      const catCounts: Record<string, number> = {};
      forumPosts?.forEach(p => {
        catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;
      });

      // Average streak
      const streaks = profiles?.map(p => p.streak_current) ?? [];
      const avgStreak = streaks.length > 0 ? streaks.reduce((a, b) => a + b, 0) / streaks.length : 0;

      // Block breaker completion rate
      const totalBlocks = blockProgress?.length ?? 0;
      const completedBlocks = blockProgress?.filter(b => b.completed_at).length ?? 0;
      const blockCompletionRate = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

      return {
        tiers,
        topTasks,
        forumCategories: catCounts,
        avgStreak: Math.round(avgStreak * 10) / 10,
        blockCompletionRate: Math.round(blockCompletionRate),
        totalBlocks,
        completedBlocks,
      };
    },
    staleTime: 60_000,
  });
}
