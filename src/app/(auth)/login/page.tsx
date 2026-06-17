import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { AccountType } from "@prisma/client";
import { LoginForm } from "@/components/auth/login-form";
import { getCustomerOrganizations } from "@/lib/queries/customer-organizations";
import { Skeleton } from "@/components/ui/skeleton";

export default async function LoginPage() {
  const session = await auth();
  const customerOrganizations =
    session?.user?.accountType === AccountType.CUSTOMER && session.user.id
      ? await getCustomerOrganizations(session.user.id)
      : [];

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <LoginForm customerOrganizations={customerOrganizations} />
    </Suspense>
  );
}
