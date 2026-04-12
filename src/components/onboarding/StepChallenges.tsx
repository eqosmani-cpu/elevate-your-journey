import { motion } from "framer-motion";
import { GreenButton } from "@/components/ui/GreenButton";
import { SelectCard, stepVariants, stepTransition } from "./OnboardingShared";
import { cn } from "@/lib/utils";

const challengeOptions = [
  { value: "fear_of_failure", emoji: "😰", label: "Versagensangst" },
  { value: "concentration", emoji: "🧘", label: "Konzentration" },
  { value: "confidence", emoji: "💪", label: "Selbstvertrauen" },
  { value: "external_pressure", emoji: "😤", label: "Druck von außen" },
  { value: "injury_return", emoji: "🏥", label: "Verletzungsrückkehr" },
  { value: "team_dynamics", emoji: "🤝", label: "Teamdynamik" },
  { value: "form_loss", emoji: "😶", label: "Formtief" },
  { value: "motivation", emoji: "🎯", label: "Motivation" },
  { value: "identity", emoji: "🆔", label: "Identität" },
];

interface StepChallengesProps {
  challenges: string[];
  onToggle: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  direction: number;
}

export function StepChallenges({ challenges, onToggle, onNext, onBack, direction }: StepChallengesProps) {
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
      <span className="text-6xl mb-4">🧠</span>
      <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
        Was belastet dich am meisten?
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Wähle alles, was auf dich zutrifft (mehrere möglich).
      </p>

      <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm mb-8">
        {challengeOptions.map((c) => (
          <SelectCard
            key={c.value}
            emoji={c.emoji}
            label={c.label}
            selected={challenges.includes(c.value)}
            onClick={() => onToggle(c.value)}
            className="py-3 px-2"
          />
        ))}
      </div>

      <div className="w-full max-w-sm flex gap-3">
        <GreenButton variant="outline" size="lg" onClick={onBack} className="flex-1">
          Zurück
        </GreenButton>
        <GreenButton size="lg" onClick={onNext} disabled={challenges.length === 0} className="flex-1">
          Weiter →
        </GreenButton>
      </div>
    </motion.div>
  );
}
