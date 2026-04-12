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
      {/* Tasks this week */}
      <div className="rounded-2xl bg-card border border-border p-3 text-center">
        <CheckSquare size={16} className="text-primary mx-auto mb-1.5" />
        <p className="font-display font-bold text-lg text-foreground">
          {tasksThisWeek}<span className="text-muted-foreground font-normal text-xs">/7</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Diese Woche</p>
      </div>

      {/* Block progress */}
      <div className="rounded-2xl bg-card border border-border p-3 text-center">
        <Layers size={16} className="text-chart-4 mx-auto mb-1.5" />
        {activeBlock ? (
          <>
            <p className="font-display font-bold text-lg text-foreground">
              {activeBlock.current_step}<span className="text-muted-foreground font-normal text-xs">/5</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Block-Programm</p>
          </>
        ) : (
          <>
            <p className="font-display font-bold text-xs text-muted-foreground mt-1">Kein aktives</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Block-Programm</p>
          </>
        )}
      </div>

      {/* Next coaching */}
      <Link
        to="/coaching"
        className="rounded-2xl bg-card border border-border p-3 text-center hover:border-primary/30 transition-colors"
      >
        <CalendarDays size={16} className="text-chart-5 mx-auto mb-1.5" />
        {bookingDate ? (
          <>
            <p className="font-display font-bold text-sm text-foreground">{bookingDate}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Nächstes Coaching</p>
          </>
        ) : (
          <>
            <p className="font-display font-bold text-xs text-primary mt-1">Jetzt buchen</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Coaching</p>
          </>
        )}
      </Link>
    </div>
  );
}
