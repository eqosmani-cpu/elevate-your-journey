import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskCompletion = Database["public"]["Tables"]["task_completions"]["Row"];
type ForumPost = Database["public"]["Tables"]["forum_posts"]["Row"];
type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type BlockProgress = Database["public"]["Tables"]["block_progress"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export interface DashboardData {
  profile: Profile | null;
  todayTask: Task | null;
  todayCompleted: boolean;
  tasksThisWeek: number;
  activeBlock: BlockProgress | null;
  nextBooking: Booking | null;
  trendingPosts: (ForumPost & { comment_count: number; author_name: string })[];
  unreadNotifications: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardData(): DashboardData {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayTask, setTodayTask] = useState<Task | null>(null);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [tasksThisWeek, setTasksThisWeek] = useState(0);
  const [activeBlock, setActiveBlock] = useState<BlockProgress | null>(null);
  const [nextBooking, setNextBooking] = useState<Booking | null>(null);
  const [trendingPosts, setTrendingPosts] = useState<DashboardData["trendingPosts"]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Parallel fetch all data
      const [
        profileRes,
        tasksRes,
        completionsRes,
        weekCompletionsRes,
        blockRes,
        bookingRes,
        postsRes,
        notifRes,
      ] = await Promise.all([
        // Profile
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        // All free tasks for daily recommendation
        supabase.from("tasks").select("*").order("created_at"),
        // Today's completions
        supabase.from("task_completions")
          .select("task_id")
          .eq("user_id", user.id)
          .gte("completed_at", new Date().toISOString().split("T")[0]),
        // This week's completions
        supabase.from("task_completions")
          .select("id")
          .eq("user_id", user.id)
          .gte("completed_at", getWeekStart()),
        // Active block progress
        supabase.from("block_progress")
          .select("*")
          .eq("user_id", user.id)
          .is("completed_at", null)
          .order("started_at", { ascending: false })
          .limit(1),
        // Next booking
        supabase.from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .in("status", ["pending", "confirmed"])
          .gte("session_date", new Date().toISOString())
          .order("session_date")
          .limit(1),
        // Trending forum posts (public)
        supabase.from("forum_posts")
          .select("*")
          .order("upvotes", { ascending: false })
          .limit(2),
        // Unread notifications
        supabase.from("notifications")
          .select("id")
          .eq("user_id", user.id)
          .eq("read", false),
      ]);

      if (profileRes.data) setProfile(profileRes.data);

      // Pick a "daily" task based on day of year to rotate
      if (tasksRes.data && tasksRes.data.length > 0) {
        const dayOfYear = getDayOfYear();
        const completedIds = (completionsRes.data || []).map((c) => c.task_id);
        // Try to find an uncompleted task for today
        const taskIndex = dayOfYear % tasksRes.data.length;
        const selectedTask = tasksRes.data[taskIndex];
        setTodayTask(selectedTask);
        setTodayCompleted(completedIds.includes(selectedTask.id));
      }

      setTasksThisWeek(weekCompletionsRes.data?.length || 0);
      setActiveBlock(blockRes.data?.[0] || null);
      setNextBooking(bookingRes.data?.[0] || null);
      setUnreadNotifications(notifRes.data?.length || 0);

      // Enrich posts with comment counts
      if (postsRes.data) {
        const enriched = await Promise.all(
          postsRes.data.map(async (post) => {
            const { count } = await supabase
              .from("forum_comments")
              .select("id", { count: "exact", head: true })
              .eq("post_id", post.id);
            // Get author name
            const { data: authorProfile } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", post.user_id)
              .single();
            return {
              ...post,
              comment_count: count || 0,
              author_name: authorProfile?.name || "Anonym",
            };
          })
        );
        setTrendingPosts(enriched);
      }
    } catch (err) {
      console.error("Dashboard data error:", err);
      setError("Daten konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    profile,
    todayTask,
    todayCompleted,
    tasksThisWeek,
    activeBlock,
    nextBooking,
    trendingPosts,
    unreadNotifications,
    isLoading,
    error,
    refetch: fetchData,
  };
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
