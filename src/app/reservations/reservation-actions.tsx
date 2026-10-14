"use client";

import { Ban, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { cancelReservation } from "@/app/actions/reservations";

export function CancelReservationButton({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function cancel() {
    if (!window.confirm("Cancel this reservation?")) {
      return;
    }

    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await cancelReservation(id);
      if (result.success) {
        setMessage(result.message ?? "Reservation cancelled.");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={cancel}
        disabled={disabled || isPending}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
        Cancel
      </button>
      {message ? <p className="text-xs text-blue-700">{message}</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
