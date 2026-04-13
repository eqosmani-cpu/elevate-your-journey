import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockedOverlayProps {
  tier?: "pro" | "elite";
  onUpgrade?: () => void;
  className?: string;
}

/**
 * Apple-style locked content overlay.
 * Wrap content in a relative container, then place this on top.
 * Uses a fade-to-white gradient + centered lock — no blur.
 */
export function LockedOverlay({ tier = "pro", onUpgrade, className }: LockedOverlayProps) {
  const label = tier === "elite" ? "Elite" : "Pro";

  return (
    <div className={cn("absolute inset-0 z-10 flex flex-col items-center justify-center", className)}>
      {/* Fade gradient from transparent to near-white */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(250,250,248,0.6)] to-[#FAFAF8]" />

      {/* Lock content */}
      <div className="relative flex flex-col items-center gap-2">
        <Lock size={24} strokeWidth={1.5} className="text-[#A8A8A8]" />
        <p className="text-[13px] text-[#6B6B6B]">{label} erforderlich</p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="text-[13px] font-medium text-[#3A5C4A] hover:underline mt-1"
          >
            Upgrade →
          </button>
        )}
      </div>
    </div>
  );
}
