import { Bell } from "lucide-react";

interface TopbarProps {
  title: string;
}

function getFormattedDate(): string {
  const now = new Date();
  const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return `${days[now.getDay()]}, ${now.getDate()}. ${months[now.getMonth()]}`;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <div className="hidden md:flex items-center justify-between px-8 pt-8 pb-4">
      <h1 className="font-display text-[22px] text-foreground tracking-[-0.5px]">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-[13px] text-tertiary">
          {getFormattedDate()}
        </span>
        <button className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground">
          <Bell size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
