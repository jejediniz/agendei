import { CalendarHeart } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="pattern-dots absolute inset-0 opacity-40" />
        <div className="relative">
          <p className="font-display text-3xl font-semibold leading-tight">
            Agendei
          </p>
        </div>
        <div className="relative space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <CalendarHeart className="h-6 w-6" />
          </div>
          <blockquote className="space-y-3">
            <p className="font-display text-2xl font-medium leading-snug">
              Organize sua agenda sem complicação. Seus clientes agendam online,
              você foca no que importa.
            </p>
            <footer className="text-sm text-primary-foreground/70">
              Para salões, clínicas, consultorias e muito mais.
            </footer>
          </blockquote>
        </div>
        <p className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Agendei
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
}
