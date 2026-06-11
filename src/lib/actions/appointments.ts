"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  appointmentSchema,
  appointmentStatusSchema,
} from "@/lib/validations/appointment";
import {
  BLOCKING_STATUSES,
  calculateEndAt,
  generateAvailableSlots,
} from "@/lib/utils/appointments";
import {
  combineDateAndTime,
  getDayOfWeek,
  parseTimeToMinutes,
} from "@/lib/utils/date";
import type { ActionResult } from "./clients";

export async function getAvailableSlots(
  professionalId: string,
  serviceId: string,
  date: string,
): Promise<{ slots: string[]; error?: string }> {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });
  if (!service) {
    return { slots: [], error: "Serviço não encontrado." };
  }

  const dayOfWeek = getDayOfWeek(new Date(date + "T12:00:00"));
  const availabilities = await prisma.availability.findMany({
    where: { professionalId, dayOfWeek, active: true },
  });

  if (availabilities.length === 0) {
    return { slots: [], error: "Profissional sem horário disponível neste dia." };
  }

  const dayStart = combineDateAndTime(date, "00:00");
  const dayEnd = combineDateAndTime(date, "23:59");

  const appointments = await prisma.appointment.findMany({
    where: {
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
    const endMinutes = parseTimeToMinutes(
      `${endAt.getHours().toString().padStart(2, "0")}:${endAt.getMinutes().toString().padStart(2, "0")}`,
    );
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

export async function createAppointment(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const service = await prisma.service.findFirst({
    where: { id: parsed.data.serviceId, active: true },
  });
  const professional = await prisma.professional.findFirst({
    where: { id: parsed.data.professionalId, active: true },
  });

  if (!service || !professional) {
    return { success: false, error: "Serviço ou profissional inválido." };
  }

  const startAt = combineDateAndTime(parsed.data.date, parsed.data.time);
  const endAt = calculateEndAt(startAt, service.durationMin);

  if (startAt <= new Date()) {
    return { success: false, error: "Não é possível agendar no passado." };
  }

  const dayOfWeek = getDayOfWeek(startAt);
  const availabilities = await prisma.availability.findMany({
    where: {
      professionalId: parsed.data.professionalId,
      dayOfWeek,
      active: true,
    },
  });

  const startMinutes = parseTimeToMinutes(parsed.data.time);
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

  const conflicting = await prisma.appointment.findMany({
    where: {
      professionalId: parsed.data.professionalId,
      status: { in: BLOCKING_STATUSES },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (conflicting.length > 0) {
    return {
      success: false,
      error: "Este horário já está ocupado para o profissional selecionado.",
    };
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientId: parsed.data.clientId,
      professionalId: parsed.data.professionalId,
      serviceId: parsed.data.serviceId,
      startAt,
      endAt,
      notes: parsed.data.notes || null,
      status: AppointmentStatus.SCHEDULED,
    },
  });

  revalidatePath("/agendamentos");
  revalidatePath("/agenda");
  revalidatePath("/");
  return { success: true, id: appointment.id };
}

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  SCHEDULED: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  CONFIRMED: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<ActionResult> {
  const parsedStatus = appointmentStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, error: "Status inválido." };
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  const allowed = VALID_TRANSITIONS[appointment.status];
  if (!allowed.includes(parsedStatus.data)) {
    return { success: false, error: "Transição de status não permitida." };
  }

  if (
    parsedStatus.data === AppointmentStatus.CONFIRMED &&
    appointment.status === AppointmentStatus.SCHEDULED
  ) {
    const conflicting = await prisma.appointment.findMany({
      where: {
        id: { not: id },
        professionalId: appointment.professionalId,
        status: { in: BLOCKING_STATUSES },
        startAt: { lt: appointment.endAt },
        endAt: { gt: appointment.startAt },
      },
    });

    if (conflicting.length > 0) {
      return {
        success: false,
        error: "Conflito de horário detectado.",
      };
    }
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: parsedStatus.data },
  });

  revalidatePath("/agendamentos");
  revalidatePath("/agenda");
  revalidatePath("/");
  return { success: true };
}
