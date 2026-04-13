import { cn } from "@/lib/utils";

const categoryTabs = [
  { value: "all", label: "Alle" },
  { value: "question", label: "Fragen" },
  { value: "tip", label: "Tipps" },
  { value: "experience", label: "Erfahrungen" },
  { value: "challenge", label: "Challenges" },
  { value: "motivation", label: "Motivation" },
];

interface ForumFiltersProps {
  category: string;
  onCategoryChange: (cat: string) => void;
}

export function ForumFilters({ category, onCategoryChange }: ForumFiltersProps) {
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-none">
        {categoryTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onCategoryChange(tab.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
              category === tab.value
                ? "bg-primary/10 text-primary"
                : "text-tertiary hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="border-b border-border" />
    </div>
  );
}
