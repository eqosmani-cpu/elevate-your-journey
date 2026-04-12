import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      {/* Main content area */}
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
