"use server";

import { format } from "date-fns";
import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/tenant/context";
import {
  cancelAsaasSubscription,
  createAsaasSubscription,
  getSubscriptionPrice,
} from "@/lib/billing/asaas";
import type { ActionResult } from "./clients";

export async function startSubscription(): Promise<
  ActionResult & { paymentUrl?: string }
> {
  const { organizationId } = await requireSuperAdmin();

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!org) {
    return { success: false, error: "Organização não encontrada." };
  }

  if (!org.asaasCustomerId) {
    return {
      success: false,
      error: "Cliente de pagamento não configurado. Entre em contato com o suporte.",
    };
  }

  if (!process.env.ASAAS_API_KEY) {
    return {
      success: false,
      error: "Pagamentos não configurados no ambiente atual.",
    };
  }

  try {
    const nextDueDate = format(new Date(), "yyyy-MM-dd");
    const subscription = await createAsaasSubscription({
      customerId: org.asaasCustomerId,
      value: getSubscriptionPrice(),
      nextDueDate,
      externalReference: org.id,
    });

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        asaasSubscriptionId: subscription.id,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });

    return {
      success: true,
      paymentUrl: subscription.invoiceUrl,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao criar assinatura.",
    };
  }
}

export async function cancelSubscription(): Promise<ActionResult> {
  const { organizationId } = await requireSuperAdmin();

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!org?.asaasSubscriptionId) {
    return { success: false, error: "Nenhuma assinatura ativa." };
  }

  if (process.env.ASAAS_API_KEY) {
    try {
      await cancelAsaasSubscription(org.asaasSubscriptionId);
    } catch {
      // continua cancelamento local
    }
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      subscriptionStatus: SubscriptionStatus.CANCELLED,
      asaasSubscriptionId: null,
    },
  });

  return { success: true };
}
