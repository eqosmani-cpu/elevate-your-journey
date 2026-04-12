import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/navigation/AppShell";
import { useForumPost, useForumComments, useUserReactions } from "@/hooks/useForumPost";
import { supabase } from "@/integrations/supabase/client";
import { GreenButton } from "@/components/ui/GreenButton";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Flag, Clock, Flame, MessageSquare, ThumbsUp, Lightbulb, Heart, Bot } from "lucide-react";
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

const categoryConfig: Record<string, { label: string; color: string }> = {
  question: { label: "Frage", color: "bg-blue-500/20 text-blue-400" },
  experience: { label: "Erfahrung", color: "bg-purple-500/20 text-purple-400" },
  motivation: { label: "Motivation", color: "bg-primary/20 text-primary" },
  tip: { label: "Tipp", color: "bg-amber-500/20 text-amber-400" },
  challenge: { label: "Challenge", color: "bg-rose-500/20 text-rose-400" },
};

const reactionTypes = [
  { type: "upvote" as const, icon: ThumbsUp, label: "Upvote" },
  { type: "fire" as const, icon: Flame, label: "Feuer" },
  { type: "helpful" as const, icon: Lightbulb, label: "Hilfreich" },
  { type: "relatable" as const, icon: Heart, label: "Kenne ich" },
];

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
    if (answer) {
      queryClient.invalidateQueries({ queryKey: ["forum-comments", postId] });
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  // Realtime comments
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
      // XP for upvotes received
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
    // Find comment author and award XP
    const comment = comments?.find((c) => c.id === commentId);
    if (comment) {
      await supabase.rpc("add_xp", { _user_id: comment.user_id, _points: 25, _reason: "Beste Antwort", _source: "forum_answer" });
    }
    toast.success("Als beste Antwort markiert! +25 XP für den Autor");
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
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!post) {
    return (
      <AppShell>
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">Beitrag nicht gefunden.</p>
          <Link to="/community" className="text-primary text-sm mt-2 inline-block">← Zurück zur Community</Link>
        </div>
      </AppShell>
    );
  }

  const cat = categoryConfig[post.category] ?? categoryConfig.question;
  const authorName = post.is_anonymous ? `Spieler #${post.id.slice(0, 4).toUpperCase()}` : post.profiles?.name || "Anonym";
  const isAuthor = userId === post.user_id;

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-24">
        {/* Back */}
        <button onClick={() => navigate({ to: "/community" })} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft size={14} /> Zurück
        </button>

        {/* Post */}
        <article className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cat.color}`}>{cat.label}</span>
            {post.is_answered && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-semibold">
                <CheckCircle2 size={10} /> Beantwortet
              </span>
            )}
            {post.tags?.map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">#{tag}</span>
            ))}
          </div>

          <h1 className="font-display font-bold text-lg text-foreground mb-2">{post.title}</h1>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4">
            <span className="font-medium text-foreground/70">{authorName}</span>
            <span className="text-primary/60 font-bold">Lv.{post.profiles?.level ?? 1}</span>
            <span className="flex items-center gap-0.5"><Clock size={10} /> {timeAgo(post.created_at)}</span>
          </div>

          <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed mb-5">
            {post.content}
          </div>

          {/* Reactions */}
          <div className="flex items-center gap-2 flex-wrap">
            {reactionTypes.map(({ type, icon: Icon, label }) => {
              const active = userReactions?.some((r) => r.type === type);
              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all",
                    active ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={12} /> {label}
                </button>
              );
            })}
            <button
              onClick={() => handleReport(post.id)}
              className="ml-auto flex items-center gap-1 rounded-full px-2 py-1.5 text-[10px] text-muted-foreground hover:text-destructive transition-colors"
            >
              <Flag size={10} /> Melden
            </button>
          </div>
        </article>

        {/* Comments */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
              <MessageSquare size={14} /> {comments?.length ?? 0} Antworten
            </h2>
            {userId && !post.is_answered && (comments?.length ?? 0) === 0 && (
              <button
                onClick={handleAiAnswer}
                disabled={aiAnswerLoading}
                className="flex items-center gap-1.5 rounded-full bg-purple-500/15 text-purple-400 px-3 py-1.5 text-[11px] font-medium hover:bg-purple-500/25 transition-colors disabled:opacity-60"
              >
                {aiAnswerLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    Generiert...
                  </>
                ) : (
                  <>
                    <Bot size={12} /> KI-Antwort anfordern
                  </>
                )}
              </button>
            )}
          </div>

          {commentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-card border border-border p-4 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {comments?.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isPostAuthor={isAuthor}
                  onAccept={() => handleAcceptAnswer(comment.id)}
                  onReport={() => handleReport(undefined, comment.id)}
                />
              ))}
            </div>
          )}

          {/* New comment */}
          {userId && (
            <div className="mt-5 rounded-2xl bg-card border border-border p-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Deine Antwort..."
                className="bg-secondary border-border min-h-[80px] mb-3"
                maxLength={3000}
              />
              <GreenButton size="sm" onClick={handleComment} disabled={submitting || !newComment.trim()}>
                {submitting ? "Wird gepostet..." : "Antworten (+5 XP)"}
              </GreenButton>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function CommentCard({
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
        "rounded-xl border p-4",
        comment.is_coach_reply
          ? "bg-amber-500/5 border-amber-500/30"
          : comment.is_accepted_answer
            ? "bg-primary/5 border-primary/30"
            : "bg-card border-border"
      )}
    >
      <div className="flex items-center gap-2 mb-2 text-[11px]">
        <span className="font-medium text-foreground/70">{authorName}</span>
        <span className="text-primary/60 font-bold">Lv.{comment.profiles?.level ?? 1}</span>
        {comment.is_coach_reply && (
          <span className="rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-[10px] font-semibold">⭐ Coach</span>
        )}
        {comment.is_accepted_answer && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-semibold">
            <CheckCircle2 size={10} /> Beste Antwort
          </span>
        )}
        <span className="text-muted-foreground ml-auto flex items-center gap-0.5">
          <Clock size={10} /> {timeAgo(comment.created_at)}
        </span>
      </div>

      <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
        {comment.content}
      </p>

      <div className="flex items-center gap-2 mt-3">
        {isPostAuthor && !comment.is_accepted_answer && (
          <button onClick={onAccept} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <CheckCircle2 size={10} /> Beste Antwort
          </button>
        )}
        <button onClick={onReport} className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors">
          <Flag size={10} /> Melden
        </button>
      </div>
    </div>
  );
}
