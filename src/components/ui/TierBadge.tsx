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
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
  pro: {
    label: "Pro",
    icon: Zap,
    colorClass: "text-primary",
    bgClass: "bg-accent-light",
  },
  elite: {
    label: "Elite",
    icon: Crown,
    colorClass: "text-gold",
    bgClass: "bg-gold-light",
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] tracking-label uppercase font-body font-medium",
        config.bgClass,
        config.colorClass,
        className
      )}
    >
      <Icon size={12} strokeWidth={1.5} />
      <span>{config.label}</span>
    </div>
  );
}
