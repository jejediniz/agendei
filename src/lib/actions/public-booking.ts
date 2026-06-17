"use server";

import { revalidatePath } from "next/cache";
import { AccountType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { createAppointmentForOrganization } from "@/lib/booking/create-appointment";
import { fetchAvailableSlots } from "@/lib/booking/slots";
import {
  getOrganizationBySlug,
  isBookingOpen,
} from "@/lib/queries/public-booking";
import { prisma } from "@/lib/prisma";
import { phonesMatch } from "@/lib/utils/phone";
import {
  publicBookingSchema,
  publicSlotsSchema,
} from "@/lib/validations/public-booking";

export type PublicActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

async function resolveOrganization(slug: string) {
  const organization = await getOrganizationBySlug(slug);
  if (!organization) {
    return { error: "Estabelecimento não encontrado." as const };
  }
  if (!isBookingOpen(organization.subscriptionStatus)) {
    return { error: "Agendamento online indisponível no momento." as const };
  }
  return { organization };
}

export async function getPublicAvailableSlots(
  slug: string,
  professionalId: string,
  serviceId: string,
  date: string,
): Promise<{ slots: string[]; error?: string }> {
  const parsed = publicSlotsSchema.safeParse({
    slug,
    professionalId,
    serviceId,
    date,
  });
  if (!parsed.success) {
    return { slots: [], error: parsed.error.issues[0]?.message };
  }

  const resolved = await resolveOrganization(parsed.data.slug);
  if ("error" in resolved) {
    return { slots: [], error: resolved.error };
  }

  return fetchAvailableSlots(
    resolved.organization.id,
    parsed.data.professionalId,
    parsed.data.serviceId,
    parsed.data.date,
  );
}

export async function createPublicBooking(
  data: unknown,
): Promise<PublicActionResult> {
  const parsed = publicBookingSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const resolved = await resolveOrganization(parsed.data.slug);
  if ("error" in resolved) {
    return { success: false, error: resolved.error };
  }

  const { organization } = resolved;
  const phone = parsed.data.clientPhone.trim();
  const clientEmail = parsed.data.clientEmail?.trim() || undefined;
  const session = await auth();
  const isCustomer =
    session?.user?.accountType === AccountType.CUSTOMER && session.user.id;
  const customerUserId = isCustomer ? session.user.id : undefined;
  const customerEmail = isCustomer
    ? (session.user.email ?? undefined)
    : clientEmail;

  if (!isCustomer && !clientEmail) {
    return {
      success: false,
      error: "Informe seu e-mail para acompanhar o agendamento depois.",
    };
  }

  const orgClients = await prisma.client.findMany({
    where: { organizationId: organization.id },
  });

  let client = orgClients.find((c) => {
    if (customerUserId && c.userId === customerUserId) return true;
    if (phonesMatch(c.phone, phone)) return true;
    if (
      customerEmail &&
      c.email &&
      c.email.toLowerCase() === customerEmail.toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  if (client?.userId && customerUserId && client.userId !== customerUserId) {
    return {
      success: false,
      error: "Este telefone já está vinculado a outra conta de cliente.",
    };
  }

  if (client) {
    const canUpdateName = !client.userId || !!customerUserId;
    client = await prisma.client.update({
      where: { id: client.id },
      data: {
        ...(canUpdateName ? { name: parsed.data.clientName.trim() } : {}),
        phone,
        email: customerEmail ?? client.email,
        userId: customerUserId ?? client.userId,
        notes: parsed.data.notes || client.notes,
      },
    });
  } else {
    client = await prisma.client.create({
      data: {
        organizationId: organization.id,
        name: parsed.data.clientName.trim(),
        phone,
        email: customerEmail ?? null,
        userId: customerUserId ?? null,
        notes: parsed.data.notes || null,
      },
    });
  }

  // Garante vínculo imediato para clientes logados
  if (customerUserId && !client.userId) {
    client = await prisma.client.update({
      where: { id: client.id },
      data: { userId: customerUserId },
    });
  }

  const result = await createAppointmentForOrganization(organization.id, {
    clientId: client.id,
    professionalId: parsed.data.professionalId,
    serviceId: parsed.data.serviceId,
    date: parsed.data.date,
    time: parsed.data.time,
    notes: parsed.data.notes,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(`/${organization.slug}`);
  revalidatePath(`/${organization.slug}/meus-agendamentos`);
  revalidatePath("/agendamentos");
  revalidatePath("/agenda");
  revalidatePath("/");

  return { success: true, id: result.id };
}
