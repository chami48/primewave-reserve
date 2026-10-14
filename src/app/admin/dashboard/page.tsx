import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { CalendarClock, LibraryBig, Settings, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";

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

  return supabase;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function AdminDashboardContent() {
  const supabase = await requireAdmin();

  const [
    { count: totalResources },
    { count: availableResources },
    { count: maintenanceResources },
    { count: totalReservations },
    { count: upcomingReservations },
    { count: cancelledReservations },
    { count: totalUsers },
    { data: recentReservations },
  ] = await Promise.all([
    supabase.from("resources").select("id", { count: "exact", head: true }),
    supabase
      .from("resources")
      .select("id", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("resources")
      .select("id", { count: "exact", head: true })
      .eq("status", "maintenance"),
    supabase.from("reservations").select("id", { count: "exact", head: true }),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .gte("start_time", new Date().toISOString())
      .neq("status", "cancelled"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled"),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("reservations")
      .select("id, start_time, end_time, status, resources(name, type, image_url)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <AppShell title="Admin Dashboard" eyebrow="PrimeWave Reserve Admin">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Monitor resources, reservations and users across PrimeWave Reserve.
            </p>
          </div>
          <Link
            href="/admin/resources"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700"
          >
            <Settings className="size-4" />
            Manage Resources
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Resources" value={totalResources ?? 0} iconName="LibraryBig" />
          <StatCard label="Available Resources" value={availableResources ?? 0} iconName="CheckCircle2" tone="emerald" />
          <StatCard label="Upcoming Reservations" value={upcomingReservations ?? 0} iconName="CalendarClock" tone="blue" />
          <StatCard label="Total Users" value={totalUsers ?? 0} iconName="LibraryBig" tone="amber" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Recent Reservations
                </h2>
                <p className="text-sm text-slate-600">
                  Latest activity from all employees.
                </p>
              </div>
              <Link href="/admin/reservations" className="text-sm font-semibold text-blue-600">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {(recentReservations ?? []).map((reservation) => {
                const resource = Array.isArray(reservation.resources)
                  ? reservation.resources[0]
                  : reservation.resources;

                return (
                  <div key={reservation.id} className="flex items-center gap-4 py-4">
                    <div
                      className="size-14 rounded-lg bg-slate-100 bg-cover bg-center"
                      style={{
                        backgroundImage: resource?.image_url
                          ? `url(${resource.image_url})`
                          : "linear-gradient(135deg, #dbeafe, #e0f2fe)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-950">
                        {resource?.name ?? "Reserved resource"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(reservation.start_time)}
                      </p>
                    </div>
                    <StatusBadge status={reservation.status} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Quick Actions</h2>
            <div className="mt-4 space-y-3">
              <Link href="/admin/resources" className="flex h-12 items-center gap-3 rounded-xl bg-blue-600 px-4 font-semibold text-white">
                <LibraryBig className="size-5" />
                Add / Manage Resources
              </Link>
              <Link href="/admin/reservations" className="flex h-12 items-center gap-3 rounded-xl bg-slate-100 px-4 font-semibold text-slate-900">
                <CalendarClock className="size-5" />
                View All Reservations
              </Link>
              <Link href="/admin/users" className="flex h-12 items-center gap-3 rounded-xl bg-slate-100 px-4 font-semibold text-slate-900">
                <Users className="size-5" />
                Manage Users
              </Link>
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p>Total reservations: {totalReservations ?? 0}</p>
              <p>Cancelled reservations: {cancelledReservations ?? 0}</p>
              <p>Resources under maintenance: {maintenanceResources ?? 0}</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50" />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
