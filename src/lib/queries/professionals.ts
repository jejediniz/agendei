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

/** Mapa profissionalId → serviceIds que ele realiza. */
export async function getProfessionalServiceMap(
  organizationId: string,
): Promise<Record<string, string[]>> {
  const links = await prisma.professionalService.findMany({
    where: { professional: orgWhere(organizationId) },
    select: { professionalId: true, serviceId: true },
  });

  const map: Record<string, string[]> = {};
  for (const link of links) {
    (map[link.professionalId] ??= []).push(link.serviceId);
  }
  return map;
}

/** IDs dos serviços que um profissional realiza. */
export async function getProfessionalServiceIds(
  organizationId: string,
  professionalId: string,
): Promise<string[]> {
  const links = await prisma.professionalService.findMany({
    where: { professionalId, professional: orgWhere(organizationId) },
    select: { serviceId: true },
  });
  return links.map((link) => link.serviceId);
}

/**
 * Regra retrocompatível: um profissional sem vínculos realiza todos os
 * serviços; com vínculos, realiza apenas os selecionados.
 */
export function professionalOffersService(
  serviceIds: string[] | undefined,
  serviceId: string,
): boolean {
  if (!serviceIds || serviceIds.length === 0) return true;
  return serviceIds.includes(serviceId);
}
