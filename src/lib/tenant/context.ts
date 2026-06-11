import { MemberRole, PlatformRole, SubscriptionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";

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

  if (
    !session.user.organizationId ||
    !session.user.organizationSlug ||
    !session.user.role ||
    !session.user.subscriptionStatus
  ) {
    return null;
  }

  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    organizationSlug: session.user.organizationSlug,
    role: session.user.role,
    subscriptionStatus: session.user.subscriptionStatus,
    onboardingCompleted: session.user.onboardingCompleted ?? false,
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
