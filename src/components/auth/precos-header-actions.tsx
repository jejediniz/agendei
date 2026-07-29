"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { AccountType } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function PrecosHeaderActions() {
  const { data: session, status } = useSession();
  const isCustomer =
    status === "authenticated" &&
    session?.user?.accountType === AccountType.CUSTOMER;

  if (status === "loading") {
    return <div className="h-9 w-32" />;
  }

  if (isCustomer) {
    return (
      <div className="flex gap-3">
        <Button variant="ghost" asChild>
          <Link href="/login">Minha conta</Link>
        </Button>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/precos" })}>
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button variant="ghost" asChild>
        <Link href="/login">Entrar</Link>
      </Button>
      <Button asChild>
        <Link href="/cadastro">Começar grátis</Link>
      </Button>
    </div>
  );
}
