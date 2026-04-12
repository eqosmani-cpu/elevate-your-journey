import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/navigation/AppShell";
import { MessageSquare, Users, TrendingUp, Plus } from "lucide-react";
import { GreenButton } from "@/components/ui/GreenButton";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — MindPitch" },
      { name: "description", content: "Tausche dich mit anderen Spielern aus." },
    ],
  }),
  component: CommunityPage,
});

const mockPosts = [
  { id: 1, author: "Leon K.", topic: "Mental-Stärke", title: "Wie geht ihr mit Nervosität vor großen Spielen um?", replies: 14, likes: 23 },
  { id: 2, author: "Sara M.", topic: "Fokus", title: "Meine Pre-Game Routine — teile deine!", replies: 8, likes: 31 },
  { id: 3, author: "Tim R.", topic: "Resilienz", title: "Nach Verletzung zurückgekommen — meine Geschichte", replies: 22, likes: 56 },
];

function CommunityPage() {
  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Community</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Tausche dich aus und wachse gemeinsam</p>
          </div>
          <GreenButton size="sm">
            <Plus size={16} />
            Neuer Beitrag
          </GreenButton>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users size={14} />
            <span>1.234 Mitglieder</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp size={14} />
            <span>89 aktiv heute</span>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-3">
          {mockPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl bg-card border border-border p-4 transition-all duration-200 hover:border-primary/30 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-semibold">
                  {post.topic}
                </span>
                <span className="text-[11px] text-muted-foreground">von {post.author}</span>
              </div>
              <h3 className="font-display font-semibold text-sm text-card-foreground mb-3">
                {post.title}
              </h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare size={12} />
                  <span>{post.replies} Antworten</span>
                </div>
                <span>❤️ {post.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
