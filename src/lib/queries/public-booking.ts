import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";

const BOOKING_ALLOWED_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.TRIAL,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
];

export function isBookingOpen(status: SubscriptionStatus): boolean {
  return BOOKING_ALLOWED_STATUSES.includes(status);
}

export async function getOrganizationBySlug(slug: string) {
  if (isReservedSlug(slug)) return null;

  return prisma.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      email: true,
      logoUrl: true,
      businessType: true,
      subscriptionStatus: true,
    },
  });
}

export type PublicOrganization = NonNullable<
  Awaited<ReturnType<typeof getOrganizationBySlug>>
>;
