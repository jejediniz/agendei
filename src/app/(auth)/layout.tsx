import { CalendarHeart, Clock } from "lucide-react";

const previewAppointments = [
  { time: "09:00", client: "Ana Silva", service: "Corte" },
  { time: "10:30", client: "Carlos M.", service: "Barba" },
  { time: "14:00", client: "Mariana L.", service: "Coloração" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="pattern-dots absolute inset-0 opacity-30" />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark opacity-90"
          aria-hidden
        />
        <div className="relative">
          <p className="font-display text-3xl font-semibold leading-tight">
            Agendei
          </p>
          <p className="mt-2 max-w-xs text-sm text-primary-foreground/75">
            Agendamento simples para o seu negócio local
          </p>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            {previewAppointments.map((item, index) => (
              <div
                key={item.time}
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
                style={{ transform: `translateX(${index * 12}px)` }}
              >
                <div className="flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white/15 text-sm font-semibold tabular-nums">
                  {item.time}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.client}</p>
                  <p className="truncate text-sm text-primary-foreground/70">
                    {item.service}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <blockquote className="space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <CalendarHeart className="h-5 w-5" />
            </div>
            <p className="max-w-md font-display text-2xl font-medium leading-snug">
              Organize sua agenda sem complicação. Seus clientes agendam online,
              você foca no que importa.
            </p>
            <footer className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <Clock className="h-4 w-4" />
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
