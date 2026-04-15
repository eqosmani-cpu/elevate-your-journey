import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  component: CheckoutReturnPage,
});

function CheckoutReturnPage() {
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
