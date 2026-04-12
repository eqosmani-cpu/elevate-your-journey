import { motion } from "framer-motion";
import { GreenButton } from "@/components/ui/GreenButton";
import { stepVariants, stepTransition } from "./OnboardingShared";

interface StepGoalProps {
  goal: string;
  onGoalChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  direction: number;
}

export function StepGoal({ goal, onGoalChange, onNext, onBack, direction }: StepGoalProps) {
  return (
    <motion.div
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col items-center px-6 py-8"
    >
      <span className="text-6xl mb-4">🎯</span>
      <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
        Was willst du in 4 Wochen erreichen?
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Setze dir ein konkretes mentales Ziel.
      </p>

      <div className="w-full max-w-sm mb-8">
        <textarea
          value={goal}
          onChange={(e) => onGoalChange(e.target.value.slice(0, 150))}
          placeholder="z.B. Ruhiger bleiben nach Fehlern..."
          rows={4}
          className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5 text-right">
          {goal.length}/150 Zeichen
        </p>
      </div>

      <div className="w-full max-w-sm flex gap-3">
        <GreenButton variant="outline" size="lg" onClick={onBack} className="flex-1">
          Zurück
        </GreenButton>
        <GreenButton size="lg" onClick={onNext} disabled={goal.trim().length < 5} className="flex-1">
          Weiter →
        </GreenButton>
      </div>
    </motion.div>
  );
}
