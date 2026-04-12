import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/navigation/AppShell";
import { useCoach, useCreateBooking } from "@/hooks/useCoaching";
import { GreenButton } from "@/components/ui/GreenButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Star, Clock, Calendar, Video, CheckCircle2,
  ChevronLeft, ChevronRight, CreditCard, PartyPopper,
} from "lucide-react";

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
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!coach) {
    return (
      <AppShell>
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">Coach nicht gefunden.</p>
          <Link to="/coaching" className="text-primary text-sm mt-2 inline-block">← Zurück</Link>
        </div>
      </AppShell>
    );
  }

  const ratingCategories = [
    { label: "Expertise", value: Number(coach.rating) },
    { label: "Kommunikation", value: Math.min(5, Number(coach.rating) + 0.05) },
    { label: "Ergebnisse", value: Math.max(4.5, Number(coach.rating) - 0.1) },
    { label: "Empathie", value: Math.min(5, Number(coach.rating) + 0.02) },
    { label: "Preis-Leistung", value: Math.max(4.3, Number(coach.rating) - 0.15) },
  ];

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto pb-24">
        {/* Back */}
        <button onClick={() => navigate({ to: "/coaching" })} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft size={14} /> Zurück
        </button>

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-5 mb-4">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-xl bg-surface-elevated flex items-center justify-center text-xl font-display font-bold text-foreground shrink-0">
              {coach.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-lg text-foreground mb-0.5">{coach.name}</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Star size={11} className="text-chart-3 fill-chart-3" />
                <span className="font-medium">{Number(coach.rating).toFixed(1)}</span>
                <span>({coach.rating_count} Bewertungen)</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {coach.specialization?.map((s) => (
                  <span key={s} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <h2 className="font-display font-semibold text-sm text-foreground mb-2">Über mich</h2>
          <p className="text-sm text-foreground/80 leading-relaxed">{coach.bio}</p>
        </div>

        {/* Rating breakdown */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <h2 className="font-display font-semibold text-sm text-foreground mb-3">Bewertungen</h2>
          <div className="space-y-2.5">
            {ratingCategories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 shrink-0">{cat.label}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-chart-3 rounded-full" style={{ width: `${(cat.value / 5) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-foreground w-8 text-right">{cat.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4">
          <h2 className="font-display font-semibold text-sm text-foreground mb-3">Preise</h2>
          <div className="space-y-2">
            {packages.map((pkg) => {
              const basePrice = coach.price_eur;
              const price = pkg.id === "intro" ? Math.round(basePrice * 0.5)
                : pkg.id === "intensive" ? Math.round(basePrice * 3 * (1 - pkg.discount / 100))
                : basePrice;
              return (
                <div key={pkg.id} className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">{pkg.label}</p>
                    <p className="text-[10px] text-muted-foreground">{pkg.duration} Min. · {pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold text-foreground">€{price}</p>
                    {pkg.discount > 0 && (
                      <p className="text-[10px] text-primary font-medium">{pkg.discount}% gespart</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        {!showBooking && (
          <GreenButton
            onClick={() => setShowBooking(true)}
            className="w-full"
            disabled={!coach.available}
          >
            {coach.available ? "Session buchen →" : "Derzeit ausgebucht"}
          </GreenButton>
        )}

        {/* Booking flow */}
        <AnimatePresence>
          {showBooking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <BookingFlow coach={coach} onClose={() => setShowBooking(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function BookingFlow({ coach, onClose }: { coach: NonNullable<ReturnType<typeof useCoach>["data"]>; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState("standard");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [blockDiagnosis, setBlockDiagnosis] = useState<string | null>(null);
  const createBooking = useCreateBooking();
  const navigate = useNavigate();

  // Load block diagnosis for pre-fill
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

  // Generate available dates (next 14 days, skip sundays)
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

  return (
    <div className="mt-4 rounded-2xl bg-card border border-primary/20 p-5">
      {/* Progress */}
      <div className="flex items-center gap-1 mb-5">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              s <= step ? "bg-primary" : "bg-secondary"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Package */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="font-display font-bold text-base text-foreground mb-1">Paket wählen</h3>
            <p className="text-xs text-muted-foreground mb-4">Wähle die passende Session-Art</p>
            <div className="space-y-2">
              {packages.map((p) => {
                const pPrice = p.id === "intro" ? Math.round(coach.price_eur * 0.5)
                  : p.id === "intensive" ? Math.round(coach.price_eur * 3 * 0.85)
                  : coach.price_eur;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPackage(p.id)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl p-3 text-left transition-all",
                      selectedPackage === p.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-secondary border-2 border-transparent hover:border-border"
                    )}
                  >
                    <div>
                      <p className="text-xs font-medium text-foreground">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground">{p.duration} Min.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-display font-bold text-foreground">€{pPrice}</p>
                      {p.discount > 0 && <p className="text-[10px] text-primary">{p.discount}% gespart</p>}
                    </div>
                  </button>
                );
              })}
            </div>
            <GreenButton onClick={() => setStep(2)} className="w-full mt-4">
              Weiter →
            </GreenButton>
          </motion.div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="font-display font-bold text-base text-foreground mb-1">Datum & Uhrzeit</h3>
            <p className="text-xs text-muted-foreground mb-4">Wähle einen verfügbaren Termin</p>

            {/* Date strip */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              {availableDates.map((d) => {
                const isSelected = selectedDate?.toDateString() === d.toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                    className={cn(
                      "flex flex-col items-center rounded-xl px-3 py-2 min-w-[52px] transition-all shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-[10px] font-medium">{d.toLocaleDateString("de-DE", { weekday: "short" })}</span>
                    <span className="text-sm font-bold">{d.getDate()}</span>
                    <span className="text-[9px]">{d.toLocaleDateString("de-DE", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="grid grid-cols-4 gap-1.5">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={cn(
                      "rounded-lg py-2 text-xs font-medium transition-colors",
                      selectedTime === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl bg-secondary text-xs text-muted-foreground">← Zurück</button>
              <GreenButton onClick={() => setStep(3)} className="flex-1" disabled={!selectedDate || !selectedTime}>
                Weiter →
              </GreenButton>
            </div>
          </motion.div>
        )}

        {/* Step 3: Notes */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="font-display font-bold text-base text-foreground mb-1">Dein Thema</h3>
            <p className="text-xs text-muted-foreground mb-4">Worüber möchtest du sprechen?</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Ich habe Angst vor wichtigen Spielen..."
              className="bg-secondary border-border min-h-[100px] mb-4"
              maxLength={500}
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-xl bg-secondary text-xs text-muted-foreground">← Zurück</button>
              <GreenButton onClick={() => setStep(4)} className="flex-1">
                Weiter →
              </GreenButton>
            </div>
          </motion.div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="font-display font-bold text-base text-foreground mb-4">Zusammenfassung</h3>
            <div className="rounded-xl bg-secondary/50 p-4 space-y-3 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Coach</span>
                <span className="font-medium text-foreground">{coach.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Paket</span>
                <span className="font-medium text-foreground">{pkg.label}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Datum</span>
                <span className="font-medium text-foreground">
                  {selectedDate?.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Uhrzeit</span>
                <span className="font-medium text-foreground">{selectedTime} Uhr</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Dauer</span>
                <span className="font-medium text-foreground">{pkg.duration} Min.</span>
              </div>
              {notes && (
                <div className="text-xs">
                  <span className="text-muted-foreground block mb-1">Thema</span>
                  <p className="text-foreground/80 text-[11px]">{notes}</p>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-medium text-foreground">Gesamt</span>
                <span className="text-lg font-display font-bold text-primary">€{price}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="px-4 py-2 rounded-xl bg-secondary text-xs text-muted-foreground">← Zurück</button>
              <GreenButton onClick={() => setStep(5)} className="flex-1">
                Zur Zahlung →
              </GreenButton>
            </div>
          </motion.div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="font-display font-bold text-base text-foreground mb-1">Zahlung</h3>
            <p className="text-xs text-muted-foreground mb-4">Sicher bezahlen über Stripe</p>

            <div className="rounded-xl bg-secondary/50 border border-border p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Stripe Checkout</span>
              </div>
              <div className="rounded-lg bg-muted/30 p-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Zu zahlen</p>
                <p className="text-2xl font-display font-bold text-foreground">€{price}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Stripe-Integration als Platzhalter</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(4)} className="px-4 py-2 rounded-xl bg-secondary text-xs text-muted-foreground">← Zurück</button>
              <GreenButton
                onClick={handleBook}
                className="flex-1"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? "Wird gebucht..." : `€${price} bezahlen & buchen`}
              </GreenButton>
            </div>
          </motion.div>
        )}

        {/* Step 6: Confirmation */}
        {step === 6 && (
          <motion.div key="s6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Buchung bestätigt!</h3>
              <p className="text-primary font-display font-bold text-lg mb-4">+50 XP</p>
            </div>

            <div className="rounded-xl bg-secondary/50 p-4 space-y-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-sm font-display font-bold text-foreground">
                  {coach.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{coach.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate?.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })} · {selectedTime} Uhr
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-2.5 text-xs">
                <Video size={14} className="text-primary" />
                <span className="text-muted-foreground">Meeting-Link wird per E-Mail zugesendet</span>
              </div>
            </div>

            <div className="space-y-2">
              <GreenButton onClick={() => navigate({ to: "/coaching" })} className="w-full">
                Meine Sessions ansehen
              </GreenButton>
              <button onClick={() => navigate({ to: "/" })} className="w-full py-2.5 rounded-xl bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors">
                Zum Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
