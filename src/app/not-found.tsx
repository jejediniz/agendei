import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
