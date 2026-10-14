"use client";

import { CheckCircle2, FileText, MoreHorizontal, XCircle } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { updateReservationStatusForAdmin } from "@/app/actions/reservations";
import type { Reservation, ReservationStatus } from "@/types/reservation";

type Props = {
  reservations: Reservation[];
  generatedAt: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminReservationsPanel({ reservations, generatedAt }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ReservationStatus>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const resource = reservation.resources;
      const matchesQuery =
        !normalized ||
        reservation.id.toLowerCase().includes(normalized) ||
        reservation.user_id.toLowerCase().includes(normalized) ||
        (resource?.name ?? "").toLowerCase().includes(normalized) ||
        (resource?.type ?? "").toLowerCase().includes(normalized);
      const matchesStatus = status === "all" || reservation.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, reservations, status]);

  function updateStatus(id: string, nextStatus: ReservationStatus) {
    setMessage(null);
    setError(null);
    setPendingId(id);

    startTransition(async () => {
      const result = await updateReservationStatusForAdmin(id, nextStatus);
      if (result.success) {
        setMessage(result.message ?? "Reservation updated.");
        setOpenMenuId(null);
      } else {
        setError(result.error);
      }
      setPendingId(null);
    });
  }

  async function downloadReport() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const generatedLabel = formatDateTime(generatedAt);

    doc.setFontSize(18);
    doc.text("PrimeWave Reserve Reservation Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedLabel}`, 14, 26);
    doc.text(`Rows: ${filtered.length}`, 14, 32);

    let y = 44;
    filtered.forEach((reservation, index) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }

      const resource = reservation.resources;
      doc.setFontSize(11);
      doc.text(`${index + 1}. ${resource?.name ?? "Reserved resource"}`, 14, y);
      doc.setFontSize(9);
      doc.text(`Type: ${resource?.type ?? "Resource"}`, 18, y + 6);
      doc.text(`Status: ${reservation.status}`, 18, y + 12);
      doc.text(`Start: ${formatDateTime(reservation.start_time)}`, 18, y + 18);
      doc.text(`End: ${formatDateTime(reservation.end_time)}`, 18, y + 24);
      doc.text(`User ID: ${reservation.user_id}`, 18, y + 30);
      y += 40;
    });

    doc.save(`primewave-reservations-${generatedAt.slice(0, 10)}.pdf`);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search resource, type, reservation id, user id"
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | ReservationStatus)
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            <FileText className="size-4" />
            Download PDF
          </button>
        </div>
        {message ? (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden border-b border-slate-200 p-5 print:block">
          <h2 className="text-xl font-bold text-slate-950">
            PrimeWave Reserve Reservation Report
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Generated {formatDateTime(generatedAt)}
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            No reservations found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((reservation) => (
              <article
                key={reservation.id}
                className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">
                      {reservation.resources?.name ?? "Reserved resource"}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {reservation.resources?.type ?? "Resource"}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {reservation.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDateTime(reservation.start_time)} -{" "}
                    {formatDateTime(reservation.end_time)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    User ID: {reservation.user_id}
                  </p>
                </div>
                <div className="relative flex items-start justify-end print:hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === reservation.id ? null : reservation.id
                      )
                    }
                    disabled={isPending && pendingId === reservation.id}
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                    aria-label={`Reservation actions for ${reservation.id}`}
                  >
                    <MoreHorizontal className="size-5" />
                  </button>

                  {openMenuId === reservation.id ? (
                    <div className="absolute right-0 top-12 z-10 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                      <button
                        type="button"
                        onClick={() => updateStatus(reservation.id, "confirmed")}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="size-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(reservation.id, "pending")}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <MoreHorizontal className="size-4" />
                        Mark pending
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(reservation.id, "cancelled")}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="size-4" />
                        Cancel
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
