import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 text-center",
        compact ? "px-5 py-10" : "px-6 py-16",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-2xl bg-primary-light ring-1 ring-primary/10",
          compact ? "h-12 w-12" : "h-14 w-14",
        )}
      >
        <Icon
          className={cn("text-primary", compact ? "h-6 w-6" : "h-7 w-7")}
        />
      </div>
      <h3 className="font-display text-lg font-medium text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
