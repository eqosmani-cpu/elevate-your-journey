import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GreenButton } from "@/components/ui/GreenButton";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Anmelden — MindPitch" },
      { name: "description", content: "Melde dich bei MindPitch an." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccessMessage("Bestätigungsmail gesendet! Prüfe dein Postfach.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(signInError.message);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("onboarding_completed")
              .eq("id", user.id)
              .single();

            if (profile && !profile.onboarding_completed) {
              navigate({ to: "/onboarding" });
            } else {
              navigate({ to: "/" });
            }
          }
        }
      }
    } catch {
      setError("Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="font-display text-3xl text-foreground">MindPitch</h1>
        <p className="text-[13px] text-muted-foreground font-light text-center mt-1">Mental Coaching für Fußballer</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-7 shadow-card">
        <h2 className="text-xl font-display text-foreground text-center mb-1">
          {isSignUp ? "Konto erstellen" : "Willkommen zurück"}
        </h2>
        <p className="text-[13px] text-muted-foreground text-center mb-7 font-light">
          {isSignUp ? "Starte deine mentale Reise." : "Melde dich an um fortzufahren."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block font-light tracking-label uppercase">E-Mail</label>
            <div className="relative">
              <Mail size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                className="w-full h-12 rounded-2xl bg-background border border-border pl-11 pr-4 text-[14px] text-foreground placeholder:text-tertiary focus:outline-none focus:border-primary focus:border-[1.5px] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block font-light tracking-label uppercase">Passwort</label>
            <div className="relative">
              <Lock size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full h-12 rounded-2xl bg-background border border-border pl-11 pr-4 text-[14px] text-foreground placeholder:text-tertiary focus:outline-none focus:border-primary focus:border-[1.5px] transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-destructive bg-destructive/5 rounded-xl px-4 py-2.5 font-light">{error}</p>
          )}
          {successMessage && (
            <p className="text-[12px] text-primary bg-accent-light rounded-xl px-4 py-2.5 font-light">{successMessage}</p>
          )}

          <GreenButton size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Laden...
              </>
            ) : isSignUp ? (
              "Registrieren"
            ) : (
              "Anmelden"
            )}
          </GreenButton>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccessMessage("");
            }}
            className="text-[12px] text-muted-foreground hover:text-primary transition-colors font-light"
          >
            {isSignUp
              ? "Bereits ein Konto? Anmelden"
              : "Noch kein Konto? Registrieren"}
          </button>
        </div>
      </div>
    </div>
  );
}
