import { motion } from "framer-motion";
import { GreenButton } from "@/components/ui/GreenButton";
import { SelectCard, stepVariants, stepTransition } from "./OnboardingShared";

const levels = [
  { value: "amateur", emoji: "🌱", label: "Amateur", sublabel: "Hobby / Kreisliga" },
  { value: "aspiring", emoji: "📈", label: "Aufstrebend", sublabel: "Landes-/Oberliga" },
  { value: "semi_pro", emoji: "🏆", label: "Semi-Profi", sublabel: "Regionalliga/Unterhaus" },
  { value: "pro", emoji: "⭐", label: "Profi", sublabel: "Vollzeit / NLZ" },
] as const;

interface StepLevelProps {
  skillLevel: string;
  onSelect: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  direction: number;
}

export function StepLevel({ skillLevel, onSelect, onNext, onBack, direction }: StepLevelProps) {
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
      <span className="text-6xl mb-4">📊</span>
      <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
        Wie würdest du dich einschätzen?
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Das hilft uns, Übungen auf dein Niveau abzustimmen.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
        {levels.map((l) => (
          <SelectCard
            key={l.value}
            emoji={l.emoji}
            label={l.label}
            sublabel={l.sublabel}
            selected={skillLevel === l.value}
            onClick={() => onSelect(l.value)}
          />
        ))}
      </div>

      <div className="w-full max-w-sm flex gap-3">
        <GreenButton variant="outline" size="lg" onClick={onBack} className="flex-1">
          Zurück
        </GreenButton>
        <GreenButton size="lg" onClick={onNext} disabled={!skillLevel} className="flex-1">
          Weiter →
        </GreenButton>
      </div>
    </motion.div>
  );
}
