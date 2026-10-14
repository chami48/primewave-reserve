import { Suspense } from "react";
import { connection } from "next/server";
import { getResources } from "@/app/actions/resources";
import { AppShell } from "@/components/app-shell";
import { ResourceCatalog } from "./resource-catalog";

async function ResourcesContent() {
  await connection();

  const result = await getResources();

  return (
    <AppShell title="Resource Catalog">
      <div className="mx-auto max-w-7xl">
        {result.success ? (
          <ResourceCatalog resources={result.data} />
        ) : (
          <section className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Resources could not be loaded
            </h2>
            <p className="mt-2 text-sm text-slate-600">{result.error}</p>
          </section>
        )}
      </div>
    </AppShell>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-600">
            Loading resources...
          </p>
        </main>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}
