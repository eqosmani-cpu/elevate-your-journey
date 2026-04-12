import { motion } from "framer-motion";
import { GreenButton } from "@/components/ui/GreenButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { TierBadge } from "@/components/ui/TierBadge";
import { stepVariants, stepTransition } from "./OnboardingShared";
import { Sparkles, Loader2 } from "lucide-react";

// Label mappings for display
const positionLabels: Record<string, string> = {
  goalkeeper: "🥅 Torwart",
  defender: "🛡 Verteidiger",
  midfielder: "⚙️ Mittelfeld",
  striker: "⚡ Stürmer",
  other: "🔄 Andere",
};

const levelLabels: Record<string, string> = {
  amateur: "🌱 Amateur",
  aspiring: "📈 Aufstrebend",
  semi_pro: "🏆 Semi-Profi",
  pro: "⭐ Profi",
};

const challengeLabels: Record<string, string> = {
  fear_of_failure: "Versagensangst",
  concentration: "Konzentration",
  confidence: "Selbstvertrauen",
  external_pressure: "Druck von außen",
  injury_return: "Verletzungsrückkehr",
  team_dynamics: "Teamdynamik",
  form_loss: "Formtief",
  motivation: "Motivation",
  identity: "Identität",
};

interface StepCompleteProps {
  name: string;
  position: string;
  skillLevel: string;
  challenges: string[];
  isSaving: boolean;
  onFinish: () => void;
  onBack: () => void;
  direction: number;
}

export function StepComplete({
  name,
  position,
  skillLevel,
  challenges,
  isSaving,
  onFinish,
  onBack,
  direction,
}: StepCompleteProps) {
  const topChallenges = challenges.slice(0, 2);

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
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <Sparkles size={48} className="text-primary mb-4" />
      </motion.div>

      <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
        Dein MindPitch-Profil ist bereit!
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Alles eingerichtet. Los geht's mit deinem Training.
      </p>

      {/* Summary card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <UserAvatar name={name} level={1} xpProgress={0} size="md" />
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {positionLabels[position] || position} • {levelLabels[skillLevel] || skillLevel}
            </p>
          </div>
        </div>

        {/* Challenges tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topChallenges.map((c) => (
            <span
              key={c}
              className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold"
            >
              {challengeLabels[c] || c}
            </span>
          ))}
        </div>

        {/* XP starting */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Startpunkt</p>
            <p className="text-sm font-display font-bold text-primary">0 XP – Level 1: Rookie</p>
          </div>
          <TierBadge tier="free" />
        </div>
      </motion.div>

      <div className="w-full max-w-sm flex gap-3">
        <GreenButton variant="outline" size="lg" onClick={onBack} disabled={isSaving} className="flex-1">
          Zurück
        </GreenButton>
        <GreenButton size="lg" onClick={onFinish} disabled={isSaving} className="flex-1">
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Speichern...
            </>
          ) : (
            "Zum Dashboard →"
          )}
        </GreenButton>
      </div>
    </motion.div>
  );
}
