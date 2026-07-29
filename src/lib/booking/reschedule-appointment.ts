import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import {
  BLOCKING_STATUSES,
  MAX_BUFFER_MIN,
  calculateEndAt,
  findBufferedConflict,
  isWithinAvailability,
  runWithOverlapGuard,
} from "@/lib/utils/appointments";
import {
  addMinutesToDate,
  combineDateAndTime,
  getDayOfWeek,
  parseTimeToMinutes,
} from "@/lib/utils/date";

export type RescheduleAppointmentInput = {
  appointmentId: string;
  date: string;
  time: string;
};

export type RescheduleAppointmentResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Move um agendamento existente para outra data/horário com o mesmo
 * profissional e serviço (atualiza a mesma linha, sem cancelar+criar).
 */
export async function rescheduleAppointmentForOrganization(
  organizationId: string,
  data: RescheduleAppointmentInput,
): Promise<RescheduleAppointmentResult> {
  const appointment = await prisma.appointment.findFirst({
    where: { id: data.appointmentId, ...orgWhere(organizationId) },
    include: { service: true },
  });

  if (!appointment) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  const startAt = combineDateAndTime(data.date, data.time);
  const endAt = calculateEndAt(startAt, appointment.service.durationMin);

  if (startAt <= new Date()) {
    return { success: false, error: "Não é possível remarcar para o passado." };
  }

  const dayOfWeek = getDayOfWeek(startAt);
  const availabilities = await prisma.availability.findMany({
    where: {
      professionalId: appointment.professionalId,
      dayOfWeek,
      active: true,
    },
  });

  const startMinutes = parseTimeToMinutes(data.time);
  const withinAvailability = isWithinAvailability(
    availabilities,
    startMinutes,
    appointment.service.durationMin,
  );

  if (!withinAvailability) {
    return {
      success: false,
      error: "Horário fora da disponibilidade do profissional.",
    };
  }

  const result = await runWithOverlapGuard(() =>
    prisma.$transaction(async (tx) => {
      const candidates = await tx.appointment.findMany({
        where: {
          organizationId,
          professionalId: appointment.professionalId,
          id: { not: appointment.id },
          status: { in: BLOCKING_STATUSES },
          startAt: { lt: endAt },
          endAt: { gt: addMinutesToDate(startAt, -MAX_BUFFER_MIN) },
        },
        include: { service: { select: { bufferMin: true } } },
      });

      if (findBufferedConflict(candidates, startAt, endAt)) {
        throw new Error("SLOT_TAKEN");
      }

      return tx.appointment.update({
        where: { id: appointment.id },
        data: { startAt, endAt },
      });
    }),
  );

  if (!result.success) {
    return {
      success: false,
      error: "Este horário já está ocupado para o profissional selecionado.",
    };
  }
  return { success: true };
}
