"use client";

import Link from "next/link";
import {
    CalendarCheck,
    LayoutDashboard,
    LibraryBig,
    Menu,
    PackagePlus,
    Settings,
    Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

/* Icon lookup — maps serializable strings to actual components */
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    LibraryBig,
    PackagePlus,
    CalendarCheck,
    Settings,
};

export type NavLinkData = {
    href: string;
    label: string;
    iconName: string;
};

type Props = {
    links: NavLinkData[];
    displayName: string;
    role: string;
    avatarInitials: string;
};

export function MobileNav({
    links,
    displayName,
    role,
    avatarInitials,
}: Props) {
    return (
        <Sheet>
            <SheetTrigger
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground lg:hidden"
                aria-label="Open menu"
            >
                <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-5 pb-0">
                    <SheetTitle className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Sparkles className="size-4" />
                        </span>
                        <span className="text-base font-bold tracking-tight">
                            PrimeWave Reserve
                        </span>
                    </SheetTitle>
                </SheetHeader>
                <Separator className="my-3" />
                <nav className="flex-1 space-y-1 px-3">
                    {links.map((item) => {
                        const Icon = iconMap[item.iconName];
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                            >
                                {Icon && <Icon className="size-4 shrink-0" />}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <Separator className="my-3" />
                <div className="flex items-center gap-3 px-5 pb-5">
                    <Avatar size="default">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {avatarInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {displayName}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">{role}</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
