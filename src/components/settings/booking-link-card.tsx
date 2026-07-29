"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BookingLinkCardProps = {
  slug: string;
};

export function BookingLinkCard({ slug }: BookingLinkCardProps) {
  const path = `/${slug}`;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const fullUrl = `${baseUrl}${path}`;
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Link de agendamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Compartilhe este link para seus clientes agendarem online:
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={path}
            target="_blank"
            rel="noopener noreferrer"
            className="block flex-1 break-all rounded-lg bg-primary-light px-3 py-2 text-sm font-medium text-primary-dark hover:opacity-90"
          >
            {fullUrl}
          </a>
          <Button type="button" variant="outline" onClick={copyLink}>
            {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
