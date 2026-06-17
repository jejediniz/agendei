import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/utils/phone";

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

export async function linkClientsToCustomerByPhone(
  userId: string,
  phone: string,
): Promise<void> {
  const digits = normalizePhone(phone);
  if (digits.length < 8) return;

  const unlinked = await prisma.client.findMany({
    where: { userId: null },
    select: { id: true, phone: true },
  });

  const ids = unlinked
    .filter((c) => normalizePhone(c.phone) === digits)
    .map((c) => c.id);

  if (ids.length === 0) return;

  await prisma.client.updateMany({
    where: { id: { in: ids } },
    data: { userId },
  });
}

export async function linkGuestClientsToCustomer(
  userId: string,
  { email, phone }: { email?: string | null; phone?: string | null },
): Promise<void> {
  if (email) {
    await linkClientsToCustomerByEmail(userId, email);
  }
  if (phone) {
    await linkClientsToCustomerByPhone(userId, phone);
  }
}
