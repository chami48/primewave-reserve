import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getReservationById } from "@/app/actions/reservations";
import { CancelReservationButton } from "../reservation-actions";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

async function ReservationDetailContent({ params }: PageProps<"/reservations/[id]">) {
  await connection();
  const { id } = await params;
  const result = await getReservationById(id);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              PrimeWave Reserve
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Reservation Details
            </h1>
          </div>
          <Link
            href="/reservations"
            className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
          >
            Back
          </Link>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {result.success ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  {result.data.resources?.type ?? "Resource"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  {result.data.resources?.name ?? "Reserved resource"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {result.data.resources?.description ?? "No description provided."}
                </p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Starts
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-950">
                    {formatDateTime(result.data.start_time)}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Ends
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-950">
                    {formatDateTime(result.data.end_time)}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-950">
                    {result.data.status}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Capacity
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-950">
                    {result.data.resources?.capacity ?? "Not applicable"}
                  </dd>
                </div>
              </dl>
              <CancelReservationButton
                id={result.data.id}
                disabled={
                  result.data.status === "cancelled" ||
                  new Date(result.data.start_time) <= new Date()
                }
              />
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-950">
                Reservation unavailable
              </h2>
              <p className="mt-2 text-sm text-slate-600">{result.error}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ReservationDetailPage(props: PageProps<"/reservations/[id]">) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-600">
            Loading reservation...
          </p>
        </main>
      }
    >
      <ReservationDetailContent {...props} />
    </Suspense>
  );
}
