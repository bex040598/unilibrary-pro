"use client";

import { Seat } from "@/types";
import { Button, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function SeatMap({
  seats,
  selectedSeatId,
  onSelect
}: {
  seats: Seat[];
  selectedSeatId?: string;
  onSelect: (seatId: string) => void;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Seat map</p>
          <p className="text-xs text-slate-500">Available, booked, occupied va disabled holatlari ko‘rsatilgan.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">available</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">booked</span>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">occupied</span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600">disabled</span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
        {seats.map((seat) => (
          <Button
            key={seat.id}
            variant="secondary"
            className={cn(
              "h-12 rounded-2xl px-0",
              seat.status === "available" && "border border-emerald-200 bg-emerald-50 text-emerald-700",
              seat.status === "booked" && "border border-amber-200 bg-amber-50 text-amber-700",
              seat.status === "occupied" && "border border-cyan-200 bg-cyan-50 text-cyan-700",
              seat.status === "disabled" && "border border-slate-200 bg-slate-100 text-slate-400",
              selectedSeatId === seat.id && "ring-2 ring-ink"
            )}
            onClick={() => onSelect(seat.id)}
            disabled={seat.status === "disabled"}
          >
            {seat.seatNumber}
          </Button>
        ))}
      </div>
    </Card>
  );
}
