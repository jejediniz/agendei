import { prisma } from "@/lib/prisma";

export async function getAvailabilitiesByProfessional(professionalId?: string) {
  return prisma.availability.findMany({
    where: professionalId ? { professionalId } : undefined,
    include: { professional: true },
    orderBy: [{ professional: { name: "asc" } }, { dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}
