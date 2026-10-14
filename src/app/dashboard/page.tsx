import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { bookingActivity, dashboardDay, dashboardTimeZone } from "@/lib/dashboard";
import type { DashboardBooking } from "@/lib/dashboard";
import type { Resource } from "@/types/resource";
import { BookingActivityChart } from "./booking-activity-chart";

type ResourceSummary = Pick<Resource, "id" | "name" | "type" | "description" | "image_url" | "status">;
type Booking = DashboardBooking & {
  resources: { name: string; type: string; image_url: string | null } | { name: string; type: string; image_url: string | null }[] | null;
};

async function fetchPages<T>(query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const result = await query(from, from + 999);
    if (result.error) return { data: rows, error: result.error };
    rows.push(...(result.data ?? []));
    if ((result.data?.length ?? 0) < 1000) return { data: rows, error: null };
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone: dashboardTimeZone, dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));
}

function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-950">{title}</h3>{action}</div>{children}</section>;
}

function BookingList({ bookings, empty }: { bookings: Booking[]; empty: string }) {
  return <div className="mt-3 divide-y divide-slate-200">{bookings.length ? bookings.map((booking) => {
    const resource = Array.isArray(booking.resources) ? booking.resources[0] : booking.resources;
    return <Link key={booking.id} href={`/reservations/${booking.id}`} className="flex items-center gap-3 py-3">
      <div className="size-11 shrink-0 rounded-lg bg-slate-100 bg-cover bg-center" style={{ backgroundImage: resource?.image_url ? `url(${resource.image_url})` : undefined }} />
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-950">{resource?.name ?? "Reserved resource"}</p><p className="mt-1 text-xs text-slate-500">{formatDateTime(booking.start_time)} – {new Intl.DateTimeFormat("en", { timeZone: dashboardTimeZone, hour: "numeric", minute: "2-digit" }).format(new Date(booking.end_time))}</p></div>
      <StatusBadge status={booking.status} />
    </Link>;
  }) : <p className="py-8 text-center text-sm text-slate-500">{empty}</p>}</div>;
}

async function DashboardContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: profile } = await supabase.from("users").select("id, role, full_name").eq("auth_user_id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin/dashboard");

  const now = new Date();
  const day = dashboardDay(now);
  const bookingSelect = "id, start_time, end_time, status, resources(name, type, image_url)";
  const [resourcesResult, upcomingCountResult, upcomingResult, todayResult] = await Promise.all([
    fetchPages<ResourceSummary>((from, to) => supabase.from("resources").select("id, name, type, description, image_url, status").order("id").range(from, to)),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("user_id", profile.id).in("status", ["pending", "confirmed"]).gte("start_time", now.toISOString()),
    supabase.from("reservations").select(bookingSelect).eq("user_id", profile.id).in("status", ["pending", "confirmed"]).gte("start_time", now.toISOString()).order("start_time").order("id").limit(3),
    fetchPages<Booking>((from, to) => supabase.from("reservations").select(bookingSelect).eq("user_id", profile.id).in("status", ["pending", "confirmed"]).lt("start_time", day.end.toISOString()).gt("end_time", day.start.toISOString()).order("start_time").order("id").range(from, to)),
  ]);

  if ([resourcesResult, upcomingCountResult, upcomingResult, todayResult].some((result) => result.error)) {
    return <AppShell title="Dashboard"><Panel title="Dashboard could not be loaded"><p className="mt-3 text-sm text-slate-600">Please refresh to try again. Your booking data is currently unavailable.</p></Panel></AppShell>;
  }

  const resources = resourcesResult.data;
  const bookable = resources.filter((resource) => resource.status === "available");
  const todayBookings = todayResult.data;
  const categories = Array.from(new Set(resources.map((resource) => resource.type))).sort().map((type) => ({ type, count: resources.filter((resource) => resource.type === type).length }));
  const featured = bookable.find((resource) => resource.image_url) ?? bookable[0];
  const localHour = Number(new Intl.DateTimeFormat("en", { timeZone: dashboardTimeZone, hour: "2-digit", hourCycle: "h23" }).format(now));
  const greeting = localHour < 12 ? "Good morning" : localHour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile.full_name || user.email?.split("@")[0] || "there";
  const todayLabel = new Intl.DateTimeFormat("en", { timeZone: dashboardTimeZone, weekday: "long", month: "short", day: "numeric", year: "numeric" }).format(now);
  const viewAll = <Link href="/reservations" className="text-xs font-bold text-blue-600">View all →</Link>;

  return <AppShell title="Dashboard">
    <div className="mx-auto max-w-[1440px] space-y-5">
      <header className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{greeting}, {displayName}!</h2><p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your workspace today.</p></div><p className="hidden text-sm font-medium text-slate-500 sm:block">{todayLabel}</p></header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Resources", value: resources.length, note: "Across all categories" },
          { label: "Bookable Resources", value: bookable.length, note: "Operational resources; check time availability" },
          { label: "Upcoming Bookings", value: upcomingCountResult.count ?? 0, note: "Your pending and confirmed future bookings" },
          { label: "Today's Bookings", value: todayBookings.length, note: "Your active bookings overlapping today" },
        ].map((stat) => <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-semibold text-slate-500">{stat.label}</p><p className="mt-3 text-3xl font-bold text-slate-950">{stat.value}</p><p className="mt-1 text-xs text-slate-500">{stat.note}</p></div>)}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.8fr_0.72fr]">
        <Panel title="Your Booking Activity">
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>Today · Sri Lanka time (UTC+05:30)</span><div className="flex gap-3"><span><b className="mr-1 inline-block size-2 rounded-full bg-blue-600" />Confirmed</span><span><b className="mr-1 inline-block size-2 rounded-full bg-blue-200" />Pending</span></div></div>
          <BookingActivityChart points={bookingActivity(todayBookings, day.start)} />
        </Panel>
        <Panel title="Quick Actions"><div className="mt-4 space-y-2"><Link href="/reservations/new" className="flex h-11 items-center justify-between rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Book a Resource <span>→</span></Link><Link href="/resources" className="flex h-11 items-center rounded-lg bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100">Browse Resources</Link><Link href="/reservations" className="flex h-11 items-center rounded-lg bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100">View My Reservations</Link></div></Panel>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {featured ? <><div className="h-32 bg-slate-100 bg-cover bg-center" style={{ backgroundImage: featured.image_url ? `url(${featured.image_url})` : undefined }} /><div className="p-4"><p className="text-xs font-semibold text-blue-600">Featured resource · {featured.type}</p><h3 className="mt-1 font-bold text-slate-950">{featured.name}</h3><p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">{featured.description || "Explore availability and reserve this resource."}</p><Link href={`/reservations/new?resource=${featured.id}`} className="mt-4 inline-flex text-xs font-bold text-blue-600">Check availability →</Link></div></> : <div className="p-5"><h3 className="font-bold text-slate-950">Featured resource</h3><p className="mt-3 text-sm text-slate-500">No bookable resources right now.</p></div>}
        </section>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.8fr_0.72fr]">
        <Panel title="Upcoming Reservations" action={viewAll}><BookingList bookings={(upcomingResult.data ?? []) as Booking[]} empty="No upcoming reservations." /></Panel>
        <Panel title="Resource Categories" action={<Link href="/resources" className="text-xs font-bold text-blue-600">View all →</Link>}><div className="mt-4 space-y-1">{categories.length ? categories.map((category) => <Link href={`/resources?type=${encodeURIComponent(category.type)}`} key={category.type} className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 text-sm hover:bg-slate-50"><span className="font-semibold text-slate-700">{category.type}</span><span className="text-xs text-slate-500">{category.count} {category.count === 1 ? "resource" : "resources"} ›</span></Link>) : <p className="py-6 text-sm text-slate-500">No resources configured yet.</p>}</div></Panel>
        <Panel title="Today's Schedule" action={viewAll}><BookingList bookings={todayBookings} empty="No bookings scheduled for today." /></Panel>
      </section>
      <div className="flex flex-col gap-3 rounded-xl bg-blue-600 px-5 py-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">Need a resource now?</p><p className="text-sm text-blue-100">Check availability and book in just a few clicks.</p></div><Link href="/reservations/new" className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-blue-700 hover:bg-blue-50">Book a Resource →</Link></div>
    </div>
  </AppShell>;
}

export default function DashboardPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-background"><p className="text-sm text-muted-foreground">Loading dashboard...</p></main>}><DashboardContent /></Suspense>;
}
