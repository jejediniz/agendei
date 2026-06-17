export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // BR: compare last 11 digits (DDD + number)
  const tail = (n: string) => (n.length > 11 ? n.slice(-11) : n);
  return tail(na) === tail(nb);
}
