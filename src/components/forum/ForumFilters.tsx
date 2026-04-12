import { cn } from "@/lib/utils";

const categoryTabs = [
  { value: "all", label: "Alle" },
  { value: "question", label: "Fragen" },
  { value: "experience", label: "Erfahrungen" },
  { value: "tip", label: "Tipps" },
  { value: "challenge", label: "Challenges" },
  { value: "motivation", label: "Motivation" },
];

const sortOptions = [
  { value: "new", label: "Neu" },
  { value: "trending", label: "Trending" },
  { value: "answered", label: "Beantwortet" },
  { value: "unanswered", label: "Unbeantwortet" },
];

interface ForumFiltersProps {
  category: string;
  sort: string;
  onCategoryChange: (cat: string) => void;
  onSortChange: (sort: string) => void;
}

export function ForumFilters({ category, sort, onCategoryChange, onSortChange }: ForumFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoryTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onCategoryChange(tab.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              category === tab.value
                ? "bg-primary text-primary-foreground glow-neon"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort buttons */}
      <div className="flex gap-1.5">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all",
              sort === opt.value
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
