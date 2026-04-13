import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageSquare, Brain, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Übersicht" },
  { to: "/community", icon: MessageSquare, label: "Community" },
  { to: "/training", icon: Brain, label: "Training" },
  { to: "/coaching", icon: CalendarDays, label: "Coaching" },
  { to: "/profile", icon: User, label: "Profil" },
] as const;

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = item.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-tertiary"
              )}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] tracking-label uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
