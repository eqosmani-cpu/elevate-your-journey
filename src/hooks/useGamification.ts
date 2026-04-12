import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export function useUserBadges() {
  const [userId, setUserId] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["user-badges", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useWeeklyLeaderboard() {
  return useQuery({
    queryKey: ["weekly-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_weekly_leaderboard", { _limit: 10 });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });
}

export function useUserRank() {
  const [userId, setUserId] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["user-rank", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_rank", { _user_id: userId! });
      if (error) throw error;
      return (data as any[])?.[0] ?? null;
    },
  });
}

export function useXpHistory(days = 30) {
  const [userId, setUserId] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["xp-history", userId, days],
    enabled: !!userId,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await supabase
        .from("xp_log")
        .select("points, created_at, source, reason")
        .eq("user_id", userId!)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCompletionHeatmap() {
  const [userId, setUserId] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["completion-heatmap", userId],
    enabled: !!userId,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const { data, error } = await supabase
        .from("task_completions")
        .select("completed_at")
        .eq("user_id", userId!)
        .gte("completed_at", since.toISOString());
      if (error) throw error;
      return data ?? [];
    },
  });
}
