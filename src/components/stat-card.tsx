import {
  CalendarClock,
  CheckCircle2,
  LibraryBig,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatIconName = "LibraryBig" | "CheckCircle2" | "CalendarClock";

type Props = {
  label: string;
  value: string | number;
  iconName: StatIconName;
  tone?: "default" | "emerald" | "blue" | "amber";
};

const iconMap: Record<StatIconName, LucideIcon> = {
  LibraryBig,
  CheckCircle2,
  CalendarClock,
};

const toneClasses = {
  default: {
    icon: "bg-muted text-muted-foreground",
    accent: "",
  },
  emerald: {
    icon: "bg-primary/10 text-primary",
    accent: "border-primary/20",
  },
  blue: {
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    accent: "border-blue-500/20",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accent: "border-amber-500/20",
  },
};

export function StatCard({ label, value, iconName, tone = "default" }: Props) {
  const styles = toneClasses[tone];
  const Icon = iconMap[iconName];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md",
        styles.accent
      )}
    >
      <CardContent className="flex items-center justify-between gap-4 py-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
            styles.icon
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
      {/* Decorative gradient accent bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-[2px] w-full opacity-0 transition-opacity group-hover:opacity-100",
          tone === "emerald" && "bg-gradient-to-r from-primary/60 to-primary",
          tone === "blue" && "bg-gradient-to-r from-blue-400/60 to-blue-500",
          tone === "amber" && "bg-gradient-to-r from-amber-400/60 to-amber-500",
          tone === "default" && "bg-gradient-to-r from-muted-foreground/40 to-muted-foreground"
        )}
      />
    </Card>
  );
}
