import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";

export async function getCustomerOrganizations(userId: string) {
  const clients = await prisma.client.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { updatedAt: "desc" },
  });

  const seen = new Set<string>();
  return clients
    .filter((c) => {
      if (seen.has(c.organizationId)) return false;
      seen.add(c.organizationId);
      return true;
    })
    .map((c) => c.organization);
}
