import type { Service } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";

export type SerializableService = Omit<Service, "price"> & { price: number };

function serializeService(service: Service): SerializableService {
  return { ...service, price: Number(service.price) };
}

export async function getServices(
  organizationId: string,
  activeOnly = false,
): Promise<SerializableService[]> {
  const services = await prisma.service.findMany({
    where: {
      ...orgWhere(organizationId),
      ...(activeOnly ? { active: true } : {}),
    },
    orderBy: { name: "asc" },
  });

  return services.map(serializeService);
}

export async function getServiceById(
  organizationId: string,
  id: string,
): Promise<SerializableService | null> {
  const service = await prisma.service.findFirst({
    where: { id, ...orgWhere(organizationId) },
  });

  return service ? serializeService(service) : null;
}

export async function getActiveServicesCount(organizationId: string) {
  return prisma.service.count({
    where: { ...orgWhere(organizationId), active: true },
  });
}
