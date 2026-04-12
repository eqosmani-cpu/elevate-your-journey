import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/navigation/AppShell";
import { GreenButton } from "@/components/ui/GreenButton";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Clock, Play, Pause, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
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
  focus: "🎯 Fokus",
  confidence: "💪 Selbstvertrauen",
  pressure: "😤 Druck",
  team: "🤝 Team",
  recovery: "🏥 Recovery",
  visualization: "🧘 Visualisierung",
};

const categoryColors: Record<string, string> = {
  focus: "bg-chart-1/15 text-chart-1",
  confidence: "bg-chart-3/15 text-chart-3",
  pressure: "bg-destructive/15 text-destructive",
  team: "bg-chart-5/15 text-chart-5",
  recovery: "bg-chart-2/15 text-chart-2",
  visualization: "bg-chart-4/15 text-chart-4",
};

const moodEmojis = [
  { value: 1, emoji: "😞", label: "Schlecht" },
  { value: 2, emoji: "😕", label: "Mäßig" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Gut" },
  { value: 5, emoji: "😄", label: "Super" },
];

const difficultyDots: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

type Phase = "intro" | "mood-before" | "active" | "mood-after" | "reflection" | "done";

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>("intro");
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStartExercise = () => {
    setPhase("mood-before");
  };

  const handleMoodBeforeDone = () => {
    setPhase("active");
    startTimer();
  };

  const handleFinishExercise = () => {
    pauseTimer();
    setPhase("mood-after");
  };

  const handleMoodAfterDone = () => {
    setPhase("reflection");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Bitte melde dich an."); return; }

      // Save completion
      const { error } = await supabase.from("task_completions").insert({
        task_id: taskId,
        user_id: user.id,
        mood_before: moodBefore,
        mood_after: moodAfter,
        reflection_note: reflection.trim() || null,
      });
      if (error) throw error;

      // XP + streak
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
      toast.success("+20 XP! Übung abgeschlossen 🎉");
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
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell>
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">Übung nicht gefunden.</p>
          <Link to="/training" className="text-primary text-sm mt-2 inline-block">← Zurück zum Training</Link>
        </div>
      </AppShell>
    );
  }

  const dots = difficultyDots[task.difficulty] ?? 1;
  const catLabel = categoryLabels[task.category] ?? task.category;
  const catColor = categoryColors[task.category] ?? "bg-muted text-muted-foreground";
  const targetSeconds = task.duration_min * 60;
  const progress = Math.min(elapsed / targetSeconds, 1);

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto pb-24">
        {/* Back */}
        <button
          onClick={() => navigate({ to: "/training" })}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Zurück
        </button>

        <AnimatePresence mode="wait">
          {/* ====== INTRO ====== */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="rounded-2xl bg-card border border-border p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", catColor)}>{catLabel}</span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={12} /> {task.duration_min} Min.
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={cn("w-2 h-2 rounded-full", i < dots ? "bg-primary" : "bg-muted")} />
                    ))}
                  </div>
                </div>

                <h1 className="font-display font-bold text-lg text-foreground mb-3">{task.title}</h1>
                
                {task.description && (
                  <div className="rounded-xl bg-secondary/50 p-4 mb-5">
                    <h3 className="text-xs font-semibold text-primary mb-1.5">💡 Warum hilft das?</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                  </div>
                )}

                {/* Steps */}
                {task.instructions && task.instructions.length > 0 && (
                  <div className="space-y-2 mb-5">
                    <h3 className="text-xs font-semibold text-foreground mb-2">Schritte</h3>
                    {task.instructions.map((step, i) => (
                      <button
                        key={i}
                        onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                        className="w-full text-left rounded-xl bg-secondary/30 border border-border/50 p-3 transition-all hover:border-border"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-xs text-foreground/80 flex-1">{step}</span>
                          {expandedStep === i ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <GreenButton onClick={handleStartExercise} className="w-full">
                  <Play size={16} /> Aufgabe starten
                </GreenButton>
              </div>
            </motion.div>
          )}

          {/* ====== MOOD BEFORE ====== */}
          {phase === "mood-before" && (
            <motion.div key="mood-before" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <MoodPicker
                title="Wie fühlst du dich gerade?"
                subtitle="Mood-Check vor der Übung"
                value={moodBefore}
                onChange={setMoodBefore}
                onContinue={handleMoodBeforeDone}
              />
            </motion.div>
          )}

          {/* ====== ACTIVE / TIMER ====== */}
          {phase === "active" && (
            <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <h2 className="font-display font-bold text-foreground mb-2">{task.title}</h2>
                <p className="text-xs text-muted-foreground mb-6">Folge den Schritten und nimm dir Zeit.</p>

                {/* Timer ring */}
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-muted)" strokeWidth="6" />
                    <circle
                      cx="60" cy="60" r="54"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
                      className="transition-all duration-1000"
                      style={{ filter: "drop-shadow(0 0 8px oklch(0.85 0.22 155 / 0.5))" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-2xl text-foreground">{formatTime(elapsed)}</span>
                    <span className="text-[10px] text-muted-foreground">/ {task.duration_min}:00</span>
                  </div>
                </div>

                {/* Steps list */}
                {task.instructions && (
                  <div className="text-left space-y-1.5 mb-6 max-w-xs mx-auto">
                    {task.instructions.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={running ? pauseTimer : startTimer}
                    className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {running ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <GreenButton onClick={handleFinishExercise}>
                    <CheckCircle2 size={16} /> Übung beenden
                  </GreenButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== MOOD AFTER ====== */}
          {phase === "mood-after" && (
            <motion.div key="mood-after" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <MoodPicker
                title="Wie fühlst du dich jetzt?"
                subtitle="Mood-Check nach der Übung"
                value={moodAfter}
                onChange={setMoodAfter}
                onContinue={handleMoodAfterDone}
              />
            </motion.div>
          )}

          {/* ====== REFLECTION ====== */}
          {phase === "reflection" && (
            <motion.div key="reflection" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="rounded-2xl bg-card border border-border p-5">
                <h2 className="font-display font-bold text-foreground mb-1">📝 Reflexion</h2>
                <p className="text-xs text-muted-foreground mb-4">Was nimmst du aus dieser Übung mit?</p>

                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="z.B. Ich habe gemerkt, dass tiefes Atmen mir wirklich hilft..."
                  className="bg-secondary border-border min-h-[100px] mb-4"
                  maxLength={1000}
                />

                <GreenButton onClick={handleSubmit} disabled={submitting} className="w-full">
                  {submitting ? "Wird gespeichert..." : "Abschließen (+20 XP)"}
                </GreenButton>
              </div>
            </motion.div>
          )}

          {/* ====== DONE ====== */}
          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="rounded-2xl bg-card border border-primary/30 p-6 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="font-display font-bold text-lg text-foreground mb-2">Großartig gemacht!</h2>
                <p className="text-sm text-muted-foreground mb-2">Du hast "{task.title}" abgeschlossen.</p>
                <p className="text-primary font-display font-bold text-lg mb-1">+20 XP</p>
                <p className="text-xs text-muted-foreground mb-6">Dauer: {formatTime(elapsed)}</p>

                {moodBefore !== null && moodAfter !== null && (
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="text-center">
                      <span className="text-2xl">{moodEmojis.find((m) => m.value === moodBefore)?.emoji}</span>
                      <p className="text-[10px] text-muted-foreground mt-1">Vorher</p>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="text-center">
                      <span className="text-2xl">{moodEmojis.find((m) => m.value === moodAfter)?.emoji}</span>
                      <p className="text-[10px] text-muted-foreground mt-1">Nachher</p>
                    </div>
                  </div>
                )}

                <Link to="/training">
                  <GreenButton variant="outline" className="w-full">
                    ← Zurück zum Training
                  </GreenButton>
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
  title, subtitle, value, onChange, onContinue,
}: {
  title: string;
  subtitle: string;
  value: number | null;
  onChange: (v: number) => void;
  onContinue: () => void;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 text-center">
      <h2 className="font-display font-bold text-foreground mb-1">{title}</h2>
      <p className="text-xs text-muted-foreground mb-6">{subtitle}</p>

      <div className="flex items-center justify-center gap-3 mb-6">
        {moodEmojis.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              value === mood.value
                ? "bg-primary/15 scale-110 ring-2 ring-primary/30"
                : "hover:bg-secondary"
            )}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[9px] text-muted-foreground">{mood.label}</span>
          </button>
        ))}
      </div>

      <GreenButton onClick={onContinue} disabled={value === null} className="w-full">
        Weiter
      </GreenButton>
    </div>
  );
}
