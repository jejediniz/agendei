import type { Appointment, AppointmentStatus } from "@prisma/client";
import {
  addMinutesToDate,
  minutesFromDateInTimezone,
  parseTimeToMinutes,
  minutesToTime,
} from "./date";

export const BLOCKING_STATUSES: AppointmentStatus[] = ["SCHEDULED", "CONFIRMED"];

export function hasOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && endA > startB;
}

export function appointmentsOverlap(
  appointments: Pick<Appointment, "startAt" | "endAt" | "status">[],
  startAt: Date,
  endAt: Date,
  excludeId?: string,
): boolean {
  return appointments.some((apt) => {
    if (excludeId && "id" in apt && apt.id === excludeId) return false;
    if (!BLOCKING_STATUSES.includes(apt.status)) return false;
    return hasOverlap(startAt, endAt, apt.startAt, apt.endAt);
  });
}

type AvailabilitySlot = {
  startTime: string;
  endTime: string;
};

type BlockingAppointment = {
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
};

export function generateAvailableSlots(
  availabilities: AvailabilitySlot[],
  appointments: BlockingAppointment[],
  durationMin: number,
  slotIntervalMin = 30,
): string[] {
  const slots: string[] = [];

  for (const availability of availabilities) {
    const rangeStart = parseTimeToMinutes(availability.startTime);
    const rangeEnd = parseTimeToMinutes(availability.endTime);

    for (
      let current = rangeStart;
      current + durationMin <= rangeEnd;
      current += slotIntervalMin
    ) {
      const slotStart = minutesToTime(current);
      const slotStartMin = current;
      const slotEndMin = current + durationMin;

      const blocked = appointments.some((apt) => {
        if (!BLOCKING_STATUSES.includes(apt.status)) return false;
        // Compara os minutos do dia no fuso do negócio (America/Sao_Paulo).
        // Usar getHours() direto leria o fuso do servidor e quebraria o
        // cálculo de bloqueio em produção fora do BRT.
        const aptStartMin = minutesFromDateInTimezone(apt.startAt);
        const aptEndMin = minutesFromDateInTimezone(apt.endAt);
        return slotStartMin < aptEndMin && slotEndMin > aptStartMin;
      });

      if (!blocked) {
        slots.push(slotStart);
      }
    }
  }

  return [...new Set(slots)].sort(
    (a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b),
  );
}

export function calculateEndAt(startAt: Date, durationMin: number): Date {
  return addMinutesToDate(startAt, durationMin);
}

export function availabilityRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);
  return aStart < bEnd && aEnd > bStart;
}
