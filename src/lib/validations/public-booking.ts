import { z } from "zod";

export const publicBookingSchema = z.object({
  slug: z.string().min(1),
  serviceId: z.string().min(1, "Selecione um serviço"),
  professionalId: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  clientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clientPhone: z.string().min(8, "Telefone inválido"),
  clientEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type PublicBookingFormData = z.infer<typeof publicBookingSchema>;

export const publicSlotsSchema = z.object({
  slug: z.string().min(1),
  professionalId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
});
