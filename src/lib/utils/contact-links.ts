import { normalizePhone } from "@/lib/utils/phone";

function toBrazilDigits(phone: string): string | null {
  const digits = normalizePhone(phone);
  if (digits.length < 10) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function isValidContactPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  return toBrazilDigits(phone) !== null;
}

export function buildTelUrl(phone: string): string | null {
  const digits = toBrazilDigits(phone);
  if (!digits) return null;
  return `tel:+${digits}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const digits = toBrazilDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
