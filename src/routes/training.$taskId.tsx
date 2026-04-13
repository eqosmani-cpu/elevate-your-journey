import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/navigation/AppShell";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Play, Pause, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/training/$taskId")({
  head: () => ({
    meta: [
      { title: "Übung — MindPitch Training" },
      { name: "description", content: "Mentale Trainingsübung auf MindPitch." },
    ],
  }),
  component: TaskDetailPage,
});

const categoryLabels: Record<string, string> = {
  focus: "FOKUS",
  confidence: "SELBSTVERTRAUEN",
  pressure: "DRUCKBEWÄLTIGUNG",
  team: "TEAM",
  recovery: "ERHOLUNG",
  visualization: "VISUALISIERUNG",
};

const difficultyDots: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const moodLabels = [
  { value: 1, label: "Angespannt" },
  { value: 2, label: "Unruhig" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Entspannt" },
  { value: 5, label: "Ruhig" },
];

type Phase = "intro" | "mood-before" | "active" | "mood-after" | "reflection" | "done";

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>("intro");
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const startTimer = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Bitte melde dich an."); return; }

      const { error } = await supabase.from("task_completions").insert({
        task_id: taskId,
        user_id: user.id,
        mood_before: moodBefore,
        mood_after: moodAfter,
        reflection_note: reflection.trim() || null,
      });
      if (error) throw error;

      await supabase.rpc("add_xp", {
        _user_id: user.id,
        _points: 20,
        _reason: `Übung abgeschlossen: ${task?.title}`,
        _source: "task",
      });
      await supabase.rpc("check_and_update_streak", { _user_id: user.id });

      setPhase("done");
      queryClient.invalidateQueries({ queryKey: ["task-completions"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-activity"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("+20 XP! Übung abgeschlossen");
    } catch {
      toast.error("Fehler beim Speichern.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-[800px] mx-auto px-5 py-8 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell>
        <div className="max-w-[800px] mx-auto px-5 py-16 text-center">
          <p className="text-tertiary text-sm font-light">Übung nicht gefunden.</p>
          <Link to="/training" className="text-primary text-[13px] mt-3 inline-block">← Zurück zum Training</Link>
        </div>
      </AppShell>
    );
  }

  const dots = difficultyDots[task.difficulty] ?? 1;
  const catLabel = categoryLabels[task.category] ?? task.category.toUpperCase();
  const targetSeconds = task.duration_min * 60;
  const remaining = Math.max(targetSeconds - elapsed, 0);
  const progress = Math.min(elapsed / targetSeconds, 1);

  return (
    <AppShell>
      <div className="max-w-[800px] mx-auto px-5 py-8 md:px-8 pb-24">
        {/* Back */}
        <button
          onClick={() => navigate({ to: "/training" })}
          className="flex items-center gap-1 text-[13px] text-primary hover:opacity-70 transition-opacity mb-6"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Training
        </button>

        <AnimatePresence mode="wait">
          {/* ====== INTRO ====== */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <p className="text-[11px] uppercase tracking-wider text-tertiary mb-2">{catLabel}</p>
              <h1 className="font-display text-[28px] text-foreground tracking-[-0.3px] leading-[1.2] mb-4">
                {task.title}
              </h1>

              {/* Tags */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs text-tertiary">{task.duration_min} Min.</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={cn("w-[5px] h-[5px] rounded-full", i < dots ? "bg-primary" : "bg-[#E0E0E0]")} />
                  ))}
                </div>
                <span className="text-xs text-tertiary">{catLabel.charAt(0) + catLabel.slice(1).toLowerCase()}</span>
              </div>

              {/* Why this helps */}
              {task.description && (
                <div className="border-l-2 border-primary pl-4 mb-6">
                  <p className="text-xs uppercase tracking-wider text-tertiary mb-1">Warum hilft das?</p>
                  <p className="text-[13px] text-tertiary font-light italic leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Steps */}
              {task.instructions && task.instructions.length > 0 && (
                <div className="space-y-3 mb-8">
                  {task.instructions.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xs text-tertiary mt-0.5 shrink-0 w-4">{i + 1}.</span>
                      <p className="text-sm text-foreground/80 font-light leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setPhase("mood-before")}
                className="w-full rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Aufgabe starten →
              </button>
            </motion.div>
          )}

          {/* ====== MOOD BEFORE ====== */}
          {phase === "mood-before" && (
            <motion.div key="mood-before" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <MoodPicker
                title="Wie fühlst du dich gerade?"
                value={moodBefore}
                onChange={setMoodBefore}
                onContinue={() => { setPhase("active"); startTimer(); }}
              />
            </motion.div>
          )}

          {/* ====== TIMER ====== */}
          {phase === "active" && (
            <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-center">
                {/* Timer ring */}
                <div className="relative w-52 h-52 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                    <circle
                      cx="60" cy="60" r="54"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-5xl text-foreground tracking-tight">{formatTime(remaining)}</span>
                  </div>
                </div>

                <p className="text-sm text-tertiary font-light mb-8">{task.title}</p>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={running ? pauseTimer : startTimer}
                    className="rounded-[10px] border border-border px-6 py-[11px] text-[13px] text-foreground hover:bg-muted/30 transition-colors"
                  >
                    {running ? <><Pause size={14} strokeWidth={1.5} className="inline mr-1.5" />Pause</> : <><Play size={14} strokeWidth={1.5} className="inline mr-1.5" />Fortsetzen</>}
                  </button>
                  <button
                    onClick={() => { pauseTimer(); setPhase("mood-after"); }}
                    className="rounded-[10px] bg-primary text-primary-foreground px-6 py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity"
                  >
                    Übung beenden
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== MOOD AFTER ====== */}
          {phase === "mood-after" && (
            <motion.div key="mood-after" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <MoodPicker
                title="Wie geht es dir jetzt?"
                value={moodAfter}
                onChange={setMoodAfter}
                onContinue={() => setPhase("reflection")}
              />
            </motion.div>
          )}

          {/* ====== REFLECTION ====== */}
          {phase === "reflection" && (
            <motion.div key="reflection" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-display text-2xl text-foreground mb-1">Reflexion</h2>
              <p className="text-sm text-tertiary font-light mb-5">Was nimmst du aus dieser Übung mit?</p>

              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Kurze Reflexion (optional)..."
                className="bg-transparent border-border rounded-2xl px-4 py-3 text-sm min-h-[100px] focus-visible:ring-0 focus-visible:border-primary mb-5"
                maxLength={300}
              />

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Wird gespeichert..." : "Abschließen (+20 XP)"}
              </button>
            </motion.div>
          )}

          {/* ====== DONE ====== */}
          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5"
                >
                  <Check size={28} strokeWidth={1.5} className="text-primary" />
                </motion.div>

                <h2 className="font-display text-2xl text-foreground mb-2">Großartig gemacht.</h2>
                <p className="text-sm text-tertiary font-light mb-1">Du hast „{task.title}" abgeschlossen.</p>
                <p className="text-primary text-lg font-display mb-1">+20 XP</p>
                <p className="text-xs text-tertiary mb-8">Dauer: {formatTime(elapsed)}</p>

                {moodBefore !== null && moodAfter !== null && (
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="text-center">
                      <p className="text-xs text-tertiary mb-1">Vorher</p>
                      <p className="text-sm text-foreground">{moodLabels.find((m) => m.value === moodBefore)?.label}</p>
                    </div>
                    <span className="text-tertiary">→</span>
                    <div className="text-center">
                      <p className="text-xs text-tertiary mb-1">Nachher</p>
                      <p className="text-sm text-foreground">{moodLabels.find((m) => m.value === moodAfter)?.label}</p>
                    </div>
                  </div>
                )}

                <Link
                  to="/training"
                  className="inline-flex rounded-[10px] border border-border px-6 py-[11px] text-[13px] text-foreground hover:bg-muted/30 transition-colors"
                >
                  ← Zurück zum Training
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function MoodPicker({
  title, value, onChange, onContinue,
}: {
  title: string;
  value: number | null;
  onChange: (v: number) => void;
  onContinue: () => void;
}) {
  return (
    <div className="text-center">
      <h2 className="font-display text-2xl text-foreground mb-6">{title}</h2>

      {/* Mood scale */}
      <div className="relative max-w-xs mx-auto mb-8">
        {/* Line */}
        <div className="absolute top-3 left-0 right-0 h-px bg-border" />
        
        <div className="flex items-start justify-between relative">
          {moodLabels.map((mood) => (
            <button
              key={mood.value}
              onClick={() => onChange(mood.value)}
              className="flex flex-col items-center gap-2 z-10"
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  value === mood.value
                    ? "bg-primary border-primary scale-125"
                    : "bg-card border-border hover:border-foreground/30"
                )}
              />
              <span className={cn(
                "text-[10px] transition-colors",
                value === mood.value ? "text-foreground" : "text-tertiary"
              )}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={value === null}
        className="w-full max-w-xs mx-auto rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Weiter
      </button>
    </div>
  );
}
