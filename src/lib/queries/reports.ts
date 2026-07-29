import { subDays } from "date-fns";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { getActiveProfessionalsCount } from "./professionals";
import { getActiveServicesCount } from "./services";

export type ReportsData = {
  periodDays: number;
  totalAppointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number;
  revenueRealized: number;
  revenueProjected: number;
  topServices: Array<{ name: string; count: number }>;
  clientsCount: number;
  professionalsCount: number;
  servicesCount: number;
};

const PERIOD_DAYS = 30;

/**
 * Indicadores reais dos últimos {@link PERIOD_DAYS} dias. Sem dados
 * simulados: tudo derivado dos agendamentos da organização.
 */
export async function getReportsData(
  organizationId: string,
): Promise<ReportsData> {
  const now = new Date();
  const start = subDays(now, PERIOD_DAYS);

  const [appointments, clientsCount, professionalsCount, servicesCount] =
    await Promise.all([
      prisma.appointment.findMany({
        where: {
          ...orgWhere(organizationId),
          startAt: { gte: start, lte: now },
        },
        include: { service: true },
      }),
      prisma.client.count({ where: orgWhere(organizationId) }),
      getActiveProfessionalsCount(organizationId),
      getActiveServicesCount(organizationId),
    ]);

  let completed = 0;
  let cancelled = 0;
  let noShow = 0;
  let upcoming = 0;
  let revenueRealized = 0;
  let revenueProjected = 0;
  const serviceCounts = new Map<string, { name: string; count: number }>();

  for (const apt of appointments) {
    const price = Number(apt.service.price);

    switch (apt.status) {
      case AppointmentStatus.COMPLETED:
        completed++;
        revenueRealized += price;
        revenueProjected += price;
        break;
      case AppointmentStatus.SCHEDULED:
      case AppointmentStatus.CONFIRMED:
      case AppointmentStatus.IN_PROGRESS:
        upcoming++;
        revenueProjected += price;
        break;
      case AppointmentStatus.CANCELLED:
        cancelled++;
        break;
      case AppointmentStatus.NO_SHOW:
        noShow++;
        break;
    }

    if (
      apt.status !== AppointmentStatus.CANCELLED &&
      apt.status !== AppointmentStatus.NO_SHOW
    ) {
      const entry = serviceCounts.get(apt.serviceId) ?? {
        name: apt.service.name,
        count: 0,
      };
      entry.count++;
      serviceCounts.set(apt.serviceId, entry);
    }
  }

  const topServices = [...serviceCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    periodDays: PERIOD_DAYS,
    totalAppointments: appointments.length,
    completed,
    cancelled,
    noShow,
    upcoming,
    revenueRealized,
    revenueProjected,
    topServices,
    clientsCount,
    professionalsCount,
    servicesCount,
  };
}
