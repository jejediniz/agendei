"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionContext } from "@/lib/tenant/context";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { availabilitySchema } from "@/lib/validations/availability";
import { availabilityRangesOverlap } from "@/lib/utils/appointments";
import type { ActionResult } from "./clients";

export async function createAvailability(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const { organizationId } = await requireSessionContext();
  const parsed = availabilitySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const professional = await prisma.professional.findFirst({
    where: { id: parsed.data.professionalId, ...orgWhere(organizationId) },
  });
  if (!professional) {
    return { success: false, error: "Profissional não encontrado." };
  }

  const existing = await prisma.availability.findMany({
    where: {
      professionalId: parsed.data.professionalId,
      dayOfWeek: parsed.data.dayOfWeek,
      active: true,
    },
  });

  const hasOverlap = existing.some((item) =>
    availabilityRangesOverlap(
      parsed.data.startTime,
      parsed.data.endTime,
      item.startTime,
      item.endTime,
    ),
  );

  if (hasOverlap) {
    return {
      success: false,
      error: "Já existe um horário sobreposto para este dia.",
    };
  }

  const availability = await prisma.availability.create({
    data: parsed.data,
  });

  revalidatePath("/horarios");
  revalidatePath("/onboarding");
  return { success: true, id: availability.id };
}

export async function toggleAvailabilityActive(
  id: string,
): Promise<ActionResult> {
  const { organizationId } = await requireSessionContext();
  const availability = await prisma.availability.findFirst({
    where: {
      id,
      professional: orgWhere(organizationId),
    },
  });
  if (!availability) {
    return { success: false, error: "Horário não encontrado." };
  }

  await prisma.availability.update({
    where: { id },
    data: { active: !availability.active },
  });

  revalidatePath("/horarios");
  return { success: true };
}

export async function deleteAvailability(id: string): Promise<ActionResult> {
  const { organizationId } = await requireSessionContext();
  const availability = await prisma.availability.findFirst({
    where: {
      id,
      professional: orgWhere(organizationId),
    },
  });
  if (!availability) {
    return { success: false, error: "Horário não encontrado." };
  }

  await prisma.availability.delete({ where: { id } });
  revalidatePath("/horarios");
  return { success: true };
}
