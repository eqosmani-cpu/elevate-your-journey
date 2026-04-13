import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageSquare, Brain, Lock, CalendarDays, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { to: "/", icon: Home, label: "Übersicht", proFeature: false },
  { to: "/community", icon: MessageSquare, label: "Community", proFeature: false },
  { to: "/training", icon: Brain, label: "Training", proFeature: false },
  { to: "/blocks", icon: Lock, label: "Block Breaker", proFeature: true },
  { to: "/coaching", icon: CalendarDays, label: "Coaching", proFeature: false },
] as const;

const profileNavItems = [
  { to: "/progress", icon: BarChart3, label: "Fortschritt" },
  { to: "/profile", icon: Settings, label: "Einstellungen" },
] as const;

export function DesktopSidebar() {
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 bg-surface border-r border-border z-50">
      {/* Logo */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="font-display text-xl text-foreground tracking-[-0.5px]">
          Mind·Pitch
        </h1>
        <p className="text-[10px] uppercase tracking-label text-tertiary mt-0.5">
          Mentales Training
        </p>
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 h-px bg-border" />

      {/* Main nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-label text-tertiary">
          Hauptmenü
        </p>
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-colors duration-200",
                  active
                    ? "bg-accent-light text-primary"
                    : "text-muted-foreground hover:bg-accent-light/60 hover:text-primary/60"
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
                <span className="flex-1">{item.label}</span>
                {item.proFeature && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Profile section */}
        <p className="px-3 mt-6 mb-2 text-[10px] uppercase tracking-label text-tertiary">
          Mein Profil
        </p>
        <div className="space-y-0.5">
          {profileNavItems.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-colors duration-200",
                  active
                    ? "bg-accent-light text-primary"
                    : "text-muted-foreground hover:bg-accent-light/60 hover:text-primary/60"
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User pill */}
      <div className="px-3 pb-4 pt-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-body text-muted-foreground">MM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground truncate">Max Müller</p>
            <p className="text-[10px] uppercase tracking-label text-gold">Pro</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
