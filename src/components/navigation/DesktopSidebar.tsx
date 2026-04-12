import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageSquare, Brain, CalendarDays, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/community", icon: MessageSquare, label: "Community" },
  { to: "/training", icon: Brain, label: "Training" },
  { to: "/coaching", icon: CalendarDays, label: "Coaching" },
  { to: "/profile", icon: User, label: "Profil" },
] as const;

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-border z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg gradient-neon flex items-center justify-center">
          <Zap size={18} className="text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-lg tracking-tight text-foreground">
          MindPitch
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary glow-neon"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-center">
          <p className="text-[11px] text-muted-foreground mb-1">Upgrade für mehr</p>
          <p className="text-xs font-display font-semibold text-primary">Pro freischalten</p>
        </div>
      </div>
    </aside>
  );
}
