import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

interface UpcomingCoachingProps {
  booking: Booking | null;
}

export function UpcomingCoaching({ booking }: UpcomingCoachingProps) {
  if (!booking) {
    return (
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground font-light">Noch keine Session gebucht</p>
        <Link
          to="/coaching"
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-4 py-2 text-[13px] text-foreground hover:bg-muted/30 transition-colors"
        >
          Coach finden
        </Link>
      </div>
    );
  }

  const dateStr = new Date(booking.session_date).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <span className="text-xs text-muted-foreground">🧠</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">Session mit Coach</p>
        <p className="text-xs text-tertiary">{dateStr}</p>
      </div>
      {booking.meeting_link && (
        <a
          href={booking.meeting_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[13px] text-primary hover:opacity-70 transition-opacity"
        >
          Meeting öffnen
          <ArrowRight size={12} strokeWidth={1.5} />
        </a>
      )}
    </div>
  );
}
