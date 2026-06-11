import { z } from "zod";
import { BusinessType } from "@prisma/client";

export const registerOrganizationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  businessName: z.string().min(2, "Nome do negócio obrigatório"),
  slug: z
    .string()
    .min(2, "Slug obrigatório")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  businessType: z.nativeEnum(BusinessType),
});

export type RegisterOrganizationData = z.infer<typeof registerOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Nome do negócio obrigatório"),
  businessType: z.nativeEnum(BusinessType),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type UpdateOrganizationData = z.infer<typeof updateOrganizationSchema>;
