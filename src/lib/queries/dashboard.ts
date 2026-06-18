import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { getTodayRange } from "@/lib/utils/date";
import {
  type AppointmentWithRelations,
  serializeAppointment,
} from "./appointments";
import { getActiveProfessionalsCount } from "./professionals";
import { getActiveServicesCount } from "./services";

export type TodayDashboardStats = {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  projectedRevenue: number;
};

export async function getTodayDashboardAppointments(
  organizationId: string,
): Promise<AppointmentWithRelations[]> {
  const { start, end } = getTodayRange();
  const appointments = await prisma.appointment.findMany({
    where: {
      ...orgWhere(organizationId),
      startAt: { gte: start, lte: end },
    },
    include: {
      client: true,
      professional: true,
      service: true,
    },
    orderBy: { startAt: "asc" },
  });

  return appointments.map(serializeAppointment);
}

export function computeTodayDashboardStats(
  appointments: AppointmentWithRelations[],
): TodayDashboardStats {
  const stats: TodayDashboardStats = {
    total: appointments.length,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    projectedRevenue: 0,
  };

  for (const apt of appointments) {
    switch (apt.status) {
      case AppointmentStatus.SCHEDULED:
        stats.scheduled++;
        stats.projectedRevenue += apt.service.price;
        break;
      case AppointmentStatus.CONFIRMED:
        stats.confirmed++;
        stats.projectedRevenue += apt.service.price;
        break;
      case AppointmentStatus.COMPLETED:
        stats.completed++;
        stats.projectedRevenue += apt.service.price;
        break;
      case AppointmentStatus.CANCELLED:
        stats.cancelled++;
        break;
    }
  }

  return stats;
}

export function getNextTodayAppointment(
  appointments: AppointmentWithRelations[],
): AppointmentWithRelations | null {
  const now = new Date();
  return (
    appointments.find(
      (apt) =>
        apt.status !== AppointmentStatus.COMPLETED &&
        apt.status !== AppointmentStatus.CANCELLED &&
        new Date(apt.startAt) >= now,
    ) ?? null
  );
}

export async function getTodayDashboardStats(
  organizationId: string,
): Promise<TodayDashboardStats> {
  const appointments = await getTodayDashboardAppointments(organizationId);
  return computeTodayDashboardStats(appointments);
}

export async function getDashboardData(organizationId: string) {
  const todayAppointments = await getTodayDashboardAppointments(organizationId);
  const todayStats = computeTodayDashboardStats(todayAppointments);
  const nextTodayAppointment = getNextTodayAppointment(todayAppointments);

  const [clientsCount, professionalsCount, servicesCount] = await Promise.all([
    prisma.client.count({ where: orgWhere(organizationId) }),
    getActiveProfessionalsCount(organizationId),
    getActiveServicesCount(organizationId),
  ]);

  return {
    clientsCount,
    professionalsCount,
    servicesCount,
    todayAppointments,
    todayStats,
    nextTodayAppointment,
  };
}
