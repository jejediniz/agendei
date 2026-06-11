import { prisma } from "@/lib/prisma";

export async function getServices(activeOnly = false) {
  return prisma.service.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export async function getActiveServicesCount() {
  return prisma.service.count({ where: { active: true } });
}
