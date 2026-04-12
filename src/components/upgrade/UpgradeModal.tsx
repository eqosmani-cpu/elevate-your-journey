import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GreenButton } from "@/components/ui/GreenButton";
import { Shield, Zap, Crown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlightTier?: "pro" | "elite";
}

const tiers = [
  {
    id: "free" as const,
    name: "Rookie",
    icon: Shield,
    monthlyPrice: 0,
    yearlyPrice: 0,
    colorClass: "text-tier-free",
    bgClass: "bg-tier-free/10",
    borderClass: "border-tier-free/20",
    features: [
      { label: "3 Aufgaben / Woche", included: true },
      { label: "Forum: Lesen + 1 Post/Woche", included: true },
      { label: "1 KI-Aufgabe / Woche", included: true },
      { label: "Block Breaker", included: false },
      { label: "Coaching-Buchung", included: false },
      { label: "Unbegrenzte KI-Aufgaben", included: false },
      { label: "Fortschrittsanalyse", included: false },
      { label: "Priorisierte Coach-Buchung", included: false },
      { label: "Wöchentlicher Check-in", included: false },
      { label: "Elite-Aufgaben", included: false },
    ],
  },
  {
    id: "pro" as const,
    name: "Performer",
    icon: Zap,
    monthlyPrice: 9.99,
    yearlyPrice: 95.90,
    colorClass: "text-tier-pro",
    bgClass: "bg-tier-pro/10",
    borderClass: "border-tier-pro/40",
    features: [
      { label: "Unbegrenzte Aufgaben", included: true },
      { label: "Forum: Unbegrenzt", included: true },
      { label: "Unbegrenzte KI-Aufgaben", included: true },
      { label: "Block Breaker Vollzugang", included: true },
      { label: "1 Coaching-Session/Monat", included: true },
      { label: "KI-Forum-Antworten", included: true },
      { label: "Fortschrittsanalyse", included: true },
      { label: "Priorisierte Coach-Buchung", included: false },
      { label: "Wöchentlicher Check-in", included: false },
      { label: "Elite-Aufgaben", included: false },
    ],
  },
  {
    id: "elite" as const,
    name: "Champion",
    icon: Crown,
    monthlyPrice: 24.99,
    yearlyPrice: 239.90,
    colorClass: "text-tier-elite",
    bgClass: "bg-tier-elite/10",
    borderClass: "border-tier-elite/40",
    features: [
      { label: "Alles aus Pro", included: true },
      { label: "Priorisierte Coach-Buchung", included: true },
      { label: "Persönlicher Coach-Match", included: true },
      { label: "Wöchentlicher Check-in (30 Min)", included: true },
      { label: "Exklusive Elite-Aufgaben", included: true },
      { label: "Forum: Elite Spieler Badge", included: true },
      { label: "48h Coaching-Garantie", included: true },
      { label: "", included: false, hidden: true },
      { label: "", included: false, hidden: true },
      { label: "", included: false, hidden: true },
    ],
  },
];

export function UpgradeModal({ open, onOpenChange, highlightTier = "pro" }: UpgradeModalProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const handleUpgrade = (tierId: "pro" | "elite") => {
    toast.info("Stripe Checkout wird implementiert – Demo-Modus aktiv.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        <DialogHeader className="p-6 pb-2 text-center">
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            Schalte dein volles Potenzial frei
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs mt-1">
            Wähle den Plan, der zu deinen Zielen passt.
          </DialogDescription>
        </DialogHeader>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-2 px-6 pb-4">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              billing === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            Monatlich
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              billing === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            Jährlich
            <span className="ml-1 text-[10px] opacity-80">–20%</span>
          </button>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 pb-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isHighlighted = tier.id === highlightTier;
            const price = billing === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
            const perMonth = billing === "yearly" && tier.monthlyPrice > 0
              ? (tier.yearlyPrice / 12).toFixed(2)
              : null;

            return (
              <div
                key={tier.id}
                className={cn(
                  "rounded-2xl border p-4 flex flex-col relative transition-all",
                  isHighlighted
                    ? `${tier.borderClass} ${tier.bgClass} ring-1 ring-primary/30`
                    : "border-border bg-secondary/30"
                )}
              >
                {isHighlighted && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground px-3 py-0.5 text-[10px] font-bold">
                    Empfohlen
                  </span>
                )}

                <div className="flex items-center gap-2 mb-2 mt-1">
                  <Icon size={16} className={tier.colorClass} />
                  <span className={cn("font-display font-bold text-sm", tier.colorClass)}>
                    {tier.name}
                  </span>
                </div>

                <div className="mb-3">
                  {tier.monthlyPrice === 0 ? (
                    <span className="text-lg font-bold text-foreground">Kostenlos</span>
                  ) : (
                    <>
                      <span className="text-lg font-bold text-foreground">
                        €{billing === "monthly" ? tier.monthlyPrice.toFixed(2) : perMonth}
                      </span>
                      <span className="text-[11px] text-muted-foreground">/Monat</span>
                      {billing === "yearly" && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          €{tier.yearlyPrice.toFixed(2)} / Jahr
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-1.5 flex-1 mb-4">
                  {tier.features
                    .filter((f) => !("hidden" in f && f.hidden))
                    .map((f) => (
                      <li key={f.label} className="flex items-start gap-1.5 text-[11px]">
                        {f.included ? (
                          <Check size={12} className="text-primary shrink-0 mt-0.5" />
                        ) : (
                          <X size={12} className="text-muted-foreground/40 shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                </ul>

                {tier.id === "free" ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-secondary py-2 text-xs text-muted-foreground font-medium"
                  >
                    Aktueller Plan
                  </button>
                ) : (
                  <GreenButton
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpgrade(tier.id)}
                  >
                    {tier.id === "elite" ? "Champion werden" : "Jetzt starten"} →
                  </GreenButton>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-muted-foreground pb-4 px-6">
          30-Tage Geld-zurück-Garantie · Jederzeit kündbar
        </p>
      </DialogContent>
    </Dialog>
  );
}
