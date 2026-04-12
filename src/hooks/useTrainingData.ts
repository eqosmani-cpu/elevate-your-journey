import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("category")
        .order("difficulty");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTaskCompletions() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["task-completions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_completions")
        .select("*")
        .eq("user_id", userId!)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useWeeklyActivity() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["weekly-activity", userId],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      monday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("task_completions")
        .select("completed_at")
        .eq("user_id", userId!)
        .gte("completed_at", monday.toISOString());
      if (error) throw error;

      // Get unique days
      const activeDays = new Set(
        (data ?? []).map((c) => new Date(c.completed_at).toDateString())
      );

      return {
        activeDays,
        activeDayCount: activeDays.size,
        weekDates: Array.from({ length: 7 }, (_, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          return d;
        }),
      };
    },
  });
}

export function useProfile() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
