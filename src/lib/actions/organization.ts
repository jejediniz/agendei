"use server";

import { revalidatePath } from "next/cache";
import { MemberRole, SubscriptionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  requirePlatformAdmin,
  requireSessionContext,
  requireSuperAdmin,
} from "@/lib/tenant/context";
import { createOrganizationSchema, updateOrganizationSchema } from "@/lib/validations/organization";
import { generateUniqueSlug, slugify } from "@/lib/utils/slug";
import { createAsaasCustomer } from "@/lib/billing/asaas";
import { computeTrialEndDate } from "@/lib/billing/subscription";
import type { ActionResult } from "./clients";

export async function createOrganizationForCurrentUser(
  data: unknown,
): Promise<ActionResult & { organizationId?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  if (session.user.organizationId) {
    return { success: false, error: "Você já tem um negócio cadastrado." };
  }

  const parsed = createOrganizationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existingMembership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (existingMembership) {
    return { success: false, error: "Você já tem um negócio cadastrado." };
  }

  const slug = parsed.data.slug || slugify(parsed.data.businessName);
  const uniqueSlug = await generateUniqueSlug(slug, async (candidate) => {
    const found = await prisma.organization.findUnique({
      where: { slug: candidate },
    });
    return !!found;
  });

  const trialEndsAt = computeTrialEndDate();

  const organization = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: parsed.data.businessName,
        slug: uniqueSlug,
        businessType: parsed.data.businessType,
        email: session.user.email ?? undefined,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt,
        onboardingStep: 0,
      },
    });

    await tx.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: session.user.id,
        role: MemberRole.SUPER_ADMIN,
      },
    });

    return org;
  });

  if (process.env.ASAAS_API_KEY) {
    try {
      const customer = await createAsaasCustomer({
        name: parsed.data.businessName,
        email: session.user.email ?? "",
        externalReference: organization.id,
      });
      await prisma.organization.update({
        where: { id: organization.id },
        data: { asaasCustomerId: customer.id },
      });
    } catch {
      // Asaas opcional em dev
    }
  }

  revalidatePath("/onboarding");
  return { success: true, organizationId: organization.id };
}

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
