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

const proFeatures = [
  "Alle mentalen Trainingsaufgaben",
  "Block Breaker Vollzugang",
  "Unbegrenzt Community-Beiträge",
  "KI-Coaching-Empfehlungen",
  "1 Coaching-Session inklusive",
];

const eliteFeatures = [
  "Alles aus Pro inklusive",
  "Priorisierte Coach-Buchung",
  "Persönlicher Coach-Match",
  "Wöchentlicher Check-in (30 Min)",
  "Exklusive Elite-Aufgaben",
];

export function UpgradeModal({ open, onOpenChange, highlightTier = "pro" }: UpgradeModalProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const isElite = highlightTier === "elite";
  const features = isElite ? eliteFeatures : proFeatures;
  const tierLabel = isElite ? "Elite" : "Pro";

  const monthlyPrice = isElite ? 24.99 : 9.99;
  const yearlyMonthly = isElite ? 19.99 : 7.99;
  const yearlyTotal = isElite ? 239.88 : 95.88;

  const displayPrice = billing === "monthly" ? monthlyPrice : yearlyMonthly;

  const handleUpgrade = () => {
    toast.info("Stripe Checkout wird implementiert – Demo-Modus aktiv.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-[#E8E8E8] p-0 rounded-3xl overflow-hidden [&>button]:hidden">
        <div className="px-8 pt-10 pb-8">
          {/* Title */}
          <h2 className="font-serif text-[32px] text-[#1A1A1A] text-center leading-tight mb-1">
            MindPitch {tierLabel}
          </h2>
          <p className="text-[16px] font-light text-[#A8A8A8] text-center mb-6">
            Für Spieler, die es ernst meinen.
          </p>

          {/* Divider */}
          <div className="h-px bg-[rgba(0,0,0,0.07)] mb-6" />

          {/* Features */}
          <div className="space-y-3.5 mb-6">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <Check size={16} strokeWidth={2} className="text-[#3A5C4A] shrink-0" />
                <span className="text-[14px] text-[#1A1A1A]">{feature}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-[rgba(0,0,0,0.07)] mb-6" />

          {/* Billing toggle */}
          <div className="flex items-center justify-center mb-5">
            <div className="inline-flex rounded-full border border-[#E8E8E8] p-0.5">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "rounded-full px-5 py-2 text-[13px] font-medium transition-colors",
                  billing === "monthly"
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#A8A8A8]"
                )}
              >
                Monatlich
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={cn(
                  "rounded-full px-5 py-2 text-[13px] font-medium transition-colors",
                  billing === "yearly"
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#A8A8A8]"
                )}
              >
                Jährlich –20%
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <p className="font-serif text-[28px] text-[#1A1A1A]">
              €{displayPrice.toFixed(2)}
              <span className="text-[14px] font-light text-[#A8A8A8]"> / Monat</span>
            </p>
            {billing === "yearly" && (
              <p className="text-[12px] text-[#A8A8A8] mt-0.5">
                jährlich €{yearlyTotal.toFixed(2)}
              </p>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            className="w-full rounded-2xl bg-[#3A5C4A] text-white py-4 text-[15px] font-medium hover:bg-[#2E4A3C] transition-colors mb-3"
          >
            {tierLabel} aktivieren
          </button>

          {/* Fine print */}
          <p className="text-[11px] text-[#A8A8A8] text-center mb-4">
            Jederzeit kündbar · 30 Tage Rückgaberecht
          </p>

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
