import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import {
  BLOCKING_STATUSES,
  calculateEndAt,
  generateAvailableSlots,
} from "@/lib/utils/appointments";
import {
  combineDateAndTime,
  getDayOfWeek,
  getDayRange,
  minutesFromDateInTimezone,
  parseTimeToMinutes,
} from "@/lib/utils/date";

export async function fetchAvailableSlots(
  organizationId: string,
  professionalId: string,
  serviceId: string,
  date: string,
): Promise<{ slots: string[]; error?: string }> {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true, ...orgWhere(organizationId) },
  });
  if (!service) {
    return { slots: [], error: "Serviço não encontrado." };
  }

  const professional = await prisma.professional.findFirst({
    where: { id: professionalId, active: true, ...orgWhere(organizationId) },
  });
  if (!professional) {
    return { slots: [], error: "Profissional não encontrado." };
  }

  // Profissional com vínculos só atende os serviços vinculados
  // (sem vínculos = atende todos, retrocompatível).
  const serviceLinkCount = await prisma.professionalService.count({
    where: { professionalId },
  });
  if (serviceLinkCount > 0) {
    const offersService = await prisma.professionalService.findUnique({
      where: { professionalId_serviceId: { professionalId, serviceId } },
    });
    if (!offersService) {
      return { slots: [], error: "Profissional não realiza este serviço." };
    }
  }

  const dayOfWeek = getDayOfWeek(combineDateAndTime(date, "12:00"));
  const availabilities = await prisma.availability.findMany({
    where: { professionalId, dayOfWeek, active: true },
  });

  if (availabilities.length === 0) {
    return { slots: [], error: "Profissional sem horário disponível neste dia." };
  }

  const { start: dayStart, end: dayEnd } = getDayRange(date);

  const appointments = await prisma.appointment.findMany({
    where: {
      organizationId,
      professionalId,
      startAt: { gte: dayStart, lte: dayEnd },
      status: { in: BLOCKING_STATUSES },
    },
  });

  const slots = generateAvailableSlots(
    availabilities,
    appointments,
    service.durationMin,
  ).filter((slot) => {
    const startAt = combineDateAndTime(date, slot);
    const endAt = calculateEndAt(startAt, service.durationMin);
    const endMinutes = minutesFromDateInTimezone(endAt);
    return availabilities.some((av) => {
      const avEnd = parseTimeToMinutes(av.endTime);
      const slotStart = parseTimeToMinutes(slot);
      return slotStart >= parseTimeToMinutes(av.startTime) && endMinutes <= avEnd;
    });
  });

  const now = new Date();
  const futureSlots = slots.filter((slot) => {
    const startAt = combineDateAndTime(date, slot);
    return startAt > now;
  });

  return { slots: futureSlots };
}
