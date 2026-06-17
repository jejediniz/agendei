import { NextRequest, NextResponse } from "next/server";
import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.ASAAS_WEBHOOK_TOKEN
  ) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const token = request.headers.get("asaas-access-token");
  if (
    process.env.ASAAS_WEBHOOK_TOKEN &&
    token !== process.env.ASAAS_WEBHOOK_TOKEN
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const event = body.event as string;
  const payment = body.payment;
  const subscription = body.subscription;

  const externalRef =
    payment?.externalReference ||
    subscription?.externalReference ||
    body?.externalReference;

  if (!externalRef) {
    return NextResponse.json({ received: true });
  }

  const org = await prisma.organization.findUnique({
    where: { id: externalRef },
  });

  if (!org) {
    return NextResponse.json({ received: true });
  }

  let newStatus: SubscriptionStatus | null = null;

  switch (event) {
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED":
      newStatus = SubscriptionStatus.ACTIVE;
      break;
    case "PAYMENT_OVERDUE":
      newStatus = SubscriptionStatus.PAST_DUE;
      break;
    case "SUBSCRIPTION_DELETED":
    case "SUBSCRIPTION_INACTIVATED":
      newStatus = SubscriptionStatus.CANCELLED;
      break;
  }

  if (newStatus) {
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        subscriptionStatus: newStatus,
        ...(subscription?.id ? { asaasSubscriptionId: subscription.id } : {}),
      },
    });
  }

  return NextResponse.json({ received: true });
}
