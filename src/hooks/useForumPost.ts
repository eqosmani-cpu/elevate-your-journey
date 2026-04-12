import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useForumPost(postId: string) {
  return useQuery({
    queryKey: ["forum-post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*, profiles!forum_posts_user_id_fkey(name, level)")
        .eq("id", postId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useForumComments(postId: string) {
  return useQuery({
    queryKey: ["forum-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_comments")
        .select("*, profiles!forum_comments_user_id_fkey(name, level)")
        .eq("post_id", postId)
        .order("is_accepted_answer", { ascending: false })
        .order("is_coach_reply", { ascending: false })
        .order("upvotes", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUserReactions(postId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["forum-reactions", postId, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_reactions")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}
