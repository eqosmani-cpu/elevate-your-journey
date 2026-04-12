import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GreenButton } from "@/components/ui/GreenButton";
import { Textarea } from "@/components/ui/textarea";
import { AiTaskCard, AiGenerateButton } from "@/components/ai/AiTaskCard";
import { useAiTaskGenerator } from "@/hooks/useAiCoach";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import type { Tables } from "@/integrations/supabase/types";

interface StepData {
  day: number;
  title: string;
  subtitle: string;
  text: string;
  exercise: string;
  duration_min: number;
  has_reflection: boolean;
}

interface ProgramViewProps {
  progress: Tables<"block_progress"> & { block_programs: Tables<"block_programs"> | null };
}

export function ProgramView({ progress }: ProgramViewProps) {
  const queryClient = useQueryClient();
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { task: aiTask, loading: aiLoading, generate: generateAiTask, clear: clearAiTask } = useAiTaskGenerator();
  const [showConfetti, setShowConfetti] = useState(false);

  const program = progress.block_programs;
  if (!program) return null;

  const steps = (program.steps as unknown as StepData[]) ?? [];
  const currentStep = progress.current_step;
  const startedAt = new Date(progress.started_at);

  // Check which days are unlocked (24h gap)
  const isDayUnlocked = (day: number) => {
    if (day === 1) return true;
    if (day <= currentStep) return true;
    // Next day is unlocked only if 24h have passed since start + (day-2)*24h
    const unlockTime = new Date(startedAt.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
    return day === currentStep + 1 && new Date() >= unlockTime;
  };

  const currentStepData = steps.find((s) => s.day === currentStep);
  const isLastStep = currentStep > steps.length;

  const handleCompleteStep = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const nextStep = currentStep + 1;
      const isComplete = nextStep > steps.length;

      await supabase
        .from("block_progress")
        .update({
          current_step: nextStep,
          ...(isComplete ? { completed_at: new Date().toISOString() } : {}),
        })
        .eq("id", progress.id);

      // XP for each step
      await supabase.rpc("add_xp", {
        _user_id: user.id,
        _points: isComplete ? 100 : 20,
        _reason: isComplete ? "Block Breaker abgeschlossen!" : `Block Breaker Tag ${currentStep}`,
        _source: "block_step",
      });

      if (isComplete) {
        setShowConfetti(true);
        toast.success("🏆 Block Breaker abgeschlossen! +100 XP");
      } else {
        toast.success(`+20 XP! Tag ${currentStep} geschafft`);
      }

      setReflection("");
      queryClient.invalidateQueries({ queryKey: ["block-progress"] });
    } catch {
      toast.error("Fehler beim Speichern.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Timeline */}
      <div className="flex items-center justify-between mb-6 px-2">
        {steps.map((step, i) => {
          const day = step.day;
          const isCompleted = day < currentStep;
          const isCurrent = day === currentStep;
          const unlocked = isDayUnlocked(day);

          return (
            <div key={day} className="flex flex-col items-center gap-1.5 relative">
              {i > 0 && (
                <div className={cn(
                  "absolute top-3.5 -left-[calc(50%+8px)] w-[calc(100%-16px)] h-0.5",
                  isCompleted ? "bg-primary" : "bg-muted"
                )} style={{ width: "calc(100% + 16px)", left: "calc(-50% - 8px)" }} />
              )}
              <div className={cn(
                "relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary/20 text-primary ring-2 ring-primary animate-pulse",
                !isCompleted && !isCurrent && unlocked && "bg-secondary text-muted-foreground",
                !isCompleted && !isCurrent && !unlocked && "bg-muted/30 text-muted-foreground/50"
              )}>
                {isCompleted ? <CheckCircle2 size={14} /> : !unlocked && !isCurrent ? <Lock size={10} /> : day}
              </div>
              <span className="text-[9px] text-muted-foreground font-medium">{step.title}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Completion screen */}
        {(isLastStep || showConfetti) && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary/30 bg-card p-6 text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">Block Breaker geschafft!</h2>
            <p className="text-sm text-muted-foreground mb-2">Du hast das Programm "{program.title}" abgeschlossen.</p>
            <p className="text-primary font-display font-bold text-2xl mb-1">+100 XP</p>
            <p className="text-xs text-muted-foreground mb-6">🏆 Block Breaker Badge freigeschaltet</p>
            <div className="rounded-xl bg-secondary/50 p-4 text-left mb-4">
              <h3 className="text-xs font-semibold text-primary mb-1">💡 Empfehlung</h3>
              <p className="text-xs text-muted-foreground">Buche eine Coaching-Session, um deine Fortschritte mit einem Profi zu besprechen und das Gelernte zu vertiefen.</p>
            </div>

            {/* AI follow-up exercises */}
            {aiTask ? (
              <AiTaskCard task={aiTask} onDismiss={clearAiTask} />
            ) : (
              <AiGenerateButton
                loading={aiLoading}
                onClick={() => generateAiTask(`Weiterführende Übung nach Block Breaker: ${program.title}`)}
                label="Weiterführende Übungen von KI ✨"
                className="w-full"
              />
            )}
          </motion.div>
        )}

        {/* Current step */}
        {currentStepData && !isLastStep && !showConfetti && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-[11px] font-semibold">
                  Tag {currentStepData.day}
                </span>
                <span className="text-xs text-muted-foreground">{currentStepData.duration_min} Min.</span>
              </div>

              <h2 className="font-display font-bold text-lg text-foreground mb-0.5">{currentStepData.title}</h2>
              <p className="text-xs text-primary/70 font-medium mb-4">{currentStepData.subtitle}</p>

              {/* Explanation */}
              <div className="rounded-xl bg-secondary/30 p-4 mb-4">
                <p className="text-sm text-foreground/80 leading-relaxed">{currentStepData.text}</p>
              </div>

              {/* Exercise */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
                <h3 className="text-xs font-semibold text-primary mb-2">📝 Übung</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{currentStepData.exercise}</p>
              </div>

              {/* Reflection */}
              {currentStepData.has_reflection && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-foreground mb-2 block">Deine Reflexion</label>
                  <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Was nimmst du aus dieser Übung mit?"
                    className="bg-secondary border-border min-h-[80px]"
                    maxLength={2000}
                  />
                </div>
              )}

              <GreenButton
                onClick={handleCompleteStep}
                disabled={submitting || (currentStepData.has_reflection && !reflection.trim())}
                className="w-full"
              >
                {submitting ? "Wird gespeichert..." : currentStep === steps.length ? "Programm abschließen (+100 XP)" : `Tag ${currentStep} abschließen (+20 XP)`}
              </GreenButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
