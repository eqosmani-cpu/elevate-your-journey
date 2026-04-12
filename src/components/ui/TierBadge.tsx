import { cn } from "@/lib/utils";
import { Shield, Zap, Crown } from "lucide-react";

type Tier = "free" | "pro" | "elite";

interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

const tierConfig: Record<Tier, { label: string; icon: React.ElementType; colorClass: string; bgClass: string }> = {
  free: {
    label: "Free",
    icon: Shield,
    colorClass: "text-tier-free",
    bgClass: "bg-tier-free/15",
  },
  pro: {
    label: "Pro",
    icon: Zap,
    colorClass: "text-tier-pro",
    bgClass: "bg-tier-pro/15",
  },
  elite: {
    label: "Elite",
    icon: Crown,
    colorClass: "text-tier-elite",
    bgClass: "bg-tier-elite/15",
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-display font-semibold",
        config.bgClass,
        config.colorClass,
        className
      )}
    >
      <Icon size={12} />
      <span>{config.label}</span>
    </div>
  );
}
