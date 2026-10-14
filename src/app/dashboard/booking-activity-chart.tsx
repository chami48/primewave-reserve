"use client";

import { useState } from "react";
import type { bookingActivity } from "@/lib/dashboard";

type Point = ReturnType<typeof bookingActivity>[number];

function hourLabel(hour: number) {
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
}

export function BookingActivityChart({ points }: { points: Point[] }) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((point) => point.pending + point.confirmed));
  const selected = points.find((point) => point.hour === selectedHour);
  const empty = points.every((point) => point.pending + point.confirmed === 0);

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>{selected ? `${hourLabel(selected.hour)}: ${selected.confirmed} confirmed · ${selected.pending} pending` : "Select an hour to see booking counts"}</span>
        <span aria-hidden="true">Scale: 0–{max} bookings</span>
      </div>
      <div className="mt-3 flex h-40 items-stretch gap-1 border-b border-slate-200" aria-label="Your hourly reservation activity today">
        {points.map((point) => (
          <button
            key={point.hour}
            type="button"
            aria-label={`${hourLabel(point.hour)}: ${point.confirmed} confirmed, ${point.pending} pending bookings`}
            aria-pressed={selectedHour === point.hour}
            onClick={() => setSelectedHour(point.hour)}
            onFocus={() => setSelectedHour(point.hour)}
            onMouseEnter={() => setSelectedHour(point.hour)}
            title={`${hourLabel(point.hour)}: ${point.confirmed} confirmed, ${point.pending} pending`}
            className="relative flex min-w-0 flex-1 flex-col justify-end rounded-t outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="block w-full rounded-t bg-blue-200" style={{ height: `${point.pending / max * 100}%` }} />
            <span className="block w-full bg-blue-600" style={{ height: `${point.confirmed / max * 100}%` }} />
            {point.pending + point.confirmed === 0 ? <span className="h-px w-full bg-slate-200" /> : null}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-6 text-[10px] text-slate-500">{[0, 4, 8, 12, 16, 20].map((hour) => <span key={hour}>{hourLabel(hour)}</span>)}</div>
      <p className="mt-4 text-xs leading-5 text-slate-500" aria-live="polite">
        {empty ? "No active bookings today." : "Each bar counts your reservations overlapping that hour. Bookings spanning several hours appear in each hour."}
      </p>
    </div>
  );
}
