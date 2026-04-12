import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { ForumFilters } from "@/components/forum/ForumFilters";
import { NewPostDialog } from "@/components/forum/NewPostDialog";
import { useForumPosts } from "@/hooks/useForumPosts";
import { Plus, Users, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { GreenButton } from "@/components/ui/GreenButton";
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
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { upgradeOpen, setUpgradeOpen, highlightTier, requireTier, hasAccess } = useTierGate();
  const [weeklyPostCount, setWeeklyPostCount] = useState(0);

  const { data, isLoading, refetch } = useForumPosts({ category, sort, page });

  // Check weekly post count for free users
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
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Community</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Tausche dich aus und wachse gemeinsam</p>
          </div>
          <div className="hidden md:block">
            <GreenButton size="sm" onClick={handleNewPost}>
              <Plus size={16} />
              Frage stellen
              {!hasAccess("pro") && <span className="ml-1 text-[10px] opacity-70">({weeklyPostCount}/1)</span>}
            </GreenButton>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users size={14} />
            <span>Community Forum</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp size={14} />
            <span>{data?.totalCount ?? 0} Beiträge</span>
          </div>
        </div>

        {/* Filters */}
        <ForumFilters
          category={category}
          sort={sort}
          onCategoryChange={(c) => { setCategory(c); setPage(1); }}
          onSortChange={(s) => { setSort(s); setPage(1); }}
        />

        {/* Posts */}
        <div className="space-y-3 mt-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : data?.posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Keine Beiträge gefunden.</p>
              <GreenButton size="sm" className="mt-4" onClick={handleNewPost}>
                Erstelle den ersten Beitrag
              </GreenButton>
            </div>
          ) : (
            data?.posts.map((post) => <ForumPostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-secondary text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-muted-foreground">
              Seite {page} von {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="p-2 rounded-lg bg-secondary text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* FAB — mobile only */}
        <button
          onClick={handleNewPost}
          className="md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-neon-intense shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>

        <NewPostDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onPostCreated={() => refetch()}
        />

        <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} highlightTier={highlightTier} />
      </div>
    </AppShell>
  );
}
