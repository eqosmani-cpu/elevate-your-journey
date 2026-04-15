import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlightTier?: "pro" | "elite";
}

type TierKey = "free" | "pro" | "elite";

const tiers: { key: TierKey; label: string; price: string }[] = [
  { key: "free", label: "Free", price: "Kostenlos" },
  { key: "pro", label: "Pro", price: "ab €9,99/Monat" },
  { key: "elite", label: "Elite", price: "ab €24,99/Monat" },
];

const featuresByTier: Record<TierKey, string[]> = {
  free: [
    "5 Trainingsaufgaben pro Woche",
    "Community lesen (kein Posten)",
    "Basis-Dashboard mit XP & Streak",
  ],
  pro: [
    "Alle mentalen Trainingsaufgaben",
    "Block Breaker Vollzugang",
    "Unbegrenzt Community-Beiträge",
    "KI-Coaching-Empfehlungen",
    "1 Coaching-Session inklusive",
  ],
  elite: [
    "Alles aus Pro inklusive",
    "Priorisierte Coach-Buchung",
    "Persönlicher Coach-Match",
    "Wöchentlicher Check-in (30 Min)",
    "Exklusive Elite-Aufgaben",
  ],
};

export function UpgradeModal({ open, onOpenChange, highlightTier = "pro" }: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<TierKey>(highlightTier);
  const features = featuresByTier[selectedTier];

  const handleUpgrade = () => {
    if (selectedTier === "free") {
      onOpenChange(false);
      return;
    }
    toast.info("Stripe Checkout wird implementiert – Demo-Modus aktiv.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-[#E8E8E8] p-0 rounded-3xl overflow-hidden [&>button]:hidden">
        <div className="px-6 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8">
          {/* Title */}
          <h2 className="font-serif text-[26px] sm:text-[28px] text-[#1A1A1A] leading-tight mb-1">
            Upgrade auf Pro oder Elite
          </h2>
          <p className="text-[14px] font-light text-[#A8A8A8] mb-5">
            Schalte alle Features frei und starte durch
          </p>

          {/* Tier selector */}
          <div className="flex gap-2 mb-5">
            {tiers.map((tier) => (
              <button
                key={tier.key}
                onClick={() => setSelectedTier(tier.key)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 px-2 text-center transition-all border",
                  selectedTier === tier.key
                    ? "bg-[#3A5C4A] text-white border-[#3A5C4A]"
                    : "bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-[#C8C8C8]"
                )}
              >
                <span className="block text-[14px] font-semibold">{tier.label}</span>
                <span className={cn(
                  "block text-[11px] mt-0.5",
                  selectedTier === tier.key ? "text-white/70" : "text-[#A8A8A8]"
                )}>
                  {tier.price}
                </span>
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="rounded-xl border border-[#E8E8E8] p-4 mb-5">
            <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Enthaltene Features</p>
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#EDF2EE] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={2.5} className="text-[#3A5C4A]" />
                  </div>
                  <span className="text-[14px] text-[#1A1A1A]">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            className="w-full rounded-2xl bg-[#3A5C4A] text-white py-4 text-[15px] font-medium hover:bg-[#2E4A3C] transition-colors mb-3 flex items-center justify-center gap-2"
          >
            {selectedTier === "free" ? "Weiter mit Free →" : `${tiers.find(t => t.key === selectedTier)?.label} aktivieren`}
          </button>

          {/* Ghost dismiss */}
          <button
            onClick={() => onOpenChange(false)}
            className="w-full text-center text-[13px] text-[#A8A8A8] hover:text-[#6B6B6B] transition-colors"
          >
            Vielleicht später
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
