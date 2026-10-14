import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function DashboardContent() {
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
    .select("id, role, full_name")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const isAdmin = profile.role === "admin";

  const [
    { count: resourceCount },
    { count: availableResourceCount },
    { count: reservationCount },
    { data: upcomingReservations },
    { data: featuredResources },
  ] = await Promise.all([
    supabase.from("resources").select("id", { count: "exact", head: true }),
    supabase
      .from("resources")
      .select("id", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .neq("status", "cancelled")
      .eq(isAdmin ? "status" : "user_id", isAdmin ? "pending" : profile.id),
    supabase
      .from("reservations")
      .select(
        "id, start_time, end_time, status, resources(name, type, image_url)"
      )
      .neq("status", "cancelled")
      .eq(isAdmin ? "status" : "user_id", isAdmin ? "pending" : profile.id)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5),
    supabase
      .from("resources")
      .select("id, name, type, description, image_url, capacity, status")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const displayName =
    profile.full_name || user.email?.split("@")[0] || "there";
  const today = new Date();
  const todayBookings = (upcomingReservations ?? []).filter(
    (reservation) =>
      new Date(reservation.start_time).toDateString() === today.toDateString()
  ).length;
  const todayLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(today);

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Good afternoon, {displayName}!</h2>
            <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your workspace today.</p>
          </div>
          <p className="hidden text-sm font-medium text-slate-500 sm:block">{todayLabel}</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Resources", resourceCount ?? 0, "Across all categories", "bg-blue-50 text-blue-700"],
            ["Available Now", availableResourceCount ?? 0, "Ready for booking", "bg-emerald-50 text-emerald-700"],
            ["Upcoming Bookings", reservationCount ?? 0, "Your reservations", "bg-violet-50 text-violet-700"],
            ["Today&apos;s Bookings", todayBookings, "Scheduled for today", "bg-orange-50 text-orange-700"],
          ].map(([label, value, note, tone]) => (
            <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><span className={`rounded-full px-2 py-1 text-xs font-bold ${tone}`}>{label === "Available Now" ? "Ready" : ""}</span></div>
              <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.55fr_0.8fr_0.72fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><h3 className="font-bold text-slate-950">Resource Availability Overview</h3><p className="mt-1 text-xs text-slate-500">Today&apos;s booking activity across all resources</p></div><div className="flex gap-3 text-xs text-slate-500"><span><b className="mr-1 inline-block size-2 rounded-full bg-blue-600" />Booked</span><span><b className="mr-1 inline-block size-2 rounded-full bg-blue-100" />Available</span></div></div>
            <div className="mt-6 flex h-40 items-end gap-3 border-b border-slate-100 px-2 sm:gap-6">
              {[18, 36, 28, 56, 42, 70, 48, 30, 62, 24, 44, 20].map((height, index) => <div key={index} className="flex flex-1 items-end gap-1"><span className="w-1/2 rounded-t bg-blue-100" style={{ height: `${height}%` }} /><span className="w-1/2 rounded-t bg-blue-600" style={{ height: `${Math.max(8, height - (index % 3) * 14)}%` }} /></div>)}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>8 AM</span><span>10 AM</span><span>12 PM</span><span>2 PM</span><span>4 PM</span><span>6 PM</span><span>8 PM</span></div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold text-slate-950">Quick Actions</h3><div className="mt-4 space-y-2"><Link href="/reservations/new" className="flex h-11 items-center justify-between rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Book a Resource <span>→</span></Link><Link href="/resources" className="flex h-11 items-center rounded-lg bg-blue-50 px-4 text-sm font-semibold text-blue-800 hover:bg-blue-100">Browse Resources</Link><Link href="/reservations" className="flex h-11 items-center rounded-lg bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100">View My Reservations</Link></div></div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="h-32 bg-slate-100 bg-cover bg-center" style={{ backgroundImage: featuredResources?.[0]?.image_url ? `url(${featuredResources[0].image_url})` : "linear-gradient(135deg,#dbeafe,#f8fafc)" }} /><div className="p-4"><p className="text-xs font-semibold text-blue-600">Featured resource</p><h3 className="mt-1 font-bold text-slate-950">Find the Perfect Space</h3><p className="mt-1 text-xs leading-5 text-slate-500">Book meeting rooms, projectors and more for your team.</p><Link href="/resources" className="mt-4 inline-flex text-xs font-bold text-blue-600">Browse Resources →</Link></div></div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.55fr_0.8fr_0.72fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-950">Upcoming Reservations</h3><Link href="/reservations" className="text-xs font-bold text-blue-600">View all →</Link></div><div className="mt-3 divide-y divide-slate-100">{(upcomingReservations ?? []).slice(0, 3).map((reservation) => { const resource = Array.isArray(reservation.resources) ? reservation.resources[0] : reservation.resources; return <div key={reservation.id} className="flex items-center gap-3 py-3"><div className="size-11 shrink-0 rounded-lg bg-slate-100 bg-cover bg-center" style={{ backgroundImage: resource?.image_url ? `url(${resource.image_url})` : undefined }} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-950">{resource?.name ?? "Reserved resource"}</p><p className="mt-1 text-xs text-slate-500">{formatDateTime(reservation.start_time)} · {resource?.type ?? "Resource"}</p></div><StatusBadge status={reservation.status} /></div>; })}</div>{!upcomingReservations?.length ? <p className="py-8 text-center text-sm text-slate-500">No upcoming reservations.</p> : null}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-950">Resource Categories</h3><Link href="/resources" className="text-xs font-bold text-blue-600">View all →</Link></div><div className="mt-4 space-y-1">{["Meeting Rooms", "Projectors", "Equipment", "Whiteboards"].map((category, index) => <Link href={`/resources?type=${encodeURIComponent(category)}`} key={category} className="flex items-center justify-between rounded-lg px-2 py-3 text-sm hover:bg-slate-50"><span className="font-semibold text-slate-700">{category}</span><span className="text-xs text-slate-400">{Math.max(1, (featuredResources?.length ?? 1) - index)} resources&nbsp; ›</span></Link>)}</div></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-950">Today&apos;s Schedule</h3><Link href="/reservations" className="text-xs font-bold text-blue-600">View calendar →</Link></div><div className="mt-4 space-y-4">{(upcomingReservations ?? []).slice(0, 3).map((reservation) => { const resource = Array.isArray(reservation.resources) ? reservation.resources[0] : reservation.resources; return <div key={reservation.id} className="border-l-2 border-blue-500 pl-3"><p className="text-xs font-semibold text-slate-500">{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(reservation.start_time))}</p><p className="mt-1 text-sm font-bold text-slate-950">{resource?.name ?? "Booking"}</p><p className="text-xs text-slate-500">{resource?.type ?? "Resource"}</p></div>; })}</div></div>
        </section>

        <div className="flex flex-col gap-3 rounded-xl bg-blue-600 px-5 py-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">Need a resource now?</p><p className="text-sm text-blue-100">Check availability and book in just a few clicks.</p></div><Link href="/reservations/new" className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-blue-700 hover:bg-blue-50">Book a Resource →</Link></div>
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-sm text-muted-foreground">
              Loading dashboard...
            </p>
          </div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
