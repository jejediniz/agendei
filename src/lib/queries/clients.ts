import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";

export async function getClients(organizationId: string, search?: string) {
  const where = search
    ? {
        ...orgWhere(organizationId),
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : orgWhere(organizationId);

  return prisma.client.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getClientById(organizationId: string, id: string) {
  return prisma.client.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });
}
