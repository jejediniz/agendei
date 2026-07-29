export const PAGE_TITLES: Record<string, string> = {
  "/": "Visão geral",
  "/clientes": "Clientes",
  "/clientes/novo": "Novo cliente",
  "/profissionais": "Profissionais",
  "/profissionais/novo": "Novo profissional",
  "/servicos": "Serviços",
  "/servicos/novo": "Novo serviço",
  "/horarios": "Horários de atendimento",
  "/agendamentos": "Agenda",
  "/agendamentos/novo": "Novo agendamento",
  "/agenda": "Agenda",
  "/relatorios": "Relatórios",
  "/configuracoes/negocio": "Configurações",
  "/configuracoes/plano": "Plano e assinatura",
  "/onboarding": "Configuração inicial",
  "/cadastro": "Criar conta",
  "/precos": "Preços",
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
