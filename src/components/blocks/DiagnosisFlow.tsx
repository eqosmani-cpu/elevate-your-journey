import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { GreenButton } from "@/components/ui/GreenButton";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useCoaches } from "@/hooks/useCoaching";
import type { Tables } from "@/integrations/supabase/types";

const blockOptions = [
  { value: "form_loss" as const, emoji: "📉", label: "Formtief & Selbstzweifel" },
  { value: "fear_of_failure" as const, emoji: "😰", label: "Angst vor Fehlern" },
  { value: "external_pressure" as const, emoji: "😤", label: "Druck von außen" },
  { value: "injury_return" as const, emoji: "🏥", label: "Verletzungsrückkehr" },
  { value: "concentration" as const, emoji: "🎯", label: "Konzentrationsprobleme" },
  { value: "identity_crisis" as const, emoji: "🆔", label: "Identitätskrise" },
];

const durationOptions = [
  { value: "this_week", label: "Diese Woche" },
  { value: "2_4_weeks", label: "2–4 Wochen" },
  { value: "1_3_months", label: "1–3 Monate" },
  { value: "longer", label: "Länger als 3 Monate" },
];

const contextOptions = [
  { value: "before_game", label: "Vor dem Spiel" },
  { value: "during_game", label: "Während des Spiels" },
  { value: "in_training", label: "Im Training" },
  { value: "always", label: "Immer" },
];

type BlockCategory = Tables<"block_programs">["block_category"];

interface DiagnosisResult {
  block_type: BlockCategory;
  intensity: number;
  duration: string;
  context: string;
  severity: "leicht" | "mittel" | "tief";
}

interface DiagnosisFlowProps {
  programs: Tables<"block_programs">[];
  onComplete: (result: DiagnosisResult, program: Tables<"block_programs">) => void;
}

export function DiagnosisFlow({ programs, onComplete }: DiagnosisFlowProps) {
  const [step, setStep] = useState(0);
  const [blockType, setBlockType] = useState<BlockCategory | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState<string | null>(null);
  const [context, setContext] = useState<string | null>(null);

  const handleFinish = () => {
    if (!blockType || !duration || !context) return;

    // Calculate severity
    let severityScore = intensity;
    if (duration === "1_3_months") severityScore += 2;
    if (duration === "longer") severityScore += 4;
    if (context === "always") severityScore += 2;
    const severity = severityScore <= 5 ? "leicht" : severityScore <= 9 ? "mittel" : "tief";

    const result: DiagnosisResult = { block_type: blockType, intensity, duration, context, severity };
    const program = programs.find((p) => p.block_category === blockType);
    if (program) onComplete(result, program);
  };

  const anim = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 }, transition: { duration: 0.25 } };

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all", i <= step ? "bg-primary glow-neon" : "bg-muted")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Screen 1: Block type */}
        {step === 0 && (
          <motion.div key="s0" {...anim}>
            <h2 className="font-display font-bold text-lg text-foreground mb-1">Was blockiert dich gerade?</h2>
            <p className="text-xs text-muted-foreground mb-5">Wähle das Thema, das dich am meisten beschäftigt.</p>
            <div className="grid gap-2">
              {blockOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBlockType(opt.value)}
                  className={cn(
                    "w-full text-left rounded-xl p-3.5 border transition-all flex items-center gap-3",
                    blockType === opt.value ? "border-primary bg-primary/10 glow-neon" : "border-border bg-card hover:border-border/80"
                  )}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
            <GreenButton onClick={() => step === 0 && blockType && setStep(1)} disabled={!blockType} className="w-full mt-5">
              Weiter
            </GreenButton>
          </motion.div>
        )}

        {/* Screen 2: Intensity */}
        {step === 1 && (
          <motion.div key="s1" {...anim}>
            <h2 className="font-display font-bold text-lg text-foreground mb-1">Wie stark beeinflusst das deine Leistung?</h2>
            <p className="text-xs text-muted-foreground mb-8">1 = kaum spürbar · 10 = dominiert alles</p>
            <div className="px-2">
              <div className="text-center mb-4">
                <span className="font-display font-bold text-4xl text-primary glow-neon-text">{intensity}</span>
                <span className="text-muted-foreground text-sm ml-1">/ 10</span>
              </div>
              <Slider value={[intensity]} onValueChange={(v) => setIntensity(v[0])} min={1} max={10} step={1} className="mb-4" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Leicht</span><span>Mittel</span><span>Stark</span>
              </div>
            </div>
            <GreenButton onClick={() => setStep(2)} className="w-full mt-8">Weiter</GreenButton>
          </motion.div>
        )}

        {/* Screen 3: Duration */}
        {step === 2 && (
          <motion.div key="s2" {...anim}>
            <h2 className="font-display font-bold text-lg text-foreground mb-1">Seit wann besteht das?</h2>
            <p className="text-xs text-muted-foreground mb-5">Je länger, desto tiefer sitzt der Block.</p>
            <div className="grid gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={cn(
                    "w-full text-left rounded-xl p-3.5 border transition-all",
                    duration === opt.value ? "border-primary bg-primary/10 glow-neon" : "border-border bg-card hover:border-border/80"
                  )}
                >
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
            <GreenButton onClick={() => duration && setStep(3)} disabled={!duration} className="w-full mt-5">Weiter</GreenButton>
          </motion.div>
        )}

        {/* Screen 4: Context */}
        {step === 3 && (
          <motion.div key="s3" {...anim}>
            <h2 className="font-display font-bold text-lg text-foreground mb-1">Wann tritt es am stärksten auf?</h2>
            <p className="text-xs text-muted-foreground mb-5">Das hilft uns, die Übungen anzupassen.</p>
            <div className="grid gap-2">
              {contextOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setContext(opt.value)}
                  className={cn(
                    "w-full text-left rounded-xl p-3.5 border transition-all",
                    context === opt.value ? "border-primary bg-primary/10 glow-neon" : "border-border bg-card hover:border-border/80"
                  )}
                >
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
            <GreenButton onClick={() => context && setStep(4)} disabled={!context} className="w-full mt-5">Ergebnis anzeigen</GreenButton>
          </motion.div>
        )}

        {/* Screen 5: Result */}
        {step === 4 && blockType && (
          <motion.div key="s4" {...anim}>
            <div className="rounded-2xl border border-primary/30 bg-card p-5 text-center">
              <div className="text-4xl mb-3">🧠</div>
              <h2 className="font-display font-bold text-lg text-foreground mb-1">Dein Block-Profil</h2>
              <p className="text-xs text-muted-foreground mb-4">
                {blockOptions.find((b) => b.value === blockType)?.label}
              </p>

              {/* Severity */}
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 mb-4">
                <span className="text-xs text-muted-foreground">Tiefe:</span>
                <span className={cn(
                  "text-xs font-bold",
                  intensity <= 3 ? "text-primary" : intensity <= 7 ? "text-amber-400" : "text-destructive"
                )}>
                  {intensity <= 3 ? "Leicht" : intensity <= 7 ? "Mittel" : "Tief"}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={cn("w-2 h-2 rounded-full", i <= Math.ceil(intensity / 3.5) ? "bg-primary" : "bg-muted")} />
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4 mb-4 text-left">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {programs.find((p) => p.block_category === blockType)?.title}
                </h3>
                <p className="text-xs text-muted-foreground">5 Tage × 15 Min · Schritt für Schritt</p>
              </div>

              <GreenButton onClick={handleFinish} className="w-full">
                Programm starten →
              </GreenButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
