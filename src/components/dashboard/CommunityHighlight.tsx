import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { DashboardData } from "@/hooks/useDashboardData";

const categoryLabels: Record<string, string> = {
  question: "Frage",
  experience: "Erfahrung",
  motivation: "Motivation",
  tip: "Tipp",
  challenge: "Challenge",
};

interface CommunityHighlightProps {
  posts: DashboardData["trendingPosts"];
}

export function CommunityHighlight({ posts }: CommunityHighlightProps) {
  if (posts.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] uppercase tracking-label text-tertiary mb-4">
        Aus der Community
      </p>

      <div className="divide-y divide-border">
        {posts.map((post) => {
          const timeAgo = getTimeAgo(post.created_at);
          return (
            <Link
              key={post.id}
              to="/community/$postId"
              params={{ postId: post.id }}
              className="flex items-center gap-3 py-3.5 hover:opacity-70 transition-opacity"
            >
              <span className="shrink-0 rounded-lg bg-accent-light text-primary px-2 py-0.5 text-[11px] tracking-label uppercase">
                {categoryLabels[post.category] || post.category}
              </span>
              <span className="flex-1 text-sm text-foreground truncate">{post.title}</span>
              <span className="shrink-0 text-xs text-tertiary">
                {post.comment_count} Antworten
              </span>
              <span className="shrink-0 text-xs text-tertiary">{timeAgo}</span>
            </Link>
          );
        })}
      </div>

      <Link
        to="/community"
        className="inline-flex items-center gap-1 text-[13px] text-primary font-body mt-3 hover:opacity-70 transition-opacity"
      >
        Alle Fragen ansehen
        <ArrowRight size={12} strokeWidth={1.5} />
      </Link>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "gerade eben";
  if (hours < 24) return `vor ${hours}h`;
  const days = Math.floor(hours / 24);
  return `vor ${days}d`;
}
