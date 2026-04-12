import { useState, useCallback } from "react";
import { useUserTier } from "@/hooks/useBlockBreaker";

type TierLevel = "free" | "pro" | "elite";

const tierRank: Record<TierLevel, number> = { free: 0, pro: 1, elite: 2 };

export function useTierGate() {
  const { data: user, isLoading } = useUserTier();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [highlightTier, setHighlightTier] = useState<"pro" | "elite">("pro");

  const currentTier: TierLevel = (user?.tier as TierLevel) ?? "free";

  const hasAccess = useCallback(
    (requiredTier: TierLevel) => tierRank[currentTier] >= tierRank[requiredTier],
    [currentTier]
  );

  const requireTier = useCallback(
    (requiredTier: TierLevel): boolean => {
      if (hasAccess(requiredTier)) return true;
      setHighlightTier(requiredTier === "elite" ? "elite" : "pro");
      setUpgradeOpen(true);
      return false;
    },
    [hasAccess]
  );

  return {
    currentTier,
    isLoading,
    hasAccess,
    requireTier,
    upgradeOpen,
    setUpgradeOpen,
    highlightTier,
  };
}
