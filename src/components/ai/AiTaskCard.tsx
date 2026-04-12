import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Sparkles, ChevronDown, ChevronUp, Quote, ArrowRight } from "lucide-react";
import { GreenButton } from "@/components/ui/GreenButton";
import type { AiTask } from "@/hooks/useAiCoach";

const categoryLabels: Record<string, string> = {
  focus: "Fokus",
  confidence: "Selbstvertrauen",
  pressure: "Druck",
  team: "Team",
  recovery: "Erholung",
  visualization: "Visualisierung",
};

interface AiTaskCardProps {
  task: AiTask;
  onStart?: () => void;
  onDismiss?: () => void;
}

export function AiTaskCard({ task, onStart, onDismiss }: AiTaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 rounded-lg bg-accent-light text-primary px-2.5 py-0.5 text-[11px] font-medium tracking-label uppercase">
          <Sparkles size={10} strokeWidth={1.5} /> KI-Aufgabe
        </span>
        <span className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-light text-muted-foreground">
          {categoryLabels[task.category] || task.category}
        </span>
      </div>

      <h3 className="font-display text-[16px] text-card-foreground leading-snug mb-2">
        {task.title}
      </h3>

      <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 font-light">{task.why_this_helps}</p>

      <div className="flex items-center gap-1.5 text-muted-foreground text-[12px] mb-3 font-light">
        <Clock size={12} strokeWidth={1.5} />
        <span>{task.duration_min} Min.</span>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[12px] text-primary font-medium mb-2 hover:opacity-70 transition-opacity"
      >
        {expanded ? <ChevronUp size={12} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />}
        {task.steps.length} Schritte {expanded ? "ausblenden" : "anzeigen"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ol className="space-y-1.5 mb-3 ml-1">
              {task.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-foreground/80 font-light">
                  <span className="text-primary font-medium min-w-[16px]">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Affirmation */}
      <div className="rounded-xl bg-gold-light border border-border p-3 mb-4 flex gap-2 items-start">
        <Quote size={12} className="text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
        <p className="text-[12px] text-gold italic leading-relaxed font-light">"{task.affirmation}"</p>
      </div>

      <div className="flex gap-2">
        <GreenButton onClick={onStart} className="flex-1">
          Aufgabe starten
          <ArrowRight size={14} strokeWidth={1.5} />
        </GreenButton>
        {onDismiss && (
          <button onClick={onDismiss} className="px-3 py-2 rounded-[10px] text-[12px] text-muted-foreground hover:text-foreground border border-border bg-transparent transition-colors font-light">
            Verwerfen
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface AiGenerateButtonProps {
  loading: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}

export function AiGenerateButton({ loading, onClick, label = "KI-Aufgabe für mich", className }: AiGenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-[14px] font-body font-medium text-foreground shadow-xs card-hover",
        loading && "opacity-70 cursor-wait",
        className
      )}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="font-light">Wird generiert...</span>
        </>
      ) : (
        <>
          <Sparkles size={16} strokeWidth={1.5} className="text-primary" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
