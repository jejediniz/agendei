"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSessionContext } from "@/lib/tenant/context";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { createAppointmentForOrganization } from "@/lib/booking/create-appointment";
import { fetchAvailableSlots } from "@/lib/booking/slots";
import {
  appointmentSchema,
  appointmentStatusSchema,
} from "@/lib/validations/appointment";
import { BLOCKING_STATUSES } from "@/lib/utils/appointments";
import type { ActionResult } from "./clients";

export async function getAvailableSlots(
  professionalId: string,
  serviceId: string,
  date: string,
): Promise<{ slots: string[]; error?: string }> {
  const { organizationId } = await requireSessionContext();
  return fetchAvailableSlots(organizationId, professionalId, serviceId, date);
}

export async function createAppointment(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const { organizationId } = await requireSessionContext();
  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const result = await createAppointmentForOrganization(organizationId, {
    clientId: parsed.data.clientId,
    professionalId: parsed.data.professionalId,
    serviceId: parsed.data.serviceId,
    date: parsed.data.date,
    time: parsed.data.time,
    notes: parsed.data.notes,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/agendamentos");
  revalidatePath("/agenda");
  revalidatePath("/");
  return { success: true, id: result.id };
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
  const { organizationId } = await requireSessionContext();
  const parsedStatus = appointmentStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, error: "Status inválido." };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });
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
        organizationId,
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
