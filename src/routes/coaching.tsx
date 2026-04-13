import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { useCoaches, useMyBookings } from "@/hooks/useCoaching";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Lock, Calendar, Clock, Video, MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useTierGate } from "@/hooks/useTierGate";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";

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
  "Alle", "Versagensangst", "Druckbewältigung", "Verletzung", "Fokus",
];

function CoachingPage() {
  const [activeTab, setActiveTab] = useState<"discover" | "sessions">("discover");
  const [specFilter, setSpecFilter] = useState("Alle");
  const [userId, setUserId] = useState<string | undefined>();
  const { upgradeOpen, setUpgradeOpen, highlightTier, requireTier, hasAccess } = useTierGate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data: coaches, isLoading } = useCoaches({
    specialization: specFilter === "Alle" ? undefined : specFilter,
  });

  return (
    <AppShell>
      <div className="px-5 py-8 md:px-10 md:py-10 max-w-[800px] mx-auto pb-28">
        {/* Header */}
        <h1 className="font-serif text-4xl tracking-tight text-[#1A1A1A] mb-1">Coaching</h1>
        <p className="text-[15px] font-light text-[#6B6B6B] mb-8">
          Arbeite direkt mit einem zertifizierten Sportpsychologen.
        </p>

        {/* Pro gate banner */}
        {!hasAccess("pro") && (
          <div className="rounded-2xl border border-[#E8E8E8] bg-[#FAFAF8] p-5 mb-6 flex items-center gap-4">
            <Lock size={16} className="text-[#A8A8A8] shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[#1A1A1A]">Coaching ist ein Pro-Feature</p>
              <p className="text-[12px] text-[#A8A8A8]">Upgrade, um 1:1 Sessions mit Coaches zu buchen.</p>
            </div>
            <button onClick={() => requireTier("pro")} className="text-[13px] font-medium text-[#3A5C4A] shrink-0">
              Upgrade →
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {(["discover", "sessions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                activeTab === tab
                  ? "bg-[#EDF2EE] text-[#3A5C4A]"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              )}
            >
              {tab === "discover" ? "Coaches finden" : "Meine Sessions"}
            </button>
          ))}
        </div>

        {activeTab === "discover" && (
          <>
            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSpecFilter(spec)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors shrink-0",
                    specFilter === spec
                      ? "bg-[#EDF2EE] text-[#3A5C4A]"
                      : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                  )}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(0,0,0,0.07)] mb-4" />

            {/* Coach list */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {coaches?.map((coach) => {
                  const nextDay = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"][
                    Math.floor(Math.abs(coach.name.charCodeAt(0) % 5))
                  ];

                  const card = (
                    <div className="rounded-2xl bg-white border border-[#E8E8E8] px-5 py-5 transition-all hover:bg-[#FAFAF8] active:scale-[0.995]">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EDF2EE] to-[#D8E4DA] flex items-center justify-center text-[15px] font-semibold text-[#3A5C4A] shrink-0">
                          {coach.name.split(" ").map((n) => n[0]).join("")}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] text-[#1A1A1A] mb-1">{coach.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {coach.specialization?.slice(0, 3).map((s) => (
                              <span key={s} className="rounded-full bg-[#F5F5F3] px-2 py-0.5 text-[11px] text-[#6B6B6B]">{s}</span>
                            ))}
                          </div>
                        </div>

                        {/* Right */}
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-[13px] text-[#B8976A] font-medium">
                            {Number(coach.rating).toFixed(1)} ★
                          </span>
                          <span className="text-[13px] text-[#A8A8A8]">ab €{coach.price_eur}</span>
                        </div>
                      </div>

                      {/* Availability divider */}
                      <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.05)]">
                        <p className="text-[12px] text-[#A8A8A8]">
                          {coach.available
                            ? `Nächster Termin: ${nextDay}`
                            : "Derzeit ausgebucht"}
                        </p>
                      </div>
                    </div>
                  );

                  if (hasAccess("pro")) {
                    return (
                      <Link key={coach.id} to="/coaching/$coachId" params={{ coachId: coach.id }}>
                        {card}
                      </Link>
                    );
                  }
                  return (
                    <button key={coach.id} className="w-full text-left" onClick={() => requireTier("pro")}>
                      {card}
                    </button>
                  );
                })}
                {coaches?.length === 0 && (
                  <p className="text-center text-[14px] text-[#A8A8A8] py-12">Keine Coaches mit diesen Filtern gefunden.</p>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "sessions" && <MySessionsTab userId={userId} />}
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} highlightTier={highlightTier} />
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
      <div className="flex gap-2 mb-5">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
              tab === t ? "bg-[#EDF2EE] text-[#3A5C4A]" : "text-[#6B6B6B]"
            )}
          >
            {t === "upcoming" ? `Kommend (${upcoming.length})` : `Vergangen (${past.length})`}
          </button>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[14px] text-[#A8A8A8] mb-4">
            {tab === "upcoming" ? "Keine anstehenden Sessions." : "Keine vergangenen Sessions."}
          </p>
          {tab === "upcoming" && (
            <button
              onClick={() => navigate({ to: "/coaching" })}
              className="rounded-full border border-[#3A5C4A] text-[#3A5C4A] px-5 py-2 text-[13px] font-medium hover:bg-[#EDF2EE] transition-colors"
            >
              Coach finden
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((booking) => {
            const date = new Date(booking.session_date);
            const statusLabels: Record<string, string> = {
              pending: "Ausstehend",
              confirmed: "Bestätigt",
              completed: "Abgeschlossen",
              cancelled: "Storniert",
            };
            return (
              <div key={booking.id} className="rounded-2xl bg-white border border-[#E8E8E8] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EDF2EE] to-[#D8E4DA] flex items-center justify-center text-[13px] font-semibold text-[#3A5C4A]">
                    {booking.coaches?.name?.split(" ").map((n) => n[0]).join("") || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] text-[#1A1A1A]">{booking.coaches?.name || "Coach"}</p>
                    <p className="text-[12px] text-[#A8A8A8]">{statusLabels[booking.status]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[12px] text-[#A8A8A8] mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr · {booking.duration_min} Min.
                  </span>
                </div>
                {tab === "upcoming" && booking.status !== "cancelled" && (
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3A5C4A] text-white py-2.5 text-[13px] font-medium">
                    <Video size={14} /> Meeting beitreten
                  </button>
                )}
                {tab === "past" && booking.status === "completed" && (
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-[#E8E8E8] py-2 text-[12px] text-[#6B6B6B] hover:bg-[#FAFAF8] transition-colors">
                      <MessageSquare size={12} /> Notizen
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-[#E8E8E8] py-2 text-[12px] text-[#6B6B6B] hover:bg-[#FAFAF8] transition-colors">
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
