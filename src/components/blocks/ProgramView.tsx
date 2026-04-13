import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { AiTaskCard, AiGenerateButton } from "@/components/ai/AiTaskCard";
import { useAiTaskGenerator } from "@/hooks/useAiCoach";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
  const [showComplete, setShowComplete] = useState(false);
  const { task: aiTask, loading: aiLoading, generate: generateAiTask, clear: clearAiTask } = useAiTaskGenerator();

  const program = progress.block_programs;
  if (!program) return null;

  const steps = (program.steps as unknown as StepData[]) ?? [];
  const currentStep = progress.current_step;
  const startedAt = new Date(progress.started_at);

  const isDayUnlocked = (day: number) => {
    if (day === 1) return true;
    if (day <= currentStep) return true;
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

      await supabase.rpc("add_xp", {
        _user_id: user.id,
        _points: isComplete ? 100 : 20,
        _reason: isComplete ? "Block Breaker abgeschlossen!" : `Block Breaker Tag ${currentStep}`,
        _source: "block_step",
      });

      if (isComplete) {
        setShowComplete(true);
        toast.success("Block Breaker abgeschlossen! +100 XP");
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
      {/* Vertical timeline */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-tertiary mb-4">Programmverlauf</p>
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />

          {steps.map((step) => {
            const isCompleted = step.day < currentStep;
            const isCurrent = step.day === currentStep;
            const unlocked = isDayUnlocked(step.day);

            return (
              <div key={step.day} className="relative pb-5 last:pb-0">
                {/* Dot */}
                <div className={cn(
                  "absolute left-[-18px] w-3.5 h-3.5 rounded-full border-2 transition-all",
                  isCompleted
                    ? "bg-primary border-primary"
                    : isCurrent
                      ? "bg-card border-primary"
                      : "bg-card border-border"
                )}>
                  {isCompleted && (
                    <Check size={8} strokeWidth={2.5} className="text-primary-foreground absolute top-0.5 left-0.5" />
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  "transition-opacity",
                  !isCompleted && !isCurrent && !unlocked && "opacity-40"
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs",
                      isCompleted ? "text-tertiary line-through" : "text-foreground"
                    )}>
                      Tag {step.day}
                    </span>
                    <span className="text-xs text-tertiary">· {step.duration_min} Min.</span>
                    {!isCompleted && !isCurrent && !unlocked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tertiary">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm mt-0.5",
                    isCurrent ? "text-foreground" : "text-tertiary"
                  )}>
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Completion screen */}
        {(isLastStep || showComplete) && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <h2 className="font-display text-[32px] text-foreground tracking-[-0.5px] mb-2">
              Block Breaker abgeschlossen.
            </h2>
            <p className="text-[15px] text-tertiary font-light mb-6">
              Du hast heute etwas Wichtiges getan.
            </p>
            <p className="text-primary font-display text-xl mb-8">+100 XP</p>

            {aiTask ? (
              <AiTaskCard task={aiTask} onDismiss={clearAiTask} />
            ) : (
              <AiGenerateButton
                loading={aiLoading}
                onClick={() => generateAiTask(`Weiterführende Übung nach Block Breaker: ${program.title}`)}
                label="Weiterführende Übungen"
                className="w-full max-w-sm mx-auto"
              />
            )}
          </motion.div>
        )}

        {/* Current step content */}
        {currentStepData && !isLastStep && !showComplete && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            {/* Eyebrow */}
            <p className="text-[11px] uppercase tracking-wider text-tertiary mb-2">
              Tag {currentStepData.day} · {currentStepData.duration_min} Min.
            </p>

            <h2 className="font-display text-[28px] text-foreground tracking-[-0.3px] leading-[1.2] mb-1">
              {currentStepData.title}
            </h2>
            <p className="text-sm text-primary font-light mb-5">{currentStepData.subtitle}</p>

            {/* Body text */}
            <div className="text-[15px] text-foreground/85 font-light leading-[1.7] mb-6 whitespace-pre-wrap">
              {currentStepData.text}
            </div>

            {/* Exercise section */}
            <div className="border-t border-border pt-5 mb-6">
              <p className="text-[11px] uppercase tracking-wider text-tertiary mb-3">Übung</p>
              <p className="text-sm text-foreground/80 font-light leading-relaxed">
                {currentStepData.exercise}
              </p>
            </div>

            {/* Reflection */}
            {currentStepData.has_reflection && (
              <div className="mb-6">
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Deine Reflexion zu dieser Übung..."
                  className="bg-transparent border-border rounded-2xl px-4 py-3 text-sm min-h-[80px] focus-visible:ring-0 focus-visible:border-primary"
                  maxLength={2000}
                />
              </div>
            )}

            <button
              onClick={handleCompleteStep}
              disabled={submitting || (currentStepData.has_reflection && !reflection.trim())}
              className="w-full rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {submitting
                ? "Wird gespeichert..."
                : currentStep === steps.length
                  ? "Programm abschließen (+100 XP)"
                  : `Tag abschließen (+20 XP)`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
