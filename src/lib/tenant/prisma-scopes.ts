export function orgWhere(organizationId: string) {
  return { organizationId };
}

export function withOrg<T extends Record<string, unknown>>(
  organizationId: string,
  data: T,
) {
  return { ...data, organizationId };
}
