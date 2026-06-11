import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";

export async function getProfessionals(organizationId: string, activeOnly = false) {
  return prisma.professional.findMany({
    where: {
      ...orgWhere(organizationId),
      ...(activeOnly ? { active: true } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getProfessionalById(organizationId: string, id: string) {
  return prisma.professional.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });
}

export async function getActiveProfessionalsCount(organizationId: string) {
  return prisma.professional.count({
    where: { ...orgWhere(organizationId), active: true },
  });
}
