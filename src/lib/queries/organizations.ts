import { prisma } from "@/lib/prisma";

export async function getOrganizationById(id: string) {
  return prisma.organization.findUnique({ where: { id } });
}

export async function getAllOrganizations() {
  return prisma.organization.findMany({
    include: {
      members: {
        include: { user: true },
        where: { role: "SUPER_ADMIN" },
      },
      _count: {
        select: {
          clients: true,
          professionals: true,
          appointments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
