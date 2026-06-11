import { z } from "zod";

export const professionalSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional(),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  specialty: z.string().optional(),
  active: z.boolean(),
});

export type ProfessionalFormData = z.infer<typeof professionalSchema>;
