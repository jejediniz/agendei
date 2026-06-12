import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type AppointmentWithRelations,
  serializeAppointment,
} from "@/lib/queries/appointments";

const UPCOMING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.CONFIRMED,
];

export async function getCustomerAppointments(
  organizationId: string,
  userId: string,
): Promise<AppointmentWithRelations[]> {
  const appointments = await prisma.appointment.findMany({
    where: {
      organizationId,
      client: { userId },
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

export async function getCustomerAppointmentById(
  organizationId: string,
  userId: string,
  appointmentId: string,
) {
  return prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      organizationId,
      client: { userId },
    },
  });
}

export function isCancellableStatus(status: AppointmentStatus): boolean {
  return UPCOMING_STATUSES.includes(status);
}
