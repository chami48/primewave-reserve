"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  LayoutDashboard,
  LibraryBig,
  PackagePlus,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavIconName =
  | "LayoutDashboard"
  | "LibraryBig"
  | "PackagePlus"
  | "CalendarCheck"
  | "Settings";

export type SidebarLink = {
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

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  if (href === "/reservations") {
    return pathname === "/reservations" || pathname.startsWith("/reservations/") && !pathname.startsWith("/reservations/new");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function activeHref(pathname: string, links: SidebarLink[]) {
  return links
    .filter((link) => isActive(pathname, link.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function SidebarNav({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();
  const selectedHref = activeHref(pathname, links);

  return (
    <nav className="flex-1 space-y-2">
      {links.map((item) => {
        const Icon = iconMap[item.iconName];
        const active = selectedHref === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-12 items-center gap-3 rounded-xl px-4 text-[15px] font-medium text-blue-100/78 transition-all hover:bg-white/10 hover:text-white",
              active &&
                "bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.25)]"
            )}
          >
            <Icon className="size-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
