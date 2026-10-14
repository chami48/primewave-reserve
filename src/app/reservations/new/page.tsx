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
      <div className="mx-auto max-w-7xl">
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
