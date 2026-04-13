import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface DashboardGreetingProps {
  profile: Profile;
  tasksThisWeek: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export function DashboardGreeting({ profile, tasksThisWeek }: DashboardGreetingProps) {
  const greeting = getGreeting();
  const firstName = (profile.name || "Spieler").split(" ")[0];

  return (
    <div className="mb-8">
      <h1 className="font-display text-4xl text-foreground tracking-[-0.5px] leading-[1.15]">
        {greeting}, {firstName}.
      </h1>
      <p className="text-sm text-muted-foreground font-light mt-2">
        Du hast diese Woche {tasksThisWeek} Aufgaben abgeschlossen.
      </p>
    </div>
  );
}
