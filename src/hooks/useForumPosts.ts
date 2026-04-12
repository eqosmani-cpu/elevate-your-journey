import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseForumPostsOptions {
  category: string;
  sort: string;
  page: number;
  pageSize?: number;
}

export function useForumPosts({ category, sort, page, pageSize = 20 }: UseForumPostsOptions) {
  return useQuery({
    queryKey: ["forum-posts", category, sort, page],
    queryFn: async () => {
      let query = supabase
        .from("forum_posts")
        .select("*, profiles!forum_posts_user_id_fkey(name, level)", { count: "exact" });

      // Category filter
      if (category !== "all") {
        query = query.eq("category", category);
      }

      // Sort
      switch (sort) {
        case "trending":
          query = query.order("upvotes", { ascending: false });
          break;
        case "answered":
          query = query.eq("is_answered", true).order("created_at", { ascending: false });
          break;
        case "unanswered":
          query = query.eq("is_answered", false).order("created_at", { ascending: false });
          break;
        default:
          query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
      }

      // Pagination
      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      // Check which posts have coach replies
      const postIds = (data ?? []).map((p) => p.id);
      let coachReplySet = new Set<string>();
      if (postIds.length > 0) {
        const { data: coachComments } = await supabase
          .from("forum_comments")
          .select("post_id")
          .in("post_id", postIds)
          .eq("is_coach_reply", true);
        coachReplySet = new Set((coachComments ?? []).map((c) => c.post_id));
      }

      return {
        posts: (data ?? []).map((p) => ({ ...p, has_coach_reply: coachReplySet.has(p.id) })),
        totalCount: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
  });
}
