"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { AccountType } from "@prisma/client";
import { Button } from "@/components/ui/button";

type PublicBookingHeaderProps = {
  slug: string;
  organizationName: string;
};

export function PublicBookingHeader({
  slug,
  organizationName,
}: PublicBookingHeaderProps) {
  const { data: session, status } = useSession();
  const isCustomer =
    session?.user?.accountType === AccountType.CUSTOMER && status === "authenticated";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={`/${slug}`} className="text-lg font-bold text-teal-600">
            {organizationName}
          </Link>
          <p className="text-xs text-slate-500">Agendamento online</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isCustomer ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${slug}/meus-agendamentos`}>Meus agendamentos</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                signIn("google", { callbackUrl: `/${slug}/meus-agendamentos` })
              }
            >
              Entrar com Google
            </Button>
          )}
          <Link
            href="/"
            className="px-2 text-sm text-slate-500 hover:text-slate-700"
          >
            Agendei
          </Link>
        </div>
      </div>
    </header>
  );
}
