import { Link } from "@tanstack/react-router";
import { MessageSquare, ArrowRight } from "lucide-react";
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-foreground">Trending im Forum</h2>
        <Link
          to="/community"
          className="flex items-center gap-1 text-[12px] font-body font-medium text-primary hover:opacity-70 transition-opacity"
        >
          Alle Fragen
          <ArrowRight size={12} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="space-y-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            to="/community"
            className="block rounded-2xl bg-card border border-border p-4 shadow-xs card-hover"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block rounded-lg bg-accent-light text-primary px-2 py-0.5 text-[10px] font-medium tracking-label uppercase">
                {categoryLabels[post.category] || post.category}
              </span>
              <span className="text-[11px] text-tertiary font-light">von {post.author_name}</span>
            </div>
            <h3 className="font-display text-[15px] text-card-foreground mb-2 line-clamp-1">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-light">
              <span className="flex items-center gap-1">
                <MessageSquare size={11} strokeWidth={1.5} />
                {post.comment_count} Antworten
              </span>
              <span>♡ {post.upvotes}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
