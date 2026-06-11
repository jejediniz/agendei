"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { availabilitySchema } from "@/lib/validations/availability";
import { availabilityRangesOverlap } from "@/lib/utils/appointments";
import type { ActionResult } from "./clients";

export async function createAvailability(
  data: unknown,
): Promise<ActionResult & { id?: string }> {
  const parsed = availabilitySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
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
  return { success: true, id: availability.id };
}

export async function toggleAvailabilityActive(
  id: string,
): Promise<ActionResult> {
  const availability = await prisma.availability.findUnique({ where: { id } });
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
  await prisma.availability.delete({ where: { id } });
  revalidatePath("/horarios");
  return { success: true };
}
