export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const slug = slugify(base) || "negocio";
  let suffix = 0;

  while (await exists(suffix === 0 ? slug : `${slug}-${suffix}`)) {
    suffix += 1;
  }

  return suffix === 0 ? slug : `${slug}-${suffix}`;
}
