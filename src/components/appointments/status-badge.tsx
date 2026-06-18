import type { AppointmentStatus } from "@prisma/client";
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_DOT_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/constants/appointment-status";
import { cn } from "@/lib/utils/cn";

type StatusBadgeProps = {
  status: AppointmentStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        APPOINTMENT_STATUS_COLORS[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          APPOINTMENT_STATUS_DOT_COLORS[status],
        )}
      />
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}
