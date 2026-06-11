import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";

export async function getServices(organizationId: string, activeOnly = false) {
  return prisma.service.findMany({
    where: {
      ...orgWhere(organizationId),
      ...(activeOnly ? { active: true } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getServiceById(organizationId: string, id: string) {
  return prisma.service.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });
}

export async function getActiveServicesCount(organizationId: string) {
  return prisma.service.count({
    where: { ...orgWhere(organizationId), active: true },
  });
}
