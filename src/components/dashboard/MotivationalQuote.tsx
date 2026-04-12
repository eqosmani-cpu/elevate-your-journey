// Daily motivational quotes from football legends and sports psychologists
const quotes = [
  { text: "Talent bringt dich ins Spiel. Mentalität gewinnt es.", author: "Jürgen Klopp" },
  { text: "Ich habe immer an mich geglaubt. Auch wenn sonst niemand es getan hat.", author: "Zlatan Ibrahimović" },
  { text: "Der Geist gibt auf, lange bevor der Körper es tut.", author: "Arnold Schwarzenegger" },
  { text: "Druck ist ein Privileg. Es bedeutet, dass du etwas Wichtiges tust.", author: "Billie Jean King" },
  { text: "Fehler sind die Portale der Entdeckung.", author: "James Joyce" },
  { text: "Erfolg ist kein Zufall. Er ist harte Arbeit, Lernen und Opferbereitschaft.", author: "Pelé" },
  { text: "Du musst nicht perfekt sein. Du musst bereit sein, es zu versuchen.", author: "Dr. Steve Peters" },
  { text: "Der wichtigste Sieg ist der über dich selbst.", author: "Platon" },
  { text: "Wer aufhört zu lernen, hört auf zu wachsen.", author: "Phil Jackson" },
  { text: "Mental stark sein heißt nicht, nie zu zweifeln. Es heißt, trotzdem weiterzumachen.", author: "Michael Jordan" },
  { text: "Das Spiel wird im Kopf entschieden.", author: "Johan Cruyff" },
  { text: "Resilienz ist nicht angeboren — sie wird trainiert.", author: "Dr. Jim Loehr" },
  { text: "Ein Fehler wird erst dann zum Problem, wenn du ihn nicht loslassen kannst.", author: "Per Mertesacker" },
  { text: "Visualisiere deinen Erfolg, bevor du ihn lebst.", author: "Wayne Rooney" },
];

export function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return quotes[dayOfYear % quotes.length];
}

export function MotivationalQuote() {
  const quote = getDailyQuote();

  return (
    <div className="rounded-2xl bg-card border border-border p-5 relative overflow-hidden">
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 gradient-neon rounded-l-2xl" />

      <blockquote className="pl-4">
        <p className="text-sm font-body italic text-foreground leading-relaxed mb-2">
          „{quote.text}"
        </p>
        <footer className="text-xs text-muted-foreground font-display font-medium">
          — {quote.author}
        </footer>
      </blockquote>
    </div>
  );
}
