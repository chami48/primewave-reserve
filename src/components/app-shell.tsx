import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ChevronDown, LogOut, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { MobileNav, type NavLinkData } from "@/components/mobile-nav";
import { SidebarNav, type SidebarLink } from "@/components/sidebar-nav";
import { NotificationBell } from "@/components/notification-bell";

type Props = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

const employeeLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/resources", label: "Resources", iconName: "LibraryBig" },
  { href: "/reservations/new", label: "Book Resource", iconName: "PackagePlus" },
  { href: "/reservations", label: "My Reservations", iconName: "CalendarCheck" },
];

const adminLinks: SidebarLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/admin/resources", label: "Manage Resources", iconName: "Settings" },
  { href: "/admin/reservations", label: "All Reservations", iconName: "Settings" },
  { href: "/admin/users", label: "Users", iconName: "Settings" },
];

function initials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (email?.slice(0, 2) || "PR").toUpperCase();
}

export async function AppShell({
  title,
  eyebrow = "PrimeWave Reserve",
  children,
}: Props) {
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

  const isAdmin = profile?.role === "admin";
  const links = isAdmin ? adminLinks : employeeLinks;
  const brandHref = isAdmin ? "/admin/dashboard" : "/dashboard";
  const displayName = profile?.full_name || user.email;
  const avatarInitials = initials(profile?.full_name, user.email);
  const { count: notificationCount } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq(isAdmin ? "status" : "user_id", isAdmin ? "pending" : profile?.id)
    .neq("status", "cancelled")
    .gte("start_time", new Date().toISOString());
  const notifications = notificationCount
    ? [{
        id: "reservation-activity",
        title: isAdmin ? "Reservations need review" : "Upcoming reservation",
        detail: isAdmin
          ? `${notificationCount} booking request${notificationCount === 1 ? "" : "s"} waiting for approval.`
          : `You have ${notificationCount} upcoming booking${notificationCount === 1 ? "" : "s"}.`,
      }]
    : [];

  // Serializable version for the client MobileNav component
  const mobileLinks: NavLinkData[] = links.map(({ href, label, iconName }) => ({
    href,
    label,
    iconName,
  }));

  return (
    <main className="min-h-screen bg-[#f7fbff] text-foreground">
      <div className="flex min-h-screen">
        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden w-[244px] shrink-0 flex-col bg-[#071a33] px-4 py-7 text-white shadow-[22px_0_60px_rgba(7,26,51,0.20)] lg:flex">
          {/* Brand */}
          <Link
            href={brandHref}
            className="group flex items-center gap-3 px-1"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/8 transition-transform group-hover:scale-105">
              <Image
                src="/primewave-lab-icon.png"
                alt="PrimeWave Lab"
                width={32}
                height={32}
                className="size-8 object-contain"
              />
            </span>
            <span>
              <span className="block text-xl font-bold tracking-tight text-white">
                PrimeWave Lab
              </span>
              <span className="block text-sm text-blue-100/72">Reserve</span>
            </span>
          </Link>

          <Separator className="my-8 bg-white/10" />

          <SidebarNav links={links} />

          <Separator className="mb-4 bg-white/10" />

          {/* User Section at Bottom */}
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {avatarInitials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="text-xs capitalize text-blue-100/65">
                {profile?.role ?? "user"}
              </p>
            </div>
            <ChevronDown className="size-4 text-blue-100/70" />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="mt-3 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-blue-100/78 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-5" />
              Sign out
            </button>
          </form>
        </aside>

        {/* ─── Main Content Area ─── */}
        <section className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {/* Mobile hamburger */}
                <MobileNav
                  links={mobileLinks}
                  displayName={displayName ?? "User"}
                  role={profile?.role ?? "user"}
                  avatarInitials={avatarInitials}
                />
                <div className="relative hidden w-full max-w-[560px] md:block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
                  <input
                    className="h-11 w-full rounded-xl border border-transparent bg-slate-100/90 pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="Search resources, reservations..."
                  />
                </div>
              </div>
              <ThemeToggle />
              <div className="hidden items-center gap-4 sm:flex">
                <NotificationBell notifications={notifications} />
                <span className="h-8 w-px bg-slate-200" />
                <span className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {avatarInitials}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-slate-950">
                    {displayName}
                  </span>
                  <span className="block text-xs capitalize text-slate-500">
                    {profile?.role ?? "user"}
                  </span>
                </span>
                <ChevronDown className="size-4 text-slate-700" />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 md:hidden">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
