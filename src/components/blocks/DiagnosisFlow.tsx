import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ChevronRight, Star } from "lucide-react";
import { useCoaches } from "@/hooks/useCoaching";
import type { Tables } from "@/integrations/supabase/types";

const blockOptions = [
  { value: "form_loss" as const, label: "Formtief & Selbstzweifel" },
  { value: "fear_of_failure" as const, label: "Angst vor Fehlern" },
  { value: "external_pressure" as const, label: "Äußerer Druck" },
  { value: "injury_return" as const, label: "Verletzungsrückkehr" },
  { value: "concentration" as const, label: "Konzentrationsprobleme" },
  { value: "identity_crisis" as const, label: "Identitätskrise" },
];

const durationOptions = [
  { value: "this_week", label: "Seit dieser Woche" },
  { value: "2_4_weeks", label: "2–4 Wochen" },
  { value: "1_3_months", label: "1–3 Monate" },
  { value: "longer", label: "Länger als 3 Monate" },
];

const contextOptions = [
  { value: "before_game", label: "Vor dem Spiel" },
  { value: "during_game", label: "Während des Spiels" },
  { value: "in_training", label: "Im Training" },
  { value: "always", label: "Immer / dauerhaft" },
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

const blockToSpecialization: Record<string, string[]> = {
  form_loss: ["Formtief", "Selbstvertrauen", "Kognitive Verhaltenstherapie"],
  fear_of_failure: ["Versagensangst", "Druckbewältigung", "Angst"],
  external_pressure: ["Druckbewältigung", "Achtsamkeit", "NLP"],
  injury_return: ["Verletzungsrückkehr", "Visualisierung", "Comeback"],
  concentration: ["Konzentration", "Achtsamkeit", "Fokus"],
  identity_crisis: ["Identitätskrise", "NLP", "Jugendspieler"],
};

export function DiagnosisFlow({ programs, onComplete }: DiagnosisFlowProps) {
  const [step, setStep] = useState(0);
  const [blockType, setBlockType] = useState<BlockCategory | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState<string | null>(null);
  const [context, setContext] = useState<string | null>(null);

  const { data: allCoaches } = useCoaches({ availableOnly: true });
  const matchedCoaches = blockType
    ? (allCoaches ?? []).filter((c) =>
        c.specialization?.some((s) =>
          blockToSpecialization[blockType]?.some((kw) =>
            s.toLowerCase().includes(kw.toLowerCase())
          )
        )
      ).slice(0, 2)
    : [];

  const handleFinish = () => {
    if (!blockType || !duration || !context) return;
    let severityScore = intensity;
    if (duration === "1_3_months") severityScore += 2;
    if (duration === "longer") severityScore += 4;
    if (context === "always") severityScore += 2;
    const severity = severityScore <= 5 ? "leicht" : severityScore <= 9 ? "mittel" : "tief";
    const result: DiagnosisResult = { block_type: blockType, intensity, duration, context, severity };
    const program = programs.find((p) => p.block_category === blockType);
    if (program) onComplete(result, program);
  };

  const severityLabel = intensity <= 3 ? "Leicht" : intensity <= 7 ? "Mittel" : "Tief";
  const severityBg = intensity <= 3 ? "bg-primary/10 text-primary" : intensity <= 7 ? "bg-[#F5F0EA] text-[#8A7A5A]" : "bg-destructive/10 text-destructive";

  const anim = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 }, transition: { duration: 0.25 } };

  return (
    <div>
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Block type */}
        {step === 0 && (
          <motion.div key="s0" {...anim} className="text-center">
            <h2 className="font-display text-[26px] text-foreground tracking-[-0.3px] mb-6">
              Was blockiert dich gerade?
            </h2>
            <div className="max-w-md mx-auto space-y-1">
              {blockOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBlockType(opt.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-left",
                    blockType === opt.value
                      ? "bg-primary/8 text-primary"
                      : "text-foreground hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      blockType === opt.value ? "bg-primary" : "bg-border"
                    )} />
                    <span className="text-[15px]">{opt.label}</span>
                  </div>
                  {blockType === opt.value && (
                    <ChevronRight size={16} strokeWidth={1.5} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => blockType && setStep(1)}
              disabled={!blockType}
              className="w-full max-w-md mx-auto mt-6 rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 block"
            >
              Weiter →
            </button>
          </motion.div>
        )}

        {/* Step 2: Intensity */}
        {step === 1 && (
          <motion.div key="s1" {...anim} className="text-center">
            <h2 className="font-display text-[26px] text-foreground tracking-[-0.3px] mb-8">
              Wie stark beeinflusst das deine Leistung?
            </h2>
            <div className="max-w-sm mx-auto">
              <span className="font-display text-5xl text-foreground">{intensity}</span>
              <Slider
                value={[intensity]}
                onValueChange={(v) => setIntensity(v[0])}
                min={1}
                max={10}
                step={1}
                className="mt-6 mb-3"
              />
              <div className="flex justify-between text-xs text-tertiary">
                <span>Kaum spürbar</span>
                <span>Sehr stark</span>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full max-w-sm mx-auto mt-8 rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity block"
            >
              Weiter →
            </button>
          </motion.div>
        )}

        {/* Step 3: Duration */}
        {step === 2 && (
          <motion.div key="s2" {...anim} className="text-center">
            <h2 className="font-display text-[26px] text-foreground tracking-[-0.3px] mb-6">
              Seit wann besteht das?
            </h2>
            <div className="max-w-md mx-auto space-y-1">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-left",
                    duration === opt.value
                      ? "bg-primary/8 text-primary"
                      : "text-foreground hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      duration === opt.value ? "bg-primary" : "bg-border"
                    )} />
                    <span className="text-[15px]">{opt.label}</span>
                  </div>
                  {duration === opt.value && (
                    <ChevronRight size={16} strokeWidth={1.5} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => duration && setStep(3)}
              disabled={!duration}
              className="w-full max-w-md mx-auto mt-6 rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 block"
            >
              Weiter →
            </button>
          </motion.div>
        )}

        {/* Step 4: Context */}
        {step === 3 && (
          <motion.div key="s3" {...anim} className="text-center">
            <h2 className="font-display text-[26px] text-foreground tracking-[-0.3px] mb-6">
              Wann tritt es am stärksten auf?
            </h2>
            <div className="max-w-md mx-auto space-y-1">
              {contextOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setContext(opt.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-left",
                    context === opt.value
                      ? "bg-primary/8 text-primary"
                      : "text-foreground hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      context === opt.value ? "bg-primary" : "bg-border"
                    )} />
                    <span className="text-[15px]">{opt.label}</span>
                  </div>
                  {context === opt.value && (
                    <ChevronRight size={16} strokeWidth={1.5} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => context && setStep(4)}
              disabled={!context}
              className="w-full max-w-md mx-auto mt-6 rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 block"
            >
              Ergebnis anzeigen →
            </button>
          </motion.div>
        )}

        {/* Step 5: Result */}
        {step === 4 && blockType && (
          <motion.div key="s4" {...anim} className="text-center">
            <h2 className="font-display text-[28px] text-foreground tracking-[-0.3px] mb-4">
              Dein Block-Profil
            </h2>

            {/* Severity pill */}
            <div className={cn("inline-flex rounded-full px-4 py-1.5 text-xs font-medium mb-6", severityBg)}>
              {severityLabel}
            </div>

            {/* Recommended program */}
            <div className="mb-2">
              <p className="font-display text-xl text-foreground">
                {programs.find((p) => p.block_category === blockType)?.title}
              </p>
              <p className="text-sm text-tertiary font-light mt-1">5 Tage · 15 Min täglich</p>
            </div>

            {/* Coach recommendations */}
            {matchedCoaches.length > 0 && (
              <div className="max-w-sm mx-auto mt-6 mb-6">
                <p className="text-xs uppercase tracking-wider text-tertiary mb-3">Empfohlene Coaches</p>
                <div className="space-y-2">
                  {matchedCoaches.map((c) => (
                    <Link
                      key={c.id}
                      to="/coaching/$coachId"
                      params={{ coachId: c.id }}
                      className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3 hover:translate-y-[-1px] hover:shadow-sm transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs text-tertiary shrink-0">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm text-foreground">{c.name}</p>
                        <div className="flex items-center gap-1 text-xs text-tertiary">
                          <Star size={10} className="text-[#B8976A] fill-[#B8976A]" />
                          <span>{Number(c.rating).toFixed(1)}</span>
                          <span>· ab €{c.price_eur}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} strokeWidth={1.5} className="text-tertiary" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleFinish}
              className="w-full max-w-sm mx-auto rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity block mt-6"
            >
              Programm starten →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
