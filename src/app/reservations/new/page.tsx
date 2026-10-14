import { Suspense } from "react";
import { connection } from "next/server";
import { getBookableResources } from "@/app/actions/reservations";
import { AppShell } from "@/components/app-shell";
import { BookingForm } from "./booking-form";

async function NewReservationContent() {
  await connection();
  const result = await getBookableResources();

  return (
    <AppShell title="Book Resource">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Dashboard <span className="mx-2">›</span> Book Resource
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Book a Resource
            </h1>
            <p className="mt-1 text-base text-slate-600">
              Select a resource, choose a date and time, and create your reservation.
            </p>
          </div>
        </header>
        {result.success ? (
          <BookingForm resources={result.data} />
        ) : (
          <section className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Booking form could not be loaded
            </h2>
            <p className="mt-2 text-sm text-slate-600">{result.error}</p>
          </section>
        )}
      </div>
    </AppShell>
  );
}

export default function NewReservationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-600">
            Loading booking form...
          </p>
        </main>
      }
    >
      <NewReservationContent />
    </Suspense>
  );
}
