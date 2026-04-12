import { motion } from "framer-motion";
import { GreenButton } from "@/components/ui/GreenButton";
import { stepVariants, stepTransition } from "./OnboardingShared";

interface StepWelcomeProps {
  name: string;
  age: string;
  onNameChange: (v: string) => void;
  onAgeChange: (v: string) => void;
  onNext: () => void;
  direction: number;
}

export function StepWelcome({ name, age, onNameChange, onAgeChange, onNext, direction }: StepWelcomeProps) {
  const isValid = name.trim().length >= 2 && age.trim().length > 0 && Number(age) > 0;

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
      <span className="text-6xl mb-4">⚽</span>
      <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
        Willkommen bei MindPitch ⚽
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Deine mentale Stärke beginnt hier.
      </p>

      <div className="w-full max-w-sm space-y-4 mb-8">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dein Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Max Müller"
            maxLength={50}
            className="w-full h-11 rounded-xl bg-input border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dein Alter</label>
          <input
            type="number"
            value={age}
            onChange={(e) => onAgeChange(e.target.value)}
            placeholder="18"
            min={6}
            max={99}
            className="w-full h-11 rounded-xl bg-input border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      <GreenButton size="lg" onClick={onNext} disabled={!isValid} className="w-full max-w-sm">
        Los geht's →
      </GreenButton>
    </motion.div>
  );
}
