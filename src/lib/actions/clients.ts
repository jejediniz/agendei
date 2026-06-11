"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";
import { BLOCKING_STATUSES } from "@/lib/utils/appointments";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createClient(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const client = await prisma.client.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      document: parsed.data.document || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/clientes");
  return { success: true, id: client.id };
}

export async function updateClient(
  id: string,
  data: unknown,
): Promise<ActionResult> {
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  await prisma.client.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      document: parsed.data.document || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}/editar`);
  return { success: true };
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const activeAppointments = await prisma.appointment.count({
    where: {
      clientId: id,
      status: { in: BLOCKING_STATUSES },
    },
  });

  if (activeAppointments > 0) {
    return {
      success: false,
      error:
        "Não é possível excluir cliente com agendamentos ativos (marcados ou confirmados).",
    };
  }

  await prisma.client.delete({ where: { id } });
  revalidatePath("/clientes");
  return { success: true };
}
