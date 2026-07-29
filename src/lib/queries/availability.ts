import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";

export async function getAvailabilitiesByProfessional(
  organizationId: string,
  professionalId?: string,
) {
  return prisma.availability.findMany({
    where: {
      professional: {
        ...orgWhere(organizationId),
        ...(professionalId ? { id: professionalId } : {}),
      },
    },
    include: { professional: true },
    orderBy: [
      { professional: { name: "asc" } },
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  });
}
