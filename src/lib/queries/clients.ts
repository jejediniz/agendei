import { prisma } from "@/lib/prisma";

export async function getClients(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  return prisma.client.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}
