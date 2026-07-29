"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionContext } from "@/lib/tenant/context";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { professionalSchema } from "@/lib/validations/professional";
import type { Prisma } from "@prisma/client";
import type { ActionResult } from "./clients";

/**
 * Substitui os vínculos profissional↔serviço, validando que todos os
 * serviços pertencem à organização. Lança "INVALID_SERVICE" se algum não for.
 */
async function syncProfessionalServices(
  tx: Prisma.TransactionClient,
  organizationId: string,
  professionalId: string,
  serviceIds: string[],
) {
  const uniqueIds = [...new Set(serviceIds)];
  if (uniqueIds.length > 0) {
    const count = await tx.service.count({
      where: { id: { in: uniqueIds }, ...orgWhere(organizationId) },
    });
    if (count !== uniqueIds.length) {
      throw new Error("INVALID_SERVICE");
    }
  }

  await tx.professionalService.deleteMany({ where: { professionalId } });
  if (uniqueIds.length > 0) {
    await tx.professionalService.createMany({
      data: uniqueIds.map((serviceId) => ({ professionalId, serviceId })),
    });
  }
}

export async function createProfessional(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const { organizationId } = await requireSessionContext();
  const parsed = professionalSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const professional = await prisma.$transaction(async (tx) => {
      const created = await tx.professional.create({
        data: {
          organizationId,
          name: parsed.data.name,
          phone: parsed.data.phone || null,
          email: parsed.data.email || null,
          specialty: parsed.data.specialty || null,
          active: parsed.data.active,
        },
      });
      await syncProfessionalServices(
        tx,
        organizationId,
        created.id,
        parsed.data.serviceIds ?? [],
      );
      return created;
    });

    revalidatePath("/profissionais");
    revalidatePath("/onboarding");
    return { success: true, id: professional.id };
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_SERVICE") {
      return { success: false, error: "Serviço inválido selecionado." };
    }
    throw error;
  }
}

export async function updateProfessional(
  id: string,
  data: unknown,
): Promise<ActionResult> {
  const { organizationId } = await requireSessionContext();
  const parsed = professionalSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existing = await prisma.professional.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });
  if (!existing) {
    return { success: false, error: "Profissional não encontrado." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.professional.update({
        where: { id },
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone || null,
          email: parsed.data.email || null,
          specialty: parsed.data.specialty || null,
          active: parsed.data.active,
        },
      });
      await syncProfessionalServices(
        tx,
        organizationId,
        id,
        parsed.data.serviceIds ?? [],
      );
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_SERVICE") {
      return { success: false, error: "Serviço inválido selecionado." };
    }
    throw error;
  }

  revalidatePath("/profissionais");
  revalidatePath(`/profissionais/${id}/editar`);
  revalidatePath("/horarios");
  return { success: true };
}

export async function toggleProfessionalActive(
  id: string,
): Promise<ActionResult> {
  const { organizationId } = await requireSessionContext();
  const professional = await prisma.professional.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });
  if (!professional) {
    return { success: false, error: "Profissional não encontrado." };
  }

  await prisma.professional.update({
    where: { id },
    data: { active: !professional.active },
  });

  revalidatePath("/profissionais");
  return { success: true };
}
