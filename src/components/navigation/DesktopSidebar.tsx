import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageSquare, Compass, CalendarDays, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/community", icon: MessageSquare, label: "Community" },
  { to: "/training", icon: Compass, label: "Training" },
  { to: "/coaching", icon: CalendarDays, label: "Coaching" },
  { to: "/progress", icon: BarChart3, label: "Fortschritt" },
  { to: "/profile", icon: User, label: "Profil" },
] as const;

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 bg-surface border-r border-border z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16">
        <span className="font-display text-xl text-foreground">
          MindPitch
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
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
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200",
                isActive
                  ? "bg-accent text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4">
        <div className="rounded-2xl bg-accent-light p-4">
          <p className="text-xs text-muted-foreground mb-1">Upgrade für mehr</p>
          <p className="text-sm font-display text-primary">Pro freischalten</p>
        </div>
      </div>
    </aside>
  );
}
