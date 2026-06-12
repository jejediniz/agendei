import { prisma } from "@/lib/prisma";

export async function linkClientsToCustomerByEmail(
  userId: string,
  email: string,
): Promise<void> {
  await prisma.client.updateMany({
    where: {
      email: { equals: email, mode: "insensitive" },
      userId: null,
    },
    data: { userId },
  });
}
