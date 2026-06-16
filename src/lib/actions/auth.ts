"use server";

import bcrypt from "bcryptjs";
import { AccountType, MemberRole, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerOrganizationSchema } from "@/lib/validations/organization";
import { registerCustomerSchema } from "@/lib/validations/auth";
import { linkClientsToCustomerByEmail } from "@/lib/customer/link-clients";
import {
  BUSINESS_ON_CUSTOMER_ERROR,
  CUSTOMER_ON_BUSINESS_ERROR,
  isBusinessAccount,
  isCustomerAccount,
} from "@/lib/auth/account-guards";
import { generateUniqueSlug, slugify } from "@/lib/utils/slug";
import { createAsaasCustomer } from "@/lib/billing/asaas";
import { computeTrialEndDate } from "@/lib/billing/subscription";
import type { ActionResult } from "./clients";

export async function registerCustomer(
  data: unknown,
): Promise<ActionResult> {
  const parsed = registerCustomerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { memberships: { take: 1 } },
  });

  if (existingUser && isBusinessAccount(existingUser)) {
    return {
      success: false,
      error: BUSINESS_ON_CUSTOMER_ERROR,
    };
  }

  if (existingUser) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      accountType: AccountType.CUSTOMER,
    },
  });

  await linkClientsToCustomerByEmail(user.id, parsed.data.email);

  return { success: true };
}

export async function registerOrganization(
  data: unknown,
): Promise<ActionResult & { organizationId?: string }> {
  const parsed = registerOrganizationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { memberships: { take: 1 } },
  });

  if (existingUser && isCustomerAccount(existingUser)) {
    return {
      success: false,
      error: CUSTOMER_ON_BUSINESS_ERROR,
    };
  }

  if (existingUser) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }

  const slug = parsed.data.slug || slugify(parsed.data.businessName);
  const slugTaken = await prisma.organization.findUnique({ where: { slug } });
  if (slugTaken) {
    return { success: false, error: "Este endereço (slug) já está em uso." };
  }

  const uniqueSlug = await generateUniqueSlug(slug, async (s) => {
    const found = await prisma.organization.findUnique({ where: { slug: s } });
    return !!found;
  });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const trialEndsAt = computeTrialEndDate();

  const organization = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: parsed.data.businessName,
        slug: uniqueSlug,
        businessType: parsed.data.businessType,
        email: parsed.data.email,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt,
        onboardingStep: 0,
      },
    });

    const user = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
    });

    await tx.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: MemberRole.SUPER_ADMIN,
      },
    });

    return org;
  });

  if (process.env.ASAAS_API_KEY) {
    try {
      const customer = await createAsaasCustomer({
        name: parsed.data.businessName,
        email: parsed.data.email,
        externalReference: organization.id,
      });
      await prisma.organization.update({
        where: { id: organization.id },
        data: { asaasCustomerId: customer.id },
      });
    } catch {
      // Asaas opcional em dev — não bloqueia cadastro
    }
  }

  return { success: true, organizationId: organization.id };
}
