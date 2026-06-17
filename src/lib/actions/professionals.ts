"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionContext } from "@/lib/tenant/context";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { professionalSchema } from "@/lib/validations/professional";
import type { ActionResult } from "./clients";

export async function createProfessional(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const { organizationId } = await requireSessionContext();
  const parsed = professionalSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const professional = await prisma.professional.create({
    data: {
      organizationId,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      specialty: parsed.data.specialty || null,
      active: parsed.data.active,
    },
  });

  revalidatePath("/profissionais");
  revalidatePath("/onboarding");
  return { success: true, id: professional.id };
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

  await prisma.professional.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      specialty: parsed.data.specialty || null,
      active: parsed.data.active,
    },
  });

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
