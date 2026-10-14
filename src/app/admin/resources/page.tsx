import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getResources } from "@/app/actions/resources";
import { createClient } from "@/lib/supabase/server";
import { ResourceAdminPanel } from "./resource-admin-panel";

async function requireAdmin() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }
}

async function AdminResourcesContent() {
  await requireAdmin();

  const result = await getResources();

  return (
    <main className="primewave-bg min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              PrimeWave Reserve Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Resource Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Maintain reservable rooms, equipment, and vehicles for the next
              booking phase.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/resources"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              View catalog
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <div className="mt-8">
          {result.success ? (
            <ResourceAdminPanel resources={result.data} />
          ) : (
            <section className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Resources could not be loaded
              </h2>
              <p className="mt-2 text-sm text-slate-600">{result.error}</p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminResourcesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-600">
            Loading resource management...
          </p>
        </main>
      }
    >
      <AdminResourcesContent />
    </Suspense>
  );
}
