import { Link } from "@tanstack/react-router";
import { MessageSquare, Flame, CheckCircle2, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const categoryConfig: Record<string, { label: string; color: string }> = {
  question: { label: "Frage", color: "bg-blue-500/20 text-blue-400" },
  experience: { label: "Erfahrung", color: "bg-purple-500/20 text-purple-400" },
  motivation: { label: "Motivation", color: "bg-primary/20 text-primary" },
  tip: { label: "Tipp", color: "bg-amber-500/20 text-amber-400" },
  challenge: { label: "Challenge", color: "bg-rose-500/20 text-rose-400" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} Tagen`;
  return `vor ${Math.floor(days / 7)} Wochen`;
}

interface ForumPostCardProps {
  post: Tables<"forum_posts"> & {
    profiles?: { name: string | null; level: number } | null;
    has_coach_reply?: boolean;
  };
}

export function ForumPostCard({ post }: ForumPostCardProps) {
  const cat = categoryConfig[post.category] ?? categoryConfig.question;
  const authorName = post.is_anonymous
    ? `Spieler #${post.id.slice(0, 4).toUpperCase()}`
    : post.profiles?.name || "Anonym";
  const level = post.profiles?.level ?? 1;

  return (
    <Link
      to="/community/$postId"
      params={{ postId: post.id }}
      className="block rounded-2xl bg-card border border-border p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card/80"
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cat.color}`}>
          {cat.label}
        </span>
        {post.is_pinned && (
          <span className="inline-block rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold">
            📌 Angepinnt
          </span>
        )}
        {post.is_answered && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-semibold">
            <CheckCircle2 size={10} /> Beantwortet
          </span>
        )}
        {post.has_coach_reply && (
          <span className="inline-block rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-[10px] font-semibold">
            ⭐ Coach
          </span>
        )}
      </div>

      <h3 className="font-display font-semibold text-sm text-card-foreground mb-1 line-clamp-2">
        {post.title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {post.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/70">{authorName}</span>
          <span className="text-primary/60 font-bold">Lv.{level}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Flame size={11} className="text-destructive" /> {post.upvotes}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare size={11} /> {post.comment_count}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock size={11} /> {timeAgo(post.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
