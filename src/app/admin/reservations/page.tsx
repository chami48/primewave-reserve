import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getAllReservationsForAdmin } from "@/app/actions/reservations";
import { AppShell } from "@/components/app-shell";
import { AdminReservationsPanel } from "./admin-reservations-panel";

async function AdminReservationsContent() {
  await connection();
  const result = await getAllReservationsForAdmin();

  return (
    <AppShell title="Reservation Management" eyebrow="PrimeWave Reserve Admin">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              PrimeWave Reserve Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Reservation Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review bookings, filter by resource or status, and preserve
              history by updating reservation status.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/resources"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700"
            >
              Resources
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <div className="mt-8">
          {result.success ? (
            <AdminReservationsPanel
              reservations={result.data}
              generatedAt={new Date().toISOString()}
            />
          ) : (
            <section className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Reservations could not be loaded
              </h2>
              <p className="mt-2 text-sm text-slate-600">{result.error}</p>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function AdminReservationsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-600">
            Loading admin reservations...
          </p>
        </main>
      }
    >
      <AdminReservationsContent />
    </Suspense>
  );
}
