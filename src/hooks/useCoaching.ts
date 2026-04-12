import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";

export type Coach = Tables<"coaches">;
export type Booking = Tables<"bookings">;

export function useCoaches(filters?: {
  specialization?: string;
  maxPrice?: number;
  minRating?: number;
  availableOnly?: boolean;
}) {
  return useQuery({
    queryKey: ["coaches", filters],
    queryFn: async () => {
      let query = supabase.from("coaches").select("*").order("rating", { ascending: false });

      if (filters?.availableOnly) {
        query = query.eq("available", true);
      }
      if (filters?.maxPrice) {
        query = query.lte("price_eur", filters.maxPrice);
      }
      if (filters?.minRating) {
        query = query.gte("rating", filters.minRating);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = data ?? [];
      if (filters?.specialization) {
        results = results.filter((c) =>
          c.specialization?.some((s) =>
            s.toLowerCase().includes(filters.specialization!.toLowerCase())
          )
        );
      }
      return results;
    },
  });
}

export function useCoach(coachId: string) {
  return useQuery({
    queryKey: ["coach", coachId],
    enabled: !!coachId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", coachId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyBookings() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  return useQuery({
    queryKey: ["my-bookings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, coaches(*)")
        .eq("user_id", userId!)
        .order("session_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (Booking & { coaches: Coach | null })[];
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: {
      coach_id: string;
      session_date: string;
      duration_min: number;
      notes?: string;
      price_paid?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("bookings").insert({
        ...booking,
        user_id: user.id,
        status: "confirmed",
      }).select().single();

      if (error) throw error;

      // Award XP
      await supabase.rpc("add_xp", {
        _user_id: user.id,
        _points: 50,
        _reason: "Coaching-Session gebucht",
        _source: "coaching",
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Booking> & { id: string }) => {
      const { error } = await supabase.from("bookings").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}
