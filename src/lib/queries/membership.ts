import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getPrimaryMembership(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  });
}

export async function getPrimaryMembershipForSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getPrimaryMembership(session.user.id);
}
