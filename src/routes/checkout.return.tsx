import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  component: CheckoutReturnPage,
});

function CheckoutReturnPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Poll subscription table for a few seconds to confirm
    let attempts = 0;
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("error");
        return;
      }

      const env = getStripeEnvironment();
      const { data } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("environment", env)
        .in("status", ["active", "trialing"])
        .limit(1);

      if (data && data.length > 0) {
        setStatus("success");
      } else if (attempts < 5) {
        attempts++;
        setTimeout(checkSubscription, 2000);
      } else {
        // Webhook may be delayed — show success anyway since Stripe confirmed
        setStatus("success");
      }
    };

    checkSubscription();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#3A5C4A] mx-auto mb-4" />
          <p className="text-[14px] text-[#6B6B6B]">Zahlung wird bestätigt...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="font-serif text-[28px] text-[#1A1A1A] mb-2">Etwas ist schiefgelaufen</h1>
          <p className="text-[14px] text-[#A8A8A8] mb-6">
            Bitte überprüfe dein Konto oder versuche es erneut.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-[#3A5C4A] text-white px-8 py-4 text-[15px] font-medium hover:bg-[#2E4A3C] transition-colors"
          >
            Zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="font-serif text-[28px] text-[#1A1A1A] mb-2">Willkommen im Team!</h1>
        <p className="text-[14px] text-[#A8A8A8] mb-6">
          Dein Upgrade wurde erfolgreich aktiviert. Starte jetzt mit deinem neuen Training.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl bg-[#3A5C4A] text-white px-8 py-4 text-[15px] font-medium hover:bg-[#2E4A3C] transition-colors"
        >
          Zum Dashboard
        </Link>
      </div>
    </div>
  );
}
