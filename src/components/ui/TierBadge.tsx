import { cn } from "@/lib/utils";

type Tier = "free" | "pro" | "elite";

interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  if (tier === "free") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium",
        tier === "pro" && "bg-[#F5EDE0] text-[#B8976A]",
        tier === "elite" && "bg-[#EDF2EE] text-[#3A5C4A]",
        className
      )}
    >
      {tier === "pro" ? "Pro" : "Elite"}
    </span>
  );
}
