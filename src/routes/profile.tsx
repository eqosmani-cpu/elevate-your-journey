import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/navigation/AppShell";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { TierBadge } from "@/components/ui/TierBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { GreenButton } from "@/components/ui/GreenButton";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { Settings, ChevronRight, Award, BookOpen, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil — MindPitch" },
      { name: "description", content: "Dein Profil und Fortschritt." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleMenuClick = async (item: string) => {
    switch (item) {
      case "Erfolge & Abzeichen":
        navigate({ to: "/progress" });
        break;
      case "Abo verwalten":
        setShowUpgrade(true);
        break;
      case "Benachrichtigungen":
        toast.info("Benachrichtigungseinstellungen kommen bald.");
        break;
      case "Hilfe & Support":
        window.open("mailto:support@mindpitch.app", "_blank");
        break;
      case "Abmelden":
        await supabase.auth.signOut();
        navigate({ to: "/login" });
        break;
    }
  };

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
        {/* Profile header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar name="Max Müller" level={7} xpProgress={65} size="lg" />
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">Max Müller</h1>
              <p className="text-xs text-muted-foreground">Stürmer • FC Bayern U19</p>
              <div className="flex items-center gap-2 mt-1.5">
                <TierBadge tier="pro" />
                <StreakBadge count={12} />
              </div>
            </div>
          </div>
          <button className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground">
            <Settings size={20} />
          </button>
        </div>

        {/* XP Progress */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm">Level 7</h2>
            <span className="text-xs text-muted-foreground">2.450 / 3.000 XP</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-neon transition-all duration-500"
              style={{ width: "65%" }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Noch 550 XP bis Level 8</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Übungen", value: "84", icon: BookOpen },
            { label: "Streak-Best", value: "21", icon: Zap },
            { label: "Abzeichen", value: "12", icon: Award },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-card border border-border p-3 text-center">
              <stat.icon size={16} className="text-primary mx-auto mb-1" />
              <p className="font-display font-bold text-lg text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu items */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {[
            "Erfolge & Abzeichen",
            "Abo verwalten",
            "Benachrichtigungen",
            "Hilfe & Support",
            "Abmelden",
          ].map((item, i, arr) => (
            <button
              key={item}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-sm text-card-foreground hover:bg-muted/30 transition-colors ${
                i < arr.length - 1 ? "border-b border-border" : ""
              } ${item === "Abmelden" ? "text-destructive" : ""}`}
            >
              <span>{item}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      </div>
    </AppShell>
  );
}
