import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/navigation/AppShell";
import { DiagnosisFlow } from "@/components/blocks/DiagnosisFlow";
import { ProgramView } from "@/components/blocks/ProgramView";
import { useBlockPrograms, useActiveBlockProgress } from "@/hooks/useBlockBreaker";
import { useTierGate } from "@/hooks/useTierGate";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check } from "lucide-react";
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
  const { data: programs, isLoading: programsLoading } = useBlockPrograms();
  const { data: activeProgress, isLoading: progressLoading } = useActiveBlockProgress();
  const { upgradeOpen, setUpgradeOpen, highlightTier, hasAccess, isLoading: tierLoading } = useTierGate();
  const queryClient = useQueryClient();
  const [starting, setStarting] = useState(false);

  const isLoading = tierLoading || programsLoading || progressLoading;
  const hasPremiumAccess = hasAccess("pro");

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
        diagnosis_result: result as any,
      } as any);
      if (error) throw error;
      toast.success("Programm gestartet!");
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
        <div className="max-w-[800px] mx-auto px-5 py-8 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-60 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-[800px] mx-auto px-5 py-8 md:px-8 pb-24">
        <Link to="/training" className="flex items-center gap-1 text-[13px] text-primary hover:opacity-70 transition-opacity mb-6">
          <ArrowLeft size={14} strokeWidth={1.5} /> Training
        </Link>

        {/* Free tier gate */}
        {!hasPremiumAccess && (
          <div className="text-center py-8">
            {/* Geometric illustration */}
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-3xl bg-primary/5 rotate-12" />
              <div className="absolute inset-2 rounded-2xl bg-primary/10 -rotate-6" />
              <div className="absolute inset-4 rounded-xl bg-primary/15 rotate-3 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>

            <h1 className="font-display text-[32px] text-foreground tracking-[-0.5px] mb-2">
              Block Breaker
            </h1>
            <p className="text-[15px] text-tertiary font-light max-w-sm mx-auto mb-8">
              Löse tief verwurzelte mentale Blockaden in 5 Tagen.
            </p>

            {/* Feature list */}
            <div className="max-w-xs mx-auto text-left space-y-4 mb-8">
              {[
                "Strukturierte 5-Tage-Programme",
                "Evidenzbasierte Techniken",
                "Persönlicher Fortschrittsbericht",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check size={16} strokeWidth={1.5} className="text-primary shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setUpgradeOpen(true)}
              className="w-full max-w-xs mx-auto rounded-[10px] bg-primary text-primary-foreground px-[22px] py-[11px] text-[13px] font-medium hover:opacity-90 transition-opacity block mb-3"
            >
              Pro freischalten — ab €9,99/Monat
            </button>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="w-full max-w-xs mx-auto rounded-[10px] border border-border px-[22px] py-[11px] text-[13px] text-foreground hover:bg-muted/30 transition-colors block"
            >
              Mehr erfahren
            </button>
          </div>
        )}

        {/* Pro/Elite: active program or diagnosis */}
        {hasPremiumAccess && (
          <>
            {activeProgress && <ProgramView progress={activeProgress} />}
            {!activeProgress && programs && (
              <>
                {starting ? (
                  <div className="text-center py-12">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <p className="text-xs text-tertiary mt-2">Programm wird erstellt...</p>
                  </div>
                ) : (
                  <DiagnosisFlow programs={programs} onComplete={handleDiagnosisComplete} />
                )}
              </>
            )}
          </>
        )}
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} highlightTier={highlightTier} />
    </AppShell>
  );
}
