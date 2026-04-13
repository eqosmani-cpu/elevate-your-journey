import { Link } from "@tanstack/react-router";
import type { Tables } from "@/integrations/supabase/types";

const categoryDots: Record<string, string> = {
  question: "bg-[hsl(210,40%,65%)]",
  experience: "bg-[hsl(270,30%,60%)]",
  motivation: "bg-[hsl(150,25%,50%)]",
  tip: "bg-[hsl(40,45%,55%)]",
  challenge: "bg-[hsl(0,40%,60%)]",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} T.`;
  return `vor ${Math.floor(days / 7)} W.`;
}

interface ForumPostCardProps {
  post: Tables<"forum_posts"> & {
    profiles?: { name: string | null; level: number } | null;
    has_coach_reply?: boolean;
  };
}

export function ForumPostCard({ post }: ForumPostCardProps) {
  const dotColor = categoryDots[post.category] ?? categoryDots.question;
  const authorName = post.is_anonymous
    ? `Spieler #${post.id.slice(0, 4).toUpperCase()}`
    : post.profiles?.name || "Anonym";

  return (
    <Link
      to="/community/$postId"
      params={{ postId: post.id }}
      className="flex gap-3 px-0 py-5 border-b border-border transition-colors hover:bg-surface/50 group"
    >
      {/* Category dot */}
      <div className="pt-1.5 shrink-0">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] text-foreground font-normal leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-[13px] text-tertiary line-clamp-1 mt-0.5 font-light">
          {post.content}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-tertiary">
          <span>{authorName}</span>
          <span>·</span>
          <span>{timeAgo(post.created_at)}</span>
          <span>·</span>
          <span>{post.comment_count} Antworten</span>
          {post.has_coach_reply && (
            <>
              <span>·</span>
              <span className="text-primary text-[11px]">Coach geantwortet</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
