import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <main className="md:ml-60 pb-20 md:pb-0 min-h-screen">
        {title && <Topbar title={title} />}
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
