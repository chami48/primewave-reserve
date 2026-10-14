import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";

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

  return (
    <AppShell title={isAdmin ? "Dashboard" : "Welcome"}>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ─── Hero Section ─── */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 ring-1 ring-primary/10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <CardContent className="p-8 sm:p-10">
              <Badge
                variant="secondary"
                className="gap-1.5 border border-primary/20 bg-primary/10 text-primary"
              >
                <Sparkles className="size-3" />
                PrimeWave Reserve
              </Badge>

              <h2 className="mt-6 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Find and reserve your{" "}
                <span className="text-primary">perfect workspace.</span>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Hi{" "}
                <span className="font-semibold text-foreground">
                  {displayName}
                </span>
                , browse available rooms, check booked slots, and send a
                reservation request in a clean guided flow.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/reservations/new"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/80"
                >
                  Book Resource
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-all hover:bg-muted"
                >
                  <Search className="size-4" />
                  Explore Catalog
                </Link>
              </div>
            </CardContent>

            {/* Stat cards panel */}
            <div className="border-t border-border bg-muted/30 p-6 lg:border-l lg:border-t-0">
              <div className="grid h-full gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <StatCard
                  label="Resources"
                  value={resourceCount ?? 0}
                  iconName="LibraryBig"
                />
                <StatCard
                  label="Available now"
                  value={availableResourceCount ?? 0}
                  iconName="CheckCircle2"
                  tone="emerald"
                />
                <StatCard
                  label={isAdmin ? "Pending approvals" : "My active bookings"}
                  value={reservationCount ?? 0}
                  iconName="CalendarClock"
                  tone="blue"
                />
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-primary/5 blur-3xl" />
        </Card>

        {/* ─── Admin Shortcuts ─── */}
        {isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-primary" />
                Admin shortcuts
              </CardTitle>
              <CardDescription>
                Quick access to administrative panels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/admin/resources"
                  className="inline-flex h-auto items-center justify-start gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:bg-muted"
                >
                  <Zap className="size-4 text-primary" />
                  <span className="font-semibold">Admin Resources</span>
                </Link>
                <Link
                  href="/admin/reservations"
                  className="inline-flex h-auto items-center justify-start gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:bg-muted"
                >
                  <CalendarClock className="size-4 text-primary" />
                  <span className="font-semibold">Admin Reservations</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* ─── Featured Resources + Upcoming Reservations ─── */}
        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Featured Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured resources</CardTitle>
              <CardDescription>
                Premium spaces ready for your next booking.
              </CardDescription>
              <CardAction>
                <Link
                  href="/resources"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  View all →
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {(featuredResources ?? []).map((resource) => (
                  <Card
                    key={resource.id}
                    className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div
                      className="h-36 bg-muted bg-cover bg-center transition-transform group-hover:scale-[1.02]"
                      style={{
                        backgroundImage: resource.image_url
                          ? `url(${resource.image_url})`
                          : "linear-gradient(135deg, oklch(0.94 0.04 155), oklch(0.96 0.01 200))",
                      }}
                    />
                    <CardContent className="p-4">
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-primary/10 text-primary text-[10px] uppercase tracking-wider border border-primary/20"
                      >
                        {resource.type}
                      </Badge>
                      <h3 className="font-bold text-foreground">
                        {resource.name}
                      </h3>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-4" />
                          {resource.capacity ?? "Flexible"}
                        </span>
                        <Link
                          href={`/reservations/new?resource=${resource.id}`}
                          className="font-bold text-primary hover:underline"
                        >
                          Book →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Reservations / Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isAdmin ? "Pending requests" : "Your next bookings"}
              </CardTitle>
              <CardAction>
                <StatusBadge status={profile.role} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingReservations && upcomingReservations.length > 0 ? (
                  upcomingReservations.map((reservation) => {
                    const resource = Array.isArray(reservation.resources)
                      ? reservation.resources[0]
                      : reservation.resources;

                    return (
                      <div
                        key={reservation.id}
                        className="group rounded-xl border border-border bg-muted/30 p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">
                              {resource?.name ?? "Reserved resource"}
                            </p>
                            <Badge
                              variant="secondary"
                              className="mt-1 bg-primary/10 text-primary text-[10px] border border-primary/20"
                            >
                              {resource?.type ?? "Resource"}
                            </Badge>
                          </div>
                          <StatusBadge status={reservation.status} />
                        </div>
                        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="size-4 shrink-0" />
                          <span>
                            {formatDateTime(reservation.start_time)} –{" "}
                            {formatDateTime(reservation.end_time)}
                          </span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                      <CalendarClock className="size-6 text-primary" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-foreground">
                      No upcoming reservations
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Book a resource to see it here.
                    </p>
                    <Link
                      href="/reservations/new"
                      className="mt-4 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
                    >
                      <Sparkles className="size-3" />
                      Book now
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── Quick Actions ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick actions</CardTitle>
            <CardDescription>
              Jump straight to what you need
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/reservations/new"
                className="inline-flex h-auto items-center justify-start gap-3 rounded-lg bg-primary px-5 py-4 text-primary-foreground shadow-sm transition-all hover:bg-primary/80"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/20">
                  <Sparkles className="size-4" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold">
                    Book Resource
                  </span>
                  <span className="block text-xs opacity-80">
                    Reserve a workspace
                  </span>
                </span>
              </Link>
              <Link
                href="/reservations"
                className="inline-flex h-auto items-center justify-start gap-3 rounded-lg border border-border bg-background px-5 py-4 transition-all hover:bg-muted"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <CalendarClock className="size-4 text-muted-foreground" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-foreground">
                    My Reservations
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    View your bookings
                  </span>
                </span>
              </Link>
              <Link
                href="/resources"
                className="inline-flex h-auto items-center justify-start gap-3 rounded-lg border border-border bg-background px-5 py-4 transition-all hover:bg-muted"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Search className="size-4 text-muted-foreground" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-foreground">
                    Resource Catalog
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Browse all spaces
                  </span>
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
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
