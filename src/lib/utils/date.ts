import { format, parseISO, startOfDay, endOfDay, addMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import type { DayOfWeek } from "@prisma/client";

export const TIMEZONE = "America/Sao_Paulo";

const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
};

export const DAY_OF_WEEK_OPTIONS = Object.entries(DAY_OF_WEEK_LABELS).map(
  ([value, label]) => ({ value: value as DayOfWeek, label }),
);

export function getDayOfWeek(date: Date): DayOfWeek {
  const zoned = toZonedTime(date, TIMEZONE);
  return DAY_OF_WEEK_MAP[zoned.getDay()];
}

export function formatDate(date: Date | string, pattern = "dd/MM/yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(toZonedTime(d, TIMEZONE), pattern, { locale: ptBR });
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(toZonedTime(d, TIMEZONE), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });
}

export function formatTime(date: Date | string) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(toZonedTime(d, TIMEZONE), "HH:mm", { locale: ptBR });
}

export function getTodayRange() {
  const now = toZonedTime(new Date(), TIMEZONE);
  const start = fromZonedTime(startOfDay(now), TIMEZONE);
  const end = fromZonedTime(endOfDay(now), TIMEZONE);
  return { start, end };
}

export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const local = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return fromZonedTime(local, TIMEZONE);
}

export function addMinutesToDate(date: Date, minutes: number) {
  return addMinutes(date, minutes);
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function toDateInputValue(date: Date): string {
  return format(toZonedTime(date, TIMEZONE), "yyyy-MM-dd");
}

export function getDayRange(dateStr: string) {
  const start = combineDateAndTime(dateStr, "00:00");
  const [year, month, day] = dateStr.split("-").map(Number);
  const localEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
  const end = fromZonedTime(localEnd, TIMEZONE);
  return { start, end };
}

export function minutesFromDateInTimezone(date: Date): number {
  const zoned = toZonedTime(date, TIMEZONE);
  return zoned.getHours() * 60 + zoned.getMinutes();
}
