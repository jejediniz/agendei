import { SubscriptionStatus } from "@prisma/client";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getTrialDays } from "./asaas";

export async function expireTrials() {
  const now = new Date();
  await prisma.organization.updateMany({
    where: {
      subscriptionStatus: SubscriptionStatus.TRIAL,
      trialEndsAt: { lt: now },
    },
    data: { subscriptionStatus: SubscriptionStatus.EXPIRED },
  });
}

export function computeTrialEndDate(): Date {
  return addDays(new Date(), getTrialDays());
}

export function getTrialDaysRemaining(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;
  const diff = trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
