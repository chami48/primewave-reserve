import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  status: string;
};

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  available: {
    variant: "secondary",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  confirmed: {
    variant: "secondary",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  pending: {
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  cancelled: {
    variant: "destructive",
    className: "",
  },
  maintenance: {
    variant: "outline",
    className: "",
  },
  admin: {
    variant: "secondary",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  employee: {
    variant: "secondary",
    className: "",
  },
};

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status] ?? { variant: "outline" as const, className: "" };

  return (
    <Badge
      variant={config.variant}
      className={cn("capitalize border", config.className)}
    >
      {status}
    </Badge>
  );
}
