import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerCustomerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type RegisterCustomerData = z.infer<typeof registerCustomerSchema>;
