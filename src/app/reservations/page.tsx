import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CalendarDays, Clock, MapPin, Search } from "lucide-react";
import {
  getMyReservations,
} from "@/app/actions/reservations";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { CancelReservationButton } from "./reservation-actions";
import type { Reservation } from "@/types/reservation";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function canCancel(reservation: Reservation) {
  return (
    reservation.status !== "cancelled" &&
    new Date(reservation.start_time) > new Date()
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const resource = reservation.resources;

  return (
    <article className="premium-panel overflow-hidden rounded-2xl">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div
          className="min-h-44 bg-slate-100 bg-cover bg-center"
          style={{
            backgroundImage: resource?.image_url
              ? `url(${resource.image_url})`
              : "linear-gradient(135deg, #f8fafc, #dbeafe)",
          }}
        />
        <div className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                {resource?.type ?? "Resource"}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {resource?.name ?? "Reserved resource"}
              </h2>
            </div>
            <StatusBadge status={reservation.status} />
          </div>
          <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex gap-2">
              <Clock className="mt-0.5 size-4 text-slate-400" />
              <span>
                {formatDateTime(reservation.start_time)} -{" "}
                {formatDateTime(reservation.end_time)}
              </span>
            </div>
            <div className="flex gap-2">
              <MapPin className="mt-0.5 size-4 text-slate-400" />
              <span>{resource?.description || "PrimeWave resource"}</span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
            <Link
              href={`/reservations/${reservation.id}`}
              className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700"
            >
              Details
            </Link>
            <CancelReservationButton
              id={reservation.id}
              disabled={!canCancel(reservation)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ReservationRow({ reservation }: { reservation: Reservation }) {
  const resource = reservation.resources;

  return (
    <div className="grid grid-cols-[40px_1.1fr_1fr_1fr_0.8fr_1fr] items-center gap-4 px-5 py-4 text-sm">
      <input type="checkbox" className="size-4 rounded border-slate-300" />
      <div className="flex items-center gap-3">
        <div
          className="size-12 rounded-lg bg-slate-100 bg-cover bg-center"
          style={{
            backgroundImage: resource?.image_url
              ? `url(${resource.image_url})`
              : "linear-gradient(135deg, #f8fafc, #dbeafe)",
          }}
        />
        <div>
          <p className="font-bold text-slate-950">
            {resource?.name ?? "Reserved resource"}
          </p>
          <p className="text-xs text-slate-500">{resource?.type ?? "Resource"}</p>
        </div>
      </div>
      <div className="text-slate-700">
        <p>{formatDateTime(reservation.start_time)}</p>
        <p className="text-xs text-slate-500">
          to {formatDateTime(reservation.end_time)}
        </p>
      </div>
      <p className="text-slate-600">
        {resource?.description?.split(",")[0] || "Main Building"}
      </p>
      <StatusBadge status={reservation.status} />
      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/reservations/${reservation.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 px-4 text-sm font-semibold text-blue-600 hover:bg-blue-50"
        >
          View
        </Link>
        <CancelReservationButton
          id={reservation.id}
          disabled={!canCancel(reservation)}
        />
      </div>
    </div>
  );
}

async function ReservationsContent() {
  await connection();
  const result = await getMyReservations();

  const reservations = result.success ? result.data : [];
  const now = new Date();
  const upcoming = reservations.filter(
    (reservation) =>
      new Date(reservation.end_time) >= now && reservation.status !== "cancelled"
  );
  const past = reservations.filter(
    (reservation) =>
      new Date(reservation.end_time) < now || reservation.status === "cancelled"
  );
  const cancelled = reservations.filter(
    (reservation) => reservation.status === "cancelled"
  );

  return (
    <AppShell title="My Reservations">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              My Reservations
            </h1>
            <p className="mt-1 text-base text-slate-600">
              View, manage and cancel your reservations.
            </p>
          </div>
          <Link
            href="/reservations/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700"
          >
            Book Resource
          </Link>
        </header>

        {!result.success ? (
          <section className="mt-8 rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Reservations could not be loaded
            </h2>
            <p className="mt-2 text-sm text-slate-600">{result.error}</p>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    Upcoming ({upcoming.length})
                  </button>
                  <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    Past ({past.length})
                  </button>
                  <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    Cancelled ({cancelled.length})
                  </button>
                </div>
                <label className="relative block w-full lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="Search reservations..."
                  />
                </label>
              </div>
            </section>

            {reservations.length === 0 ? (
              <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <CalendarDays className="size-10 text-blue-500" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No reservations yet
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use the calendar above to find a free day and book your first
                  resource.
                </p>
              </section>
            ) : null}
            <section className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="grid grid-cols-[40px_1.1fr_1fr_1fr_0.8fr_1fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                <span />
                <span>Resource</span>
                <span>Date & Time</span>
                <span>Location</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-slate-100">
                {upcoming.length ? (
                  upcoming.map((reservation) => (
                    <ReservationRow key={reservation.id} reservation={reservation} />
                  ))
                ) : (
                  <p className="p-5 text-sm text-slate-600">
                    No upcoming reservations.
                  </p>
                )}
              </div>
            </section>

            <section className="lg:hidden">
              <h2 className="text-xl font-semibold text-slate-950">All Reservations</h2>
              <div className="mt-4 space-y-4">
                {reservations.length ? (
                  reservations.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))
                ) : (
                  null
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ReservationsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-600">
            Loading reservations...
          </p>
        </main>
      }
    >
      <ReservationsContent />
    </Suspense>
  );
}
