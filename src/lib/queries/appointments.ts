import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { getTodayRange } from "@/lib/utils/date";

export async function getAppointments(
  organizationId: string,
  filters?: {
    date?: string;
    professionalId?: string;
    status?: AppointmentStatus;
  },
) {
  const where: Prisma.AppointmentWhereInput = {
    ...orgWhere(organizationId),
  };

  if (filters?.date) {
    const start = new Date(filters.date + "T00:00:00");
    const end = new Date(filters.date + "T23:59:59");
    where.startAt = { gte: start, lte: end };
  }

  if (filters?.professionalId) {
    where.professionalId = filters.professionalId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      client: true,
      professional: true,
      service: true,
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getTodayAppointments(organizationId: string) {
  const { start, end } = getTodayRange();
  return prisma.appointment.findMany({
    where: {
      ...orgWhere(organizationId),
      startAt: { gte: start, lte: end },
      status: { not: AppointmentStatus.CANCELLED },
    },
    include: {
      client: true,
      professional: true,
      service: true,
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getUpcomingAppointments(
  organizationId: string,
  limit = 5,
) {
  return prisma.appointment.findMany({
    where: {
      ...orgWhere(organizationId),
      startAt: { gte: new Date() },
      status: {
        in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
      },
    },
    include: {
      client: true,
      professional: true,
      service: true,
    },
    orderBy: { startAt: "asc" },
    take: limit,
  });
}

export async function getAppointmentStats(organizationId: string) {
  const { start, end } = getTodayRange();

  const [todayCount, confirmedCount, cancelledCount] = await Promise.all([
    prisma.appointment.count({
      where: {
        ...orgWhere(organizationId),
        startAt: { gte: start, lte: end },
        status: { not: AppointmentStatus.CANCELLED },
      },
    }),
    prisma.appointment.count({
      where: {
        ...orgWhere(organizationId),
        status: AppointmentStatus.CONFIRMED,
      },
    }),
    prisma.appointment.count({
      where: {
        ...orgWhere(organizationId),
        status: AppointmentStatus.CANCELLED,
      },
    }),
  ]);

  return { todayCount, confirmedCount, cancelledCount };
}
