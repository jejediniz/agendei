"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import { requireCustomerSession } from "@/lib/tenant/customer-context";
import {
  getCustomerAppointmentById,
  isCancellableStatus,
} from "@/lib/queries/customer-appointments";
import { getOrganizationBySlug } from "@/lib/queries/public-booking";
import { rescheduleAppointmentForOrganization } from "@/lib/booking/reschedule-appointment";
import { rescheduleAppointmentSchema } from "@/lib/validations/public-booking";
import { prisma } from "@/lib/prisma";

export type CustomerActionResult = {
  success: boolean;
  error?: string;
};

export async function cancelCustomerAppointment(
  slug: string,
  appointmentId: string,
): Promise<CustomerActionResult> {
  let customer;
  try {
    customer = await requireCustomerSession();
  } catch {
    return { success: false, error: "Faça login para cancelar agendamentos." };
  }

  const organization = await getOrganizationBySlug(slug);
  if (!organization) {
    return { success: false, error: "Estabelecimento não encontrado." };
  }

  const appointment = await getCustomerAppointmentById(
    organization.id,
    customer.userId,
    appointmentId,
  );

  if (!appointment) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  if (!isCancellableStatus(appointment.status)) {
    return { success: false, error: "Este agendamento não pode ser cancelado." };
  }

  if (appointment.startAt <= new Date()) {
    return { success: false, error: "Não é possível cancelar agendamentos passados." };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: AppointmentStatus.CANCELLED },
  });

  revalidatePath(`/${slug}/meus-agendamentos`);
  revalidatePath(`/${slug}`);
  revalidatePath("/agendamentos");
  revalidatePath("/agenda");

  return { success: true };
}

export async function rescheduleCustomerAppointment(
  slug: string,
  data: unknown,
): Promise<CustomerActionResult> {
  let customer;
  try {
    customer = await requireCustomerSession();
  } catch {
    return { success: false, error: "Faça login para remarcar agendamentos." };
  }

  const parsed = rescheduleAppointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const organization = await getOrganizationBySlug(slug);
  if (!organization) {
    return { success: false, error: "Estabelecimento não encontrado." };
  }

  const appointment = await getCustomerAppointmentById(
    organization.id,
    customer.userId,
    parsed.data.appointmentId,
  );

  if (!appointment) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  if (!isCancellableStatus(appointment.status)) {
    return { success: false, error: "Este agendamento não pode ser remarcado." };
  }

  if (appointment.startAt <= new Date()) {
    return { success: false, error: "Não é possível remarcar agendamentos passados." };
  }

  const result = await rescheduleAppointmentForOrganization(organization.id, {
    appointmentId: appointment.id,
    date: parsed.data.date,
    time: parsed.data.time,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(`/${slug}/meus-agendamentos`);
  revalidatePath(`/${slug}`);
  revalidatePath("/agendamentos");
  revalidatePath("/agenda");

  return { success: true };
}
