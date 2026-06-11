"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requirePlatformAdmin,
  requireSessionContext,
  requireSuperAdmin,
} from "@/lib/tenant/context";
import { updateOrganizationSchema } from "@/lib/validations/organization";
import type { ActionResult } from "./clients";

export async function updateOrganization(
  data: unknown,
): Promise<ActionResult> {
  const { organizationId } = await requireSuperAdmin();
  const parsed = updateOrganizationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      name: parsed.data.name,
      businessType: parsed.data.businessType,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  revalidatePath("/configuracoes/negocio");
  revalidatePath("/");
  return { success: true };
}

export async function advanceOnboardingStep(
  step: number,
): Promise<ActionResult> {
  const { organizationId } = await requireSessionContext();

  await prisma.organization.update({
    where: { id: organizationId },
    data: { onboardingStep: step },
  });

  revalidatePath("/onboarding");
  return { success: true };
}

export async function completeOnboarding(): Promise<ActionResult> {
  const { organizationId } = await requireSessionContext();

  const [servicesCount, professionalsCount] = await Promise.all([
    prisma.service.count({ where: { organizationId } }),
    prisma.professional.count({ where: { organizationId } }),
  ]);

  if (servicesCount === 0 || professionalsCount === 0) {
    return {
      success: false,
      error: "Cadastre pelo menos um serviço e um profissional para continuar.",
    };
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      onboardingCompletedAt: new Date(),
      onboardingStep: 4,
    },
  });

  revalidatePath("/onboarding");
  revalidatePath("/");
  return { success: true };
}

export async function extendTrial(
  organizationId: string,
  days: number,
): Promise<ActionResult> {
  await requirePlatformAdmin();
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!org) {
    return { success: false, error: "Organização não encontrada." };
  }

  const base = org.trialEndsAt ?? new Date();
  const newEnd = new Date(base);
  newEnd.setDate(newEnd.getDate() + days);

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      trialEndsAt: newEnd,
      subscriptionStatus: "TRIAL",
    },
  });

  revalidatePath("/platform");
  return { success: true };
}
