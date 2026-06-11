export const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/clientes": "Clientes",
  "/clientes/novo": "Novo cliente",
  "/profissionais": "Profissionais",
  "/profissionais/novo": "Novo profissional",
  "/servicos": "Serviços",
  "/servicos/novo": "Novo serviço",
  "/horarios": "Horários disponíveis",
  "/agendamentos": "Agendamentos",
  "/agendamentos/novo": "Novo agendamento",
  "/agenda": "Agenda do dia",
};

export function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.includes("/editar")) {
    if (pathname.startsWith("/clientes")) return "Editar cliente";
    if (pathname.startsWith("/profissionais")) return "Editar profissional";
    if (pathname.startsWith("/servicos")) return "Editar serviço";
  }
  return "Agendei";
}
