import Link from "next/link";
import { Calendar } from "lucide-react";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { formatTime } from "@/lib/utils/date";
import { StatusBadge } from "@/components/appointments/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { cn } from "@/lib/utils/cn";

type DashboardAppointmentListProps = {
  appointments: AppointmentWithRelations[];
  emptyTitle: string;
  emptyDescription: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  highlightNext?: boolean;
};

export function DashboardAppointmentList({
  appointments,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  highlightNext = false,
}: DashboardAppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        compact
        icon={Calendar}
        title={emptyTitle}
        description={emptyDescription}
        action={
          emptyActionHref && emptyActionLabel ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={emptyActionHref}>{emptyActionLabel}</Link>
            </Button>
          ) : undefined
        }
        className="border-none bg-muted/20"
      />
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map((apt, index) => (
        <div
          key={apt.id}
          className={cn(
            "flex flex-col gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between",
            highlightNext && index === 0 && "border-primary/25 bg-primary-light/20",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-muted/80 px-2 py-1.5">
              <span className="font-display text-lg font-semibold tabular-nums text-foreground">
                {formatTime(apt.startAt)}
              </span>
            </div>
            <Avatar name={apt.client.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {apt.client.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {apt.service.name} · {apt.professional.name}
              </p>
            </div>
          </div>
          <StatusBadge status={apt.status} className="self-start sm:self-center" />
        </div>
      ))}
    </div>
  );
}
