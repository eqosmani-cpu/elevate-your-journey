import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { ForumFilters } from "@/components/forum/ForumFilters";
import { NewPostDialog } from "@/components/forum/NewPostDialog";
import { useForumPosts } from "@/hooks/useForumPosts";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTierGate } from "@/hooks/useTierGate";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — MindPitch" },
      { name: "description", content: "Tausche dich mit anderen Spielern aus." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const [category, setCategory] = useState("all");
  const [sort] = useState("new");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { upgradeOpen, setUpgradeOpen, highlightTier, requireTier, hasAccess } = useTierGate();
  const [weeklyPostCount, setWeeklyPostCount] = useState(0);

  const { data, isLoading, refetch } = useForumPosts({ category, sort, page });

  useEffect(() => {
    const checkPostCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("forum_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString());
      setWeeklyPostCount(count ?? 0);
    };
    checkPostCount();
  }, [dialogOpen]);

  const canPost = hasAccess("pro") || weeklyPostCount < 1;

  const handleNewPost = () => {
    if (!canPost) {
      requireTier("pro");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <AppShell>
      <div className="max-w-[800px] mx-auto px-5 py-8 md:px-8 pb-24">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl text-foreground tracking-[-0.5px]">Community</h1>
            <p className="text-sm text-tertiary font-light mt-1.5">
              Fragen stellen. Erfahrungen teilen. Gemeinsam wachsen.
            </p>
          </div>
          <button
            onClick={handleNewPost}
            className="hidden md:inline-flex items-center gap-1.5 rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} strokeWidth={1.5} />
            Frage stellen
          </button>
        </div>

        {/* Filters */}
        <ForumFilters
          category={category}
          onCategoryChange={(c) => { setCategory(c); setPage(1); }}
        />

        {/* Post list */}
        <div className="mt-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-5 border-b border-border space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : data?.posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-tertiary text-sm font-light">Keine Beiträge gefunden.</p>
              <button
                onClick={handleNewPost}
                className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Erstelle den ersten Beitrag
              </button>
            </div>
          ) : (
            data?.posts.map((post) => <ForumPostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-tertiary disabled:opacity-30 hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <span className="text-xs text-tertiary">
              Seite {page} von {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="p-2 rounded-lg text-tertiary disabled:opacity-30 hover:text-foreground transition-colors"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* FAB mobile */}
        <button
          onClick={handleNewPost}
          className="md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={1.5} />
        </button>

        <NewPostDialog open={dialogOpen} onOpenChange={setDialogOpen} onPostCreated={() => refetch()} />
        <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} highlightTier={highlightTier} />
      </div>
    </AppShell>
  );
}
