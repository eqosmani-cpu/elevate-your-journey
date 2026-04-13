import { cn } from "@/lib/utils";

const categoryChips = [
  { value: "all", label: "Alle" },
  { value: "focus", label: "Fokus" },
  { value: "confidence", label: "Selbstvertrauen" },
  { value: "pressure", label: "Druckbewältigung" },
  { value: "team", label: "Team" },
  { value: "recovery", label: "Erholung" },
  { value: "visualization", label: "Visualisierung" },
];

interface TaskFiltersProps {
  category: string;
  onCategoryChange: (v: string) => void;
}

export function TaskFilters({ category, onCategoryChange }: TaskFiltersProps) {
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-none">
        {categoryChips.map((c) => (
          <button
            key={c.value}
            onClick={() => onCategoryChange(c.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
              category === c.value
                ? "bg-primary/10 text-primary"
                : "text-tertiary hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="border-b border-border" />
    </div>
  );
}
