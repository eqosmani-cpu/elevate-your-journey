import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/navigation/AppShell";
import { useForumPost, useForumComments, useUserReactions } from "@/hooks/useForumPost";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Flag, ThumbsUp, MessageSquare, Heart, Bot, CheckCircle2 } from "lucide-react";
import { useAiForumAnswer } from "@/hooks/useAiCoach";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/community/$postId")({
  head: () => ({
    meta: [
      { title: "Beitrag — MindPitch Community" },
      { name: "description", content: "Community-Diskussion auf MindPitch." },
    ],
  }),
  component: PostDetailPage,
});

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tagen`;
}

function PostDetailPage() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: post, isLoading: postLoading } = useForumPost(postId);
  const { data: comments, isLoading: commentsLoading } = useForumComments(postId);
  const [userId, setUserId] = useState<string | undefined>();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: userReactions } = useUserReactions(postId, userId);
  const { loading: aiAnswerLoading, generateAnswer: generateAiAnswer } = useAiForumAnswer();

  const handleAiAnswer = async () => {
    const answer = await generateAiAnswer(postId);
    if (answer) queryClient.invalidateQueries({ queryKey: ["forum-comments", postId] });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "forum_comments", filter: `post_id=eq.${postId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["forum-comments", postId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId, queryClient]);

  const handleReaction = async (type: "upvote" | "fire" | "helpful" | "relatable") => {
    if (!userId) { toast.error("Bitte melde dich an."); return; }
    const existing = userReactions?.find((r) => r.type === type);
    if (existing) {
      await supabase.from("forum_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("forum_reactions").insert({ post_id: postId, user_id: userId, type });
      if (type === "upvote" && post?.user_id && post.user_id !== userId) {
        await supabase.rpc("add_xp", { _user_id: post.user_id, _points: 5, _reason: "Upvote erhalten", _source: "forum_post" });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["forum-reactions", postId, userId] });
    queryClient.invalidateQueries({ queryKey: ["forum-post", postId] });
  };

  const handleComment = async () => {
    if (!newComment.trim() || !userId) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("forum_comments").insert({
        post_id: postId,
        user_id: userId,
        content: newComment.trim(),
      });
      if (error) throw error;
      setNewComment("");
      await supabase.rpc("add_xp", { _user_id: userId, _points: 5, _reason: "Forum-Kommentar", _source: "forum_answer" });
      toast.success("+5 XP! Kommentar gepostet");
    } catch {
      toast.error("Fehler beim Kommentieren.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (commentId: string) => {
    if (!userId || !post || post.user_id !== userId) return;
    await supabase.from("forum_comments").update({ is_accepted_answer: true }).eq("id", commentId);
    await supabase.from("forum_posts").update({ is_answered: true }).eq("id", postId);
    const comment = comments?.find((c) => c.id === commentId);
    if (comment) {
      await supabase.rpc("add_xp", { _user_id: comment.user_id, _points: 25, _reason: "Beste Antwort", _source: "forum_answer" });
    }
    toast.success("Als beste Antwort markiert! +25 XP");
    queryClient.invalidateQueries({ queryKey: ["forum-comments", postId] });
    queryClient.invalidateQueries({ queryKey: ["forum-post", postId] });
  };

  const handleReport = async (targetPostId?: string, targetCommentId?: string) => {
    if (!userId) return;
    await supabase.from("forum_reports").insert({
      reporter_id: userId,
      post_id: targetPostId ?? null,
      comment_id: targetCommentId ?? null,
      reason: "Unangemessener Inhalt",
    });
    toast.success("Gemeldet. Danke für dein Feedback.");
  };

  if (postLoading) {
    return (
      <AppShell>
        <div className="max-w-[800px] mx-auto px-5 py-8 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!post) {
    return (
      <AppShell>
        <div className="max-w-[800px] mx-auto px-5 py-16 text-center">
          <p className="text-tertiary text-sm font-light">Beitrag nicht gefunden.</p>
          <Link to="/community" className="text-primary text-[13px] mt-3 inline-block">← Zurück zur Community</Link>
        </div>
      </AppShell>
    );
  }

  const authorName = post.is_anonymous ? `Spieler #${post.id.slice(0, 4).toUpperCase()}` : post.profiles?.name || "Anonym";
  const isAuthor = userId === post.user_id;
  const upvoteActive = userReactions?.some((r) => r.type === "upvote");
  const relatableActive = userReactions?.some((r) => r.type === "relatable");

  return (
    <AppShell>
      <div className="max-w-[800px] mx-auto px-5 py-8 md:px-8 pb-24">
        {/* Back */}
        <button
          onClick={() => navigate({ to: "/community" })}
          className="flex items-center gap-1 text-[13px] text-primary hover:opacity-70 transition-opacity mb-6"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Community
        </button>

        {/* Post */}
        <article>
          <h1 className="font-display text-[28px] text-foreground tracking-[-0.3px] leading-[1.2]">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 mt-3 text-[13px] text-tertiary">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-tertiary shrink-0">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span>{authorName}</span>
            <span className="text-tertiary/50">·</span>
            <span className="text-xs text-tertiary">Lvl {post.profiles?.level ?? 1}</span>
            <span className="text-tertiary/50">·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          <div className="border-b border-border my-5" />

          <div className="text-[15px] text-foreground/85 whitespace-pre-wrap leading-[1.7] font-light">
            {post.content}
          </div>

          {/* Reactions */}
          <div className="flex items-center gap-4 mt-6 text-[13px] text-tertiary">
            <button
              onClick={() => handleReaction("upvote")}
              className={cn("flex items-center gap-1 transition-colors", upvoteActive ? "text-primary" : "hover:text-foreground")}
            >
              <ThumbsUp size={14} strokeWidth={1.5} /> {post.upvotes}
            </button>
            <span className="flex items-center gap-1">
              <MessageSquare size={14} strokeWidth={1.5} /> {post.comment_count}
            </span>
            <button
              onClick={() => handleReaction("relatable")}
              className={cn("flex items-center gap-1 transition-colors", relatableActive ? "text-primary" : "hover:text-foreground")}
            >
              <Heart size={14} strokeWidth={1.5} /> Kenne ich
            </button>
            <button
              onClick={() => handleReport(post.id)}
              className="ml-auto flex items-center gap-1 text-xs text-tertiary/50 hover:text-destructive transition-colors"
            >
              <Flag size={12} strokeWidth={1.5} /> Melden
            </button>
          </div>

          <div className="border-b border-border my-6" />
        </article>

        {/* Comments */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs uppercase tracking-wider text-tertiary">
              {comments?.length ?? 0} Antworten
            </h2>
            {userId && !post.is_answered && (comments?.length ?? 0) === 0 && (
              <button
                onClick={handleAiAnswer}
                disabled={aiAnswerLoading}
                className="flex items-center gap-1.5 text-[12px] text-tertiary hover:text-foreground transition-colors disabled:opacity-50"
              >
                {aiAnswerLoading ? (
                  <><div className="w-3 h-3 border-2 border-tertiary/30 border-t-tertiary rounded-full animate-spin" /> Generiert...</>
                ) : (
                  <><Bot size={13} strokeWidth={1.5} /> KI-Antwort anfordern</>
                )}
              </button>
            )}
          </div>

          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pl-5 py-3 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0">
              {comments?.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  isPostAuthor={isAuthor}
                  onAccept={() => handleAcceptAnswer(comment.id)}
                  onReport={() => handleReport(undefined, comment.id)}
                />
              ))}
            </div>
          )}

          {/* Reply input */}
          {userId && (
            <div className="mt-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Deine Antwort..."
                className="bg-transparent border-border rounded-2xl px-4 py-3 text-sm min-h-[80px] focus-visible:ring-0 focus-visible:border-primary"
                maxLength={3000}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleComment}
                  disabled={submitting || !newComment.trim()}
                  className="rounded-[10px] border border-border px-5 py-2 text-[13px] text-foreground hover:bg-muted/30 transition-colors disabled:opacity-40"
                >
                  {submitting ? "Wird gepostet..." : "Antworten (+5 XP)"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function CommentRow({
  comment,
  isPostAuthor,
  onAccept,
  onReport,
}: {
  comment: Tables<"forum_comments"> & { profiles?: { name: string | null; level: number } | null };
  isPostAuthor: boolean;
  onAccept: () => void;
  onReport: () => void;
}) {
  const authorName = comment.profiles?.name || "Anonym";

  return (
    <div
      className={cn(
        "pl-5 py-4 border-l-2",
        comment.is_coach_reply
          ? "border-l-[#B8976A]"
          : comment.is_accepted_answer
            ? "border-l-primary"
            : "border-l-transparent"
      )}
    >
      <div className="flex items-center gap-2 text-xs text-tertiary mb-1.5">
        <span className="text-foreground/70 font-medium">{authorName}</span>
        {comment.is_coach_reply && (
          <span className="uppercase text-[10px] tracking-wider text-[#B8976A] font-medium">Coach</span>
        )}
        {comment.is_accepted_answer && (
          <span className="flex items-center gap-0.5 text-primary text-[11px]">
            <CheckCircle2 size={10} strokeWidth={1.5} /> Beste Antwort
          </span>
        )}
        <span className="ml-auto">{timeAgo(comment.created_at)}</span>
      </div>

      <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-light">
        {comment.content}
      </p>

      <div className="flex items-center gap-3 mt-2">
        {isPostAuthor && !comment.is_accepted_answer && (
          <button onClick={onAccept} className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70 transition-opacity">
            <CheckCircle2 size={10} strokeWidth={1.5} /> Beste Antwort
          </button>
        )}
        <button onClick={onReport} className="ml-auto text-[10px] text-tertiary/50 hover:text-destructive transition-colors">
          Melden
        </button>
      </div>
    </div>
  );
}
