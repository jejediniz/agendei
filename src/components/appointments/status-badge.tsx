import type { AppointmentStatus } from "@prisma/client";
import {
  APPOINTMENT_STATUS_COLORS,
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        APPOINTMENT_STATUS_COLORS[status],
        className,
      )}
    >
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}
