import { cn } from "@/lib/utils";
import { ProgressRing } from "./ProgressRing";

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  level?: number;
  xpProgress?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  name,
  imageUrl,
  level = 1,
  xpProgress = 0,
  size = "md",
  className,
}: UserAvatarProps) {
  const sizeMap = {
    sm: { ring: 40, stroke: 2, text: "text-xs", badge: "text-[8px] w-4 h-4" },
    md: { ring: 52, stroke: 2.5, text: "text-sm", badge: "text-[9px] w-[18px] h-[18px]" },
    lg: { ring: 72, stroke: 3, text: "text-lg", badge: "text-[10px] w-5 h-5" },
  };

  const s = sizeMap[size];
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={cn("relative inline-flex", className)}>
      <ProgressRing progress={xpProgress} size={s.ring} strokeWidth={s.stroke}>
        <div className="rounded-full bg-muted flex items-center justify-center overflow-hidden"
          style={{ width: s.ring - s.stroke * 4, height: s.ring - s.stroke * 4 }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className={cn("font-body font-medium text-muted-foreground", s.text)}>
              {initials}
            </span>
          )}
        </div>
      </ProgressRing>
      <div className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full bg-primary text-primary-foreground font-body font-medium flex items-center justify-center",
        s.badge
      )}>
        {level}
      </div>
    </div>
  );
}
