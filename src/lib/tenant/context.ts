import { MemberRole, PlatformRole, SubscriptionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SessionContext = {
  userId: string;
  organizationId: string;
  organizationSlug: string;
  role: MemberRole;
  subscriptionStatus: SubscriptionStatus;
  onboardingCompleted: boolean;
  isPlatformAdmin: boolean;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  if (session.user.platformRole === PlatformRole.PLATFORM_ADMIN) {
    return null;
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });

  if (!membership) {
    return null;
  }

  const { organization } = membership;

  return {
    userId: session.user.id,
    organizationId: membership.organizationId,
    organizationSlug: organization.slug,
    role: membership.role,
    subscriptionStatus: organization.subscriptionStatus,
    onboardingCompleted: !!organization.onboardingCompletedAt,
    isPlatformAdmin: false,
  };
}

export async function requireSessionContext(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) {
    throw new Error("Organização não encontrada na sessão.");
  }
  return ctx;
}

export async function requireSuperAdmin(): Promise<SessionContext> {
  const ctx = await requireSessionContext();
  if (ctx.role !== MemberRole.SUPER_ADMIN) {
    throw new Error("Acesso restrito ao Super Admin.");
  }
  return ctx;
}

export async function requirePlatformAdmin(): Promise<{ userId: string }> {
  const session = await auth();
  if (
    !session?.user?.id ||
    session.user.platformRole !== PlatformRole.PLATFORM_ADMIN
  ) {
    throw new Error("Acesso restrito ao administrador da plataforma.");
  }
  return { userId: session.user.id };
}

export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return (
    status === SubscriptionStatus.TRIAL ||
    status === SubscriptionStatus.ACTIVE ||
    status === SubscriptionStatus.PAST_DUE
  );
}
