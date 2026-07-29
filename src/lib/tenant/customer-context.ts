import { AccountType } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function requireCustomerSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.accountType !== AccountType.CUSTOMER) {
    throw new Error("NOT_CUSTOMER");
  }

  return {
    userId: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
}

export async function getCustomerSession() {
  const session = await auth();

  if (!session?.user?.id || session.user.accountType !== AccountType.CUSTOMER) {
    return null;
  }

  return {
    userId: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image,
  };
}
