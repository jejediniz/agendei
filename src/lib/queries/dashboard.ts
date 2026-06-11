import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import {
  getAppointmentStats,
  getTodayAppointments,
  getUpcomingAppointments,
} from "./appointments";
import { getActiveProfessionalsCount } from "./professionals";
import { getActiveServicesCount } from "./services";

export async function getDashboardData(organizationId: string) {
  const [
    clientsCount,
    professionalsCount,
    servicesCount,
    stats,
    todayAppointments,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.client.count({ where: orgWhere(organizationId) }),
    getActiveProfessionalsCount(organizationId),
    getActiveServicesCount(organizationId),
    getAppointmentStats(organizationId),
    getTodayAppointments(organizationId),
    getUpcomingAppointments(organizationId, 8),
  ]);

  return {
    clientsCount,
    professionalsCount,
    servicesCount,
    stats,
    todayAppointments,
    upcomingAppointments,
  };
}
