import { CheckSquare, Layers, CalendarDays } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";

type BlockProgress = Database["public"]["Tables"]["block_progress"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

interface StatsRowProps {
  tasksThisWeek: number;
  activeBlock: BlockProgress | null;
  nextBooking: Booking | null;
}

export function StatsRow({ tasksThisWeek, activeBlock, nextBooking }: StatsRowProps) {
  const bookingDate = nextBooking
    ? new Date(nextBooking.session_date).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-2xl bg-card border border-border p-4 text-center shadow-xs">
        <CheckSquare size={16} strokeWidth={1.5} className="text-primary mx-auto mb-2" />
        <p className="font-display text-xl text-foreground">
          {tasksThisWeek}<span className="text-muted-foreground font-body text-[12px] font-light">/7</span>
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 font-light">Diese Woche</p>
      </div>

      <div className="rounded-2xl bg-card border border-border p-4 text-center shadow-xs">
        <Layers size={16} strokeWidth={1.5} className="text-gold mx-auto mb-2" />
        {activeBlock ? (
          <>
            <p className="font-display text-xl text-foreground">
              {activeBlock.current_step}<span className="text-muted-foreground font-body text-[12px] font-light">/5</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 font-light">Block-Programm</p>
          </>
        ) : (
          <>
            <p className="font-body text-[12px] text-muted-foreground mt-2 font-light">Kein aktives</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-light">Block-Programm</p>
          </>
        )}
      </div>

      <Link
        to="/coaching"
        className="rounded-2xl bg-card border border-border p-4 text-center shadow-xs card-hover"
      >
        <CalendarDays size={16} strokeWidth={1.5} className="text-primary mx-auto mb-2" />
        {bookingDate ? (
          <>
            <p className="font-display text-lg text-foreground">{bookingDate}</p>
            <p className="text-[11px] text-muted-foreground mt-1 font-light">Nächstes Coaching</p>
          </>
        ) : (
          <>
            <p className="font-body text-[12px] text-primary mt-2 font-medium">Jetzt buchen</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-light">Coaching</p>
          </>
        )}
      </Link>
    </div>
  );
}
