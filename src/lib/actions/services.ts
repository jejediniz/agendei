"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionContext } from "@/lib/tenant/context";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { serviceSchema } from "@/lib/validations/service";
import type { ActionResult } from "./clients";

export async function createService(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const { organizationId } = await requireSessionContext();
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const service = await prisma.service.create({
    data: {
      organizationId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      durationMin: parsed.data.durationMin,
      bufferMin: parsed.data.bufferMin,
      price: parsed.data.price,
      active: parsed.data.active,
    },
  });

  revalidatePath("/servicos");
  revalidatePath("/onboarding");
  return { success: true, id: service.id };
}

export async function updateService(
  id: string,
  data: unknown,
): Promise<ActionResult> {
  const { organizationId } = await requireSessionContext();
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existing = await prisma.service.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });
  if (!existing) {
    return { success: false, error: "Serviço não encontrado." };
  }

  await prisma.service.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      durationMin: parsed.data.durationMin,
      bufferMin: parsed.data.bufferMin,
      price: parsed.data.price,
      active: parsed.data.active,
    },
  });

  revalidatePath("/servicos");
  revalidatePath(`/servicos/${id}/editar`);
  return { success: true };
}

export async function toggleServiceActive(id: string): Promise<ActionResult> {
  const { organizationId } = await requireSessionContext();
  const service = await prisma.service.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });
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
