import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  useIsAdmin, useAdminStats, useAdminUsers, useAdminTasks,
  useAdminCoaches, useAdminBlockPrograms, useAdminReports,
  useAdminForumPosts, useAdminAnalytics,
} from "@/hooks/useAdmin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TierBadge } from "@/components/ui/TierBadge";
import {
  Users, BarChart3, Shield, MessageSquare, Dumbbell, Brain,
  TrendingUp, TrendingDown, Loader2, ArrowLeft, Trash2, Pin, PinOff,
  Plus, Pencil, Send, Star,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — MindPitch" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate({ to: "/" });
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/" })} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <Shield size={20} className="text-primary" />
          <h1 className="font-display font-bold text-lg text-foreground">Admin Panel</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="dashboard" className="text-xs"><BarChart3 size={14} className="mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="text-xs"><Users size={14} className="mr-1" />Benutzer</TabsTrigger>
            <TabsTrigger value="content" className="text-xs"><Dumbbell size={14} className="mr-1" />Inhalte</TabsTrigger>
            <TabsTrigger value="forum" className="text-xs"><MessageSquare size={14} className="mr-1" />Forum</TabsTrigger>
            <TabsTrigger value="coaches" className="text-xs"><Star size={14} className="mr-1" />Coaches</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs"><Brain size={14} className="mr-1" />Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="content"><ContentTab /></TabsContent>
          <TabsContent value="forum"><ForumTab /></TabsContent>
          <TabsContent value="coaches"><CoachesTab /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ──────────── DASHBOARD ──────────── */
function DashboardTab() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) return <LoadingCard />;

  const userTrend = stats.newUsersThisWeek - stats.newUsersPrevWeek;

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Gesamt-Nutzer" value={stats.totalUsers} trend={userTrend} />
        <StatCard label="Pro-Abos" value={stats.proSubscribers} />
        <StatCard label="Elite-Abos" value={stats.eliteSubscribers} />
        <StatCard label="Aufgaben heute" value={stats.tasksToday} />
        <StatCard label="Aufgaben (Woche)" value={stats.tasksWeek} />
        <StatCard label="Forum-Posts heute" value={stats.forumPostsToday} />
        <StatCard label="Coaching (Woche)" value={stats.coachingWeek} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top 5 aktivste Nutzer</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topUsers.map((u: any, i: number) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5">{i + 1}.</span>
                  <span className="text-foreground">{u.name || "Anonym"}</span>
                  <TierBadge tier={u.tier} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{u.xp_points} XP</span>
                  <span>🔥 {u.streak_current}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, trend }: { label: string; value: number; trend?: number }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {trend !== undefined && (
            <span className={`flex items-center text-xs ${trend >= 0 ? "text-primary" : "text-destructive"}`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────── USERS ──────────── */
function UsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  if (isLoading) return <LoadingCard />;

  const filtered = users?.filter(u =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const changeTier = async (userId: string, tier: string) => {
    const { error } = await supabase.from("profiles").update({ tier: tier as any }).eq("id", userId);
    if (error) { toast.error("Fehler: " + error.message); return; }
    toast.success("Tier aktualisiert");
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const sendNotification = async (userId: string) => {
    const msg = prompt("Nachricht an Nutzer:");
    if (!msg) return;
    const { error } = await supabase.from("notifications").insert({
      user_id: userId, message: msg, type: "achievement" as any,
    });
    if (error) { toast.error("Fehler: " + error.message); return; }
    toast.success("Benachrichtigung gesendet");
  };

  return (
    <div className="mt-4 space-y-4">
      <Input
        placeholder="Nutzer suchen..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Name</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Tier</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">XP</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Streak</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Beitritt</th>
              <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="px-3 py-2 text-foreground">{u.name || "—"}</td>
                <td className="px-3 py-2">
                  <Select value={u.tier} onValueChange={v => changeTier(u.id, v)}>
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{u.xp_points}</td>
                <td className="px-3 py-2 text-muted-foreground">🔥 {u.streak_current}</td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  {new Date(u.created_at).toLocaleDateString("de-DE")}
                </td>
                <td className="px-3 py-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => sendNotification(u.id)}>
                    <Send size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────── CONTENT ──────────── */
function ContentTab() {
  const { data: tasks, isLoading: tasksLoading } = useAdminTasks();
  const { data: programs, isLoading: progsLoading } = useAdminBlockPrograms();
  const queryClient = useQueryClient();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Tables<"tasks"> | null>(null);

  const deleteTask = async (id: string) => {
    if (!confirm("Aufgabe wirklich löschen?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    toast.success("Aufgabe gelöscht");
    queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
  };

  return (
    <div className="mt-4 space-y-6">
      {/* Tasks */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">Aufgaben ({tasks?.length ?? 0})</CardTitle>
          <Button size="sm" variant="outline" onClick={() => { setEditingTask(null); setShowTaskForm(true); }}>
            <Plus size={14} className="mr-1" /> Neue Aufgabe
          </Button>
        </CardHeader>
        <CardContent>
          {tasksLoading ? <LoadingCard /> : (
            <div className="space-y-2">
              {tasks?.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-sm">
                  <div>
                    <span className="text-foreground font-medium">{t.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{t.category} · {t.difficulty} · {t.duration_min}min</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingTask(t); setShowTaskForm(true); }}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTask(t.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Block Breaker Programme ({programs?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {progsLoading ? <LoadingCard /> : (
            <div className="space-y-2">
              {programs?.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-sm">
                  <span className="text-foreground">{p.title} — {p.block_category}</span>
                  <Badge variant="outline">{p.tier_required}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Aufgabe bearbeiten" : "Neue Aufgabe"}</DialogTitle>
          </DialogHeader>
          <TaskForm task={editingTask} onDone={() => { setShowTaskForm(false); queryClient.invalidateQueries({ queryKey: ["admin-tasks"] }); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskForm({ task, onDone }: { task: Tables<"tasks"> | null; onDone: () => void }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [category, setCategory] = useState(task?.category ?? "focus");
  const [difficulty, setDifficulty] = useState(task?.difficulty ?? "easy");
  const [duration, setDuration] = useState(task?.duration_min?.toString() ?? "10");
  const [tierRequired, setTierRequired] = useState(task?.tier_required ?? "free");
  const [instructions, setInstructions] = useState((task?.instructions ?? []).join("\n"));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title, description, category: category as any, difficulty: difficulty as any,
      duration_min: parseInt(duration) || 10, tier_required: tierRequired as any,
      instructions: instructions.split("\n").filter(Boolean),
    };
    if (task) {
      await supabase.from("tasks").update(payload).eq("id", task.id);
    } else {
      await supabase.from("tasks").insert(payload);
    }
    toast.success(task ? "Aufgabe aktualisiert" : "Aufgabe erstellt");
    setSaving(false);
    onDone();
  };

  return (
    <div className="space-y-3">
      <Input placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} />
      <Textarea placeholder="Beschreibung" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
      <div className="grid grid-cols-2 gap-3">
        <Select value={category} onValueChange={v => setCategory(v as any)}>
          <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
          <SelectContent>
            {["focus", "confidence", "pressure", "team", "recovery", "visualization"].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={v => setDifficulty(v as any)}>
          <SelectTrigger><SelectValue placeholder="Schwierigkeit" /></SelectTrigger>
          <SelectContent>
            {["easy", "medium", "hard"].map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" placeholder="Dauer (min)" value={duration} onChange={e => setDuration(e.target.value)} />
        <Select value={tierRequired} onValueChange={v => setTierRequired(v as any)}>
          <SelectTrigger><SelectValue placeholder="Tier" /></SelectTrigger>
          <SelectContent>
            {["free", "pro", "elite"].map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea placeholder="Schritte (eine pro Zeile)" value={instructions} onChange={e => setInstructions(e.target.value)} rows={4} />
      <Button onClick={handleSave} disabled={saving || !title} className="w-full">
        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
        {task ? "Speichern" : "Erstellen"}
      </Button>
    </div>
  );
}

/* ──────────── FORUM MODERATION ──────────── */
function ForumTab() {
  const { data: reports } = useAdminReports();
  const { data: posts } = useAdminForumPosts();
  const queryClient = useQueryClient();

  const togglePin = async (id: string, pinned: boolean) => {
    await supabase.from("forum_posts").update({ is_pinned: !pinned }).eq("id", id);
    toast.success(pinned ? "Post gelöst" : "Post angepinnt");
    queryClient.invalidateQueries({ queryKey: ["admin-forum-posts"] });
  };

  const deletePost = async (id: string) => {
    if (!confirm("Post wirklich löschen?")) return;
    await supabase.from("forum_posts").delete().eq("id", id);
    toast.success("Post gelöscht");
    queryClient.invalidateQueries({ queryKey: ["admin-forum-posts"] });
  };

  const resolveReport = async (id: string) => {
    await supabase.from("forum_reports").update({ status: "resolved" }).eq("id", id);
    toast.success("Report erledigt");
    queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
  };

  return (
    <div className="mt-4 space-y-6">
      {/* Reports */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Gemeldete Inhalte ({reports?.filter((r: any) => r.status === "pending").length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reports?.filter((r: any) => r.status === "pending").map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
                <div>
                  <p className="text-foreground">{r.reason}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.forum_posts?.title ? `Post: "${r.forum_posts.title}"` : "Kommentar"}
                    {" · "}{new Date(r.created_at).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <div className="flex gap-1">
                  {r.post_id && (
                    <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => deletePost(r.post_id!)}>
                      Löschen
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => resolveReport(r.id)}>
                    Erledigt
                  </Button>
                </div>
              </div>
            ))}
            {(!reports || reports.filter((r: any) => r.status === "pending").length === 0) && (
              <p className="text-sm text-muted-foreground">Keine offenen Meldungen</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Posts */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Forum-Posts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {posts?.slice(0, 20).map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-sm">
                <div className="flex items-center gap-2">
                  {p.is_pinned && <Pin size={12} className="text-primary" />}
                  <span className="text-foreground">{p.title}</span>
                  <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePin(p.id, p.is_pinned)}>
                    {p.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePost(p.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ──────────── COACHES ──────────── */
function CoachesTab() {
  const { data: coaches, isLoading } = useAdminCoaches();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Tables<"coaches"> | null>(null);

  const toggleAvailable = async (id: string, available: boolean) => {
    await supabase.from("coaches").update({ available: !available }).eq("id", id);
    toast.success(available ? "Coach deaktiviert" : "Coach aktiviert");
    queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
  };

  if (isLoading) return <LoadingCard />;

  return (
    <div className="mt-4 space-y-4">
      <Button size="sm" variant="outline" onClick={() => { setEditingCoach(null); setShowForm(true); }}>
        <Plus size={14} className="mr-1" /> Coach hinzufügen
      </Button>

      <div className="space-y-2">
        {coaches?.map(c => (
          <Card key={c.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  ⭐ {c.rating} · €{c.price_eur}/Session · {c.specialization?.join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{c.available ? "Aktiv" : "Inaktiv"}</span>
                  <Switch checked={c.available} onCheckedChange={() => toggleAvailable(c.id, c.available)} />
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCoach(c); setShowForm(true); }}>
                  <Pencil size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCoach ? "Coach bearbeiten" : "Neuer Coach"}</DialogTitle>
          </DialogHeader>
          <CoachForm coach={editingCoach} onDone={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["admin-coaches"] }); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CoachForm({ coach, onDone }: { coach: Tables<"coaches"> | null; onDone: () => void }) {
  const [name, setName] = useState(coach?.name ?? "");
  const [bio, setBio] = useState(coach?.bio ?? "");
  const [price, setPrice] = useState(coach?.price_eur?.toString() ?? "");
  const [specs, setSpecs] = useState((coach?.specialization ?? []).join(", "));
  const [avatarUrl, setAvatarUrl] = useState(coach?.avatar_url ?? "");
  const [calendlyUrl, setCalendlyUrl] = useState(coach?.calendly_url ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name, bio, price_eur: parseInt(price) || 0,
      specialization: specs.split(",").map(s => s.trim()).filter(Boolean),
      avatar_url: avatarUrl || null, calendly_url: calendlyUrl || null,
    };
    if (coach) {
      await supabase.from("coaches").update(payload).eq("id", coach.id);
    } else {
      await supabase.from("coaches").insert(payload);
    }
    toast.success(coach ? "Coach aktualisiert" : "Coach erstellt");
    setSaving(false);
    onDone();
  };

  return (
    <div className="space-y-3">
      <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <Textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" placeholder="Preis (€)" value={price} onChange={e => setPrice(e.target.value)} />
        <Input placeholder="Spezialisierungen (kommagetrennt)" value={specs} onChange={e => setSpecs(e.target.value)} />
      </div>
      <Input placeholder="Avatar URL" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
      <Input placeholder="Calendly URL" value={calendlyUrl} onChange={e => setCalendlyUrl(e.target.value)} />
      <Button onClick={handleSave} disabled={saving || !name} className="w-full">
        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
        {coach ? "Speichern" : "Erstellen"}
      </Button>
    </div>
  );
}

/* ──────────── ANALYTICS ──────────── */
function AnalyticsTab() {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading || !data) return <LoadingCard />;

  const totalUsers = data.tiers.free + data.tiers.pro + data.tiers.elite;
  const proRate = totalUsers > 0 ? Math.round((data.tiers.pro / totalUsers) * 100) : 0;
  const eliteRate = totalUsers > 0 ? Math.round((data.tiers.elite / totalUsers) * 100) : 0;

  return (
    <div className="mt-4 space-y-6">
      {/* Tier Conversion */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Tier-Verteilung</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <TierBar label="Free (Rookie)" count={data.tiers.free} total={totalUsers} color="bg-muted-foreground" />
            <TierBar label="Pro (Performer)" count={data.tiers.pro} total={totalUsers} color="bg-primary" />
            <TierBar label="Elite (Champion)" count={data.tiers.elite} total={totalUsers} color="bg-amber-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Konversionsrate: Free→Pro {proRate}% · Pro→Elite {eliteRate}%
          </p>
        </CardContent>
      </Card>

      {/* Top Tasks */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Meisterledigte Aufgaben</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {data.topTasks.map((t, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-foreground">{t.title}</span>
                <span className="text-muted-foreground">{t.count}×</span>
              </div>
            ))}
            {data.topTasks.length === 0 && <p className="text-sm text-muted-foreground">Keine Daten</p>}
          </div>
        </CardContent>
      </Card>

      {/* Forum Categories */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Forum-Kategorien</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.forumCategories).map(([cat, count]) => (
              <Badge key={cat} variant="outline">{cat}: {count as number}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="⌀ Streak-Länge" value={data.avgStreak} />
        <StatCard label="Block Breaker Rate" value={data.blockCompletionRate} trend={undefined} />
      </div>
    </div>
  );
}

function TierBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{count} ({Math.round(pct)}%)</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-muted-foreground" size={24} />
    </div>
  );
}
