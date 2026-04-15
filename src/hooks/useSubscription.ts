import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { getStripeEnvironment } from "@/lib/stripe";

export function useSubscription() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["subscription", userId],
    enabled: !!userId,
    queryFn: async () => {
      const env = getStripeEnvironment();
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId!)
        .eq("environment", env)
        .in("status", ["active", "trialing", "canceled", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data ?? null;
    },
  });
}

export function useActiveSubscription() {
  const { data: sub, isLoading } = useSubscription();

  const isActive = !!sub && (
    (["active", "trialing"].includes(sub.status) &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date())) ||
    (sub.status === "canceled" &&
      sub.current_period_end && new Date(sub.current_period_end) > new Date())
  );

  const tier = sub?.price_id?.startsWith("elite") ? "elite" : sub?.price_id?.startsWith("pro") ? "pro" : null;

  return {
    subscription: sub,
    isActive,
    tier,
    isLoading,
    isCanceled: sub?.status === "canceled" || sub?.cancel_at_period_end,
    periodEnd: sub?.current_period_end,
  };
}
