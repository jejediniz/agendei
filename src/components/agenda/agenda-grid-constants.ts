import type { DayOfWeek } from "@prisma/client";
import type { AppointmentWithRelations } from "@/lib/queries/appointments";
import { parseTimeToMinutes } from "@/lib/utils/date";
import { minutesFromDateInTimezone } from "@/lib/utils/date";

export const AGENDA_SLOT_MINUTES = 30;
export const AGENDA_SLOT_HEIGHT_PX = 36;
export const AGENDA_COLUMN_WIDTH_PX = 112;
export const AGENDA_TIME_GUTTER_WIDTH_PX = 52;

export const AGENDA_GRID_DEFAULT_START_HOUR = 7;
export const AGENDA_GRID_DEFAULT_END_HOUR = 21;

type AvailabilityWindow = {
  startTime: string;
  endTime: string;
  dayOfWeek: DayOfWeek;
};

export function resolveAgendaGridHours(
  appointments: AppointmentWithRelations[],
  availabilities: AvailabilityWindow[],
  dayOfWeek: DayOfWeek,
) {
  let minHour = AGENDA_GRID_DEFAULT_START_HOUR;
  let maxHour = AGENDA_GRID_DEFAULT_END_HOUR;

  const dayAvail = availabilities.filter((a) => a.dayOfWeek === dayOfWeek);
  for (const av of dayAvail) {
    const startH = Math.floor(parseTimeToMinutes(av.startTime) / 60);
    const endH = Math.ceil(parseTimeToMinutes(av.endTime) / 60);
    minHour = Math.min(minHour, startH);
    maxHour = Math.max(maxHour, endH);
  }

  for (const apt of appointments) {
    const startH = Math.floor(minutesFromDateInTimezone(new Date(apt.startAt)) / 60);
    const endH = Math.ceil(minutesFromDateInTimezone(new Date(apt.endAt)) / 60);
    minHour = Math.min(minHour, startH);
    maxHour = Math.max(maxHour, endH);
  }

  minHour = Math.max(0, minHour - 1);
  maxHour = Math.min(24, maxHour + 1);

  return { startHour: minHour, endHour: maxHour };
}

export function getAgendaGridMetrics(startHour: number, endHour: number) {
  const gridStartMinutes = startHour * 60;
  const gridEndMinutes = endHour * 60;
  const totalSlots = (gridEndMinutes - gridStartMinutes) / AGENDA_SLOT_MINUTES;
  const gridHeight = totalSlots * AGENDA_SLOT_HEIGHT_PX;
  return { gridStartMinutes, gridEndMinutes, totalSlots, gridHeight, startHour, endHour };
}

export function slotTopFromMinutes(minutes: number, gridStartMinutes: number) {
  return ((minutes - gridStartMinutes) / AGENDA_SLOT_MINUTES) * AGENDA_SLOT_HEIGHT_PX;
}
