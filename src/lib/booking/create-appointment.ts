import { AppointmentStatus } from "@prisma/client";
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

export type CreateAppointmentInput = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
};

export type CreateAppointmentResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createAppointmentForOrganization(
  organizationId: string,
  data: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const service = await prisma.service.findFirst({
    where: { id: data.serviceId, active: true, ...orgWhere(organizationId) },
  });
  const professional = await prisma.professional.findFirst({
    where: { id: data.professionalId, active: true, ...orgWhere(organizationId) },
  });
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, ...orgWhere(organizationId) },
  });

  if (!service || !professional || !client) {
    return { success: false, error: "Dados inválidos para agendamento." };
  }

  // Profissional com vínculos só atende os serviços vinculados
  // (sem vínculos = atende todos, retrocompatível).
  const serviceLinkCount = await prisma.professionalService.count({
    where: { professionalId: data.professionalId },
  });
  if (serviceLinkCount > 0) {
    const offersService = await prisma.professionalService.findUnique({
      where: {
        professionalId_serviceId: {
          professionalId: data.professionalId,
          serviceId: data.serviceId,
        },
      },
    });
    if (!offersService) {
      return {
        success: false,
        error: "Este profissional não realiza o serviço selecionado.",
      };
    }
  }

  const startAt = combineDateAndTime(data.date, data.time);
  const endAt = calculateEndAt(startAt, service.durationMin);

  if (startAt <= new Date()) {
    return { success: false, error: "Não é possível agendar no passado." };
  }

  const dayOfWeek = getDayOfWeek(startAt);
  const availabilities = await prisma.availability.findMany({
    where: {
      professionalId: data.professionalId,
      dayOfWeek,
      active: true,
    },
  });

  const startMinutes = parseTimeToMinutes(data.time);
  const withinAvailability = isWithinAvailability(
    availabilities,
    startMinutes,
    service.durationMin,
  );

  if (!withinAvailability) {
    return {
      success: false,
      error: "Horário fora da disponibilidade do profissional.",
    };
  }

  const result = await runWithOverlapGuard(() =>
    prisma.$transaction(async (tx) => {
      // Janela alargada pelo teto de buffer (MAX_BUFFER_MIN) porque o
      // agendamento anterior pode reservar minutos extras depois do seu
      // próprio horário — sem isso, um `endAt` cru "livre" esconderia um
      // conflito real gerado pelo buffer do serviço anterior.
      const candidates = await tx.appointment.findMany({
        where: {
          organizationId,
          professionalId: data.professionalId,
          status: { in: BLOCKING_STATUSES },
          startAt: { lt: endAt },
          endAt: { gt: addMinutesToDate(startAt, -MAX_BUFFER_MIN) },
        },
        include: { service: { select: { bufferMin: true } } },
      });

      if (findBufferedConflict(candidates, startAt, endAt)) {
        throw new Error("SLOT_TAKEN");
      }

      return tx.appointment.create({
        data: {
          organizationId,
          clientId: data.clientId,
          professionalId: data.professionalId,
          serviceId: data.serviceId,
          startAt,
          endAt,
          notes: data.notes || null,
          status: AppointmentStatus.SCHEDULED,
        },
      });
    }),
  );

  if (!result.success) {
    return {
      success: false,
      error: "Este horário já está ocupado para o profissional selecionado.",
    };
  }
  return { success: true, id: result.value.id };
}
