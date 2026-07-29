import Link from "next/link";
import { PublicBookingHeader } from "./public-booking-header";

type PublicBookingLayoutProps = {
  slug: string;
  organizationName: string;
  children: React.ReactNode;
};

export function PublicBookingLayout({
  slug,
  organizationName,
  children,
}: PublicBookingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <PublicBookingHeader slug={slug} organizationName={organizationName} />
      <main className="mx-auto max-w-3xl px-4 py-6 pb-safe sm:py-8">{children}</main>
      <footer className="border-t border-border/60 px-4 py-6 pb-safe text-center text-xs text-muted-foreground">
        Agendamento powered by{" "}
        <Link href="/" className="text-primary hover:underline">
          Agendei
        </Link>
      </footer>
    </div>
  );
}
