import type { Appointment, AppointmentStatus } from "@prisma/client";
import {
  addMinutesToDate,
  minutesFromDateInTimezone,
  parseTimeToMinutes,
  minutesToTime,
} from "./date";

export const BLOCKING_STATUSES: AppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
];

// Mesmo teto validado em `serviceSchema.bufferMin` — usado para limitar a
// janela de busca de conflitos ao considerar o buffer de outros agendamentos.
export const MAX_BUFFER_MIN = 180;

const OVERLAP_CONSTRAINT_NAME = "appointment_no_overlap";

/**
 * Rede de segurança final: a checagem de conflito em nível de app pode falhar
 * sob concorrência (duas requisições passam pelo findFirst antes de qualquer
 * create/update comitar). A exclusion constraint do Postgres (ver
 * prisma/sql/appointment-no-overlap.sql) barra isso no banco. Esse erro chega
 * como PrismaClientUnknownRequestError (sem `code`/`meta` estruturado, ao
 * contrário de violação de unique constraint), por isso a detecção é pelo
 * nome da constraint na mensagem.
 */
export function isOverlapConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Error && error.message.includes(OVERLAP_CONSTRAINT_NAME)
  );
}

/**
 * Inserções verdadeiramente simultâneas na mesma constraint GiST podem
 * terminar em deadlock (40P01) em vez de violação de exclusão — é um
 * comportamento documentado do Postgres, não um bug. Com 3+ tentativas
 * concorrentes pelo mesmo horário, as sobreviventes de um deadlock podem
 * colidir de novo entre si; por isso repetimos algumas vezes com um
 * pequeno atraso aleatório (jitter) para desincronizá-las, em vez de uma
 * única retentativa imediata.
 */
export function isDeadlockError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("deadlock detected");
}

const MAX_OVERLAP_GUARD_ATTEMPTS = 8;

export async function runWithOverlapGuard<T>(
  run: () => Promise<T>,
): Promise<{ success: true; value: T } | { success: false }> {
  for (let attempt = 0; attempt < MAX_OVERLAP_GUARD_ATTEMPTS; attempt++) {
    try {
      return { success: true, value: await run() };
    } catch (error) {
      const isLastAttempt = attempt === MAX_OVERLAP_GUARD_ATTEMPTS - 1;
      if (isDeadlockError(error) && !isLastAttempt) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 250),
        );
        continue;
      }
      if (
        isOverlapConstraintViolation(error) ||
        isDeadlockError(error) ||
        (error instanceof Error && error.message === "SLOT_TAKEN")
      ) {
        return { success: false };
      }
      throw error;
    }
  }
  return { success: false };
}

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
  bufferMin?: number;
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
        // O buffer é o intervalo mínimo que o profissional precisa depois
        // desse atendimento — estende o fim bloqueado, não o início.
        const aptEndMin =
          minutesFromDateInTimezone(apt.endAt) + (apt.bufferMin ?? 0);
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

export function isWithinAvailability(
  availabilities: AvailabilitySlot[],
  startMinutes: number,
  durationMin: number,
): boolean {
  const endMinutes = startMinutes + durationMin;
  return availabilities.some(
    (av) =>
      startMinutes >= parseTimeToMinutes(av.startTime) &&
      endMinutes <= parseTimeToMinutes(av.endTime),
  );
}

type BufferedCandidate = {
  startAt: Date;
  endAt: Date;
  service: { bufferMin: number };
};

/** Mesma lógica de conflito com buffer usada na criação e na remarcação. */
export function findBufferedConflict(
  candidates: BufferedCandidate[],
  startAt: Date,
  endAt: Date,
): boolean {
  return candidates.some((apt) => {
    const bufferedEnd = calculateEndAt(apt.endAt, apt.service.bufferMin);
    return startAt < bufferedEnd && endAt > apt.startAt;
  });
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
