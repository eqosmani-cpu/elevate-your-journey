import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { useCoaches, useMyBookings } from "@/hooks/useCoaching";
import { GreenButton } from "@/components/ui/GreenButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Filter, Calendar, Clock, Video, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/coaching")({
  head: () => ({
    meta: [
      { title: "Coaching — MindPitch" },
      { name: "description", content: "Buche eine 1:1 Coaching-Session mit einem Mental-Coach." },
    ],
  }),
  component: CoachingPage,
});

const specializations = [
  "Alle",
  "Versagensangst",
  "Druckbewältigung",
  "Visualisierung",
  "Verletzungsrückkehr",
  "Achtsamkeit",
  "Identitätskrise",
  "Teamdynamik",
  "Konzentration",
];

function CoachingPage() {
  const [activeTab, setActiveTab] = useState("discover");
  const [specFilter, setSpecFilter] = useState("Alle");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data: coaches, isLoading } = useCoaches({
    specialization: specFilter === "Alle" ? undefined : specFilter,
    availableOnly,
  });

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-24">
        <h1 className="text-xl font-display font-bold text-foreground mb-1">Coaching</h1>
        <p className="text-xs text-muted-foreground mb-5">1:1 Sessions mit professionellen Mental-Coaches</p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-5 bg-secondary">
            <TabsTrigger value="discover" className="flex-1 text-xs">Coaches finden</TabsTrigger>
            <TabsTrigger value="sessions" className="flex-1 text-xs">Meine Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            {/* Filters */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Filter size={12} className="text-muted-foreground" />
                <button
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    availableOnly ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                  )}
                >
                  Verfügbar jetzt
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSpecFilter(spec)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors shrink-0",
                      specFilter === spec
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Coach cards */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {coaches?.map((coach) => (
                  <Link
                    key={coach.id}
                    to="/coaching/$coachId"
                    params={{ coachId: coach.id }}
                    className="block rounded-2xl bg-card border border-border p-4 transition-all hover:border-primary/30 active:scale-[0.99]"
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl bg-surface-elevated flex items-center justify-center text-lg font-display font-bold text-foreground shrink-0">
                        {coach.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display font-semibold text-sm text-card-foreground truncate">{coach.name}</h3>
                          {coach.available ? (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          ) : (
                            <span className="text-[9px] text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5">Ausgebucht</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                          <Star size={10} className="text-chart-3 fill-chart-3" />
                          <span className="font-medium">{Number(coach.rating).toFixed(1)}</span>
                          <span>({coach.rating_count} Bewertungen)</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {coach.specialization?.slice(0, 3).map((s) => (
                            <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">ab €{coach.price_eur} / Session</span>
                          <span className="text-[11px] text-primary font-medium">Profil ansehen →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {coaches?.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">Keine Coaches mit diesen Filtern gefunden.</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <MySessionsTab userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function MySessionsTab({ userId }: { userId?: string }) {
  const { data: bookings, isLoading } = useMyBookings();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
      </div>
    );
  }

  const now = new Date();
  const upcoming = bookings?.filter((b) => new Date(b.session_date) >= now && b.status !== "cancelled") ?? [];
  const past = bookings?.filter((b) => new Date(b.session_date) < now || b.status === "completed") ?? [];

  const sessions = tab === "upcoming" ? upcoming : past;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("upcoming")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "upcoming" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}
        >
          Kommend ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("past")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "past" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}
        >
          Vergangen ({past.length})
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-3">
            {tab === "upcoming" ? "Keine anstehenden Sessions." : "Keine vergangenen Sessions."}
          </p>
          {tab === "upcoming" && (
            <GreenButton size="sm" onClick={() => navigate({ to: "/coaching" })}>
              Coach finden
            </GreenButton>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((booking) => {
            const date = new Date(booking.session_date);
            const statusColors: Record<string, string> = {
              pending: "bg-chart-3/15 text-chart-3",
              confirmed: "bg-primary/15 text-primary",
              completed: "bg-muted text-muted-foreground",
              cancelled: "bg-destructive/15 text-destructive",
            };
            const statusLabels: Record<string, string> = {
              pending: "Ausstehend",
              confirmed: "Bestätigt",
              completed: "Abgeschlossen",
              cancelled: "Storniert",
            };

            return (
              <div key={booking.id} className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-sm font-display font-bold text-foreground">
                      {booking.coaches?.name?.split(" ").map((n) => n[0]).join("") || "?"}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm text-foreground">{booking.coaches?.name || "Coach"}</h3>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", statusColors[booking.status])}>
                        {statusLabels[booking.status]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} />
                    <span>{date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr · {booking.duration_min} Min.</span>
                  </div>
                </div>
                {tab === "upcoming" && booking.status !== "cancelled" && (
                  <GreenButton size="sm" className="w-full">
                    <Video size={14} className="mr-1" /> Meeting beitreten
                  </GreenButton>
                )}
                {tab === "past" && booking.status === "completed" && (
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-secondary py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <MessageSquare size={12} /> Notizen
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-secondary py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Star size={12} /> Bewerten
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
