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
    <div className="min-h-screen bg-slate-50">
      <PublicBookingHeader slug={slug} organizationName={organizationName} />
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Agendamento powered by{" "}
        <Link href="/" className="text-teal-600 hover:underline">
          Agendei
        </Link>
      </footer>
    </div>
  );
}
