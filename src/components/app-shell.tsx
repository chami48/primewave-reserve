import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  CalendarCheck,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  PackagePlus,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MobileNav, type NavLinkData } from "@/components/mobile-nav";

type Props = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

type NavIconName =
  | "LayoutDashboard"
  | "LibraryBig"
  | "PackagePlus"
  | "CalendarCheck"
  | "Settings";

type ShellLink = {
  href: string;
  label: string;
  iconName: NavIconName;
};

const iconMap: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  LibraryBig,
  PackagePlus,
  CalendarCheck,
  Settings,
};

const employeeLinks: ShellLink[] = [
  { href: "/dashboard", label: "Dashboard", iconName: "LayoutDashboard" },
  { href: "/resources", label: "Resources", iconName: "LibraryBig" },
  { href: "/reservations/new", label: "Book Resource", iconName: "PackagePlus" },
  { href: "/reservations", label: "My Reservations", iconName: "CalendarCheck" },
];

const adminLinks: ShellLink[] = [
  { href: "/admin/resources", label: "Admin Resources", iconName: "Settings" },
  { href: "/admin/reservations", label: "Admin Reservations", iconName: "Settings" },
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
    .select("role, full_name")
    .eq("auth_user_id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const links = isAdmin ? [...employeeLinks, ...adminLinks] : employeeLinks;
  const displayName = profile?.full_name || user.email;
  const avatarInitials = initials(profile?.full_name, user.email);

  // Serializable version for the client MobileNav component
  const mobileLinks: NavLinkData[] = links.map(({ href, label, iconName }) => ({
    href,
    label,
    iconName,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-sidebar px-5 py-6 lg:flex">
          {/* Brand */}
          <Link
            href="/dashboard"
            className="group flex items-center gap-3 px-1"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-bold text-foreground tracking-tight">
                PrimeWave
              </span>
              <span className="block text-xs text-muted-foreground">
                Reserve
              </span>
            </span>
          </Link>

          <Separator className="my-6" />

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {links.map((item) => {
              const Icon = iconMap[item.iconName];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          {/* User Section at Bottom */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {avatarInitials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {profile?.role ?? "user"}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </aside>

        {/* ─── Main Content Area ─── */}
        <section className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <MobileNav
                  links={mobileLinks}
                  displayName={displayName ?? "User"}
                  role={profile?.role ?? "user"}
                  avatarInitials={avatarInitials}
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {eyebrow}
                  </p>
                  <h1 className="mt-0.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {title}
                  </h1>
                </div>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <Badge variant="secondary" className="capitalize">
                  {profile?.role ?? "user"}
                </Badge>
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {avatarInitials}
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
