import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GreenButton } from "@/components/ui/GreenButton";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Mail, Lock, Loader2 } from "lucide-react";

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
          // Check if onboarding is completed
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
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-neon flex items-center justify-center">
          <Zap size={22} className="text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-foreground">
          MindPitch
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6">
        <h1 className="text-xl font-display font-bold text-foreground text-center mb-1">
          {isSignUp ? "Konto erstellen" : "Anmelden"}
        </h1>
        <p className="text-xs text-muted-foreground text-center mb-6">
          {isSignUp ? "Starte deine mentale Reise." : "Willkommen zurück!"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">E-Mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                className="w-full h-11 rounded-xl bg-input border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Passwort</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full h-11 rounded-xl bg-input border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}
          {successMessage && (
            <p className="text-xs text-primary bg-primary/10 rounded-lg px-3 py-2">{successMessage}</p>
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

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccessMessage("");
            }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
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
