import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(8, "Telefone inválido"),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  document: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const quickClientSchema = clientSchema.pick({
  name: true,
  phone: true,
});

export type QuickClientFormData = z.infer<typeof quickClientSchema>;
