import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export function useUserTier() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["user-tier", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, tier, name")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useBlockPrograms() {
  return useQuery({
    queryKey: ["block-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("block_programs")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useActiveBlockProgress() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["block-progress", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("block_progress")
        .select("*, block_programs(*)")
        .eq("user_id", userId!)
        .is("completed_at", null)
        .order("started_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}
