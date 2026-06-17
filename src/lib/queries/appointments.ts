import {
  AppointmentStatus,
  type Appointment,
  type Client,
  type Professional,
  type Service,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orgWhere } from "@/lib/tenant/prisma-scopes";
import { getTodayRange, getDayRange } from "@/lib/utils/date";
import {
  type SerializableService,
  serializeService,
} from "@/lib/queries/services";

export type AppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: SerializableService;
};

type PrismaAppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: Service;
};

export function serializeAppointment(
  appointment: PrismaAppointmentWithRelations,
): AppointmentWithRelations {
  return { ...appointment, service: serializeService(appointment.service) };
}

export async function getAppointments(
  organizationId: string,
  filters?: {
    date?: string;
    professionalId?: string;
    status?: AppointmentStatus;
  },
): Promise<AppointmentWithRelations[]> {
  const where: Prisma.AppointmentWhereInput = {
    ...orgWhere(organizationId),
  };

  if (filters?.date) {
    const { start, end } = getDayRange(filters.date);
    where.startAt = { gte: start, lte: end };
  }

  if (filters?.professionalId) {
    where.professionalId = filters.professionalId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      client: true,
      professional: true,
      service: true,
    },
    orderBy: { startAt: "asc" },
  });

  return appointments.map(serializeAppointment);
}

export async function getTodayAppointments(
  organizationId: string,
): Promise<AppointmentWithRelations[]> {
  const { start, end } = getTodayRange();
  const appointments = await prisma.appointment.findMany({
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

  return appointments.map(serializeAppointment);
}

export async function getUpcomingAppointments(
  organizationId: string,
  limit = 5,
): Promise<AppointmentWithRelations[]> {
  const appointments = await prisma.appointment.findMany({
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

  return appointments.map(serializeAppointment);
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
