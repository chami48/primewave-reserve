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
      <section className="premium-panel rounded-2xl p-4 print:hidden">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search resource, type, reservation id, user id"
            className="premium-field h-11 rounded-xl px-3 text-sm"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | ReservationStatus)
            }
            className="premium-field h-11 rounded-xl px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700"
          >
            <FileText className="size-4" />
            Download PDF
          </button>
        </div>
        {message ? (
          <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </section>

      <section className="premium-panel overflow-hidden rounded-2xl">
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Resource</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Starts</th>
                  <th className="px-5 py-3">Ends</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3 print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((reservation) => (
                  <tr key={reservation.id} className="align-middle hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-semibold text-slate-950">{reservation.resources?.name ?? "Reserved resource"}</td>
                    <td className="px-5 py-4 text-slate-600">{reservation.resources?.type ?? "Resource"}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{formatDateTime(reservation.start_time)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{formatDateTime(reservation.end_time)}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">{reservation.status}</span></td>
                    <td className="max-w-[180px] truncate px-5 py-4 text-slate-600">{reservation.users?.full_name?.trim() || "Unknown user"}</td>
                    <td className="relative px-5 py-4 print:hidden">
                      <button type="button" onClick={() => setOpenMenuId((current) => current === reservation.id ? null : reservation.id)} disabled={isPending && pendingId === reservation.id} className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-700" aria-label={`Reservation actions for ${reservation.id}`}><MoreHorizontal className="size-5" /></button>
                      {openMenuId === reservation.id ? (
                        <div className="absolute right-5 top-12 z-10 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                          <button type="button" onClick={() => updateStatus(reservation.id, "confirmed")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50"><CheckCircle2 className="size-4" />Approve</button>
                          <button type="button" onClick={() => updateStatus(reservation.id, "pending")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"><MoreHorizontal className="size-4" />Mark pending</button>
                          <button type="button" onClick={() => updateStatus(reservation.id, "cancelled")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50"><XCircle className="size-4" />Cancel</button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
