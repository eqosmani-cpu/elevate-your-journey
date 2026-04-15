import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { StripeEmbeddedCheckout } from "@/components/payments/StripeEmbeddedCheckout";
import { useActiveSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
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
    "30% Rabatt auf Coaching-Sessions",
  ],
  elite: [
    "Alles aus Pro inklusive",
    "Priorisierte Coach-Buchung",
    "Persönlicher Coach-Match",
    "Wöchentlicher Check-in (30 Min)",
    "Exklusive Elite-Aufgaben",
    "30% Rabatt auf Coaching-Sessions",
  ],
};

const priceIds: Record<string, { monthly: string; yearly: string }> = {
  pro: { monthly: "pro_monthly", yearly: "pro_yearly" },
  elite: { monthly: "elite_monthly", yearly: "elite_yearly" },
};

export function UpgradeModal({ open, onOpenChange, highlightTier = "pro" }: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<TierKey>(highlightTier);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<{ priceId: string; email?: string; userId?: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const { isActive, tier: currentSubTier, isCanceled, periodEnd } = useActiveSubscription();

  const features = featuresByTier[selectedTier];

  const handleUpgrade = async () => {
    if (selectedTier === "free") {
      onOpenChange(false);
      return;
    }

    // Prevent duplicate subscription for the same tier
    if (isActive && currentSubTier === selectedTier) {
      toast.info("Du hast dieses Abo bereits.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Bitte melde dich zuerst an.");
      return;
    }

    const priceId = priceIds[selectedTier][billing];
    setCheckoutInfo({
      priceId,
      email: user.email || undefined,
      userId: user.id,
    });
    setShowCheckout(true);
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          returnUrl: window.location.origin + "/profile",
          environment: getStripeEnvironment(),
        },
      });
      if (error || !data?.url) throw new Error("Portal konnte nicht geöffnet werden");
      window.open(data.url, "_blank");
    } catch {
      toast.error("Abo-Verwaltung konnte nicht geöffnet werden.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleClose = () => {
    setShowCheckout(false);
    setCheckoutInfo(null);
    onOpenChange(false);
  };

  if (showCheckout && checkoutInfo) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg bg-white border-[#E8E8E8] p-0 rounded-3xl overflow-hidden [&>button]:hidden max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4">
            <h2 className="font-serif text-[22px] text-[#1A1A1A] mb-4">Checkout</h2>
            <StripeEmbeddedCheckout
              priceId={checkoutInfo.priceId}
              customerEmail={checkoutInfo.email}
              userId={checkoutInfo.userId}
              returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
            <button
              onClick={handleClose}
              className="w-full text-center text-[13px] text-[#A8A8A8] hover:text-[#6B6B6B] transition-colors mt-4"
            >
              Abbrechen
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white border-[#E8E8E8] p-0 rounded-3xl overflow-hidden [&>button]:hidden">
        <div className="px-6 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8">
          <h2 className="font-serif text-[26px] sm:text-[28px] text-[#1A1A1A] leading-tight mb-1">
            {isActive ? "Dein Abo" : "Upgrade auf Pro oder Elite"}
          </h2>
          <p className="text-[14px] font-light text-[#A8A8A8] mb-5">
            {isActive
              ? isCanceled
                ? `Aktiv bis ${periodEnd ? new Date(periodEnd).toLocaleDateString("de-DE") : "—"}`
                : `${currentSubTier === "elite" ? "Elite" : "Pro"}-Abo aktiv`
              : "Schalte alle Features frei und starte durch"}
          </p>

          {/* Active subscription management */}
          {isActive && (
            <div className="mb-5">
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full rounded-2xl bg-[#1A1A1A] text-white py-4 text-[15px] font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
              >
                {portalLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Abo verwalten
              </button>
              <p className="text-[11px] text-[#A8A8A8] text-center mt-2">
                Zahlungsmethode ändern, kündigen oder Rechnungen ansehen
              </p>
            </div>
          )}

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

          {/* Billing toggle for paid tiers */}
          {selectedTier !== "free" && (
            <div className="flex items-center justify-center mb-5">
              <div className="inline-flex rounded-full border border-[#E8E8E8] p-0.5">
                <button
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "rounded-full px-5 py-2 text-[13px] font-medium transition-colors",
                    billing === "monthly" ? "bg-[#1A1A1A] text-white" : "text-[#A8A8A8]"
                  )}
                >
                  Monatlich
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={cn(
                    "rounded-full px-5 py-2 text-[13px] font-medium transition-colors",
                    billing === "yearly" ? "bg-[#1A1A1A] text-white" : "text-[#A8A8A8]"
                  )}
                >
                  Jährlich –30%
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          {(!isActive || currentSubTier !== selectedTier) && selectedTier !== "free" && (
            <button
              onClick={handleUpgrade}
              className="w-full rounded-2xl bg-[#3A5C4A] text-white py-4 text-[15px] font-medium hover:bg-[#2E4A3C] transition-colors mb-3 flex items-center justify-center gap-2"
            >
              {isActive && currentSubTier !== selectedTier
                ? `Auf ${tiers.find(t => t.key === selectedTier)?.label} wechseln`
                : `${tiers.find(t => t.key === selectedTier)?.label} aktivieren`}
            </button>
          )}

          {selectedTier === "free" && !isActive && (
            <button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-2xl bg-[#3A5C4A] text-white py-4 text-[15px] font-medium hover:bg-[#2E4A3C] transition-colors mb-3"
            >
              Weiter mit Free →
            </button>
          )}

          <button
            onClick={handleClose}
            className="w-full text-center text-[13px] text-[#A8A8A8] hover:text-[#6B6B6B] transition-colors"
          >
            {isActive ? "Schließen" : "Vielleicht später"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
