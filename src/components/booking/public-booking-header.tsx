"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { AccountType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

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
    <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/${slug}`}
            className="font-display text-lg font-semibold text-primary"
          >
            {organizationName}
          </Link>
          <p className="text-xs text-muted-foreground">Agendamento online</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {isCustomer ? (
            <>
              <Button variant="ghost" size="sm" className="w-full sm:w-auto" asChild>
                <Link href={`/${slug}/meus-agendamentos`}>Meus agendamentos</Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => signOut()}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="w-full sm:w-auto" asChild>
                <Link
                  href={`/login?area=cliente&callbackUrl=${encodeURIComponent(`/${slug}/meus-agendamentos`)}`}
                >
                  Entrar
                </Link>
              </Button>
              <GoogleSignInButton
                intent="customer"
                callbackUrl={`/${slug}/meus-agendamentos`}
                label="Google"
                size="sm"
                className="w-full sm:w-auto"
              />
            </>
          )}
          <Link
            href="/precos"
            className="px-2 py-2 text-center text-sm text-muted-foreground hover:text-foreground sm:py-0"
          >
            Agendei
          </Link>
        </div>
      </div>
    </header>
  );
}
