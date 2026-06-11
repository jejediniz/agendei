import { prisma } from "@/lib/prisma";
import {
  getAppointmentStats,
  getTodayAppointments,
  getUpcomingAppointments,
} from "./appointments";
import { getActiveProfessionalsCount } from "./professionals";
import { getActiveServicesCount } from "./services";

export async function getDashboardData() {
  const [
    clientsCount,
    professionalsCount,
    servicesCount,
    stats,
    todayAppointments,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.client.count(),
    getActiveProfessionalsCount(),
    getActiveServicesCount(),
    getAppointmentStats(),
    getTodayAppointments(),
    getUpcomingAppointments(8),
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
