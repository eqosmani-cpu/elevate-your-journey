import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { useCoach, useCreateBooking } from "@/hooks/useCoaching";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { CreditCard, Video } from "lucide-react";

export const Route = createFileRoute("/coaching/$coachId")({
  head: () => ({
    meta: [
      { title: "Coach-Profil — MindPitch" },
      { name: "description", content: "Coach-Profil und Buchung auf MindPitch." },
    ],
  }),
  component: CoachProfilePage,
});

const packages = [
  { id: "intro", label: "Erstgespräch", duration: 30, discount: 0, description: "Kennenlernen & Ziel besprechen" },
  { id: "standard", label: "Standard-Session", duration: 60, discount: 0, description: "Intensive 1:1 Coaching-Session" },
  { id: "intensive", label: "Intensiv-Paket (3×60 Min.)", duration: 60, discount: 15, description: "3 Sessions zum Vorteilspreis", sessions: 3 },
];

function CoachProfilePage() {
  const { coachId } = Route.useParams();
  const navigate = useNavigate();
  const { data: coach, isLoading } = useCoach(coachId);
  const [showBooking, setShowBooking] = useState(false);

  if (isLoading) {
    return (
      <AppShell>
        <div className="px-5 py-8 max-w-[800px] mx-auto space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!coach) {
    return (
      <AppShell>
        <div className="px-5 py-16 text-center">
          <p className="text-[14px] text-[#A8A8A8]">Coach nicht gefunden.</p>
          <Link to="/coaching" className="text-[13px] text-[#3A5C4A] mt-3 inline-block">← Community</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-5 py-8 md:px-10 md:py-10 max-w-[800px] mx-auto pb-28">
        {/* Back */}
        <Link to="/coaching" className="text-[13px] text-[#3A5C4A] mb-6 inline-block">← Coaching</Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EDF2EE] to-[#D8E4DA] flex items-center justify-center text-[18px] font-semibold text-[#3A5C4A] shrink-0">
            {coach.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1 className="font-serif text-2xl tracking-tight text-[#1A1A1A]">{coach.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[13px] text-[#B8976A] font-medium">{Number(coach.rating).toFixed(1)} ★</span>
              <span className="text-[12px] text-[#A8A8A8]">{coach.rating_count} Bewertungen</span>
            </div>
          </div>
        </div>

        {/* Über mich */}
        <section className="mb-6">
          <h2 className="text-[10px] uppercase tracking-wider text-[#A8A8A8] mb-2">Über mich</h2>
          <p className="text-[14px] font-light text-[#6B6B6B] leading-relaxed">{coach.bio || "Keine Beschreibung vorhanden."}</p>
        </section>

        {/* Spezialisierung */}
        {coach.specialization && coach.specialization.length > 0 && (
          <section className="mb-6">
            <h2 className="text-[10px] uppercase tracking-wider text-[#A8A8A8] mb-2">Spezialisierung</h2>
            <div className="flex flex-wrap gap-1.5">
              {coach.specialization.map((s) => (
                <span key={s} className="rounded-full bg-[#F5F5F3] px-3 py-1 text-[11px] text-[#6B6B6B]">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="h-px bg-[rgba(0,0,0,0.07)] mb-6" />

        {/* Weekly calendar */}
        <section className="mb-6">
          <h2 className="text-[10px] uppercase tracking-wider text-[#A8A8A8] mb-3">Verfügbarkeit</h2>
          <WeeklyCalendar />
        </section>

        {/* Divider */}
        <div className="h-px bg-[rgba(0,0,0,0.07)] mb-6" />

        {/* Pricing table */}
        <section className="mb-8">
          <h2 className="text-[10px] uppercase tracking-wider text-[#A8A8A8] mb-3">Preise</h2>
          <div className="rounded-2xl border border-[#E8E8E8] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8E8E8] bg-[#FAFAF8]">
                  <th className="text-[11px] uppercase tracking-wider text-[#A8A8A8] font-medium py-3 px-4">Paket</th>
                  <th className="text-[11px] uppercase tracking-wider text-[#A8A8A8] font-medium py-3 px-4">Dauer</th>
                  <th className="text-[11px] uppercase tracking-wider text-[#A8A8A8] font-medium py-3 px-4 text-right">Preis</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg, i) => {
                  const price = pkg.id === "intro" ? Math.round(coach.price_eur * 0.5)
                    : pkg.id === "intensive" ? Math.round(coach.price_eur * 3 * 0.85)
                    : coach.price_eur;
                  return (
                    <tr key={pkg.id} className={i < packages.length - 1 ? "border-b border-[#E8E8E8]" : ""}>
                      <td className="text-[14px] text-[#1A1A1A] py-3 px-4">{pkg.label}</td>
                      <td className="text-[13px] text-[#A8A8A8] py-3 px-4">{pkg.duration} Min.</td>
                      <td className="text-[14px] font-medium text-[#1A1A1A] py-3 px-4 text-right">€{price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Booking flow or CTA */}
        {showBooking ? (
          <BookingFlow coach={coach} onClose={() => setShowBooking(false)} />
        ) : (
          <div className="sticky bottom-6 z-10">
            <button
              onClick={() => setShowBooking(true)}
              disabled={!coach.available}
              className={cn(
                "w-full rounded-2xl py-4 text-[15px] font-medium transition-colors",
                coach.available
                  ? "bg-[#3A5C4A] text-white hover:bg-[#2E4A3C]"
                  : "bg-[#E8E8E8] text-[#A8A8A8] cursor-not-allowed"
              )}
            >
              {coach.available ? "Session buchen" : "Derzeit ausgebucht"}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ---------- Weekly calendar mini ---------- */
function WeeklyCalendar() {
  const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const slots = ["09:00", "10:00", "14:00", "15:00", "16:00"];
  const [selected, setSelected] = useState<string | null>(null);

  // Mock availability
  const available = useMemo(() => {
    const set = new Set<string>();
    days.forEach((d, di) => {
      if (di === 6) return; // Sunday off
      slots.forEach((s) => {
        if (Math.random() > 0.4) set.add(`${d}-${s}`);
      });
    });
    return set;
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 min-w-[420px]">
        {days.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-[#A8A8A8] pb-2">{d}</div>
        ))}
        {days.map((d) =>
          slots.map((s) => {
            const key = `${d}-${s}`;
            const isAvail = available.has(key);
            const isSel = selected === key;
            return (
              <button
                key={key}
                disabled={!isAvail}
                onClick={() => setSelected(isSel ? null : key)}
                className={cn(
                  "rounded-lg py-1.5 text-[11px] font-medium transition-colors",
                  isSel
                    ? "bg-[#3A5C4A] text-white"
                    : isAvail
                      ? "bg-[#EDF2EE] text-[#3A5C4A] hover:bg-[#D8E4DA]"
                      : "text-[#E0E0E0]"
                )}
              >
                {s}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------- Booking flow ---------- */
function BookingFlow({ coach, onClose }: { coach: NonNullable<ReturnType<typeof useCoach>["data"]>; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState("standard");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [blockDiagnosis, setBlockDiagnosis] = useState<string | null>(null);
  const createBooking = useCreateBooking();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("block_progress")
        .select("diagnosis_result, block_programs(title)")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.block_programs) {
        const title = (data.block_programs as any)?.title;
        if (title) setBlockDiagnosis(title);
      }
    })();
  }, []);

  useEffect(() => {
    if (blockDiagnosis && !notes) {
      setNotes(`Mein aktuelles Thema: ${blockDiagnosis}`);
    }
  }, [blockDiagnosis]);

  const pkg = packages.find((p) => p.id === selectedPackage)!;
  const price = useMemo(() => {
    const base = coach.price_eur;
    if (selectedPackage === "intro") return Math.round(base * 0.5);
    if (selectedPackage === "intensive") return Math.round(base * 3 * 0.85);
    return base;
  }, [coach.price_eur, selectedPackage]);

  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      if (d.getDay() !== 0) dates.push(d);
    }
    return dates;
  }, []);

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    const [h, m] = selectedTime.split(":").map(Number);
    const sessionDate = new Date(selectedDate);
    sessionDate.setHours(h, m, 0, 0);

    try {
      await createBooking.mutateAsync({
        coach_id: coach.id,
        session_date: sessionDate.toISOString(),
        duration_min: pkg.duration,
        notes: notes || undefined,
        price_paid: price,
      });
      setStep(6);
      toast.success("+50 XP! Session gebucht");
    } catch {
      toast.error("Fehler beim Buchen.");
    }
  };

  const backBtn = (target: number) => (
    <button
      onClick={() => setStep(target)}
      className="rounded-full border border-[#E8E8E8] px-5 py-2.5 text-[13px] text-[#6B6B6B] hover:bg-[#FAFAF8] transition-colors"
    >
      ← Zurück
    </button>
  );

  const nextBtn = (target: number, disabled = false) => (
    <button
      onClick={() => setStep(target)}
      disabled={disabled}
      className={cn(
        "flex-1 rounded-full py-2.5 text-[13px] font-medium transition-colors",
        disabled
          ? "bg-[#E8E8E8] text-[#A8A8A8] cursor-not-allowed"
          : "bg-[#3A5C4A] text-white hover:bg-[#2E4A3C]"
      )}
    >
      Weiter →
    </button>
  );

  return (
    <div className="mt-6 rounded-2xl border border-[#E8E8E8] bg-white p-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              s <= step ? "bg-[#3A5C4A]" : "bg-[#E0E0E0]"
            )}
          />
        ))}
      </div>

      {/* Step 1: Package */}
      {step === 1 && (
        <div>
          <h3 className="font-serif text-xl text-[#1A1A1A] mb-1">Paket wählen</h3>
          <p className="text-[13px] text-[#A8A8A8] mb-5">Wähle die passende Session-Art</p>
          <div className="space-y-2">
            {packages.map((p) => {
              const pPrice = p.id === "intro" ? Math.round(coach.price_eur * 0.5)
                : p.id === "intensive" ? Math.round(coach.price_eur * 3 * 0.85)
                : coach.price_eur;
              const isSelected = selectedPackage === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPackage(p.id)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-2xl px-5 py-4 text-left transition-all border",
                    isSelected
                      ? "border-[#3A5C4A] bg-[#EDF2EE]"
                      : "border-[#E8E8E8] bg-white hover:bg-[#FAFAF8]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      isSelected ? "border-[#3A5C4A]" : "border-[#D0D0D0]"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#3A5C4A]" />}
                    </div>
                    <div>
                      <p className="text-[14px] text-[#1A1A1A]">{p.label}</p>
                      <p className="text-[12px] text-[#A8A8A8]">{p.duration} Min. · {p.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-medium text-[#1A1A1A]">€{pPrice}</p>
                    {p.discount > 0 && <p className="text-[11px] text-[#3A5C4A]">{p.discount}% gespart</p>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-5">
            {nextBtn(2)}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div>
          <h3 className="font-serif text-xl text-[#1A1A1A] mb-1">Datum & Uhrzeit</h3>
          <p className="text-[13px] text-[#A8A8A8] mb-5">Wähle einen verfügbaren Termin</p>

          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {availableDates.map((d) => {
              const isSelected = selectedDate?.toDateString() === d.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                  className={cn(
                    "flex flex-col items-center rounded-xl px-3 py-2 min-w-[52px] transition-all shrink-0",
                    isSelected ? "bg-[#3A5C4A] text-white" : "bg-[#F5F5F3] text-[#6B6B6B] hover:bg-[#EDF2EE]"
                  )}
                >
                  <span className="text-[10px] font-medium">{d.toLocaleDateString("de-DE", { weekday: "short" })}</span>
                  <span className="text-[15px] font-semibold">{d.getDate()}</span>
                  <span className="text-[9px]">{d.toLocaleDateString("de-DE", { month: "short" })}</span>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="grid grid-cols-4 gap-1.5">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={cn(
                    "rounded-lg py-2 text-[13px] font-medium transition-colors",
                    selectedTime === t
                      ? "bg-[#3A5C4A] text-white"
                      : "bg-[#EDF2EE] text-[#3A5C4A] hover:bg-[#D8E4DA]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-5">
            {backBtn(1)}
            {nextBtn(3, !selectedDate || !selectedTime)}
          </div>
        </div>
      )}

      {/* Step 3: Notes */}
      {step === 3 && (
        <div>
          <h3 className="font-serif text-xl text-[#1A1A1A] mb-1">Was möchtest du besprechen?</h3>
          <p className="text-[13px] text-[#A8A8A8] mb-5">Gib deinem Coach vorab einen Einblick</p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="z.B. Ich habe Angst vor wichtigen Spielen..."
            className="bg-[#FAFAF8] border-[#E8E8E8] min-h-[120px] text-[14px] font-light rounded-xl"
            maxLength={500}
          />
          <div className="flex gap-2 mt-5">
            {backBtn(2)}
            {nextBtn(4)}
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 4 && (
        <div>
          <h3 className="font-serif text-xl text-[#1A1A1A] mb-5">Zusammenfassung</h3>
          <div className="space-y-3 mb-5">
            {[
              ["Coach", coach.name],
              ["Paket", pkg.label],
              ["Datum", selectedDate?.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }) || ""],
              ["Uhrzeit", `${selectedTime} Uhr`],
              ["Dauer", `${pkg.duration} Min.`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-[rgba(0,0,0,0.05)]">
                <span className="text-[13px] text-[#A8A8A8]">{label}</span>
                <span className="text-[14px] text-[#1A1A1A]">{value}</span>
              </div>
            ))}
            {notes && (
              <div className="py-2">
                <p className="text-[13px] text-[#A8A8A8] mb-1">Thema</p>
                <p className="text-[13px] font-light text-[#6B6B6B]">{notes}</p>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[#E8E8E8]">
              <span className="text-[15px] font-medium text-[#1A1A1A]">Gesamt</span>
              <span className="text-[20px] font-serif text-[#1A1A1A]">€{price}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {backBtn(3)}
            {nextBtn(5)}
          </div>
        </div>
      )}

      {/* Step 5: Payment */}
      {step === 5 && (
        <div>
          <h3 className="font-serif text-xl text-[#1A1A1A] mb-1">Zahlung</h3>
          <p className="text-[13px] text-[#A8A8A8] mb-5">Sicher bezahlen über Stripe</p>

          <div className="rounded-2xl border border-[#E8E8E8] p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-[#A8A8A8]" />
              <span className="text-[13px] font-medium text-[#1A1A1A]">Kartendetails</span>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Kartennummer" className="w-full rounded-xl border border-[#E8E8E8] bg-[#FAFAF8] px-4 py-3 text-[14px] placeholder:text-[#C8C8C8] outline-none focus:border-[#3A5C4A]" />
              <div className="flex gap-2">
                <input type="text" placeholder="MM / JJ" className="flex-1 rounded-xl border border-[#E8E8E8] bg-[#FAFAF8] px-4 py-3 text-[14px] placeholder:text-[#C8C8C8] outline-none focus:border-[#3A5C4A]" />
                <input type="text" placeholder="CVC" className="w-24 rounded-xl border border-[#E8E8E8] bg-[#FAFAF8] px-4 py-3 text-[14px] placeholder:text-[#C8C8C8] outline-none focus:border-[#3A5C4A]" />
              </div>
            </div>
            <p className="text-[11px] text-[#A8A8A8] mt-3">Stripe-Integration als Platzhalter</p>
          </div>

          <div className="flex gap-2">
            {backBtn(4)}
            <button
              onClick={handleBook}
              disabled={createBooking.isPending}
              className={cn(
                "flex-1 rounded-full py-2.5 text-[13px] font-medium transition-colors",
                createBooking.isPending
                  ? "bg-[#E8E8E8] text-[#A8A8A8]"
                  : "bg-[#3A5C4A] text-white hover:bg-[#2E4A3C]"
              )}
            >
              {createBooking.isPending ? "Wird gebucht..." : `€${price} bezahlen`}
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Confirmation */}
      {step === 6 && (
        <div className="text-center py-8">
          <h3 className="font-serif text-[32px] text-[#1A1A1A] mb-2">Buchung bestätigt.</h3>
          <p className="text-[15px] font-light text-[#A8A8A8] mb-8">
            {coach.name} · {selectedDate?.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })} · {selectedTime} Uhr
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate({ to: "/coaching" })}
              className="rounded-full border border-[#E8E8E8] px-5 py-2.5 text-[13px] text-[#6B6B6B] hover:bg-[#FAFAF8] transition-colors"
            >
              Zum Kalender
            </button>
            <button
              onClick={() => navigate({ to: "/" })}
              className="rounded-full border border-[#E8E8E8] px-5 py-2.5 text-[13px] text-[#6B6B6B] hover:bg-[#FAFAF8] transition-colors"
            >
              Zum Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
