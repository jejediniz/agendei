import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  durationMin: z
    .number()
    .min(5, "Duração mínima de 5 minutos")
    .max(480, "Duração máxima de 8 horas"),
  price: z.number().min(0, "Preço não pode ser negativo"),
  active: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
