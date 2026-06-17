"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Algo deu errado
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || "Não foi possível carregar esta página."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" asChild>
          <Link href="/">Ir ao início</Link>
        </Button>
      </div>
    </div>
  );
}
