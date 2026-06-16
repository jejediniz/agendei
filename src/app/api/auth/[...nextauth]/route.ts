import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

// next-auth pode precisar de runtime Node (Prisma, bcrypt, etc.).
// Mantemos aqui para evitar erros em runtime Edge.
export const runtime = "nodejs";
