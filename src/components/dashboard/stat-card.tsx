import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  compact?: boolean;
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  compact = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 shadow-warm",
        compact ? "p-4" : "p-5",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-primary-light ring-1 ring-primary/10",
          compact ? "h-10 w-10" : "h-11 w-11",
        )}
      >
        <Icon className={cn("text-primary", compact ? "h-5 w-5" : "h-5 w-5")} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p
          className={cn(
            "font-display font-semibold text-foreground",
            compact ? "text-xl" : "text-2xl",
          )}
        >
          {value}
        </p>
        {description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground/80">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
