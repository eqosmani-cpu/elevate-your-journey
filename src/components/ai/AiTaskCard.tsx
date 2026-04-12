import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Sparkles, ChevronDown, ChevronUp, Quote } from "lucide-react";
import { GreenButton } from "@/components/ui/GreenButton";
import type { AiTask } from "@/hooks/useAiCoach";

const categoryLabels: Record<string, string> = {
  focus: "🎯 Fokus",
  confidence: "💪 Selbstvertrauen",
  pressure: "😤 Druck",
  team: "🤝 Team",
  recovery: "🏥 Erholung",
  visualization: "🧘 Visualisierung",
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
      className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-card to-amber-500/5 p-5 relative overflow-hidden"
    >
      {/* Shimmer accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-amber-400 to-purple-500" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 text-purple-400 px-2.5 py-0.5 text-[11px] font-semibold">
          <Sparkles size={10} /> KI-Aufgabe
        </span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {categoryLabels[task.category] || task.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-card-foreground text-base leading-snug mb-2">
        {task.title}
      </h3>

      {/* Why this helps */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{task.why_this_helps}</p>

      {/* Duration */}
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
        <Clock size={12} />
        <span>{task.duration_min} Min.</span>
      </div>

      {/* Expandable steps */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-purple-400 font-medium mb-2 hover:text-purple-300 transition-colors"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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
                <li key={i} className="flex gap-2 text-xs text-foreground/80">
                  <span className="text-purple-400 font-bold min-w-[16px]">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Affirmation */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-4 flex gap-2 items-start">
        <Quote size={12} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-300/90 italic leading-relaxed">"{task.affirmation}"</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <GreenButton onClick={onStart} className="flex-1">
          Aufgabe starten →
        </GreenButton>
        {onDismiss && (
          <button onClick={onDismiss} className="px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground bg-secondary transition-colors">
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
        "flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-amber-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition-all duration-200",
        "hover:border-purple-500/50 hover:from-purple-500/15 hover:to-amber-500/15 active:scale-[0.98]",
        loading && "opacity-70 cursor-wait",
        className
      )}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <span>Wird generiert...</span>
        </>
      ) : (
        <>
          <Sparkles size={16} className="text-purple-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
