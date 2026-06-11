"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { professionalSchema } from "@/lib/validations/professional";
import type { ActionResult } from "./clients";

export async function createProfessional(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const parsed = professionalSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const professional = await prisma.professional.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      specialty: parsed.data.specialty || null,
      active: parsed.data.active,
    },
  });

  revalidatePath("/profissionais");
  return { success: true, id: professional.id };
}

export async function updateProfessional(
  id: string,
  data: unknown,
): Promise<ActionResult> {
  const parsed = professionalSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
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
  const professional = await prisma.professional.findUnique({ where: { id } });
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
