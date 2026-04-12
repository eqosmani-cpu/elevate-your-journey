import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const categoryChips = [
  { value: "all", label: "Alle", emoji: "📋" },
  { value: "focus", label: "Focus", emoji: "🎯" },
  { value: "confidence", label: "Confidence", emoji: "💪" },
  { value: "pressure", label: "Pressure", emoji: "😤" },
  { value: "team", label: "Team", emoji: "🤝" },
  { value: "recovery", label: "Recovery", emoji: "🏥" },
  { value: "visualization", label: "Visualization", emoji: "🧘" },
];

const durationFilters = [
  { value: "all", label: "Alle" },
  { value: "short", label: "≤5 Min" },
  { value: "medium", label: "6–10 Min" },
  { value: "long", label: "10+ Min" },
];

interface TaskFiltersProps {
  search: string;
  category: string;
  duration: string;
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onDurationChange: (v: string) => void;
}

export function TaskFilters({
  search, category, duration,
  onSearchChange, onCategoryChange, onDurationChange,
}: TaskFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Übung suchen..."
          className="pl-9 bg-secondary border-border h-9 text-sm"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoryChips.map((c) => (
          <button
            key={c.value}
            onClick={() => onCategoryChange(c.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1",
              category === c.value
                ? "bg-primary text-primary-foreground glow-neon"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Duration filter */}
      <div className="flex gap-1.5">
        {durationFilters.map((d) => (
          <button
            key={d.value}
            onClick={() => onDurationChange(d.value)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all",
              duration === d.value
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
