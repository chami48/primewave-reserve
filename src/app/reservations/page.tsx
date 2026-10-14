import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import {
  getBookableResources,
  getMyReservations,
} from "@/app/actions/reservations";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { AvailabilityCalendar } from "./availability-calendar";
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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div
          className="min-h-44 bg-slate-100 bg-cover bg-center"
          style={{
            backgroundImage: resource?.image_url
              ? `url(${resource.image_url})`
              : "linear-gradient(135deg, #f8fafc, #d1fae5)",
          }}
        />
        <div className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
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
              className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:text-emerald-700"
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

async function ReservationsContent() {
  await connection();
  const [result, resourcesResult] = await Promise.all([
    getMyReservations(),
    getBookableResources(),
  ]);

  const reservations = result.success ? result.data : [];
  const resources = resourcesResult.success ? resourcesResult.data : [];
  const now = new Date();
  const upcoming = reservations.filter(
    (reservation) =>
      new Date(reservation.end_time) >= now && reservation.status !== "cancelled"
  );
  const past = reservations.filter(
    (reservation) =>
      new Date(reservation.end_time) < now || reservation.status === "cancelled"
  );

  return (
    <AppShell title="My Reservations">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-end">
          <Link
            href="/reservations/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
          >
            Book Resource
          </Link>
        </div>

        {!result.success ? (
          <section className="mt-8 rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Reservations could not be loaded
            </h2>
            <p className="mt-2 text-sm text-slate-600">{result.error}</p>
          </section>
        ) : (
          <div className="mt-8 space-y-8">
            <AvailabilityCalendar resources={resources} />
            {reservations.length === 0 ? (
              <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <CalendarDays className="size-10 text-emerald-500" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No reservations yet
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use the calendar above to find a free day and book your first
                  resource.
                </p>
              </section>
            ) : null}
            <section>
              <h2 className="text-xl font-semibold text-slate-950">Upcoming</h2>
              <div className="mt-4 space-y-4">
                {upcoming.length ? (
                  upcoming.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))
                ) : (
                  <p className="rounded-2xl bg-white p-5 text-sm text-slate-600">
                    No upcoming reservations.
                  </p>
                )}
              </div>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-950">Past</h2>
              <div className="mt-4 space-y-4">
                {past.length ? (
                  past.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))
                ) : (
                  <p className="rounded-2xl bg-white p-5 text-sm text-slate-600">
                    No past reservations.
                  </p>
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
