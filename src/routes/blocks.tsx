import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { DiagnosisFlow } from "@/components/blocks/DiagnosisFlow";
import { ProgramView } from "@/components/blocks/ProgramView";
import { useUserTier, useBlockPrograms, useActiveBlockProgress } from "@/hooks/useBlockBreaker";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { GreenButton } from "@/components/ui/GreenButton";
import { Lock, ArrowLeft, Crosshair } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/blocks")({
  head: () => ({
    meta: [
      { title: "Block Breaker — MindPitch" },
      { name: "description", content: "Überwinde mentale Blockaden mit dem Block Breaker Programm." },
    ],
  }),
  component: BlockBreakerPage,
});

function BlockBreakerPage() {
  const { data: user, isLoading: userLoading } = useUserTier();
  const { data: programs, isLoading: programsLoading } = useBlockPrograms();
  const { data: activeProgress, isLoading: progressLoading } = useActiveBlockProgress();
  const queryClient = useQueryClient();
  const [starting, setStarting] = useState(false);

  const isLoading = userLoading || programsLoading || progressLoading;
  const hasPremiumAccess = user?.tier === "pro" || user?.tier === "elite";

  const handleDiagnosisComplete = async (
    result: { block_type: string; intensity: number; duration: string; context: string; severity: string },
    program: Tables<"block_programs">
  ) => {
    setStarting(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase.from("block_progress").insert({
        program_id: program.id,
        user_id: authUser.id,
        current_step: 1,
        diagnosis_result: result as unknown as Record<string, unknown>,
      });
      if (error) throw error;

      toast.success("Programm gestartet! Los geht's 💪");
      queryClient.invalidateQueries({ queryKey: ["block-progress"] });
    } catch {
      toast.error("Fehler beim Starten des Programms.");
    } finally {
      setStarting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-60 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto pb-24">
        {/* Back */}
        <Link to="/training" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft size={14} /> Zurück zum Training
        </Link>

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Crosshair size={20} className="text-primary" />
          <h1 className="font-display font-bold text-xl text-foreground">Block Breaker</h1>
        </div>

        {/* Lock overlay for free users */}
        {!hasPremiumAccess && (
          <div className="relative">
            <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-8">
              <Lock size={32} className="text-muted-foreground mb-3" />
              <h2 className="font-display font-bold text-foreground mb-1">Pro Feature</h2>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                Block Breaker ist für Pro- und Elite-Spieler verfügbar. Upgrade deinen Account, um mentale Blockaden gezielt zu lösen.
              </p>
              <GreenButton size="sm">Upgrade auf Pro →</GreenButton>
            </div>

            {/* Preview content (blurred) */}
            <div className="rounded-2xl bg-card border border-border p-5 opacity-40 pointer-events-none">
              <p className="text-sm text-muted-foreground mb-3">Identifiziere und überwinde mentale Blockaden in 5 Tagen.</p>
              <div className="grid gap-2">
                {["📉 Formtief", "😰 Versagensangst", "😤 Druck", "🏥 Verletzung", "🎯 Fokus", "🆔 Identität"].map((item) => (
                  <div key={item} className="rounded-xl bg-secondary p-3 text-sm text-foreground/50">{item}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Premium content */}
        {hasPremiumAccess && (
          <>
            {/* Active program */}
            {activeProgress && (
              <ProgramView progress={activeProgress} />
            )}

            {/* No active program → show diagnosis */}
            {!activeProgress && programs && (
              <>
                <p className="text-xs text-muted-foreground mb-5">
                  Identifiziere deine mentale Blockade und löse sie in 5 Tagen mit einem gezielten Programm.
                </p>
                {starting ? (
                  <div className="text-center py-8">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Programm wird erstellt...</p>
                  </div>
                ) : (
                  <DiagnosisFlow programs={programs} onComplete={handleDiagnosisComplete} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
