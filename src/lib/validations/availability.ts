import { z } from "zod";
import { DayOfWeek } from "@prisma/client";

export const availabilitySchema = z
  .object({
    professionalId: z.string().min(1, "Selecione um profissional"),
    dayOfWeek: z.nativeEnum(DayOfWeek),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
    active: z.boolean(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Horário inicial deve ser anterior ao final",
    path: ["endTime"],
  });

export type AvailabilityFormData = z.infer<typeof availabilitySchema>;
