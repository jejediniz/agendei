import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";

export const appointmentSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  professionalId: z.string().min(1, "Selecione um profissional"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const appointmentStatusSchema = z.nativeEnum(AppointmentStatus);
