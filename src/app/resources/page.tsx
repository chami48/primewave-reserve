import { Suspense } from "react";
import { connection } from "next/server";
import { getResources } from "@/app/actions/resources";
import { AppShell } from "@/components/app-shell";
import { ResourceCatalog } from "./resource-catalog";

async function ResourcesContent({ searchParams }: PageProps<"/resources">) {
  await connection();

  const result = await getResources();
  const params = await searchParams;
  const selectedType = typeof params.type === "string" ? params.type : "all";
  const initialType = result.success && result.data.some((resource) => resource.type === selectedType) ? selectedType : "all";

  return (
    <AppShell title="Resources">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Dashboard <span className="mx-2">›</span> Resources
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Resources
            </h1>
            <p className="mt-1 text-base text-slate-600">
              Browse and book available meeting rooms, equipment and office resources.
            </p>
          </div>
        </header>
        {result.success ? (
            <ResourceCatalog key={initialType} resources={result.data} initialType={initialType} />
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

export default function ResourcesPage(props: PageProps<"/resources">) {
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
      <ResourcesContent {...props} />
    </Suspense>
  );
}
