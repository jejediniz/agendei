export const RESERVED_SLUGS = new Set([
  "login",
  "cadastro",
  "cadastro-cliente",
  "precos",
  "onboarding",
  "platform",
  "clientes",
  "profissionais",
  "servicos",
  "horarios",
  "agendamentos",
  "agenda",
  "configuracoes",
  "api",
]);

export const CUSTOMER_BOOKING_SUBPATHS = new Set(["meus-agendamentos"]);

export type ParsedBookingPath = {
  slug: string;
  subpath?: string;
};

export function parseBookingPath(pathname: string): ParsedBookingPath | null {
  const match = pathname.match(/^\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) return null;

  const slug = match[1];
  const subpath = match[2];

  if (RESERVED_SLUGS.has(slug)) return null;
  if (subpath && !CUSTOMER_BOOKING_SUBPATHS.has(subpath)) return null;

  return { slug, subpath };
}

export function isPublicBookingPath(pathname: string): boolean {
  return parseBookingPath(pathname) !== null;
}

export function isCustomerAppointmentsPath(pathname: string): boolean {
  const parsed = parseBookingPath(pathname);
  return parsed?.subpath === "meus-agendamentos";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
