"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validations/service";
import type { ActionResult } from "./clients";

export async function createService(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const service = await prisma.service.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      durationMin: parsed.data.durationMin,
      price: parsed.data.price,
      active: parsed.data.active,
    },
  });

  revalidatePath("/servicos");
  return { success: true, id: service.id };
}

export async function updateService(
  id: string,
  data: unknown,
): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  await prisma.service.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      durationMin: parsed.data.durationMin,
      price: parsed.data.price,
      active: parsed.data.active,
    },
  });

  revalidatePath("/servicos");
  revalidatePath(`/servicos/${id}/editar`);
  return { success: true };
}

export async function toggleServiceActive(id: string): Promise<ActionResult> {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    return { success: false, error: "Serviço não encontrado." };
  }

  await prisma.service.update({
    where: { id },
    data: { active: !service.active },
  });

  revalidatePath("/servicos");
  return { success: true };
}
