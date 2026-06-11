import { prisma } from "@/lib/prisma";

export async function getProfessionals(activeOnly = false) {
  return prisma.professional.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getProfessionalById(id: string) {
  return prisma.professional.findUnique({ where: { id } });
}

export async function getActiveProfessionalsCount() {
  return prisma.professional.count({ where: { active: true } });
}
