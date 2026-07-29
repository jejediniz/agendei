import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { BLOCKING_STATUSES, calculateEndAt } from "@/lib/utils/appointments";
import {
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
  const endTimeStr = `${Math.floor((startMinutes + service.durationMin) / 60)
    .toString()
    .padStart(2, "0")}:${((startMinutes + service.durationMin) % 60)
    .toString()
    .padStart(2, "0")}`;

  const withinAvailability = availabilities.some((av) => {
    return (
      startMinutes >= parseTimeToMinutes(av.startTime) &&
      parseTimeToMinutes(endTimeStr) <= parseTimeToMinutes(av.endTime)
    );
  });

  if (!withinAvailability) {
    return {
      success: false,
      error: "Horário fora da disponibilidade do profissional.",
    };
  }

  try {
    const appointment = await prisma.$transaction(async (tx) => {
      const conflicting = await tx.appointment.findFirst({
        where: {
          organizationId,
          professionalId: data.professionalId,
          status: { in: BLOCKING_STATUSES },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      });

      if (conflicting) {
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
    });

    return { success: true, id: appointment.id };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return {
        success: false,
        error: "Este horário já está ocupado para o profissional selecionado.",
      };
    }
    throw error;
  }
}
