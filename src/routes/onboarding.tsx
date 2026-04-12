import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { OnboardingProgress } from "@/components/onboarding/OnboardingShared";
import { StepWelcome } from "@/components/onboarding/StepWelcome";
import { StepPosition } from "@/components/onboarding/StepPosition";
import { StepLevel } from "@/components/onboarding/StepLevel";
import { StepChallenges } from "@/components/onboarding/StepChallenges";
import { StepGoal } from "@/components/onboarding/StepGoal";
import { StepComplete } from "@/components/onboarding/StepComplete";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PlayerPosition = Database["public"]["Enums"]["player_position"];
type SkillLevel = Database["public"]["Enums"]["skill_level"];

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — MindPitch" },
      { name: "description", content: "Richte dein MindPitch-Profil ein." },
    ],
  }),
  component: OnboardingPage,
});

const TOTAL_STEPS = 6;

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [position, setPosition] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [challenges, setChallenges] = useState<string[]>([]);
  const [goal, setGoal] = useState("");

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const toggleChallenge = useCallback((value: string) => {
    setChallenges((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }, []);

  const handleFinish = useCallback(async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from("profiles").update({
        name: name.trim(),
        age: parseInt(age, 10),
        position: position as PlayerPosition,
        skill_level: skillLevel as SkillLevel,
        challenges,
        four_week_goal: goal.trim(),
        onboarding_completed: true,
        last_active: new Date().toISOString(),
      }).eq("id", user.id);

      if (error) {
        console.error("Error saving profile:", error);
        setIsSaving(false);
        return;
      }

      // Award initial XP for completing onboarding
      await supabase.rpc("add_xp", {
        _user_id: user.id,
        _points: 50,
        _reason: "Onboarding abgeschlossen",
        _source: "login",
      });

      navigate({ to: "/" });
    } catch (err) {
      console.error("Error during onboarding completion:", err);
      setIsSaving(false);
    }
  }, [name, age, position, skillLevel, challenges, goal, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <StepWelcome
              key="welcome"
              name={name}
              age={age}
              onNameChange={setName}
              onAgeChange={setAge}
              onNext={goNext}
              direction={direction}
            />
          )}
          {step === 2 && (
            <StepPosition
              key="position"
              position={position}
              onSelect={setPosition}
              onNext={goNext}
              onBack={goBack}
              direction={direction}
            />
          )}
          {step === 3 && (
            <StepLevel
              key="level"
              skillLevel={skillLevel}
              onSelect={setSkillLevel}
              onNext={goNext}
              onBack={goBack}
              direction={direction}
            />
          )}
          {step === 4 && (
            <StepChallenges
              key="challenges"
              challenges={challenges}
              onToggle={toggleChallenge}
              onNext={goNext}
              onBack={goBack}
              direction={direction}
            />
          )}
          {step === 5 && (
            <StepGoal
              key="goal"
              goal={goal}
              onGoalChange={setGoal}
              onNext={goNext}
              onBack={goBack}
              direction={direction}
            />
          )}
          {step === 6 && (
            <StepComplete
              key="complete"
              name={name}
              position={position}
              skillLevel={skillLevel}
              challenges={challenges}
              isSaving={isSaving}
              onFinish={handleFinish}
              onBack={goBack}
              direction={direction}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
