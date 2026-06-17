import { AccountType, type User } from "@prisma/client";

type UserWithMemberships = Pick<User, "accountType"> & {
  memberships?: { id: string }[];
};

export function isBusinessAccount(user: UserWithMemberships): boolean {
  return (
    user.accountType === AccountType.BUSINESS ||
    (user.memberships?.length ?? 0) > 0
  );
}

export function isCustomerAccount(user: Pick<User, "accountType">): boolean {
  return user.accountType === AccountType.CUSTOMER;
}

export const BUSINESS_ON_CUSTOMER_ERROR =
  "Este e-mail pertence a uma conta de negócio. Use a aba Tenho um negócio.";

export const CUSTOMER_ON_BUSINESS_ERROR =
  "Este e-mail pertence a uma conta de cliente. Use a aba Sou cliente.";
