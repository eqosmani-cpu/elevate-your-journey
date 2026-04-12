import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageSquare, Brain, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/community", icon: MessageSquare, label: "Community" },
  { to: "/training", icon: Brain, label: "Training" },
  { to: "/progress", icon: BarChart3, label: "Fortschritt" },
  { to: "/profile", icon: User, label: "Profil" },
] as const;

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
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
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-all duration-200",
                isActive && "bg-primary/10 glow-neon"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
