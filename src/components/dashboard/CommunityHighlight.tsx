import { Link } from "@tanstack/react-router";
import { MessageSquare, TrendingUp, ArrowRight } from "lucide-react";
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-primary" />
          <h2 className="font-display font-semibold text-sm text-foreground">Trending im Forum</h2>
        </div>
        <Link
          to="/community"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Alle Fragen
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {posts.map((post) => (
          <Link
            key={post.id}
            to="/community"
            className="block rounded-2xl bg-card border border-border p-3.5 transition-all duration-200 hover:border-primary/30"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                {categoryLabels[post.category] || post.category}
              </span>
              <span className="text-[10px] text-muted-foreground">von {post.author_name}</span>
            </div>
            <h3 className="font-display font-semibold text-sm text-card-foreground mb-1.5 line-clamp-1">
              {post.title}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MessageSquare size={11} />
              <span>{post.comment_count} Antworten</span>
              <span className="ml-2">❤️ {post.upvotes}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
