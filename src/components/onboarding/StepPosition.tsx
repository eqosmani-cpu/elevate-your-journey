import { motion } from "framer-motion";
import { GreenButton } from "@/components/ui/GreenButton";
import { SelectCard, stepVariants, stepTransition } from "./OnboardingShared";

const positions = [
  { value: "goalkeeper", emoji: "🥅", label: "Torwart" },
  { value: "defender", emoji: "🛡", label: "Verteidiger" },
  { value: "midfielder", emoji: "⚙️", label: "Mittelfeld" },
  { value: "striker", emoji: "⚡", label: "Stürmer" },
  { value: "other", emoji: "🔄", label: "Andere" },
] as const;

interface StepPositionProps {
  position: string;
  onSelect: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  direction: number;
}

export function StepPosition({ position, onSelect, onNext, onBack, direction }: StepPositionProps) {
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
      <span className="text-6xl mb-4">🏟️</span>
      <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
        Wo spielst du?
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Wähle deine Position auf dem Platz.
      </p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
        {positions.map((p) => (
          <SelectCard
            key={p.value}
            emoji={p.emoji}
            label={p.label}
            selected={position === p.value}
            onClick={() => onSelect(p.value)}
            className={p.value === "other" ? "col-span-3 flex-row gap-2" : ""}
          />
        ))}
      </div>

      <div className="w-full max-w-sm flex gap-3">
        <GreenButton variant="outline" size="lg" onClick={onBack} className="flex-1">
          Zurück
        </GreenButton>
        <GreenButton size="lg" onClick={onNext} disabled={!position} className="flex-1">
          Weiter →
        </GreenButton>
      </div>
    </motion.div>
  );
}
